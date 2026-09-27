import React, { useState, useEffect } from "react";
import KanbanBoard from "../components/Board/KanbanBoard";
import PomodoroTimer from "../components/Pomodoro/PomodoroTimer";
import TaskModal from "../components/Task/TaskModal";
import Heatmap from "../components/Heatmap/Heatmap";
import { useBoard } from "../context/BoardContext";
import { useGithubStars } from "../hooks/useGithubStars";
import {
  LogoIcon,
  SearchIcon,
  PlusIcon,
  GithubIcon,
  StarIcon,
  TargetIcon,
  DownloadIcon,
  PrinterIcon,
  TrashIcon,
  KeyboardIcon,
  LogoutIcon,
  FullscreenIcon,
  ChevronUpIcon,
  XIcon,
} from "../components/common/Icons";
import { openVisit, touchVisit, timeAgo } from "../utils/lastVisit";

const formatStars = (n) => {
  if (n === null || n === undefined) return null;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
};

const CSV_HEADERS = ["Title", "Status", "Priority", "Tags", "Created"];

const escapeCsvValue = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${guarded.replace(/"/g, '""')}"`;
};

const toCsv = (rows) =>
  rows.map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");

const formatCsvDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const THEMES = {
  blue:   { name: "Blue",   accent: "#3b82f6", bg: "#090a0e" },
  indigo: { name: "Indigo", accent: "#6366f1", bg: "#090a10" },
  purple: { name: "Purple", accent: "#8b5cf6", bg: "#0a0912" },
  emerald:{ name: "Emerald",accent: "#10b981", bg: "#070e0b" },
  amber:  { name: "Amber",  accent: "#f59e0b", bg: "#0f0d07" },
  rose:   { name: "Rose",   accent: "#f43f5e", bg: "#10080b" },
  cyan:   { name: "Cyan",   accent: "#06b6d4", bg: "#060e12" },
};

const Dashboard = () => {
  const {
    user,
    logout,
    logoutAll,
    updateTask,
    deleteTask,
    loading,
    searchQuery,
    setSearchQuery,
    tasks,
    addTask,
    viewTask,
    activeTag,
    setActiveTag,
  } = useBoard();
  const { stars, loading: starsLoading } = useGithubStars();

  const handleSelectTask = async (task) => {
    setSelectedTask(task);
    try {
      const viewedTask = await viewTask(task._id);
      if (viewedTask) setSelectedTask(viewedTask);
    } catch (err) {
      console.error("Failed to record task view:", err);
    }
  };

  useEffect(() => {
    document.title = "DevBoard — Developer Kanban";
  }, []);

  // Read once, before anything moves the stamps, so this holds the session
  // before this one rather than the one that just started.
  const [lastVisit] = useState(() => openVisit());

  // Keep the board marked as seen while it is open, otherwise a long session
  // would count as a gap the moment you reload at the end of it.
  useEffect(() => {
    const id = setInterval(touchVisit, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const [focusMode, setFocusMode] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreatingFirstTask, setIsCreatingFirstTask] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [theme, setTheme] = useState(
    () => JSON.parse(localStorage.getItem("board_theme")) || "blue"
  );

  const activeTheme = THEMES[theme] || THEMES.blue;

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", activeTheme.accent);
    document.documentElement.style.setProperty("--accent-10", `${activeTheme.accent}1A`);
    document.documentElement.style.setProperty("--accent-20", `${activeTheme.accent}33`);
    document.documentElement.style.setProperty("--bg", activeTheme.bg);
    localStorage.setItem("board_theme", JSON.stringify(theme));
  }, [theme, activeTheme]);

  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("search_history") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handler = (e) => {
      if (e.target.matches("input, textarea")) return;
      if (e.key === "n" || e.key === "N") {
        setIsCreatingFirstTask(true);
      }
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        setShowHelp((v) => !v);
      }
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        document.getElementById("board-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const handleScroll = (event) => {
      let scrollTop = 0;
      if (event.target === document || event.target === window) {
        scrollTop = window.scrollY;
      } else if (event.target) {
        scrollTop = event.target.scrollTop;
      }
      setShowTop(scrollTop > 200);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn("Fullscreen toggle failed:", error);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Sign out of DevBoard?")) {
      logout();
    }
  };

  const handleClearDone = async () => {
    if (window.confirm("Archive all completed tasks?")) {
      const doneTasks = tasks.filter((t) => t.status === "done");
      await Promise.all(doneTasks.map((t) => deleteTask(t._id)));
    }
  };

  const handleSessionComplete = async () => {
    if (selectedTask) {
      await updateTask(selectedTask._id, {
        pomodoroCount: (selectedTask.pomodoroCount || 0) + 1,
      });
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const trimmed = query.trim();
    if (!trimmed) return;
    const updated = [
      trimmed,
      ...searchHistory.filter((h) => h.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  const handleExportCSV = () => {
    const rows = tasks.map((t) => [
      t.title,
      t.status,
      t.priority,
      t.tags?.join("; ") || "",
      formatCsvDate(t.createdAt),
    ]);
    const csv = `\uFEFF${toCsv([CSV_HEADERS, ...rows])}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `devboard-tasks-${formatCsvDate(Date.now())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const myTasks = tasks.filter((t) => t.assignee?._id === user?._id);
  const completionRate =
    myTasks.length > 0
      ? Math.round(
          (myTasks.filter((t) => t.status === "done").length / myTasks.length) * 100
        )
      : 0;

  if (loading) {
    return (
      <div className="flex gap-4 p-6 min-h-screen bg-[#090a0e]">
        {[1, 2, 3, 4].map((col) => (
          <div key={col} className="flex flex-col w-72 gap-3">
            <div className="h-9 bg-zinc-900 rounded-lg animate-pulse" />
            {[1, 2, 3].map((card) => (
              <div key={card} className="animate-pulse bg-zinc-900/60 border border-zinc-800 rounded-lg h-28 w-full" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#090a0e] text-zinc-100 font-sans overflow-hidden">
      {/* Top Navbar */}
      <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 py-2.5 bg-[#0b0c11] border-b border-zinc-800/80 gap-3 shrink-0 z-20">
        {/* Left: Brand & Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <LogoIcon className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-100">DevBoard</span>
            <span className="text-[10px] font-mono-code text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.2 rounded">v1.2</span>
          </div>

          <div className="h-4 w-[1px] bg-zinc-800" />

          <span className="text-xs font-mono-code text-zinc-400">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>
          {lastVisit && (
            <span
              title={`You last opened this board on ${new Date(lastVisit).toLocaleString()}`}
              className="text-xs font-mono-code text-zinc-500 no-print"
            >
              last visit {timeAgo(lastVisit)}
            </span>
          )}

          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              className="text-[11px] font-mono-code bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md flex items-center gap-1.5 hover:bg-blue-500/25 transition"
            >
              <span>#{activeTag}</span>
              <XIcon className="w-3 h-3 text-blue-400" />
            </button>
          )}
        </div>

        {/* Center: Search & Filter */}
        <div className="flex-1 max-w-xl mx-auto w-full no-print">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <SearchIcon className="w-3.5 h-3.5" />
            </div>
            <input
              id="board-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(searchQuery);
              }}
              onBlur={() => handleSearch(searchQuery)}
              placeholder="Search tasks, code, or tags..."
              className="w-full bg-[#111218] border border-zinc-800/90 rounded-lg pl-9 pr-14 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition font-mono-code"
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
              <kbd className="text-[10px] font-mono-code text-zinc-500 bg-zinc-900 border border-zinc-800 px-1 rounded">
                /
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Actions, GitHub, User Profile */}
        <div className="flex items-center gap-2 shrink-0 no-print">
          {/* GitHub Stars */}
          <a
            href="https://github.com/anoopcodehack/DevBoard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono-code text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-850 px-2.5 py-1.5 rounded-lg border border-zinc-800 transition"
            title="Star DevBoard on GitHub"
          >
            <GithubIcon className="w-3.5 h-3.5 text-zinc-400" />
            <StarIcon className="w-3 h-3 text-amber-400" />
            {!starsLoading && stars !== null ? (
              <span>{formatStars(stars)}</span>
            ) : (
              <span>Star</span>
            )}
          </a>

          {/* Quick New Task Button */}
          <button
            type="button"
            onClick={() => setIsCreatingFirstTask(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm shadow-blue-500/20 transition font-mono-code"
            title="Create new task (N)"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>

          {/* Focus Mode */}
          <button
            type="button"
            onClick={() => setFocusMode((v) => !v)}
            title={focusMode ? "Disable focus mode" : "Focus mode (hide completed)"}
            className={`p-1.5 rounded-lg border text-xs transition ${
              focusMode
                ? "bg-blue-500/10 border-blue-500 text-blue-400"
                : "border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <TargetIcon className="w-3.5 h-3.5" />
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            title="Export tasks as CSV"
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition"
          >
            <DownloadIcon className="w-3.5 h-3.5" />
          </button>

          {/* Clear Done */}
          <button
            type="button"
            onClick={handleClearDone}
            title="Archive completed tasks"
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>

          {/* Shortcuts Help */}
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            title="Keyboard shortcuts (?)"
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition"
          >
            <KeyboardIcon className="w-3.5 h-3.5" />
          </button>

          {/* Theme Palette Dots */}
          <div className="hidden lg:flex items-center gap-1 pl-1 border-l border-zinc-800">
            {Object.entries(THEMES).map(([name, t]) => (
              <button
                key={name}
                type="button"
                onClick={() => setTheme(name)}
                style={{ backgroundColor: t.accent }}
                title={`${t.name} theme`}
                className={`w-3 h-3 rounded-full transition-transform ${
                  theme === name ? "ring-2 ring-white scale-110" : "opacity-60 hover:opacity-100"
                }`}
              />
            ))}
          </div>

          <div className="h-4 w-[1px] bg-zinc-800 hidden md:block" />

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-2">
            <div
              title={`${user?.name || "User"} (${completionRate}% completed)`}
              className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono-code border border-zinc-800 cursor-help"
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition"
            >
              <LogoutIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Heatmap Section */}
      <div className="no-print">
        <Heatmap />
      </div>

      {/* Pomodoro Timer Bar */}
      <div className="no-print">
        <PomodoroTimer
          activeTaskTitle={selectedTask?.title}
          onSessionComplete={handleSessionComplete}
        />
      </div>

      {/* Main Kanban Workspace */}
      <main className="flex-1 overflow-hidden relative">
        <KanbanBoard onSelectTask={setSelectedTask} focusMode={focusMode} />
      </main>

      {/* Edit Modal */}
      {selectedTask && (
        <TaskModal
          mode="edit"
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={async (data) => {
            await updateTask(selectedTask._id, data);
            setSelectedTask(null);
          }}
          updateTask={updateTask}
        />
      )}

      {/* Create Modal */}
      {isCreatingFirstTask && (
        <TaskModal
          mode="create"
          defaultStatus="backlog"
          onClose={() => setIsCreatingFirstTask(false)}
          onSave={async (data) => {
            await addTask(data);
            setIsCreatingFirstTask(false);
          }}
        />
      )}

      {/* Scroll to Top */}
      {showTop && (
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            const scrollContainers = document.querySelectorAll(
              ".overflow-y-auto, .overflow-y-scroll, .board"
            );
            scrollContainers.forEach((container) => {
              container.scrollTo({ top: 0, behavior: "smooth" });
            });
          }}
          className="no-print fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white rounded-lg p-2.5 shadow-xl transition z-50 border border-blue-400/30 shadow-blue-500/20"
          aria-label="Scroll to top"
        >
          <ChevronUpIcon className="w-4 h-4" />
        </button>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHelp(false);
          }}
        >
          <div className="bg-[#121319] border border-zinc-800 rounded-xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <KeyboardIcon className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-zinc-100 text-xs uppercase tracking-wider font-mono-code">
                  Keyboard Shortcuts
                </h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3 text-xs font-mono-code">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Create new task</span>
                <kbd className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-zinc-200">N</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Search tasks</span>
                <kbd className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-zinc-200">/</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Close modal</span>
                <kbd className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-zinc-200">ESC</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Toggle shortcuts help</span>
                <kbd className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-zinc-200">?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
