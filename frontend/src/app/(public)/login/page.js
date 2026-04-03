import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import LoginForm from "./LoginForm"

export const metadata = {
  title: "Admin Login | TriageList",
  description: "Sign in to access the TriageList administrative dashboard.",
}

export default async function LoginPage() {
  const cookieStore = await cookies()
  const auth = cookieStore.get("auth")

  if (auth?.value === "true") {
    redirect("/admin/dashboard")
  }

  return <LoginForm />
}