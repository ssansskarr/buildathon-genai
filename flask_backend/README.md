# AI Cost Optimizer - Flask Backend

This is the Flask backend for the AI Cost Optimizer application. It serves as an API that connects to Google's Gemini model to provide AI cost optimization advice.

## Setup

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Run the Flask server:

```bash
python app.py
```

The server will start on http://localhost:5000.

## API Endpoints

### POST /api/chat

Processes chat messages and returns AI responses.

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
  "service": "AI Cost Optimizer Flask Backend"
}
```

## Configuration

The API key for Google Gemini is currently hardcoded in the app.py file. In a production environment, you should use environment variables or a secure configuration system.

## Integration with Frontend

The Flask backend is designed to work with the Next.js frontend. Make sure the frontend is configured to send requests to http://localhost:5000/api/chat. 