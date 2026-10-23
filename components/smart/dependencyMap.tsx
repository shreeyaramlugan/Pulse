"use client";

export type DependencyNode = {
  id: string;
  title: string;
  status: string;

  blockedBy?: string[];
  blocking?: string[];

  blocked?: boolean;
};

type DependencyMapProps = {
  dependencies: DependencyNode[];
};

export default function DependencyMap({
  dependencies,
}: DependencyMapProps) {
  const blocked = dependencies.filter(
    (item) => item.blocked
  );

  return (
    <section className="rounded-2xl border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Dependency Map
        </h2>

        <p className="mt-1 text-sm opacity-60">
          Tasks that are waiting on other work.
        </p>
      </div>

      {dependencies.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">
            No dependencies detected
          </p>

          <p className="mt-1 text-sm opacity-60">
            Your current tasks do not appear to be blocked.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {dependencies.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs opacity-50">
                    {item.status.replace("_", " ")}
                  </p>
                </div>

                {item.blocked && (
                  <span className="rounded-full border px-2.5 py-1 text-xs">
                    Blocked
                  </span>
                )}
              </div>

              {item.blockedBy &&
                item.blockedBy.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs opacity-50">
                      Blocked by
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.blockedBy.map(
                        (dependency, index) => (
                          <span
                            key={index}
                            className="rounded-lg border px-2 py-1 text-xs"
                          >
                            {dependency}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              {item.blocking &&
                item.blocking.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs opacity-50">
                      Blocking
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.blocking.map(
                        (dependency, index) => (
                          <span
                            key={index}
                            className="rounded-lg border px-2 py-1 text-xs"
                          >
                            {dependency}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      {blocked.length > 0 && (
        <div className="mt-5 rounded-xl border border-dashed p-4">
          <p className="text-sm font-medium">
            Intelligence detected {blocked.length} blocked{" "}
            {blocked.length === 1
              ? "task"
              : "tasks"}.
          </p>

          <p className="mt-1 text-xs opacity-60">
            Complete prerequisite work before scheduling
            these tasks.
          </p>
        </div>
      )}
    </section>
  );
}