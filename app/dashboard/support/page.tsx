'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2, Plus, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getMyTickets, createTicket, sendMessage } from '@/lib/api';

export default function SupportCenterPage() {
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('GENERAL');
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await getMyTickets();
      setTickets(res.data || []);
      if (res.data?.length > 0 && !activeTicketId) {
        setActiveTicketId(res.data[0].id);
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !message.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await createTicket(newSubject, newCategory, message);
      await fetchTickets();
      setIsCreatingNew(false);
      setNewSubject('');
      setMessage('');
      if (res.data?.id) {
        setActiveTicketId(res.data.id);
      }
      window.dispatchEvent(new Event('ticket-updated'));
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (isLoading && tickets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden lg:flex-row">
      
      {/* Sidebar: Ticket List */}
      <div className={`w-full lg:w-80 border-r border-slate-100 flex flex-col bg-slate-50 ${!isCreatingNew && activeTicketId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            Support Tickets
          </h2>
          <button
            onClick={() => {
              setIsCreatingNew(true);
              setActiveTicketId(null);
              setMessage('');
            }}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
            title="Create New Ticket"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tickets.length === 0 && !isCreatingNew ? (
            <div className="text-center py-10 px-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-500 font-medium">No active support tickets.</p>
              <button 
                onClick={() => setIsCreatingNew(true)}
                className="mt-3 text-xs text-emerald-600 font-bold hover:underline"
              >
                Create one now
              </button>
            </div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => {
                  setActiveTicketId(ticket.id);
                  setIsCreatingNew(false);
                  setMessage('');
                }}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  activeTicketId === ticket.id && !isCreatingNew
                    ? 'bg-white border-emerald-200 shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-800 truncate pr-2">{ticket.subject}</span>
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                    ticket.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                    ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mb-1">{ticket.category}</div>
                <div className="text-[10px] text-slate-400">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Area: Chat / Form */}
      <div className={`flex-1 flex flex-col bg-white ${isCreatingNew || activeTicketId ? 'flex' : 'hidden lg:flex'}`}>
        
        {isCreatingNew ? (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <div className="max-w-xl w-full mx-auto">
              <div className="mb-6">
                <button 
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 mb-4 flex items-center gap-1 lg:hidden"
                >
                  ← Back to Tickets
                </button>
                <h2 className="text-xl font-black text-slate-800">Create Support Ticket</h2>
                <p className="text-xs text-slate-500 mt-1">Describe your issue in detail so we can help you.</p>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Brief summary of the issue"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                    minLength={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="GENERAL">General Inquiry</option>
                    <option value="ACCOUNT_ISSUE">Account Issue</option>
                    <option value="PAYMENT_ISSUE">Payment Issue</option>
                    <option value="ORDER_DISPUTE">Order Dispute</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide detailed information..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all h-32 resize-none"
                    required
                    minLength={5}
                  />
                </div>
                {error && <p className="text-rose-500 text-xs font-bold">{error}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Ticket
                </button>
              </form>
            </div>
          </div>
        ) : activeTicket ? (
          <>
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <button 
                onClick={() => setActiveTicketId(null)}
                className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800"
              >
                ←
              </button>
              <div>
                <h3 className="text-sm font-bold text-slate-800">{activeTicket.subject}</h3>
                <span className="text-[10px] text-slate-500 font-medium">Ticket ID: {activeTicket.id}</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {activeTicket.messages?.map((msg: any, idx: number) => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div key={msg.id || idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 px-1">
                      {isMine ? 'You' : (msg.senderRole === 'SUPER_ADMIN' ? 'Admin' : 'Support')}
                    </span>
                    <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMine 
                        ? 'bg-slate-900 text-white rounded-tr-none shadow-md shadow-slate-900/10'
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
                    placeholder="Type a reply..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                    minLength={5}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center shadow-md shadow-emerald-500/20"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 flex-col text-center hidden lg:flex">
            <MessageSquare className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Support Center</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">Select a ticket from the left or create a new one to chat with the admin.</p>
          </div>
        )}
        
      </div>
    </div>
  );
}
