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
    <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0 auto" }}>
      <main className="py-6" style={{ width: "65%", maxWidth: "850px" }}>
        <div className="flex flex-col gap-6" style={{ width: "100%" }}>
          <h1 className="text-3xl font-bold">Notifications</h1>
          
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <h3 className="text-2xl font-medium mb-2">Notifications Coming Soon</h3>
            <p className="text-muted-foreground">
              This feature is not implemented yet. Check back later!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 