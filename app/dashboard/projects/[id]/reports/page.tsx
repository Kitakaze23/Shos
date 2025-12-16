"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FileText, TrendingUp, Calendar, BarChart3, Download } from "lucide-react"
import { MonthlySummaryReport } from "@/components/reports/monthly-summary"
import { AnnualForecastReport } from "@/components/reports/annual-forecast"
import { DepreciationScheduleReport } from "@/components/reports/depreciation-schedule"
import { ScenarioAnalysisReport } from "@/components/reports/scenario-analysis"

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  const params = useParams()
  const { toast } = useToast()
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load project",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [params.id, toast])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analysis</h1>
        <p className="text-muted-foreground">
          Generate detailed financial reports and forecasts
        </p>
      </div>

      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">
            <FileText className="mr-2 h-4 w-4" />
            Monthly Summary
          </TabsTrigger>
          <TabsTrigger value="annual">
            <Calendar className="mr-2 h-4 w-4" />
            Annual Forecast
          </TabsTrigger>
          <TabsTrigger value="depreciation">
            <TrendingUp className="mr-2 h-4 w-4" />
            Depreciation
          </TabsTrigger>
          <TabsTrigger value="scenarios">
            <BarChart3 className="mr-2 h-4 w-4" />
            Scenarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <MonthlySummaryReport projectId={params.id as string} currency={project.currency} />
        </TabsContent>

        <TabsContent value="annual" className="space-y-4">
          <AnnualForecastReport projectId={params.id as string} currency={project.currency} />
        </TabsContent>

        <TabsContent value="depreciation" className="space-y-4">
          <DepreciationScheduleReport projectId={params.id as string} currency={project.currency} />
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <ScenarioAnalysisReport projectId={params.id as string} currency={project.currency} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
