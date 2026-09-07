import React from "react";
import {
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  MessageCircle,
  Smartphone,
  Mail,
  BookOpen,
  Share2,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
} from "lucide-react";

interface PlatformIconProps {
  platform: string;
  className?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform,
  className = "w-4 h-4",
}) => {
  const p = platform.toLowerCase();

  switch (p) {
    case "instagram":
      return <Instagram className={`text-pink-500 ${className}`} />;
    case "tiktok":
      return <Video className={`text-cyan-400 ${className}`} />;
    case "facebook":
      return <Facebook className={`text-blue-600 ${className}`} />;
    case "youtube":
      return <Youtube className={`text-red-500 ${className}`} />;
    case "linkedin":
      return <Linkedin className={`text-sky-600 ${className}`} />;
    case "twitter":
    case "x":
      return (
        <Twitter
          className={`text-slate-900 dark:text-slate-100 ${className}`}
        />
      );
    case "whatsapp":
      return <MessageCircle className={`text-emerald-500 ${className}`} />;
    case "sms":
      return <Smartphone className={`text-indigo-500 ${className}`} />;
    case "email":
      return <Mail className={`text-amber-500 ${className}`} />;
    case "blog":
      return <BookOpen className={`text-emerald-600 ${className}`} />;
    // Media types
    case "image":
      return <ImageIcon className={`text-purple-500 ${className}`} />;
    case "video":
      return <Video className={`text-rose-500 ${className}`} />;
    case "audio":
      return <Mic className={`text-cyan-500 ${className}`} />;
    case "text":
      return <FileText className={`text-slate-500 ${className}`} />;
    default:
      return <Share2 className={`text-slate-400 ${className}`} />;
  }
};
