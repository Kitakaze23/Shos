import type { Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Play } from "lucide-react";

export const metadata: Metadata = {
  title: "Getting Started | Fleet Cost Tracker",
  description: "Quick start guide for Fleet Cost Tracker",
};

export default function GettingStartedPage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Get up and running with Fleet Cost Tracker in 5 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video w-full rounded-md border border-dashed flex items-center justify-center text-sm text-muted-foreground">
            <Play className="mr-2 h-4 w-4" />
            Video placeholder – add YouTube embed or video player here.
          </div>
          <p className="text-sm text-muted-foreground">
            Follow the steps below to set up your first project, add equipment,
            and start tracking costs.
          </p>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>1. Create Your First Project</CardTitle>
            <CardDescription>
              Set up a project for each fleet, aircraft, or business unit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Use the <strong>New Project</strong> button on the dashboard to
              create a project. Give it a clear name and description so your
              team understands what it covers.
            </p>
            <p>
              <strong>Tip:</strong> You can create multiple projects for
              different fleets or departments.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Add Equipment</CardTitle>
            <CardDescription>
              Enter purchase details and key operating parameters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              For each aircraft or piece of equipment, add purchase price,
              service life, and expected annual usage.
            </p>
            <p>
              <strong>Note:</strong> Salvage value is automatically calculated
              as 10% of purchase price, but you can override it.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Define Ownership & Allocation</CardTitle>
            <CardDescription>
              Choose how costs are shared across owners or business units.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Select an allocation method: <strong>by hours</strong>,{" "}
              <strong>by share</strong>, or <strong>equal</strong>. Then enter
              ownership shares or usage assumptions.
            </p>
            <p>
              <strong>Note:</strong> Total ownership share should not exceed
              100%.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Review Reports</CardTitle>
            <CardDescription>
              Analyze cost per hour, total cost, and ownership splits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Use the built‑in reports to track trends, compare scenarios, and
              export results for your team or investors.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Explore more advanced features when you are ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Explore Advanced Features</span>
            </div>
            <p>
              Learn about scenario analysis, cost allocation methods, and other
              tools for deeper financial modeling.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/docs/best-practices">
                Learn more
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Watch Video Tutorials</span>
            </div>
            <p>Step‑by‑step video guides for all major features.</p>
            <Button variant="outline" size="sm" disabled>
              Coming soon
            </Button>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Read Best Practices</span>
            </div>
            <p>Tips for accurate financial modeling and cost tracking.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/docs/best-practices">
                View best practices
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}