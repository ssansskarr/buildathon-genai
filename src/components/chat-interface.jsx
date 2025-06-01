"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Plus, Menu, Sparkles, User, Copy, Trash2, Check, Home, Zap, Settings, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from "next/link"
import TypeWriter from "@/components/type-writer"
import { ThemeToggle } from "@/components/ui/theme-toggle"

// Custom hook for chat functionality
const useFlaskChat = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [controller, setController] = useState(null)
  const [isInterruptible, setIsInterruptible] = useState(false)

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message to the chat
    const userMessage = { id: Date.now().toString(), role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Create an AbortController to allow cancelling the request
      const abortController = new AbortController()
      setController(abortController)
      setIsInterruptible(true)

      // Call Flask backend API
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
        signal: abortController.signal
      })

      const data = await response.json()
      
      if (response.ok) {
        // Add AI response to the chat
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: data.response }
        ])
      } else {
        console.error("Error from backend:", data.error)
        // Add error message
        setMessages((prev) => [
          ...prev,
          { 
            id: (Date.now() + 1).toString(), 
            role: "assistant", 
            content: `Sorry, I encountered an error: ${data.error || "Unknown error"}` 
          }
        ])
      }
    } catch (error) {
      // Don't show error message if the request was aborted intentionally
      if (error.name === 'AbortError') {
        console.log('Request was aborted')
      } else {
        console.error("Failed to fetch from Flask backend:", error)
        // Add error message
        setMessages((prev) => [
          ...prev,
          { 
            id: (Date.now() + 1).toString(), 
            role: "assistant", 
            content: "Sorry, I couldn't connect to the backend service. Please check if the Flask server is running." 
          }
        ])
      }
    } finally {
      setIsLoading(false)
      setController(null)
      setIsInterruptible(false)
    }
  }

  const interruptResponse = () => {
    if (controller) {
      controller.abort()
      setIsLoading(false)
      setController(null)
      setIsInterruptible(false)
    }
  }

  return {
    messages,
    input,
    isLoading,
    isInterruptible,
    handleInputChange,
    handleSubmit,
    interruptResponse,
    setMessages
  }
}

