import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { generationService } from "../services/generationService";
import { Generation } from "../types";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Skeleton } from "../components/common/Skeleton";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { CopyButton } from "../components/common/CopyButton";
import { History, Heart, Sparkles, Trash2, ExternalLink } from "lucide-react";

export const GenerationsListPage: React.FC = () => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedMedia, setSelectedMedia] = useState<string>("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { success, error } = useToast();

  const fetchGenerations = async () => {
    setIsLoading(true);
    try {
      const res = await generationService.list({
        platform: selectedPlatform || undefined,
        media_type: selectedMedia || undefined,
        favorite_only: favoritesOnly,
      });
      if (res.success) {
        setGenerations(res.data);
      }
    } catch (err) {
      console.error("Failed to load generation history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, [selectedPlatform, selectedMedia, favoritesOnly]);

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await generationService.toggleFavorite(id);
      if (res.success) {
        setGenerations((prev) =>
          prev.map((g) =>
            g.id === id ? { ...g, is_favorite: res.data.is_favorite } : g,
          ),
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this generated copy?")) return;
    try {
      await generationService.delete(id);
      success("Generation removed");
      setGenerations((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      error("Failed to delete generation");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Generation History & Library
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, copy, filter, and regenerate all platform marketing
            deliverables.
          </p>
        </div>

        <Link to="/campaigns/new">
          <Button
            variant="gradient"
            size="md"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate New Content
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Channels</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="facebook">Facebook</option>
            <option value="youtube">YouTube</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">X / Twitter</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
            <option value="blog">Blog</option>
          </select>

          {/* Media Filter */}
          <select
            value={selectedMedia}
            onChange={(e) => setSelectedMedia(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Media Types</option>
            <option value="text">Text & Copy</option>
            <option value="image">Image Prompt</option>
            <option value="video">Video Script</option>
            <option value="audio">Audio Voiceover</option>
          </select>

          {/* Favorites Only Toggle */}
          <button
            type="button"
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              favoritesOnly
                ? "bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300"
                : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${favoritesOnly ? "fill-rose-500 text-rose-500" : ""}`}
            />
            <span>Favorites</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing {generations.length} item(s)
        </span>
      </div>

      {/* Generations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : generations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generations.map((g) => {
            const rawContent =
              g.generated_content.hook ||
              g.generated_content.caption ||
              g.generated_content.sms_message ||
              g.generated_content.media_prompt ||
              "";

            return (
              <div
                key={g.id}
                className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-400 dark:hover:border-brand-600 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={g.platform} className="w-4 h-4" />
                      <span className="text-xs font-bold capitalize text-slate-800 dark:text-slate-200">
                        {g.platform}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant="accent" size="sm">
                        {g.media_type}
                      </Badge>
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(g.id, e)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="Toggle favorite"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            g.is_favorite ? "fill-rose-500 text-rose-500" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {g.campaign_name && (
                    <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 block truncate">
                      {g.campaign_name}
                    </span>
                  )}

                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-4 leading-relaxed bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 font-mono text-[11px]">
                    {rawContent || "No text preview"}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <CopyButton textToCopy={rawContent} size="sm" />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(g.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      to={`/generations/${g.id}`}
                      className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No generations found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {favoritesOnly || selectedPlatform || selectedMedia
                ? "No items match your active filters. Try resetting the filters."
                : "Start generating high-converting copy from your campaigns."}
            </p>
          </div>
          <Link to="/campaigns/new">
            <Button variant="gradient" size="md">
              Generate Content
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
