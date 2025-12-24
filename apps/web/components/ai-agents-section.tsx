import { Bot, Shield, FileCode, Lock, Brain, Layers } from "lucide-react"
import Link from "next/link"

const aiAgents = [
  {
    icon: Bot,
    name: "SuccessPilot",
    description: "AI-powered health scoring that predicts churn before it happens.",
    status: "Available Now",
  },
  {
    icon: Shield,
    name: "ChurnShield",
    description: "Proactive alerts and automated playbooks for at-risk accounts.",
    status: "Available Now",
  },
  {
    icon: FileCode,
    name: "TemplateForge",
    description: "Auto-generate technical documentation from codebases and APIs.",
    status: "Beta",
  },
  {
    icon: Lock,
    name: "VaultGuard",
    description: "Continuous validation of secrets and credentials across your stack.",
    status: "Coming Soon",
  },
  {
    icon: Brain,
    name: "ArchitectIQ",
    description: "Automated architecture reviews with best practice recommendations.",
    status: "Coming Soon",
  },
  {
    icon: Layers,
    name: "AI Loader",
    description: "Unified deployment coordinator for all your AI agents.",
    status: "In Development",
  },
]

export function AIAgentsSection() {
  return (
    <section id="ai-agents" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            AI Agents That <span className="text-primary">Deliver</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Purpose-built agents for customer success, security, documentation, and architecture review.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {aiAgents.map((agent, index) => {
            const Icon = agent.icon
            return (
              <div
                key={index}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">{agent.name}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {agent.status}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{agent.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="https://integratewise.co/agents"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Learn more about our AI agents →
          </Link>
        </div>
      </div>
    </section>
  )
}
