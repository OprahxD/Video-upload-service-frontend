import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import VideoComments from '../components/VideoComments';
import ErrorBoundary from '../components/ErrorBoundary';

const VideoPlayer = () => {
    const { videoId } = useParams();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: video, isLoading, isError, error } = useQuery({
        queryKey: ['video', videoId],
        queryFn: async () => {
            const res = await api.get(`/videos/${videoId}`);
            return res.data.data;
        },
    });

    React.useEffect(() => {
        if (videoId) {
            api.patch(`/videos/view/${videoId}`).catch(err => {
                console.error("Failed to increment view:", err);
            });
        }
    }, [videoId]);

    const toggleLikeMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post(`/likes/toggle/v/${videoId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['video', videoId] });
        }
    });

    const toggleSubscriptionMutation = useMutation({
        mutationFn: async (channelId) => {
            const res = await api.post(`/subscriptions/c/${channelId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['video', videoId] });
        }
    });

    const fetchMyPlaylists = async () => {
        const res = await api.get(`/playlist/user/${user?._id}`);
        return res.data.data;
    };

    const { data: myPlaylists = [] } = useQuery({
        queryKey: ['myPlaylists', user?._id],
        queryFn: fetchMyPlaylists,
        enabled: !!user
    });

    const addToPlaylistMutation = useMutation({
        mutationFn: async (playlistId) => {
            const res = await api.patch(`/playlist/add/${videoId}/${playlistId}`);
            return res.data.data;
        },
        onSuccess: () => {
            alert("Video added to playlist successfully.");
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to add video to playlist");
        }
    });

    if (isLoading) return (
        <div className="flex justify-center items-center h-[60vh] w-full">
            <div className="animate-pulse font-mono text-archival-muted text-sm tracking-widest uppercase">Loading video...</div>
        </div>
    );
    
    if (isError || !video) return (
        <div className="flex flex-col justify-center items-center h-[60vh] w-full gap-4">
            <div className="font-mono text-red-400 text-sm tracking-widest uppercase">
                Failed to load video.
            </div>
            <div className="font-mono text-archival-muted text-xs">
                {error?.response?.data?.message || error?.message || 'Unknown error'}
            </div>
            <Link to="/" className="border border-archival-border px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-archival-bg-secondary transition-colors mt-4">
                ← Back to Home
            </Link>
        </div>
    );

    return (
        <div className="w-full flex justify-center py-8 px-4 sm:px-8">
            <div className="w-full max-w-5xl flex flex-col gap-6">
                
                {/* 16:9 Black Bar Container */}
                <div className="w-full bg-black border border-archival-border overflow-hidden aspect-video">
                    <video 
                        src={video.videoFile}
                        poster={video.thumbnail}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                    />
                </div>
                
                {/* Video Meta Information */}
                <div>
                    <h1 className="text-3xl sm:text-4xl font-serif text-archival-accent mb-4 tracking-tight">
                        {video.title}
                    </h1>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-archival-border pb-6 gap-6">
                        <div className="flex items-center gap-4">
                            <Link to={`/c/${video.owner?.username}`} className="flex items-center gap-4 hover:opacity-85 transition-opacity">
                                {video.owner?.avatar && (
                                    <img src={video.owner.avatar} alt="owner" className="w-12 h-12 rounded-full border border-archival-border" />
                                )}
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg tracking-wide text-archival-text hover:underline">
                                        {video.owner?.fullName || video.owner?.username || 'Unknown'}
                                    </span>
                                    <span className="font-mono text-xs text-archival-muted">
                                        {video.owner?.subscribersCount || 0} Subscribers
                                    </span>
                                </div>
                            </Link>
                            
                            {user && user._id !== video.owner?._id && (
                                <button 
                                    onClick={() => toggleSubscriptionMutation.mutate(video.owner?._id)}
                                    disabled={toggleSubscriptionMutation.isPending}
                                    className="ml-4 bg-archival-text text-archival-bg px-4 py-1.5 font-mono text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-opacity-90"
                                >
                                    {video.isSubscribed ? 'Subscribed' : 'Subscribe'}
                                </button>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 items-center">
                            <button 
                                onClick={() => user && toggleLikeMutation.mutate()}
                                disabled={!user || toggleLikeMutation.isPending}
                                className={`flex items-center gap-2 px-4 py-2 border border-archival-border font-mono text-xs uppercase tracking-widest transition-opacity ${user ? 'opacity-80 hover:opacity-100' : 'opacity-60 cursor-default'}`}
                            >
                                {video.isLiked ? (
                                    <svg className="w-4 h-4 text-archival-accent" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 text-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                )}
                                <span>{video.likesCount || 0} Likes</span>
                            </button>

                            {user && myPlaylists && myPlaylists.length > 0 && (
                                <select 
                                    onChange={(e) => {
                                        const playlistId = e.target.value;
                                        if (playlistId) {
                                            addToPlaylistMutation.mutate(playlistId);
                                            e.target.value = ''; // Reset
                                        }
                                    }}
                                    className="bg-transparent border border-archival-border text-archival-text px-4 py-2 font-mono text-xs uppercase tracking-widest outline-none opacity-80 hover:opacity-100 cursor-pointer"
                                >
                                    <option value="" className="bg-archival-bg-secondary text-archival-text">+ Add to Playlist</option>
                                    {myPlaylists.map(pl => (
                                        <option key={pl._id} value={pl._id} className="bg-archival-bg-secondary text-archival-text">{pl.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Description Box */}
                    <div className="mt-6 bg-archival-bg-secondary border border-archival-border p-6 font-mono text-sm">
                        <div className="text-archival-muted mb-4 text-xs">
                            {video.views || 0} views • Uploaded on {new Date(video.createdAt).toLocaleDateString()}
                        </div>
                        <p className="whitespace-pre-line text-gray-200">
                            {video.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Comments Section - wrapped in ErrorBoundary so a crash here won't kill the whole page */}
                    <ErrorBoundary>
                        <VideoComments videoId={videoId} />
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
