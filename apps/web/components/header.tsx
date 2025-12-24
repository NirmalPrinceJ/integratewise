"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const navigation = {
  whatWeDo: {
    label: "What We Do",
    href: "https://integratewise.co/services",
    items: [
      { name: "Canonical Data Modeling", href: "https://integratewise.co/services#data-modeling" },
      { name: "n8n Orchestration", href: "https://integratewise.co/services#n8n" },
      { name: "CS Automation", href: "https://integratewise.co/services#cs-automation" },
      { name: "MuleSoft Maturity Model", href: "https://integratewise.co/services#mulesoft" },
    ],
  },
  platform: {
    label: "Platform",
    href: "https://integratewise.co/platform",
    items: [
      { name: "Atlas Spine Model", href: "https://integratewise.co/platform#atlas-spine" },
      { name: "Tech Stack & SaaS Hub", href: "https://integratewise.co/platform#tech-stack" },
      { name: "Schemas / Diagrams", href: "https://integratewise.co/platform#schemas" },
    ],
  },
  aiAgents: {
    label: "AI Agents",
    href: "https://integratewise.co/agents",
    items: [
      { name: "SuccessPilot AI", href: "https://integratewise.co/agents#successpilot" },
      { name: "ChurnShield AI", href: "https://integratewise.co/agents#churnshield" },
      { name: "More AI Products", href: "https://integratewise.co/agents#more" },
    ],
  },
  resources: {
    label: "Resources",
    href: "https://integratewise.co/resources",
    items: [
      { name: "Framebooks / Guides", href: "https://integratewise.co/resources#guides" },
      { name: "Blog Posts", href: "https://integratewise.co/resources#blog" },
      { name: "Media Kit", href: "https://integratewise.co/resources#media-kit" },
    ],
  },
  about: {
    label: "About",
    href: "https://integratewise.co/about",
    items: [
      { name: "Founder Story", href: "https://integratewise.co/about#founder" },
      { name: "Team & Timeline", href: "https://integratewise.co/about#team" },
      { name: "Careers", href: "https://integratewise.co/about#careers" },
    ],
  },
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="https://integratewise.co" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">IW</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">IntegrateWise</span>
        </Link>

        {/* Desktop Navigation with Dropdowns */}
        <div className="hidden items-center gap-1 lg:flex">
          {Object.entries(navigation).map(([key, nav]) => (
            <DropdownMenu key={key}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  {nav.label}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {nav.items.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link href={item.href} className="cursor-pointer">
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" size="sm" className="text-sm font-medium" asChild>
            <Link href="https://integratewise.co/contact">Contact</Link>
          </Button>
          <Button size="sm" className="text-sm font-medium" asChild>
            <Link href="https://integratewise.co/contact">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {Object.entries(navigation).map(([key, nav]) => (
              <div key={key} className="py-2">
                <Link
                  href={nav.href}
                  className="block text-sm font-semibold text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {nav.label}
                </Link>
                <div className="mt-2 flex flex-col gap-1 pl-4">
                  {nav.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="rounded-md py-1.5 text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="https://integratewise.co/contact">Contact</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="https://integratewise.co/contact">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
