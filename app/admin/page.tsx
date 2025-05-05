import { redirect } from "next/navigation"

export default function AdminPage() {
    // Redirect all users to the root page since admin functionality is not implemented yet
    redirect("/")
} 
