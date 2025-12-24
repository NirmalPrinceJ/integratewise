"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Sparkles, ArrowLeft, Mail, Lock, ArrowRight } from "lucide-react"
import { isMockAuthEnabled, DEMO_CREDENTIALS } from "@/lib/mock-auth"
import { IntegrateWiseLogo } from "@/components/integratewise-logo"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isMockAuthEnabled()) {
      router.push("/dashboard")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      // Set cookie with strict same-site policy for better persistence
      document.cookie = `demo_session=true; path=/; max-age=${60 * 60 * 24 * 7}; samesite=strict`
      // Allow cookie to be written before navigation
      await new Promise(resolve => setTimeout(resolve, 100))
      router.push("/dashboard")
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      // Show user-friendly error message instead of raw Supabase errors
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      if (errorMessage.toLowerCase().includes("invalid") || errorMessage.toLowerCase().includes("credentials")) {
        setError("Invalid email or password. Please try again.")
      } else {
        setError("Unable to sign in. Please check your connection and try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Back to home
            </span>
          </Link>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center glow-green">
                <IntegrateWiseLogo className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-3xl font-bold">IntegrateWise</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Welcome back to your <span className="gradient-text">command center</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md">
              Connect, automate, and grow your business with AI-powered insights.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>🔒 Secure login</span>
            <span>•</span>
            <span>✓ SOC 2 Compliant</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <IntegrateWiseLogo className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">IntegrateWise</span>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Sign in</h2>
              <p className="text-muted-foreground">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-11 bg-muted/50 border-border focus:bg-background transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Link href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-11 bg-muted/50 border-border focus:bg-background transition-colors"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 glow-green-subtle text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 bg-transparent text-base"
                  onClick={handleDemoLogin}
                >
                  <Sparkles className="w-5 h-5 mr-2 text-primary" />
                  Try Demo Account
                </Button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="text-primary font-medium hover:text-primary/80 transition-colors">
                  Create one for free
                </Link>
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-center text-xs text-muted-foreground">
                Demo credentials: {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
