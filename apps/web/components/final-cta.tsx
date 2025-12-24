import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Mail } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="bg-primary py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-primary-foreground sm:text-5xl">
            Ready to integrate wisely?
          </h2>
          <p className="mt-6 text-lg text-primary-foreground/80">
            Book a strategy call to discuss your integration challenges. We'll help you build systems that scale without
            becoming technical debt.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-12 bg-white px-6 text-base font-medium text-primary hover:bg-white/90"
              asChild
            >
              <Link href="mailto:connect@integratewise.co" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Book a Strategy Call
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/30 bg-transparent px-6 text-base font-medium text-white hover:bg-white/10"
              asChild
            >
              <Link href="https://integratewise.co/services" className="flex items-center gap-2">
                Explore Services <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-8 text-sm text-primary-foreground/60">
            Or email us directly at{" "}
            <a href="mailto:connect@integratewise.co" className="underline hover:text-primary-foreground">
              connect@integratewise.co
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
