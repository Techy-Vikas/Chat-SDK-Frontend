"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { uploadAudioForTranscription } from "@/lib/audio-upload"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)

  // Audio recorder hook
  const {
    recordingState,
    startRecording,
    stopRecording,
    error: recordingError,
    isRecordingSupported
  } = useAudioRecorder()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle recording errors
  useEffect(() => {
    if (recordingError) {
      toast({
        title: "Recording Error",
        description: recordingError,
        variant: "destructive",
      })
    }
  }, [recordingError, toast])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Handle audio recording
  const handleToggleRecording = async () => {
    if (recordingState === "recording") {
      // Stop recording
      setIsTranscribing(true)
      try {
        const audioBlob = await stopRecording()
        if (audioBlob) {
          // Upload the audio for transcription
          const transcribedText = await uploadAudioForTranscription(audioBlob)
          setInput(transcribedText)

          toast({
            title: "Audio transcribed",
            description: "You can now edit the text before sending.",
          })
        }
      } catch (error) {
        console.error("Error processing audio:", error)
        toast({
          title: "Transcription failed",
          description: error instanceof Error ? error.message : "Failed to transcribe audio",
          variant: "destructive",
        })
      } finally {
        setIsTranscribing(false)
      }
    } else {
      // Start recording
      try {
        await startRecording()
        toast({
          title: "Recording started",
          description: "Speak now. Click the microphone button again to stop recording.",
        })
      } catch (error) {
        console.error("Error starting recording:", error)
        toast({
          title: "Recording failed",
          description: "Could not start recording. Please check microphone permissions.",
          variant: "destructive",
        })
      }
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("https://chat-sdk-backend.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          message: input,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response || "I'm not sure how to respond to that.",
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        // Save to chat history
        const history = JSON.parse(localStorage.getItem("chatHistory") || "[]")
        history.push({
          id: Date.now().toString(),
          messages: [...messages, userMessage, assistantMessage],
          preview: input.substring(0, 30) + (input.length > 30 ? "..." : ""),
          timestamp: new Date(),
        })
        localStorage.setItem("chatHistory", JSON.stringify(history))
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to get a response",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Chat Messages */}
      <Card className="flex-1 mb-4 border shadow-sm">
        <CardContent className="p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
              <h3 className="text-lg font-medium mb-2">Your story awaits</h3>
              <p className="max-w-md">Ask me anything and let's begin a new chapter together.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-start gap-3 max-w-[85%]">
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user" ? "bg-primary/10 text-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-foreground/30 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-foreground/30 animate-pulse delay-150"></div>
                        <div className="w-2 h-2 rounded-full bg-foreground/30 animate-pulse delay-300"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Input Area */}
      <div className="w-full">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading || recordingState === "recording"}
            className="flex-1"
          />
          {isRecordingSupported && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isLoading || isTranscribing}
              onClick={handleToggleRecording}
              className={recordingState === "recording" ? "bg-red-500 text-white hover:bg-red-600" : ""}
            >
              {recordingState === "recording" ? (
                <MicOff className="h-4 w-4" />
              ) : isTranscribing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button type="submit" disabled={isLoading || !input.trim() || recordingState === "recording"}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
