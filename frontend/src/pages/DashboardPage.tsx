import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { generationService } from "../services/generationService";
import { DashboardStats } from "../types";
import {
  Sparkles,
  Megaphone,
  Layers,
  Heart,
  TrendingUp,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { Skeleton } from "../components/common/Skeleton";
import { PlatformIcon } from "../components/common/PlatformIcon";
import { Badge } from "../components/common/Badge";

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await generationService.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-sky-600 to-accent-600 p-6 sm:p-8 text-white shadow-xl shadow-brand-500/15">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Marketing Orchestrator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Elevate your multi-channel marketing campaigns.
          </h1>
          <p className="text-slate-100 text-xs sm:text-sm leading-relaxed max-w-xl">
            Input your product vision once. Let our platform-native AI generate
            structured hooks, copy, scripts, and production prompts for 9
            digital channels.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/campaigns/new">
              <Button
                variant="secondary"
                size="md"
                className="bg-white text-brand-900 hover:bg-slate-100 font-bold shadow-md"
                leftIcon={<PlusCircle className="w-4 h-4 text-brand-600" />}
              >
                Create New Campaign
              </Button>
            </Link>
            <Link to="/brand-profile">
              <Button
                variant="outline"
                size="md"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Configure Brand Voice
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Campaigns */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Campaigns
            </p>
            <div className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                (stats?.total_campaigns ?? 0)
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Megaphone className="w-6 h-6" />
          </div>
        </div>

        {/* Total Generations */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              AI Generations
            </p>
            <div className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                (stats?.total_generations ?? 0)
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Favorites */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Saved Favorites
            </p>
            <div className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                (stats?.total_favorites ?? 0)
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        {/* Most Used Platform */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Top Platform
            </p>
            <div className="mt-1.5 text-xl font-black text-slate-900 dark:text-white truncate max-w-[140px]">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                (stats?.most_used_platform ?? "None")
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Campaigns (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Campaigns
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your active marketing initiatives
              </p>
            </div>
            <Link
              to="/campaigns"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : stats?.recent_campaigns && stats.recent_campaigns.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recent_campaigns.map((c) => (
                <div
                  key={c.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/50 p-2.5 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <Link
                      to={`/campaigns/${c.id}`}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      {c.name}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-medium">{c.product_service}</span>
                      <span>•</span>
                      <Badge variant="brand" size="sm">
                        {c.goal}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        {c.tone}
                      </Badge>
                    </div>
                  </div>

                  <Link
                    to={`/campaigns/${c.id}`}
                    className="self-end sm:self-center"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-semibold text-xs"
                    >
                      Open Campaign →
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Megaphone className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No campaigns yet
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create your first campaign to start generating optimized
                marketing content.
              </p>
              <Link to="/campaigns/new">
                <Button variant="primary" size="sm">
                  Create Campaign
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Generations Snippet (1 col) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Outputs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest generated copy & prompts
              </p>
            </div>
            <Link
              to="/generations"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : stats?.recent_generations &&
            stats.recent_generations.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_generations.map((g) => (
                <Link
                  key={g.id}
                  to={`/generations/${g.id}`}
                  className="block p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 bg-slate-50/70 dark:bg-slate-850/60 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <PlatformIcon
                        platform={g.platform}
                        className="w-3.5 h-3.5"
                      />
                      <span className="text-xs font-bold capitalize text-slate-900 dark:text-slate-100">
                        {g.platform}
                      </span>
                    </div>
                    <Badge variant="accent" size="sm">
                      {g.media_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">
                    "{g.hook || "Marketing content variation"}"
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-slate-500">
                No generations generated yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
