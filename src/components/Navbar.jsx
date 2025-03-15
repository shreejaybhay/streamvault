"use client";
import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "./AuthContext";
import { useRouter, usePathname } from "next/navigation"; // Add usePathname
import { FiUser, FiLogIn, FiMenu, FiX, FiHome, FiFilm, FiTv, FiBookmark, FiSettings, FiLogOut } from "react-icons/fi";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const Navbar = () => {
  const { user, logout, loading } = useContext(AuthContext); // Add loading state from context
  const [img, setImg] = useState(null);
  const router = useRouter();
  const pathname = usePathname(); // Add this hook
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Add useEffect for handling clicks outside navbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Add blur class to body when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Handle dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        const response = await fetch("/api/currentUser", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setImg(data.profileURL);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [user]);

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const navItems = [
    { href: "/", label: "Home", icon: FiHome },
    { href: "/movies", label: "Movies", icon: FiFilm },
    { href: "/shows", label: "TV Shows", icon: FiTv },
    { href: "/animes", label: "Anime", icon: FiTv },
    { href: "/watchlist", label: "Watchlist", icon: FiBookmark },
  ];

  // Function to check if a nav item is active
  const isActive = (href) => {
    if (href === '/') {
      return pathname === href;
    }
    // More specific matching to prevent partial matches
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="sticky top-0 z-50 backdrop-blur-md bg-base-100/80 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="w-32 h-8 bg-base-300 animate-pulse rounded"></div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-8 bg-base-300 animate-pulse rounded"></div>
              <div className="w-24 h-8 bg-base-300 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Menu - Move it before the main navbar */}
      <AnimatePresence mode="wait">
        {mobileMenuOpen && (
          <>
            {/* Backdrop with blur effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="fixed inset-0 min-h-screen w-full bg-black/60 backdrop-blur-sm z-[45]"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            
            {/* Sliding Menu Panel */}
            <motion.aside 
              ref={mobileMenuRef}
              initial={{ translateX: '-100%' }}
              animate={{ translateX: '0%' }}
              exit={{ translateX: '-100%' }}
              transition={{ 
                type: "tween",
                duration: 0.15,
                ease: "easeOut"
              }}
              className="fixed top-0 left-0 h-screen w-[280px] max-w-[80vw] bg-base-100 shadow-xl z-[50] will-change-transform"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="sticky top-0 z-20 p-4 border-b border-base-200 bg-base-100">
                  <div className="flex items-center justify-between">
                    <Link 
                      href="/" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xl font-bold tracking-wider hover:text-primary transition-colors duration-300"
                    >
                      StreamVault
                    </Link>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-base-200 text-base-content/70"
                    >
                      <FiX size={24} />
                    </motion.button>
                  </div>
                </div>

                {/* User Profile Section (if logged in) */}
                {user && (
                  <div className="p-4 border-b border-base-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={img || "https://i.postimg.cc/WzZPrDT4/default-avatar-icon-of-social-media-user-vector.jpg"}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                      />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-base-content/70 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-1">
                    {navItems.map((item) => (
                      <motion.div
                        key={item.href}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                            isActive(item.href)
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-base-200"
                          }`}
                        >
                          <item.icon className={`w-5 h-5 ${isActive(item.href) ? "text-primary-foreground" : "text-primary"}`} />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* Bottom Actions */}
                <div className="sticky bottom-0 z-20 p-4 border-t border-base-200 bg-base-100">
                  {!user ? (
                    <div className="space-y-2">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-200"
                      >
                        <FiLogIn className="text-primary" />
                        <span className="font-medium">Login</span>
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-200"
                      >
                        <FiUser />
                        <span className="font-medium">Sign Up</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 p-3 rounded-lg hover:bg-base-200 transition-all duration-200"
                      >
                        <FiUser className="text-primary" />
                        <span className="font-medium">Profile</span>
                      </Link>
                      <Link
                        href={`/editprofile/${user._id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 p-3 rounded-lg hover:bg-base-200 transition-all duration-200"
                      >
                        <FiSettings className="text-primary" />
                        <span className="font-medium">Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-base-200 text-error transition-all duration-200"
                      >
                        <FiLogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}

                  {/* Dark Mode Toggle */}
                  <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-base-200">
                    <span className="font-medium">Dark Mode</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleDarkMode}
                      className="p-2 rounded-full bg-base-300 hover:bg-base-100 transition-all duration-200"
                    >
                      {isDarkMode ? (
                        <HiOutlineSun className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <HiOutlineMoon className="w-5 h-5 text-indigo-500" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Navbar */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-base-100/80 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-base-200 hover:text-primary transition-all duration-300"
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </motion.button>
              
              <Link href="/" className="text-xl font-bold tracking-wider hover:text-primary transition-colors duration-300">
                StreamVault
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 font-medium transition-colors duration-300 relative py-1 ${
                    isActive(item.href)
                      ? "text-primary"
                      : "text-base-content/80 hover:text-primary"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-transparent">
                    {isActive(item.href) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                          mass: 0.8
                        }}
                      />
                    )}
                  </div>
                </Link>
              ))}
            </nav>
            
            {/* User Actions */}
            <div className="flex items-center gap-3">
              {!user ? (
                <>
                  <div className="hidden lg:flex items-center gap-3"> {/* Add hidden lg:flex here */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Link 
                        href="/login" 
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-base-200 transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        <FiLogIn className="text-primary" />
                        <span className="font-medium">Login</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Link 
                        href="/signup" 
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        <FiUser />
                        <span className="font-medium">Sign Up</span>
                      </Link>
                    </motion.div>
                  </div>
                </>
              ) : (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-300"
                  >
                    <img
                      src={img || "https://i.postimg.cc/WzZPrDT4/default-avatar-icon-of-social-media-user-vector.jpg"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary"
                    />
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 rounded-xl bg-base-200 shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-base-300 overflow-hidden"
                      >
                        <div className="px-4 py-3">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-base-content/70 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-base-300 transition-colors duration-200"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FiUser className="w-4 h-4" />
                            Profile
                          </Link>
                          <Link
                            href={`/editprofile/${user._id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-base-300 transition-colors duration-200"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FiSettings className="w-4 h-4" />
                            Settings
                          </Link>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error hover:bg-base-300 transition-colors duration-200"
                          >
                            <FiLogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              {/* Dark Mode Toggle */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-base-200 hover:bg-base-300 transition-all duration-300"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <HiOutlineSun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <HiOutlineMoon className="w-5 h-5 text-indigo-500" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
