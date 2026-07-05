import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useTransactions } from '../hooks/useTransactions';
import { useBudget } from '../hooks/useBudget';
import { generateFinancialInsights } from '../services/geminiApi';
import type { AiInsights } from '../services/geminiApi';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  BrainCircuit, 
  TrendingUp, 
  PiggyBank, 
  AlertTriangle,
  Lightbulb,
  MessageSquare
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const AiAssistant: React.FC = () => {
  const { transactions } = useTransactions();
  const { monthlyBudget, totalExpenses } = useBudget();

  // Audit State
  const [insights, setInsights] = useState<AiInsights | null>(null);
  const [isGeneratingAudit, setIsGeneratingAudit] = useState(false);
  const [auditError, setAuditError] = useState('');

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your FinSight AI financial assistant. Ask me anything about your budget, savings tips, or financial planning!' }
  ]);
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Generate Report
  const handleGenerateAudit = async () => {
    setIsGeneratingAudit(true);
    setAuditError('');
    try {
      const data = await generateFinancialInsights(transactions, monthlyBudget);
      setInsights(data);
    } catch (err: any) {
      console.error(err);
      setAuditError(err.message || 'Failed to generate report. Make sure your API Key is configured.');
    } finally {
      setIsGeneratingAudit(false);
    }
  };

  // Send Chat Message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsSendingChat(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY is not configured.');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Build context of transactions for the chat assistant
      const totalBalance = transactions
        .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

      const promptContext = `
        You are FinSight AI, a helpful, premium personal finance assistant.
        
        User context:
        - Monthly Budget Limit: ₹${monthlyBudget}
        - Total expenses logged this month: ₹${totalExpenses}
        - All-time Net Balance: ₹${totalBalance}
        - Total transactions logged: ${transactions.length}
        
        Use this context to answer the user's question accurately. Keep answers concise, actionable, and structured with bullet points if helpful.
        
        Question: ${userMessage}
      `;

      const result = await model.generateContent(promptContext);
      const reply = result.response.text();

      setChatHistory((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (err: any) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev, 
        { role: 'model', text: 'Sorry, I couldn\'t process that question. Please make sure your Gemini API Key is configured correctly.' }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
              AI Financial Assistant
            </h1>
            <p className="text-dark-400 text-sm mt-1">
              Ask questions or generate a smart ledger audit powered by Gemini.
            </p>
          </div>
        </div>

        {/* Action / Select Tabs */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Block: Audit Report */}
          <div className="xl:col-span-2 space-y-8">
            <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-accent-purple/15 text-accent-purple">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ledger Spending Audit</h3>
                </div>
                
                <button
                  id="ai-generate-audit"
                  onClick={handleGenerateAudit}
                  disabled={isGeneratingAudit || transactions.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue hover:from-accent-purple/95 hover:to-accent-blue/95 text-white text-xs font-bold shadow-lg shadow-accent-purple/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGeneratingAudit ? 'Running Audit...' : 'Run Gemini Audit'}
                </button>
              </div>

              {transactions.length === 0 && (
                <div className="p-4 rounded-xl bg-dark-900 border border-white/5 text-center text-xs text-dark-500">
                  You need to log at least one transaction to run an AI audit.
                </div>
              )}

              {auditError && (
                <div className="p-3 rounded-lg bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-xs font-semibold">
                  {auditError}
                </div>
              )}

              {/* Generating Animation */}
              {isGeneratingAudit && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-accent-purple animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-accent-blue animate-spin" style={{ animationDirection: 'reverse' }}></div>
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-semibold text-white animate-pulse">Running Ledgers through Gemini AI...</p>
                    <p className="text-[10px] text-dark-500">Auditing categories, identifying unnecessary costs, and drafting summaries.</p>
                  </div>
                </div>
              )}

              {/* Display Audit Results */}
              <AnimatePresence>
                {insights && !isGeneratingAudit && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Summary */}
                    <div className="glass-accent-purple p-5 rounded-2xl border border-accent-purple/10">
                      <h4 className="text-xs font-bold text-accent-purple uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>Financial Summary</span>
                      </h4>
                      <p className="text-xs text-dark-200 leading-relaxed font-medium">
                        {insights.summary}
                      </p>
                    </div>

                    {/* Report Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Spending Analysis */}
                      <div className="glass p-4 rounded-xl border border-white/5 space-y-3">
                        <h5 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-accent-blue" />
                          <span>Spending Analysis</span>
                        </h5>
                        <ul className="space-y-2">
                          {insights.spendingAnalysis.map((item, idx) => (
                            <li key={idx} className="text-xs text-dark-300 leading-relaxed list-disc list-inside">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Savings Suggestions */}
                      <div className="glass p-4 rounded-xl border border-white/5 space-y-3">
                        <h5 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          <span>Money Saving Tips</span>
                        </h5>
                        <ul className="space-y-2">
                          {insights.savingSuggestions.map((item, idx) => (
                            <li key={idx} className="text-xs text-dark-300 leading-relaxed list-disc list-inside">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Budget Recommendations */}
                      <div className="glass p-4 rounded-xl border border-white/5 space-y-3">
                        <h5 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <PiggyBank className="w-4 h-4 text-accent-purple" />
                          <span>Budget Recommendations</span>
                        </h5>
                        <ul className="space-y-2">
                          {insights.budgetRecommendations.map((item, idx) => (
                            <li key={idx} className="text-xs text-dark-300 leading-relaxed list-disc list-inside">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Unnecessary Spending */}
                      <div className="glass p-4 rounded-xl border border-white/5 space-y-3">
                        <h5 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-accent-rose" />
                          <span>Unnecessary Leakages</span>
                        </h5>
                        <ul className="space-y-2">
                          {insights.unnecessarySpending.map((item, idx) => (
                            <li key={idx} className="text-xs text-dark-300 leading-relaxed list-disc list-inside">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Block: Interactive Chat Assistant */}
          <div className="space-y-8">
            <div className="glass-card rounded-2xl border border-white/5 flex flex-col h-[550px] overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 flex items-center gap-2 shrink-0 bg-dark-900/50">
                <div className="p-1.5 rounded-lg bg-accent-purple/15 text-accent-purple">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Financial Coach</h4>
                  <p className="text-[9px] text-dark-500">Instant answers to budget questions</p>
                </div>
              </div>

              {/* Chat Message Logs */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                {chatHistory.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3 rounded-xl border leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-accent-purple border-accent-purple/20 text-white rounded-br-none'
                        : 'glass border-white/5 text-dark-200 rounded-bl-none'
                    }`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {isSendingChat && (
                  <div className="flex justify-start">
                    <div className="glass p-3 rounded-xl border border-white/5 text-dark-400 rounded-bl-none flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Form Input */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-white/5 bg-dark-950/80 flex gap-2 shrink-0">
                <input
                  id="chat-input"
                  type="text"
                  required
                  placeholder="Ask a question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl glass-input text-xs"
                  disabled={isSendingChat}
                />
                <button
                  id="chat-submit"
                  type="submit"
                  disabled={isSendingChat || !chatInput.trim()}
                  className="p-2.5 rounded-xl bg-accent-purple hover:bg-accent-purple/90 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default AiAssistant;
