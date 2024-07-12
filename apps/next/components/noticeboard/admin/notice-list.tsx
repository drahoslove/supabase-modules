/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useCallback, useEffect } from "react"
import {
  InfoCircledIcon,
} from "@radix-ui/react-icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CircleIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  deleteNoticeItem,
  getAllNoticesWithStats,
  setNoticeVisibility,
} from "@/modules/noticeboard"
import { createClient } from "@/modules/utils/client"


const noticeAdminKey = "noticeAdminList"
const useRealtimeAdminNotices = () => {
  const notices = useQuery({
    queryKey: [noticeAdminKey],
    queryFn: () => getAllNoticesWithStats(),
  })
  const queryClient = useQueryClient()
  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [noticeAdminKey] })
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .channel("notices-interactions-updated-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "noticeboard_interactions" },
        invalidate
      )
      .subscribe()
  }, [])
  return notices
}

export const NoticesList: React.FC = () => {
  const notices = useRealtimeAdminNotices()

  if (notices.isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="animate-pulse">
          <CircleIcon className="inline size-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (notices.data && "error" in notices.data) {
    return null
    // return (
    //   <div className="flex flex-col items-center justify-center">
    //     <Alert variant="destructive">
    //       <AlertTitle>Something went wrong!</AlertTitle>
    //       <AlertDescription>{notices.data.error.message}</AlertDescription>
    //     </Alert>
    //   </div>
    // )
  }

  if (!notices.data) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Alert>
          <InfoCircledIcon className="size-4" />
          <AlertTitle>No data found!</AlertTitle>
          <AlertDescription>
            Please contact the administrator for more information.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {notices.data.map(
        ({ id, level, message, title, visible, closable, noticeboard_interactions }) => (
          <Card className="$ flex flex-row overflow-hidden p-4" key={id}>
            <div
              className={cn(
                "flex w-full flex-col gap-2",
                visible ? "" : "opacity-50"
              )}
            >
              <CardHeader className="flex flex-col items-left p-0">
                <CardDescription className="flex text-md font-bold">
                  {
                    !closable && (
                      <LockIcon className="mr-3" />
                    )
                  }
                  <span className={cn({ 'text-yellow-300': level === 'warning', 'text-red-300': level === 'error' })}>
                    {level}
                  </span>
                </CardDescription>
                <CardTitle className="mt-0 line-clamp-1 text-xl">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="grow space-y-4 p-0">
                {message}
              </CardContent>
            </div>
            <CardFooter className="mt-auto flex flex-col items-start gap-y-2">
              <div className="flex flex-row">
              <NoticeStats stats={noticeboard_interactions} closable={closable} />
              </div>
              <div className="flex flex-row">
                <NoticeToggleVisibility noticeId={id} visible={visible} />
                <NoticeDelete noticeId={id} />
              </div>
            </CardFooter>
          </Card>
        )
      )}
    </div>
  )
}

type InteractionType = {
  user_id: string
  closed_at: string | null
  viewed_at: string | null
}

const NoticeStats: React.FC<{
  stats: Array<InteractionType>
  closable: boolean
}> = ({ stats, closable }) => {
  const countViewed = stats.filter(
    (item: InteractionType) => item.viewed_at
  ).length
  const countClosed = stats.filter(
    (item: InteractionType) => item.closed_at
  ).length

  return (
  <div>
    <p>
      viewed: {countViewed}
    </p>
    {
      closable && (
        <p>
          closed: {countClosed}
        </p>
      )
    }
  </div>
  )
}

const NoticeDelete: React.FC<{ noticeId: string }> = ({ noticeId }) => {
  const queryClient = useQueryClient()
  const { isPending, mutate } = useMutation({
    mutationFn: deleteNoticeItem,
    onSuccess: async (data) => {
      if (data && "error" in data) {
        return toast.error(data.error.message)
      }
      await queryClient.invalidateQueries({ queryKey: [noticeAdminKey] })
    },
  })

  return (
    <Button
      onClick={() => mutate(noticeId)}
      variant={"ghost"}
      size={"sm"}
      className="-ml-3 block"
      title="delete"
    >
      {isPending ? (
        <Loader2Icon className="mr-1.5 inline animate-spin" />
      ) : (
        <Trash2Icon className="mr-1.5 inline" />
      )}
    </Button>
  )
}

const NoticeToggleVisibility: React.FC<{
  noticeId: string
  visible: boolean
}> = ({ noticeId, visible }) => {
  const queryClient = useQueryClient()
  const { isPending, mutate } = useMutation({
    mutationFn: (id: string) => setNoticeVisibility(id, !visible),
    onSuccess: async (data) => {
      if (data && "error" in data) {
        return toast.error(data.error.message)
      }
      await queryClient.invalidateQueries({ queryKey: [noticeAdminKey] })
    },
  })

  return (
    <Button
      onClick={() => mutate(noticeId)}
      variant={"ghost"}
      size={"sm"}
      className="-ml-3 block"
    >
      {isPending ? (
        <Loader2Icon className="mr-1.5 inline animate-spin" />
      ) : visible ? (
        <EyeIcon className="mr-1.5 inline" />
      ) : (
        <EyeOffIcon className="mr-1.5 inline" />
      )}
    </Button>
  )
}
