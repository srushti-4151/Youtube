import { useEffect, useRef } from "react";
import Hls from "hls.js";

const VideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null); // Store the HLS instance

  useEffect(() => {
    if (videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(videoRef.current);
        hlsRef.current = hls; // Store reference
      } else {
        videoRef.current.src = videoUrl; // Fallback for Safari
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy(); // Cleanup HLS instance
      }
    };
  }, [videoUrl]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      className="w-full rounded-lg dark:shadow-custom dark:shadow-neutral-900 aspect-video"
    ></video>
  );
};

export default VideoPlayer;
