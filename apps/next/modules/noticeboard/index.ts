"use server"

import { z } from "zod"

// import { Database } from "@/modules/types"
import { createClient } from "@/modules/utils/server"

// type NoticeBoardItem = Database["public"]["Tables"]["noticeboard_items"]["Row"]

type ServerError = {
  error: { message: string }
}

const LEVELS = ["info", "warning", "error"] as const

const noticeItemSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .nullable()
    .transform((val) => val ?? undefined),
  message: z.string(),
  level: z.enum(LEVELS),
  closable: z.boolean(),
  visible: z.boolean(),
})
const newNoticeItemSchema = noticeItemSchema.omit({ id: true })

const noticeListSchema = z.array(noticeItemSchema)

const noticeItemWithStatsSchema = noticeItemSchema.extend({
  noticeboard_interactions: z.array(
    z.object({
      user_id: z.string(),
      closed_at: z.string().nullable(), // .transform(timestamp => timestamp && new Date(timestamp)),
      viewed_at: z.string().nullable(), //.transform(timestamp => timestamp && new Date(timestamp)),
    })
  ),
})
const noticeboardListWithStatsSchema = z.array(noticeItemWithStatsSchema)

// get notices for admin
export async function getAllNoticeItems(): Promise<
  z.infer<typeof noticeListSchema> | ServerError
> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("noticeboard_items")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) return { error: { message: error.message } }
  return noticeListSchema.parse(data)
}

// get notices for consumer user
export async function getNoticeItems(): Promise<
  z.infer<typeof noticeListSchema> | ServerError
> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: { message: "No user authorized" },
    }
  }

  const { data: closedByUser, error: closedByUserError } = await supabase
    .from("noticeboard_interactions")
    .select("item_id")
    .eq("user_id", user.id)
    .not("closed_at", "is", null)

  if (!closedByUser) {
    return {
      error: {
        message: `Failed to fetch closed notices\n${closedByUserError.message}`,
      },
    }
  }

  const closedItemIds = closedByUser.map(({ item_id }) => item_id as string)

  const { data, error } = await supabase
    .from("noticeboard_items")
    .select("*")
    .is("visible", true)
    .not("id", "in", `(${closedItemIds.join(",")})`)

  if (error) return { error: { message: error.message } }

  void (async () => {
    // run asynchronously
    const { data: viewedByUser } = await supabase
      .from("noticeboard_interactions")
      .select("item_id")
      .eq("user_id", user.id)
      .not("viewed_at", "is", null)

    await Promise.all(
      data.map(async (row) => {
        if (!viewedByUser?.find(({ item_id }) => item_id == row.id)) {
          await setViewed(row.id)
        }
      })
    )
  })()

  return noticeListSchema.parse(data)
}

export async function getAllNoticesWithStats() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("noticeboard_items")
    .select(
      `
    *,
    noticeboard_interactions (
      user_id,
      closed_at,
      viewed_at
    )
  `
    )
    .order("created_at", { ascending: false })

  if (error) throw error
  return noticeboardListWithStatsSchema.parse(data)
}

export async function createNoticeboardItem({
  title,
  message,
  level,
  closable,
}: z.infer<typeof newNoticeItemSchema>): Promise<ServerError | void> {
  const supabase = createClient()
  const { error } = await supabase.from("noticeboard_items").insert({
    title,
    message,
    level,
    closable,
  })
  if (error) return { error: { message: error.message } }
}

export async function updateNoticeboardItem({
  id,
  title,
  message,
  level,
}: z.infer<typeof noticeItemSchema>): Promise<ServerError | void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("noticeboard_items")
    .update({
      title,
      message,
      level,
    })
    .eq("id", id)
  if (error) return { error: { message: error.message } }
}

export async function deleteNoticeItem(
  id: string
): Promise<ServerError | void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("noticeboard_items")
    .delete()
    .eq("id", id)
  if (error) return { error: { message: error.message } }
}

export async function setNoticeVisibility(
  id: string,
  visible: boolean
): Promise<ServerError | void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("noticeboard_items")
    .update({
      visible,
    })
    .eq("id", id)
  if (error) return { error: { message: error.message } }
}

export async function setViewed(id: string): Promise<ServerError | void> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: { message: "No user authorized" },
    }
  }
  const { error } = await supabase
    .from("noticeboard_interactions")
    .upsert({
      item_id: id,
      user_id: user.id,
      viewed_at: new Date().toISOString(),
    })
    .is("viewed_at", null)
  if (error) {
    return { error: { message: error.message } }
  }
}

export async function setClosed(id: string): Promise<ServerError | void> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: { message: "No user authorized" },
    }
  }
  const { error } = await supabase.from("noticeboard_interactions").upsert({
    item_id: id,
    user_id: user.id,
    closed_at: new Date().toISOString(),
  })
  if (error) {
    return { error: { message: error.message } }
  }
}
