"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function TypeWriter({ text, speed = 10 }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Reset when text changes
    setDisplayText("")
    setCurrentIndex(0)
    setIsComplete(false)
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prevIndex => prevIndex + 1)
      }, speed)
      
      return () => clearTimeout(timeout)
    } else {
      setIsComplete(true)
    }
  }, [currentIndex, text, speed])

  return (
    <div className="typewriter-container">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({node, ...props}) => (
            <table className="w-full border-collapse my-4 rounded-lg overflow-hidden" {...props} />
          ),
          thead: ({node, ...props}) => (
            <thead className="bg-emerald-900/20" {...props} />
          ),
          tbody: ({node, ...props}) => (
            <tbody {...props} />
          ),
          tr: ({node, ...props}) => (
            <tr className="border-b border-[#2a2a2a]/50 hover:bg-[#1a1a1a]/30" {...props} />
          ),
          th: ({node, ...props}) => (
            <th className="p-3 text-left font-medium text-emerald-300" {...props} />
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