import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { generationService } from "../services/generationService";
import { Generation, GeneratedContent } from "../types";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Skeleton } from "../components/common/Skeleton";
import { CopyButton } from "../components/common/CopyButton";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { Modal } from "../components/common/Modal";
import { LoadingStepProgress } from "../components/common/LoadingStepProgress";
import { Textarea } from "../components/common/Input";
import { MediaStudio } from "../components/media/MediaStudio";
import {
  ArrowLeft,
  Sparkles,
  Heart,
  RotateCcw,
  Edit3,
  Check,
  FileText,
  Image as ImageIcon,
  Layers,
  Clock,
  Coins,
  Cpu,
} from "lucide-react";

export const GenerationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [generation, setGeneration] = useState<Generation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "content" | "media" | "variations"
  >("content");

  // In-place edit state
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdits, setIsSavingEdits] = useState(false);
  const [editedContent, setEditedContent] = useState<GeneratedContent>({});

  // Regenerate Modal state
  const [isRegenModalOpen, setIsRegenModalOpen] = useState(false);
  const [modificationInstruction, setModificationInstruction] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchGen = async () => {
      setIsLoading(true);
      try {
        const res = await generationService.getById(id);
        if (res.success) {
          setGeneration(res.data);
          setEditedContent(res.data.generated_content);
        }
      } catch (err) {
        console.error("Failed to load generation:", err);
        error("Generation not found");
        navigate("/generations");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGen();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!generation) return;
    try {
      const res = await generationService.toggleFavorite(generation.id);
      if (res.success) {
        setGeneration((prev) =>
          prev ? { ...prev, is_favorite: res.data.is_favorite } : null,
        );
        success(
          res.data.is_favorite
            ? "Added to favorites"
            : "Removed from favorites",
        );
      }
    } catch (err) {
      error("Failed to update favorite status");
    }
  };

  const handleRegenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generation) return;
    setIsRegenerating(true);
    try {
      const res = await generationService.regenerate(generation.id, {
        modification_instruction: modificationInstruction.trim() || undefined,
      });
      if (res.success) {
        setGeneration(res.data);
        setEditedContent(res.data.generated_content);
        setIsRegenModalOpen(false);
        setModificationInstruction("");
        success("Content regenerated successfully!");
      }
    } catch (err: any) {
      error(err.response?.data?.message || "Regeneration failed");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!generation) return;
    setIsSavingEdits(true);
    try {
      const res = await generationService.update(generation.id, {
        generated_content: editedContent,
      });
      if (res.success) {
        setGeneration(res.data);
        setEditedContent(res.data.generated_content);
        setIsEditing(false);
        success("Edits saved successfully!");
      }
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to save edits to server");
    } finally {
      setIsSavingEdits(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!generation) return null;

  const content = isEditing ? editedContent : generation.generated_content;

  // Build full raw copy string for quick global copy
  const fullTextToCopy = [
    content.title ? `Title: ${content.title}\n` : "",
    content.hook ? `Hook:\n${content.hook}\n` : "",
    content.caption ? `Caption:\n${content.caption}\n` : "",
    content.body && content.body !== content.caption
      ? `Body:\n${content.body}\n`
      : "",
    content.cta ? `CTA: ${content.cta}\n` : "",
    content.hashtags && content.hashtags.length > 0
      ? `Hashtags:\n${content.hashtags.join(" ")}\n`
      : "",
    content.media_prompt ? `Visual Prompt:\n${content.media_prompt}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={
            generation.campaign_id
              ? `/campaigns/${generation.campaign_id}`
              : "/generations"
          }
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {generation.campaign_name || "Campaign"}</span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`p-2 rounded-xl border transition-all ${
              generation.is_favorite
                ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500"
            }`}
            title="Favorite"
          >
            <Heart
              className={`w-4 h-4 ${generation.is_favorite ? "fill-rose-500 text-rose-500" : ""}`}
            />
          </button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsRegenModalOpen(true)}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Regenerate
          </Button>

          {isEditing ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSavingEdits}
              onClick={handleSaveEdits}
              leftIcon={<Check className="w-3.5 h-3.5" />}
            >
              Done Editing
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit Copy
            </Button>
          )}

          <CopyButton textToCopy={fullTextToCopy} label="Copy All" size="sm" />
        </div>
      </div>

      {/* Main Generation Banner Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <PlatformIcon
                platform={generation.platform}
                className="w-6 h-6"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold capitalize text-slate-900 dark:text-white">
                  {generation.platform} Marketing Copy
                </h1>
                <Badge variant="brand" size="sm">
                  {generation.media_type}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Campaign:{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  {generation.campaign_name || "Marketing Campaign"}
                </strong>
              </p>
            </div>
          </div>

          {/* Generation Telemetry */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-brand-500" />
              <span>{generation.model || "Gemini 1.5 Flash"}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{generation.generation_time_ms || 0}ms</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-500" />
              <span>${generation.estimated_cost?.toFixed(5) || "0.00010"}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Scrollable on Mobile) */}
        <div className="flex items-center gap-2 pt-1 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap pb-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "content"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Content & Copywriting</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "media"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>AI Media Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("variations")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "variations"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Variations ({content.variations?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Content & Copywriting */}
      {activeTab === "content" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Center Content Fields (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title / Headline if present */}
            {content.title && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Headline / Title
                  </span>
                  <CopyButton textToCopy={content.title} size="sm" />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={content.title}
                    onChange={(e) =>
                      setEditedContent({
                        ...editedContent,
                        title: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-2.5 text-sm font-bold text-slate-900 dark:text-white"
                  />
                ) : (
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {content.title}
                  </h2>
                )}
              </div>
            )}

            {/* Hook */}
            {content.hook && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Scroll-Stopping Hook (First 3-5 Seconds)</span>
                  </div>
                  <CopyButton textToCopy={content.hook} size="sm" />
                </div>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={content.hook}
                    onChange={(e) =>
                      setEditedContent({
                        ...editedContent,
                        hook: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-2.5 text-sm font-semibold text-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    "{content.hook}"
                  </p>
                )}
              </div>
            )}

            {/* Main Caption / Body */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Primary Post Caption & Narrative Body
                </span>
                <CopyButton
                  textToCopy={content.caption || content.body || ""}
                  size="sm"
                />
              </div>

              {isEditing ? (
                <textarea
                  rows={8}
                  value={content.caption || content.body || ""}
                  onChange={(e) =>
                    setEditedContent({
                      ...editedContent,
                      caption: e.target.value,
                      body: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-3 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line"
                />
              ) : (
                <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-850/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {content.caption || content.body}
                </div>
              )}
            </div>

            {/* Twitter Thread if present */}
            {content.twitter_thread && content.twitter_thread.length > 0 && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    X / Twitter Numbered Thread ({content.twitter_thread.length}{" "}
                    Tweets)
                  </span>
                  <CopyButton
                    textToCopy={content.twitter_thread.join("\n\n")}
                    label="Copy Thread"
                    size="sm"
                  />
                </div>
                <div className="space-y-3">
                  {content.twitter_thread.map((tweet, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 relative"
                    >
                      <span className="font-bold text-brand-600 block mb-1">
                        Tweet {idx + 1}
                      </span>
                      <p className="whitespace-pre-line">{tweet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email Details if present */}
            {content.email_details && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Email Campaign Breakdown
                  </span>
                  <CopyButton
                    textToCopy={`Subject: ${content.email_details.subject_line}\nPreview: ${content.email_details.preview_text}\n\n${content.email_details.body_html_or_text}`}
                    label="Copy Email"
                    size="sm"
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-500">Subject: </span>
                    <strong className="text-slate-900 dark:text-white">
                      {content.email_details.subject_line}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-500">
                      Preview Text:{" "}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {content.email_details.preview_text}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 whitespace-pre-line text-slate-800 dark:text-slate-200">
                    {content.email_details.body_html_or_text}
                  </div>
                </div>
              </div>
            )}

            {/* Blog Details if present */}
            {content.blog_details && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    SEO Blog Article Outline & Body
                  </span>
                  <CopyButton
                    textToCopy={`# ${content.blog_details.seo_title}\nMeta: ${content.blog_details.meta_description}\n\n${content.blog_details.introduction}\n\n${content.blog_details.sections?.map((s) => `## ${s.heading}\n${s.content}`).join("\n\n")}\n\n${content.blog_details.conclusion}`}
                    label="Copy Article"
                    size="sm"
                  />
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                      {content.blog_details.seo_title}
                    </p>
                    <p className="text-slate-500 italic">
                      Meta Description: {content.blog_details.meta_description}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-3 text-slate-800 dark:text-slate-200">
                    <p>{content.blog_details.introduction}</p>
                    {content.blog_details.sections?.map((sec, i) => (
                      <div key={i} className="space-y-1 pt-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                          {sec.heading}
                        </h4>
                        <p>{sec.content}</p>
                      </div>
                    ))}
                    {content.blog_details.conclusion && (
                      <p className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        {content.blog_details.conclusion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SMS Message if present */}
            {content.sms_message && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    SMS Message Copy ({content.sms_message.length}/160 chars)
                  </span>
                  <CopyButton textToCopy={content.sms_message} size="sm" />
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200">
                  {content.sms_message}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: CTA, Hashtags, Emojis, Preview Mockup (1 col) */}
          <div className="space-y-6">
            {/* CTA Box */}
            {content.cta && (
              <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-sky-50 dark:from-brand-950/40 dark:to-sky-950/40 p-5 border border-brand-200 dark:border-brand-900/50 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                    Call To Action
                  </span>
                  <CopyButton textToCopy={content.cta} size="sm" />
                </div>
                <p className="text-sm font-extrabold text-brand-900 dark:text-brand-100">
                  👉 {content.cta}
                </p>
              </div>
            )}

            {/* Hashtags */}
            {content.hashtags && content.hashtags.length > 0 && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Targeted Hashtags ({content.hashtags.length})
                  </span>
                  <CopyButton
                    textToCopy={content.hashtags
                      .map((h) => (h.startsWith("#") ? h : `#${h}`))
                      .join(" ")}
                    size="sm"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {content.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {tag.startsWith("#") ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Emojis */}
            {content.emojis && content.emojis.length > 0 && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Recommended Emojis
                </span>
                <div className="flex items-center gap-2 text-xl">
                  {content.emojis.map((e, idx) => (
                    <span key={idx}>{e}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Preview Simulated Mockup */}
            <div className="rounded-2xl bg-slate-900 text-white p-4 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <PlatformIcon
                    platform={generation.platform}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-bold capitalize text-slate-200">
                    Live {generation.platform} Preview
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center font-bold text-[10px]">
                    OM
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block">
                      Your Brand
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Sponsored • 1m ago
                    </span>
                  </div>
                </div>

                <p className="text-slate-200 text-xs line-clamp-4 leading-relaxed">
                  {content.hook || content.caption}
                </p>

                <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 relative group">
                  <img
                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(
                      content.media_prompt ||
                        `${generation.platform} ${generation.campaign_name || "marketing"} visual`,
                    )}?width=600&height=400&nologo=true`}
                    alt="Platform visual"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[10px] font-bold text-white line-clamp-1 drop-shadow-md">
                      {content.hook || content.title || "AI Generated Visual"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Media Studio (Self-Generated Images, Video Player, Audio) */}
      {activeTab === "media" && (
        <MediaStudio
          mediaPrompt={content.media_prompt}
          imageDetails={content.image_prompt_details}
          videoScript={content.video_script}
          audioScript={content.audio_script}
          platform={generation.platform}
          campaignName={generation.campaign_name}
          hookText={content.hook || content.title}
          ctaText={content.cta}
        />
      )}

      {/* Tab 3: Variations & Angles */}
      {activeTab === "variations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Alternative Angles, Hooks & History
            </h3>
            <span className="text-xs text-slate-400">
              Pick alternative angles to A/B test
            </span>
          </div>

          <div className="space-y-3">
            {content.variations && content.variations.length > 0 ? (
              content.variations.map((v, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase text-brand-600">
                      Angle Variation {idx + 1}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      "{v}"
                    </p>
                  </div>
                  <CopyButton textToCopy={v} size="sm" />
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                No alternative variations generated.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Regeneration Modal */}
      <Modal
        isOpen={isRegenModalOpen}
        onClose={() => setIsRegenModalOpen(false)}
        title="Regenerate & Refine Content"
        description="Provide custom feedback or direction to hone the output."
      >
        {isRegenerating ? (
          <LoadingStepProgress
            platformName={generation.platform}
            isGenerating={isRegenerating}
          />
        ) : (
          <form onSubmit={handleRegenerate} className="space-y-4">
            <Textarea
              label="Modification Instructions"
              placeholder="e.g., 'Make it punchier', 'Focus more on the zero sugar benefit', 'Use a more urgent hook', 'Add a humor angle'..."
              value={modificationInstruction}
              onChange={(e) => setModificationInstruction(e.target.value)}
              rows={3}
              helperText="Our AI will preserve the campaign context while applying your exact adjustment."
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsRegenModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                size="md"
                isLoading={isRegenerating}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Apply & Regenerate
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
