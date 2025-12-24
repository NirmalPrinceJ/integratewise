import Link from "next/link"
import { Github, Linkedin, Twitter } from "lucide-react"

const footerLinks = {
  whatWeDo: [
    { name: "Canonical Data Modeling", href: "https://integratewise.co/services#data-modeling" },
    { name: "n8n Orchestration", href: "https://integratewise.co/services#n8n" },
    { name: "CS Automation", href: "https://integratewise.co/services#cs-automation" },
    { name: "MuleSoft Maturity Model", href: "https://integratewise.co/services#mulesoft" },
  ],
  platform: [
    { name: "Atlas Spine Model", href: "https://integratewise.co/platform#atlas-spine" },
    { name: "Tech Stack & SaaS Hub", href: "https://integratewise.co/platform#tech-stack" },
    { name: "Schemas / Diagrams", href: "https://integratewise.co/platform#schemas" },
  ],
  aiAgents: [
    { name: "SuccessPilot AI", href: "https://integratewise.co/agents#successpilot" },
    { name: "ChurnShield AI", href: "https://integratewise.co/agents#churnshield" },
    { name: "More AI Products", href: "https://integratewise.co/agents#more" },
  ],
  resources: [
    { name: "Framebooks / Guides", href: "https://integratewise.co/resources#guides" },
    { name: "Blog Posts", href: "https://integratewise.co/resources#blog" },
    { name: "Media Kit", href: "https://integratewise.co/resources#media-kit" },
  ],
  about: [
    { name: "Founder Story", href: "https://integratewise.co/about#founder" },
    { name: "Team & Timeline", href: "https://integratewise.co/about#team" },
    { name: "Careers", href: "https://integratewise.co/about#careers" },
  ],
  legal: [
    { name: "Terms of Service", href: "https://integratewise.co/terms" },
    { name: "Privacy Policy", href: "https://integratewise.co/privacy" },
    { name: "Sitemap", href: "https://integratewise.co/sitemap" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="https://integratewise.co" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">IW</span>
              </div>
              <span className="text-lg font-semibold">IntegrateWise</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Integration, Without the Debt. Advisory + Automation + AI for scaling SaaS teams.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <a href="mailto:connect@integratewise.co" className="hover:text-foreground transition-colors">
                connect@integratewise.co
              </a>
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Link
                href="https://twitter.com/integratewise"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com/company/integratewise"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="https://github.com/integratewise"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* What We Do */}
          <div>
            <h3 className="text-sm font-semibold">What We Do</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.whatWeDo.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold">Platform</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Agents */}
          <div>
            <h3 className="text-sm font-semibold">AI Agents</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.aiAgents.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About & Legal */}
          <div>
            <h3 className="text-sm font-semibold">About</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/60 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} IntegrateWise. All rights reserved.
            </p>
            <Link href="https://integratewise.co/contact" className="text-sm font-medium text-primary hover:underline">
              Contact / Get Started →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
