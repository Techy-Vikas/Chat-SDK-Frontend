"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, MessageSquare, Trash2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

type ChatHistory = {
  id: string
  preview: string
  timestamp: Date
  messages: any[]
}

export default function ChatSidebar() {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    const history = JSON.parse(localStorage.getItem("chatHistory") || "[]")
    setChatHistory(history)
  }, [])

  const handleNewChat = () => {
    // Clear current chat and start a new one
    window.location.reload()
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleDeleteChat = (id: string) => {
    setSelectedChatId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteChat = () => {
    if (selectedChatId) {
      const updatedHistory = chatHistory.filter((chat) => chat.id !== selectedChatId)
      localStorage.setItem("chatHistory", JSON.stringify(updatedHistory))
      setChatHistory(updatedHistory)
      setIsDeleteDialogOpen(false)
      toast({
        title: "Chat deleted",
        description: "The chat has been removed from your history",
      })
    }
  }

  const loadChat = (chat: ChatHistory) => {
    // Implementation would depend on how you manage chat state
    toast({
      title: "Feature coming soon",
      description: "Loading previous chats will be available in the next update",
    })
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chat History</h2>
            <SidebarTrigger />
          </div>
          <Button variant="outline" className="w-full mt-2 justify-start" onClick={handleNewChat}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {chatHistory.length > 0 ? (
              chatHistory.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton onClick={() => loadChat(chat)} className="flex items-start">
                    <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="ml-2 overflow-hidden">
                      <p className="truncate">{chat.preview}</p>
                      <p className="text-xs text-muted-foreground">{new Date(chat.timestamp).toLocaleDateString()}</p>
                    </div>
                  </SidebarMenuButton>
                  <SidebarMenuAction onClick={() => handleDeleteChat(chat.id)}>
                    <Trash2 className="h-4 w-4" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-muted-foreground">No chat history yet</div>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-4">
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email || "User"}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this chat? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteChat}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
