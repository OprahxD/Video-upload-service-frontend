import React, { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import VideoCard from '../components/VideoCard';

const fetchVideos = async ({ pageParam = 1, queryKey }) => {
    const [_key, searchQuery] = queryKey;
    const url = `/videos?page=${pageParam}&limit=10${searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : ''}`;
    const res = await api.get(url);
    return res.data.data;
};

const Home = () => {
    const { ref, inView } = useInView();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('query') || '';

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['videos', searchQuery],
        queryFn: fetchVideos,
        getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-pulse font-mono text-archival-muted">Indexing...</div></div>;
    if (isError) return <div className="text-danger p-8">Error loading archive: {error.message}</div>;

    // Collage rotation and translation classes to simulate scattered documents
    const collageClasses = [
        "-rotate-3 translate-y-4 hover:z-10",
        "rotate-2 -translate-y-2 hover:z-10",
        "-rotate-1 translate-y-6 hover:z-10",
        "rotate-4 translate-y-1 hover:z-10",
        "-rotate-2 -translate-y-4 hover:z-10"
    ];

    return (
        <div className="w-full flex flex-col items-center">
            <header className="mb-12 w-full max-w-5xl mt-10 text-left">
                <div className="flex justify-between items-start mb-6">
                    <div className="text-archival-muted text-xs uppercase tracking-widest font-mono">
                        Explore / Library / Videos
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif text-archival-accent tracking-tight mb-4">Browse Videos</h1>
                <p className="text-archival-muted text-sm font-mono max-w-2xl leading-relaxed">
                    Explore and search through the catalog of videos uploaded by creators across the network.
                </p>
            </header>

            {/* The Scattered Collage Grid */}
            <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 sm:gap-8 px-8 relative mt-10">
                {data?.pages.map((page, pageIndex) => (
                    <React.Fragment key={pageIndex}>
                        {page.docs.map((video, index) => {
                            const rotationClass = collageClasses[(pageIndex * 10 + index) % collageClasses.length];
                            return (
                                <div key={video._id} className={`transition-transform duration-500 ease-out hover:scale-105 ${rotationClass}`}>
                                    <VideoCard video={video} />
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>

            <div ref={ref} className="h-32 flex justify-center items-center mt-12 w-full max-w-6xl">
                {isFetchingNextPage && <div className="animate-pulse font-mono text-archival-muted text-sm">Retrieving more records...</div>}
                {!hasNextPage && data?.pages[0].docs.length > 0 && (
                    <div className="font-mono text-archival-muted text-xs uppercase tracking-widest w-full text-center mt-8">
                        End of Registry
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
