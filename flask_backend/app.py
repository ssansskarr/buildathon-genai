from flask import Flask, request, jsonify, after_this_request
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Define environment variables directly in code as a fallback
ENV_VARS = {
    "LYZR_API_KEY": "sk-default-4nIJzEOtOeXpFjIu3U9wDyUD5U4V49h4",
    "LYZR_AGENT_ID": "683d10bb3b7c57f1745cfaf9",
    "LYZR_USER_ID": "pavansharadha@gmail.com",
    "LYZR_SESSION_ID": "683d10bb3b7c57f1745cfaf9-e0fqnfekgs",
    "GEMINI_API_KEY": "AIzaSyARVFZ6ub0Q6vfJATOLg1ew4TrNlJiL9vE"
}

# Helper function to get environment variables with fallback
def get_env(key):
    return os.environ.get(key, ENV_VARS.get(key))

app = Flask(__name__)

# Setup CORS to allow requests from any origin - this is necessary for Render
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

# Lyzr Agent Studio API configuration
LYZR_API_KEY = get_env("LYZR_API_KEY")
LYZR_AGENT_ID = get_env("LYZR_AGENT_ID")
LYZR_API_URL = "https://agent-prod.studio.lyzr.ai/v3/inference/chat/"
LYZR_USER_ID = get_env("LYZR_USER_ID")
LYZR_SESSION_ID = get_env("LYZR_SESSION_ID")

# Google Gemini API configuration
GEMINI_API_KEY = get_env("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# System prompt for Gemini to enhance Lyzr responses
GEMINI_SYSTEM_PROMPT = """
You are AIlign, an expert AI Investment Alignment Advisor specializing in helping businesses align their AI investments with strategic goals and optimize ROI.
Your task is to enhance and format the following AI-generated response.

Guidelines:
1. Maintain all factual information from the original response
2. Improve clarity, structure, and readability
3. Format with proper markdown headings, bullet points, and emphasis where appropriate
4. Add concrete examples or metrics where helpful
5. Ensure content is balanced between technical detail and practical business insights
6. Keep a professional, consultative tone
7. Include clear action items when appropriate
8. Format monetary values and percentages consistently
9. Ensure all technical recommendations are accurate and industry-standard
10. IMPORTANT: Do NOT include any meta-commentary about enhancing, formatting, or improving the response
11. IMPORTANT: Write as if you are directly answering the user's query, not commenting on another AI's response
12. NEVER start with phrases like "Here's an enhanced version" or "I've formatted this response"
13. NEVER refer to the original response or mention that you're modifying anything

Your output should help businesses make informed decisions about:
- Which tasks AI can automate to free up human resources
- Which functions across organizations can leverage AI to save costs
- How to optimize AI agent costs and reduce credit consumption
- Which LLM is optimal for specific use cases based on cost, latency and quality
- Calculating ROI and estimating implementation costs for AI initiatives
"""

def cleanup_meta_commentary(text):
    """
    Remove meta-commentary about the enhancement process from the response
    """
    # List of common meta-commentary phrases to remove
    meta_phrases = [
        "Here's an enhanced version:",
        "Here's the enhanced response:",
        "I've enhanced and formatted the response:",
        "Here's an enhanced and formatted version of the AI response",
        "I've improved the formatting of the response:",
        "I've formatted the response for better readability:",
        "Based on the original response, here's a more structured version:",
        "Here's a clearer, more structured version of the information:",
        "I've organized the information more clearly:",
        "Here's a more readable version:",
        "Based on the AI's response, here's a clearer explanation:",
        "I've refined the original response:",
        "Here's a more concise version:",
        "Here's a more detailed response:",
    ]
    
    result = text
    for phrase in meta_phrases:
        if result.startswith(phrase):
            result = result.replace(phrase, "", 1).strip()
    
    # Remove any generic opening lines that might be meta-commentary
    lines = result.split('\n')
    if lines and any(line.lower().startswith(("here's", "based on", "i've", "following the")) for line in lines[:2]):
        # Check if the first line appears to be meta-commentary
        first_line = lines[0].lower()
        if any(term in first_line for term in ["enhance", "format", "improve", "original", "response", "structure", "organize"]):
            result = '\n'.join(lines[1:]).strip()
    
    return result

def enhance_with_gemini(original_response, query):
    """
    Send the original response to Google Gemini for enhancement
    """
    try:
        # Prepare the request to Gemini
        headers = {
            "Content-Type": "application/json"
        }
        
        data = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": f"USER QUERY: {query}\n\nPlease respond to this query using the following information: {original_response}"}
                    ]
                }
            ],
            "systemInstruction": {
                "role": "system",
                "parts": [
                    {"text": GEMINI_SYSTEM_PROMPT}
                ]
            },
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.8,
                "topK": 40,
                "maxOutputTokens": 2048
            }
        }
        
        # Call Gemini API
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=data
        )
        
        # Process the response
        if response.status_code == 200:
            result = response.json()
            # Extract the enhanced text from Gemini's response
            enhanced_text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            if enhanced_text:
                # Clean up any possible remaining meta-commentary
                enhanced_text = cleanup_meta_commentary(enhanced_text)
                return enhanced_text
            else:
                print("Empty response from Gemini")
                return original_response
        else:
            print(f"Gemini API Error: {response.status_code}")
            print(response.text)
            return original_response
            
    except Exception as e:
        print(f"Error enhancing response with Gemini: {str(e)}")
        return original_response

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        print(f"Received request data: {data}")
        messages = data.get('messages', [])
        
        if not messages:
            return jsonify({"error": "No messages found"}), 400

        # Get the latest user message
        latest_user_message = next((m for m in reversed(messages) if m.get('role') == 'user'), None)
        
        if not latest_user_message:
            return jsonify({"error": "No user message found"}), 400
            
        user_message = latest_user_message.get('content', '')
        print(f"Processing user message: {user_message}")
        
        # Call Lyzr Agent Studio API
        try:
            response = requests.post(
                LYZR_API_URL,
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": LYZR_API_KEY
                },
                json={
                    "user_id": LYZR_USER_ID,
                    "agent_id": LYZR_AGENT_ID,
                    "session_id": LYZR_SESSION_ID,
                    "message": user_message
                },
                timeout=90
            )
            
            print(f"Lyzr API response status: {response.status_code}")
        
            # Process the response
            if response.status_code == 200:
                lyzr_response = response.json()
                # Extract the response text from Lyzr's response
                try:
                    ai_text = lyzr_response.get('response', '')
                    if not ai_text:
                        ai_text = "I couldn't generate a response. Please try again."
                        print("Empty response from Lyzr API")
                    else:
                        # Enhance the response using Google Gemini
                        print("Enhancing response with Gemini")
                        ai_text = enhance_with_gemini(ai_text, user_message)
                        
                        # Final cleanup to ensure no meta-commentary remains
                        ai_text = cleanup_meta_commentary(ai_text)
                except (KeyError, IndexError) as e:
                    print(f"Error parsing Lyzr response: {str(e)}")
                    ai_text = "Error parsing the AI response. Please try again."
                
                return jsonify({"response": ai_text})
            else:
                error_msg = f"Lyzr API Error: {response.status_code}"
                print(f"{error_msg} - {response.text}")
                return jsonify({"error": error_msg, "details": response.text}), 500
        except Exception as api_err:
            error_msg = f"Error calling Lyzr API: {str(api_err)}"
            print(error_msg)
            return jsonify({"error": error_msg}), 500
            
    except Exception as e:
        error_msg = f"Server error processing request: {str(e)}"
        print(error_msg)
        return jsonify({"error": error_msg}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "AIlign Flask Backend"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 