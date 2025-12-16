import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Best Practices | Fleet Cost Tracker",
  description: "Best practices for accurate financial modeling",
};

type PracticeType = "tip" | "warning";

type PracticeItem = {
  title: string;
  description: string;
  type: PracticeType;
};

type PracticeCategory = {
  category: string;
  items: PracticeItem[];
};

const practices: PracticeCategory[] = [
  {
    category: "Data Entry",
    items: [
      {
        title: "Use Accurate Purchase Prices",
        description:
          "Enter the actual purchase price including taxes and fees. This ensures accurate depreciation calculations.",
        type: "tip",
      },
      {
        title: "Set Realistic Service Life",
        description:
          "Base service life on manufacturer recommendations and your maintenance schedule, not just calendar years.",
        type: "tip",
      },
      {
        title: "Update Operating Parameters Regularly",
        description:
          "Review and update operating hours and costs monthly to reflect actual usage and market conditions.",
        type: "tip",
      },
      {
        title: "Don't Forget Fixed Costs",
        description:
          "Include all fixed costs like insurance, salaries, and facility rent. Missing costs lead to inaccurate projections.",
        type: "warning",
      },
    ],
  },
  {
    category: "Cost Allocation",
    items: [
      {
        title: "Choose the Right Allocation Method",
        description:
          "Use 'by hours' for usage-based allocation, 'by share' for ownership-based, or 'equal' for simple splits.",
        type: "tip",
      },
      {
        title: "Verify Ownership Shares",
        description:
          "Ensure total ownership shares don't exceed 100%. The system will warn you, but double-check manually.",
        type: "warning",
      },
      {
        title: "Track Operating Hours Accurately",
        description:
          "Accurate hour tracking is crucial for 'by hours' allocation. Use flight logs or maintenance records.",
        type: "tip",
      },
    ],
  },
  {
    category: "Reporting",
    items: [
      {
        title: "Generate Reports Regularly",
        description:
          "Create monthly reports to track trends and identify cost increases early.",
        type: "tip",
      },
      {
        title: "Use Scenario Analysis",
        description:
          "Test different scenarios (high/low usage, cost changes) to plan for various situations.",
        type: "tip",
      },
      {
        title: "Export and Archive Reports",
        description:
          "Export important reports as PDF for record-keeping and compliance purposes.",
        type: "tip",
      },
      {
        title: "Review Depreciation Schedules",
        description:
          "Check depreciation schedules annually to ensure they align with tax requirements.",
        type: "tip",
      },
    ],
  },
  {
    category: "Team Management",
    items: [
      {
        title: "Set Appropriate Roles",
        description:
          "Grant 'Admin' only to trusted team members. Use 'Viewer' for stakeholders who only need to see reports.",
        type: "tip",
      },
      {
        title: "Keep Team Updated",
        description:
          "Notify team members when significant changes are made to projects or calculations.",
        type: "tip",
      },
      {
        title: "Document Changes",
        description:
          "Use project notes to document why changes were made, especially for cost adjustments.",
        type: "tip",
      },
    ],
  },
  {
    category: "Security",
    items: [
      {
        title: "Enable Two-Factor Authentication",
        description:
          "Protect your account with 2FA, especially if you handle sensitive financial data.",
        type: "tip",
      },
      {
        title: "Use Strong Passwords",
        description:
          "Create unique, strong passwords. Consider using a password manager.",
        type: "tip",
      },
      {
        title: "Review API Keys Regularly",
        description:
          "Rotate API keys periodically and revoke unused keys to maintain security.",
        type: "warning",
      },
    ],
  },
];

function getIcon(type: PracticeType) {
  switch (type) {
    case "tip":
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    default:
      return <Lightbulb className="h-5 w-5 text-primary" />;
  }
}

export default function BestPracticesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
          <CardDescription>
            Tips and best practices for accurate financial modeling and cost
            tracking.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {practices.map((section) => (
          <Card key={section.category}>
            <CardHeader>
              <CardTitle>{section.category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="mt-1">{getIcon(item.type)}</div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
