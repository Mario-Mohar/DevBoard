import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useBoard } from "../context/BoardContext";

const Analytics = () => {
  const { allTasks = [] } = useBoard();

  const completedTasks = useMemo(
    () =>
        allTasks.filter(
            (task) => task.status === "done" || task.status === "completed"
        ),
    [allTasks]
  );

  const weeklyData = useMemo(() => {
    const weeks = {};

    completedTasks.forEach((task) => {
      if (!task.updatedAt) return;

      const date = new Date(task.updatedAt);
      if (Number.isNaN(date.getTime())) return;

      const weekStart = new Date(date);
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      const key = weekStart.toISOString().slice(0, 10);

      weeks[key] = (weeks[key] || 0) + 1;
    });

    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, count]) => ({
        week,
        count,
        label: new Date(`${week}T00:00:00`).toLocaleDateString(
          "en-IN",
          { day: "numeric", month: "short" }
        ),
      }));
  }, [allTasks]);

  const priorityData = useMemo(() => {
    return ["high", "medium", "low"].map((priority) => {
      const tasks = completedTasks.filter(
        (task) => task.priority?.toLowerCase() === priority
      );

      const durations = tasks
        .filter((task) => task.createdAt && task.updatedAt)
        .map((task) => {
          const created = new Date(task.createdAt).getTime();
          const updated = new Date(task.updatedAt).getTime();
          return updated - created;
        })
        .filter((duration) => Number.isFinite(duration) && duration >= 0);

      const average =
        durations.length > 0
          ? durations.reduce((sum, duration) => sum + duration, 0) /
            durations.length
          : null;

      return { priority, average, count: durations.length };
    });
  }, [allTasks]);

  const maxWeeklyCount = Math.max(
    1,
    ...weeklyData.map((week) => week.count)
  );

  const formatDuration = (milliseconds) => {
    const hours = milliseconds / (1000 * 60 * 60);

    if (hours < 24) return `${hours.toFixed(1)} hours`;

    return `${(hours / 24).toFixed(1)} days`;
  };

  return (
    <div className="min-h-screen bg-[#0e1015] text-zinc-100 p-5 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-zinc-500 mb-1">DevBoard / Insights</p>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-sm text-zinc-400 mt-2">
              Track your productivity and task completion trends.
            </p>
          </div>

          <Link
            to="/"
            className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800 transition"
          >
            Back to Board
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h2 className="text-lg font-semibold">Weekly Productivity</h2>
            <p className="text-sm text-zinc-400 mt-1 mb-6">
              Completed tasks per week
            </p>

            {weeklyData.length === 0 ? (
              <p className="text-sm text-zinc-500 py-8 text-center">
                No completed tasks to show yet.
              </p>
            ) : (
              <div className="space-y-4">
                {weeklyData.map(({ week, count, label }) => (
                  <div key={week}>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Week of {label}</span>
                      <span>{count} {count === 1 ? "task" : "tasks"}</span>
                    </div>
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{
                          width: `${(count / maxWeeklyCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h2 className="text-lg font-semibold">
              Average Completion Time
            </h2>
            <p className="text-sm text-zinc-400 mt-1 mb-6">
              Time from task creation to last update, by priority
            </p>

            <div className="space-y-5">
              {priorityData.map(({ priority, average, count }) => (
                <div
                  key={priority}
                  className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-4 last:border-0"
                >
                  <div>
                    <p className="capitalize font-medium">{priority}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {count} completed {count === 1 ? "task" : "tasks"}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-blue-300">
                    {average === null
                      ? "No data"
                      : formatDuration(average)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="text-lg font-semibold">Summary</h2>
          <p className="text-sm text-zinc-400 mt-2">
            You have completed{" "}
            <span className="text-zinc-100 font-semibold">
              {completedTasks.length}
            </span>{" "}
            {completedTasks.length === 1 ? "task" : "tasks"} in total.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Analytics;
