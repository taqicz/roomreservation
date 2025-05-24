import { AuthForm } from "@/components/auth/auth-form"

export default function AuthPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Room Reservation</h1>
          <p className="mt-2 text-gray-600">Sign in or create an account to book rooms</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
