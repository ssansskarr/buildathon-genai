export async function POST(req) {
  const { messages } = await req.json()

  // Extract the latest user message
  const latestUserMessage = messages.findLast(m => m.role === "user")
  
  if (!latestUserMessage) {
    return new Response(JSON.stringify({ error: "No user message found" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    // Get backend URL from environment variable, or use direct API if not available
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://agent-prod.studio.lyzr.ai/v3/inference/chat/"
    const isDirectApi = !process.env.NEXT_PUBLIC_BACKEND_URL
    
    // Call backend API
    const response = await fetch(isDirectApi ? backendUrl : `${backendUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(isDirectApi && { "x-api-key": "sk-default-jr9mnUxXOtQcDnWvmVokUtgvmcC5YqHv" })
      },
      body: JSON.stringify(isDirectApi ? {
        "user_id": "sanskar.gupta.22cse@bmu.edu.in",
        "agent_id": "683cd9a4e5bd32ccbe646960",
        "session_id": "683cd9a4e5bd32ccbe646960-sj5l6qjdxo",
        "message": latestUserMessage.content
      } : {
        messages
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error || "API Error" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    }
    
    // Return the AI response
    return new Response(JSON.stringify({ 
      response: isDirectApi ? data.response : data.response 
    }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}