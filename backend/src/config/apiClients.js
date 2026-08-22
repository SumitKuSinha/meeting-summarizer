import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Groq client
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

// Initialize Google GenAI client
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

export const googleGenAI = ai;
