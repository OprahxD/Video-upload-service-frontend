import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const VideoComments = ({ videoId }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState('');

    const { data: comments = [], status } = useQuery({
        queryKey: ['comments', videoId],
        queryFn: async () => {
            const res = await api.get(`/comments/${videoId}?page=1&limit=50`);
            // Backend returns the array directly, not paginated
            const raw = res.data.data;
            return Array.isArray(raw) ? raw : [];
        },
    });

    const addCommentMutation = useMutation({
        mutationFn: async (commentContent) => {
            const res = await api.post(`/comments/${videoId}`, { commentContent });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
            setNewComment('');
        }
    });

    const toggleLikeMutation = useMutation({
        mutationFn: async (commentId) => {
            const res = await api.post(`/likes/toggle/c/${commentId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;
        addCommentMutation.mutate(newComment);
    };

    if (status === 'pending') return <div className="text-archival-muted font-mono text-xs mt-8">Loading records...</div>;
    if (status === 'error') return <div className="text-red-900 font-mono text-xs mt-8">Failed to load associated records.</div>;

    return (
        <div className="mt-16 border-t border-archival-border pt-8">
            <h3 className="font-serif text-2xl mb-6 text-archival-accent">
                Comments ({comments.length})
            </h3>
            
            {user ? (
                <form onSubmit={handleSubmit} className="mb-10 flex gap-4">
                    <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-archival-border flex-shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="bg-transparent border-b border-archival-border pb-2 outline-none text-sm font-mono text-archival-text focus:border-archival-accent transition-colors resize-none overflow-hidden"
                            rows={2}
                        />
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={addCommentMutation.isPending || !newComment.trim()}
                                className="bg-archival-text text-archival-bg px-4 py-1 font-mono text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-opacity-90"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-10 p-4 border border-archival-border text-center font-mono text-xs text-archival-muted">
                    Sign in to leave a comment.
                </div>
            )}

            <div className="flex flex-col gap-8">
                {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-4">
                        <img src={comment.owner?.avatar} alt="author" className="w-10 h-10 rounded-full border border-archival-border flex-shrink-0" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm tracking-wide">{comment.owner?.username}</span>
                                <span className="text-archival-muted font-mono text-xs">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm font-sans mb-2 text-gray-200">{comment.content}</p>
                            <div className="flex items-center gap-4 text-xs font-mono">
                                <button 
                                    onClick={() => user && toggleLikeMutation.mutate(comment._id)}
                                    disabled={!user}
                                    className={`flex items-center gap-1 opacity-70 transition-colors ${user ? 'hover:opacity-100 hover:text-archival-accent' : 'cursor-default opacity-50'}`}
                                >
                                    {comment.isLiked ? (
                                        <svg className="w-3.5 h-3.5 text-archival-accent" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5 text-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                        </svg>
                                    )}
                                    <span>{comment.likesCount || 0}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <div className="text-center font-mono text-xs text-archival-muted py-8">
                        No comments yet. Be the first to comment.
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoComments;
