# AIlign

An enterprise AI investment alignment advisor that helps companies optimize their AI investments, select the right LLMs, calculate ROI, and architect efficient AI agents.

## Project Structure

```
ailign/
├── src/                   # Next.js frontend
│   ├── app/               # Next.js app directory
│   │   ├── api/           # API routes for production
│   ├── components/        # React components
│   └── lib/               # Utility functions
├── flask_backend/         # Flask backend
│   ├── app.py             # Flask application
│   └── requirements.txt   # Python dependencies
├── public/                # Static assets
└── start-app.bat          # Script to start both frontend and backend
```

## Setup

### Environment Variables

1. Create a `.env` file in the project root:
```
# Backend URL - Use local Flask backend in development
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

2. Create a `.env` file in the `flask_backend` directory:
```
# Lyzr API credentials
LYZR_API_KEY=sk-default-jr9mnUxXOtQcDnWvmVokUtgvmcC5YqHv
LYZR_AGENT_ID=683cd9a4e5bd32ccbe646960
LYZR_USER_ID=sanskar.gupta.22cse@bmu.edu.in
LYZR_SESSION_ID=683cd9a4e5bd32ccbe646960-sj5l6qjdxo

# Google Gemini API key
GEMINI_API_KEY=AIzaSyARVFZ6ub0Q6vfJATOLg1ew4TrNlJiL9vE
```

### Frontend (Next.js)

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

The Next.js frontend will run on http://localhost:3000.

### Backend (Flask)

1. Navigate to the flask_backend directory:
```bash
cd flask_backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask server:
```bash
python app.py
```

The Flask backend will run on http://localhost:5000.

## Quick Start

To start both the frontend and backend simultaneously, run:
```bash
start-app.bat
```

## Features

- Interactive chat interface with AI investment alignment advisor
- Provides recommendations powered by Lyzr AI and enhanced by Google's Gemini model
- Cost reduction analysis for AI implementations
- LLM selection recommendations
- ROI calculations for AI projects
- Agent architecture optimization

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Flask, Python
- **AI**: Lyzr Agent Studio API, Google Gemini API
