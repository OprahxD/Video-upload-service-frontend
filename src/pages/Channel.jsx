import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';

const Channel = () => {
    const { username } = useParams();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch Channel Profile Details
    const fetchChannelProfile = async () => {
        const res = await api.get(`/users/c/${username}`);
        return res.data.data;
    };

    const { data: channel, isLoading: isChannelLoading, isError: isChannelError, error: channelError } = useQuery({
        queryKey: ['channelProfile', username],
        queryFn: fetchChannelProfile,
    });

    // Fetch Channel's Videos
    const fetchChannelVideos = async () => {
        const res = await api.get(`/videos?userId=${channel._id}&limit=100`);
        return res.data.data.docs;
    };

    const { data: channelVideos = [], isLoading: isVideosLoading, isError: isVideosError } = useQuery({
        queryKey: ['channelVideos', channel?._id],
        queryFn: fetchChannelVideos,
        enabled: !!channel?._id,
    });

    // Toggle Subscription
    const toggleSubscriptionMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post(`/subscriptions/c/${channel._id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['channelProfile', username] });
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to toggle subscription");
        }
    });

    if (isChannelLoading) return (
        <div className="flex justify-center items-center h-screen w-full bg-archival-bg">
            <div className="animate-pulse font-mono text-archival-muted text-sm tracking-widest uppercase">Retrieving Record Profile...</div>
        </div>
    );

    if (isChannelError || !channel) return (
        <div className="flex flex-col justify-center items-center h-screen w-full bg-archival-bg gap-4">
            <div className="font-mono text-red-400 text-sm tracking-widest uppercase">
                Profile Record Not Found.
            </div>
            <div className="font-mono text-archival-muted text-xs">
                {channelError?.response?.data?.message || channelError?.message || 'Unknown record state'}
            </div>
            <Link to="/" className="border border-archival-border px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-archival-bg-secondary transition-colors mt-4">
                ← Back to Home
            </Link>
        </div>
    );

    return (
        <div className="w-full flex flex-col items-center min-h-screen pt-4">
            {/* Cover Image Banner */}
            <div className="w-full max-w-6xl h-48 md:h-64 border border-archival-border bg-archival-bg-secondary overflow-hidden mb-8 relative">
                {channel.coverImage ? (
                    <img src={channel.coverImage} alt="Cover Banner" className="w-full h-full object-cover opacity-60 filter grayscale-[30%] sepia-[10%]" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-archival-bg to-archival-bg-secondary opacity-50 flex items-center justify-center font-mono text-archival-muted text-xs uppercase tracking-widest">
                        Document Background Not Loaded
                    </div>
                )}
            </div>

            {/* Profile Header & Stats */}
            <header className="mb-12 w-full max-w-6xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-archival-border pb-8 px-4">
                <div className="flex items-center gap-6">
                    <img 
                        src={channel.avatar} 
                        alt={channel.fullName} 
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-archival-border object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col gap-1">
                        <h2 className="text-3xl md:text-4xl font-serif text-archival-accent tracking-tight">{channel.fullName}</h2>
                        <span className="font-mono text-sm text-archival-muted">@{channel.username}</span>
                        {user && user._id !== channel._id && (
                            <button 
                                onClick={() => toggleSubscriptionMutation.mutate()}
                                disabled={toggleSubscriptionMutation.isPending}
                                className="mt-2 bg-archival-text text-archival-bg px-4 py-1.5 font-mono text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-opacity-90 transition-all self-start"
                            >
                                {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
                            </button>
                        )}
                    </div>
                </div>

                {/* monospaced Stats Board */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border border-archival-border bg-archival-bg-secondary p-5 font-mono text-[10px] sm:text-xs uppercase tracking-wider shadow-polaroid w-full md:w-auto">
                    <div className="flex flex-col items-center px-4">
                        <span className="text-archival-accent text-base sm:text-lg font-bold">{channel.subscribersCount || 0}</span>
                        <span className="text-archival-muted text-[8px] sm:text-[9px] mt-1 text-center">Subscribers</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-archival-border px-4">
                        <span className="text-archival-accent text-base sm:text-lg font-bold">{channel.totalViews || 0}</span>
                        <span className="text-archival-muted text-[8px] sm:text-[9px] mt-1 text-center">Total Views</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-archival-border px-4">
                        <span className="text-archival-accent text-base sm:text-lg font-bold">{channel.totalLikes || 0}</span>
                        <span className="text-archival-muted text-[8px] sm:text-[9px] mt-1 text-center">Likes Received</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-archival-border px-4">
                        <span className="text-archival-accent text-base sm:text-lg font-bold">{channel.totalVideos || 0}</span>
                        <span className="text-archival-muted text-[8px] sm:text-[9px] mt-1 text-center">Residues</span>
                    </div>
                </div>
            </header>

            {/* Videos Grid */}
            <main className="w-full max-w-6xl px-4 mb-16">
                <h3 className="font-serif text-2xl mb-8 border-b border-archival-border pb-3 inline-block">Catalogued Residues</h3>
                
                {isVideosLoading ? (
                    <div className="animate-pulse font-mono text-archival-muted">Retrieving catalog records...</div>
                ) : isVideosError ? (
                    <div className="text-red-400 font-mono text-xs">Error loading catalog records.</div>
                ) : channelVideos && channelVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {channelVideos.map(video => (
                            <div key={video._id} className="transition-transform duration-300 hover:scale-105">
                                <VideoCard video={video} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="font-mono text-archival-muted">No records registered in this channel.</p>
                )}
            </main>
        </div>
    );
};

export default Channel;
