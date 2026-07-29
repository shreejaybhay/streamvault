"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Hls from "hls.js"
import { FiPlay, FiSearch, FiGrid, FiList, FiTv, FiGlobe, FiRotateCw, FiAlertTriangle, FiHeart } from "react-icons/fi"
import { MdClose, MdHd, MdFullscreen } from "react-icons/md"
import { BsXCircleFill, BsHeartFill } from "react-icons/bs"

const LiveTVPage = () => {
  const [allChannels, setAllChannels] = useState([])
  const [displayedChannels, setDisplayedChannels] = useState([])
  const [logos, setLogos] = useState({})
  const [filteredChannels, setFilteredChannels] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid")
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)
  const [streamError, setStreamError] = useState(false)
  const [favorites, setFavorites] = useState([])

  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const CHANNELS_PER_PAGE = 40

  useEffect(() => {
    try {
      const saved = localStorage.getItem("favorite_live_channels")
      if (saved) setFavorites(JSON.parse(saved))
    } catch (e) {}
  }, [])

  const toggleFavorite = (e, channelId) => {
    e.stopPropagation()
    let updated
    if (favorites.includes(channelId)) {
      updated = favorites.filter((id) => id !== channelId)
    } else {
      updated = [...favorites, channelId]
    }
    setFavorites(updated)
    try {
      localStorage.setItem("favorite_live_channels", JSON.stringify(updated))
    } catch (e) {}
  }

  useEffect(() => {
    fetchChannelsAndLogos()
  }, [])

  useEffect(() => {
    filterChannels()
  }, [allChannels, searchTerm, selectedCategory, favorites])

  useEffect(() => {
    loadDisplayedChannels()
  }, [filteredChannels, page])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
      const clientHeight = document.documentElement.clientHeight || window.innerHeight

      if (scrollTop + clientHeight >= scrollHeight - 350 && hasMore && !isLoadingMore && !isLoading) {
        loadMoreChannels()
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [hasMore, isLoadingMore, isLoading, filteredChannels])

  // Multi-tier HLS Player Controller
  useEffect(() => {
    if (!showPlayer || !selectedChannel) return

    setVideoLoading(true)
    setStreamError(false)

    const video = videoRef.current
    if (!video) return

    const rawStreamUrl = selectedChannel.url
    const localProxyUrl = `/api/proxy?url=${encodeURIComponent(rawStreamUrl)}`
    const publicProxyUrl = `https://corsproxy.io/?${encodeURIComponent(rawStreamUrl)}`

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    const loadHlsSource = (stage = 1) => {
      let srcUrl = rawStreamUrl
      if (stage === 2) srcUrl = localProxyUrl
      if (stage === 3) srcUrl = publicProxyUrl

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        })
        hlsRef.current = hls

        hls.loadSource(srcUrl)
        hls.attachMedia(video)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setVideoLoading(false)
          setStreamError(false)
          video.play().catch((err) => console.warn("Autoplay:", err))
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            hls.destroy()
            if (stage < 3) {
              loadHlsSource(stage + 1)
            } else {
              setVideoLoading(false)
              setStreamError(true)
            }
          }
        })
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = srcUrl
        video.addEventListener("loadedmetadata", () => {
          setVideoLoading(false)
          setStreamError(false)
          video.play().catch((err) => console.warn("Autoplay:", err))
        })
        video.addEventListener("error", () => {
          if (stage < 3) {
            loadHlsSource(stage + 1)
          } else {
            setVideoLoading(false)
            setStreamError(true)
          }
        })
      } else {
        setVideoLoading(false)
        setStreamError(true)
      }
    }

    loadHlsSource(1)

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [selectedChannel, showPlayer])

  const fetchChannelsAndLogos = async () => {
    try {
      setIsLoading(true)

      const channelsResponse = await fetch("https://iptv-org.github.io/api/streams.json")
      if (!channelsResponse.ok) throw new Error("Failed to fetch channels")
      const channelsData = await channelsResponse.json()

      const httpsChannels = channelsData.filter(
        (channel) =>
          channel.url &&
          channel.url.startsWith("https://") &&
          channel.title &&
          channel.channel
      )

      let logosMap = {}
      try {
        const logosResponse = await fetch("https://iptv-org.github.io/api/logos.json")
        if (logosResponse.ok) {
          const logosData = await logosResponse.json()
          logosData.forEach((logo) => {
            if (!logosMap[logo.channel] && logo.url) {
              logosMap[logo.channel] = logo.url
            }
          })
        }
      } catch (logoError) {}

      const countryMap = {
        US: "United States",
        UK: "United Kingdom",
        CA: "Canada",
        AU: "Australia",
        DE: "Germany",
        FR: "France",
        IT: "Italy",
        ES: "Spain",
        IN: "India",
        JP: "Japan",
        KR: "South Korea",
        CN: "China",
        BR: "Brazil",
        MX: "Mexico",
        AR: "Argentina",
        RU: "Russia",
        TR: "Turkey",
        EG: "Egypt",
        SA: "Saudi Arabia",
        AE: "UAE",
        ZA: "South Africa",
      }

      const uniqueCategories = [
        ...new Set(
          httpsChannels.map((channel) => {
            const parts = channel.channel.split(".")
            const country = parts[parts.length - 1]?.toUpperCase()
            return countryMap[country] || country || "Other"
          })
        ),
      ]

      setAllChannels(httpsChannels)
      setLogos(logosMap)
      setCategories(["All", "Favorites", ...uniqueCategories.sort()])
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setIsLoading(false)
    }
  }

  const filterChannels = useCallback(() => {
    let filtered = [...allChannels]

    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((channel) => {
        const titleMatch = channel.title && channel.title.toLowerCase().includes(searchLower)
        const channelMatch = channel.channel && channel.channel.toLowerCase().includes(searchLower)
        return titleMatch || channelMatch
      })
    }

    if (selectedCategory === "Favorites") {
      filtered = filtered.filter((channel) => favorites.includes(channel.channel))
    } else if (selectedCategory !== "All") {
      const countryMap = {
        US: "United States",
        UK: "United Kingdom",
        CA: "Canada",
        AU: "Australia",
        DE: "Germany",
        FR: "France",
        IT: "Italy",
        ES: "Spain",
        IN: "India",
        JP: "Japan",
        KR: "South Korea",
        CN: "China",
        BR: "Brazil",
        MX: "Mexico",
        AR: "Argentina",
        RU: "Russia",
        TR: "Turkey",
        EG: "Egypt",
        SA: "Saudi Arabia",
        AE: "UAE",
        ZA: "South Africa",
      }

      filtered = filtered.filter((channel) => {
        const parts = channel.channel.split(".")
        const country = parts[parts.length - 1]?.toUpperCase()
        const categoryName = countryMap[country] || country || "Other"
        return categoryName === selectedCategory
      })
    }

    setFilteredChannels(filtered)
    setPage(1)
  }, [allChannels, searchTerm, selectedCategory, favorites])

  const loadDisplayedChannels = useCallback(() => {
    const endIndex = page * CHANNELS_PER_PAGE
    const channelsToShow = filteredChannels.slice(0, endIndex)
    setDisplayedChannels(channelsToShow)
    setHasMore(endIndex < filteredChannels.length)
  }, [filteredChannels, page])

  const loadMoreChannels = useCallback(() => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    setTimeout(() => {
      setPage((prevPage) => prevPage + 1)
      setIsLoadingMore(false)
    }, 200)
  }, [isLoadingMore, hasMore])

  const handleChannelClick = (channel) => {
    setSelectedChannel(channel)
    setShowPlayer(true)
  }

  const closePlayer = () => {
    setShowPlayer(false)
    setSelectedChannel(null)
    setVideoLoading(false)
    setStreamError(false)
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
  }

  const retryStream = () => {
    if (selectedChannel) {
      setStreamError(false)
      setVideoLoading(true)
      const current = selectedChannel
      setSelectedChannel(null)
      setTimeout(() => setSelectedChannel(current), 50)
    }
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return
    if (video.requestFullscreen) {
      video.requestFullscreen()
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen()
    }
  }

  const renderLogo = (channel) => {
    const logoUrl = logos[channel.channel]
    if (logoUrl) {
      return (
        <img
          src={logoUrl}
          alt={channel.title}
          className="object-contain w-full h-full p-3"
          onError={(e) => {
            e.target.style.display = "none"
            if (e.target.nextSibling) e.target.nextSibling.style.display = "flex"
          }}
        />
      )
    }
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-base-content/60 text-xs font-medium p-2 text-center">
        <FiTv className="w-5 h-5 mb-1 opacity-50" />
        <span className="truncate max-w-[90%]">{channel.title?.substring(0, 15)}</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-40 bg-base-300 rounded animate-pulse"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="aspect-video bg-base-300 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Minimal Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base-300 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FiTv className="text-primary" /> Live TV
            </h1>
            <p className="text-xs text-base-content/60 mt-0.5">
              {filteredChannels.length.toLocaleString()} channels available
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search channels..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:border-primary"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                >
                  <BsXCircleFill size={14} />
                </button>
              )}
            </div>

            {/* Region Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-sm bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:border-primary"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "Favorites" ? "❤️ Favorites" : cat}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-base-100 border border-base-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${viewMode === "grid" ? "bg-primary text-primary-content" : "text-base-content/60"}`}
                title="Grid"
              >
                <FiGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded ${viewMode === "list" ? "bg-primary text-primary-content" : "text-base-content/60"}`}
                title="List"
              >
                <FiList size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Channels Grid/List View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayedChannels.map((channel, index) => {
              const isFav = favorites.includes(channel.channel)
              return (
                <div
                  key={`${channel.channel}-${index}`}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleChannelClick(channel)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target === e.currentTarget) {
                      handleChannelClick(channel)
                    }
                  }}
                  className="group relative bg-base-100 border border-base-300 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 focus:outline-none"
                >
                  <div className="aspect-video bg-base-300/40 relative flex items-center justify-center">
                    {renderLogo(channel)}

                    {/* Quality Badge */}
                    {channel.quality && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-base-900/80 text-white text-[10px] font-medium rounded border border-white/10">
                        {channel.quality}
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                        {channel.title}
                      </h3>
                      <p className="text-[11px] text-base-content/50 truncate">{channel.channel}</p>
                    </div>

                    <button
                      onClick={(e) => toggleFavorite(e, channel.channel)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation()
                          toggleFavorite(e, channel.channel)
                        }
                      }}
                      className="text-base-content/40 hover:text-red-500 transition-colors p-1 z-10"
                      title="Toggle Favorite"
                    >
                      {isFav ? <BsHeartFill className="text-red-500" size={13} /> : <FiHeart size={13} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {displayedChannels.map((channel, index) => {
              const isFav = favorites.includes(channel.channel)
              return (
                <div
                  key={`${channel.channel}-${index}`}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleChannelClick(channel)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target === e.currentTarget) {
                      handleChannelClick(channel)
                    }
                  }}
                  className="group flex items-center justify-between p-3 bg-base-100 border border-base-300 rounded-lg cursor-pointer hover:shadow-sm hover:border-primary/40 transition-all duration-200 focus:outline-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-8 bg-base-200 rounded overflow-hidden flex-shrink-0 border border-base-300 flex items-center justify-center">
                      {renderLogo(channel)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                        {channel.title}
                      </h3>
                      <p className="text-[11px] text-base-content/50 truncate">{channel.channel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={(e) => toggleFavorite(e, channel.channel)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation()
                          toggleFavorite(e, channel.channel)
                        }
                      }}
                      className="text-base-content/40 hover:text-red-500 transition-colors p-1 z-10"
                      title="Toggle Favorite"
                    >
                      {isFav ? <BsHeartFill className="text-red-500" size={14} /> : <FiHeart size={14} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Loading Spinner for Load More */}
        {isLoadingMore && (
          <div className="flex justify-center py-6">
            <div className="loading loading-spinner loading-md text-primary"></div>
          </div>
        )}

        {/* Load More Button */}
        {!isLoadingMore && hasMore && displayedChannels.length > 0 && (
          <div className="flex justify-center pt-4">
            <button onClick={loadMoreChannels} className="btn btn-outline btn-sm px-6 rounded-lg">
              Load More
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredChannels.length === 0 && !isLoading && (
          <div className="py-16 text-center border border-dashed border-base-300 rounded-lg">
            <FiTv className="mx-auto text-3xl text-base-content/30 mb-2" />
            <h3 className="text-sm font-semibold">No channels found</h3>
            <p className="text-xs text-base-content/50 mt-1">
              {selectedCategory === "Favorites"
                ? "You haven't added any favorite channels yet."
                : "Try adjusting your search or region filter."}
            </p>
          </div>
        )}
      </div>

      {/* Clean Player Modal */}
      {showPlayer && selectedChannel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 border border-base-300 rounded-xl overflow-hidden max-w-4xl w-full flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-base-200 border border-base-300 rounded p-0.5 flex-shrink-0 flex items-center justify-center">
                  {renderLogo(selectedChannel)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold truncate">{selectedChannel.title}</h3>
                  <p className="text-[11px] text-base-content/50 truncate">{selectedChannel.channel}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={toggleFullscreen} className="p-1.5 text-base-content/60 hover:text-base-content rounded">
                  <MdFullscreen size={20} />
                </button>
                <button onClick={closePlayer} className="p-1.5 text-base-content/60 hover:text-base-content rounded">
                  <MdClose size={20} />
                </button>
              </div>
            </div>

            {/* Video Container */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {videoLoading && !streamError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                  <div className="loading loading-spinner loading-lg text-primary"></div>
                </div>
              )}

              {streamError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-6 text-center">
                  <FiAlertTriangle className="text-amber-500 text-3xl mb-2" />
                  <h4 className="text-white text-sm font-bold">Stream Unavailable</h4>
                  <p className="text-gray-400 text-xs mt-1 mb-4 max-w-md">
                    This live stream is currently offline from the broadcaster or restricted.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={retryStream} className="btn btn-primary btn-xs px-3">
                      Retry
                    </button>
                    <button onClick={closePlayer} className="btn btn-ghost btn-xs text-white">
                      Close
                    </button>
                  </div>
                </div>
              )}

              <video ref={videoRef} controls autoPlay playsInline className="w-full h-full">
                Your browser does not support HTML5 video streaming.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveTVPage