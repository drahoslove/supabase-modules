import {z} from 'zod'

export const DEFAULT_LEVEL = "info";
export const LEVELS = ["info", "warning", "error"] as const

const noticeboardItemSchema = z.object({
  id: z.string(),
  title: z.string().nullable().transform(val => val ?? undefined),
  message: z.string().min(3),
  level: z.enum(LEVELS),
  closable: z.boolean(),
  visible: z.boolean(),
})

export const newNoticeboardItemSchema = noticeboardItemSchema.omit({id: true})