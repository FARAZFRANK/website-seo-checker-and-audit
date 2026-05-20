import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Switch, 
  Slider, 
  FormControlLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import TuneIcon from '@mui/icons-material/Tune';
import CodeIcon from '@mui/icons-material/Code';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import { getSettings, updateSettings } from '../api';

function Settings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    xmlSitemaps: true,
    excludePatterns: "*/wp-admin/*\n*/wp-includes/*\n*?replytocom=*",
    crawlDepth: 3,
    crawlInterval: 2,
    schedule: "Weekly",
    checkMetaData: true,
    checkAltTags: true,
    checkBrokenLinks: false,
    excludeMenus: true,
    excludeFooters: true,
    excludeSidebars: true,
  });

  const [saving, setSaving] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [errorToast, setErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        if (response && response.success && response.settings) {
          const apiSettings = response.settings;
          setSettings(prev => ({
            ...prev,
            xmlSitemaps: apiSettings.xmlSitemaps !== undefined ? !!apiSettings.xmlSitemaps : prev.xmlSitemaps,
            excludePatterns: apiSettings.excludePatterns !== undefined ? apiSettings.excludePatterns : prev.excludePatterns,
            crawlDepth: apiSettings.crawlDepth !== undefined ? Number(apiSettings.crawlDepth) : prev.crawlDepth,
            crawlInterval: apiSettings.crawlInterval !== undefined ? Number(apiSettings.crawlInterval) : prev.crawlInterval,
            schedule: apiSettings.schedule !== undefined ? apiSettings.schedule : prev.schedule,
            checkMetaData: apiSettings.checkMetaData !== undefined ? !!apiSettings.checkMetaData : prev.checkMetaData,
            checkAltTags: apiSettings.checkAltTags !== undefined ? !!apiSettings.checkAltTags : prev.checkAltTags,
            checkBrokenLinks: apiSettings.checkBrokenLinks !== undefined ? !!apiSettings.checkBrokenLinks : prev.checkBrokenLinks,
            excludeMenus: apiSettings.excludeMenus !== undefined ? !!apiSettings.excludeMenus : prev.excludeMenus,
            excludeFooters: apiSettings.excludeFooters !== undefined ? !!apiSettings.excludeFooters : prev.excludeFooters,
            excludeSidebars: apiSettings.excludeSidebars !== undefined ? !!apiSettings.excludeSidebars : prev.excludeSidebars,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch settings from API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateSettings(settings);
      if (response && response.success) {
        setOpenToast(true);
      } else {
        setErrorMessage(response?.message || 'Failed to update configurations.');
        setErrorToast(true);
      }
    } catch (err) {
      console.error("Failed to save settings via API:", err);
      setErrorMessage('A network error occurred while saving.');
      setErrorToast(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenToast(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={50} sx={{ color: 'var(--primary)' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ fontFamily: 'var(--sans)', pb: 5 }}>
      {/* Premium Header */}
      <Box 
        className="glass-panel"
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 3.5, 
          mb: 4.5,
          borderRadius: '20px'
        }}
      >
        <Box className="metric-icon-bg" sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary)', mr: 2.5 }}>
          <SettingsIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: 'var(--sans)', 
              fontWeight: 800, 
              color: 'var(--text-h)',
              letterSpacing: '-0.03em',
              mb: 0.5
            }}
          >
            Audit <span className="gradient-text">Configuration</span>
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
            Configure and tune website crawlers, set schedules, and customize critical audit thresholds.
          </Typography>
        </Box>
      </Box>

      {/* Main Settings Grid Layout */}
      <Grid container spacing={4}>
        {/* Left Columns - Detailed settings modules */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Crawler Settings Card */}
            <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <TuneIcon sx={{ color: 'var(--primary)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>
                  Crawler Preferences
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.xmlSitemaps} 
                        onChange={(e) => setSettings({ ...settings, xmlSitemaps: e.target.checked })}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: 'var(--primary)',
                            '& + .MuiSwitch-track': {
                              backgroundColor: 'var(--primary)',
                            },
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.95rem', color: 'var(--text-h)' }}>
                          Discover & Crawl XML Sitemaps
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.82rem', fontFamily: 'var(--sans)' }}>
                          Extract pages directly from your website's sitemap files automatically.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.95rem', color: 'var(--text-h)', mb: 1.5 }}>
                    Maximum Crawl Depth: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{settings.crawlDepth} Levels</span>
                  </Typography>
                  <Slider
                    value={settings.crawlDepth}
                    min={1}
                    max={5}
                    step={1}
                    marks={[
                      { value: 1, label: '1 Level' },
                      { value: 2, label: '2' },
                      { value: 3, label: '3' },
                      { value: 4, label: '4' },
                      { value: 5, label: '5 Levels' },
                    ]}
                    onChange={(e, val) => setSettings({ ...settings, crawlDepth: val })}
                    sx={{
                      color: 'var(--primary)',
                      '& .MuiSlider-thumb': {
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: '0px 0px 0px 8px rgba(99, 102, 241, 0.16)',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.95rem', color: 'var(--text-h)', mb: 1.5 }}>
                    Request Delay Rate: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{settings.crawlInterval}s Delay</span>
                  </Typography>
                  <Slider
                    value={settings.crawlInterval}
                    min={0.5}
                    max={5}
                    step={0.5}
                    marks={[
                      { value: 0.5, label: '0.5s (Fast)' },
                      { value: 2, label: '2s' },
                      { value: 5, label: '5s (Safe)' },
                    ]}
                    onChange={(e, val) => setSettings({ ...settings, crawlInterval: val })}
                    sx={{
                      color: 'var(--primary)',
                      '& .MuiSlider-thumb': {
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: '0px 0px 0px 8px rgba(99, 102, 241, 0.16)',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Verification Rules Card */}
            <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <CodeIcon sx={{ color: 'var(--primary)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>
                  Audit Standards
                </Typography>
              </Box>

              <Grid container spacing={3.5}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.checkMetaData} 
                        onChange={(e) => setSettings({ ...settings, checkMetaData: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary)', '& + .MuiSwitch-track': { backgroundColor: 'var(--primary)' } } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.9rem', color: 'var(--text-h)' }}>
                          Check Meta Tag Validation
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.8rem', fontFamily: 'var(--sans)' }}>
                          Check titles, descriptions, and tag lengths.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.checkAltTags} 
                        onChange={(e) => setSettings({ ...settings, checkAltTags: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary)', '& + .MuiSwitch-track': { backgroundColor: 'var(--primary)' } } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.9rem', color: 'var(--text-h)' }}>
                          Check Image Alt Values
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.8rem', fontFamily: 'var(--sans)' }}>
                          Audit whether embedded images miss alternate text.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.checkBrokenLinks} 
                        onChange={(e) => setSettings({ ...settings, checkBrokenLinks: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary)', '& + .MuiSwitch-track': { backgroundColor: 'var(--primary)' } } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.9rem', color: 'var(--text-h)' }}>
                          Full Broken Link Diagnostics (HTTP Verification)
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.8rem', fontFamily: 'var(--sans)' }}>
                          Sends background test calls to identify dead redirects or broken 404 links.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Link Analytics Card */}
            <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <LinkIcon sx={{ color: 'var(--primary)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>
                  Link Analytics
                </Typography>
              </Box>

              <Grid container spacing={3.5}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.excludeMenus} 
                        onChange={(e) => setSettings({ ...settings, excludeMenus: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary)', '& + .MuiSwitch-track': { backgroundColor: 'var(--primary)' } } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.9rem', color: 'var(--text-h)' }}>
                          Exclude Menus
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.8rem', fontFamily: 'var(--sans)' }}>
                          Skip links in header/navigation.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.excludeFooters} 
                        onChange={(e) => setSettings({ ...settings, excludeFooters: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary)', '& + .MuiSwitch-track': { backgroundColor: 'var(--primary)' } } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.9rem', color: 'var(--text-h)' }}>
                          Exclude Footers
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.8rem', fontFamily: 'var(--sans)' }}>
                          Skip links in footer sections.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.excludeSidebars} 
                        onChange={(e) => setSettings({ ...settings, excludeSidebars: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary)', '& + .MuiSwitch-track': { backgroundColor: 'var(--primary)' } } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.9rem', color: 'var(--text-h)' }}>
                          Exclude Sidebars
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.8rem', fontFamily: 'var(--sans)' }}>
                          Skip links in widget areas.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>

        {/* Right Columns - Schedules, Exclusions, Action Button */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Action card */}
            <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px', textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)', mb: 3 }}>
                Double check your changes before applying. Saved settings will immediately control the next crawler sweep.
              </Typography>
              <Button
                variant="contained"
                className="btn-glow btn-pulse"
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  width: '100%',
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontFamily: 'var(--sans)'
                }}
              >
                {saving ? 'Updating Options...' : 'Apply Configurations'}
              </Button>
            </Box>

            {/* Schedule configuration */}
            <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <AccessTimeIcon sx={{ color: 'var(--primary)' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>
                  Audit Trigger Schedule
                </Typography>
              </Box>
              <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.82rem', fontFamily: 'var(--sans)', mb: 2 }}>
                Schedule cron tasks to audit your pages automatically in the background.
              </Typography>
              <Select
                value={settings.schedule}
                onChange={(e) => setSettings({ ...settings, schedule: e.target.value })}
                fullWidth
                sx={{
                  borderRadius: '12px',
                  fontFamily: 'var(--sans)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)',
                  '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid var(--primary)'
                  },
                  '&.Mui-focused': { border: '1px solid var(--primary)' }
                }}
              >
                <MenuItem value="Disabled" sx={{ fontFamily: 'var(--sans)', fontSize: '0.88rem' }}>Disabled (Manual Only)</MenuItem>
                <MenuItem value="Daily" sx={{ fontFamily: 'var(--sans)', fontSize: '0.88rem' }}>Every 24 Hours (Daily)</MenuItem>
                <MenuItem value="Weekly" sx={{ fontFamily: 'var(--sans)', fontSize: '0.88rem' }}>Every 7 Days (Weekly)</MenuItem>
                <MenuItem value="Monthly" sx={{ fontFamily: 'var(--sans)', fontSize: '0.88rem' }}>Every 30 Days (Monthly)</MenuItem>
              </Select>
            </Box>

            {/* Exclusion configuration */}
            <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px' }}>
              <Typography sx={{ fontWeight: 700, fontFamily: 'var(--sans)', color: 'var(--text-h)', mb: 1 }}>
                Exclude URL Patterns
              </Typography>
              <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.8rem', fontFamily: 'var(--sans)', mb: 2 }}>
                Write exact regex patterns or standard path filters (one per line) to block from indexing:
              </Typography>
              <TextField
                multiline
                rows={4}
                value={settings.excludePatterns}
                onChange={(e) => setSettings({ ...settings, excludePatterns: e.target.value })}
                fullWidth
                placeholder="*/sample-page/*"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'var(--mono)',
                    fontSize: '0.8rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    '& fieldset': {
                      borderColor: 'var(--border)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--primary)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary)',
                      borderWidth: '1px'
                    }
                  }
                }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Modern success alert popup */}
      <Snackbar 
        open={openToast} 
        autoHideDuration={4000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity="success" 
          sx={{ 
            borderRadius: '12px', 
            fontFamily: 'var(--sans)', 
            fontWeight: 600,
            boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.25)'
          }}
        >
          Configuration applied and saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Settings;
