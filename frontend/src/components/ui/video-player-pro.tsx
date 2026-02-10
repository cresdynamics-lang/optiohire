"use client"

import React, { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, Volume1, VolumeX, Maximize2, RotateCw, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface VideoPlayerProProps {
  src: string
  poster?: string
  className?: string
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

const VideoPlayerPro: React.FC<VideoPlayerProProps> = ({ src, poster, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isEnded, setIsEnded] = useState<boolean>(false)
  const [volume, setVolume] = useState<number>(1)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [showControls, setShowControls] = useState<boolean>(true)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)

  // Update duration when metadata loads
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        setDuration(video.duration)
      }
    }

    const handleLoadedData = () => {
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        setDuration(video.duration)
      }
    }

    const handleDurationChange = () => {
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        setDuration(video.duration)
      }
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("loadeddata", handleLoadedData)
    video.addEventListener("durationchange", handleDurationChange)

    // Check if duration is already available
    if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
      setDuration(video.duration)
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("loadeddata", handleLoadedData)
      video.removeEventListener("durationchange", handleDurationChange)
    }
  }, [src])

  // Play / Pause / Restart
  const togglePlay = () => {
    if (!videoRef.current) return
    if (isEnded) {
      videoRef.current.currentTime = 0
      setIsEnded(false)
    }
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  // Update progress and time
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100
    setProgress(isFinite(prog) ? prog : 0)
    setCurrentTime(videoRef.current.currentTime)
    if (videoRef.current.duration && !isNaN(videoRef.current.duration) && isFinite(videoRef.current.duration)) {
      setDuration(videoRef.current.duration)
    }
  }

  // Video ended
  const handleEnded = () => {
    setIsEnded(true)
    setIsPlaying(false)
  }

  // Seek
  const handleSeek = (percent: number) => {
    if (!videoRef.current) return
    const time = (percent / 100) * (videoRef.current.duration || 0)
    if (isFinite(time)) {
      videoRef.current.currentTime = time
      setProgress(percent)
      setCurrentTime(time)
    }
  }

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err)
      })
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Exit fullscreen failed:", err)
      })
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
    if (!isMuted) {
      setVolume(0)
    } else {
      setVolume(1)
      videoRef.current.volume = 1
    }
  }

  // Handle volume change
  const handleVolumeChange = (val: number[]) => {
    const newVolume = val[0] / 100
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      videoRef.current.muted = newVolume === 0
    }
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden bg-black", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
        onClick={togglePlay}
      />

      {/* Controls - Always visible on mobile when playing, hover on desktop */}
      <AnimatePresence>
        {(showControls || isPlaying) && (
          <motion.div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent"
            style={{ 
              opacity: isPlaying ? 1 : (showControls ? 1 : 0),
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: isPlaying ? 1 : (showControls ? 1 : 0) }}
            exit={{ y: 20, opacity: 0 }}
          >
            {/* Progress bar */}
            <div
              className="absolute bottom-12 left-0 right-0 h-2 sm:h-1.5 bg-white/20 cursor-pointer touch-none px-2"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left
                const width = rect.width
                handleSeek((x / width) * 100)
              }}
              onTouchStart={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.touches[0].clientX - rect.left
                const width = rect.width
                handleSeek((x / width) * 100)
              }}
            >
              <motion.div
                className="absolute top-0 left-2 right-2 h-full bg-[#2D2DDD] rounded-full"
                style={{ width: `calc(${Math.max(0, Math.min(progress, 100))}% - 16px)` }}
              />
              {/* Progress circle */}
              <div
                className="absolute top-1/2 w-4 h-4 sm:w-3 sm:h-3 rounded-full bg-[#2D2DDD] border-2 border-white shadow-lg transition-all duration-100 z-10 pointer-events-none"
                style={{
                  left: `clamp(8px, calc(${progress}% - 8px), calc(100% - 24px))`,
                  transform: "translateY(-50%)",
                }}
              />
            </div>

            {/* Control Row */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Play / Pause / Restart */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePlay()
                  }}
                >
                  {isEnded ? (
                    <RotateCw className="w-5 h-5" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>

                {/* Volume */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : volume > 0.5 ? (
                        <Volume2 className="w-5 h-5" />
                      ) : (
                        <Volume1 className="w-5 h-5" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32 bg-black/90 border-white/20 p-2">
                    <Slider
                      value={[volume * 100]}
                      onValueChange={handleVolumeChange}
                      step={1}
                      min={0}
                      max={100}
                      className="w-full"
                    />
                  </PopoverContent>
                </Popover>

                {/* Timer */}
                <span className="text-white text-xs sm:text-sm font-medium font-figtree">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Settings */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-black/90 border-white/20 w-40 p-2">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-white/70">Speed</span>
                      {[0.5, 1, 1.5, 2].map((s) => (
                        <Button
                          key={s}
                          variant={playbackSpeed === s ? "default" : "outline"}
                          size="sm"
                          className="w-full text-white"
                          onClick={() => {
                            if (videoRef.current) videoRef.current.playbackRate = s
                            setPlaybackSpeed(s)
                          }}
                        >
                          {s}x
                        </Button>
                      ))}
                      <span className="text-sm font-medium text-white/70 mt-2">Captions</span>
                      <Button variant="outline" size="sm" className="w-full text-white">
                        Off
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFullscreen()
                  }}
                >
                  <Maximize2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play button overlay when paused */}
      {!isPlaying && !isEnded && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              background: "linear-gradient(135deg, rgba(74, 13, 186, 0.95), rgba(74, 13, 186, 0.85))",
              boxShadow: "0 0 40px rgba(74, 13, 186, 0.6), 0 0 80px rgba(74, 13, 186, 0.4)",
            }}
          >
            <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default VideoPlayerPro

