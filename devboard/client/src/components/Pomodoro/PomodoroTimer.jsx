import React, { useEffect, useState } from "react";
import { usePomodoro } from "../../hooks/usePomodoro";
import { TimerIcon, PlayIcon, PauseIcon, ResetIcon } from "../common/Icons";

const playAmbient = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  const ctx = new AudioContextClass();
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.25;
  masterGain.connect(ctx.destination);

  // Layer A: Deep Warm Rain Rumble (Brownian/Brown noise)
  const rainBufferSize = 3 * ctx.sampleRate;
  const rainBuffer = ctx.createBuffer(1, rainBufferSize, ctx.sampleRate);
  const rainData = rainBuffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < rainBufferSize; i++) {
    const white = Math.random() * 2 - 1;
    rainData[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = rainData[i];
    rainData[i] *= 3.5; // Gain compensation for brown noise
  }

  const rainSource = ctx.createBufferSource();
  rainSource.buffer = rainBuffer;
  rainSource.loop = true;

  const rainFilter = ctx.createBiquadFilter();
  rainFilter.type = "lowpass";
  rainFilter.frequency.value = 450;

  rainSource.connect(rainFilter);
  rainFilter.connect(masterGain);

  // Layer B: Organic Raindrop Impacts (Sparse impact buffer)
  const dropBufferSize = 2 * ctx.sampleRate;
  const dropBuffer = ctx.createBuffer(1, dropBufferSize, ctx.sampleRate);
  const dropData = dropBuffer.getChannelData(0);
  for (let i = 0; i < dropBufferSize; i++) {
    dropData[i] = Math.random() > 0.998 ? Math.random() * 2 - 1 : 0;
  }

  const dropSource = ctx.createBufferSource();
  dropSource.buffer = dropBuffer;
  dropSource.loop = true;

  const dropFilter = ctx.createBiquadFilter();
  dropFilter.type = "bandpass";
  dropFilter.frequency.value = 1800;
  dropFilter.Q.value = 3.0;

  dropSource.connect(dropFilter);
  dropFilter.connect(masterGain);

  rainSource.start();
  dropSource.start();

  return { rainSource, dropSource, ctx };
};

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

  const [ambient, setAmbient] = useState(null);

  const toggleAmbient = () => {
    if (ambient) {
      try {
        if (ambient.rainSource) ambient.rainSource.stop();
      } catch {
        // Ignore if already stopped
      }
      try {
        if (ambient.dropSource) ambient.dropSource.stop();
      } catch {
        // Ignore if already stopped
      }
      try {
        if (ambient.ctx && ambient.ctx.state !== "closed") {
          ambient.ctx.close().catch(() => {});
        }
      } catch {
        // Ignore if already closed
      }
      setAmbient(null);
    } else {
      const sound = playAmbient();
      if (sound) {
        setAmbient(sound);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (ambient) {
        try {
          if (ambient.rainSource) ambient.rainSource.stop();
        } catch {
          // Ignore if already stopped
        }
        try {
          if (ambient.dropSource) ambient.dropSource.stop();
        } catch {
          // Ignore if already stopped
        }
        try {
          if (ambient.ctx && ambient.ctx.state !== "closed") {
            ambient.ctx.close().catch(() => {});
          }
        } catch {
          // Ignore if already closed
        }
      }
    };
  }, [ambient]);

  useEffect(() => {
    if (isRunning) {
      document.title = `${format(timeLeft)} — ${activeTaskTitle || "Pomodoro"} 🍅`;
    } else {
      document.title = "DevBoard 🗂️";
    }
  }, [isRunning, timeLeft, activeTaskTitle, format]);

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
          onClick={toggleAmbient}
          type="button"
          title={ambient ? "Turn off ambient rain" : "Turn on lofi ambient rain"}
          className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition border ${
            ambient
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
              : "bg-zinc-800/80 text-zinc-400 border-zinc-700/60 hover:text-zinc-200 hover:bg-zinc-800"
          }`}
        >
          {ambient ? "🎵 on" : "🎵 off"}
        </button>

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
