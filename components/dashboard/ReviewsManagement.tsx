'use client';

import React, { useState, useEffect } from 'react';
import { Star, Search, Filter, Trash2, ShieldAlert, X, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';
import { getAllReviews, deleteReview } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [deleteModalReview, setDeleteModalReview] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllReviews();
      setReviews(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteModalReview) return;
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await deleteReview(deleteModalReview.id);
      
      // Update state
      setReviews((prev) => prev.filter((r) => r.id !== deleteModalReview.id));
      setDeleteModalReview(null);
    } catch (err: any) {
      console.error(err);
      setDeleteError(err.message || 'Failed to delete review.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    const gigTitle = r.gig?.title?.toLowerCase() || '';
    const clientName = r.client?.name?.toLowerCase() || '';
    const comment = r.comment?.toLowerCase() || '';
    return gigTitle.includes(q) || clientName.includes(q) || comment.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by gig, client, or comment content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73] transition-all"
          />
        </div>
        <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs whitespace-nowrap">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-500 flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-[#1dbf73] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-medium text-sm">Loading reviews...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h3 className="text-rose-800 font-bold mb-1">Failed to Load Reviews</h3>
          <p className="text-rose-600 text-sm">{error}</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-500">
          <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-slate-800 font-bold mb-1">No reviews found</h3>
          <p className="text-sm">We couldn't find any reviews matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Review Content</th>
                  <th className="py-3.5 px-4">Gig & Order</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="max-w-xs space-y-1">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`}
                            />
                          ))}
                          <span className="ml-1.5 text-[10px] font-black text-amber-800 bg-amber-50 px-1.5 rounded">{review.rating}.0</span>
                        </div>
                        <p className="text-xs text-slate-700 italic line-clamp-3 leading-relaxed">"{review.comment}"</p>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div>
                        <Link
                          href={`/gigs/${review.gig?.id}`}
                          className="font-bold text-slate-800 text-xs block group-hover:text-[#1dbf73] transition-colors line-clamp-1"
                        >
                          {review.gig?.title || 'Unknown Gig'}
                        </Link>
                        <span className="text-[10px] text-slate-500 block mt-0.5 font-mono uppercase">Order: #{review.orderId.slice(0,8)}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs font-medium text-slate-700">
                      {review.client?.name || 'Unknown Client'}
                    </td>

                    <td className="py-4 px-4 text-slate-500 font-medium text-[11px]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteModalReview(review)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer inline-flex"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setDeleteModalReview(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Delete Review?</h3>
              <p className="text-sm text-slate-500 px-4 leading-relaxed">
                Are you sure you want to permanently delete this review? This action cannot be undone.
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left text-xs space-y-2">
              <p><span className="font-bold text-slate-700">Client:</span> {deleteModalReview.client?.name}</p>
              <p><span className="font-bold text-slate-700">Rating:</span> {deleteModalReview.rating} Stars</p>
              <p className="italic text-slate-600">"{deleteModalReview.comment}"</p>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalReview(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold transition-colors cursor-pointer text-sm flex justify-center items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
