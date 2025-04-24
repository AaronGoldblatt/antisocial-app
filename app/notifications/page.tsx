import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function NotificationsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  return (
    <main className="container max-w-3xl py-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-2xl font-medium mb-2">Notifications Coming Soon</h3>
          <p className="text-muted-foreground">
            This feature is not implemented yet. Check back later!
          </p>
        </div>
      </div>
    </main>
  )
} 