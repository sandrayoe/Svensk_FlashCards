# Svenska Flash Cards Setup Guide

## Required Environment Variables

This app uses Google AI (Gemini) to generate Swedish vocabulary words. You need to set up an API key to use this functionality.

### 1. Get a Google AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 2. Set up Environment Variables

1. Create a `.env.local` file in the root of your project (it's already created for you)
2. Add your API key to the `.env.local` file:

```
GOOGLE_GENAI_API_KEY=your_actual_api_key_here
```

**Important**: Never commit your `.env.local` file to Git. It's already included in `.gitignore`.

### 3. Install Dependencies and Run

```bash
npm install
npm run dev
```

The app should now work properly and generate Swedish words using AI.

## For Vercel Deployment

When deploying to Vercel, you'll need to add the `GOOGLE_GENAI_API_KEY` as an environment variable in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add `GOOGLE_GENAI_API_KEY` with your API key value
4. Redeploy your project

## Troubleshooting

If you see an error like "Cannot read properties of undefined (reading 'hash')", it means the Google AI API key is not properly configured.

1. Check that your `.env.local` file exists and contains the API key
2. Restart your development server after adding environment variables
3. Make sure the API key is valid and has the necessary permissions