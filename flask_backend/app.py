from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Gemini API configuration
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyARVFZ6ub0Q6vfJATOLg1ew4TrNlJiL9vE")  # Fallback to hardcoded key if env var not set
GEMINI_API_URL = os.environ.get(
    "GEMINI_API_URL", 
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        messages = data.get('messages', [])
        
        if not messages:
            return jsonify({"error": "No messages found"}), 400

        # Convert our messages format to Gemini's format
        gemini_messages = []
        
        # Add all the conversation messages
        for message in messages:
            role = "user" if message.get('role') == 'user' else "model"
            gemini_messages.append({
                "role": role,
                "parts": [{"text": message.get('content', '')}]
            })
        
        # Call Gemini API with the full conversation history
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": gemini_messages
            }
        )
        
        # Process the response
        if response.status_code == 200:
            gemini_response = response.json()
            # Extract the text from Gemini's response
            try:
                ai_text = gemini_response.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                if not ai_text:
                    ai_text = "I couldn't generate a response. Please try again."
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