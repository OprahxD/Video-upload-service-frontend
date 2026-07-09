import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import VideoCard from '../components/VideoCard';

const PlaylistVideosList = ({ playlistId }) => {
    const queryClient = useQueryClient();

    const fetchPlaylistDetails = async () => {
        const res = await api.get(`/playlist/${playlistId}`);
        return res.data.data;
    };

    const { data: playlist, isLoading } = useQuery({
        queryKey: ['playlistDetails', playlistId],
        queryFn: fetchPlaylistDetails,
    });

    const removeVideoMutation = useMutation({
        mutationFn: async (videoId) => {
            await api.patch(`/playlist/remove/${videoId}/${playlistId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlistDetails', playlistId] });
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to remove video");
        }
    });

    if (isLoading) return <div className="text-xs text-archival-muted mt-2">Loading catalog items...</div>;

    const videos = playlist?.videos || [];

    return (
        <div className="flex flex-col gap-4 mt-4 pl-4 border-l border-archival-border">
            <span className="text-[10px] uppercase text-archival-muted mb-2 font-mono">Catalogued Items ({videos.length})</span>
            {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {videos.map(video => (
                        <div key={video._id} className="flex flex-col border border-archival-border bg-archival-bg-secondary p-4 shadow-polaroid">
                            <div className="flex-grow">
                                <VideoCard video={video} />
                            </div>
                            <button 
                                onClick={() => removeVideoMutation.mutate(video._id)}
                                className="mt-4 bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-900/20 py-2 uppercase text-[10px] tracking-wider font-bold transition-all text-center"
                            >
                                Remove from Playlist
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <span className="text-xs text-archival-muted italic font-mono">Playlist is empty.</span>
            )}
        </div>
    );
};

const Dashboard = () => {
    const { user, login } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('videos'); // 'videos', 'tweets', 'playlists', 'liked', 'upload', 'settings'
    
    // Upload Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);

    // Profile Form state
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

    // Tweet Form state
    const [tweetContent, setTweetContent] = useState('');
    const [editingTweetId, setEditingTweetId] = useState(null);
    const [editingContent, setEditingContent] = useState('');

    // Playlist Form state
    const [playlistName, setPlaylistName] = useState('');
    const [playlistDesc, setPlaylistDesc] = useState('');

    // Video Edit state
    const [editingVideo, setEditingVideo] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editThumbnailFile, setEditThumbnailFile] = useState(null);

    // Sync form state when user changes
    useEffect(() => {
        if (user) {
            setFullName(user.fullName || '');
            setEmail(user.email || '');
            setAvatarPreview(user.avatar || '');
        }
    }, [user]);

    const fetchMyVideos = async () => {
        const res = await api.get(`/videos?userId=${user._id}&limit=50`);
        return res.data.data.docs;
    };

    const { data: myVideos, isLoading: isVideosLoading } = useQuery({
        queryKey: ['myVideos', user?._id],
        queryFn: fetchMyVideos,
        enabled: !!user
    });

    const fetchMyTweets = async () => {
        const res = await api.get(`/tweets/user/${user._id}`);
        return res.data.data;
    };

    const { data: myTweets = [], isLoading: isTweetsLoading } = useQuery({
        queryKey: ['myTweets', user?._id],
        queryFn: fetchMyTweets,
        enabled: !!user && activeTab === 'tweets'
    });

    const fetchMyPlaylists = async () => {
        const res = await api.get(`/playlist/user/${user._id}`);
        return res.data.data;
    };

    const { data: myPlaylists = [], isLoading: isPlaylistsLoading } = useQuery({
        queryKey: ['myPlaylists', user?._id],
        queryFn: fetchMyPlaylists,
        enabled: !!user
    });

    const fetchDashboardStats = async () => {
        const res = await api.get('/dashboard/stats');
        return res.data.data;
    };

    const { data: dashboardStats } = useQuery({
        queryKey: ['dashboardStats', user?._id],
        queryFn: fetchDashboardStats,
        enabled: !!user
    });

    const fetchLikedVideos = async () => {
        const res = await api.get('/likes/videos');
        return res.data.data;
    };

    const { data: likedVideos = [], isLoading: isLikedLoading } = useQuery({
        queryKey: ['likedVideos', user?._id],
        queryFn: fetchLikedVideos,
        enabled: !!user && activeTab === 'liked'
    });

    const uploadMutation = useMutation({
        mutationFn: async (formData) => {
            const res = await api.post('/videos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myVideos', user?._id] });
            setActiveTab('videos');
            setTitle('');
            setDescription('');
            setVideoFile(null);
            setThumbnailFile(null);
            alert("Video upload job started! Check back soon.");
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Upload failed");
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.patch('/users/update-account-details', data);
            return res.data.data;
        },
        onSuccess: (updatedUser) => {
            login(updatedUser);
            alert("Profile details updated successfully.");
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Profile update failed");
        }
    });

    const updateAvatarMutation = useMutation({
        mutationFn: async (formData) => {
            const res = await api.patch('/users/change-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.data;
        },
        onSuccess: (updatedUser) => {
            login(updatedUser);
            setAvatarFile(null);
            alert("Avatar updated successfully.");
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Avatar update failed");
        }
    });

    const createTweetMutation = useMutation({
        mutationFn: async (content) => {
            const res = await api.post('/tweets/createTweet', { content });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTweets', user?._id] });
            setTweetContent('');
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to post tweet");
        }
    });

    const updateTweetMutation = useMutation({
        mutationFn: async ({ tweetId, content }) => {
            const res = await api.patch(`/tweets/${tweetId}`, { content });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTweets', user?._id] });
            setEditingTweetId(null);
            setEditingContent('');
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to update tweet");
        }
    });

    const deleteTweetMutation = useMutation({
        mutationFn: async (tweetId) => {
            const res = await api.delete(`/tweets/${tweetId}`);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTweets', user?._id] });
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to delete tweet");
        }
    });

    const toggleLikeTweetMutation = useMutation({
        mutationFn: async (tweetId) => {
            const res = await api.post(`/likes/toggle/t/${tweetId}`);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTweets', user?._id] });
        }
    });

    const createPlaylistMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post('/playlist', data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myPlaylists', user?._id] });
            setPlaylistName('');
            setPlaylistDesc('');
            alert("Playlist created successfully.");
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to create playlist");
        }
    });

    const deletePlaylistMutation = useMutation({
        mutationFn: async (playlistId) => {
            const res = await api.delete(`/playlist/${playlistId}`);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myPlaylists', user?._id] });
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to delete playlist");
        }
    });

    const addToPlaylistMutation = useMutation({
        mutationFn: async ({ videoId, playlistId }) => {
            const res = await api.patch(`/playlist/add/${videoId}/${playlistId}`);
            return res.data.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['playlistDetails', variables.playlistId] });
            alert("Video added to playlist successfully.");
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to add video to playlist");
        }
    });
    const deleteVideoMutation = useMutation({
        mutationFn: async (videoId) => {
            const res = await api.delete(`/videos/${videoId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myVideos', user?._id] });
            alert("Video deleted successfully.");
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to delete video");
        }
    });

    const updateVideoMutation = useMutation({
        mutationFn: async ({ videoId, formData }) => {
            const res = await api.patch(`/videos/${videoId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myVideos', user?._id] });
            setEditingVideo(null);
            setEditTitle('');
            setEditDescription('');
            setEditThumbnailFile(null);
            alert("Video updated successfully.");
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to update video");
        }
    });

    const handleUpdateVideoSubmit = (e) => {
        e.preventDefault();
        if (!editingVideo) return;
        
        const formData = new FormData();
        if (editTitle.trim()) formData.append('title', editTitle);
        if (editDescription.trim()) formData.append('description', editDescription);
        if (editThumbnailFile) formData.append('thumbnail', editThumbnailFile);
        
        updateVideoMutation.mutate({ videoId: editingVideo._id, formData });
    };

    const handleStartEdit = (video) => {
        setEditingVideo(video);
        setEditTitle(video.title || '');
        setEditDescription(video.description || '');
        setEditThumbnailFile(null);
    };
    const handleUpload = (e) => {
        e.preventDefault();
        if (!videoFile || !thumbnailFile || !title) return;
        
        const formData = new FormData();
        formData.append('videoFile', videoFile);
        formData.append('thumbnail', thumbnailFile);
        formData.append('title', title);
        formData.append('description', description);
        
        uploadMutation.mutate(formData);
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        if (!fullName.trim() || !email.trim()) return;
        updateProfileMutation.mutate({ fullName, email });
    };

    const handleAvatarSubmit = (e) => {
        e.preventDefault();
        if (!avatarFile) return;
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        updateAvatarMutation.mutate(formData);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateTweetSubmit = (e) => {
        e.preventDefault();
        if (!tweetContent.trim()) return;
        createTweetMutation.mutate(tweetContent);
    };

    const handleUpdateTweetSubmit = (e, tweetId) => {
        e.preventDefault();
        if (!editingContent.trim()) return;
        updateTweetMutation.mutate({ tweetId, content: editingContent });
    };

    const handleCreatePlaylistSubmit = (e) => {
        e.preventDefault();
        if (!playlistName.trim()) return;
        createPlaylistMutation.mutate({ name: playlistName, description: playlistDesc });
    };

    return (
        <div className="w-full flex flex-col items-center min-h-screen pt-10 px-4">
            <header className="mb-12 w-full max-w-6xl">
                <div className="flex justify-between items-start mb-6">
                    <div className="text-archival-muted text-xs uppercase tracking-widest font-mono">
                        Source / Drawer / {user?.username || 'User'} / Dashboard
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-archival-border pb-8 gap-4">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-serif text-archival-accent tracking-tight mb-2">Creator Archive</h2>
                        <p className="font-mono text-sm text-archival-muted">Manage, catalog, and configure your registry profile.</p>
                    </div>
                    
                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap border border-archival-border font-mono text-[10px] sm:text-xs bg-archival-bg-secondary w-full md:w-auto">
                        <button 
                            onClick={() => setActiveTab('videos')}
                            className={`flex-grow md:flex-initial px-3 sm:px-4 py-2 uppercase tracking-wider transition-colors border-r border-b md:border-b-0 border-archival-border/10 ${activeTab === 'videos' ? 'bg-archival-text text-archival-bg' : 'text-archival-text hover:bg-archival-border/20'}`}
                        >
                            Videos
                        </button>
                        <button 
                            onClick={() => setActiveTab('tweets')}
                            className={`flex-grow md:flex-initial px-3 sm:px-4 py-2 uppercase tracking-wider transition-colors border-r border-b md:border-b-0 border-archival-border/10 ${activeTab === 'tweets' ? 'bg-archival-text text-archival-bg' : 'text-archival-text hover:bg-archival-border/20'}`}
                        >
                            Tweets
                        </button>
                        <button 
                            onClick={() => setActiveTab('playlists')}
                            className={`flex-grow md:flex-initial px-3 sm:px-4 py-2 uppercase tracking-wider transition-colors border-r border-b md:border-b-0 border-archival-border/10 ${activeTab === 'playlists' ? 'bg-archival-text text-archival-bg' : 'text-archival-text hover:bg-archival-border/20'}`}
                        >
                            Playlists
                        </button>
                        <button 
                            onClick={() => setActiveTab('liked')}
                            className={`flex-grow md:flex-initial px-3 sm:px-4 py-2 uppercase tracking-wider transition-colors border-r border-b md:border-b-0 border-archival-border/10 ${activeTab === 'liked' ? 'bg-archival-text text-archival-bg' : 'text-archival-text hover:bg-archival-border/20'}`}
                        >
                            Liked Videos
                        </button>
                        <button 
                            onClick={() => setActiveTab('upload')}
                            className={`flex-grow md:flex-initial px-3 sm:px-4 py-2 uppercase tracking-wider transition-colors border-r border-b md:border-b-0 border-archival-border/10 ${activeTab === 'upload' ? 'bg-archival-text text-archival-bg' : 'text-archival-text hover:bg-archival-border/20'}`}
                        >
                            Upload Video
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`flex-grow md:flex-initial px-3 sm:px-4 py-2 uppercase tracking-wider transition-colors border-b md:border-b-0 border-archival-border/10 ${activeTab === 'settings' ? 'bg-archival-text text-archival-bg' : 'text-archival-text hover:bg-archival-border/20'}`}
                        >
                            Settings
                        </button>
                    </div>
                </div>
            </header>

            {/* Dashboard Stats Panel */}
            {dashboardStats && (
                <div className="w-full max-w-6xl mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 border border-archival-border bg-archival-bg-secondary p-5 font-mono text-[10px] sm:text-xs uppercase tracking-wider shadow-polaroid">
                    <div className="flex flex-col items-center">
                        <span className="text-archival-accent text-lg font-bold">{dashboardStats.totalVideos || 0}</span>
                        <span className="text-archival-muted text-[9px] sm:text-[10px] mt-1 text-center">Total Residues</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-archival-border px-2">
                        <span className="text-archival-accent text-lg font-bold">{dashboardStats.totalViews || 0}</span>
                        <span className="text-archival-muted text-[9px] sm:text-[10px] mt-1 text-center">Total Views</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-archival-border px-2">
                        <span className="text-archival-accent text-lg font-bold">{dashboardStats.totalSubscribers || 0}</span>
                        <span className="text-archival-muted text-[9px] sm:text-[10px] mt-1 text-center">Subscribers</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-archival-border px-2">
                        <span className="text-archival-accent text-lg font-bold">{dashboardStats.totalLikes || 0}</span>
                        <span className="text-archival-muted text-[9px] sm:text-[10px] mt-1 text-center">Likes Received</span>
                    </div>
                </div>
            )}

            {/* Videos tab */}
            {activeTab === 'videos' && (
                <div className="w-full max-w-6xl">
                    <h3 className="font-serif text-2xl mb-8 border-b border-archival-border pb-3 inline-block">Your Catalogued Residues</h3>
                    {isVideosLoading ? (
                        <div className="animate-pulse font-mono text-archival-muted">Retrieving catalog...</div>
                    ) : myVideos && myVideos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myVideos.map(video => (
                                <div key={video._id} className="flex flex-col border border-archival-border bg-archival-bg-secondary p-4 shadow-polaroid">
                                    <div className="flex-grow">
                                        <VideoCard video={video} />
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-archival-border flex flex-col gap-3 font-mono text-xs">
                                        <div className="flex justify-between items-center px-1">
                                            <button 
                                                onClick={() => handleStartEdit(video)}
                                                className="text-[10px] font-mono text-archival-accent uppercase tracking-wider hover:underline"
                                            >
                                                Edit Detail
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if(confirm("Confirm deletion of this residue?")) {
                                                        deleteVideoMutation.mutate(video._id);
                                                    }
                                                }}
                                                className="text-[10px] font-mono text-red-400 uppercase tracking-wider hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-1 border-t border-archival-border/10 pt-2 text-left">
                                            <label className="text-archival-muted text-[9px] uppercase">Registry Playlist</label>
                                            <div className="flex gap-2">
                                                <select 
                                                    id={`select-pl-${video._id}`}
                                                    className="bg-archival-bg border border-archival-border text-archival-text p-2 flex-grow outline-none text-xs"
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Select Playlist</option>
                                                    {myPlaylists.map(pl => (
                                                        <option key={pl._id} value={pl._id}>{pl.name}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => {
                                                        const selectEl = document.getElementById(`select-pl-${video._id}`);
                                                        const playlistId = selectEl.value;
                                                        if (playlistId) {
                                                            addToPlaylistMutation.mutate({ videoId: video._id, playlistId });
                                                        } else {
                                                            alert("Please select a playlist");
                                                        }
                                                    }}
                                                    className="bg-archival-accent text-archival-bg px-3 py-2 uppercase text-[10px] tracking-wider font-bold hover:opacity-90"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="font-mono text-archival-muted">No records found in your drawer.</p>
                    )}
                </div>
            )}

            {/* Tweets tab */}
            {activeTab === 'tweets' && (
                <div className="w-full max-w-3xl flex flex-col gap-8 mb-16">
                    {/* Create Tweet Form */}
                    <div className="border border-archival-border bg-archival-bg-secondary p-8 shadow-polaroid">
                        <h3 className="font-serif text-2xl mb-4">Post Dispatch / Tweet</h3>
                        <form onSubmit={handleCreateTweetSubmit} className="flex flex-col gap-4 font-mono text-sm">
                            <textarea 
                                value={tweetContent}
                                onChange={e => setTweetContent(e.target.value)}
                                placeholder="What is on your mind? Dispatch records to the registry..."
                                className="bg-archival-bg border border-archival-border p-3 text-archival-text focus:outline-none focus:border-archival-accent transition-colors h-24 resize-none"
                                required
                            />
                            <div className="flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={createTweetMutation.isPending || !tweetContent.trim()}
                                    className="bg-archival-accent text-archival-bg px-6 py-2 uppercase tracking-widest font-bold disabled:opacity-50 hover:bg-opacity-90 transition-all"
                                >
                                    {createTweetMutation.isPending ? 'Dispatching...' : 'Dispatch'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Tweets list */}
                    <div className="flex flex-col gap-6">
                        <h3 className="font-serif text-2xl border-b border-archival-border pb-3 inline-block">Registered Dispatches</h3>
                        
                        {isTweetsLoading ? (
                            <div className="animate-pulse font-mono text-archival-muted">Retrieving dispatches...</div>
                        ) : myTweets && myTweets.length > 0 ? (
                            <div className="flex flex-col gap-6 font-mono text-sm">
                                {myTweets.map(tweet => (
                                    <div key={tweet._id} className="border border-archival-border bg-archival-bg-secondary p-6 shadow-polaroid flex flex-col gap-4">
                                        <div className="flex justify-between items-center text-xs text-archival-muted">
                                            <span>Posted: {new Date(tweet.createdAt).toLocaleString()}</span>
                                            <span className="text-archival-accent">ID: {tweet._id.slice(-6)}</span>
                                        </div>

                                        {editingTweetId === tweet._id ? (
                                            <form onSubmit={(e) => handleUpdateTweetSubmit(e, tweet._id)} className="flex flex-col gap-3">
                                                <textarea 
                                                    value={editingContent}
                                                    onChange={e => setEditingContent(e.target.value)}
                                                    className="bg-archival-bg border border-archival-border p-3 text-archival-text focus:outline-none focus:border-archival-accent transition-colors h-20 resize-none"
                                                    required
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => {
                                                            setEditingTweetId(null);
                                                            setEditingContent('');
                                                        }}
                                                        className="border border-archival-border text-archival-text px-4 py-1.5 uppercase text-xs hover:bg-archival-border/10 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        type="submit" 
                                                        disabled={updateTweetMutation.isPending}
                                                        className="bg-archival-accent text-archival-bg px-4 py-1.5 uppercase text-xs font-bold hover:bg-opacity-90 transition-all"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{tweet.content}</p>
                                        )}

                                        <div className="flex justify-between items-center border-t border-archival-border pt-4 text-xs">
                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={() => toggleLikeTweetMutation.mutate(tweet._id)}
                                                    className="flex items-center gap-1 opacity-70 hover:opacity-100 hover:text-archival-accent transition-colors"
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
                                                    <span>{tweet.likesCount || 0}</span>
                                                </button>
                                            </div>
                                            {editingTweetId !== tweet._id && (
                                                <div className="flex gap-4">
                                                    <button 
                                                        onClick={() => {
                                                            setEditingTweetId(tweet._id);
                                                            setEditingContent(tweet.content);
                                                        }}
                                                        className="text-archival-accent hover:underline uppercase"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            if (confirm("Are you sure you want to delete this dispatch?")) {
                                                                deleteTweetMutation.mutate(tweet._id);
                                                            }
                                                        }}
                                                        className="text-red-400 hover:underline uppercase animate-none"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="font-mono text-archival-muted">No dispatches logged in your ledger.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Playlists tab */}
            {activeTab === 'playlists' && (
                <div className="w-full max-w-5xl flex flex-col gap-10 mb-16">
                    {/* Create Playlist Form */}
                    <div className="border border-archival-border bg-archival-bg-secondary p-8 shadow-polaroid">
                        <h3 className="font-serif text-2xl mb-6">Create New Playlist</h3>
                        <form onSubmit={handleCreatePlaylistSubmit} className="flex flex-col gap-6 font-mono text-sm">
                            <div className="flex flex-col gap-2">
                                <label className="text-archival-muted uppercase tracking-wider text-xs">Playlist Name</label>
                                <input 
                                    type="text" 
                                    value={playlistName}
                                    onChange={e => setPlaylistName(e.target.value)}
                                    className="bg-archival-bg border border-archival-border p-3 text-archival-text focus:outline-none focus:border-archival-accent transition-colors"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-archival-muted uppercase tracking-wider text-xs">Description</label>
                                <textarea 
                                    value={playlistDesc}
                                    onChange={e => setPlaylistDesc(e.target.value)}
                                    className="bg-archival-bg border border-archival-border p-3 text-archival-text focus:outline-none focus:border-archival-accent transition-colors h-24 resize-none"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={createPlaylistMutation.isPending}
                                className="mt-4 bg-archival-accent text-archival-bg py-3 uppercase tracking-widest font-bold disabled:opacity-50 hover:bg-opacity-90 transition-all"
                            >
                                {createPlaylistMutation.isPending ? 'Creating...' : 'Create Playlist'}
                            </button>
                        </form>
                    </div>

                    {/* Playlists list */}
                    <div className="flex flex-col gap-6">
                        <h3 className="font-serif text-2xl border-b border-archival-border pb-3 inline-block">Your Playlists</h3>
                        {isPlaylistsLoading ? (
                            <div className="animate-pulse font-mono text-archival-muted">Retrieving playlists...</div>
                        ) : myPlaylists && myPlaylists.length > 0 ? (
                            <div className="flex flex-col gap-6 font-mono text-sm">
                                {myPlaylists.map(playlist => (
                                    <div key={playlist._id} className="border border-archival-border bg-archival-bg-secondary p-6 shadow-polaroid flex flex-col gap-4">
                                        <div className="flex justify-between items-center text-xs text-archival-muted">
                                            <h4 className="text-lg font-serif text-archival-accent">{playlist.name}</h4>
                                            <button 
                                                onClick={() => {
                                                    if(confirm("Delete this playlist?")) {
                                                        deletePlaylistMutation.mutate(playlist._id);
                                                    }
                                                }}
                                                className="text-red-400 hover:underline uppercase text-[10px]"
                                            >
                                                Delete Playlist
                                            </button>
                                        </div>
                                        {playlist.description && (
                                            <p className="text-xs text-archival-muted italic">{playlist.description}</p>
                                        )}
                                        
                                        {/* List videos in this playlist */}
                                        <PlaylistVideosList playlistId={playlist._id} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="font-mono text-archival-muted">No playlists logged in your ledger.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Liked Videos tab */}
            {activeTab === 'liked' && (
                <div className="w-full max-w-6xl flex flex-col gap-8 mb-16">
                    <div>
                        <h3 className="font-serif text-2xl mb-8 border-b border-archival-border pb-3 inline-block">Liked Videos</h3>
                        {isLikedLoading ? (
                            <div className="animate-pulse font-mono text-archival-muted">Retrieving liked records...</div>
                        ) : likedVideos && likedVideos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {likedVideos.map(video => (
                                    <div key={video._id} className="transition-transform duration-300 hover:scale-105">
                                        <VideoCard video={video} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="font-mono text-archival-muted">No liked videos logged.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Video tab */}
            {activeTab === 'upload' && (
                <div className="w-full max-w-3xl border border-archival-border bg-archival-bg-secondary p-8 mb-16 shadow-polaroid">
                    <h3 className="font-serif text-2xl mb-6">Catalog New Entry</h3>
                    <form onSubmit={handleUpload} className="flex flex-col gap-6 font-mono text-sm">
                        <div className="flex flex-col gap-2">
                            <label className="text-archival-muted uppercase tracking-wider text-xs">Title Identifier</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="bg-archival-bg border border-archival-border p-3 text-archival-text focus:outline-none focus:border-archival-accent transition-colors"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-archival-muted uppercase tracking-wider text-xs">Description / Metadata</label>
                            <textarea 
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="bg-archival-bg border border-archival-border p-3 text-archival-text focus:outline-none focus:border-archival-accent transition-colors h-32 resize-none animate-none"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-archival-muted uppercase tracking-wider text-xs">Video File</label>
                                <input 
                                    type="file" 
                                    accept="video/mp4,video/x-m4v,video/*"
                                    onChange={e => setVideoFile(e.target.files[0])}
                                    className="file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-archival-border file:text-archival-text text-archival-muted cursor-pointer"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-archival-muted uppercase tracking-wider text-xs">Thumbnail Image</label>
                                <input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={e => setThumbnailFile(e.target.files[0])}
                                    className="file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-archival-border file:text-archival-text text-archival-muted cursor-pointer"
                                    required
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={uploadMutation.isPending}
                            className="mt-4 bg-archival-accent text-archival-bg py-3 uppercase tracking-widest font-bold disabled:opacity-50 hover:bg-opacity-90 transition-all"
                        >
                            {uploadMutation.isPending ? 'Uploading...' : 'Submit to Registry'}
                        </button>
                    </form>
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="w-full max-w-3xl flex flex-col gap-10 mb-16">
                    {/* Profile Details Form */}
                    <div className="border border-archival-border bg-archival-bg-secondary p-8 shadow-polaroid">
                        <h3 className="font-serif text-2xl mb-6">Profile Settings</h3>
                        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6 font-mono text-sm">
                            <div className="flex flex-col gap-2">
                                <label className="text-archival-muted uppercase tracking-wider text-xs">Full Name</label>
                                <input 
                                    type="text" 
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    className="bg-archival-bg border border-archival-border p-3 text-archival-text focus:outline-none focus:border-archival-accent transition-colors"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-archival-muted uppercase tracking-wider text-xs">Email Address</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="bg-archival-bg border border-archival-border p-3 text-archival-text focus:outline-none focus:border-archival-accent transition-colors"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={updateProfileMutation.isPending}
                                className="mt-4 bg-archival-accent text-archival-bg py-3 uppercase tracking-widest font-bold disabled:opacity-50 hover:bg-opacity-90 transition-all"
                            >
                                {updateProfileMutation.isPending ? 'Updating...' : 'Save Profile Changes'}
                            </button>
                        </form>
                    </div>

                    {/* Avatar Form */}
                    <div className="border border-archival-border bg-archival-bg-secondary p-8 shadow-polaroid">
                        <h3 className="font-serif text-2xl mb-6">Avatar Identification</h3>
                        <form onSubmit={handleAvatarSubmit} className="flex flex-col gap-6 font-mono text-sm items-center md:items-start">
                            <div className="flex flex-col md:flex-row gap-8 items-center w-full">
                                <div className="w-24 h-24 rounded-full border border-archival-border overflow-hidden bg-black flex-shrink-0">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-archival-muted">No Image</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 flex-grow w-full">
                                    <label className="text-archival-muted uppercase tracking-wider text-xs">Upload New Avatar</label>
                                    <input 
                                        type="file" 
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleAvatarChange}
                                        className="file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-archival-border file:text-archival-text text-archival-muted cursor-pointer"
                                        required
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={!avatarFile || updateAvatarMutation.isPending}
                                className="mt-4 bg-archival-text text-archival-bg py-3 px-6 uppercase tracking-widest font-bold disabled:opacity-50 hover:bg-opacity-90 transition-all self-stretch md:self-auto"
                            >
                                {updateAvatarMutation.isPending ? 'Updating Avatar...' : 'Update Avatar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Video Modal Overlay */}
            {editingVideo && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
                    <div className="w-full max-w-lg border border-archival-border bg-archival-bg-secondary p-8 shadow-polaroid font-mono text-sm relative">
                        <button 
                            onClick={() => setEditingVideo(null)}
                            className="absolute top-4 right-4 text-archival-muted hover:text-archival-text text-xl"
                        >
                            ✕
                        </button>
                        <h3 className="font-serif text-2xl mb-6 text-archival-accent border-b border-archival-border pb-2 text-left">Edit Residue Details</h3>
                        <form onSubmit={handleUpdateVideoSubmit} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2 text-left">
                                <label className="text-archival-muted uppercase tracking-wider text-xs">Title Identifier</label>
                                <input 
                                    type="text" 
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    className="bg-archival-bg border border-archival-border p-3 text-archival-text focus:outline-none focus:border-archival-accent transition-colors"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2 text-left">
                                <label className="text-archival-muted uppercase tracking-wider text-xs">Description / Metadata</label>
                                <textarea 
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                    className="bg-archival-bg border border-archival-border p-3 text-archival-text focus:outline-none focus:border-archival-accent transition-colors h-32 resize-none"
                                />
                            </div>
                            <div className="flex flex-col gap-2 text-left">
                                <label className="text-archival-muted uppercase tracking-wider text-xs">New Thumbnail Image (Optional)</label>
                                <input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={e => setEditThumbnailFile(e.target.files[0])}
                                    className="file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-archival-border file:text-archival-text text-archival-muted cursor-pointer border border-archival-border p-2 bg-archival-bg w-full"
                                />
                            </div>
                            <div className="flex gap-4 mt-2">
                                <button 
                                    type="submit" 
                                    disabled={updateVideoMutation.isPending}
                                    className="bg-archival-accent text-archival-bg px-6 py-2.5 uppercase tracking-widest font-bold disabled:opacity-50 hover:bg-opacity-90 transition-all text-xs flex-grow"
                                >
                                    {updateVideoMutation.isPending ? 'Updating...' : 'Save Catalog Details'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setEditingVideo(null)}
                                    className="border border-archival-border px-6 py-2.5 uppercase tracking-widest font-bold hover:bg-archival-border/20 transition-all text-xs text-archival-muted"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
