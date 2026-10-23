"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import IntelligenceHeader from "@/components/smart/smartHeader";
import IntelligenceSummary from "@/components/smart/smartSummary";
import PriorityQueue from "@/components/smart/priorityQueue";
import DependencyMap from "@/components/smart/dependencyMap";
import WorkloadChart from "@/components/smart/workloadChart";
import SmartSchedule from "@/components/smart/smartSchedule";
import IntelligenceReasoning from "@/components/smart/smartReasoning";

import type {
  SmartTask,
} from "@/components/smart/smartTaskCard";

import type {
  DependencyNode,
} from "@/components/smart/dependencyMap";

import type {
  WorkloadDay,
} from "@/components/smart/workloadChart";

type ScheduleBlock = {
  date: string;
  label: string;
  tasks: SmartTask[];
};

type ReasoningItem = {
  type:
    | "PRIORITY"
    | "SCHEDULE"
    | "DEPENDENCY"
    | "WORKLOAD"
    | "GOAL"
    | "PROJECT";

  title: string;
  explanation: string;
  impact?: "LOW" | "MEDIUM" | "HIGH";
};

type IntelligenceData = {
  summary: {
    totalTasks: number;
    overdueTasks: number;
    urgentTasks: number;
    blockedTasks: number;
    todayTasks: number;
    workloadScore: number;
    completionRate: number;
  };

  priorityQueue: SmartTask[];

  dependencies: DependencyNode[];

  workload: WorkloadDay[];

  schedule: ScheduleBlock[];

  reasoning: ReasoningItem[];
};

const EMPTY_DATA: IntelligenceData = {
  summary: {
    totalTasks: 0,
    overdueTasks: 0,
    urgentTasks: 0,
    blockedTasks: 0,
    todayTasks: 0,
    workloadScore: 0,
    completionRate: 0,
  },

  priorityQueue: [],

  dependencies: [],

  workload: [],

  schedule: [],

  reasoning: [],
};

export default function IntelligencePage() {
  const [data, setData] =
    useState<IntelligenceData>(
      EMPTY_DATA
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const fetchIntelligence =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        /*
         * This endpoint should call:
         *
         * smartTaskEngine
         *      ↓
         * priorityEngine
         * schedulingEngine
         * dependencyEngine
         * workloadEngine
         *
         * against Tasks + Goals + Projects.
         */

        const response =
          await fetch(
            "/api/smart",
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to analyse workspace."
          );
        }

        setData({
          ...EMPTY_DATA,
          ...result.data,

          summary: {
            ...EMPTY_DATA.summary,
            ...(result.data?.summary || {}),
          },

          priorityQueue:
            result.data?.priorityQueue ||
            [],

          dependencies:
            result.data?.dependencies ||
            [],

          workload:
            result.data?.workload ||
            [],

          schedule:
            result.data?.schedule ||
            [],

          reasoning:
            result.data?.reasoning ||
            [],
        });
      } catch (err) {
        console.error(
          "Intelligence fetch error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to analyse workspace."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">

        <IntelligenceHeader
          onRefresh={fetchIntelligence}
          loading={loading}
        />

        {error && (
          <div className="mb-6 rounded-xl border border-red-300 p-4 text-sm">
            {error}
          </div>
        )}

        <IntelligenceSummary
          totalTasks={
            data.summary.totalTasks
          }
          overdueTasks={
            data.summary.overdueTasks
          }
          urgentTasks={
            data.summary.urgentTasks
          }
          blockedTasks={
            data.summary.blockedTasks
          }
          todayTasks={
            data.summary.todayTasks
          }
          workloadScore={
            data.summary.workloadScore
          }
          completionRate={
            data.summary.completionRate
          }
        />

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">

          <PriorityQueue
            tasks={data.priorityQueue}
            loading={loading}
          />

          <DependencyMap
            dependencies={
              data.dependencies
            }
          />

        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">

          <WorkloadChart
            days={data.workload}
          />

          <SmartSchedule
            schedule={data.schedule}
          />

        </div>

        <div className="mt-6">
          <IntelligenceReasoning
            reasoning={
              data.reasoning
            }
          />
        </div>

      </div>
    </main>
  );
}