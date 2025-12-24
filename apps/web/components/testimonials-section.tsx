import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    quote:
      "IntegrateWise helped us consolidate 12 different data sources into a single canonical model. Our CS team now has a single source of truth for customer health.",
    author: "Sarah Chen",
    role: "VP of Customer Success",
    company: "ScaleTech",
    avatar: "/professional-woman-diverse.png",
    features: ["Data Modeling", "Atlas Spine", "CS Automation"],
  },
  {
    quote:
      "The n8n workflow automation cut our manual processes by 70%. Having on-demand access to their integration experts means we can move fast with confidence.",
    author: "Michael Torres",
    role: "Director of Operations",
    company: "CloudScale SaaS",
    avatar: "/professional-man.jpg",
    features: ["n8n Workflows", "HubSpot", "Automation"],
  },
  {
    quote:
      "SuccessPilot AI identified at-risk accounts we would have missed. The proactive alerts helped us save 3 enterprise accounts in Q1 alone.",
    author: "Emily Watson",
    role: "Chief Customer Officer",
    company: "DataVision",
    avatar: "/confident-business-woman.png",
    features: ["SuccessPilot", "ChurnShield", "AI Agents"],
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Customer Stories</p>

        <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Trusted by scaling SaaS teams.
        </h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="relative rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.author} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {testimonial.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{testimonial.company}</div>
                </div>
              </div>

              <blockquote className="mt-6">
                <p className="text-base leading-relaxed">"{testimonial.quote}"</p>
              </blockquote>

              <div className="mt-6 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{testimonial.author}</span>, {testimonial.role}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {testimonial.features.map((feature, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
