"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Plus, Menu, Sparkles, User, Copy, Trash2, Check, Home, Zap, Settings, Loader2, Download, FileDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from "next/link"
import TypeWriter from "@/components/type-writer"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { jsPDF } from "jspdf"
import 'jspdf-autotable'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Custom hook for chat functionality
const useFlaskChat = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [controller, setController] = useState(null)
  const [isInterruptible, setIsInterruptible] = useState(false)
  const [processingStage, setProcessingStage] = useState(0) // 0: none, 1: reading query, 2: analyzing knowledge base, 3: generating response
  const [lastNewMessageId, setLastNewMessageId] = useState(null)
  const [userQuery, setUserQuery] = useState("") // Store the user's query for display

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Store the user's query
    const queryText = input.trim()
    setUserQuery(queryText)

    // Add user message to the chat
    const userMessage = { id: Date.now().toString(), role: "user", content: queryText }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setProcessingStage(1) // Reading query stage

    try {
      // Wait 1 second for the first stage (reduced from 2)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Move to analyzing knowledge base stage
      setProcessingStage(2);
      
      // Create an AbortController to allow cancelling the request
      const abortController = new AbortController();
      setController(abortController);
      setIsInterruptible(true);

      // Wait 1 second for the second stage (reduced from 4)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Move to generating response stage
      setProcessingStage(3);

      // Wait 1 second for the third stage (reduced from 6)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Determine which API endpoint to use
      const apiEndpoint = "https://buildathon-genai.onrender.com/api/chat"
      console.log("Attempting to fetch from:", apiEndpoint)

      try {
        // Prepare request payload
        const payload = {
          messages: [...messages, userMessage]
        }
        console.log("Sending payload:", JSON.stringify(payload))
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Request timed out after 20 seconds")), 20000);
        });
        
        // Race the fetch against the timeout
        const response = await Promise.race([
          fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(payload),
            signal: abortController.signal,
            mode: "cors"
          }),
          timeoutPromise
        ]);
        
        console.log("Response received:", response.status, response.statusText)
        
        // Read response as text first
        const textResponse = await response.text()
        console.log("Raw response text:", textResponse)
        
        // Try to parse the text as JSON
        let data
        try {
          data = JSON.parse(textResponse)
          console.log("Parsed data:", data)
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError)
          throw new Error(`Failed to parse response: ${parseError.message}`)
        }
      
      if (response.ok) {
          // Generate a unique ID for the new message
          const newMessageId = Date.now() + 1
          
        // Add AI response to the chat
        setMessages((prev) => [
          ...prev,
            { 
              id: newMessageId.toString(), 
              role: "assistant", 
              content: data.response || data.text || "No response received" 
            }
          ])
          
          // Set the last new message ID to trigger typewriter effect
          setLastNewMessageId(newMessageId.toString())
      } else {
          console.error("Error from backend:", data.error || response.statusText)
        // Add error message
        setMessages((prev) => [
          ...prev,
          { 
            id: (Date.now() + 1).toString(), 
            role: "assistant", 
              content: `Sorry, I encountered an error: ${data.error || response.statusText || "Unknown error"}` 
            }
          ])
        }
      } catch (fetchError) {
        console.error("Error in fetch operation:", fetchError)
        console.error("Error details:", JSON.stringify(fetchError, Object.getOwnPropertyNames(fetchError)))
        
        // Add error message for fetch error
        setMessages((prev) => [
          ...prev,
          { 
            id: (Date.now() + 1).toString(), 
            role: "assistant", 
            content: `Network error: ${fetchError.message}. Please check your connection or try again later.` 
          }
        ])
      }
    } catch (error) {
      // Don't show error message if the request was aborted intentionally
      if (error.name === 'AbortError') {
        console.log('Request was aborted')
      } else {
        console.error("Failed in main try-catch:", error)
        console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
        
      // Add error message
      setMessages((prev) => [
        ...prev,
        { 
          id: (Date.now() + 1).toString(), 
          role: "assistant", 
            content: "Sorry, I couldn't process your request. Error: " + error.message
        }
      ])
      }
    } finally {
      setIsLoading(false)
      setController(null)
      setIsInterruptible(false)
      setProcessingStage(0) // Reset processing stage
    }
  }

  const interruptResponse = () => {
    if (controller) {
      controller.abort()
      setIsLoading(false)
      setController(null)
      setIsInterruptible(false)
      setProcessingStage(0) // Reset processing stage
    }
  }

  return {
    messages,
    input,
    isLoading,
    isInterruptible,
    processingStage,
    userQuery,
    handleInputChange,
    handleSubmit,
    interruptResponse,
    setMessages,
    lastNewMessageId,
    setLastNewMessageId
  }
}

