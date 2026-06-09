import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CssBaseline, Box, Toolbar, IconButton } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import PageDetail from './pages/PageDetail';
import History from './pages/History';
import Redirects from './pages/Redirects';
import Logs404 from './pages/Logs404';
import HowToUse from './pages/HowToUse';
import Comparison from './pages/Comparison';

const drawerWidth = 260;

function Layout() {
  const location = useLocation();
  const navigate = window.location.search.includes('page=') ? React.useMemo(() => {
    // We only want to handle initial WP submenu redirects if we're at the root of the hash router
    return true;
  }, []) : false;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page === 'frank-seo-how-to-use' && location.pathname !== '/how-to-use') {
      window.location.hash = '#/how-to-use';
    } else if (page === 'frank-seo-comparison' && location.pathname !== '/comparison') {
      window.location.hash = '#/comparison';
    } else if (page === 'frank-seo-audit' && location.pathname === '/') {
       // already at root, do nothing
    }
  }, []);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('frank-seo-theme');
    if (saved) return saved;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('frank-seo-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Audit History', icon: <HistoryIcon />, path: '/history' },
    { text: 'Redirects', icon: <SwapCallsIcon />, path: '/redirects' },
    { text: '404 Monitor', icon: <ReportProblemIcon />, path: '/404-monitor' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'How To Use', icon: <HelpOutlineIcon />, path: '/how-to-use' },
    { text: 'Comparison', icon: <CompareArrowsIcon />, path: '/comparison' }
  ];

  const muiTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
        },
      }),
    [theme],
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <Box sx={{ display: 'flex' }} className="seo-dashboard-wrapper">
        <CssBaseline />
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100vh',
            background: 'var(--glass-bg)',
            borderRight: '1px solid var(--border)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
          <Typography variant="h5" sx={{ fontFamily: 'var(--sans)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-h)' }}>
            📊 FrankSEO
          </Typography>
        </Toolbar>
        <List sx={{ px: 1.5, py: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  component={Link} 
                  to={item.path}
                  className={isActive ? 'drawer-active-item' : ''}
                  sx={{
                    borderRadius: '10px',
                    transition: 'all 0.2s ease',
                    color: 'var(--text)',
                    fontFamily: 'var(--sans)',
                    py: 1.2,
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.04)',
                      color: 'var(--text-h)',
                      transform: 'translateX(3px)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontFamily: 'var(--sans)', 
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.95rem'
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          bgcolor: 'transparent', 
          p: 4,
          minHeight: '100vh'
        }}
      >
        {/* Static Header - flows naturally without WP admin bar conflicts */}
        <Box 
          sx={{ 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h6" noWrap component="div" sx={{ fontFamily: 'var(--sans)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-h)' }}>
            Frank <span className="gradient-text">SEO Checker & Audit</span> v1.0.5
          </Typography>
          <IconButton 
            onClick={toggleTheme} 
            sx={{ 
              color: 'var(--text)',
              bgcolor: 'var(--glass-bg)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(99, 102, 241, 0.08)',
                color: 'var(--text-h)',
                transform: 'scale(1.05)'
              }
            }}
          >
            {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/page/:id" element={<PageDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/redirects" element={<Redirects />} />
          <Route path="/404-monitor" element={<Logs404 />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/how-to-use" element={<HowToUse />} />
          <Route path="/comparison" element={<Comparison />} />
        </Routes>
      </Box>
    </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;

