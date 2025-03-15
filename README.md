# StreamVault - Your Entertainment Hub

StreamVault is a modern web application built with Next.js that serves as a comprehensive platform for streaming movies, TV shows, and anime. The platform offers a seamless user experience with features like user authentication, watchlist management, and a responsive design.

## Features

- 🎬 Browse and search extensive collections of movies, TV shows, and anime
- 🔍 Advanced filtering with genre selection
- 🎭 Detailed media pages with trailers, descriptions, and cast information
- 🔐 Secure user authentication with JWT
- 👤 User profile management with customizable settings
- 📋 Personal watchlist management for movies, shows, and anime
- 🎯 Add/remove content to watchlist with one click
- 🗣️ Voice search functionality for content discovery
- 📱 Fully responsive design for all devices
- 💫 Smooth animations and transitions using Framer Motion
- 🎨 Modern UI with Tailwind CSS and DaisyUI
- 🌙 Beautiful backdrop blur effects and glass morphism
- 📺 Video player integration for content streaming
- 🔄 Persistent storage for user preferences and search history
- 🎬 TMDB API integration for rich media content
- 🔒 Protected routes with middleware authentication
- 🎯 Custom animations and micro-interactions
- 🌓 Light and dark mode with smooth transitions
- 🎨 Consistent design system with custom components
- 💎 Polished UI with subtle shadows and borders

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Styling:** 
  - Tailwind CSS for utility-first styling
  - DaisyUI for component primitives
  - Custom design system with consistent shadows and borders
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **State Management:** React Context
- **UI Components:** 
  - Radix UI for accessible components
  - Custom animated components
- **Icons:** 
  - React Icons
  - Lucide React for consistent iconography
- **Animations:** 
  - Framer Motion for page transitions
  - Custom keyframe animations
  - Micro-interactions
- **HTTP Client:** Axios
- **Data Fetching:** SWR
- **Image Optimization:** Next.js Image Component
- **Performance:** 
  - Route prefetching
  - Image optimization
  - Component lazy loading

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/streamvault.git
cd streamvault
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_KEY=your_jwt_secret_key
TMDB_API_KEY=your_tmdb_api_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Design System

- **Colors:** Custom color palette with primary and accent colors
- **Typography:** Consistent font scaling with responsive sizes
- **Spacing:** Standardized spacing scale
- **Shadows:** Subtle, layered shadows for depth
- **Borders:** Light gray borders with consistent opacity
- **Animations:** Smooth transitions and micro-interactions
- **Components:** Reusable, styled components with consistent design

## Developer

Developed with ❤️ by Shree Jaybhay

## License

This project is licensed under the MIT License.