// Function to convert markdown to PDF with improved rendering
const downloadAsPDF = (content, title = "AIlign Report") => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set PDF metadata
  doc.setProperties({
    title: title,
    subject: "AI Investment Analysis",
    author: "AIlign",
    keywords: "AI, ROI, Investment, Analysis",
    creator: "AIlign Advisor"
  });
  
  // Theme colors
  const colors = {
    primary: [0, 102, 204], // Blue
    secondary: [22, 52, 92], // Dark blue
    accent: [72, 161, 252], // Light blue
    text: [60, 60, 60], // Dark gray
    lightText: [120, 120, 120], // Light gray
    background: [245, 247, 250], // Light background
    primaryLight: [230, 240, 255] // Light blue background
  };
  
  // Add a background pattern
  doc.setFillColor(...colors.background);
  doc.rect(0, 0, 210, 297, 'F');
  
  // Add decorative element at the top
  doc.setFillColor(...colors.accent);
  doc.rect(0, 0, 5, 297, 'F');
  
  // Add the logo/title header with gradient-like effect
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, 210, 25, 'F');
  
  // Add decorative elements to header
  doc.setFillColor(...colors.secondary);
  doc.rect(0, 25, 210, 2, 'F');
  
  // Small geometric shapes for modern design (using light color instead of transparency)
  doc.setFillColor(255, 255, 255);
  doc.circle(180, 12, 15, 'F');
  doc.circle(160, 5, 7, 'F');
  
  // Add logo/title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text("AIlign", 15, 15);
  
  // Add subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("AI Investment Alignment Advisor", 60, 15);
  
  // Add report generation info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 22);
  
  // Reset font for content
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  
  // Start content area
  let yPos = 40;
  
  // Add title with box
  doc.setFillColor(250, 250, 255);
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, yPos - 10, 180, 15, 2, 2, 'FD');
  
  doc.setFontSize(16);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, yPos - 1);
  yPos += 15;
  
  // Add a decorative line
  doc.setDrawColor(...colors.accent);
  doc.setLineWidth(0.5);
  for (let i = 0; i < 20; i++) {
    doc.line(15 + (i * 9), yPos, 20 + (i * 9), yPos);
  }
  yPos += 8;
  
  // Reset font for content
  doc.setFontSize(11);
  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'normal');
  
  // Helper function to extract formatting markers from text
  const extractFormatting = (text) => {
    // First, clean all escaped characters
    let processedText = text
      .replace(/\\\*/g, '§ASTERISK§') // Replace escaped asterisks with placeholder
      .replace(/\\\\/g, '§BACKSLASH§') // Replace double backslashes with placeholder
      .replace(/\\\$/g, '§DOLLAR§') // Fix dollar signs with backslashes
      .replace(/\\_/g, '§UNDERSCORE§') // Fix underscores
      .replace(/\\\(/g, '§OPENPAREN§') // Fix parentheses
      .replace(/\\\)/g, '§CLOSEPAREN§') // Fix parentheses
      .replace(/\\n/g, '\n'); // Replace \n with actual newlines
    
    // Track formatting
    const formats = [];
    
    // Find bold text
    const boldRegex = /\*\*(.*?)\*\*|__(.*?)__/g;
    let boldMatch;
    while ((boldMatch = boldRegex.exec(processedText)) !== null) {
      const text = boldMatch[1] || boldMatch[2];
      const start = boldMatch.index;
      const end = start + boldMatch[0].length;
      formats.push({
        type: 'bold',
        text: text,
        start: start,
        end: end,
        original: boldMatch[0]
      });
    }
    
    // Find italic text
    const italicRegex = /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)|_(.*?)_/g;
    let italicMatch;
    while ((italicMatch = italicRegex.exec(processedText)) !== null) {
      const text = italicMatch[1] || italicMatch[2];
      const start = italicMatch.index;
      const end = start + italicMatch[0].length;
      formats.push({
        type: 'italic',
        text: text,
        start: start,
        end: end,
        original: italicMatch[0]
      });
    }
    
    // Sort formats by start position
    formats.sort((a, b) => a.start - b.start);
    
    // Replace all placeholders
    processedText = processedText
      .replace(/§ASTERISK§/g, '*')
      .replace(/§BACKSLASH§/g, '\\')
      .replace(/§DOLLAR§/g, '$')
      .replace(/§UNDERSCORE§/g, '_')
      .replace(/§OPENPAREN§/g, '(')
      .replace(/§CLOSEPAREN§/g, ')');
    
    return { text: processedText, formats };
  };
  
  // Helper function to clean text of markdown syntax
  const cleanText = (text) => {
    return text
      .replace(/\\\*/g, '*') // Replace escaped asterisks with actual asterisks
      .replace(/\\\\/g, '\\') // Replace double backslashes with single backslash
      .replace(/\\([^\\])/g, '$1') // Remove escape character but keep the character it was escaping
      .replace(/\\\$/g, '$') // Fix dollar signs with backslashes
      .replace(/\\_/g, '_') // Fix underscores
      .replace(/\\\(/g, '(') // Fix parentheses
      .replace(/\\\)/g, ')') // Fix parentheses
      .replace(/\\n/g, '\n') // Replace \n with actual newlines
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
      .replace(/__(.*?)__/g, '$1') // Remove bold markers
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
      .replace(/_(.*?)_/g, '$1'); // Remove italic markers
  };
  
  // Parse markdown content
  // Split by lines and process by markdown elements
  const lines = content.split('\n');
  let inCodeBlock = false;
  let inList = false;
  let codeBlockContent = [];
  let listIndentLevel = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage();
      
      // Add background pattern to new page
      doc.setFillColor(...colors.background);
      doc.rect(0, 0, 210, 297, 'F');
      
      // Add decorative element on the side
      doc.setFillColor(...colors.accent);
      doc.rect(0, 0, 5, 297, 'F');
      
      yPos = 20;
    }
    
    // Handle code blocks
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        // Start of code block
        inCodeBlock = true;
        codeBlockContent = [];
        continue;
      } else {
        // End of code block
        inCodeBlock = false;
        
        // Draw code block background with rounded corners and shadow effect
        const blockHeight = codeBlockContent.length * 6 + 10;
        
        // Add shadow effect (using gray instead of transparency)
        doc.setFillColor(220, 220, 220);
        doc.roundedRect(17, yPos - 3, 180, blockHeight, 3, 3, 'F');
        
        // Draw code block
        doc.setFillColor(245, 245, 250);
        doc.setDrawColor(230, 230, 235);
        doc.roundedRect(15, yPos - 5, 180, blockHeight, 3, 3, 'FD');
        
        // Draw code text
        doc.setFont('courier', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        
        for (let j = 0; j < codeBlockContent.length; j++) {
          doc.text(cleanText(codeBlockContent[j]), 20, yPos);
          yPos += 6;
        }
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...colors.text);
        yPos += 5;
        continue;
      }
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }
    
    // Handle headings
    if (line.startsWith('# ')) {
      // Add heading with background (using light blue instead of transparency)
      doc.setFillColor(...colors.primaryLight);
      doc.rect(15, yPos - 7, 180, 12, 'F');
      
      // Add heading text
      doc.setFontSize(16);
      doc.setTextColor(...colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.text(cleanText(line.substring(2)), 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      doc.setFontSize(11);
      yPos += 10;
    }
    else if (line.startsWith('## ')) {
      // Add subheading with underline
      doc.setFontSize(14);
      doc.setTextColor(...colors.primary);
      doc.setFont('helvetica', 'bold');
      const subheadingText = cleanText(line.substring(3));
      doc.text(subheadingText, 15, yPos);
      
      // Add underline
      const textWidth = doc.getTextWidth(subheadingText);
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.5);
      doc.line(15, yPos + 1, 15 + textWidth, yPos + 1);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      doc.setFontSize(11);
      yPos += 8;
    }
    else if (line.startsWith('### ')) {
      doc.setFontSize(12);
      doc.setTextColor(...colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.text(cleanText(line.substring(4)), 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      doc.setFontSize(11);
      yPos += 7;
    }
    else if (line.startsWith('#### ')) {
      doc.setFontSize(11);
      doc.setTextColor(...colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.text(cleanText(line.substring(5)), 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      doc.setFontSize(11);
      yPos += 7;
    }
    // Handle bullet lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      const { text: rawText, formats } = extractFormatting(line.substring(2));
      const bulletText = cleanText(line.substring(2));
      const splitText = doc.splitTextToSize(bulletText, 170);
      
      // Create a custom bullet point
      doc.setFillColor(...colors.primary);
      doc.circle(16, yPos - 2, 1.5, 'F');
      
      // If we have formatting, apply it
      if (formats.length > 0) {
        // For simplicity, we just make the whole bullet point bold
        doc.setFont('helvetica', 'bold');
        doc.text(splitText, 20, yPos);
        doc.setFont('helvetica', 'normal');
      } else {
        doc.text(splitText, 20, yPos);
      }
      
      yPos += splitText.length * 6 + 2;
    }
    // Handle numbered lists
    else if (/^\d+\.\s/.test(line)) {
      const numberMatch = line.match(/^(\d+)\.\s(.*)/);
      if (numberMatch) {
        const number = numberMatch[1];
        const { text: rawText, formats } = extractFormatting(numberMatch[2]);
        const text = cleanText(numberMatch[2]);
        const splitText = doc.splitTextToSize(text, 170);
        
        // Add number with a small circle behind it (using light blue instead of transparency)
        doc.setFillColor(...colors.primaryLight);
        doc.circle(13, yPos - 2, 5, 'F');
        
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.text(`${number}.`, 11, yPos);
        
        // If we have formatting, apply it
        if (formats.length > 0) {
          // For simplicity, we'll make the whole line bold
          doc.setTextColor(...colors.text);
          doc.setFont('helvetica', 'bold');
          doc.text(splitText, 20, yPos);
          doc.setFont('helvetica', 'normal');
        } else {
          doc.setTextColor(...colors.text);
          doc.setFont('helvetica', 'normal');
          doc.text(splitText, 20, yPos);
        }
        
        yPos += splitText.length * 6 + 2;
      }
    }
    // Handle text with formatting
    else if (line.includes('*') || line.includes('_') || line.includes('\\')) {
      const { text: processedText, formats } = extractFormatting(line);
      
      // If we have bold or italic formatting
      if (formats.length > 0) {
        // For simplicity, we'll just apply one style to the whole line
        // In a more complex implementation, you would split the text and style each part
        
        const hasBold = formats.some(f => f.type === 'bold');
        const hasItalic = formats.some(f => f.type === 'italic');
        
        if (hasBold) {
          doc.setFont('helvetica', 'bold');
        } else if (hasItalic) {
          doc.setFont('helvetica', 'italic');
        }
        
        const cleanedText = cleanText(line);
        const splitText = doc.splitTextToSize(cleanedText, 175);
        doc.text(splitText, 15, yPos);
        
        // Reset font
        doc.setFont('helvetica', 'normal');
        
        yPos += splitText.length * 6 + 2;
      } else {
        // No recognized formatting, just clean and display
        const cleanedText = cleanText(line);
        const splitText = doc.splitTextToSize(cleanedText, 175);
        doc.text(splitText, 15, yPos);
        
        yPos += splitText.length * 6 + 2;
      }
    }
    // Empty line (paragraph break)
    else if (line === '') {
      yPos += 4;
    }
    // Regular text with possible escape characters
    else {
      const processedText = cleanText(line);
      const splitText = doc.splitTextToSize(processedText, 175);
      doc.text(splitText, 15, yPos);
      yPos += splitText.length * 6 + 2;
    }
  }
  
  // Add footer with page numbers to all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Add footer background
    doc.setFillColor(...colors.primary);
    doc.rect(0, 282, 210, 15, 'F');
    
    // Add decorative elements
    doc.setFillColor(...colors.secondary);
    doc.rect(0, 280, 210, 2, 'F');
    
    // Small geometric shapes for design (using white instead of transparency)
    doc.setFillColor(255, 255, 255);
    doc.circle(180, 288, 8, 'F');
    doc.circle(195, 292, 5, 'F');
    
    // Add page number and branding
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, 15, 289);
    doc.text(`Generated by AIlign | AI Investment Alignment Advisor`, 195, 289, { align: 'right' });
  }
  
  // Save the PDF with a descriptive name
  const fileName = `AIlign_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};

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
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    isInterruptible,
    processingStage,
    userQuery,
    interruptResponse,
    setMessages,
    lastNewMessageId,
    setLastNewMessageId
  } = useFlaskChat()
  const messagesEndRef = useRef(null)
  const scrollAreaRef = useRef(null)
  const sidebarRef = useRef(null)
  const timeoutRef = useRef(null)

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
    
    // Set initial load to false after a delay
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 500)
    
    timeoutRef.current = timer
    return () => clearTimeout(timer)
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
    
    // Reset typewriter-related state
    setLastNewMessageId(null)
    setIsInitialLoad(true)
    
    // Clear messages
    setMessages([])
    
    // Reset isInitialLoad after a short delay
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsInitialLoad(false)
    }, 100)
  }

  const handleLoadChat = (chatId) => {
    // Save current chat if needed
    if (messages.length > 0) {
      // Already handled by the useEffect
    }
    
    // Reset typewriter-related state
    setIsInitialLoad(true)
    setLastNewMessageId(null)
    
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
    
    // Reset isInitialLoad after a short delay
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsInitialLoad(false)
    }, 100)
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
  
  // Replace the existing useEffect for setting isTyping with this more robust version
  useEffect(() => {
    if (messages.length > 0 && 
        messages[messages.length - 1].role === 'assistant' && 
        messages[messages.length - 1].id === lastNewMessageId && 
        !isInitialLoad) {
      setIsTyping(true)
    }
  }, [messages, lastNewMessageId, isInitialLoad])

  // Ensure we clean up properly when unmounting
  useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      // Reset typewriter state
      setIsTyping(false)
      setInterruptTyping(false)
    }
  }, [])

  // Set isInitialLoad to false after initial render
  useEffect(() => {
    if (messages.length > 0) {
      setIsInitialLoad(false)
    }
  }, [messages.length])

  // Render the processing stages component
  const renderProcessingStages = () => {
    if (!isLoading) return null;
    
    // Define stage labels
    const stages = [
      { num: 1, label: "Reading query", query: userQuery },
      { num: 2, label: "Analyzing knowledge base" },
      { num: 3, label: "Generating response" }
    ];

  return (
      <div className="flex items-start gap-3 animate-slide-up">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium text-foreground">AI Cost Optimizer</span>
          </div>
          <div className="flex flex-col">
            {stages.map((stage, index) => (
              <div key={stage.num} className="relative">
                {processingStage >= stage.num && (
                  <div className="flex items-center gap-2 py-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 z-10"></div>
                    <span 
                      className={`text-sm ${processingStage === stage.num ? 'text-foreground animate-pulse-text' : 'text-muted-foreground'}`}
                    >
                      {stage.label}
                      {stage.num === 1 && stage.query && processingStage === 1 && (
                        <span className="text-blue-400 ml-1">"{stage.query.length > 20 ? stage.query.slice(0, 20) + '...' : stage.query}"</span>
                      )}
                      {processingStage === stage.num && <span className="animate-blink ml-1">•</span>}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

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
                              {(idx === messages.length - 1 && message.id === lastNewMessageId && !isInitialLoad) ? (
                                <TypeWriter 
                                  text={message.content} 
                                  speed={3} 
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
                              <Button
                                onClick={() => downloadAsPDF(message.content, "AIlign Investment Report")}
                                size="sm"
                                variant="outline"
                                className="h-7 px-3 text-blue-600 hover:text-blue-700 border border-blue-200 hover:bg-blue-50 transition-all rounded-full flex items-center gap-1"
                              >
                                <FileDown className="h-3 w-3" />
                                <span>Download Report as PDF</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && renderProcessingStages()}

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

      {/* Add the animation styles */}
      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .animate-blink {
          animation: blink 1s infinite;
        }
        
        @keyframes pulse-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-pulse-text {
          animation: pulse-text 1.5s infinite;
        }
        
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