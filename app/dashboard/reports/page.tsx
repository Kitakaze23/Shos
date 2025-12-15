import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, TrendingUp, Calendar, BarChart3 } from "lucide-react"

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Access reports from your projects
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Reports</CardTitle>
          <CardDescription>
            Select a project to view its reports and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Navigate to a project and click "View Reports" to access:
          </p>
          <div className="grid gap-4 mt-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Monthly Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Current month breakdown and trends
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Annual Forecast</h3>
                <p className="text-sm text-muted-foreground">
                  12-month projection and analysis
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Depreciation Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  Equipment depreciation tracking
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Scenario Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Compare what-if scenarios
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button asChild>
              <Link href="/dashboard/projects">View Projects</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
