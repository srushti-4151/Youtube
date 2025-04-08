import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { FaForward, FaBackward } from "react-icons/fa";

const VideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const [showEffect, setShowEffect] = useState({ visible: false, type: "" });
  let lastTap = 0;

  useEffect(() => {
    if (videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(videoRef.current);
      } else {
        videoRef.current.src = videoUrl;
      }
    }
  }, [videoUrl]);

  const handleTap = (e) => {
    e.preventDefault();
    const video = videoRef.current;
    if (!video) return;

    const currentTime = new Date().getTime();
    if (currentTime - lastTap < 300) {
      const rect = video.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (x < rect.width / 2) {
        video.currentTime = Math.max(0, video.currentTime - 10);
        showTapEffect("backward");
      } else {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        showTapEffect("forward");
      }
    } else {
      video.controls = !video.controls;
    }
    lastTap = currentTime;
  };

  const showTapEffect = (type) => {
    setShowEffect({ visible: true, type });
    setTimeout(() => {
      setShowEffect(prev => ({ ...prev, visible: false }));
    }, 500);
  };

  return (
    <div className="relative w-full h-full" onClick={handleTap}>
      <video
        ref={videoRef}
        controls
        autoPlay
        className="w-full h-full rounded-lg dark:shadow-custom dark:shadow-neutral-900 aspect-video"
      />

      {/* Enhanced Double-Tap Effect */}
      {showEffect.visible && (
        <div className={`
          absolute inset-0 flex items-center justify-center
          ${showEffect.type === "backward" ? "bg-gradient-to-r" : "bg-gradient-to-l"}
          from-black/20 to-transparent pointer-events-none
          transition-opacity duration-200
          ${showEffect.visible ? 'opacity-100' : 'opacity-0'}
        `}>
          <div className={`
            flex items-center justify-center
            bg-black/70 rounded-full p-4
            transition-all duration-300
            ${showEffect.visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
          `}>
            {showEffect.type === "backward" ? (
              <div className="flex items-center text-white space-x-2">
                <FaBackward className="text-2xl" />
                <span className="text-xl font-medium">10</span>
              </div>
            ) : (
              <div className="flex items-center text-white space-x-2">
                <span className="text-xl font-medium">10</span>
                <FaForward className="text-2xl" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;