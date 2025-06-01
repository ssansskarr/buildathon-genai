"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Send, Plus, Menu, Sparkles, User, MoreHorizontal, Copy, ThumbsUp, ThumbsDown, Trash2, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatHistory, setChatHistory] = useState([
    {
      id: "1",
      title: "LLM Cost Comparison Analysis",
      time: "2h",
      preview: "Compare costs between GPT-4 and Claude...",
    },
    { id: "2", title: "ROI Calculator for AI Agents", time: "1d", preview: "Calculate implementation costs for..." },
    { id: "3", title: "Agent Architecture Optimization", time: "2d", preview: "How to reduce credit consumption..." },
    { id: "4", title: "Enterprise AI Budget Planning", time: "1w", preview: "What's the total cost of ownership..." },
    { id: "5", title: "Cost-Effective Model Selection", time: "2w", preview: "Which model should we use for..." },
  ])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleDeleteChat = (chatId) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
    setShowDeleteConfirm(null)
  }

  const handleClearCurrentChat = () => {
    setMessages([])
    setShowDeleteConfirm(null)
  }

  const handleNewChat = () => {
    setMessages([])
  }

  const suggestions = [
    "Help me calculate the ROI for implementing AI agents in customer service",
    "Compare the costs of different LLMs for our use case",
    "What are the best practices for reducing AI operational costs?",
    "How can I optimize my AI agent architecture to minimize costs?",
  ]

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#171717] border border-[#2a2a2a] rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Delete Chat</h3>
                <p className="text-sm text-gray-400">
                  {showDeleteConfirm === 'current' ? 'Clear current conversation?' : 'Delete this conversation?'}
                </p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              {showDeleteConfirm === 'current' 
                ? 'This will clear all messages in the current conversation. This action cannot be undone.'
                : 'This conversation will be permanently deleted. This action cannot be undone.'
              }
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 border-[#2a2a2a] bg-transparent hover:bg-[#2a2a2a] text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (showDeleteConfirm === 'current') {
                    handleClearCurrentChat()
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
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 overflow-hidden bg-[#171717] border-r border-[#2a2a2a]`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-[#2a2a2a]">
            <Button 
              onClick={handleNewChat}
              className="w-full justify-start gap-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border-none rounded-lg h-11 font-medium transition-all"
            >
              <Plus className="h-4 w-4" />
              New analysis
            </Button>
          </div>

          {/* Chat History */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="group relative p-3 rounded-lg hover:bg-[#2a2a2a] cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate mb-1">{chat.title}</p>
                      <p className="text-xs text-gray-400 truncate">{chat.preview}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-xs text-gray-500">{chat.time}</span>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowDeleteConfirm(chat.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#2a2a2a]">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2a2a2a] cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">AI Cost Optimizer</p>
                <p className="text-xs text-gray-400">Enterprise plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a] bg-[#0f0f0f]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white hover:bg-[#2a2a2a] h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium text-white">AI Cost Optimizer</span>
            </div>
          </div>
          
          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm('current')}
              className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 h-8 px-3 transition-all"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto px-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-semibold text-white mb-2">How can I help optimize your AI costs?</h1>
                  <p className="text-gray-400 text-center mb-8 max-w-md">
                    I'm your AI Cost Optimization Advisor. Ask me about LLM selection, ROI calculations, cost reduction strategies, and agent architecture optimization.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleInputChange({ target: { value: suggestion } })}
                        className="p-4 text-left bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-xl transition-all hover:border-[#3a3a3a] group"
                      >
                        <p className="text-sm text-gray-300 group-hover:text-white">{suggestion}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className="group">
                      <div className="flex gap-4">
                        <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                          <AvatarFallback
                            className={`${
                              message.role === "assistant"
                                ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                                : "bg-[#2a2a2a]"
                            }`}
                          >
                            {message.role === "assistant" ? (
                              <Sparkles className="h-4 w-4 text-white" />
                            ) : (
                              <User className="h-4 w-4 text-gray-300" />
                            )}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-white">
                              {message.role === "assistant" ? "AI Cost Optimizer" : "You"}
                            </span>
                          </div>

                          <div className="prose prose-invert max-w-none">
                            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </div>

                          {message.role === "assistant" && (
                            <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(message.content)}
                                className="h-7 px-2 text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="group">
                      <div className="flex gap-4">
                        <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-emerald-600">
                            <Sparkles className="h-4 w-4 text-white" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-white">AI Cost Optimizer</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              <div
                                className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-400">Analyzing costs...</span>
                          </div>
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
        <div className="border-t border-[#2a2a2a] bg-[#0f0f0f] p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about AI costs, LLM selection, ROI calculations..."
                className="w-full bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-400 pr-12 py-3 text-base rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 rounded-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              AI Cost Optimizer can make mistakes. Please verify important cost calculations.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}