import React, { useState, useEffect } from 'react';
import { NavLink, Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Initialize state from URL, or empty
    const initialQuery = searchParams.get('query') || '';
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Sync debounced search to URL
    useEffect(() => {
        if (debouncedSearch !== undefined) {
            if (debouncedSearch) {
                // Navigate to home with query if not on home
                if (location.pathname !== '/') {
                    navigate(`/?query=${encodeURIComponent(debouncedSearch)}`);
                } else {
                    setSearchParams({ query: debouncedSearch });
                }
            } else {
                if (location.pathname === '/' && searchParams.has('query')) {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('query');
                    setSearchParams(newParams);
                }
            }
        }
    }, [debouncedSearch, navigate, setSearchParams, searchParams, location.pathname]);

    // Clear search term when navigating away from Home
    useEffect(() => {
        if (location.pathname !== '/') {
            setSearchTerm('');
        }
    }, [location.pathname]);

    return (
        <nav className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 sm:py-6 bg-transparent border-b border-archival-border text-[11px] sm:text-xs md:text-sm font-sans tracking-wide w-full gap-4 sm:gap-0">
            <div className="flex flex-wrap gap-3 sm:gap-6 md:gap-10 items-center justify-center order-2 sm:order-1">
                <NavLink to="/" className={({isActive}) => isActive ? "opacity-100" : "opacity-70 hover:opacity-100 transition-opacity"}>Explore</NavLink>
                <NavLink to="/trending" className={({isActive}) => isActive ? "opacity-100" : "opacity-70 hover:opacity-100 transition-opacity"}>Timeline</NavLink>
                <NavLink to="/tweets" className={({isActive}) => isActive ? "opacity-100" : "opacity-70 hover:opacity-100 transition-opacity"}>Tweets</NavLink>
            </div>
            
            <div className="flex justify-center order-1 sm:order-2 flex-shrink-0">
                <Link to="/" className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-archival-border flex justify-center items-center">
                        <span className="text-xs md:text-base font-serif italic text-archival-text tracking-tighter mt-0.5">(f)</span>
                    </div>
                    <span className="text-sm md:text-lg font-serif tracking-widest text-archival-accent uppercase font-bold">ARCHIVE.ONE</span>
                </Link>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-6 md:gap-10 items-center justify-center order-3">
                <div className="relative flex items-center">
                    <svg className="w-4 h-4 text-archival-text opacity-70 absolute left-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input 
                        type="text" 
                        placeholder="search" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-archival-text font-sans placeholder-archival-muted pl-6 w-20 focus:w-28 transition-all duration-300 opacity-70 focus:opacity-100 text-xs md:text-sm"
                    />
                </div>
                
                {user ? (
                    <div className="flex gap-3 sm:gap-6 md:gap-10 items-center">
                        <NavLink to="/dashboard" className="opacity-70 hover:opacity-100 transition-opacity">Dashboard</NavLink>
                        <button className="opacity-70 hover:opacity-100 transition-opacity" onClick={logout}>Sign out</button>
                    </div>
                ) : (
                    <Link to="/login" className="opacity-70 hover:opacity-100 transition-opacity">Sign in</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
