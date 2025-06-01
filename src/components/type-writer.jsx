"use client"

import { useState, useEffect, useRef } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function TypeWriter({ text, speed = 25, isInterrupted = false, onComplete = () => {} }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const timeoutRef = useRef(null)
  const wasInterruptedRef = useRef(false)

  // Reset when text changes
  useEffect(() => {
    setDisplayText("")
    setCurrentIndex(0)
    setIsComplete(false)
    wasInterruptedRef.current = false
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [text])

  // Handle interruption
  useEffect(() => {
    if (isInterrupted && !isComplete && !wasInterruptedRef.current) {
      // Mark as interrupted to prevent further typing
      wasInterruptedRef.current = true
      
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // Mark as complete since we're stopping here
      setIsComplete(true)
      onComplete(true) // Notify parent that typing was interrupted
    }
  }, [isInterrupted, isComplete, onComplete])

  // Handle typing animation
  useEffect(() => {
    // Don't continue if interrupted
    if (wasInterruptedRef.current) {
      return
    }
    
    if (currentIndex < text.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prevIndex => prevIndex + 1)
      }, speed)
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    } else if (!isComplete) {
      setIsComplete(true)
      onComplete(false) // Notify parent that typing completed normally
    }
  }, [currentIndex, text, speed, isComplete, onComplete])

  return (
    <div className="typewriter-container">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({node, ...props}) => (
            <table className="w-full border-collapse my-4 rounded-lg overflow-hidden" {...props} />
          ),
          thead: ({node, ...props}) => (
            <thead className="bg-blue-900/20" {...props} />
          ),
          tbody: ({node, ...props}) => (
            <tbody {...props} />
          ),
          tr: ({node, ...props}) => (
            <tr className="border-b border-[#2a2a2a]/50 hover:bg-[#1a1a1a]/30" {...props} />
          ),
          th: ({node, ...props}) => (
            <th className="p-3 text-left font-medium text-blue-300" {...props} />
          ),
          td: ({node, ...props}) => (
            <td className="p-3" {...props} />
          )
        }}
      >
        {displayText}
      </ReactMarkdown>
      {!isComplete && <span className="animate-pulse">▋</span>}
    </div>
  )
} 