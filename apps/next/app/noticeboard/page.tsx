import { redirect } from "next/navigation"

import { createClient } from "@/modules/utils/server"

import {NoticeBoardForm} from "@/components/noticeboard/admin/notice-form"
import {NoticesList} from "@/components/noticeboard/admin/notice-list"

export default async function Page() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-8">
      <NoticeBoardForm />
      <NoticesList/>
    </div>
  )
}
