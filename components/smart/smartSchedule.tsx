"use client";

import { SmartTask } from "./smartTaskCard";

type ScheduleBlock = {
  date: string;
  label: string;
  tasks: SmartTask[];
};

type SmartScheduleProps = {
  schedule: ScheduleBlock[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "en-ZA",
    {
      weekday: "long",
      day: "2-digit",
      month: "short",
    }
  );
}

export default function SmartSchedule({
  schedule,
}: SmartScheduleProps) {
  return (
    <section className="rounded-2xl border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Smart Schedule
        </h2>

        <p className="mt-1 text-sm opacity-60">
          Suggested placement of work based on deadlines,
          workload and priority.
        </p>
      </div>

      {schedule.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">
            No schedule generated
          </p>

          <p className="mt-1 text-sm opacity-60">
            There are currently no tasks to schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {schedule.map((day) => (
            <div key={day.date}>
              <div className="mb-3">
                <p className="font-semibold">
                  {formatDate(day.date)}
                </p>

                {day.label && (
                  <p className="text-xs opacity-50">
                    {day.label}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                {day.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 rounded-xl border p-4"
                  >
                    <div className="h-2 w-2 rounded-full bg-current" />

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {task.title}
                      </p>

                      {task.projectName && (
                        <p className="mt-1 text-xs opacity-50">
                          {task.projectName}
                        </p>
                      )}
                    </div>

                    <span className="text-xs opacity-50">
                      {task.recommendedTime ||
                        "Flexible"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}