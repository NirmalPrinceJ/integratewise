"use client";

/**
 * Normalize Page - Zero Dependency View
 * 
 * Natural language to structured data preview
 * No persistence, client-side only normalization
 */

import { useState } from "react";

interface NormalizedData {
  entities: string[];
  dates: string[];
  actions: string[];
  metadata: {
    wordCount: number;
    entityCount: number;
    dateCount: number;
    actionCount: number;
  };
}

function normalizeText(text: string): NormalizedData {
  // Extract entities (proper nouns, capitalized words)
  const entities = Array.from(new Set(
    text.match(/\b[A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*\b/g) || []
  )).slice(0, 15);

  // Extract dates in various formats
  const datePatterns = [
    /\b\d{4}-\d{2}-\d{2}\b/g,                    // 2025-12-20
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,       // 12/20/2025 or 12-20-25
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi, // Dec 20, 2025
  ];
  
  let allDates: string[] = [];
  datePatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    allDates = [...allDates, ...matches];
  });
  const dates = Array.from(new Set(allDates)).slice(0, 10);

  // Extract action items (sentences with action verbs)
  const actionVerbs = [
    "create", "update", "review", "send", "schedule", "plan", "prepare", 
    "finalize", "complete", "submit", "approve", "assign", "notify",
    "follow up", "reach out", "connect", "contact", "call", "email"
  ];
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const actions = sentences
    .filter(sentence => 
      actionVerbs.some(verb => 
        sentence.toLowerCase().includes(verb)
      )
    )
    .map(s => s.trim())
    .slice(0, 10);

  // Calculate metadata
  const wordCount = text.split(/\s+/).filter(w => w.trim()).length;

  return {
    entities,
    dates,
    actions,
    metadata: {
      wordCount,
      entityCount: entities.length,
      dateCount: dates.length,
      actionCount: actions.length,
    }
  };
}

export default function NormalizePage() {
  const [rawText, setRawText] = useState("");
  const [normalized, setNormalized] = useState<NormalizedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNormalize = () => {
    const trimmed = rawText.trim();
    if (!trimmed) return;

    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      const result = normalizeText(trimmed);
      setNormalized(result);
      setIsProcessing(false);
    }, 500);
  };

  const handleClear = () => {
    setRawText("");
    setNormalized(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">Normalize (Preview)</h1>
        <p className="text-muted-foreground mt-2">
          Convert free-form text into structured data. No persistence—preview only.
        </p>
      </div>

      {/* Input Section */}
      <div className="border rounded-lg p-6 bg-card space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Raw Text Input
          </label>
          <textarea
            className="w-full border rounded-md p-3 min-h-[250px] font-mono text-sm"
            placeholder="Paste any free text here...

Example:
Meeting with Sarah Johnson and Mike Chen on 2025-12-22 about Q1 2026 product launch. 
Need to create project timeline, review budget proposal, and schedule follow-up with design team.
Contact vendors by January 5, 2026. Update stakeholders via email and prepare presentation slides."
            value={rawText}
            onChange={e => setRawText(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            className="bg-black text-white rounded-md px-6 py-2 text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
            onClick={handleNormalize}
            disabled={!rawText.trim() || isProcessing}
          >
            {isProcessing ? "Processing..." : "Preview Normalization"}
          </button>
          
          <button
            className="border rounded-md px-6 py-2 text-sm hover:bg-muted transition-colors"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results */}
      {normalized && (
        <div className="space-y-4">
          {/* Metadata Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="border rounded-lg p-4 bg-card">
              <div className="text-2xl font-bold text-blue-600">{normalized.metadata.wordCount}</div>
              <div className="text-sm text-muted-foreground">Words</div>
            </div>
            <div className="border rounded-lg p-4 bg-card">
              <div className="text-2xl font-bold text-purple-600">{normalized.metadata.entityCount}</div>
              <div className="text-sm text-muted-foreground">Entities</div>
            </div>
            <div className="border rounded-lg p-4 bg-card">
              <div className="text-2xl font-bold text-green-600">{normalized.metadata.dateCount}</div>
              <div className="text-sm text-muted-foreground">Dates</div>
            </div>
            <div className="border rounded-lg p-4 bg-card">
              <div className="text-2xl font-bold text-orange-600">{normalized.metadata.actionCount}</div>
              <div className="text-sm text-muted-foreground">Actions</div>
            </div>
          </div>

          <h2 className="text-xl font-semibold">Normalized Data</h2>

          {/* Structured Output */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Entities */}
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>👤</span>
                <span>Entities</span>
              </h3>
              {normalized.entities.length > 0 ? (
                <ul className="space-y-2">
                  {normalized.entities.map((entity, i) => (
                    <li key={i} className="text-sm p-2 bg-muted/50 rounded">
                      {entity}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No entities detected</p>
              )}
            </div>

            {/* Dates */}
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>📅</span>
                <span>Dates</span>
              </h3>
              {normalized.dates.length > 0 ? (
                <ul className="space-y-2">
                  {normalized.dates.map((date, i) => (
                    <li key={i} className="text-sm p-2 bg-muted/50 rounded">
                      {date}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No dates detected</p>
              )}
            </div>

            {/* Next Actions */}
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>⚡</span>
                <span>Suggested Actions</span>
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/30">
                  Classify & categorize
                </li>
                <li className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/30">
                  De-duplicate entities
                </li>
                <li className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/30">
                  Tag & label
                </li>
                <li className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/30">
                  Queue for processing
                </li>
              </ul>
            </div>
          </div>

          {/* Action Items */}
          {normalized.actions.length > 0 && (
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>✅</span>
                <span>Detected Action Items</span>
              </h3>
              <ul className="space-y-2">
                {normalized.actions.map((action, i) => (
                  <li key={i} className="text-sm p-3 border-l-2 border-orange-600 bg-orange-50 dark:bg-orange-950/20 rounded-r">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!normalized && !isProcessing && (
        <div className="border rounded-lg p-12 text-center bg-muted/30">
          <div className="text-4xl mb-4">🔄</div>
          <h3 className="text-lg font-semibold mb-2">Ready to Normalize</h3>
          <p className="text-sm text-muted-foreground">
            Enter text above and click "Preview Normalization" to see structured data extraction.
          </p>
        </div>
      )}

      {/* Info Banner */}
      <div className="border-l-4 border-blue-600 rounded-r-lg bg-blue-50 dark:bg-blue-950/20 p-4">
        <h3 className="font-semibold text-sm mb-2">About Data Normalization</h3>
        <p className="text-sm text-muted-foreground mb-3">
          This preview extracts structured information from unstructured text. In production, normalized data would be:
        </p>
        <ul className="text-sm space-y-1 ml-5 list-disc text-muted-foreground">
          <li>Stored with stable IDs for tracking</li>
          <li>De-duplicated across all sources</li>
          <li>Linked to existing entities (contacts, companies, projects)</li>
          <li>Queued for workflow automation</li>
        </ul>
      </div>
    </div>
  );
}
