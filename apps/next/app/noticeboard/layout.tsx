export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-5xl space-y-6 py-6">
      <header className="space-y-2">
        <h2 className="text-4xl font-semibold tracking-tight lg:text-5xl">
          NoticeBoard
        </h2>
        <p>Add and manage your app notices</p>
      </header>
      <div className="w-full">{children}</div>
    </section>
  )
}
