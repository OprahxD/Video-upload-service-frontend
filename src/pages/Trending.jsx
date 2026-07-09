import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import VideoCard from '../components/VideoCard';

const Trending = () => {
    const fetchTrending = async () => {
        const res = await api.get('/videos/trending/top');
        return res.data.data;
    };

    const { data: videos, isLoading, isError, error } = useQuery({
        queryKey: ['trendingVideos'],
        queryFn: fetchTrending
    });

    if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-pulse font-mono text-archival-muted">Indexing...</div></div>;
    
    if (isError) return <div className="text-danger p-8">Error loading archive: {error.message}</div>;

    const collageClasses = [
        "-rotate-3 translate-y-4 hover:z-10",
        "rotate-2 -translate-y-2 hover:z-10",
        "-rotate-1 translate-y-6 hover:z-10",
        "rotate-4 translate-y-1 hover:z-10",
        "-rotate-2 -translate-y-4 hover:z-10"
    ];

    return (
        <div className="w-full flex flex-col items-center">
            <header className="mb-16 w-full max-w-5xl mt-10">
                <div className="flex justify-between items-start mb-8">
                    <div className="text-archival-muted text-xs uppercase tracking-widest font-mono">
                        Timeline / Registry / Top Viewed
                    </div>
                </div>
                <h2 className="text-6xl md:text-7xl font-serif text-archival-accent tracking-tight mb-8">Trending Archives</h2>
            </header>

            <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 sm:gap-8 px-8 relative mt-10">
                {videos && videos.length > 0 ? (
                    videos.map((video, index) => {
                        const rotationClass = collageClasses[index % collageClasses.length];
                        return (
                            <div key={video._id} className={`transition-transform duration-500 ease-out hover:scale-105 ${rotationClass}`}>
                                <VideoCard video={video} />
                            </div>
                        )
                    })
                ) : (
                    <p className="font-mono text-archival-muted col-span-full text-center py-20">No trending videos found.</p>
                )}
            </div>
        </div>
    );
};

export default Trending;
