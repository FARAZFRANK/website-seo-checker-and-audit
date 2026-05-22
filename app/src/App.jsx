import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CssBaseline, Box, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';

import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import PageDetail from './pages/PageDetail';
import History from './pages/History';

const drawerWidth = 260;

function Layout() {
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Audit History', icon: <HistoryIcon />, path: '/history' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];

  return (
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
          <Typography variant="h5" sx={{ fontFamily: 'var(--sans)', fontWeight: 800, letterSpacing: '-0.03em' }}>
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
            borderBottom: '1px solid var(--border)'
          }}
        >
          <Typography variant="h6" noWrap component="div" sx={{ fontFamily: 'var(--sans)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-h)' }}>
            Frank <span className="gradient-text">SEO Checker & Audit</span> v1.0.1
          </Typography>
        </Box>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/page/:id" element={<PageDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </Box>
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

