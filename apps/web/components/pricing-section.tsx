import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Advisory Retainer",
    price: "Custom",
    period: "",
    description: "On-demand integration expertise",
    features: [
      "Monthly strategy sessions",
      "Architecture review calls",
      "Slack/email support",
      "Priority response time",
      "Documentation templates",
    ],
    cta: "Book a Call",
    href: "mailto:connect@integratewise.co",
    highlighted: false,
  },
  {
    name: "Project-Based",
    price: "Scoped",
    period: "",
    description: "Full implementation delivery",
    features: [
      "Everything in Advisory",
      "Dedicated project team",
      "n8n workflow builds",
      "MuleSoft implementations",
      "AI agent deployment",
      "Knowledge transfer",
      "30-day support",
    ],
    cta: "Get a Quote",
    href: "mailto:connect@integratewise.co",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Strategic partnership",
    features: [
      "Everything in Project-Based",
      "Embedded team members",
      "COE establishment",
      "Custom AI agents",
      "SLA guarantees",
      "Executive sponsorship",
      "Quarterly business reviews",
    ],
    cta: "Contact Sales",
    href: "mailto:connect@integratewise.co",
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="border-y border-border/60 bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Engagement Models</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Flexible engagement models.</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From advisory retainers to full project delivery. Choose what works for your team.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.highlighted ? "border-primary bg-background shadow-lg" : "border-border bg-background"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-3xl font-semibold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`mt-8 w-full ${plan.highlighted ? "" : "bg-transparent"}`}
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
