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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  IconButton
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import TuneIcon from '@mui/icons-material/Tune';
import CodeIcon from '@mui/icons-material/Code';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { getSettings, updateSettings, resetPlugin } from '../api';

function Settings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    xmlSitemaps: true,
    excludePatterns: "*/wp-admin/*\n*/wp-includes/*\n*?replytocom=*",
    crawlDepth: 3,
    crawlInterval: 2,
    schedule: "Monthly",
    checkMetaData: true,
    checkAltTags: true,
    checkBrokenLinks: false,
    excludeMenus: true,
    excludeFooters: true,
    excludeSidebars: true,
    emailRecipients: "",
    enableScanEmail: false,
    enableScheduledEmail: false,
    geminiApiKey: "",
    localBusinessName: "",
    localBusinessType: "LocalBusiness",
    localBusinessAddress: "",
    localBusinessCity: "",
    localBusinessZip: "",
    localBusinessPhone: "",
    enableWooCommerceSEO: true,
    enableLocalSEO: true,
    enableOpenGraph: true,
    enableImageSEO: true,
    enableAdvancedSchema: true,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Configuration applied and saved successfully!');
  const [errorToast, setErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetting, setResetting] = useState(false);

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
            emailRecipients: apiSettings.emailRecipients !== undefined ? apiSettings.emailRecipients : prev.emailRecipients,
            enableScanEmail: apiSettings.enableScanEmail !== undefined ? !!apiSettings.enableScanEmail : prev.enableScanEmail,
            enableScheduledEmail: apiSettings.enableScheduledEmail !== undefined ? !!apiSettings.enableScheduledEmail : prev.enableScheduledEmail,
            geminiApiKey: apiSettings.geminiApiKey !== undefined ? apiSettings.geminiApiKey : prev.geminiApiKey,
            localBusinessName: apiSettings.localBusinessName !== undefined ? apiSettings.localBusinessName : prev.localBusinessName,
            localBusinessType: apiSettings.localBusinessType !== undefined ? apiSettings.localBusinessType : prev.localBusinessType,
            localBusinessAddress: apiSettings.localBusinessAddress !== undefined ? apiSettings.localBusinessAddress : prev.localBusinessAddress,
            localBusinessCity: apiSettings.localBusinessCity !== undefined ? apiSettings.localBusinessCity : prev.localBusinessCity,
            localBusinessZip: apiSettings.localBusinessZip !== undefined ? apiSettings.localBusinessZip : prev.localBusinessZip,
            localBusinessPhone: apiSettings.localBusinessPhone !== undefined ? apiSettings.localBusinessPhone : prev.localBusinessPhone,
            enableWooCommerceSEO: apiSettings.enableWooCommerceSEO !== undefined ? !!apiSettings.enableWooCommerceSEO : prev.enableWooCommerceSEO,
            enableLocalSEO: apiSettings.enableLocalSEO !== undefined ? !!apiSettings.enableLocalSEO : prev.enableLocalSEO,
            enableOpenGraph: apiSettings.enableOpenGraph !== undefined ? !!apiSettings.enableOpenGraph : prev.enableOpenGraph,
            enableImageSEO: apiSettings.enableImageSEO !== undefined ? !!apiSettings.enableImageSEO : prev.enableImageSEO,
            enableAdvancedSchema: apiSettings.enableAdvancedSchema !== undefined ? !!apiSettings.enableAdvancedSchema : prev.enableAdvancedSchema,
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
        setToastMessage('Configuration applied and saved successfully!');
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

  const handleReset = async () => {
    setResetting(true);
    try {
      const response = await resetPlugin();
      if (response && response.success) {
        setToastMessage('Plugin has been completely reset.');
        setOpenToast(true);
        setOpenResetDialog(false);
        // Refresh page to clear out react states and re-fetch settings
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setErrorMessage(response?.message || 'Failed to reset plugin.');
        setErrorToast(true);
      }
    } catch (err) {
      console.error("Failed to reset plugin via API:", err);
      setErrorMessage('A network error occurred while resetting.');
      setErrorToast(true);
    } finally {
      setResetting(false);
    }
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenToast(false);
  };

  const handleCloseErrorToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setErrorToast(false);
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
                      mx: 1.5,
                      width: 'calc(100% - 24px)',
                      color: 'var(--primary)',
                      '& .MuiSlider-thumb': {
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: '0px 0px 0px 8px rgba(99, 102, 241, 0.16)',
                        },
                      },
                      '& .MuiSlider-markLabel': {
                        fontFamily: 'var(--sans)',
                        fontSize: '0.8rem',
                        '&[data-index="0"]': {
                          transform: 'translateX(0%)',
                        },
                        '&[data-index="4"]': {
                          transform: 'translateX(-100%)',
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
                      mx: 1.5,
                      width: 'calc(100% - 24px)',
                      color: 'var(--primary)',
                      '& .MuiSlider-thumb': {
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: '0px 0px 0px 8px rgba(99, 102, 241, 0.16)',
                        },
                      },
                      '& .MuiSlider-markLabel': {
                        fontFamily: 'var(--sans)',
                        fontSize: '0.8rem',
                        '&[data-index="0"]': {
                          transform: 'translateX(0%)',
                        },
                        '&[data-index="2"]': {
                          transform: 'translateX(-100%)',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Global Features Settings Card */}
            <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <AutoAwesomeIcon sx={{ color: 'var(--primary)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>
                  Global Features Integration
                </Typography>
              </Box>

              <Grid container spacing={3.5}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.enableWooCommerceSEO} 
                        onChange={(e) => setSettings({ ...settings, enableWooCommerceSEO: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary)', '& + .MuiSwitch-track': { backgroundColor: 'var(--primary)' } } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.9rem', color: 'var(--text-h)' }}>
                          WooCommerce SEO
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.8rem', fontFamily: 'var(--sans)' }}>
                          Enable automated Product Schema and OpenGraph tags.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.enableLocalSEO} 
                        onChange={(e) => setSettings({ ...settings, enableLocalSEO: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary)', '& + .MuiSwitch-track': { backgroundColor: 'var(--primary)' } } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.9rem', color: 'var(--text-h)' }}>
                          Local Business SEO
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.8rem', fontFamily: 'var(--sans)' }}>
                          Enable Local Business schema rendering on the front page.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.enableOpenGraph} 
                        onChange={(e) => setSettings({ ...settings, enableOpenGraph: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary)', '& + .MuiSwitch-track': { backgroundColor: 'var(--primary)' } } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.9rem', color: 'var(--text-h)' }}>
                          Social Media (OpenGraph)
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.8rem', fontFamily: 'var(--sans)' }}>
                          Output custom OpenGraph and Twitter tags to the header.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.enableImageSEO} 
                        onChange={(e) => setSettings({ ...settings, enableImageSEO: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary)', '& + .MuiSwitch-track': { backgroundColor: 'var(--primary)' } } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.9rem', color: 'var(--text-h)' }}>
                          Automatic Image SEO
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.8rem', fontFamily: 'var(--sans)' }}>
                          Automatically inject alt attributes to missing images.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.enableAdvancedSchema} 
                        onChange={(e) => setSettings({ ...settings, enableAdvancedSchema: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary)', '& + .MuiSwitch-track': { backgroundColor: 'var(--primary)' } } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.9rem', color: 'var(--text-h)' }}>
                          Advanced Schema Builder
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.8rem', fontFamily: 'var(--sans)' }}>
                          Enable Custom JSON-LD schema injection and FAQ auto-detection.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </Box>

            {/* AI Assistant Settings Card */}
            <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <VpnKeyIcon sx={{ color: 'var(--primary)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>
                  AI Assistant Settings
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.85rem', fontFamily: 'var(--sans)', mb: 2 }}>
                    Configure the Google Gemini AI API key to enable automated meta titles and descriptions generation inside the editor.
                  </Typography>
                  <TextField
                    label="Gemini API Key"
                    type={showApiKey ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    value={settings.geminiApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowApiKey(!showApiKey)}
                            edge="end"
                            sx={{ color: 'var(--text)' }}
                          >
                            {showApiKey ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    helperText={
                      <span>
                        Need an API key? You can get a free key from the{' '}
                        <a 
                          href="https://aistudio.google.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                        >
                          Google AI Studio
                        </a>.
                      </span>
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontFamily: 'var(--sans)',
                        fontSize: '0.9rem',
                        '& fieldset': { borderColor: 'var(--border)' },
                        '&:hover fieldset': { borderColor: 'var(--primary)' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--primary)', borderWidth: '1px' }
                      },
                      '& .MuiInputLabel-root': { fontFamily: 'var(--sans)', fontSize: '0.9rem' },
                      '& .MuiFormHelperText-root': { fontFamily: 'var(--sans)', fontSize: '0.78rem' }
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

            {/* Local Business SEO Card */}
            <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <StorefrontIcon sx={{ color: 'var(--primary)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>
                  Local Business SEO
                </Typography>
              </Box>
              <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.85rem', fontFamily: 'var(--sans)', mb: 3 }}>
                Help Google Maps and Local Search understand your physical business by filling out these details. It automatically generates LocalBusiness schema on your homepage.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Business Name"
                    variant="outlined"
                    fullWidth
                    value={settings.localBusinessName || ''}
                    onChange={(e) => setSettings({ ...settings, localBusinessName: e.target.value })}
                    placeholder="Frank's Pizza"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: 'var(--sans)', fontSize: '0.9rem', '& fieldset': { borderColor: 'var(--border)' }, '&:hover fieldset': { borderColor: 'var(--primary)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary)', borderWidth: '1px' } },
                      '& .MuiInputLabel-root': { fontFamily: 'var(--sans)', fontSize: '0.9rem' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Select
                    value={settings.localBusinessType || 'LocalBusiness'}
                    onChange={(e) => setSettings({ ...settings, localBusinessType: e.target.value })}
                    fullWidth
                    sx={{
                      borderRadius: '12px', fontFamily: 'var(--sans)', fontSize: '0.9rem',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)', borderWidth: '1px' }
                    }}
                  >
                    <MenuItem value="LocalBusiness">Local Business (Generic)</MenuItem>
                    <MenuItem value="Restaurant">Restaurant</MenuItem>
                    <MenuItem value="MedicalBusiness">Medical Clinic / Dentist</MenuItem>
                    <MenuItem value="Store">Retail Store</MenuItem>
                    <MenuItem value="HomeAndConstructionBusiness">Plumber / Construction</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Street Address"
                    variant="outlined"
                    fullWidth
                    value={settings.localBusinessAddress || ''}
                    onChange={(e) => setSettings({ ...settings, localBusinessAddress: e.target.value })}
                    placeholder="123 Main St"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: 'var(--sans)', fontSize: '0.9rem', '& fieldset': { borderColor: 'var(--border)' }, '&:hover fieldset': { borderColor: 'var(--primary)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary)', borderWidth: '1px' } },
                      '& .MuiInputLabel-root': { fontFamily: 'var(--sans)', fontSize: '0.9rem' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="City"
                    variant="outlined"
                    fullWidth
                    value={settings.localBusinessCity || ''}
                    onChange={(e) => setSettings({ ...settings, localBusinessCity: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: 'var(--sans)', fontSize: '0.9rem', '& fieldset': { borderColor: 'var(--border)' }, '&:hover fieldset': { borderColor: 'var(--primary)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary)', borderWidth: '1px' } },
                      '& .MuiInputLabel-root': { fontFamily: 'var(--sans)', fontSize: '0.9rem' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Zip / Postal Code"
                    variant="outlined"
                    fullWidth
                    value={settings.localBusinessZip || ''}
                    onChange={(e) => setSettings({ ...settings, localBusinessZip: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: 'var(--sans)', fontSize: '0.9rem', '& fieldset': { borderColor: 'var(--border)' }, '&:hover fieldset': { borderColor: 'var(--primary)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary)', borderWidth: '1px' } },
                      '& .MuiInputLabel-root': { fontFamily: 'var(--sans)', fontSize: '0.9rem' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Phone Number"
                    variant="outlined"
                    fullWidth
                    value={settings.localBusinessPhone || ''}
                    onChange={(e) => setSettings({ ...settings, localBusinessPhone: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: 'var(--sans)', fontSize: '0.9rem', '& fieldset': { borderColor: 'var(--border)' }, '&:hover fieldset': { borderColor: 'var(--primary)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary)', borderWidth: '1px' } },
                      '& .MuiInputLabel-root': { fontFamily: 'var(--sans)', fontSize: '0.9rem' }
                    }}
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

            {/* Email & Report Preferences Card */}
            <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <MailOutlineIcon sx={{ color: 'var(--primary)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>
                  Email & Report Preferences
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.enableScanEmail || false} 
                        onChange={(e) => setSettings({ ...settings, enableScanEmail: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary)', '& + .MuiSwitch-track': { backgroundColor: 'var(--primary)' } } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.95rem', color: 'var(--text-h)' }}>
                          Email Report on Scan Completion
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.82rem', fontFamily: 'var(--sans)' }}>
                          Automatically send an email to the admin with key stats when a scan completes.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.enableScheduledEmail || false} 
                        onChange={(e) => setSettings({ ...settings, enableScheduledEmail: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary)', '& + .MuiSwitch-track': { backgroundColor: 'var(--primary)' } } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--sans)', fontSize: '0.95rem', color: 'var(--text-h)' }}>
                          Enable Scheduled Email Reports
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.82rem', fontFamily: 'var(--sans)' }}>
                          Send automated background reports based on the Audit Trigger Schedule.
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Email Recipients"
                    variant="outlined"
                    fullWidth
                    value={settings.emailRecipients || ''}
                    onChange={(e) => setSettings({ ...settings, emailRecipients: e.target.value })}
                    placeholder="admin@example.com, seo@example.com"
                    helperText="Comma-separated list of email addresses that will receive the reports."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontFamily: 'var(--sans)',
                        fontSize: '0.9rem',
                        '& fieldset': { borderColor: 'var(--border)' },
                        '&:hover fieldset': { borderColor: 'var(--primary)' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--primary)', borderWidth: '1px' }
                      },
                      '& .MuiInputLabel-root': { fontFamily: 'var(--sans)', fontSize: '0.9rem' },
                      '& .MuiFormHelperText-root': { fontFamily: 'var(--sans)', fontSize: '0.78rem' }
                    }}
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

            {/* Reset card */}
            <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.2)', borderWidth: '1px', borderStyle: 'solid' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'var(--sans)', color: '#ef4444', mb: 1 }}>
                Danger Zone
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)', mb: 3 }}>
                Completely reset all plugin data, including audit history, settings, and scanned pages. This action cannot be undone.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setOpenResetDialog(true)}
                sx={{
                  width: '100%',
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontFamily: 'var(--sans)',
                  borderRadius: '10px'
                }}
              >
                Reset Plugin Data
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
          {toastMessage}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={errorToast} 
        autoHideDuration={6000} 
        onClose={handleCloseErrorToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseErrorToast} 
          severity="error" 
          sx={{ 
            borderRadius: '12px', 
            fontFamily: 'var(--sans)', 
            fontWeight: 600,
            boxShadow: '0 8px 32px 0 rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.25)'
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={openResetDialog}
        onClose={() => !resetting && setOpenResetDialog(false)}
        container={() => document.getElementById('frank-seo-audit-root')}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '16px',
            backgroundColor: 'var(--bg)',
            backgroundImage: 'none',
            border: '1px solid var(--border)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }
        }}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(4px)',
              backgroundColor: 'rgba(15, 23, 42, 0.3)'
            }
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: '#ef4444' }}>
          Reset Plugin?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: 'var(--sans)', color: 'var(--text)' }}>
            Are you absolutely sure you want to reset the plugin? This will delete all your settings, page audit history, and detected issues permanently.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button 
            onClick={() => setOpenResetDialog(false)} 
            disabled={resetting}
            sx={{ 
              color: 'var(--text-h)', 
              fontFamily: 'var(--sans)',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReset} 
            color="error" 
            variant="contained" 
            disabled={resetting}
            startIcon={resetting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ 
              fontFamily: 'var(--sans)', 
              fontWeight: 600,
              borderRadius: '8px',
              padding: '8px 16px',
              boxShadow: 'none'
            }}
          >
            {resetting ? 'Resetting...' : 'Yes, Reset Plugin'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Settings;
