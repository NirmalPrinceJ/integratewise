import { Metadata } from "next"
import EnvironmentPreview from "@/components/widgets/environment-preview"

export const metadata: Metadata = {
  title: "Environment | IntegrateWise OS",
  description: "Environment configuration and health status",
}

/**
 * Environment Preview Page
 * 
 * Displays runtime configuration and health status.
 * Shows only public variables; server-only values are fetched via API.
 */
export default function EnvPage() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Environment Configuration</h1>
        <p className="text-muted-foreground mt-1">
          Runtime configuration and health status for IntegrateWise OS
        </p>
      </div>
      
      <EnvironmentPreview />
      
      <div className="mt-6 text-sm text-muted-foreground">
        <h2 className="font-semibold mb-2">Configuration Notes</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Public variables (NEXT_PUBLIC_*) are safe to expose in the browser</li>
          <li>Server-only variables are accessed via the health API endpoint</li>
          <li>Secrets are never displayed, only their configuration status</li>
          <li>
            Set environment variables in{" "}
            <code className="bg-muted px-1 rounded">.env.local</code> (local) or{" "}
            <a
              href="https://vercel.com/docs/environment-variables"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Vercel Project Settings
            </a>{" "}
            (production)
          </li>
        </ul>
      </div>
    </div>
  )
}
