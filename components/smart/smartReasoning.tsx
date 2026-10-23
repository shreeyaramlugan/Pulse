"use client";

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

type IntelligenceReasoningProps = {
  reasoning: ReasoningItem[];
};

export default function IntelligenceReasoning({
  reasoning,
}: IntelligenceReasoningProps) {
  return (
    <section className="rounded-2xl border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Intelligence Reasoning
        </h2>

        <p className="mt-1 text-sm opacity-60">
          Why Pulse made these recommendations.
        </p>
      </div>

      {reasoning.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">
            No reasoning available
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reasoning.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide opacity-50">
                    {item.type}
                  </p>

                  <h3 className="mt-1 font-medium">
                    {item.title}
                  </h3>
                </div>

                {item.impact && (
                  <span className="rounded-full border px-2.5 py-1 text-xs">
                    {item.impact}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm opacity-60">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}