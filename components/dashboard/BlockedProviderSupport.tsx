import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Send, LogOut, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { submitAppeal, getMyTickets, sendMessage } from '@/lib/api';

export default function BlockedProviderSupport() {
  const { user, logout } = useAuth();
  
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await getMyTickets();
      if (res.data && res.data.length > 0) {
        // Find the block appeal ticket, or just the latest ticket
        const blockAppealTicket = res.data.find((t: any) => t.category === 'BLOCK_APPEAL') || res.data[0];
        setTicket(blockAppealTicket);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket?.messages]);

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user?.email) return;

    try {
      setIsSubmitting(true);
      setError('');
      await submitAppeal(user.email, message);
      setMessage('');
      await fetchTickets(); // Refresh to show chat
    } catch (err: any) {
      setError(err.message || 'Failed to submit appeal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !ticket) return;

    try {
      setIsSubmitting(true);
      setError('');
      await sendMessage(ticket.id, message);
      setMessage('');
      await fetchTickets(); // Refresh to show new message
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
        <p className="text-slate-400 font-bold tracking-widest text-sm uppercase">Loading Support Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-2xl w-full h-[80vh] flex flex-col bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl z-10 relative overflow-hidden">
        
        {/* Header Section */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 border border-rose-500/40 rounded-full animate-ping opacity-20" />
              <ShieldAlert className="w-6 h-6 text-rose-500 drop-shadow-md" />
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[9px] font-extrabold uppercase tracking-widest mb-1">
                Account Suspended
              </span>
              <h1 className="text-xl font-black text-white tracking-tight">Admin Support</h1>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Info Banner */}
        <div className="flex-shrink-0 p-4 bg-rose-500/5 border-b border-rose-500/10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            Your account is currently blocked. {user?.blockReason ? `Reason: ${user.blockReason}` : 'Please discuss with the admin to resolve the issue.'}
          </p>
        </div>

        {/* Main Content Area */}
        {ticket ? (
          <>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              {ticket.messages?.map((msg: any, idx: number) => {
                const isMine = msg.senderId === user?.id;
                
                return (
                  <div key={msg.id || idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 px-1">
                      {isMine ? 'You' : (msg.senderRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Support')}
                    </span>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      isMine 
                        ? 'bg-rose-600 text-white rounded-tr-none shadow-[0_4px_20px_rgba(225,29,72,0.2)]'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none shadow-md'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="flex-shrink-0 p-4 sm:p-6 bg-slate-900 border-t border-slate-800">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message to the Super Admin..."
                  className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(225,29,72,0.2)] hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2 shrink-0"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
              {error && <p className="text-rose-400 text-xs font-medium mt-2 ml-1">{error}</p>}
            </div>
          </>
        ) : (
          /* Appeal Submission Form */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">
              <div className="text-center space-y-2">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto opacity-50" />
                <h3 className="text-lg font-bold text-white">Start a Conversation</h3>
                <p className="text-sm text-slate-400">
                  You haven't submitted an appeal yet. Please explain your situation to initiate a chat with the super admin.
                </p>
              </div>

              <form onSubmit={handleAppealSubmit} className="space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain why your account should be unblocked in detail..."
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl p-4 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all resize-none h-32 shadow-inner"
                  required
                  minLength={10}
                />
                {error && <p className="text-rose-400 text-xs font-medium">{error}</p>}
                
                <button
                  type="submit"
                  disabled={isSubmitting || message.length < 10}
                  className="w-full px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Appeal...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Appeal & Start Chat
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
