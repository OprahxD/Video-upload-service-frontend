# ARCHIVE.ONE Frontend Client

A minimal, monospaced "Archival Style" web interface for the **ARCHIVE.ONE** creator platform. Crafted to emulate digital catalog residues, with warm sepia tones, typewriter typography, glassmorphism panel designs, and micro-animations.

## 🛠️ Tech Stack

- **Core**: React 19 (Vite environment)
- **Styling**: TailwindCSS & Custom CSS variables
- **State & Queries**: `@tanstack/react-query` (react-query)
- **Routing**: `react-router-dom` (v7)
- **OAuth**: `@react-oauth/google`
- **Asset Streams**: Axios client

---

## 🚀 Key Implementations & Enhancements

### 1. Minimal Monospaced "Archival Style" Design
- **Scattered Document Collage Grid**: The home page features a typewriter separation aesthetic where video cards are displayed as tilted sepia-toned sheets that dynamically straighten, scale, and start autoplaying preview clips on hover.
- **Micro-Interactions**: Replaced standard emojis with sleek, custom-crafted SVG assets for searching, liking/unliking, and timeline operations.
- **Glassmorphism Panels**: Interactive forms and dialogue windows are rendered as semi-transparent glass cards with custom polaroid shadows.

### 2. Robust Network Client & Security Interceptors
- **Self-Healing API Paths**: Configured the Axios client (`src/api/axios.js`) to automatically audit the `VITE_API_URL` environment variable. If the path lacks the `/api/v1` suffix, the client appends it dynamically behind the scenes.
- **Dynamic HTTPS Upgrades**: If loaded in an HTTPS production environment, the client dynamically upgrades any backend URL declared as `http` to secure `https` to prevent browsers from blocking the requests.
- **Global Mixed-Content Sanitizer**: Added an Axios response interceptor that recursively sanitizes all incoming API responses. Any Cloudinary resource loaded over unencrypted `http://res.cloudinary.com` is instantly rewritten to `https://res.cloudinary.com` at runtime, completely eliminating "Not Secure" browser warning icons.
- **Fault-Tolerant Request Timeouts**: Configured a strict 10-second network timeout. If the backend freezes or encounters cold start issues, the frontend aborts the query, sets loading to false, and safely mounts the UI (e.g. as a guest user) instead of hanging on a black loading screen.

### 3. User Registry & Authentication
- **Integrated Sign-Up Page (`src/pages/Register.jsx`)**: Designed a custom registration system supporting multipart/form-data payloads. Enables dual file selections (Avatar and Cover Image) with live previews.
- **OAuth 2.0 Integration**: Integrated Google Identity Services to allow seamless registration and sign-in.
- **Protected Paths**: Created user verification middleware routing (`ProtectedRoute`) to shield the creator studio dashboard from guest visits.

### 4. High-Performance Feeds
- **Infinite Scrolling**: Configured video query feeds utilizing React Intersection Observer and TanStack React Query to fetch and load additional catalog records as the user scrolls.

---

## 🔑 Environment Variables (`.env`)

Add the following to your local `.env` or Vercel Environment Variables:

```ini
VITE_API_URL=https://video-upload-service-pi.vercel.app
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 🏃 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the hot-reloading development server:
   ```bash
   npm run dev
   ```
3. Compile production bundle:
   ```bash
   npm run build
   ```
