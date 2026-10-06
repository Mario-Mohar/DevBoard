import React from "react";
import { usePomodoro } from "../../hooks/usePomodoro";
import { TimerIcon, PlayIcon, PauseIcon, ResetIcon } from "../common/Icons";

const PomodoroTimer = ({ activeTaskTitle, onSessionComplete }) => {
  const {
    timeLeft,
    isRunning,
    isBreak,
    sessionCount,
    toggle,
    reset,
    format,
    progress,
  } = usePomodoro(onSessionComplete);

  return (
    <div className="flex items-center justify-between gap-4 bg-[#101217] px-4 py-2 border-b border-zinc-800/80 text-xs select-none">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className={`p-1 rounded-md ${isBreak ? "bg-emerald-500/10 text-emerald-400" : isRunning ? "bg-blue-500/10 text-blue-400 animate-pulse" : "bg-zinc-800 text-zinc-400"}`}>
          <TimerIcon className="w-3.5 h-3.5" />
        </div>

        <span className="font-mono-code font-semibold tracking-wider text-sm text-zinc-100">
          {format(timeLeft)}
        </span>

        <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code uppercase tracking-wider font-medium ${
          isBreak
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
            : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
        }`}>
          {isBreak ? "Break" : `Session #${sessionCount + 1}`}
        </span>

        {activeTaskTitle ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-zinc-400 text-[11px] truncate max-w-[240px]">
            <span className="text-zinc-600">for</span>
            <span className="text-zinc-300 truncate font-medium">"{activeTaskTitle}"</span>
          </span>
        ) : (
          <span className="hidden sm:inline text-zinc-600 text-[11px]">
            No task attached
          </span>
        )}
      </div>

      {/* Progress Track */}
      <div className="flex-1 max-w-md h-1.5 bg-zinc-800/80 rounded-full overflow-hidden hidden md:block">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isBreak ? "bg-emerald-400" : "bg-blue-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={toggle}
          type="button"
          className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
            isRunning
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20"
          }`}
        >
          {isRunning ? (
            <>
              <PauseIcon className="w-3 h-3" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-3 h-3" />
              <span>Focus</span>
            </>
          )}
        </button>

        <button
          onClick={reset}
          type="button"
          title="Reset Pomodoro timer"
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
        >
          <ResetIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;