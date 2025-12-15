import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Book, HelpCircle, Code, Video, FileText, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "Documentation | Fleet Cost Tracker",
  description: "Complete documentation for Fleet Cost Tracker",
}

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Everything you need to get started with Fleet Cost Tracker
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Getting Started
            </CardTitle>
            <CardDescription>
              Quick start guide to get you up and running
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/docs/getting-started">View Guide</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              FAQ
            </CardTitle>
            <CardDescription>
              Frequently asked questions and answers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/faq">View FAQ</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              API Documentation
            </CardTitle>
            <CardDescription>
              Complete API reference with examples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/api" target="_blank">
                View API Docs
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Troubleshooting
            </CardTitle>
            <CardDescription>
              Common issues and solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/troubleshooting">View Guide</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Tutorials
            </CardTitle>
            <CardDescription>
              Step-by-step video guides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/tutorials" target="_blank">
                Watch Videos
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Best Practices
            </CardTitle>
            <CardDescription>
              Tips and best practices for financial modeling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/best-practices">Read More</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>For Developers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/docs/api" className="text-primary hover:underline block">
                API Reference
              </Link>
              <Link href="/docs/api/authentication" className="text-primary hover:underline block">
                Authentication
              </Link>
              <Link href="/docs/api/webhooks" className="text-primary hover:underline block">
                Webhooks
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/docs/getting-started" className="text-primary hover:underline block">
                Getting Started
              </Link>
              <Link href="/docs/faq" className="text-primary hover:underline block">
                FAQ
              </Link>
              <Link href="/docs/troubleshooting" className="text-primary hover:underline block">
                Troubleshooting
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
