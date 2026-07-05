import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Transaction } from './firebaseDb';

export interface AiInsights {
  summary: string;
  spendingAnalysis: string[];
  savingSuggestions: string[];
  budgetRecommendations: string[];
  unnecessarySpending: string[];
}

export const generateFinancialInsights = async (
  transactions: Transaction[],
  monthlyBudget: number
): Promise<AiInsights> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not configured in environment variables.');
  }

  // Check if there are transactions to analyze
  if (transactions.length === 0) {
    return {
      summary: "You don't have any transactions logged yet. Add transaction logs to generate personalized AI financial insights.",
      spendingAnalysis: [],
      savingSuggestions: [],
      budgetRecommendations: [],
      unnecessarySpending: []
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-1.5-flash for fast and cost-effective text analysis
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    }
  });

  // Prepare transaction summary data for prompt to minimize tokens
  const txDataForPrompt = transactions.map((t) => ({
    title: t.title,
    amount: t.amount,
    category: t.category,
    date: t.date,
    type: t.type,
  }));

  const prompt = `
    You are an expert personal finance coach. Analyze the user's transaction logs and monthly budget to provide actionable financial advice.
    
    User Monthly Budget: ₹${monthlyBudget} (0 means no budget set)
    
    Transactions Data (JSON):
    ${JSON.stringify(txDataForPrompt, null, 2)}
    
    Generate financial insights strictly in the following JSON format:
    {
      "summary": "A 2-3 sentence overview of their financial health, highlights of their net balance, and major changes.",
      "spendingAnalysis": [
        "Insight statement 1 (e.g. 'You spent 40% of your income on food.')",
        "Insight statement 2"
      ],
      "savingSuggestions": [
        "Actionable suggestion 1 (e.g. 'Try reducing restaurant expenses by ₹3000 this month.')",
        "Actionable suggestion 2"
      ],
      "budgetRecommendations": [
        "Budget adjustment recommendation 1",
        "Budget adjustment recommendation 2"
      ],
      "unnecessarySpending": [
        "Detected unnecessary spending 1 (e.g., repeating bills, subscriptions, luxury shopping spikes)",
        "Detected unnecessary spending 2"
      ]
    }

    Notes:
    - Use Indian Rupees (₹) for money notations.
    - Provide precise calculations (e.g. percentages, total spending in major categories).
    - If no monthly budget is set, recommend a reasonable budget based on their expenses.
    - Be supportive, encouraging, but direct about leakages.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const insights = JSON.parse(responseText) as AiInsights;
    return insights;
  } catch (error) {
    console.error('Failed to generate or parse Gemini AI insights:', error);
    
    // Fallback in case JSON parsing or generation fails
    return {
      summary: "We encountered an issue analyzing your transactions. Please ensure your Gemini API Key is valid and try again.",
      spendingAnalysis: [
        `Total transactions logged: ${transactions.length}`,
        `Net cashflow balance: ₹${transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)}`
      ],
      savingSuggestions: [
        "Set up a monthly budget cap in your Profile to help the AI align recommendations.",
        "Categorize your transactions accurately to improve audit quality."
      ],
      budgetRecommendations: [
        "Try allocating 50% to needs, 30% to wants, and 20% to savings."
      ],
      unnecessarySpending: [
        "No major unnecessary spending alerts could be parsed at this moment."
      ]
    };
  }
};
export default generateFinancialInsights;
