"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface EmailReportDialogProps {
  projectId: string
  reportType?: "monthly" | "annual"
}

export function EmailReportDialog({ projectId, reportType = "monthly" }: EmailReportDialogProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recipients, setRecipients] = useState<string[]>([""])

  const handleAddRecipient = () => {
    setRecipients([...recipients, ""])
  }

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index))
  }

  const handleRecipientChange = (index: number, value: string) => {
    const updated = [...recipients]
    updated[index] = value
    setRecipients(updated)
  }

  const handleSend = async () => {
    const validRecipients = recipients.filter((email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return email.trim() && emailRegex.test(email.trim())
    })

    if (validRecipients.length === 0) {
      toast({
        title: "No recipients",
        description: "Please add at least one valid email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/reports/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: validRecipients,
          reportType,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Report sent",
          description: `Sent to ${data.successful} recipient(s)`,
        })
        setIsOpen(false)
        setRecipients([""])
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to send report",
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
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="mr-2 h-4 w-4" />
          Email Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Email Report</DialogTitle>
          <DialogDescription>
            Send the {reportType} report to recipients via email
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Recipients</Label>
            {recipients.map((email, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="recipient@example.com"
                  value={email}
                  onChange={(e) => handleRecipientChange(index, e.target.value)}
                  disabled={isLoading}
                />
                {recipients.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveRecipient(index)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddRecipient}
              disabled={isLoading}
            >
              + Add Recipient
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
