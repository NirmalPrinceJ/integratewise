"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Sparkles,
  Zap,
  BarChart3,
  Users,
  Globe,
  Layers,
  Target,
  TrendingUp,
  MessageSquare,
  Menu,
  X,
  ChevronRight,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { IntegrateWiseLogo } from "@/components/integratewise-logo"

const features = [
  {
    icon: Layers,
    title: "Unified Data Platform",
    description: "Connect all your tools and data sources in one intelligent platform. No more switching between apps.",
    image: "/placeholder-dashboard.png",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Get actionable insights from your data with our advanced AI that learns your business patterns.",
    image: "/placeholder-insights.png",
  },
  {
    icon: Target,
    title: "Smart Automation",
    description: "Automate repetitive tasks and workflows. Focus on what matters while we handle the rest.",
    image: "/placeholder-automation.png",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track your metrics in real-time with beautiful dashboards and customizable reports.",
    image: "/placeholder-analytics.png",
  },
]

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "500M+", label: "Data Points Processed" },
  { value: "99.9%", label: "Uptime" },
  { value: "150+", label: "Integrations" },
]

const testimonials = [
  {
    quote:
      "IntegrateWise transformed how we manage our business. The AI insights are incredibly accurate and have helped us increase revenue by 40%.",
    author: "Sarah Chen",
    role: "CEO, TechFlow Solutions",
    avatar: "/placeholder-user.jpg",
  },
  {
    quote:
      "The automation features alone save us 20 hours per week. It's like having an extra team member that never sleeps.",
    author: "Marcus Johnson",
    role: "Operations Director, Velocity Inc",
    avatar: "/placeholder-user.jpg",
  },
  {
    quote:
      "Finally, a platform that actually understands our workflow. The onboarding was seamless and the support team is outstanding.",
    author: "Emily Rodriguez",
    role: "Founder, GrowthLabs",
    avatar: "/placeholder-user.jpg",
  },
]

