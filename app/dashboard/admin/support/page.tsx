'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2, User, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { getAllTicketsAdmin, sendMessage, reviewTicketAdmin } from '@/lib/api';

export default function AdminSupportCenterPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await getAllTicketsAdmin();
      const ticketsArray = res.data?.data || [];
      setTickets(ticketsArray);
      if (ticketsArray.length > 0 && !activeTicketId) {
        setActiveTicketId(ticketsArray[0].id);
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

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeTicketId) return;

    try {
      setIsSubmitting(true);
      setError('');
      await sendMessage(activeTicketId, message);
      setMessage('');
      await fetchTickets();
      window.dispatchEvent(new Event('ticket-updated'));
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppealAction = async (action: 'APPROVE' | 'REJECT' | 'IN_REVIEW') => {
    if (!activeTicketId) return;
    try {
      setIsSubmitting(true);
      await reviewTicketAdmin(activeTicketId, action);
      await fetchTickets();
      window.dispatchEvent(new Event('ticket-updated'));
    } catch (err: any) {
      setError(err.message || 'Failed to review appeal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && tickets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden lg:flex-row">
      
      {/* Sidebar: Ticket List */}
      <div className={`w-full lg:w-80 border-r border-slate-100 flex flex-col bg-slate-50 ${activeTicketId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-500" />
            Platform Tickets
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tickets.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-500 font-medium">All caught up! No active tickets.</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => {
                  setActiveTicketId(ticket.id);
                  setMessage('');
                }}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  activeTicketId === ticket.id
                    ? 'bg-white border-indigo-200 shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-800 truncate pr-2">{ticket.subject}</span>
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                    ticket.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                    ticket.category === 'BLOCK_APPEAL' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mb-1">
                  <span className="font-bold text-indigo-600">{ticket.category}</span> • {ticket.user?.name || 'User'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Area: Chat */}
      <div className={`flex-1 flex flex-col bg-white ${activeTicketId ? 'flex' : 'hidden lg:flex'}`}>
        
        {activeTicket ? (
          <>
            <div className="p-4 border-b border-slate-100 flex flex-col bg-slate-50">
              <div className="flex items-center gap-3 mb-3">
                <button 
                  onClick={() => setActiveTicketId(null)}
                  className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800"
                >
                  ←
                </button>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{activeTicket.subject}</h3>
                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                    <User className="w-3 h-3" /> {activeTicket.user?.name} ({activeTicket.user?.email})
                  </div>
                </div>
              </div>

              {activeTicket.category === 'BLOCK_APPEAL' && activeTicket.user?.status === 'BLOCKED' ? (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-3 justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">Action Required</span>
                    <p className="text-xs text-rose-800">This user is currently blocked and is appealing to be unblocked.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAppealAction('APPROVE')}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-[10px] font-bold transition-all"
                    >
                      Approve & Unblock
                    </button>
                    <button 
                      onClick={() => handleAppealAction('REJECT')}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold transition-all"
                    >
                      Reject Appeal
                    </button>
                  </div>
                </div>
              ) : activeTicket.status !== 'RESOLVED' && activeTicket.status !== 'REJECTED' ? (
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    <p className="text-xs text-slate-600 font-medium">Is this issue resolved?</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAppealAction('APPROVE')}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs"
                    >
                      Mark as Resolved
                    </button>
                    <button 
                      onClick={() => handleAppealAction('REJECT')}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-lg text-[10px] font-bold transition-all"
                    >
                      Close Ticket
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
              {activeTicket.messages?.map((msg: any, idx: number) => {
                const isMine = msg.senderRole === 'SUPER_ADMIN';
                return (
                  <div key={msg.id || idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 px-1">
                      {isMine ? 'You (Admin)' : (msg.senderRole === 'PROVIDER' ? 'Provider' : 'Client')}
                    </span>
                    <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMine 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                        : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              {activeTicket.status === 'RESOLVED' || activeTicket.status === 'REJECTED' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-slate-500 text-sm font-medium">
                  This ticket has been closed. You cannot send further messages.
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a reply to the user..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    required
                    minLength={5}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center shadow-md shadow-indigo-600/20"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 flex-col text-center hidden lg:flex">
            <ShieldAlert className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Admin Support Hub</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">Select a ticket from the left to review appeals and assist platform users.</p>
          </div>
        )}
        
      </div>
    </div>
  );
}
