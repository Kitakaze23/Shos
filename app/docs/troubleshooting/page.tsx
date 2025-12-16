import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, XCircle, Info } from "lucide-react"

export const metadata: Metadata = {
  title: "Troubleshooting | Fleet Cost Tracker",
  description: "Common issues and solutions for Fleet Cost Tracker",
}

const issues = [
  {
    category: "Authentication",
    problems: [
      {
        issue: "Can't log in",
        solutions: [
          "Check that your email and password are correct",
          "Make sure Caps Lock is off",
          "Try resetting your password",
          "Check if your account is scheduled for deletion",
          "Clear browser cache and cookies",
        ],
        severity: "error",
      },
      {
        issue: "Email verification not received",
        solutions: [
          "Check your spam/junk folder",
          "Wait a few minutes (emails can be delayed)",
          "Request a new verification email",
          "Check that the email address is correct",
        ],
        severity: "warning",
      },
      {
        issue: "Two-factor authentication not working",
        solutions: [
          "Make sure your device time is synchronized",
          "Check that you're using the correct authenticator app",
          "Try generating a new QR code",
          "Use backup codes if available",
        ],
        severity: "warning",
      },
    ],
  },
  {
    category: "Projects & Data",
    problems: [
      {
        issue: "Project not loading",
        solutions: [
          "Refresh the page",
          "Check your internet connection",
          "Try logging out and back in",
          "Clear browser cache",
          "Check if you have access to the project",
        ],
        severity: "error",
      },
      {
        issue: "Calculations seem incorrect",
        solutions: [
          "Verify all input values are correct",
          "Check that operating parameters are set",
          "Ensure equipment service life is accurate",
          "Review cost allocation method settings",
          "Contact support if issue persists",
        ],
        severity: "warning",
      },
      {
        issue: "Can't add equipment",
        solutions: [
          "Check that you have edit permissions",
          "Verify all required fields are filled",
          "Ensure purchase price is a valid number",
          "Check that service life is greater than 0",
        ],
        severity: "warning",
      },
    ],
  },
  {
    category: "Reports & Export",
    problems: [
      {
        issue: "Report not generating",
        solutions: [
          "Wait a few seconds (reports can take time)",
          "Check that project has equipment and parameters",
          "Try refreshing the page",
          "Generate a different report type",
        ],
        severity: "error",
      },
      {
        issue: "Export failed",
        solutions: [
          "Check your internet connection",
          "Try a different export format",
          "Ensure you have sufficient storage",
          "Try again in a few minutes",
        ],
        severity: "warning",
      },
      {
        issue: "Charts not displaying",
        solutions: [
          "Check browser console for errors",
          "Try a different browser",
          "Disable browser extensions",
          "Clear browser cache",
        ],
        severity: "info",
      },
    ],
  },
  {
    category: "Performance",
    problems: [
      {
        issue: "Slow page loading",
        solutions: [
          "Check your internet connection",
          "Close unnecessary browser tabs",
          "Clear browser cache",
          "Try a different browser",
          "Disable browser extensions",
        ],
        severity: "info",
      },
      {
        issue: "App freezing or crashing",
        solutions: [
          "Refresh the page",
          "Clear browser cache and cookies",
          "Update your browser to latest version",
          "Disable browser extensions",
          "Try incognito/private mode",
        ],
        severity: "error",
      },
    ],
  },
  {
    category: "Mobile",
    problems: [
      {
        issue: "Layout looks broken on mobile",
        solutions: [
          "Rotate device to portrait mode",
          "Update your mobile browser",
          "Clear browser cache",
          "Try a different browser",
        ],
        severity: "info",
      },
      {
        issue: "Touch interactions not working",
        solutions: [
          "Ensure you're tapping large enough areas",
          "Try zooming out",
          "Update your mobile browser",
          "Restart the app",
        ],
        severity: "warning",
      },
    ],
  },
]

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "error":
      return <XCircle className="h-5 w-5 text-destructive" />
    case "warning":
      return <AlertCircle className="h-5 w-5 text-yellow-600" />
    case "info":
      return <Info className="h-5 w-5 text-blue-600" />
    default:
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
  }
}

export default function TroubleshootingPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Troubleshooting Guide</h1>
        <p className="text-lg text-muted-foreground">
          Common issues and their solutions
        </p>
      </div>

      <Alert className="mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Before You Start</AlertTitle>
        <AlertDescription>
          Try these quick fixes first: refresh the page, clear browser cache, check your internet connection, and ensure you&apos;re using the latest browser version.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {issues.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle>{category.category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.problems.map((problem, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {getSeverityIcon(problem.severity)}
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{problem.issue}</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {problem.solutions.map((solution, solIndex) => (
                          <li key={solIndex}>{solution}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
          <CardDescription>
            If you&apos;ve tried the solutions above and still have issues, we&apos;re here to help.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Contact Support</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Email:{" "}
              <a href="mailto:support@yourdomain.com" className="text-primary hover:underline">
                support@yourdomain.com
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              Response time: Usually within 24 hours
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Additional Resources</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <a href="/docs/getting-started" className="text-primary hover:underline">
                  Getting Started Guide
                </a>
              </li>
              <li>
                <a href="/docs/faq" className="text-primary hover:underline">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/docs/api" className="text-primary hover:underline">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
