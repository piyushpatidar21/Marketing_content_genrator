import React, { useState, useEffect, useRef } from "react";
import {
  ImageIcon,
  Video,
  Mic,
  Play,
  Pause,
  RotateCcw,
  Download,
  Sparkles,
  Volume2,
  VolumeX,
  Palette,
} from "lucide-react";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";

interface MediaStudioProps {
  mediaPrompt?: string;
  imageDetails?: Record<string, any>;
  videoScript?: {
    concept?: string;
    duration?: string;
    scenes?: Array<{
      scene_number?: number;
      timestamp?: string;
      visual?: string;
      camera?: string;
      voiceover?: string;
      text_overlay?: string;
    }>;
    audio_direction?: string;
    end_cta?: string;
  };
  audioScript?: {
    voiceover_text?: string;
    voice_profile?: string;
    pacing?: string;
    bgm_direction?: string;
    sound_effects?: string[];
  };
  platform: string;
  campaignName?: string;
  hookText?: string;
  ctaText?: string;
}

export const MediaStudio: React.FC<MediaStudioProps> = ({
  mediaPrompt,
  videoScript,
  audioScript,
  platform,
  campaignName,
  hookText,
  ctaText,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<
    "image" | "video" | "audio"
  >("image");

  // ===================== IMAGE GENERATOR STATE =====================
  const [imageStyle, setImageStyle] = useState<string>("Photorealistic");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">(
    "1:1",
  );
  const [seed, setSeed] = useState<number>(() =>
    Math.floor(Math.random() * 1000000),
  );
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);

  const stylePrompts: Record<string, string> = {
    Photorealistic:
      "ultra-detailed 8k commercial product photography, cinematic studio lighting, shot on 35mm lens, award-winning advertising visual",
    "3D Modern Render":
      "hyper-detailed 3D octane render, Raytracing, vivid volumetric lighting, trendy tech aesthetic, glossy surfaces",
    "Cyberpunk / Neon":
      "futuristic cyberpunk aesthetic, dramatic neon glow, dark moody reflections, high energy synthwave vibe",
    "Minimalist Clean":
      "clean minimalist Scandinavian design, soft natural morning sunlight, clean pastel background, sophisticated",
    "Pop Art Vibrant":
      "vibrant pop art color blocking, bold saturated colors, trendy Gen-Z marketing style, dynamic motion",
    "Vintage Aesthetic":
      "warm nostalgic film grain, 90s vintage magazine advertisement, retro warm colors, authentic",
  };

  const basePrompt =
    mediaPrompt ||
    `${campaignName || "Modern Product"} marketing visual for ${platform}`;
  const styledPrompt = `${basePrompt}, ${stylePrompts[imageStyle] || ""}`;

  const aspectDimensions = {
    "1:1": { width: 1024, height: 1024 },
    "16:9": { width: 1280, height: 720 },
    "9:16": { width: 720, height: 1280 },
  };

  const currentDims = aspectDimensions[aspectRatio];
  const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    styledPrompt,
  )}?width=${currentDims.width}&height=${currentDims.height}&seed=${seed}&nologo=true`;

  const handleRegenerateImage = () => {
    setIsImageLoading(true);
    setImageLoaded(false);
    setSeed(Math.floor(Math.random() * 1000000));
  };

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${platform}-generated-visual-${seed}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(generatedImageUrl, "_blank");
    }
  };

  // ===================== VIDEO SIMULATOR STATE =====================
  const scenes = videoScript?.scenes || [
    {
      scene_number: 1,
      timestamp: "0:00 - 0:04",
      visual:
        "Dynamic opening shot introducing core problem with high energy motion",
      camera: "Fast punch-in zoom",
      voiceover:
        hookText ||
        "Are you struggling to scale your marketing workflow in 2026?",
      text_overlay: hookText || "Stop Wasting Time on Manual Content",
    },
    {
      scene_number: 2,
      timestamp: "0:04 - 0:10",
      visual:
        "Product demonstration showing instant AI generation across multiple platforms",
      camera: "Smooth tracking pan across dashboard",
      voiceover:
        "OmniMarket AI automates multi-channel copy, visuals, and campaigns in seconds.",
      text_overlay: "10x Faster Output. Zero Friction.",
    },
    {
      scene_number: 3,
      timestamp: "0:10 - 0:15",
      visual:
        "Hero customer celebration with final call to action badge on screen",
      camera: "Cinematic slow pull back with logo lockup",
      voiceover:
        ctaText ||
        "Start your free trial today and revolutionize your marketing.",
      text_overlay: ctaText || "Try OmniMarket AI Free Today",
    },
  ];

  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoMuted, setVideoMuted] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speakVoiceover = (text: string) => {
    if (!synthRef.current || videoMuted) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    let interval: any;
    if (isVideoPlaying) {
      const currentScene = scenes[currentSceneIdx];
      if (currentScene?.voiceover && !videoMuted) {
        speakVoiceover(currentScene.voiceover);
      }

      interval = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            if (currentSceneIdx < scenes.length - 1) {
              setCurrentSceneIdx((s) => s + 1);
              return 0;
            } else {
              setIsVideoPlaying(false);
              return 100;
            }
          }
          return prev + 2.5;
        });
      }, 100);
    } else {
      if (synthRef.current) synthRef.current.cancel();
    }
    return () => {
      clearInterval(interval);
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [isVideoPlaying, currentSceneIdx, videoMuted]);

  const handlePlayPauseVideo = () => {
    if (!isVideoPlaying) {
      if (videoProgress >= 100 && currentSceneIdx >= scenes.length - 1) {
        setCurrentSceneIdx(0);
        setVideoProgress(0);
      }
      setIsVideoPlaying(true);
    } else {
      setIsVideoPlaying(false);
    }
  };

  const handleResetVideo = () => {
    setIsVideoPlaying(false);
    setCurrentSceneIdx(0);
    setVideoProgress(0);
    if (synthRef.current) synthRef.current.cancel();
  };

  // ===================== AUDIO STUDIO STATE =====================
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const audioText =
    audioScript?.voiceover_text || hookText || "Welcome to OmniMarket AI.";

  const handleToggleAudio = () => {
    if (!synthRef.current) return;
    if (isAudioPlaying) {
      synthRef.current.cancel();
      setIsAudioPlaying(false);
    } else {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(audioText);
      utterance.rate = playbackSpeed;
      utterance.onend = () => setIsAudioPlaying(false);
      utterance.onerror = () => setIsAudioPlaying(false);
      synthRef.current.speak(utterance);
      setIsAudioPlaying(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Media Type Selector Tabs (Scrollable on Mobile) */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 w-full sm:w-fit overflow-x-auto no-scrollbar scroll-smooth flex-nowrap">
        <button
          type="button"
          onClick={() => setActiveMediaTab("image")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeMediaTab === "image"
              ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>AI Image Generator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMediaTab("video")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeMediaTab === "video"
              ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>AI Video Player & Storyboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMediaTab("audio")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeMediaTab === "audio"
              ? "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Voiceover & Audio Studio</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. IMAGE GENERATOR TAB                                   */}
      {/* ========================================================= */}
      {activeMediaTab === "image" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {/* Style Preset */}
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Style:
                </span>
                <select
                  value={imageStyle}
                  onChange={(e) => {
                    setImageStyle(e.target.value);
                    handleRegenerateImage();
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {Object.keys(stylePrompts).map((style) => (
                    <option
                      key={style}
                      value={style}
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    >
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aspect Ratio */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                {(["1:1", "16:9", "9:16"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => {
                      setAspectRatio(ratio);
                      handleRegenerateImage();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      aspectRatio === ratio
                        ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              {/* Overlay Text Toggle */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOverlay}
                  onChange={(e) => setShowOverlay(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Marketing Banner Overlay</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRegenerateImage}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Regenerate Image
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDownloadImage}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download HD Image
              </Button>
            </div>
          </div>

          {/* Generated Image Canvas */}
          <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-xl min-h-[480px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/10 via-transparent to-accent-600/10 pointer-events-none" />

            <div
              className={`relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl transition-all duration-300 ${
                aspectRatio === "1:1"
                  ? "w-full max-w-[440px] aspect-square"
                  : aspectRatio === "16:9"
                    ? "w-full max-w-[640px] aspect-video"
                    : "w-full max-w-[320px] aspect-[9/16]"
              }`}
            >
              <img
                src={generatedImageUrl}
                alt="AI Generated Marketing Visual"
                onLoad={() => {
                  setIsImageLoading(false);
                  setImageLoaded(true);
                }}
                onError={() => setIsImageLoading(false)}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isImageLoading
                    ? "opacity-30 blur-sm scale-105"
                    : "opacity-100 blur-0 scale-100"
                }`}
              />

              {isImageLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm text-white gap-3 z-20">
                  <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-200">
                      Rendering AI Visual Asset...
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {imageStyle} • {aspectRatio}
                    </p>
                  </div>
                </div>
              )}

              {showOverlay && imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-between p-5 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                      {campaignName || "OmniMarket"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-brand-500 text-[10px] font-extrabold text-white shadow-lg">
                      NEW
                    </span>
                  </div>

                  <div className="space-y-2">
                    {hookText && (
                      <h3 className="text-white font-extrabold text-sm sm:text-base leading-tight drop-shadow-md line-clamp-2">
                        {hookText}
                      </h3>
                    )}
                    {ctaText && (
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-lg">
                        <span>{ctaText}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 w-full max-w-2xl p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="truncate text-[11px] font-mono text-slate-400">
                  {styledPrompt}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-brand-300 shrink-0 font-mono">
                Seed: {seed}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. VIDEO PLAYER & STORYBOARD SIMULATOR                   */}
      {/* ========================================================= */}
      {activeMediaTab === "video" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col">
              <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[460px]">
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(
                      `${scenes[currentSceneIdx]?.visual || "marketing commercial video"}, cinematic video frame, 4k ultra-hd`,
                    )}?width=1280&height=720&seed=${seed + currentSceneIdx}&nologo=true`}
                    alt="Scene background"
                    className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                      isVideoPlaying
                        ? "scale-115 translate-y-2"
                        : "scale-100 translate-y-0"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="accent" size="sm">
                      Scene {currentSceneIdx + 1} of {scenes.length}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-md">
                      {scenes[currentSceneIdx]?.timestamp || "0:00 - 0:05"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setVideoMuted(!videoMuted)}
                    className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                  >
                    {videoMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-brand-400" />
                    )}
                  </button>
                </div>

                <div className="relative z-10 space-y-3 my-auto py-8 text-center px-4">
                  {scenes[currentSceneIdx]?.text_overlay && (
                    <div className="inline-block px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-md border border-brand-500/40 text-brand-300 font-extrabold text-sm sm:text-base tracking-wide shadow-xl animate-fade-in">
                      {scenes[currentSceneIdx].text_overlay}
                    </div>
                  )}

                  {scenes[currentSceneIdx]?.voiceover && (
                    <p className="text-white font-medium text-xs sm:text-sm max-w-lg mx-auto bg-black/60 px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/10 leading-relaxed shadow-lg">
                      "{scenes[currentSceneIdx].voiceover}"
                    </p>
                  )}
                </div>

                <div className="relative z-10 space-y-3 pt-4 border-t border-white/10">
                  <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden cursor-pointer">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-purple-500 h-full transition-all duration-100 ease-linear rounded-full"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePlayPauseVideo}
                        className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-md active:scale-95"
                      >
                        {isVideoPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleResetVideo}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Replay from Scene 1"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-300 font-medium">
                      Camera:{" "}
                      <strong className="text-brand-300">
                        {scenes[currentSceneIdx]?.camera || "Cinematic Zoom"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3 max-h-[480px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Storyboard Scene Timeline
                </span>
                <span className="text-[11px] text-slate-500">
                  {scenes.length} Scenes Total
                </span>
              </div>

              {scenes.map((scene, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentSceneIdx(idx);
                    setVideoProgress(0);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    currentSceneIdx === idx
                      ? "border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 ring-2 ring-purple-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                      Scene {scene.scene_number || idx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded">
                      {scene.timestamp || "0:00"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold line-clamp-2">
                    {scene.visual}
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1 line-clamp-2">
                    "{scene.voiceover}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. AUDIO & VOICEOVER STUDIO                              */}
      {/* ========================================================= */}
      {activeMediaTab === "audio" && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Voiceover & Speech Studio
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  AI Speech synthesis with live audio playback.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-850 text-xs">
                {[1.0, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      playbackSpeed === speed
                        ? "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleToggleAudio}
                leftIcon={
                  isAudioPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )
                }
              >
                {isAudioPlaying ? "Pause Audio" : "Listen to Voiceover"}
              </Button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950 via-slate-950 to-brand-950 border border-cyan-900/50 flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center justify-center gap-1.5 h-16 w-full">
              {[
                40, 65, 30, 85, 95, 45, 70, 90, 60, 40, 80, 100, 55, 35, 75, 90,
                60, 45, 80, 50,
              ].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isAudioPlaying
                      ? "bg-cyan-400 animate-pulse"
                      : "bg-slate-700"
                  }`}
                  style={{
                    height: isAudioPlaying
                      ? `${Math.max(15, Math.round(h * Math.random()))}%`
                      : "20%",
                  }}
                />
              ))}
            </div>

            <p className="text-xs font-mono text-cyan-300">
              {isAudioPlaying
                ? "🔊 Speaking Voiceover Live..."
                : 'Click "Listen to Voiceover" to synthesize audio'}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Voiceover Transcript Copy
            </span>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {audioText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
