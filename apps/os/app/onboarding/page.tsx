"use client";

/**
 * Onboarding Page - Template Selection
 * 
 * Updated for zero-dependency architecture:
 * - Client-only template selection initially
 * - Defers real DB writes until later phases
 * - Stores template choice in local state/session storage
 * - Unfolds domain pages based on template selection
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TemplateSelector } from "@/components/onboarding/template-selector";
import type { IndustryTemplate } from "@/lib/templates/industry-templates";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";

type OnboardingStep = "template" | "applying" | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("template");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const handleSelectTemplate = async (template: IndustryTemplate | null) => {
    if (!template) {
      // Skip template selection - go to normalize page
      router.push("/normalize");
      return;
    }

    setStep("applying");
    setStatusMessage("Preparing your workspace...");
    setProgress(10);

    try {
      // Store template selection in localStorage for client-side use
      // This avoids server-side DB writes initially
      const templateConfig = {
        id: template.id,
        name: template.name,
        icon: template.icon,
        selectedAt: new Date().toISOString(),
        pipeline: template.pipeline,
        defaultCurrency: template.defaultCurrency,
        fiscalYearStart: template.fiscalYearStart,
      };

      // Simulate progress for better UX
      setProgress(20);
      setStatusMessage("Configuring pipeline stages...");
      await new Promise((r) => setTimeout(r, 500));

      setProgress(40);
      setStatusMessage("Setting up metrics...");
      await new Promise((r) => setTimeout(r, 500));

      setProgress(60);
      setStatusMessage("Loading templates...");
      await new Promise((r) => setTimeout(r, 500));

      setProgress(80);
      setStatusMessage("Finalizing setup...");
      await new Promise((r) => setTimeout(r, 500));

      // Store template configuration
      localStorage.setItem("integratewise_template", JSON.stringify(templateConfig));
      localStorage.setItem("integratewise_onboarding_complete", "true");

      setProgress(100);
      setStatusMessage("Workspace ready!");
      setStep("complete");

      // Redirect to overview after short delay
      setTimeout(() => {
        router.push("/overview");
      }, 1500);

    } catch (error) {
      console.error("Error during onboarding:", error);
      // Still proceed - can recover later
      router.push("/overview");
    }
  };

  const handleSkip = () => {
    // Mark onboarding as skipped
    localStorage.setItem("integratewise_onboarding_complete", "skipped");
    router.push("/overview");
  };

  // Template selection step
  if (step === "template") {
    return (
      <TemplateSelector
        onSelectTemplate={handleSelectTemplate}
        onSkip={handleSkip}
      />
    );
  }

  // Applying template or complete step
  if (step === "applying" || step === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-6 max-w-md px-4">
          {step === "applying" ? (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-2">
              {step === "applying" ? "Setting Up Your Workspace" : "All Set!"}
            </h2>
            <p className="text-muted-foreground">{statusMessage}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {step === "complete" && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Redirecting to your dashboard...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
