"use client";

export type WorkloadDay = {
  date: string;
  label: string;
  minutes: number;
  capacity: number;
};

type WorkloadChartProps = {
  days: WorkloadDay[];
};

export default function WorkloadChart({
  days,
}: WorkloadChartProps) {
  const maxValue = Math.max(
    ...days.map((day) =>
      Math.max(day.minutes, day.capacity)
    ),
    60
  );

  return (
    <section className="rounded-2xl border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Workload
        </h2>

        <p className="mt-1 text-sm opacity-60">
          Planned workload compared with available capacity.
        </p>
      </div>

      {days.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          No workload data available.
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const workloadWidth =
              Math.min(
                (day.minutes / maxValue) * 100,
                100
              );

            const capacityWidth =
              Math.min(
                (day.capacity / maxValue) * 100,
                100
              );

            const overloaded =
              day.minutes > day.capacity;

            return (
              <div key={day.date}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">
                    {day.label}
                  </span>

                  <span className="opacity-60">
                    {day.minutes}m / {day.capacity}m
                  </span>
                </div>

                <div className="relative h-3 overflow-hidden rounded-full border">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full opacity-30"
                    style={{
                      width: `${capacityWidth}%`,
                    }}
                  />

                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${
                      overloaded
                        ? "bg-red-500"
                        : "bg-current"
                    }`}
                    style={{
                      width: `${workloadWidth}%`,
                    }}
                  />
                </div>

                {overloaded && (
                  <p className="mt-1 text-xs text-red-500">
                    Over capacity
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}