import React from "react";
import { Link } from "react-router-dom";
import { LogoIcon } from "../components/common/Icons";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#090a0e] bg-dev-grid text-center p-6 font-sans">
      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/5">
        <LogoIcon className="w-6 h-6" />
      </div>

      <div className="inline-block px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono-code text-zinc-400 mb-3">
        HTTP 404 · Page Not Found
      </div>

      <h1 className="text-xl font-semibold text-zinc-100 mb-2 tracking-tight">
        Lost in the backlog
      </h1>

      <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
        The requested resource or task route could not be resolved.
      </p>

      <Link
        to="/"
        className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium font-mono-code transition shadow-sm shadow-blue-500/20"
      >
        Return to Dashboard →
      </Link>
    </div>
  );
};

export default NotFound;