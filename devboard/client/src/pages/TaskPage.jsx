import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBoard } from "../context/BoardContext";
import TaskModal from "../components/Task/TaskModal";
import { SearchIcon } from "../components/common/Icons";

const TaskPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allTasks, loading, updateTask, viewTask } = useBoard();
  const [loadingTask, setLoadingTask] = useState(true);

  useEffect(() => {
    viewTask(id)
      .catch((err) => console.error("Failed to record task view:", err))
      .finally(() => setLoadingTask(false));
  }, [id]);

  if (loading || loadingTask) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#090a0e] text-zinc-500 font-mono-code text-xs">
        Resolving task #{id}...
      </div>
    );
  }

  const task = allTasks.find((t) => t._id === id);

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#090a0e] text-center p-8 font-sans">
        <div className="w-10 h-10 rounded-lg bg-zinc-800/80 text-zinc-400 flex items-center justify-center mb-4">
          <SearchIcon className="w-5 h-5" />
        </div>

        <h2 className="text-base font-semibold text-zinc-100 mb-1">
          Task not found
        </h2>

        <p className="text-xs text-zinc-400 mb-6 font-mono-code">
          Task ID "{id}" does not exist or has been removed.
        </p>

        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-mono-code font-medium transition shadow-sm shadow-blue-500/20"
        >
          Return to Board
        </button>
      </div>
    );
  }

  return (
    <TaskModal
      mode="edit"
      task={task}
      onClose={() => navigate("/")}
      onSave={async (data) => {
        await updateTask(task._id, data);
        navigate("/");
      }}
      updateTask={updateTask}
    />
  );
};

export default TaskPage;
