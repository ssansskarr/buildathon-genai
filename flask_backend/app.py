from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json

# Define environment variables directly in code as a fallback
ENV_VARS = {
    "LYZR_API_KEY": "sk-default-gpfGHgnesfpPAetk2jmts64V5QTB3rc7",
    "LYZR_AGENT_ID": "683bfd593b7c57f1745ceb5c",
    "LYZR_USER_ID": "sanskarg115@gmail.com",
    "LYZR_SESSION_ID": "683bfd593b7c57f1745ceb5c-rxrc71bfyd",
    "GEMINI_API_KEY": "AIzaSyDlxUEyM3sxQQDgXKjJ8glKe1wr-MaSWWQ"
}

# Helper function to get environment variables with fallback
def get_env(key):
    return os.environ.get(key, ENV_VARS.get(key))

app = Flask(__name__)
# Update CORS to accept requests from Vercel and localhost
CORS(app, origins=["https://*.vercel.app", "http://localhost:3000"])  # Add your Vercel domain when known

# Lyzr Agent Studio API configuration
LYZR_API_KEY = get_env("LYZR_API_KEY")
LYZR_AGENT_ID = get_env("LYZR_AGENT_ID")
LYZR_API_URL = "https://agent-prod.studio.lyzr.ai/v3/inference/chat/"
LYZR_USER_ID = get_env("LYZR_USER_ID")
LYZR_SESSION_ID = get_env("LYZR_SESSION_ID")

# Google Gemini API configuration
GEMINI_API_KEY = get_env("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent"

# System prompt for Gemini to enhance Lyzr responses
GEMINI_SYSTEM_PROMPT = """
You are OptimusAI, an expert AI Cost Optimization Advisor Agent specializing in Generative AI adoption for enterprises.
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

Your output should be comprehensive yet scannable, making complex AI cost information accessible to business leaders.
"""

def enhance_with_gemini(original_response, query):
    """
    Send the original response to Google Gemini for enhancement
    """
    try:
        # Prepare the request to Gemini
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY
        }
        
        data = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": f"USER QUERY: {query}\n\nORIGINAL RESPONSE: {original_response}\n\nPlease enhance and format this response according to the guidelines."}
                    ]
                }
            ],
            "systemInstruction": {
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
        messages = data.get('messages', [])
        
        if not messages:
            return jsonify({"error": "No messages found"}), 400

        # Get the latest user message
        latest_user_message = next((m for m in reversed(messages) if m.get('role') == 'user'), None)
        
        if not latest_user_message:
            return jsonify({"error": "No user message found"}), 400
            
        user_message = latest_user_message.get('content', '')
        
        # Call Lyzr Agent Studio API
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
            }
        )
        
        # Process the response
        if response.status_code == 200:
            lyzr_response = response.json()
            # Extract the response text from Lyzr's response
            try:
                ai_text = lyzr_response.get('response', '')
                if not ai_text:
                    ai_text = "I couldn't generate a response. Please try again."
                else:
                    # Enhance the response using Google Gemini
                    ai_text = enhance_with_gemini(ai_text, user_message)
            except (KeyError, IndexError):
                ai_text = "Error parsing the AI response. Please try again."
                
            return jsonify({"response": ai_text})
        else:
            return jsonify({"error": f"API Error: {response.status_code}", "details": response.text}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "AIlign Flask Backend"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 