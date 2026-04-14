import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { ChatMessage } from '../types';
import { Card, Button } from '../components/UI';
import { Send, Bot } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';

export const Chat: React.FC = () => {
  const { currentUser, messages, sendMessage, jobs, applications, companies } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentUser) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: input,
      timestamp: new Date().toISOString(),
      isAi: false
    };

    sendMessage(userMsg);
    setInput('');

    // Construct Context based on Role
    let context = `Current user is a ${currentUser.role}. Name: ${currentUser.name}.`;

    if (currentUser.role === 'STUDENT') {
        context += ` Department: ${currentUser.department || 'N/A'}. Skills: ${currentUser.skills?.join(', ') || 'N/A'}.`;
        const myApps = applications.filter(a => a.studentId === currentUser.id);
        if (myApps.length > 0) {
            context += ` Applied to ${myApps.length} jobs.`;
            const recentApps = myApps.slice(-3).map(a => {
                const job = jobs.find(j => j.id === a.jobId);
                return `${job?.title} (${a.status})`;
            }).join(', ');
            context += ` Recent applications: ${recentApps}.`;
        } else {
            context += ` Has not applied to any jobs yet.`;
        }
    } else if (currentUser.role === 'HR') {
        const myCompany = companies.find(c => c.id === currentUser.companyId);
        context += ` Company: ${myCompany?.name || 'Unknown'}.`;
        const myJobs = jobs.filter(j => j.postedBy === currentUser.id);
        context += ` Posted ${myJobs.length} jobs.`;
    }

    // Simulate AI Response if addressing support
    setIsTyping(true);
    const aiResponse = await chatWithAI(userMsg.text, context);
    
    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      senderId: 'ai-bot',
      text: aiResponse,
      timestamp: new Date().toISOString(),
      isAi: true
    };
    sendMessage(botMsg);
    setIsTyping(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
       <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Bot size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-800">RecruitEase Assistant</h3>
                    <p className="text-xs text-green-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</p>
                 </div>
              </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
             {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-10">
                    <Bot size={48} className="mx-auto mb-2 opacity-20" />
                    <p>Start a conversation with our AI Assistant.</p>
                </div>
             )}
             {messages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                return (
                   <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 border shadow-sm rounded-tl-none'
                      }`}>
                         <p className="text-sm">{msg.text}</p>
                         <span className="text-[10px] opacity-70 mt-1 block text-right">
                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                      </div>
                   </div>
                );
             })}
             {isTyping && (
                 <div className="flex justify-start">
                    <div className="bg-white border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                 </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
             <input 
                type="text" 
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-gray-50"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
             />
             <button 
                type="submit" 
                disabled={!input.trim()}
                className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
             >
                <Send size={20} />
             </button>
          </form>
       </div>
    </div>
  );
};