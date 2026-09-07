import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { campaignService } from "../services/campaignService";
import { Campaign } from "../types";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Badge } from "../components/common/Badge";
import { Skeleton } from "../components/common/Skeleton";
import {
  Megaphone,
  PlusCircle,
  Search,
  Calendar,
  Trash2,
  ChevronRight,
} from "lucide-react";

export const CampaignsListPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const fetchCampaigns = async (searchTerm?: string) => {
    setIsLoading(true);
    try {
      const res = await campaignService.list({ search: searchTerm });
      if (res.success) {
        setCampaigns(res.data.items);
      }
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCampaigns(search);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this campaign and all its generated content?",
      )
    ) {
      return;
    }
    try {
      await campaignService.delete(id);
      success("Campaign deleted successfully");
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      error("Failed to delete campaign");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Marketing Campaigns
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your campaigns, track generated assets, and spin up new
            platform content.
          </p>
        </div>

        <Link to="/campaigns/new">
          <Button
            variant="gradient"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search campaigns by name, product, or idea..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button type="submit" variant="secondary" size="md">
          Search
        </Button>
      </form>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="brand" size="sm">
                    {c.goal}
                  </Badge>
                  <button
                    onClick={(e) => handleDelete(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all"
                    title="Delete campaign"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Product: {c.product_service}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {c.idea}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>

                <Link
                  to={`/campaigns/${c.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center mx-auto text-brand-600 dark:text-brand-400">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No campaigns found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search
                ? `No campaigns match "${search}". Try searching with different keywords.`
                : "Get started by creating your first multi-platform marketing campaign."}
            </p>
          </div>
          <Link to="/campaigns/new">
            <Button variant="gradient" size="md">
              Create First Campaign
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