export default function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatHistory, setChatHistory] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [copiedMsgId, setCopiedMsgId] = useState(null)
  const [animateNewMessage, setAnimateNewMessage] = useState(false)
  const [currentChatId, setCurrentChatId] = useState(null)
  const [sidebarWidth, setSidebarWidth] = useState(288) // Default width (72 * 4 = 288px)
  const [isResizing, setIsResizing] = useState(false)
  const [textDisplayMode, setTextDisplayMode] = useState('truncate') // 'truncate', 'wrap', or 'normal'
  const [isTyping, setIsTyping] = useState(false) // Track if the typewriter is currently typing
  const [interruptTyping, setInterruptTyping] = useState(false) // State to trigger interruption
  
  // Use our custom Flask chat hook instead of the AI SDK hook
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    isInterruptible,
    interruptResponse,
    setMessages 
  } = useFlaskChat()
  const messagesEndRef = useRef(null)
  const scrollAreaRef = useRef(null)
  const sidebarRef = useRef(null)

  // Load chat history and current chat ID from localStorage on mount
  useEffect(() => {
    const savedChatHistory = localStorage.getItem('chatHistory')
    if (savedChatHistory) {
      try {
        const parsedChatHistory = JSON.parse(savedChatHistory)
        setChatHistory(parsedChatHistory)
        
        // Get current chat ID
        const savedCurrentChatId = localStorage.getItem('currentChatId')
        if (savedCurrentChatId) {
          setCurrentChatId(savedCurrentChatId)
          
          // Load messages for current chat
          const currentChat = parsedChatHistory.find(chat => chat.id === savedCurrentChatId)
          if (currentChat && currentChat.messages) {
            setMessages(currentChat.messages)
          }
        } else {
          // Generate a new chat ID if none exists
          const newChatId = `chat_${Date.now()}`
          setCurrentChatId(newChatId)
          localStorage.setItem('currentChatId', newChatId)
        }
      } catch (error) {
        console.error('Failed to parse saved chat history:', error)
      }
    } else {
      // Generate a new chat ID if no history exists
      const newChatId = `chat_${Date.now()}`
      setCurrentChatId(newChatId)
      localStorage.setItem('currentChatId', newChatId)
    }
  }, [setMessages])

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory))
    }
  }, [chatHistory])

  // Update chat history when messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      const title = messages.find(m => m.role === 'user')?.content.slice(0, 30) + '...' || 'New Chat'
      const preview = lastMessage.content.slice(0, 40) + '...'
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      
      setChatHistory(prev => {
        const existingChatIndex = prev.findIndex(chat => chat.id === currentChatId)
        
        if (existingChatIndex >= 0) {
          // Update existing chat
          const updatedHistory = [...prev]
          updatedHistory[existingChatIndex] = {
            ...updatedHistory[existingChatIndex],
            title,
            preview,
            time,
            messages: [...messages]
          }
          return updatedHistory
        } else {
          // Add new chat
          return [...prev, {
            id: currentChatId,
            title,
            preview,
            time,
            messages: [...messages]
          }]
        }
      })
    }
  }, [messages, currentChatId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
    if (messages.length > 0) {
      setAnimateNewMessage(true)
      setTimeout(() => setAnimateNewMessage(false), 1000)
    }
  }, [messages])

  const handleDeleteChat = (chatId) => {
    // Stop event propagation to prevent chat selection
    
    // Remove the chat from history
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId)
    setChatHistory(updatedHistory)
    
    // If deleting the current chat, create a new one
    if (chatId === currentChatId) {
      handleNewChat()
    }
    
    // Also update localStorage
    if (updatedHistory.length === 0) {
      localStorage.removeItem('chatHistory')
    } else {
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory))
    }
    
    setShowDeleteConfirm(null)
  }

  const handleDeleteAllChats = () => {
    setChatHistory([])
    localStorage.removeItem('chatHistory')
    handleNewChat()
    setShowDeleteConfirm(null)
  }

  const handleClearCurrentChat = () => {
    setMessages([])
    
    // Update the chat history
    setChatHistory(prev => {
      const existingChatIndex = prev.findIndex(chat => chat.id === currentChatId)
      if (existingChatIndex >= 0) {
        const updatedHistory = [...prev]
        updatedHistory[existingChatIndex] = {
          ...updatedHistory[existingChatIndex],
          messages: []
        }
        return updatedHistory
      }
      return prev
    })
    
    setShowDeleteConfirm(null)
  }

  const handleNewChat = () => {
    // Save current chat to history if it has messages
    if (messages.length > 0) {
      // Already handled by the useEffect
    }
    
    // Create new chat ID
    const newChatId = `chat_${Date.now()}`
    setCurrentChatId(newChatId)
    localStorage.setItem('currentChatId', newChatId)
    
    // Clear messages
    setMessages([])
  }

  const handleLoadChat = (chatId) => {
    // Save current chat if needed
    if (messages.length > 0) {
      // Already handled by the useEffect
    }
    
    // Set current chat ID
    setCurrentChatId(chatId)
    localStorage.setItem('currentChatId', chatId)
    
    // Load messages
    const chat = chatHistory.find(c => c.id === chatId)
    if (chat && chat.messages) {
      setMessages(chat.messages)
    } else {
      setMessages([])
    }
  }

  const handleCopyText = (text, messageId) => {
    navigator.clipboard.writeText(text)
    setCopiedMsgId(messageId)
    setTimeout(() => setCopiedMsgId(null), 2000)
  }

  const suggestions = [
    {
      text: "How can I align our AI implementation with our business objectives?",
      icon: <Zap className="h-5 w-5 text-blue-400" />
    },
    {
      text: "Which LLM provides the best balance of cost and quality for our customer service chatbot?",
      icon: <Settings className="h-5 w-5 text-blue-400" />
    },
    {
      text: "Help me calculate the ROI for implementing AI in our business processes",
      icon: <Sparkles className="h-5 w-5 text-blue-400" />
    },
    {
      text: "What functions across our organization can benefit most from AI automation?",
      icon: <Zap className="h-5 w-5 text-blue-400" />
    },
  ]

  // Toggle sidebar with proper state management
  const toggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    // Store sidebar preference in localStorage
    localStorage.setItem('sidebarOpen', newState)
  }

  // Load sidebar preference and width on mount
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarOpen')
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === 'true')
    }
    
    const savedSidebarWidth = localStorage.getItem('sidebarWidth')
    if (savedSidebarWidth !== null) {
      setSidebarWidth(parseInt(savedSidebarWidth))
    }
  }, [])
  
  // Handle sidebar resizing
  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsResizing(true)
    document.body.style.cursor = 'ew-resize'
  }
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return
      
      const newWidth = Math.max(260, Math.min(e.clientX, 420))
      setSidebarWidth(newWidth)
      
      // Update text display mode based on sidebar width
      if (newWidth < 300) {
        setTextDisplayMode('wrap')
      } else if (newWidth < 350) {
        setTextDisplayMode('truncate')
      } else {
        setTextDisplayMode('normal')
      }
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      localStorage.setItem('sidebarWidth', sidebarWidth.toString())
    }
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }
  }, [isResizing, sidebarWidth])
  
  // Set initial text display mode based on sidebar width
  useEffect(() => {
    if (sidebarWidth < 300) {
      setTextDisplayMode('wrap')
    } else if (sidebarWidth < 350) {
      setTextDisplayMode('truncate')
    } else {
      setTextDisplayMode('normal')
    }
  }, [])

  // Handle typewriter completion
  const handleTypewriterComplete = (wasInterrupted) => {
    setIsTyping(false)
    setInterruptTyping(false)
    
    // If it was interrupted, we don't need to do anything special
    // The typewriter component will have preserved the text displayed so far
  }
  
  // Handle interrupt button click
  const handleInterrupt = () => {
    // Interrupt the backend request if it's still in progress
    if (isInterruptible) {
      interruptResponse()
    }
    
    // Interrupt the typewriter animation
    setInterruptTyping(true)
  }
  
  // Set isTyping to true when a new AI message is added
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      setIsTyping(true)
    }
  }, [messages.length])

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiMzMDgyZWQiIHN0cm9rZS13aWR0aD0iMC4yIiBvcGFjaXR5PSIwLjAzIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-blue-900/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-blue-900/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl shadow-blue-900/10 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Delete Chat</h3>
                <p className="text-sm text-muted-foreground">
                  {showDeleteConfirm === 'current' ? 'Clear current conversation?' : 
                   showDeleteConfirm === 'all' ? 'Delete all conversations?' : 'Delete this conversation?'}
                </p>
              </div>
            </div>
            <p className="text-foreground mb-6">
              {showDeleteConfirm === 'current' 
                ? 'This will clear all messages in the current conversation. This action cannot be undone.'
                : showDeleteConfirm === 'all'
                ? 'All your conversations will be permanently deleted. This action cannot be undone.'
                : 'This conversation will be permanently deleted. This action cannot be undone.'
              }
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 border-border bg-transparent hover:bg-secondary text-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (showDeleteConfirm === 'current') {
                    handleClearCurrentChat()
                  } else if (showDeleteConfirm === 'all') {
                    handleDeleteAllChats()
                  } else {
                    handleDeleteChat(showDeleteConfirm)
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        style={{ width: sidebarOpen ? `${sidebarWidth}px` : '0px' }}
        className={`relative flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden bg-card backdrop-blur-md border-r border-border shadow-xl z-20 ${isResizing ? 'transition-none' : ''}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-10">
            <Button 
              onClick={handleNewChat}
              className="w-full justify-start gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white border-none rounded-lg h-11 font-medium transition-all shadow-lg shadow-blue-900/20"
            >
              <Plus className="h-4 w-4" />
              New chat
            </Button>
          </div>

          {/* Chat History */}
          <ScrollArea className="flex-1 p-2 overflow-y-auto">
            <div className="space-y-1">
              {chatHistory.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                  </div>
                  No chat history yet
                  <p className="text-xs text-muted-foreground mt-2">Your conversations will appear here</p>
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group relative p-3 rounded-lg hover:bg-secondary cursor-pointer transition-all ${chat.id === currentChatId ? 'bg-secondary/70 border-l-2 border-primary' : ''}`}
                    onClick={() => handleLoadChat(chat.id)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center pr-6 relative">
                          <p className={`text-sm font-medium text-foreground ${
                            textDisplayMode === 'wrap' 
                              ? 'break-words' 
                              : textDisplayMode === 'truncate' 
                                ? 'truncate' 
                                : ''
                          }`}>
                            {chat.title || "New Chat"}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(chat.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400 transition-all rounded-full absolute right-0 top-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className={`text-xs text-muted-foreground ${
                          textDisplayMode === 'wrap' 
                            ? 'break-words' 
                            : textDisplayMode === 'truncate' 
                              ? 'truncate' 
                              : ''
                        }`}>
                          {chat.preview || "No messages yet"}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">{chat.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border bg-card/90 backdrop-blur-md sticky bottom-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary cursor-pointer overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className={`text-sm font-medium ${
                    textDisplayMode === 'wrap' 
                      ? 'break-words' 
                      : textDisplayMode === 'truncate' 
                        ? 'truncate' 
                        : ''
                  }`}>AIlign</p>
                  <p className={`text-xs text-muted-foreground ${
                    textDisplayMode === 'wrap' 
                      ? 'break-words' 
                      : textDisplayMode === 'truncate' 
                        ? 'truncate' 
                        : ''
                  }`}>AI Investment Advisor</p>
                </div>
              </div>
              {chatHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm('all')}
                  className="h-9 px-3 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Resize Handle */}
        {sidebarOpen && (
          <div
            className="absolute top-0 right-0 w-4 h-full cursor-ew-resize hover:bg-primary/20 group z-30"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute top-1/2 right-1 h-20 w-1 -translate-y-1/2 bg-secondary/70 group-hover:bg-primary transition-colors rounded-full"></div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-card/90 backdrop-blur-md z-10 border-b border-border sticky top-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium text-foreground">AIlign Advisor</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-blue-400 hover:bg-secondary h-8 px-3 transition-all flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
            </Link>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm('current')}
                className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 h-8 px-3 transition-all"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="max-w-3xl mx-auto px-4 py-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20 animate-pulse">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-semibold text-foreground mb-2">How can I help align your AI investments?</h1>
                  <p className="text-muted-foreground text-center mb-8 max-w-md">
                    I'm your AIlign Advisor. I can help identify which tasks to automate, recommend optimal LLMs, calculate ROI, analyze costs, and provide AI architecture guidance for your business needs.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleInputChange({ target: { value: suggestion.text } })}
                        className="p-4 text-left bg-secondary/60 hover:bg-secondary border border-border rounded-xl transition-all hover:border-blue-500/30 group hover:shadow-lg hover:shadow-blue-900/10 backdrop-blur-sm"
                        style={{
                          animationDelay: `${index * 100}ms`,
                        }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {suggestion.icon}
                          <div className="h-px flex-1 bg-gradient-to-r from-blue-500/20 to-transparent"></div>
                        </div>
                        <p className="text-sm text-muted-foreground group-hover:text-foreground">{suggestion.text}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message, idx) => (
                    <div 
                      key={message.id} 
                      className={`${idx === messages.length - 1 && animateNewMessage ? 'animate-slide-up' : ''}`}
                    >
                      {message.role === "user" ? (
                        <div className="flex justify-end mb-2">
                          <div className="max-w-[85%] px-4 py-2 bg-secondary/50 rounded-t-2xl rounded-bl-2xl text-foreground">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center mb-1 justify-between">
                              <span className="text-sm font-medium text-foreground">AIlign</span>
                              {idx === messages.length - 1 && isTyping && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleInterrupt}
                                  className="h-7 px-3 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all rounded-full"
                                >
                                  <span className="text-xs mr-1">Stop generating</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square">
                                    <rect width="18" height="18" x="3" y="3" rx="2" />
                                  </svg>
                                </Button>
                              )}
                            </div>
                            <div className="markdown-content text-foreground leading-relaxed">
                              {idx === messages.length - 1 ? (
                                <TypeWriter 
                                  text={message.content} 
                                  speed={10} 
                                  isInterrupted={interruptTyping}
                                  onComplete={handleTypewriterComplete}
                                />
                              ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                                </ReactMarkdown>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyText(message.content, message.id)}
                                className="h-7 px-3 text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all rounded-full"
                              >
                                {copiedMsgId === message.id ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1 text-blue-400" />
                                    <span className="text-blue-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-start gap-3 animate-slide-up">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium text-foreground">AIlign</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                          <span className="text-sm text-muted-foreground">Analyzing your request...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="bg-card/70 backdrop-blur-md p-4 z-10">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about AI investment alignment, LLM selection, ROI, business impact..."
                className="w-full bg-secondary/50 border-border text-foreground placeholder-muted-foreground pr-14 py-5 text-base rounded-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-lg"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 p-0 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 rounded-full shadow-lg shadow-blue-900/20 transition-all"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      <style jsx global>{`
        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
          line-height: 1.25;
          background: linear-gradient(to right, #3b82f6, #1d4ed8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .markdown-content h1 {
          font-size: 1.5rem;
        }
        
        .markdown-content h2 {
          font-size: 1.25rem;
        }
        
        .markdown-content h3 {
          font-size: 1.125rem;
        }
        
        .markdown-content p {
          margin-bottom: 1rem;
        }
        
        .markdown-content ul, .markdown-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .markdown-content li {
          margin-bottom: 0.25rem;
          position: relative;
        }
        
        .markdown-content ul li::before {
          content: "";
          position: absolute;
          left: -1rem;
          top: 0.5rem;
          width: 0.375rem;
          height: 0.375rem;
          background-color: #3b82f6;
          border-radius: 50%;
        }
        
        .markdown-content a {
          color: #3b82f6;
          text-decoration: underline;
          transition: all 0.2s;
        }
        
        .markdown-content a:hover {
          color: #2563eb;
        }
        
        .markdown-content blockquote {
          border-left: 3px solid #3b82f6;
          padding-left: 1rem;
          margin: 1rem 0;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 0.25rem;
          padding: 0.5rem 1rem;
        }
        
        .dark .markdown-content blockquote {
          color: #d1d5db;
        }
        
        .markdown-content pre {
          background-color: hsl(var(--secondary));
          padding: 1rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 1rem 0;
          border: 1px solid hsl(var(--border));
        }
        
        .markdown-content code {
          background-color: hsl(var(--secondary));
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          border: 1px solid hsl(var(--border));
        }
        
        .markdown-content pre code {
          background-color: transparent;
          padding: 0;
          border: none;
        }
        
        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .markdown-content th {
          background-color: rgba(59, 130, 246, 0.1);
          font-weight: 600;
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid hsl(var(--border));
        }
        
        .markdown-content td {
          padding: 0.75rem;
          border-bottom: 1px solid hsl(var(--border));
        }
        
        .markdown-content tr:last-child td {
          border-bottom: none;
        }
        
        .markdown-content tr:nth-child(even) {
          background-color: rgba(255, 255, 255, 0.02);
        }
        
        .dark .markdown-content tr:nth-child(even) {
          background-color: rgba(255, 255, 255, 0.02);
        }
        
        .light .markdown-content tr:nth-child(even) {
          background-color: rgba(0, 0, 0, 0.02);
        }
        
        .markdown-content strong {
          font-weight: 600;
        }
        
        .dark .markdown-content strong {
          color: #f3f4f6;
        }
        
        .markdown-content em {
          font-style: italic;
        }
        
        .dark .markdown-content em {
          color: #d1d5db;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}