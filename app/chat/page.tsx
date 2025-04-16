"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import ChatSidebar from "@/components/chat-sidebar"
import ChatContent from "@/components/chat-content"

export default function ChatPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
   const token = localStorage.getItem("authToken")
   if (!token) {
     router.push("/")
     return
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <ChatSidebar />
        <ChatContent />
      </div>
    </SidebarProvider>
  )
}
