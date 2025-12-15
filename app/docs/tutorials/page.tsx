import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, ExternalLink, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Video Tutorials | Fleet Cost Tracker",
  description: "Step-by-step video tutorials for Fleet Cost Tracker",
}

const tutorials = [
  {
    title: "Getting Started in 5 Minutes",
    description: "Quick overview of the platform and basic features",
    duration: "5:00",
    category: "Basics",
    url: "#", // Replace with actual YouTube URL
  },
  {
    title: "Creating Your First Project",
    description: "Learn how to set up a project and add equipment",
    duration: "8:30",
    category: "Basics",
    url: "#",
  },
  {
    title: "Understanding Cost Calculations",
    description: "Deep dive into how costs are calculated and allocated",
    duration: "12:15",
    category: "Advanced",
    url: "#",
  },
  {
    title: "Team Management & Sharing",
    description: "How to invite team members and manage permissions",
    duration: "7:20",
    category: "Basics",
    url: "#",
  },
  {
    title: "Generating Reports",
    description: "Create and export financial reports",
    duration: "10:45",
    category: "Basics",
    url: "#",
  },
  {
    title: "Scenario Analysis",
    description: "Compare different cost scenarios and projections",
    duration: "15:30",
    category: "Advanced",
    url: "#",
  },
  {
    title: "Mobile App Usage",
    description: "Using Fleet Cost Tracker on mobile devices",
    duration: "6:10",
    category: "Basics",
    url: "#",
  },
  {
    title: "API Integration",
    description: "How to use the API for programmatic access",
    duration: "20:00",
    category: "Advanced",
    url: "#",
  },
]

export default function TutorialsPage() {
  const basics = tutorials.filter((t) => t.category === "Basics")
  const advanced = tutorials.filter((t) => t.category === "Advanced")

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Video Tutorials</h1>
        <p className="text-lg text-muted-foreground">
          Step-by-step video guides to help you master Fleet Cost Tracker
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Basics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {basics.map((tutorial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <Play className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {tutorial.duration}
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <a href={tutorial.url} target="_blank" rel="noopener noreferrer">
                          Watch
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Advanced</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advanced.map((tutorial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <Play className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {tutorial.duration}
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <a href={tutorial.url} target="_blank" rel="noopener noreferrer">
                          Watch
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <a href="/docs/getting-started">Getting Started</a>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <a href="/docs/faq">FAQ</a>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <a href="/docs/api">API Docs</a>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <a href="/docs/troubleshooting">Troubleshooting</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscribe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe to our YouTube channel for new tutorials and updates.
              </p>
              <Button asChild className="w-full">
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Subscribe on YouTube
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
