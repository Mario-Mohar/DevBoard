import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const DEFAULT_ACCENT = "#7F77DD";

const savedAccent =
  localStorage.getItem("accent_color") || DEFAULT_ACCENT;

document.documentElement.style.setProperty("--accent", savedAccent);
document.documentElement.style.setProperty(
  "--accent-10",
  `${savedAccent}1A`,
);
document.documentElement.style.setProperty(
  "--accent-15",
  `${savedAccent}26`,
);
document.documentElement.style.setProperty(
  "--accent-20",
  `${savedAccent}33`,
);
document.documentElement.style.setProperty(
  "--accent-30",
  `${savedAccent}4D`,
);
document.documentElement.style.setProperty(
  "--accent-40",
  `${savedAccent}66`,
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);