const integrations = [
  { name: "Slack", color: "#E01E5A" },
  { name: "HubSpot", color: "#FF7A59" },
  { name: "Google", color: "#4285F4" },
  { name: "Notion", color: "#000000" },
  { name: "Asana", color: "#F06A6A" },
  { name: "Discord", color: "#5865F2" },
  { name: "Stripe", color: "#635BFF" },
  { name: "Salesforce", color: "#00A1E0" },
]

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "glass border-b border-border/50 shadow-sm" : "bg-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <IntegrateWiseLogo className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">IntegrateWise</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#integrations"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Integrations
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Customers
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="text-sm bg-primary hover:bg-primary/90 glow-green-subtle">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-border/50">
            <div className="px-4 py-6 space-y-4">
              <Link href="#features" className="block text-base font-medium text-foreground">
                Features
              </Link>
              <Link href="#integrations" className="block text-base font-medium text-foreground">
                Integrations
              </Link>
              <Link href="/pricing" className="block text-base font-medium text-foreground">
                Pricing
              </Link>
              <Link href="#testimonials" className="block text-base font-medium text-foreground">
                Customers
              </Link>
              <div className="pt-4 space-y-3">
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/sign-up" className="block">
                  <Button className="w-full bg-primary">Get Started Free</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-up">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Business OS</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up delay-100">
              <span className="text-foreground">Your Business</span>
              <br />
              <span className="gradient-text">Command Center</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up delay-200">
              Connect all your tools, automate workflows, and get AI-powered insights. IntegrateWise is the operating
              system for modern businesses.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-up delay-300">
              <Link href="/auth/sign-up">
                <Button size="lg" className="text-base px-8 h-12 bg-primary hover:bg-primary/90 glow-green-subtle">
                  Start for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base px-8 h-12 group bg-transparent">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-up delay-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Video */}
          <div className="mt-16 md:mt-20 relative animate-scale-in delay-500">
            <div className="showcase-frame-lg mx-auto max-w-5xl">
              {/* Dashboard Preview Image */}
              <div className="relative aspect-[16/10] bg-gradient-to-br from-secondary to-accent rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-card/80 backdrop-blur-sm">
                  {/* Mock Dashboard UI */}
                  <div className="p-4 md:p-8 h-full">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="h-8 w-48 bg-muted rounded-lg" />
                    </div>

                    {/* Dashboard Content */}
                    <div className="grid grid-cols-4 gap-4 h-[calc(100%-4rem)]">
                      {/* Sidebar */}
                      <div className="col-span-1 bg-muted/50 rounded-xl p-3 space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className={cn("h-8 rounded-lg", i === 1 ? "bg-primary/30" : "bg-muted")} />
                        ))}
                      </div>

                      {/* Main Content */}
                      <div className="col-span-3 space-y-4">
                        {/* Stats Row */}
                        <div className="grid grid-cols-4 gap-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-card rounded-xl p-4 border border-border">
                              <div className="h-3 w-16 bg-muted rounded mb-2" />
                              <div className="h-6 w-20 bg-primary/20 rounded" />
                            </div>
                          ))}
                        </div>

                        {/* Chart Area */}
                        <div className="bg-card rounded-xl p-4 border border-border flex-1">
                          <div className="h-3 w-24 bg-muted rounded mb-4" />
                          <div className="flex items-end gap-2 h-32">
                            {[40, 65, 45, 80, 55, 70, 85, 60, 75, 90, 65, 80].map((h, i) => (
                              <div key={i} className="flex-1 bg-primary/30 rounded-t" style={{ height: `${h}%` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-primary/10 blur-3xl -z-10" />
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -left-4 top-1/4 animate-float delay-200 hidden lg:block">
              <div className="bg-card rounded-2xl p-4 shadow-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-lg font-bold text-foreground">+42%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 top-1/3 animate-float delay-500 hidden lg:block">
              <div className="bg-card rounded-2xl p-4 shadow-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Users</p>
                    <p className="text-lg font-bold text-foreground">2,847</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-8 bottom-1/4 animate-float delay-700 hidden lg:block">
              <div className="bg-card rounded-2xl p-4 shadow-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tasks Done</p>
                    <p className="text-lg font-bold text-foreground">156</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powerful Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Everything you need to <span className="gradient-text">scale your business</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              From data integration to AI-powered automation, we've built every feature you need to run your business
              more efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div key={index} className="group feature-card bg-card rounded-3xl p-8 border border-border">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>

                {/* Feature Image Placeholder */}
                <div className="relative aspect-[16/9] bg-gradient-to-br from-secondary to-accent rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-card/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <feature.icon className="w-12 h-12 text-primary/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Feature Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-20 md:py-32 bg-secondary/50 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">150+ Integrations</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Connect your <span className="gradient-text">favorite tools</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Seamlessly integrate with the tools you already use. Sync data in real-time and automate workflows across
              platforms.
            </p>
          </div>

          {/* Integration Grid */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6 mb-12">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="aspect-square bg-card rounded-2xl border border-border flex items-center justify-center p-4 hover:scale-105 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: integration.color }}
                >
                  {integration.name[0]}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/integrations">
              <Button variant="outline" size="lg" className="group bg-transparent">
                View all integrations
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Get started in <span className="gradient-text">minutes</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              No complex setup required. Connect your tools, customize your workspace, and start getting insights
              immediately.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect Your Tools",
                description: "Link your existing tools and data sources with our one-click integrations.",
                icon: Globe,
              },
              {
                step: "02",
                title: "Customize Your Workspace",
                description: "Set up dashboards, workflows, and automations tailored to your needs.",
                icon: Layers,
              },
              {
                step: "03",
                title: "Get AI Insights",
                description: "Let our AI analyze your data and provide actionable recommendations.",
                icon: Sparkles,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-card rounded-3xl p-8 border border-border h-full">
                  <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>

                {/* Connector Line */}
                {index < 2 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-32 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Customer Stories</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Loved by <span className="gradient-text">thousands of teams</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See how businesses around the world are transforming their operations with IntegrateWise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card rounded-3xl p-8 border border-border feature-card">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-foreground mb-6">"{testimonial.quote}"</blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {testimonial.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to transform <span className="gradient-text">your business?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of businesses already using IntegrateWise to streamline their operations and grow faster.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-base px-8 h-12 bg-primary hover:bg-primary/90 glow-green">
                Get Started for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/overview">
              <Button size="lg" variant="outline" className="text-base px-8 h-12 bg-transparent">
                Schedule a Demo
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 md:py-20 border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">IntegrateWise</span>
              </Link>
              <p className="text-muted-foreground mb-6 max-w-xs">
                The AI-powered operating system for modern businesses. Connect, automate, and grow.
              </p>
              <div className="flex gap-4">
                {["twitter", "linkedin", "github"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <span className="text-xs font-medium uppercase">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: "Product",
                links: ["Features", "Integrations", "Pricing", "Changelog"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Resources",
                links: ["Documentation", "API Reference", "Community", "Support"],
              },
            ].map((column, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-4">{column.title}</h4>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} IntegrateWise. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
