import React, { useState, useEffect } from "react";
import { brandService } from "../services/brandService";
import { useToast } from "../context/ToastContext";
import { Input, Textarea, Select } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { Skeleton } from "../components/common/Skeleton";
import { ShieldCheck, Plus, X, Check, Info } from "lucide-react";

export const BrandProfilePage: React.FC = () => {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    brand_name: "",
    description: "",
    industry: "",
    target_audience: "",
    brand_voice: "",
    preferred_tone: "Professional",
    products_services: "",
    brand_values: "",
    default_cta: "",
    preferred_language: "English",
  });

  const [forbiddenWords, setForbiddenWords] = useState<string[]>([]);
  const [newForbiddenWord, setNewForbiddenWord] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await brandService.getProfile();
        if (res.success && res.data) {
          const p = res.data;
          setFormData({
            brand_name: p.brand_name || "",
            description: p.description || "",
            industry: p.industry || "",
            target_audience: p.target_audience || "",
            brand_voice: p.brand_voice || "",
            preferred_tone: p.preferred_tone || "Professional",
            products_services: p.products_services || "",
            brand_values: p.brand_values || "",
            default_cta: p.default_cta || "",
            preferred_language: p.preferred_language || "English",
          });
          setForbiddenWords(p.forbidden_words || []);
        }
      } catch (err) {
        console.error("Failed to load brand profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddForbiddenWord = () => {
    const trimmed = newForbiddenWord.trim();
    if (trimmed && !forbiddenWords.includes(trimmed)) {
      setForbiddenWords((prev) => [...prev, trimmed]);
      setNewForbiddenWord("");
    }
  };

  const handleRemoveForbiddenWord = (word: string) => {
    setForbiddenWords((prev) => prev.filter((w) => w !== word));
  };

  const handleFillBrandExample = () => {
    setFormData({
      brand_name: "Apex Precision Labs",
      description:
        "Ultra-pure bioavailable fitness nutrition engineered for peak human performance.",
      industry: "Health, Wellness & Sports Nutrition",
      target_audience:
        "High-performing executives, endurance runners, and biohackers aged 22-45.",
      brand_voice: "Authoritative, science-backed, premium, and clean.",
      preferred_tone: "Inspirational & Energetic",
      products_services:
        "Organic whey isolate, electrolyte hydration drops, and plant-based adaptogens.",
      brand_values:
        "100% transparency, zero artificial fillers, science-backed dosages.",
      default_cta:
        "Unlock your peak potential — Shop the new formulation today",
      preferred_language: "English",
    });
    setForbiddenWords([
      "miracle cure",
      "lose 30lbs fast",
      "cheap",
      "magic pill",
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand_name) {
      error("Brand Name is required");
      return;
    }

    setIsSaving(true);
    try {
      const res = await brandService.saveProfile({
        ...formData,
        forbidden_words: forbiddenWords,
      });
      if (res.success) {
        success(
          "Brand Identity Profile saved! Context will auto-inject into all future generations.",
        );
      }
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to save brand profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Persistent Context</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Brand Identity Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Define your company voice and compliance rules once. The AI will
            automatically include this context in every generation.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleFillBrandExample}
          className="shrink-0"
        >
          Fill Example Brand
        </Button>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 flex items-start gap-3">
        <Info className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
        <div className="text-xs text-brand-900 dark:text-brand-200 leading-relaxed">
          <strong>How this works:</strong> Whenever you generate content, your
          Brand Profile data and forbidden words list are injected directly into
          the LLM system prompt to ensure consistent brand voice and strict
          regulatory compliance.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Identity */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            1. Core Brand Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Brand Name *"
              name="brand_name"
              placeholder="e.g. Apex Performance"
              value={formData.brand_name}
              onChange={handleChange}
              required
            />
            <Input
              label="Industry / Category"
              name="industry"
              placeholder="e.g. Fitness Nutrition & Supplements"
              value={formData.industry}
              onChange={handleChange}
            />
          </div>

          <Textarea
            label="Brand Description & Mission"
            name="description"
            placeholder="Briefly describe what your brand stands for, your core philosophy, and unique value proposition..."
            value={formData.description}
            onChange={handleChange}
            rows={2}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Flagship Products & Services"
              name="products_services"
              placeholder="e.g. Organic Whey Protein, Hydration Drops"
              value={formData.products_services}
              onChange={handleChange}
            />
            <Input
              label="Brand Values"
              name="brand_values"
              placeholder="e.g. Transparency, Scientific Rigor, Sustainability"
              value={formData.brand_values}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Tone, Voice, CTA */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            2. Voice, Tone & Messaging
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Brand Voice Archetype"
              name="brand_voice"
              placeholder="e.g. Authoritative, Inspiring, High-energy"
              value={formData.brand_voice}
              onChange={handleChange}
            />

            <Select
              label="Default Preferred Tone"
              name="preferred_tone"
              value={formData.preferred_tone}
              onChange={handleChange}
              options={[
                { value: "Professional", label: "Professional & Trustworthy" },
                { value: "Friendly", label: "Friendly & Approachable" },
                { value: "Energetic", label: "Energetic & Inspiring" },
                { value: "Luxury", label: "Luxury & Exclusive" },
                { value: "Casual", label: "Casual & Relaxed" },
                { value: "Humorous", label: "Witty & Humorous" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Default Call To Action"
              name="default_cta"
              placeholder="e.g. Shop now for 20% off your first order"
              value={formData.default_cta}
              onChange={handleChange}
            />

            <Select
              label="Default Target Language"
              name="preferred_language"
              value={formData.preferred_language}
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

        {/* Forbidden Words / Compliance */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            3. Regulatory Compliance & Forbidden Words
          </h2>
          <p className="text-xs text-slate-500">
            Specify forbidden words, illegal claims, or competitors to strictly
            ban from AI generation.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., 'miracle cure', 'free money', competitor name..."
              value={newForbiddenWord}
              onChange={(e) => setNewForbiddenWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddForbiddenWord();
                }
              }}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddForbiddenWord}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Word
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {forbiddenWords.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              >
                <span>🚫 {word}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveForbiddenWord(word)}
                  className="hover:text-rose-900 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {forbiddenWords.length === 0 && (
              <span className="text-xs text-slate-400 italic">
                No forbidden words added.
              </span>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            isLoading={isSaving}
            className="px-8 font-bold shadow-lg shadow-brand-500/20"
            rightIcon={<Check className="w-4 h-4" />}
          >
            Save Brand Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
