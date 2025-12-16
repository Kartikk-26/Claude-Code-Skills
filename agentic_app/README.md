# Raju's Royal Artifacts - AI Shopkeeper

An AI-powered bargaining shopkeeper chatbot built with React and Groq (Llama 3.3).

## Live Demo

[Add your Vercel URL here after deployment]

## Tech Stack

- **Frontend**: React.js
- **Backend**: Python (Vercel Serverless)
- **AI**: Groq API (Llama 3.3 70B)
- **Hosting**: Vercel

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Deploy to Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repo
4. Set **Root Directory** to `agentic_app`
5. Add Environment Variable:
   - Name: `GROQ_API_KEY`
   - Value: Your Groq API key
6. Click Deploy!

## Features

- Chat with Raju, an AI shopkeeper
- Browse inventory with prices
- Bargain for discounts
- Fun Indian-English responses

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Your Groq API key (get free at console.groq.com) |
