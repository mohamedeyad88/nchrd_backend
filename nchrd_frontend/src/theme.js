// src/theme.js
import { createTheme } from "@mui/material/styles";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import createCache from "@emotion/cache";

// export cacheRtl
export const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});
cacheRtl.compat = true;


// ========== DARK THEME ==========
export const darkTheme = createTheme({
  direction: "rtl",
  palette: {
    mode: "dark",
    primary: { main: "#D32F2F" },
    success: { main: "#4CAF50" },
    background: {
      default: "#101010",
      paper: "#1E1E1E",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
  },
  typography: {
    fontFamily: "Cairo, sans-serif",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1E1E1E",
          borderRadius: "14px",
        },
      },
    },
  },
});


// ========== LIGHT THEME ==========
export const lightTheme = createTheme({
  direction: "rtl",
  palette: {
    mode: "light",
    primary: { main: "#D32F2F" },
    success: { main: "#4CAF50" },
    background: {
      default: "#f5f6fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#111827",
      secondary: "#6b7280",
    }
  },
  typography: {
    fontFamily: "Cairo, sans-serif",
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e5e7eb",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#0f172a",
          color: "#ffffff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        },
      },
    },
  },
});
