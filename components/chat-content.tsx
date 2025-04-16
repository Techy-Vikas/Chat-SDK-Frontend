"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSidebar } from "@/components/ui/sidebar"
import ThemeToggle from "@/components/theme-toggle"
import ChatInterface from "@/components/chat-interface"

export default function ChatContent() {
  const router = useRouter()
  const { toggleSidebar, isMobile } = useSidebar()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center">
            <div className="relative w-8 h-8 mr-2 overflow-hidden rounded-full">
              <Image src="/logo.png" alt="The story isn't over" fill className="object-cover" />
            </div>
            <h1 className="text-xl font-semibold">The story isn't over</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Description Section */}
        <div className="px-6 py-10 md:py-16 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Continue Your Journey</h2>
          <p className="text-muted-foreground mb-6">
            Every conversation is a new chapter in your story. Our AI assistant is here to help you explore ideas, find
            solutions, and create meaningful narratives. What would you like to discover today?
          </p>
          <div className="flex justify-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => document.getElementById("chat-input")?.focus()}>
              Start a conversation
            </Button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          <ChatInterface />
        </div>

        {/* Footer */}
        <footer className="p-6 text-center border-t">
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            "The end of one story is just the beginning of another. Your journey continues with every word you share."
          </p>
        </footer>
      </div>
    </div>
  )
}
