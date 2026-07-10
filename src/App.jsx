import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'

// Lazy Load Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const Trending = lazy(() => import('./pages/Trending'));
const VideoPlayer = lazy(() => import('./pages/VideoPlayer'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tweets = lazy(() => import('./pages/Tweets'));
const Channel = lazy(() => import('./pages/Channel'));

// A simple protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen w-full"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-archival-text"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const FallbackLoader = () => (
  <div className="flex justify-center items-center h-screen w-full bg-archival-bg-secondary">
    <div className="animate-pulse font-mono text-archival-muted text-sm tracking-widest uppercase">Loading Archive...</div>
  </div>
);

function App() {
  return (
    <div className="w-full min-h-screen bg-archival-bg text-archival-text font-sans">
      <Suspense fallback={<FallbackLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/tweets" element={<Tweets />} />
            <Route path="/c/:username" element={<Channel />} />
            <Route path="/video/:videoId" element={<VideoPlayer />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
