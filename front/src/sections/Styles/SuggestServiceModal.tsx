import type React from "react"

import { useState } from "react"
import { X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface SuggestServiceModalProps {
  isOpen: boolean
  onClose: () => void
}

function SuggestServiceModal({ isOpen, onClose }: SuggestServiceModalProps) {
  const [suggestionType, setSuggestionType] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle")

  if (!isOpen) return null

  const suggestionOptions = [
    "New Service Idea",
    "Improve Existing Service",
    "Partnership Inquiry",
    "General Feedback",
    "Other",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmissionStatus("idle")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("Suggestion Submitted:", { suggestionType, message })
      setSubmissionStatus("success")
      // Optionally clear form after success, or keep it for user to see
      setSuggestionType("")
      setMessage("")
    } catch (error) {
      console.error("Failed to submit suggestion:", error)
      setSubmissionStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setSubmissionStatus("idle") // Reset status when closing
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-none">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-medium text-gray-700">Suggest a New Service</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <CardDescription className="text-gray-600">
            Have an idea for a service you'd like to see on our platform? Let us know!
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
          <CardContent className="flex-grow overflow-y-auto py-4 space-y-6">
            <div>
              <Label htmlFor="suggestionType" className="mb-2 block text-gray-700 font-medium">
                What kind of suggestion do you have?
              </Label>
              <Select value={suggestionType} onValueChange={setSuggestionType} disabled={isSubmitting}>
                <SelectTrigger
                  id="suggestionType"
                  className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                >
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {suggestionOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message" className="mb-2 block text-gray-700 font-medium">
                Your Suggestion
              </Label>
              <Textarea
                id="message"
                placeholder="Tell us more about your suggestion..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
                disabled={isSubmitting}
                className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-y"
              />
            </div>

            {submissionStatus === "success" && (
              <div className="text-green-600 text-center font-medium mt-4">
                Suggestion submitted successfully! Thank you.
              </div>
            )}
            {submissionStatus === "error" && (
              <div className="text-red-600 text-center font-medium mt-4">
                Failed to submit suggestion. Please try again.
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-4 flex justify-end gap-3 bg-gray-50 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleCloseModal}
              variant="outline"
              className="px-6 py-2 text-gray-700 border-gray-300 hover:bg-gray-100 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={isSubmitting || !suggestionType || !message.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">◌</span> Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit Suggestion
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default SuggestServiceModal