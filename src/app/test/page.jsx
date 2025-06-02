"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function TestPage() {
  const [status, setStatus] = useState('Loading...')
  const [details, setDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health')
        const data = await response.json()
        
        setStatus(data.status === 'ok' ? 'Connected' : 'Error')
        setDetails(data)
      } catch (error) {
        console.error('Error checking health:', error)
        setStatus('Error')
        setDetails({ error: error.message })
      } finally {
        setIsLoading(false)
      }
    }
    
    checkHealth()
  }, [])
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Backend Connection Test</h1>
        
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            {isLoading ? (
              <div className="animate-pulse bg-secondary h-6 w-24 rounded"></div>
            ) : (
              <span className={`font-medium ${status === 'Connected' ? 'text-green-500' : 'text-red-500'}`}>
                {status}
              </span>
            )}
          </div>
        </div>
        
        {!isLoading && details && (
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2">Details:</h2>
            <pre className="bg-secondary p-3 rounded text-sm overflow-auto max-h-60">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="flex justify-between">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Refresh
          </button>
          
          <Link href="/">
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
} 