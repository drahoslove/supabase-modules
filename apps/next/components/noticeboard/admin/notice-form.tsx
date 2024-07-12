"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CrossCircledIcon } from "@radix-ui/react-icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CircleIcon, PlusCircleIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import { createNoticeboardItem } from "@/modules/noticeboard"
import {
  DEFAULT_LEVEL,
  LEVELS,
  newNoticeboardItemSchema,
} from "@/modules/noticeboard/zodSchemas"

type NewNotice = z.infer<typeof newNoticeboardItemSchema>

export const NoticeBoardForm: React.FC = () => {
  const [formOpened, setFormOpened] = React.useState(false)

  const queryClient = useQueryClient()

  const createNotice = useMutation({
    mutationFn: createNoticeboardItem,
    onSuccess: async () => {
      setFormOpened(false)
      await queryClient.invalidateQueries({ queryKey: ["noticeAdminList"] })
    },
  })

  const openForm = () => {
    setFormOpened(true)
    createNotice.reset()
  }

  return (
    <>
      <Button className="gap-2" onClick={openForm}>
        <PlusCircleIcon />
        Create new Notice
      </Button>
      <Dialog open={formOpened} onOpenChange={setFormOpened}>
        <DialogContent className="flex max-w-[720px] flex-col gap-4">
          <DialogHeader>Add new notice</DialogHeader>
          <NewNoticeForm
            createNotice={(notice: NewNotice) => {
              createNotice.mutate(notice)
            }}
            isPending={createNotice.isPending}
            isError={!!createNotice.data?.error}
            errorMessage={createNotice.data?.error.message}
          />
        </DialogContent>
      </Dialog>
      {createNotice.isSuccess && (
        <p className="font-bold">New notice successfully added.</p>
      )}
    </>
  )
}

const NewNoticeForm: React.FC<{
  createNotice: ({
    level,
    message,
    title,
  }: z.infer<typeof newNoticeboardItemSchema>) => void
  isPending: boolean
  isError: boolean
  errorMessage?: string
}> = ({ createNotice, isPending, isError, errorMessage }) => {
  const form = useForm<z.infer<typeof newNoticeboardItemSchema>>({
    resolver: zodResolver(newNoticeboardItemSchema),
    defaultValues: {
      title: "",
      message: "",
      level: "info",
      closable: true,
      visible: true,
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(({ ...fields }) => {
          createNotice(fields)
        })}
        className="flex flex-col gap-y-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Optional title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={DEFAULT_LEVEL} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="closable"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel>Closable</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {
          errorMessage && (
            <p  className="text-destructive font-bold">
              <CrossCircledIcon className="size-4" />
              {errorMessage}
            </p>
          )
        }
        {isError && (
          <p className="text-destuctive font-bold">
            <CrossCircledIcon className="size-4" />
            Something went wrong!
          </p>
        )}
        <footer className="flex flex-col gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <CircleIcon className="mr-2 size-4 animate-spin" />}
            Create notice!
          </Button>
        </footer>
      </form>
    </Form>
  )
}
