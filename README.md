# AIlign: AI Investment Alignment Advisor

AIlign is an intelligent advisor that helps businesses align their AI investments with strategic goals and optimize ROI. The application provides actionable recommendations for AI implementation, cost optimization, and LLM selection based on specific business needs.

## Features

- **AI Investment Alignment**: Get expert advice on aligning AI investments with business objectives
- **ROI Calculation**: Calculate potential return on investment for AI implementation
- **Cost Optimization**: Receive recommendations on optimizing AI agent costs and reducing credit consumption
- **LLM Selection**: Get guidance on selecting the most appropriate LLM based on cost, quality, and latency
- **PDF Export**: Download AI recommendations as professionally formatted PDF reports

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Flask, Python
- **APIs**: Lyzr AI (primary knowledge source), Google Gemini (response enhancement)

## Local Development

### Frontend

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Backend

```bash
# Navigate to backend directory
cd flask_backend

# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py
```

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Railway Deployment

This application can be deployed on Railway. Follow these steps:

1. Create a new project in Railway
2. Connect your GitHub repository
3. Set up the following environment variables:
   - `NEXT_PUBLIC_API_URL`: URL of your backend service (e.g., https://buildathon-genai-production.up.railway.app)
   - `NODE_ENV`: set to `production`
4. When prompted to generate a service domain, use port `8080` (not 3000)
5. Deploy the service

Railway will automatically detect the Next.js application and deploy it using the configuration in `railway.json` and `Procfile`.

**Note**: Since we use `output: standalone` in Next.js config, the application runs with `node .next/standalone/server.js`.

## License

This project is proprietary and not licensed for public use.

## Credits

Developed as part of the Buildathon Challenge.
