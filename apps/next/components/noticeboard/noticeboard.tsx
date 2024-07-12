"use client"

import React, { useCallback, useEffect } from "react"
import { CrossCircledIcon } from "@radix-ui/react-icons"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { cn } from "@/lib/utils"

import { createClient } from "@/modules/utils/client"
import { getNoticeItems } from "@/modules/noticeboard"

import NoticeItem from "./noticeitem"

const useRealtimeNotices = () => {
  const noticesKey = "noticeList"
  const queryClient = useQueryClient()
  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [noticesKey] })
  }, [])
  const items = useQuery({
    queryKey: [noticesKey],
    queryFn: () => getNoticeItems(),
  })

  useEffect(() => {
    const supabase = createClient()
    supabase
      .channel("notices-items-updated")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "noticeboard_items" },
        invalidate
      )
      .subscribe()
    supabase
      .channel("notices-interactions-updated")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "noticeboard_interactions" },
        invalidate
      )
      .subscribe()
  }, [])

  return items
}

const NoticeBoard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className }, ref) => {
  const items = useRealtimeNotices()

  if (items.isLoading || !items.data) {
    return null
  }

  if (items.data && "error" in items.data) {
    return (
      <div className="flex flex-col items-center justify-center">
        <CrossCircledIcon className="size-4" />
        <h1>Something went wrong!</h1>
        <span>{items.data.error.message}</span>
      </div>
    )
  }

  return (
    <div ref={ref} className={cn("flex flex-col", className)}>
      {items.data.map((item) => (
        <NoticeItem key={item.id} {...item} />
      ))}
    </div>
  )
})

NoticeBoard.displayName = "NoticeBoard"

export default NoticeBoard
