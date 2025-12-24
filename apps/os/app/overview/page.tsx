"use client";

/**
 * Overview Page - Zero Dependency View
 * 
 * Lightweight starter view with no external API calls or server dependencies
 * Shows basic widgets and enablement toggles for Calendar and Memory integrations
 */

export default function OverviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">IntegrateWise Overview</h1>
        <p className="text-muted-foreground mt-2">
          Lightweight view—no external APIs. Enable calendar/memory for richer insights.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Today's Summary */}
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Today</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground">Meetings:</span>
              <span className="font-medium">0</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground">Tasks:</span>
              <span className="font-medium">0</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground">AI Status:</span>
              <span className="font-medium text-yellow-600">Disabled</span>
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <button className="text-blue-600 hover:underline">
                Enable Calendar Integration
              </button>
            </li>
            <li>
              <button className="text-blue-600 hover:underline">
                Enable Memory Insights
              </button>
            </li>
            <li>
              <button className="text-blue-600 hover:underline">
                Pick a Template
              </button>
            </li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Next Steps</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Choose a template to unfold domain pages and configure your workspace.
          </p>
          <button className="w-full bg-black text-white rounded-md px-4 py-2 text-sm hover:bg-gray-800 transition-colors">
            Browse Templates
          </button>
        </div>
      </div>

      {/* Feature Enablement Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Calendar Integration</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Connect Google, Microsoft, or Apple Calendar
              </p>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-800 rounded">
              Optional
            </span>
          </div>
          <ul className="space-y-2 text-sm mb-4">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>See today's meetings</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Auto-populate tasks from events</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Client-side only, no server keys</span>
            </li>
          </ul>
          <button className="w-full border border-blue-600 text-blue-600 rounded-md px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
            Enable Calendar
          </button>
        </div>

        <div className="border rounded-lg p-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-background">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Memory Insights</h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered task and insight extraction
              </p>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-800 rounded">
              Optional
            </span>
          </div>
          <ul className="space-y-2 text-sm mb-4">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Track overdue items</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Generate action items</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Consent-based, on-demand</span>
            </li>
          </ul>
          <button className="w-full border border-purple-600 text-purple-600 rounded-md px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors">
            Enable Memory
          </button>
        </div>
      </div>
    </div>
  );
}
