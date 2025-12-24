export function LogosSection() {
  const partners = ["n8n", "HubSpot", "MuleSoft", "Salesforce", "Slack", "Zendesk", "Gainsight", "Neon"]

  return (
    <section className="border-y border-border/60 bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-10 text-center text-sm font-medium text-muted-foreground">Platforms We Integrate</p>
        <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8">
          {partners.map((partner, index) => (
            <span
              key={index}
              className="text-lg font-semibold tracking-wide text-foreground/70 transition-colors hover:text-foreground"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
