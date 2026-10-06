import React, { useMemo, useState } from "react";
import { useBoard } from "../../context/BoardContext";
import { ActivityIcon, ChevronDownIcon, ChevronUpIcon } from "../common/Icons";

const WEEKS_TO_SHOW = 12;

const formatDateKey = (date) => date.toISOString().split("T")[0];

const getColorClass = (count) => {
  if (count === 0) return "bg-zinc-800/40";
  if (count === 1) return "bg-emerald-950 border border-emerald-800/40";
  if (count <= 3) return "bg-emerald-700";
  if (count <= 5) return "bg-emerald-500";
  return "bg-emerald-400";
};

const Heatmap = () => {
  const { tasks } = useBoard();
  const [hovered, setHovered] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  // Count completed tasks per day, keyed by YYYY-MM-DD
  const countsByDate = useMemo(() => {
    const map = {};
    tasks
      .filter((t) => t.status === "done" && t.createdAt)
      .forEach((t) => {
        const key = formatDateKey(new Date(t.createdAt));
        map[key] = (map[key] || 0) + 1;
      });
    return map;
  }, [tasks]);

  const totalCompleted = useMemo(() => {
    return tasks.filter((t) => t.status === "done").length;
  }, [tasks]);

  // Build a 12-week x 7-day grid ending on the current week
  const weeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

    const start = new Date(endOfWeek);
    start.setDate(endOfWeek.getDate() - WEEKS_TO_SHOW * 7 + 1);

    const cols = [];
    for (let w = 0; w < WEEKS_TO_SHOW; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(start);
        day.setDate(start.getDate() + w * 7 + d);
        col.push(day);
      }
      cols.push(col);
    }
    return cols;
  }, []);

  const formatTooltip = (date, count) => {
    const label = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${count} task${count === 1 ? "" : "s"} completed on ${label}`;
  };

  return (
    <div className="px-5 py-2.5 bg-[#0e1015] border-b border-zinc-800/80 transition-all select-none">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-2 text-[11px] font-mono-code text-zinc-400 hover:text-zinc-200 transition"
        >
          <ActivityIcon className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-semibold uppercase tracking-wider text-zinc-300">Activity Velocity</span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-400">{totalCompleted} tasks completed</span>
          {collapsed ? <ChevronDownIcon className="w-3 h-3 text-zinc-500" /> : <ChevronUpIcon className="w-3 h-3 text-zinc-500" />}
        </button>

        {hovered ? (
          <span className="text-[11px] font-mono-code text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60">
            {hovered}
          </span>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] font-mono-code text-zinc-500">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-[2px] bg-zinc-800/40" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-950 border border-emerald-800/40" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-700" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400" />
            <span>More</span>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="flex gap-[3px] mt-2.5 overflow-x-auto pb-1">
          {weeks.map((col, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-[3px]">
              {col.map((day, dIdx) => {
                const isFuture = day > new Date();
                const key = formatDateKey(day);
                const count = countsByDate[key] || 0;

                return (
                  <div
                    key={dIdx}
                    onMouseEnter={() =>
                      !isFuture && setHovered(formatTooltip(day, count))
                    }
                    onMouseLeave={() => setHovered(null)}
                    title={isFuture ? undefined : formatTooltip(day, count)}
                    className={`w-2.5 h-2.5 rounded-[2px] transition-colors ${
                      isFuture ? "bg-transparent" : getColorClass(count)
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Heatmap;