import { cn } from "@/lib/utils"
import { setClosed } from "@/modules/noticeboard";
import { CrossCircledIcon } from "@radix-ui/react-icons"
import { cva } from "class-variance-authority";
import * as React from "react"
import { useMutation } from "@tanstack/react-query"

export type NoticeItemProps = {
  id: string ;
  title?: string;
  message: string;
  level: 'error' | 'warning' |  'info' 
  closable: boolean,
}

const buttonVariants = cva(
  "flex flex-row gap-2 p-4",
  {
    variants: {
      level: {
        info:
          "bg-primary text-primary-foreground",
        warning:
          "bg-yellow-300 text-primary-foreground",
        error:
          "bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      level: "info"
    }
  }
)

const NoticeItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & NoticeItemProps
>(({ id, className, title, message, level, closable }, ref) => {
  const { isPending: isClosing, mutate } = useMutation({
    mutationFn: setClosed,
  })

  return (
  <div
    ref={ref}
    className={cn(
      buttonVariants({level}),
      className
    )}
  >
    <div className="grow">
      {title && <h1 className="font-bold text-lg">{title}</h1>}
      <p>{message}</p>
    </div>
    {
      closable && (
        <button disabled={isClosing} onClick={() => mutate(id)}><CrossCircledIcon className="size-6" /></button>
      )
    }
  </div>
  )
})

NoticeItem.displayName = "NoticeItem"

export default NoticeItem
