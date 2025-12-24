"use client";

/**
 * Insights Page - Zero Dependency View
 * 
 * Local AI-like heuristic analysis without external model calls
 * Provides basic text analysis and insight generation
 */

import { useState } from "react";

interface Insight {
  type: "action" | "entity" | "date" | "suggestion";
  content: string;
  priority?: "high" | "medium" | "low";
}

function analyzeText(text: string): Insight[] {
  const insights: Insight[] = [];
  
  // Extract entities (capitalized words)
  const entities = Array.from(new Set(
    text.match(/\b[A-Z][a-zA-Z0-9]+\b/g) || []
  )).slice(0, 5);
  
  if (entities.length > 0) {
    insights.push({
      type: "entity",
      content: `Detected entities: ${entities.join(", ")}`,
      priority: "medium"
    });
  }
  
  // Extract dates
  const dates = Array.from(new Set(
    text.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g) || []
  )).slice(0, 3);
  
  if (dates.length > 0) {
    insights.push({
      type: "date",
      content: `Dates mentioned: ${dates.join(", ")}`,
      priority: "high"
    });
  }
  
  // Detect action verbs
  const actionVerbs = ["create", "update", "review", "send", "schedule", "plan", "prepare", "finalize"];
  const foundActions = actionVerbs.filter(verb => 
    text.toLowerCase().includes(verb)
  );
  
  if (foundActions.length > 0) {
    insights.push({
      type: "action",
      content: `Action items detected: ${foundActions.join(", ")}`,
      priority: "high"
    });
  }
  
  // Generate suggestions
  if (text.length > 100) {
    insights.push({
      type: "suggestion",
      content: "Create follow-up tasks from this content",
      priority: "medium"
    });
    
    if (entities.length > 2) {
      insights.push({
        type: "suggestion",
        content: "Normalize entities and create contacts/companies",
        priority: "medium"
      });
    }
    
    if (dates.length > 0) {
      insights.push({
        type: "suggestion",
        content: "Add dates to calendar and set reminders",
        priority: "low"
      });
    }
  }
  
  return insights;
}

export default function InsightsPage() {
  const [input, setInput] = useState("");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    
    setIsAnalyzing(true);
    
    // Simulate processing delay for better UX
    setTimeout(() => {
      const results = analyzeText(trimmed);
      setInsights(results);
      setIsAnalyzing(false);
    }, 500);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "action":
        return "⚡";
      case "entity":
        return "👤";
      case "date":
        return "📅";
      case "suggestion":
        return "💡";
      default:
        return "📌";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-600 bg-red-50 dark:bg-red-950/20";
      case "medium":
        return "border-l-yellow-600 bg-yellow-50 dark:bg-yellow-950/20";
      case "low":
        return "border-l-blue-600 bg-blue-50 dark:bg-blue-950/20";
      default:
        return "border-l-gray-600 bg-gray-50 dark:bg-gray-950/20";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">AI Insights (Local)</h1>
        <p className="text-muted-foreground mt-2">
          Runs locally without external AI keys. Connect AI services later to enhance capabilities.
        </p>
      </div>

      {/* Input Section */}
      <div className="border rounded-lg p-6 bg-card space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Paste your notes, meeting transcripts, or any text
          </label>
          <textarea
            className="w-full border rounded-md p-3 min-h-[200px] font-mono text-sm"
            placeholder="Example:
Meeting with John Smith on 2025-12-20 about Q1 roadmap.
Need to review proposal and send updated timeline.
Create follow-up tasks for design review and prepare presentation..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <button
            className="bg-black text-white rounded-md px-6 py-2 text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAnalyze}
            disabled={!input.trim() || isAnalyzing}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </button>
          
          <button
            className="border rounded-md px-6 py-2 text-sm hover:bg-muted transition-colors"
            onClick={() => {
              setInput("");
              setInsights([]);
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Insights Results */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Insights Detected</h2>
          
          <div className="grid gap-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`border-l-4 rounded-r-lg p-4 ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {insight.type}
                      </span>
                      {insight.priority && (
                        <span className="text-xs px-2 py-0.5 rounded bg-white dark:bg-background">
                          {insight.priority} priority
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{insight.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {insights.length === 0 && !isAnalyzing && (
        <div className="border rounded-lg p-12 text-center bg-muted/30">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
          <p className="text-sm text-muted-foreground">
            Paste some text above and click "Analyze" to get insights.
          </p>
        </div>
      )}

      {/* Feature Info */}
      <div className="border-l-4 border-purple-600 rounded-r-lg bg-purple-50 dark:bg-purple-950/20 p-4">
        <h3 className="font-semibold text-sm mb-2">Enable AI Services</h3>
        <p className="text-sm text-muted-foreground mb-3">
          This local analysis provides basic insights. Connect Claude, GPT, or other AI services for:
        </p>
        <ul className="text-sm space-y-1 ml-5 list-disc text-muted-foreground">
          <li>Advanced sentiment analysis</li>
          <li>Automatic task extraction</li>
          <li>Smart entity recognition</li>
          <li>Custom workflow automation</li>
        </ul>
      </div>
    </div>
  );
}
