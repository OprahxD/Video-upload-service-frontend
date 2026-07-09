import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Tweets = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const fetchAllTweets = async () => {
        const res = await api.get('/tweets?page=1&limit=100');
        return res.data.data;
    };

    const { data: tweets = [], isLoading, isError } = useQuery({
        queryKey: ['allTweets'],
        queryFn: fetchAllTweets,
    });

    const toggleLikeTweetMutation = useMutation({
        mutationFn: async (tweetId) => {
            const res = await api.post(`/likes/toggle/t/${tweetId}`);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allTweets'] });
        }
    });

    return (
        <div className="w-full flex flex-col items-center min-h-screen pt-10 px-4">
            <header className="mb-12 w-full max-w-4xl">
                <div className="flex justify-between items-start mb-6">
                    <div className="text-archival-muted text-xs uppercase tracking-widest font-mono">
                        Source / Drawer / Global / Timeline
                    </div>
                </div>
                <div className="border-b border-archival-border pb-6">
                    <h2 className="text-4xl md:text-5xl font-serif text-archival-accent tracking-tight mb-2">Registered Dispatches</h2>
                    <p className="font-mono text-sm text-archival-muted">A chronicle of dispatches from all catalogued users.</p>
                </div>
            </header>

            <main className="w-full max-w-4xl flex flex-col gap-6 mb-16">
                {isLoading ? (
                    <div className="animate-pulse font-mono text-archival-muted">Retrieving global dispatches...</div>
                ) : isError ? (
                    <div className="text-red-400 font-mono text-xs">Error loading dispatches.</div>
                ) : tweets && tweets.length > 0 ? (
                    <div className="flex flex-col gap-6 font-mono text-sm">
                        {tweets.map(tweet => (
                            <div key={tweet._id} className="border border-archival-border bg-archival-bg-secondary p-6 shadow-polaroid flex flex-col gap-4">
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-3">
                                        {tweet.author?.avatar && (
                                            <img src={tweet.author.avatar} alt="author" className="w-6 h-6 rounded-full border border-archival-border" />
                                        )}
                                        <span className="font-bold text-archival-text">@{tweet.author?.username || 'unknown'}</span>
                                    </div>
                                    <span className="text-archival-muted">{new Date(tweet.createdAt).toLocaleString()}</span>
                                </div>

                                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-sm">{tweet.content}</p>

                                <div className="flex justify-between items-center border-t border-archival-border pt-4 text-xs">
                                    <button 
                                        onClick={() => toggleLikeTweetMutation.mutate(tweet._id)}
                                        disabled={!user || toggleLikeTweetMutation.isPending}
                                        className="flex items-center gap-1.5 opacity-70 hover:opacity-100 hover:text-archival-accent transition-colors disabled:opacity-50"
                                    >
                                        {tweet.isLiked ? (
                                            <svg className="w-3.5 h-3.5 text-archival-accent" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                                            </svg>
                                        ) : (
                                            <svg className="w-3.5 h-3.5 text-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                            </svg>
                                        )}
                                        <span>{tweet.likesCount || 0} Likes</span>
                                    </button>
                                    <span className="text-[10px] text-archival-muted">ID: {tweet._id.slice(-6)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="font-mono text-archival-muted">No dispatches found in the central ledger.</p>
                )}
            </main>
        </div>
    );
};

export default Tweets;
