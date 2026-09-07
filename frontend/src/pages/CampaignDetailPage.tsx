import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { campaignService } from "../services/campaignService";
import { generationService } from "../services/generationService";
import { Campaign, Generation } from "../types";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Skeleton } from "../components/common/Skeleton";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { Modal } from "../components/common/Modal";
import { LoadingStepProgress } from "../components/common/LoadingStepProgress";
import { Sparkles, ArrowLeft, Check } from "lucide-react";

export const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick generation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "instagram",
    "youtube",
  ]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([
    "text",
    "image",
    "video",
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [cRes, gRes] = await Promise.all([
          campaignService.getById(id),
          generationService.list({ campaign_id: id }),
        ]);
        if (cRes.success) setCampaign(cRes.data);
        if (gRes.success) setGenerations(gRes.data);
      } catch (err) {
        console.error("Failed to load campaign data:", err);
        error("Campaign not found or inaccessible.");
        navigate("/campaigns");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleQuickGenerate = async () => {
    if (!campaign) return;
    if (selectedPlatforms.length === 0) {
      error("Please select at least 1 target channel.");
      return;
    }
    if (selectedMedia.length === 0) {
      error("Please select at least 1 deliverable format.");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await generationService.generate({
        campaign_id: campaign.id,
        platforms: selectedPlatforms,
        media_types: selectedMedia,
      });
      if (res.success && res.data.generations.length > 0) {
        success(
          `Generated ${res.data.total_generated} new channel deliverables!`,
        );
        setIsModalOpen(false);
        // Refresh generations
        const gRes = await generationService.list({ campaign_id: campaign.id });
        if (gRes.success) setGenerations(gRes.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMedia = (m: string) => {
    setSelectedMedia((prev) =>
      prev.includes(m)
        ? prev.length > 1
          ? prev.filter((x) => x !== m)
          : prev
        : [...prev, m],
    );
  };

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p)
        ? prev.length > 1
          ? prev.filter((x) => x !== p)
          : prev
        : [...prev, p],
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!campaign) return null;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Back button */}
      <div>
        <Link
          to="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaigns</span>
        </Link>
      </div>

      {/* Campaign Header Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="brand">{campaign.goal}</Badge>
              <Badge variant="slate">{campaign.tone}</Badge>
              <Badge variant="accent">{campaign.language}</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {campaign.name}
            </h1>
            <p className="text-xs text-slate-500">
              Product / Service:{" "}
              <strong className="text-slate-700 dark:text-slate-300">
                {campaign.product_service}
              </strong>
            </p>
          </div>

          <Button
            variant="gradient"
            size="md"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate New Channels
          </Button>
        </div>

        {/* Campaign Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Campaign Idea & Concept
              </span>
              <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {campaign.idea}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Target Audience & Profile
              </span>
              <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {campaign.target_audience}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {campaign.key_points && (
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Key Selling Points
                </span>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {campaign.key_points}
                </p>
              </div>
            )}

            {campaign.cta && (
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Call To Action
                </span>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {campaign.cta}
                </p>
              </div>
            )}

            {campaign.keywords && (
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Keywords
                </span>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {campaign.keywords}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Content Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Generated Assets ({generations.length})
            </h2>
            <p className="text-xs text-slate-500">
              Channel-optimized marketing outputs produced for this campaign
            </p>
          </div>
        </div>

        {generations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generations.map((g) => (
              <Link
                key={g.id}
                to={`/generations/${g.id}`}
                className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-600 shadow-sm transition-all overflow-hidden"
              >
                {/* Visual Thumbnail */}
                <div className="w-full h-28 bg-slate-800 relative overflow-hidden">
                  <img
                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(
                      g.generated_content.media_prompt ||
                        `${g.platform} ${campaign.name} marketing`,
                    )}?width=400&height=220&nologo=true`}
                    alt="Asset thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                    <PlatformIcon
                      platform={g.platform}
                      className="w-3.5 h-3.5"
                    />
                    <span>{g.platform}</span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <Badge variant="accent" size="sm">
                      {g.media_type}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                    "
                    {g.generated_content.hook ||
                      g.generated_content.title ||
                      g.generated_content.caption ||
                      "Generated Output"}
                    "
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{new Date(g.created_at).toLocaleDateString()}</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400 group-hover:underline">
                      View Asset & Media →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No content generated yet for this campaign
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              Generate Content Now
            </Button>
          </div>
        )}
      </div>

      {/* Quick Generate Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Platform Deliverables"
        description={`Create tailored marketing content for ${campaign.name}`}
      >
        {isGenerating ? (
          <LoadingStepProgress
            platformName={selectedPlatforms.join(", ")}
            isGenerating={isGenerating}
          />
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Select Channels
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  "instagram",
                  "tiktok",
                  "facebook",
                  "youtube",
                  "linkedin",
                  "twitter",
                  "whatsapp",
                  "sms",
                  "email",
                  "blog",
                ].map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-semibold capitalize ${
                      selectedPlatforms.includes(p)
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <PlatformIcon platform={p} className="w-3.5 h-3.5" />
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Select Deliverable Formats
                </label>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {selectedMedia.length} of 4 Included
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "text", label: "Copy & Text" },
                  { id: "image", label: "AI Image" },
                  { id: "video", label: "Video Player" },
                  { id: "audio", label: "Voiceover" },
                ].map((m) => {
                  const isSelected = selectedMedia.includes(m.id);
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => toggleMedia(m.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-850/40 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <PlatformIcon platform={m.id} className="w-3.5 h-3.5" />
                        <span className="truncate">{m.label}</span>
                      </div>
                      {isSelected && (
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="gradient"
                size="md"
                onClick={handleQuickGenerate}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Generate Content
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
