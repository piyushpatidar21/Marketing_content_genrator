import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { campaignService } from "../services/campaignService";
import { generationService } from "../services/generationService";
import { PlatformRule } from "../types";
import { useToast } from "../context/ToastContext";
import { Input, Textarea, Select } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { LoadingStepProgress } from "../components/common/LoadingStepProgress";
import {
  Sparkles,
  Megaphone,
  Users,
  Target,
  Layers,
  Sliders,
  Check,
} from "lucide-react";

export const CampaignNewPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [platforms, setPlatforms] = useState<PlatformRule[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    product_service: "",
    idea: "",
    target_audience: "",
    age_group: "",
    location: "",
    interests: "",
    pain_points: "",
    goal: "brand awareness",
    tone: "energetic",
    language: "English",
    key_points: "",
    cta: "",
    keywords: "",
    hashtag_preference: "",
    additional_instructions: "",
  });

  // Selected Channels & Deliverables
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "instagram",
    "linkedin",
  ]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([
    "text",
    "image",
    "video",
  ]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const pRes = await generationService.getPlatforms();
        if (pRes.success) setPlatforms(pRes.data);
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    };
    fetchMetadata();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((p) => p !== id)
          : prev
        : [...prev, id],
    );
  };

  const toggleMedia = (id: string) => {
    setSelectedMedia((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((m) => m !== id)
          : prev
        : [...prev, id],
    );
  };

  const handleFillExample = () => {
    setFormData({
      name: "Choco Crunch Protein Launch",
      product_service: "Choco Crunch Whey Protein Bar",
      idea: "A zero-sugar, 25g protein snack that genuinely tastes like a gourmet candy bar.",
      target_audience:
        "Fitness enthusiasts, busy professionals, and gym goers aged 20-35.",
      age_group: "20-35 years old",
      location: "United States & Canada",
      interests:
        "Crossfit, meal prep, healthy snacking, weight training, productivity.",
      pain_points:
        "Dry chalky protein bars that ruin appetite; high sugar disguised as healthy.",
      goal: "lead generation",
      tone: "energetic",
      language: "English",
      key_points:
        "25g Protein, 1g Sugar, 100% Real Belgian Dark Chocolate, Gluten-Free.",
      cta: "Order your sample box today and get free shipping.",
      keywords:
        "protein bar, clean eating, guilt-free snack, fitness nutrition",
      hashtag_preference: "#CleanEats #FitnessSnacks #ProteinGoals",
      additional_instructions:
        "Highlight the chocolate taste comparison and crunch texture.",
    });
    setSelectedPlatforms([
      "instagram",
      "youtube",
      "tiktok",
      "twitter",
      "linkedin",
    ]);
    setSelectedMedia(["text", "image", "video", "audio"]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.idea.trim()) {
      error("Campaign Name and Core Idea are required.");
      return;
    }
    if (selectedPlatforms.length === 0) {
      error("Please select at least 1 target platform.");
      return;
    }
    if (selectedMedia.length === 0) {
      error("Please select at least 1 deliverable format.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the campaign
      const campRes = await campaignService.create(formData);
      if (!campRes.success || !campRes.data) {
        throw new Error("Failed to create campaign record");
      }

      const campaignId = campRes.data.id;

      // 2. Trigger AI multi-platform generation (1 complete deliverable per platform containing selected components)
      const genRes = await generationService.generate({
        campaign_id: campaignId,
        platforms: selectedPlatforms,
        media_types: selectedMedia,
        custom_instructions: formData.additional_instructions,
      });

      if (genRes.success && genRes.data.generations.length > 0) {
        success(
          `Successfully generated ${genRes.data.total_generated} tailored variations!`,
        );
        // Navigate to the first generated result detail or campaign view
        const firstGenId = genRes.data.generations[0].id;
        navigate(`/generations/${firstGenId}`);
      } else {
        navigate(`/campaigns/${campaignId}`);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Generation failed. Please try again.";
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campaign Creation Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Create Campaign & Generate Copy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Describe your product once — our engine formats and optimizes for
            each chosen channel.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleFillExample}
          className="shrink-0"
        >
          Fill Example Campaign
        </Button>
      </div>

      {/* Multi-step loading modal if submitting */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4">
          <LoadingStepProgress
            platformName={selectedPlatforms.join(", ")}
            isGenerating={isSubmitting}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Campaign Info */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                1. Campaign Core Information
              </h2>
              <p className="text-xs text-slate-500">What are you promoting?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Campaign Name *"
              name="name"
              placeholder="e.g. Q3 Summer Product Launch"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Product or Service Name *"
              name="product_service"
              placeholder="e.g. HydraPro Supplement"
              value={formData.product_service}
              onChange={handleChange}
              required
            />
          </div>

          <Textarea
            label="Campaign Idea / Core Concept *"
            name="idea"
            placeholder="Describe what makes this campaign or offer special. What is the central message or angle you want to communicate?"
            value={formData.idea}
            onChange={handleChange}
            rows={3}
            required
            helperText="The more detail you provide, the sharper and more tailored the AI output will be."
          />
        </div>

        {/* Section 2: Target Audience */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                2. Target Audience & Demographics
              </h2>
              <p className="text-xs text-slate-500">Who are you speaking to?</p>
            </div>
          </div>

          <Textarea
            label="Target Audience Profile *"
            name="target_audience"
            placeholder="e.g. Busy agency founders & social media marketers looking to scale client content without hiring 5 copywriters."
            value={formData.target_audience}
            onChange={handleChange}
            rows={2}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Age Demographic"
              name="age_group"
              placeholder="e.g. 24–40 years old"
              value={formData.age_group}
              onChange={handleChange}
            />
            <Input
              label="Geographic Location"
              name="location"
              placeholder="e.g. USA, UK, Global remote"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Audience Interests"
              name="interests"
              placeholder="e.g. SaaS, growth marketing, fitness, productivity"
              value={formData.interests}
              onChange={handleChange}
            />
            <Input
              label="Customer Pain Points"
              name="pain_points"
              placeholder="e.g. High ad costs, lack of copywriting time, generic output"
              value={formData.pain_points}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section 3: Goal, Tone, Language */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-accent-50 dark:bg-accent-950/60 text-accent-600 dark:text-accent-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                3. Strategy, Tone & Language
              </h2>
              <p className="text-xs text-slate-500">
                Fine-tune the objective and voice
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Marketing Goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              options={[
                { value: "brand awareness", label: "Brand Awareness" },
                { value: "product promotion", label: "Product Promotion" },
                { value: "lead generation", label: "Lead Generation" },
                { value: "engagement", label: "Community Engagement" },
                { value: "sales", label: "Direct Sales & Conversions" },
                { value: "education", label: "Educational / Authority" },
                {
                  value: "announcement",
                  label: "Feature / Launch Announcement",
                },
              ]}
            />

            <Select
              label="Tone of Voice"
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              options={[
                {
                  value: "professional",
                  label: "Professional & Authoritative",
                },
                { value: "friendly", label: "Friendly & Conversational" },
                { value: "funny", label: "Humorous & Witty" },
                { value: "inspirational", label: "Inspirational & Motivating" },
                { value: "energetic", label: "Energetic & Hype" },
                { value: "emotional", label: "Emotional & Story-driven" },
                { value: "luxury", label: "Luxury & Exclusive" },
                { value: "casual", label: "Casual & Relatable" },
                { value: "educational", label: "Educational & Analytical" },
              ]}
            />

            <Select
              label="Output Language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              options={[
                { value: "English", label: "English" },
                { value: "Spanish", label: "Spanish" },
                { value: "French", label: "French" },
                { value: "German", label: "German" },
                { value: "Portuguese", label: "Portuguese" },
                { value: "Italian", label: "Italian" },
                { value: "Hindi", label: "Hindi" },
                { value: "Japanese", label: "Japanese" },
              ]}
            />
          </div>
        </div>

        {/* Section 4: Target Platforms (Multi-Select) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  4. Select Target Channels
                </h2>
                <p className="text-xs text-slate-500">
                  Content will be independently tailored to each platform's
                  algorithms
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
              {selectedPlatforms.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
            {(platforms.length > 0
              ? platforms
              : [
                  {
                    id: "instagram",
                    name: "Instagram",
                    description: "Visual & Stories",
                  },
                  {
                    id: "tiktok",
                    name: "TikTok",
                    description: "Short-form viral video",
                  },
                  {
                    id: "facebook",
                    name: "Facebook",
                    description: "Community posts",
                  },
                  {
                    id: "youtube",
                    name: "YouTube",
                    description: "Scripts & Titles",
                  },
                  {
                    id: "linkedin",
                    name: "LinkedIn",
                    description: "B2B & Thought Leadership",
                  },
                  {
                    id: "twitter",
                    name: "X / Twitter",
                    description: "Punchy threads",
                  },
                  {
                    id: "whatsapp",
                    name: "WhatsApp",
                    description: "Direct messages",
                  },
                  { id: "sms", name: "SMS", description: "Under 160 chars" },
                  {
                    id: "email",
                    name: "Email Newsletter",
                    description: "Subject & Body",
                  },
                  {
                    id: "blog",
                    name: "Blog / SEO Article",
                    description: "H2/H3 longform",
                  },
                ]
            ).map((p: any) => {
              const isSelected = selectedPlatforms.includes(p.id);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 ring-2 ring-brand-500/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <PlatformIcon platform={p.id} className="w-4 h-4" />
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {p.name}
                  </span>
                  <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {p.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Select Deliverable Formats */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  5. Deliverable Formats & Media
                </h2>
                <p className="text-xs text-slate-500">
                  Select the components you want included in each channel's
                  deliverable
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setSelectedMedia(["text", "image", "video", "audio"])
                }
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <Badge variant="emerald" size="sm">
                {selectedMedia.length} of 4 Selected
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: "text",
                name: "Copywriting & Text",
                desc: "Tailored hooks, captions, body & hashtags",
              },
              {
                id: "image",
                name: "AI Image Generator",
                desc: "Self-generated HD visuals & download",
              },
              {
                id: "video",
                name: "Interactive Video Player",
                desc: "Storyboard scenes & animated reels",
              },
              {
                id: "audio",
                name: "Audio Voiceover Studio",
                desc: "Live speech synthesis & waveforms",
              },
            ].map((m) => {
              const isSelected = selectedMedia.includes(m.id);
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => toggleMedia(m.id)}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 hover:border-slate-300 dark:hover:border-slate-700 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <PlatformIcon
                      platform={m.id}
                      className={`w-4 h-4 ${
                        isSelected
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400"
                      }`}
                    />
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isSelected
                          ? "bg-emerald-500 text-white"
                          : "border border-slate-300 dark:border-slate-700 text-transparent"
                      }`}
                    >
                      {isSelected ? <Check className="w-2.5 h-2.5" /> : ""}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isSelected
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {m.name}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {m.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 6: Optional Extras & CTAs */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            6. Key Selling Points & Custom CTA (Optional)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Key Selling Points"
              name="key_points"
              placeholder="e.g. 100% natural, Money-back guarantee, 24h delivery"
              value={formData.key_points}
              onChange={handleChange}
            />
            <Input
              label="Desired Call To Action (CTA)"
              name="cta"
              placeholder="e.g. Click the link in bio to get 20% off"
              value={formData.cta}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Focus Keywords"
              name="keywords"
              placeholder="e.g. productivity, AI tools, social growth"
              value={formData.keywords}
              onChange={handleChange}
            />
            <Input
              label="Hashtag Preferences"
              name="hashtag_preference"
              placeholder="e.g. #marketing #saas #startups"
              value={formData.hashtag_preference}
              onChange={handleChange}
            />
          </div>

          <Textarea
            label="Additional Custom Instructions"
            name="additional_instructions"
            placeholder="Any specific phrases to include, angles to avoid, or unique formatting rules..."
            value={formData.additional_instructions}
            onChange={handleChange}
            rows={2}
          />
        </div>

        {/* Submit Action Bar */}
        <div className="sticky bottom-6 z-20 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Generating{" "}
            <strong className="text-slate-900 dark:text-white">
              {selectedPlatforms.length}
            </strong>{" "}
            comprehensive all-in-one deliverables (1 per channel).
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate("/campaigns")}
              className="w-1/2 sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              isLoading={isSubmitting}
              className="w-1/2 sm:w-auto font-bold px-8 shadow-xl shadow-brand-500/25"
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              Generate Content
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
