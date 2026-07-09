import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const VideoCard = ({ video }) => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Format duration from seconds to MM:SS
    const formatDuration = (duration) => {
        if (!duration) return '0:00';
        const mins = Math.floor(duration / 60);
        const secs = Math.floor(duration % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div 
            className="cursor-pointer flex flex-col gap-3 group transition-transform duration-500 hover:scale-[1.02]"
            onClick={() => navigate(`/video/${video._id}`)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="w-full aspect-video relative overflow-hidden bg-archival-bg-tertiary border-[0.5rem] border-[#e8e8e8] shadow-polaroid transform origin-center">
                {/* Static Thumbnail */}
                <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className={`absolute inset-0 w-full h-full object-cover filter grayscale-[20%] sepia-[10%] transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`} 
                />
                
                {/* Autoplay Video on Hover */}
                <video
                    ref={videoRef}
                    src={video.videoFile}
                    muted
                    loop
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover filter grayscale-[10%] sepia-[10%] transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                />

                <div className="absolute bottom-2 right-2 bg-archival-bg text-archival-text px-2 py-0.5 text-xs font-mono border border-archival-border opacity-90">
                    {formatDuration(video.duration)}
                </div>
            </div>
            
            <div className="flex flex-col gap-1 mt-1 px-1">
                <h3 className="text-lg font-serif text-archival-text leading-snug line-clamp-2" title={video.title}>
                    {video.title}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-archival-muted uppercase tracking-wider">
                    <Link 
                        to={`/c/${video.owner?.username || video.ownerDetails?.username}`}
                        className="hover:underline hover:text-archival-accent transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {video.owner?.fullName || video.owner?.username || video.ownerDetails?.username || "Unknown"}
                    </Link>
                    <span className="opacity-50">•</span>
                    <span>{video.views} views</span>
                    <span className="opacity-50">•</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;
