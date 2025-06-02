import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Request data:', data);
    
    // Use environment variable or fallback to the Render URL
    const apiEndpoint = process.env.NEXT_PUBLIC_API_URL || 
                       'https://buildathon-genai.onrender.com';
    
    console.log(`Using API endpoint: ${apiEndpoint}`);
    
    // Make the request to the backend with specific headers
    console.log(`Making request to: ${apiEndpoint}/api/chat`);
    const response = await fetch(`${apiEndpoint}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://buildathon-genai.vercel.app'
      },
      body: JSON.stringify(data),
      cache: 'no-store',
      mode: 'cors',
      credentials: 'include'
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error response: ${errorText}`);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Successful response received from backend');

    // Add CORS headers to the response
    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error proxying to backend:', error);
    // Also return CORS headers in error response
    return new NextResponse(
      JSON.stringify({ error: 'Failed to process request', details: error.message }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}