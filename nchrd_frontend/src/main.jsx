// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import { cacheRtl, darkTheme, lightTheme } from "./theme";

// Read preferred mode from localStorage (fallback dark)
const savedMode = localStorage.getItem("appThemeMode") || "dark";
const initialTheme = savedMode === "light" ? lightTheme : darkTheme;

function Root() {
  const [mode, setMode] = React.useState(savedMode);

  React.useEffect(() => {
    localStorage.setItem("appThemeMode", mode);
  }, [mode]);

  const themeObj = mode === "light" ? lightTheme : darkTheme;

  // Provide a small API on window so Layout can toggle without prop drilling
  React.useEffect(() => {
    window.__APP_THEME_TOGGLE__ = (newMode) => setMode(newMode);
    return () => {
      window.__APP_THEME_TOGGLE__ = undefined;
    };
  }, []);

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={themeObj}>
        <App />
      </ThemeProvider>
    </CacheProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
