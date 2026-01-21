import { auth } from "@/utils/auth"
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {

  const session = await auth.api.getSession({
        headers: await headers()
    })

    console.log("DashboardPage session:", session);
    
    if(!session) {
        redirect("/login");
    }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Welcome to your dashboard!</p>
    </div>
  )}