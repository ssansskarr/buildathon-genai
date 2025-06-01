# AIlign - Flask Backend

This is the Flask backend for the AIlign application. It serves as an API that connects to Lyzr's Agent Studio API and Google's Gemini model to provide AI investment alignment advice.

## Setup

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the flask_backend directory with the following environment variables:

```
# Lyzr API credentials
LYZR_API_KEY=your_lyzr_api_key
LYZR_AGENT_ID=your_lyzr_agent_id
LYZR_USER_ID=your_lyzr_user_id
LYZR_SESSION_ID=your_lyzr_session_id

# Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key
```

3. Run the Flask server:

```bash
python app.py
```

The server will start on http://localhost:5000.

## API Endpoints

### POST /api/chat

Processes chat messages and returns AI responses. The backend forwards user queries to Lyzr's Agent API and enhances the responses using Google's Gemini API.

**Request Body:**

```json
{
  "messages": [
    { "role": "user", "content": "Help me optimize my AI costs" },
    { "role": "assistant", "content": "I'd be happy to help..." }
  ]
}
```

**Response:**

```json
{
  "response": "Here's how you can optimize your AI costs..."
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "service": "AIlign Flask Backend"
}
```

## Environment Variables

- `LYZR_API_KEY`: API key for accessing Lyzr's Agent Studio
- `LYZR_AGENT_ID`: ID of the Lyzr agent to use
- `LYZR_USER_ID`: User ID for Lyzr's Agent Studio
- `LYZR_SESSION_ID`: Session ID for Lyzr's Agent Studio
- `GEMINI_API_KEY`: API key for Google's Gemini AI model

If environment variables are not set, the backend will use default values defined in the code.

## Integration with Frontend

The Flask backend is designed to work with the Next.js frontend. Make sure the frontend is configured to send requests to http://localhost:5000/api/chat. 