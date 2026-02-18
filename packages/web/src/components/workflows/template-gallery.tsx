"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, GitBranch, Tag, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORKFLOW_TEMPLATES, TEMPLATE_CATEGORIES, type WorkflowTemplate } from "@relay/shared";

const TRIGGER_ICONS: Record<string, typeof Zap> = {
  CONTACT_CREATED: Zap,
  DEAL_STAGE_CHANGED: GitBranch,
  TAG_ADDED: Tag,
  FORM_SUBMITTED: Zap,
  MANUAL: Play,
};

export function TemplateGallery({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [deploying, setDeploying] = useState<string | null>(null);

  async function handleDeploy(template: WorkflowTemplate) {
    setDeploying(template.id);
    try {
      const res = await fetch("/api/workflows/from-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      if (res.ok) {
        const json = await res.json();
        const id = (json.data as { id: string }).id;
        router.push(`/workflows/${id}`);
      }
    } finally {
      setDeploying(null);
    }
  }

  const grouped = Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => ({
    key,
    ...category,
    templates: WORKFLOW_TEMPLATES.filter((t) => t.category === key),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Workflow Templates</h3>
          <p className="text-sm text-gray-500">Start with a pre-built workflow and customize it</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {grouped.map((group) => (
        <div key={group.key}>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: group.color }} />
            <h4 className="text-sm font-medium text-gray-700">{group.label}</h4>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {group.templates.map((template) => {
              const TriggerIcon = TRIGGER_ICONS[template.triggerType] ?? Zap;
              const isDeploying = deploying === template.id;

              return (
                <div
                  key={template.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: `${group.color}15`,
                          color: group.color,
                        }}
                      >
                        <TriggerIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">{template.name}</h5>
                        <p className="text-xs text-gray-400">
                          {template.nodes.length} nodes &middot; {template.edges.length} connections
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mb-3 text-xs text-gray-500">{template.description}</p>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleDeploy(template)}
                    disabled={deploying !== null}
                    isLoading={isDeploying}
                  >
                    {!isDeploying && (
                      <>
                        Use Template
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
