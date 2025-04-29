import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function Home() {
  // Get fresh session data and request headers
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList
  });
  
  // Check if user is authenticated
  if (session?.user) {
    // Check referer header to see if coming from auth pages
    const referer = headersList.get('referer') || '';
    
    // If we're coming from auth pages or we have a session cookie
    // that was just set, redirect to /welcome
    if (referer.includes('/auth/') || 
        referer.includes('/auth/sign-in') || 
        referer.includes('/auth/sign-up') || 
        referer.includes('/auth/callback')) {
      console.log('Redirecting from homepage to welcome after auth');
      redirect('/welcome');
    }
    
    // For other authenticated users navigating here directly,
    // offer the option to go to feed but don't force redirect
  }
  
  // Render the landing page whether user is logged in or not
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 pt-8">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mt-8">
          Welcome to <span className="text-orange-500 dark:text-orange-400">AntiSocial</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Where negativity is encouraged and positivity is tolerated (barely).
        </p>
        
        <div className="bg-secondary/50 p-6 sm:p-8 rounded-lg text-left space-y-6 mt-6">
          <h2 className="text-2xl font-semibold">How It Works:</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-orange-500 pl-4 py-1">
              <h3 className="font-medium">Rants, Not Recommendations</h3>
              <p className="text-muted-foreground">Express your deepest frustrations without the fake positivity of other platforms. We don&apos;t care about your vacation photos.</p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4 py-1">
              <h3 className="font-medium">Dislikes {`>`} Likes</h3>
              <p className="text-muted-foreground">Content is ranked by how much people hate it. The more thumbs down, the more visibility. Super-dislikes get priority placement.</p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4 py-1">
              <h3 className="font-medium">Fresh Negativity</h3>
              <p className="text-muted-foreground">You must post a rant before browsing. We ensure our platform stays salty with mandatory complaints from every user, every session.</p>
            </div>
          </div>
          
          <div className="italic text-sm text-muted-foreground mt-4">
            <p>* Studies show that 98% of social media users are actually miserable. We just admit it.</p>
          </div>
        </div>
        
        {!session?.user ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
              <Link href="/auth/sign-up?callbackUrl=/feed">
                Join the Misery
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/sign-in?callbackUrl=/feed">
                Return to Complaining
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex justify-center mt-8">
            <Button asChild size="lg">
              <Link href="/feed">
                Go to Your Feed
              </Link>
            </Button>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-8">
          By signing up, you agree to subject yourself to the unfiltered opinions of terrible people.
          <br />Mental health not guaranteed. Proceed at your own risk.
        </p>
      </div>
    </div>
  )
}
