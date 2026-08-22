import { ai } from '../config/apiClients.js';
import { Type } from '@google/genai';

/**
 * Generates structured meeting insights from a raw transcript using Gemini 2.5 Flash.
 * @param {string} transcript - The raw meeting transcript.
 * @returns {Promise<{title: string, overview: string, key_decisions: string[], action_items: Array<{task: string, assignee: string, priority: string}>}>}
 */
export async function generateMeetingInsights(transcript) {
  if (!transcript || transcript.trim() === '') {
    throw new Error('Transcript content is required to generate meeting insights.');
  }

  const prompt = `You are an expert executive meeting assistant. Analyze the following meeting transcript and extract structured insights.

Transcript:
"""
${transcript}
"""

Instructions:
1. title: Generate a concise, professional title for the meeting.
2. overview: Write a 2-3 sentence executive summary capturing the main purpose and core discussion points.
3. key_decisions: List all significant conclusions, agreements, or decisions reached during the meeting as an array of strings.
4. action_items: Identify all actionable tasks. For each task, extract:
   - task: Clear description of the action to be taken.
   - assignee: Name or role of the person responsible (use "Unassigned" if not specified).
   - priority: Urgency level, strictly one of "High", "Medium", or "Low".`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'A concise, professional meeting title'
          },
          overview: {
            type: Type.STRING,
            description: 'A 2-3 sentence executive summary of the meeting'
          },
          key_decisions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of key decisions agreed upon during the meeting'
          },
          action_items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: {
                  type: Type.STRING,
                  description: 'Description of the action item task'
                },
                assignee: {
                  type: Type.STRING,
                  description: 'Person or role assigned to the task (or "Unassigned")'
                },
                priority: {
                  type: Type.STRING,
                  enum: ['High', 'Medium', 'Low'],
                  description: 'Priority level of the task'
                }
              },
              required: ['task', 'assignee', 'priority']
            },
            description: 'List of actionable items with assignees and priorities'
          }
        },
        required: ['title', 'overview', 'key_decisions', 'action_items']
      }
    }
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Received an empty response from the Gemini API.');
  }

  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    // Strip possible markdown fences if returned
    const cleanedJson = responseText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1').trim();
    return JSON.parse(cleanedJson);
  }
}
