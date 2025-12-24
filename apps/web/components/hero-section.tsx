import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:py-48">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Tool-Agnostic Integration Strategy <span className="text-primary">+ AI Automation</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground">
            We help scaling SaaS teams build integrations that last, automate workflows that work, and deploy AI agents
            that deliver real results.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 px-8 text-base" asChild>
              <Link href="mailto:connect@integratewise.co">Book a Strategy Call</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 bg-transparent px-8 text-base" asChild>
              <Link href="#services" className="flex items-center gap-2">
                Explore Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-24 grid max-w-4xl gap-8 sm:grid-cols-3">
          {[
            { value: "15+", label: "Integrated Platforms" },
            { value: "50+", label: "Workflows Automated" },
            { value: "95%", label: "Client Retention" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold text-primary">{stat.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
