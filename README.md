# AIlign

An enterprise AI cost optimization advisor that helps companies optimize their AI costs, select the right LLMs, calculate ROI, and architect efficient AI agents.

## Project Structure

```
ai-cost-optimizer/
├── src/                   # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   └── lib/               # Utility functions
├── flask_backend/         # Flask backend
│   ├── app.py             # Flask application
│   └── requirements.txt   # Python dependencies
├── public/                # Static assets
└── start-app.bat          # Script to start both frontend and backend
```

## Setup

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

3. Create a `.env` file based on `.env.example` and add your Gemini API key.

4. Run the Flask server:
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

- Interactive chat interface with AI cost optimization advisor
- Real-time responses from Google's Gemini model
- Cost reduction analysis for AI implementations
- LLM selection recommendations
- ROI calculations for AI projects
- Agent architecture optimization

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Flask, Python
- **AI**: Google Gemini API
