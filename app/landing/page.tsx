import Link from "next/link"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function LandingPage() {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 pt-8">
      <div className="max-w-3xl w-full space-y-8 text-center mb-16">
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
              <h3 className="font-medium">Rants, Not Posts</h3>
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
          
          <div className="mt-8 p-4 border border-orange-500/30 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">The Three Ways to Express Your Feelings:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border border-muted rounded-md flex flex-col items-center">
                <div className="text-3xl mb-2">👍</div>
                <h4 className="font-medium">Like</h4>
                <p className="text-sm text-muted-foreground text-center">For content that you like. But let's be real, that's not why you're here. Go to Facebook or Twitter for that bullshit.</p>
              </div>
              
              <div className="p-3 border border-muted rounded-md flex flex-col items-center">
                <div className="text-3xl mb-2">👎</div>
                <h4 className="font-medium">Dislike</h4>
                <p className="text-sm text-muted-foreground text-center">For content that annoys you. Shows your disapproval.</p>
              </div>
              
              <div className="p-3 border border-muted rounded-md flex flex-col items-center">
                <div className="text-3xl mb-2">🖕</div>
                <h4 className="font-medium">Super Dislike</h4>
                <p className="text-sm text-muted-foreground text-center">For content that truly infuriates you. The highest honor on AntiSocial.</p>
              </div>
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
              <Link href="/">
                Go to Your Feed
              </Link>
            </Button>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-8 pb-8">
          By signing up, you agree to subject yourself to the unfiltered opinions of terrible people.
          <br />Mental health not guaranteed. Proceed at your own risk.
        </p>
      </div>
    </div>
  )
} 