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
    <>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayText}
      </ReactMarkdown>
      {!isComplete && <span className="animate-pulse">▋</span>}
    </>
  )
} 