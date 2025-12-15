import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight, Play } from "lucide-react"

export const metadata: Metadata = {
  title: "Getting Started | Fleet Cost Tracker",
  description: "Quick start guide for Fleet Cost Tracker",
}

export default function GettingStartedPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
        <p className="text-lg text-muted-foreground">
          Get up and running with Fleet Cost Tracker in 5 minutes
        </p>
      </div>

      {/* Video Tutorial */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Quick Start Video (5 minutes)
          </CardTitle>
          <CardDescription>
            Watch a quick walkthrough of the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">
              [Video placeholder - Add YouTube embed or video player]
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Guide */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Create an Account</CardTitle>
            <CardDescription>Sign up for free</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "Sign Up" on the homepage</li>
              <li>Enter your email and create a password</li>
              <li>Verify your email address</li>
              <li>Complete your profile</li>
            </ol>
            <Button asChild>
              <Link href="/auth/signup">Create Account</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 2: Create Your First Project</CardTitle>
            <CardDescription>Set up a project for your fleet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to the Projects page</li>
              <li>Click "New Project"</li>
              <li>Enter project name and description</li>
              <li>Select your currency (RUB, USD, EUR, etc.)</li>
              <li>Click "Create Project"</li>
            </ol>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>Tip:</strong> You can create multiple projects for different fleets or departments.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 3: Add Equipment</CardTitle>
            <CardDescription>Add your first piece of equipment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2">
              <li>Open your project</li>
              <li>Go to the "Equipment" tab</li>
              <li>Click "Add Equipment"</li>
              <li>Fill in the details:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Equipment name</li>
                  <li>Purchase price</li>
                  <li>Acquisition date</li>
                  <li>Service life (years)</li>
                  <li>Category (Helicopter, Vehicle, etc.)</li>
                </ul>
              </li>
              <li>Click "Save"</li>
            </ol>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> Salvage value is automatically calculated as 10% of purchase price, but you can override it.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 4: Set Operating Parameters</CardTitle>
            <CardDescription>Configure monthly operating costs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to the "Operating Parameters" tab</li>
              <li>Enter operating hours per month</li>
              <li>Set fuel cost per hour</li>
              <li>Set maintenance cost per hour</li>
              <li>Add fixed costs:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Insurance (monthly)</li>
                  <li>Staff salaries (monthly)</li>
                  <li>Facility rent (monthly)</li>
                  <li>Other expenses</li>
                </ul>
              </li>
              <li>View real-time cost calculations</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 5: Add Team Members</CardTitle>
            <CardDescription>Invite team members and set ownership</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to the "Team Members" tab</li>
              <li>Click "Add Member"</li>
              <li>Enter member email or select existing user</li>
              <li>Set ownership share (%)</li>
              <li>Set operating hours per month</li>
              <li>Choose role (Admin, Member, Viewer)</li>
              <li>Click "Add"</li>
            </ol>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> Total ownership share should not exceed 100%.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 6: View Reports</CardTitle>
            <CardDescription>Generate and export financial reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to the "Reports" tab</li>
              <li>Select report type:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Monthly Summary</li>
                  <li>Annual Forecast</li>
                  <li>Depreciation Schedule</li>
                  <li>Scenario Analysis</li>
                </ul>
              </li>
              <li>View interactive charts and tables</li>
              <li>Export as PDF, Excel, or CSV</li>
              <li>Email reports to team members</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Explore Advanced Features</p>
                <p className="text-sm text-muted-foreground">
                  Learn about scenario analysis, cost allocation methods, and more
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Watch Video Tutorials</p>
                <p className="text-sm text-muted-foreground">
                  Step-by-step video guides for all features
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Read Best Practices</p>
                <p className="text-sm text-muted-foreground">
                  Tips for accurate financial modeling
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <Button asChild>
              <Link href="/docs/tutorials">
                Watch Tutorials
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs/best-practices">
                Best Practices
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
