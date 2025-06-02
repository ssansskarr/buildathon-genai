import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Request data:', data);
    
    // Hardcoded backend URL
    const apiEndpoint = 'https://buildathon-genai.onrender.com';
    
    console.log(`Making direct request to: ${apiEndpoint}/api/chat`);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout (increased from 2)
    
    try {
      const response = await fetch(`${apiEndpoint}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://buildathon-genai.vercel.app'
        },
        body: JSON.stringify(data),
        cache: 'no-store',
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      console.log(`Response status: ${response.status}`);
      
      // Always try to get the text first to handle any response format
      const responseText = await response.text();
      console.log(`Response text: ${responseText.substring(0, 200)}...`);
      
      let result;
      
      // Try to parse as JSON if possible
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        // Return a fallback response with the text content
        return new NextResponse(
          JSON.stringify({ 
            error: 'Invalid JSON response from backend',
            response: responseText || "I'm sorry, I couldn't process your request at this time. Please try again later."
          }),
          { 
            status: 200, // Return 200 to client even though there was an error parsing
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }
      
      // Check if we have a valid response structure
      if (!response.ok) {
        console.error(`API error response: ${JSON.stringify(result)}`);
        
        // Use the response field if available, otherwise use a fallback message
        const responseMessage = result.response || "I'm sorry, I couldn't process your request at this time. Please try again later.";
        
        return new NextResponse(
          JSON.stringify({ 
            error: `API error: ${response.status}`,
            details: result.error || 'Unknown error',
            response: responseMessage
          }),
          { 
            status: 200, // Return 200 to client even though there was an error
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }
      
      console.log('Successful response received from backend');

      // If we have a response field in the result, use it
      if (result.response) {
        return new NextResponse(JSON.stringify(result), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } else {
        // If we don't have a response field, create one with the result
        return new NextResponse(
          JSON.stringify({ 
            response: result.text || JSON.stringify(result)
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }
    } catch (fetchError) {
      // Clear the timeout if there was an error
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('Request timed out');
        return new NextResponse(
          JSON.stringify({ 
            error: 'Request timed out',
            response: "I'm sorry, the request took too long to process. Please try again with a simpler query."
          }),
          { 
            status: 200, // Return 200 to client even though there was a timeout
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }
      
      console.error('Fetch error:', fetchError);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to fetch from backend',
          details: fetchError.message,
          response: "I'm sorry, I couldn't connect to the backend service. Please try again later."
        }),
        { 
          status: 200, // Return 200 to client even though there was an error
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }
  } catch (error) {
    console.error('Error proxying to backend:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Also return CORS headers in error response
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to process request', 
        details: error.message,
        response: "I'm sorry, I couldn't process your request at this time. Please try again later."
      }),
      { 
        status: 200, // Return 200 to client to ensure the message is displayed
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
export async function OPTIONS() {
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