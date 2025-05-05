import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { WelcomeCreatePost } from "../../components/WelcomeCreatePost"

// Add dynamic config to ensure page is never cached
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WelcomePage() {
  // Check if user is authenticated
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
          <h1 className="text-3xl font-bold">Welcome to AntiSocial!</h1>
          
          <div className="bg-secondary/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Create a rant to continue</h2>
            <p className="mb-6 text-muted-foreground">
              AntiSocial requires you to post a rant each time you log in. 
              This ensures our platform remains full of fresh negativity.
            </p>
            
            <WelcomeCreatePost />
          </div>
        </div>
      </main>
    </div>
  )
} 