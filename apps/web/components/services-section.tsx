import { Database, Workflow, Bot, Layers } from "lucide-react"

const services = [
  {
    icon: Layers,
    title: "Integration Architecture",
    description:
      "From audits to Atlas Spine data modeling—we design integrations that scale without becoming technical debt.",
    features: ["Architecture Audits", "Canonical Data Models", "API Governance", "MuleSoft Advisory"],
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    description: "n8n orchestration, event-driven systems, and CS playbook automation that connects your entire stack.",
    features: ["n8n Workflows", "Event-Driven Architecture", "CS Playbooks", "Slack & HubSpot Integration"],
  },
  {
    icon: Bot,
    title: "AI Agent Deployment",
    description:
      "Purpose-built AI agents like SuccessPilot and ChurnShield that deliver measurable operational improvements.",
    features: ["SuccessPilot AI", "ChurnShield AI", "TemplateForge", "Custom AI Agents"],
  },
  {
    icon: Database,
    title: "Templates & Documentation",
    description: "Production-ready templates, technical documentation, and delivery frameworks for faster execution.",
    features: ["Playbook Templates", "API Documentation", "Architecture Diagrams", "Deployment Guides"],
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="border-t border-border/60 bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            What We <span className="text-primary">Do</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Advisory, automation, and AI for scaling SaaS operations.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={index}
                className="group rounded-2xl border border-border bg-background p-8 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                <ul className="mt-6 space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
