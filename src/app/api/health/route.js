import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiEndpoint = 'https://buildathon-genai.onrender.com';
    
    console.log(`Checking backend health at: ${apiEndpoint}/health`);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(`${apiEndpoint}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      console.log(`Health check response status: ${response.status}`);
      
      // Get the response text
      const responseText = await response.text();
      console.log(`Health check response: ${responseText}`);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Error parsing health check JSON:', jsonError);
        return new NextResponse(
          JSON.stringify({ 
            status: 'error', 
            message: 'Backend returned invalid JSON',
            raw: responseText
          }),
          { 
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      if (!response.ok) {
        return new NextResponse(
          JSON.stringify({ 
            status: 'error', 
            message: `Backend returned status ${response.status}`,
            details: result
          }),
          { 
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      return new NextResponse(
        JSON.stringify({ 
          status: 'ok', 
          message: 'Backend is healthy',
          backend: result
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (fetchError) {
      // Clear the timeout if there was an error
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('Health check timed out');
        return new NextResponse(
          JSON.stringify({ 
            status: 'error', 
            message: 'Backend health check timed out'
          }),
          { 
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      console.error('Health check fetch error:', fetchError);
      return new NextResponse(
        JSON.stringify({ 
          status: 'error', 
          message: 'Failed to connect to backend',
          details: fetchError.message
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  } catch (error) {
    console.error('Health check error:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        status: 'error', 
        message: 'Error checking backend health',
        details: error.message
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 