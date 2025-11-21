// --- Start Fixed Version (Sidebar on LEFT instead of RIGHT) ---

import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Button,
  Tooltip,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SchoolIcon from "@mui/icons-material/School";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const drawerWidth = 260;
const collapsedWidth = 72;

const menuItems = [
  { text: "لوحة التحكم", icon: <DashboardIcon />, path: "/" },
  { text: "إدارة الوحدات", icon: <BusinessIcon />, path: "/companies" },
  { text: "مديري الوحدات", icon: <PeopleIcon />, path: "/managers" },
  { text: "إدارة المستخدمين", icon: <PeopleIcon />, path: "/users" },
  { text: "تسعيد الطلاب", icon: <SchoolIcon />, path: "/students" },
  { text: "التقارير والإعدادات", icon: <AssignmentIcon />, path: "/reports" },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [themeMode, setThemeMode] = useState(
    localStorage.getItem("appThemeMode") || "dark"
  );

  useEffect(() => {
    document.body.dir = "rtl";
  }, []);

  useEffect(() => {
    localStorage.setItem("appThemeMode", themeMode);
    if (window.__APP_THEME_TOGGLE__) window.__APP_THEME_TOGGLE__(themeMode);
  }, [themeMode]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleCollapse = () => setCollapsed((s) => !s);
  const effectiveCollapsed = collapsed && !hovered;

  const drawerContent = (
    <div style={{ direction: "rtl" }}>
      <Toolbar
        sx={{
          justifyContent: effectiveCollapsed ? "center" : "flex-start",
          px: 2,
        }}
      >
        {!effectiveCollapsed ? (
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#fff" }}>
            المركز الوطني
          </Typography>
        ) : (
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#fff", fontSize: 16 }}
          >
            م
          </Typography>
        )}
      </Toolbar>

      <Box sx={{ px: 2, mb: 1 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{
            justifyContent: effectiveCollapsed ? "center" : "flex-start",
            py: 1.4,
            fontWeight: "bold",
          }}
          startIcon={<DashboardIcon />}
        >
          {!effectiveCollapsed && "لوحة التحكم"}
        </Button>
      </Box>

      <Typography
        variant="caption"
        sx={{
          px: effectiveCollapsed ? 1 : 3,
          color: "gray",
          display: "block",
          mb: 1,
        }}
      >
        {!effectiveCollapsed && "الإدارة المركزية"}
      </Typography>

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={effectiveCollapsed ? item.text : ""} placement="right">
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  color: "text.secondary",
                  display: "flex",
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  px: effectiveCollapsed ? 1 : 1.5,
                }}
              >
                <Box
                  sx={{
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </Box>

                <ListItemText
                  primary={item.text}
                  sx={{
                    textAlign: "left",
                    ml: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: effectiveCollapsed ? "none" : "block",
                  }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }} dir="rtl">
      
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: {
            sm: `calc(100% - ${
              effectiveCollapsed ? collapsedWidth : drawerWidth
            }px)`,
          },
          ml: {
            sm: `${effectiveCollapsed ? collapsedWidth : drawerWidth}px`,
          },
          mr: 0,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              المركز الوطني للتعليم والتدريب المزدوج
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button variant="contained" color="primary">
              إضافة طالب
            </Button>

            <IconButton
              onClick={() =>
                setThemeMode((m) => (m === "light" ? "dark" : "light"))
              }
              color="inherit"
            >
              {themeMode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>

            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>

            <Button
              variant="contained"
              color="primary"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              تسجيل الخروج
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar (LEFT now) */}
      <Box
        component="nav"
        sx={{
          width: effectiveCollapsed ? collapsedWidth : drawerWidth,
          flexShrink: 0,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: effectiveCollapsed ? collapsedWidth : drawerWidth,
              transition: "width 300ms",
              overflowX: "hidden",
            },
          }}
          open
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: effectiveCollapsed ? "center" : "flex-start",
              p: 1,
            }}
          >
            <IconButton onClick={toggleCollapse}>
              <MenuIcon />
            </IconButton>
          </Box>

          <Box sx={{ height: "calc(100% - 48px)", overflow: "auto" }}>
            {drawerContent}
          </Box>
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            sm: `calc(100% - ${
              effectiveCollapsed ? collapsedWidth : drawerWidth
            }px)`,
          },
          ml: {
            sm: `${effectiveCollapsed ? collapsedWidth : drawerWidth}px`,
          },
          mr: 0,
          transition: "margin-left 300ms",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

// --- End Fixed Version ---
