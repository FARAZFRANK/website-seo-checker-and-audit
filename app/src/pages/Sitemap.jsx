import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Slider,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  Paper,
  IconButton
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LayersIcon from '@mui/icons-material/Layers';
import CategoryIcon from '@mui/icons-material/Category';
import TuneIcon from '@mui/icons-material/Tune';
import SaveIcon from '@mui/icons-material/Save';
import CachedIcon from '@mui/icons-material/Cached';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CodeIcon from '@mui/icons-material/Code';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getSettings, updateSettings, getSitemapMetadata, clearSitemapCache } from '../api';

function Sitemap() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Sitemap settings state
  const [sitemapSettings, setSitemapSettings] = useState({
    enableSitemap: true,
    sitemapPostTypes: ['post', 'page'],
    sitemapTaxonomies: ['category', 'post_tag'],
    sitemapEntriesPerPage: 1000,
    sitemapIncludeImages: true,
    sitemapExcludePostIds: '',
  });

  // Sitemap metadata from server (detected CPTs, taxonomies, counts, URL)
  const [sitemapMeta, setSitemapMeta] = useState({
    sitemap_url: '',
    available_post_types: [],
    available_taxonomies: [],
    total_published_posts: 0
  });

  // Notification toasts
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [copied, setCopied] = useState(false);

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [settingsRes, metaRes] = await Promise.all([
          getSettings(),
          getSitemapMetadata()
        ]);

        if (settingsRes) {
          const apiSettings = settingsRes.settings || settingsRes;
          setSitemapSettings({
            enableSitemap: apiSettings.enableSitemap !== undefined 
              ? !!apiSettings.enableSitemap 
              : (apiSettings.xmlSitemaps !== undefined ? !!apiSettings.xmlSitemaps : true),
            sitemapPostTypes: Array.isArray(apiSettings.sitemapPostTypes) 
              ? apiSettings.sitemapPostTypes 
              : ['post', 'page'],
            sitemapTaxonomies: Array.isArray(apiSettings.sitemapTaxonomies) 
              ? apiSettings.sitemapTaxonomies 
              : ['category', 'post_tag'],
            sitemapEntriesPerPage: apiSettings.sitemapEntriesPerPage 
              ? Number(apiSettings.sitemapEntriesPerPage) 
              : 1000,
            sitemapIncludeImages: apiSettings.sitemapIncludeImages !== undefined 
              ? !!apiSettings.sitemapIncludeImages 
              : true,
            sitemapExcludePostIds: apiSettings.sitemapExcludePostIds || ''
          });
        }

        if (metaRes && metaRes.success) {
          setSitemapMeta({
            sitemap_url: metaRes.sitemap_url || `${window.location.origin}/sitemap_index.xml`,
            available_post_types: metaRes.available_post_types || [],
            available_taxonomies: metaRes.available_taxonomies || [],
            total_published_posts: metaRes.total_published_posts || 0
          });
        }
      } catch (err) {
        console.error('Failed to load sitemap configuration:', err);
        showToast('Failed to load sitemap settings from server.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save sitemap settings
  const handleSave = async () => {
    setSaving(true);
    try {
      // Fetch full settings first so we do not overwrite other plugin configurations
      const fullRes = await getSettings();
      const current = fullRes.settings || fullRes || {};

      const payload = {
        ...current,
        enableSitemap: sitemapSettings.enableSitemap,
        xmlSitemaps: sitemapSettings.enableSitemap, // keep backward compat
        sitemapPostTypes: sitemapSettings.sitemapPostTypes,
        sitemapTaxonomies: sitemapSettings.sitemapTaxonomies,
        sitemapEntriesPerPage: Number(sitemapSettings.sitemapEntriesPerPage),
        sitemapIncludeImages: !!sitemapSettings.sitemapIncludeImages,
        sitemapExcludePostIds: sitemapSettings.sitemapExcludePostIds
      };

      const res = await updateSettings(payload);
      if (res && res.success) {
        showToast('XML Sitemap configuration updated and cache refreshed successfully!');
      } else {
        throw new Error(res?.message || 'Update failed');
      }
    } catch (err) {
      console.error('Failed to update sitemap settings:', err);
      showToast('Error saving sitemap settings. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Purge sitemap transient cache
  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      const res = await clearSitemapCache();
      if (res && res.success) {
        showToast('Sitemap transient cache flushed and rewrite rules reloaded!');
      } else {
        throw new Error('Failed to purge cache');
      }
    } catch (err) {
      console.error('Cache flush error:', err);
      showToast('Failed to purge sitemap cache.', 'error');
    } finally {
      setClearingCache(false);
    }
  };

  // Copy sitemap URL
  const handleCopyUrl = () => {
    const url = sitemapMeta.sitemap_url || `${window.location.origin}/sitemap_index.xml`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      showToast('Sitemap URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress size={40} sx={{ color: 'var(--primary)' }} />
        <Typography sx={{ color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: '0.95rem' }}>
          Loading XML Sitemap Engine...
        </Typography>
      </Box>
    );
  }

  const sitemapUrl = sitemapMeta.sitemap_url || `${window.location.origin}/sitemap_index.xml`;
  const activePostTypesCount = sitemapSettings.sitemapPostTypes.length;
  const totalPostTypesCount = sitemapMeta.available_post_types.length;
  const activeTaxonomiesCount = sitemapSettings.sitemapTaxonomies.length;
  const totalTaxonomiesCount = sitemapMeta.available_taxonomies.length;

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontFamily: 'var(--sans)', fontWeight: 800, color: 'var(--text-h)', letterSpacing: '-0.03em' }}>
              XML <span className="gradient-text">Sitemap</span>
            </Typography>
            <Chip 
              icon={sitemapSettings.enableSitemap ? <CheckCircleOutlineIcon sx={{ fontSize: '15px !important' }} /> : undefined}
              label={sitemapSettings.enableSitemap ? 'Active & Synchronized' : 'Disabled'} 
              size="small"
              sx={{ 
                fontWeight: 700, 
                fontSize: '0.75rem',
                fontFamily: 'var(--sans)',
                bgcolor: sitemapSettings.enableSitemap ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                color: sitemapSettings.enableSitemap ? '#059669' : '#64748b',
                border: sitemapSettings.enableSitemap ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
            High-performance XML sitemap index with smart pagination, caching, image extraction, and auto-sync.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {sitemapSettings.enableSitemap && (
            <Button
              variant="outlined"
              size="medium"
              href={sitemapUrl}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewIcon sx={{ fontSize: '16px !important' }} />}
              sx={{
                textTransform: 'none',
                fontFamily: 'var(--sans)',
                fontWeight: 700,
                fontSize: '0.85rem',
                borderRadius: '10px',
                color: 'var(--primary)',
                borderColor: 'rgba(99, 102, 241, 0.35)',
                bgcolor: 'var(--glass-bg)',
                '&:hover': {
                  borderColor: 'var(--primary)',
                  bgcolor: 'rgba(99, 102, 241, 0.08)'
                }
              }}
            >
              View Live Sitemap
            </Button>
          )}

          <Button
            variant="outlined"
            size="medium"
            onClick={handleClearCache}
            disabled={clearingCache}
            startIcon={clearingCache ? <CircularProgress size={16} color="inherit" /> : <CachedIcon sx={{ fontSize: '17px !important' }} />}
            sx={{
              textTransform: 'none',
              fontFamily: 'var(--sans)',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: '10px',
              color: 'var(--text)',
              borderColor: 'var(--border)',
              bgcolor: 'var(--glass-bg)',
              '&:hover': {
                borderColor: 'var(--text-h)',
                bgcolor: 'rgba(255, 255, 255, 0.06)'
              }
            }}
          >
            {clearingCache ? 'Purging...' : 'Purge Cache'}
          </Button>

          <Button
            variant="contained"
            className="btn-glow btn-pulse"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              py: 1,
              px: 2.5,
              fontSize: '0.88rem',
              fontFamily: 'var(--sans)',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '10px'
            }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Box>
      </Box>

      {/* Overview Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Sitemap Index URL Card */}
        <Grid item xs={12} md={4}>
          <Box className="glass-panel" sx={{ p: 2.5, borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', opacity: 0.7, fontFamily: 'var(--sans)', mb: 1 }}>
                Sitemap Index URL
              </Typography>
              <Typography sx={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-h)', wordBreak: 'break-all', bgcolor: 'rgba(255, 255, 255, 0.04)', p: 1.2, borderRadius: '8px', border: '1px solid var(--border)' }}>
                {sitemapUrl}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
              <Button
                size="small"
                variant="text"
                startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                onClick={handleCopyUrl}
                sx={{ textTransform: 'none', fontFamily: 'var(--sans)', fontSize: '0.78rem', color: copied ? '#059669' : 'var(--text)' }}
              >
                {copied ? 'Copied!' : 'Copy URL'}
              </Button>
              <Button
                size="small"
                variant="text"
                component="a"
                href={sitemapUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
                sx={{ textTransform: 'none', fontFamily: 'var(--sans)', fontSize: '0.78rem', color: 'var(--primary)' }}
              >
                Test in Browser
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Post Types & Taxonomies Count */}
        <Grid item xs={12} sm={6} md={4}>
          <Box className="glass-panel" sx={{ p: 2.5, borderRadius: '16px', height: '100%' }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', opacity: 0.7, fontFamily: 'var(--sans)', mb: 1.5 }}>
              Active Modules
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'var(--sans)', color: 'var(--primary)', lineHeight: 1 }}>
                  {activePostTypesCount}
                  <Typography component="span" sx={{ fontSize: '0.9rem', color: 'var(--text)', opacity: 0.6, ml: 0.5 }}>
                    / {totalPostTypesCount}
                  </Typography>
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'var(--text)', fontFamily: 'var(--sans)', mt: 0.5 }}>
                  Post Types Active
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ borderColor: 'var(--border)' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'var(--sans)', color: '#10b981', lineHeight: 1 }}>
                  {activeTaxonomiesCount}
                  <Typography component="span" sx={{ fontSize: '0.9rem', color: 'var(--text)', opacity: 0.6, ml: 0.5 }}>
                    / {totalTaxonomiesCount}
                  </Typography>
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'var(--text)', fontFamily: 'var(--sans)', mt: 0.5 }}>
                  Taxonomies Active
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Caching & Specs Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Box className="glass-panel" sx={{ p: 2.5, borderRadius: '16px', height: '100%' }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', opacity: 0.7, fontFamily: 'var(--sans)', mb: 1.5 }}>
              Engine Specs
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.82rem', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
                  Per-Sitemap Limit:
                </Typography>
                <Chip label={`${sitemapSettings.sitemapEntriesPerPage} URLs`} size="small" sx={{ fontWeight: 700, fontSize: '0.75rem', fontFamily: 'var(--sans)', bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.82rem', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
                  Image Extraction:
                </Typography>
                <Chip label={sitemapSettings.sitemapIncludeImages ? 'Enabled' : 'Disabled'} size="small" sx={{ fontWeight: 700, fontSize: '0.75rem', fontFamily: 'var(--sans)', bgcolor: sitemapSettings.sitemapIncludeImages ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)', color: sitemapSettings.sitemapIncludeImages ? '#059669' : '#64748b' }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.82rem', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
                  XSLT Design:
                </Typography>
                <Chip label="Branded & Filterable" size="small" sx={{ fontWeight: 700, fontSize: '0.75rem', fontFamily: 'var(--sans)', bgcolor: 'rgba(255, 255, 255, 0.06)' }} />
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Master Toggle Banner */}
      <Box className="glass-panel" sx={{ p: 3, mb: 3.5, borderRadius: '18px', border: '1px solid var(--border)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '14px', 
              bgcolor: sitemapSettings.enableSitemap ? 'rgba(99, 102, 241, 0.12)' : 'rgba(100, 116, 139, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: sitemapSettings.enableSitemap ? 'var(--primary)' : 'var(--text)'
            }}>
              <AccountTreeIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'var(--sans)', color: 'var(--text-h)', letterSpacing: '-0.02em' }}>
                Enable XML Sitemap Feature
              </Typography>
              <Typography sx={{ color: 'var(--text)', opacity: 0.82, fontSize: '0.85rem', fontFamily: 'var(--sans)', mt: 0.3 }}>
                Automatically generates standard <code style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>/sitemap_index.xml</code> and individual sub-sitemaps for search engines.
              </Typography>
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Switch 
                checked={sitemapSettings.enableSitemap} 
                onChange={(e) => setSitemapSettings(prev => ({ ...prev, enableSitemap: e.target.checked }))}
                sx={{
                  transform: 'scale(1.2)',
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'var(--primary)',
                    '& + .MuiSwitch-track': {
                      backgroundColor: 'var(--primary)',
                    },
                  },
                }}
              />
            }
            label=""
          />
        </Box>
      </Box>

      {/* Main Settings Tabs & Panels */}
      {sitemapSettings.enableSitemap ? (
        <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px', border: '1px solid var(--border)' }}>
          {/* Navigation Tabs */}
          <Tabs 
            value={activeTab} 
            onChange={(e, val) => setActiveTab(val)}
            sx={{
              mb: 3.5,
              borderBottom: '1px solid var(--border)',
              '& .MuiTabs-indicator': {
                backgroundColor: 'var(--primary)',
                height: 3,
                borderRadius: '3px 3px 0 0'
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontFamily: 'var(--sans)',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: 'var(--text)',
                minHeight: 46,
                py: 1,
                px: 2.5,
                '&.Mui-selected': {
                  color: 'var(--primary)'
                }
              }
            }}
          >
            <Tab icon={<LayersIcon sx={{ fontSize: 19 }} />} iconPosition="start" label="Post Types" />
            <Tab icon={<CategoryIcon sx={{ fontSize: 19 }} />} iconPosition="start" label="Taxonomies" />
            <Tab icon={<ImageOutlinedIcon sx={{ fontSize: 19 }} />} iconPosition="start" label="Images & Media" />
            <Tab icon={<TuneIcon sx={{ fontSize: 19 }} />} iconPosition="start" label="Advanced & Tuning" />
          </Tabs>

          {/* TAB 0: Post Types */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'var(--sans)', color: 'var(--text-h)', mb: 0.5 }}>
                  Public Post Types Configuration
                </Typography>
                <Typography sx={{ color: 'var(--text)', opacity: 0.85, fontSize: '0.85rem', fontFamily: 'var(--sans)' }}>
                  Select which post types to include in the XML sitemap. Redirected URLs (301/302), password-protected posts, drafts, and items marked <strong>'noindex'</strong> are automatically filtered out.
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                {sitemapMeta.available_post_types && sitemapMeta.available_post_types.length > 0 ? (
                  sitemapMeta.available_post_types.map((pt) => {
                    const isIncluded = sitemapSettings.sitemapPostTypes.includes(pt.name);
                    const subSitemapUrl = `${window.location.origin}/${pt.name}-sitemap.xml`;

                    return (
                      <Grid item xs={12} sm={6} key={pt.name}>
                        <Box 
                          sx={{ 
                            p: 2.5, 
                            borderRadius: '14px', 
                            border: isIncluded ? '1.5px solid rgba(99, 102, 241, 0.45)' : '1px solid var(--border)',
                            bgcolor: isIncluded ? 'rgba(99, 102, 241, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: isIncluded ? 'var(--primary)' : 'rgba(255, 255, 255, 0.2)'
                            }
                          }}
                        >
                          <Box sx={{ pr: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
                              <Typography sx={{ fontWeight: 700, fontFamily: 'var(--sans)', fontSize: '0.95rem', color: 'var(--text-h)' }}>
                                {pt.label}
                              </Typography>
                              <Chip 
                                label={`${pt.count} Published`} 
                                size="small" 
                                sx={{ 
                                  height: 22, 
                                  fontSize: '0.72rem', 
                                  fontWeight: 600,
                                  fontFamily: 'var(--sans)',
                                  bgcolor: 'rgba(255, 255, 255, 0.08)' 
                                }} 
                              />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ color: 'var(--text)', opacity: 0.7, fontSize: '0.75rem', fontFamily: 'var(--mono)' }}>
                                /{pt.name}-sitemap.xml
                              </Typography>
                              {isIncluded && (
                                <Tooltip title="Preview sub-sitemap in browser">
                                  <IconButton 
                                    size="small" 
                                    component="a" 
                                    href={subSitemapUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    sx={{ p: 0.2, color: 'var(--primary)' }}
                                  >
                                    <OpenInNewIcon sx={{ fontSize: 13 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>

                          <Switch 
                            checked={isIncluded}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...sitemapSettings.sitemapPostTypes, pt.name]
                                : sitemapSettings.sitemapPostTypes.filter((name) => name !== pt.name);
                              setSitemapSettings(prev => ({ ...prev, sitemapPostTypes: updated }));
                            }}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: 'var(--primary)',
                                '& + .MuiSwitch-track': {
                                  backgroundColor: 'var(--primary)',
                                },
                              },
                            }}
                          />
                        </Box>
                      </Grid>
                    );
                  })
                ) : (
                  <Grid item xs={12}>
                    <Typography sx={{ color: 'var(--text)', fontSize: '0.85rem' }}>
                      No public post types detected.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* TAB 1: Taxonomies */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'var(--sans)', color: 'var(--text-h)', mb: 0.5 }}>
                  Taxonomy Archives Configuration
                </Typography>
                <Typography sx={{ color: 'var(--text)', opacity: 0.85, fontSize: '0.85rem', fontFamily: 'var(--sans)' }}>
                  Include Categories, Tags, and WooCommerce product classifications. Frank SEO automatically ensures terms with 0 assigned posts are excluded to protect against soft 404 penalties.
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                {sitemapMeta.available_taxonomies && sitemapMeta.available_taxonomies.length > 0 ? (
                  sitemapMeta.available_taxonomies.map((tax) => {
                    const isIncluded = sitemapSettings.sitemapTaxonomies.includes(tax.name);
                    const subSitemapUrl = `${window.location.origin}/${tax.name}-sitemap.xml`;

                    return (
                      <Grid item xs={12} sm={6} key={tax.name}>
                        <Box 
                          sx={{ 
                            p: 2.5, 
                            borderRadius: '14px', 
                            border: isIncluded ? '1.5px solid rgba(99, 102, 241, 0.45)' : '1px solid var(--border)',
                            bgcolor: isIncluded ? 'rgba(99, 102, 241, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: isIncluded ? 'var(--primary)' : 'rgba(255, 255, 255, 0.2)'
                            }
                          }}
                        >
                          <Box sx={{ pr: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
                              <Typography sx={{ fontWeight: 700, fontFamily: 'var(--sans)', fontSize: '0.95rem', color: 'var(--text-h)' }}>
                                {tax.label}
                              </Typography>
                              <Chip 
                                label={`${tax.count} Non-empty Terms`} 
                                size="small" 
                                sx={{ 
                                  height: 22, 
                                  fontSize: '0.72rem', 
                                  fontWeight: 600,
                                  fontFamily: 'var(--sans)',
                                  bgcolor: 'rgba(255, 255, 255, 0.08)' 
                                }} 
                              />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ color: 'var(--text)', opacity: 0.7, fontSize: '0.75rem', fontFamily: 'var(--mono)' }}>
                                /{tax.name}-sitemap.xml
                              </Typography>
                              {isIncluded && (
                                <Tooltip title="Preview taxonomy sitemap in browser">
                                  <IconButton 
                                    size="small" 
                                    component="a" 
                                    href={subSitemapUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    sx={{ p: 0.2, color: 'var(--primary)' }}
                                  >
                                    <OpenInNewIcon sx={{ fontSize: 13 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>

                          <Switch 
                            checked={isIncluded}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...sitemapSettings.sitemapTaxonomies, tax.name]
                                : sitemapSettings.sitemapTaxonomies.filter((name) => name !== tax.name);
                              setSitemapSettings(prev => ({ ...prev, sitemapTaxonomies: updated }));
                            }}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: 'var(--primary)',
                                '& + .MuiSwitch-track': {
                                  backgroundColor: 'var(--primary)',
                                },
                              },
                            }}
                          />
                        </Box>
                      </Grid>
                    );
                  })
                ) : (
                  <Grid item xs={12}>
                    <Typography sx={{ color: 'var(--text)', fontSize: '0.85rem' }}>
                      No public taxonomies detected.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* TAB 2: Images & Media */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'var(--sans)', color: 'var(--text-h)', mb: 0.5 }}>
                  Specialized Image Sitemaps Extraction
                </Typography>
                <Typography sx={{ color: 'var(--text)', opacity: 0.85, fontSize: '0.85rem', fontFamily: 'var(--sans)' }}>
                  Google supports image metadata inside standard XML sitemaps to optimize Google Images indexation and rank high in rich results.
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ p: 3, borderRadius: '14px', border: '1px solid var(--border)', bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ maxWidth: '80%' }}>
                        <Typography sx={{ fontWeight: 700, fontFamily: 'var(--sans)', fontSize: '1rem', color: 'var(--text-h)' }}>
                          Include &lt;image:image&gt; Tags in Post Sitemaps
                        </Typography>
                        <Typography sx={{ color: 'var(--text)', opacity: 0.82, fontSize: '0.84rem', fontFamily: 'var(--sans)', mt: 0.5 }}>
                          Parses post featured images, Gutenberg & Classic editor content <code style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>&lt;img&gt;</code> tags, and WooCommerce product gallery images with titles and locations.
                        </Typography>
                      </Box>
                      <Switch 
                        checked={sitemapSettings.sitemapIncludeImages} 
                        onChange={(e) => setSitemapSettings(prev => ({ ...prev, sitemapIncludeImages: e.target.checked }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: 'var(--primary)',
                            '& + .MuiSwitch-track': {
                              backgroundColor: 'var(--primary)',
                            },
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ p: 3, borderRadius: '14px', bgcolor: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <InfoOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 700, fontFamily: 'var(--sans)', fontSize: '0.92rem', color: 'var(--text-h)' }}>
                        How Image Sitemap Extraction Works
                      </Typography>
                    </Box>
                    <Typography sx={{ color: 'var(--text)', opacity: 0.85, fontSize: '0.82rem', fontFamily: 'var(--sans)', lineHeight: 1.6 }}>
                      When search engines crawl your sub-sitemaps, each URL entry will contain an attached list of images directly tied to that page. This tells Google the exact canonical relationship between your media and text content, dramatically boosting image search impressions.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 3: Advanced Tuning & Developer Extensibility */}
          {activeTab === 3 && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'var(--sans)', color: 'var(--text-h)', mb: 0.5 }}>
                  Performance & Index Tuning
                </Typography>
                <Typography sx={{ color: 'var(--text)', opacity: 0.85, fontSize: '0.85rem', fontFamily: 'var(--sans)' }}>
                  Fine-tune chunk pagination limits, manual exclusion lists, and developer filter integration.
                </Typography>
              </Box>

              <Grid container spacing={3.5}>
                {/* Pagination Slider */}
                <Grid item xs={12}>
                  <Box sx={{ p: 3, borderRadius: '14px', border: '1px solid var(--border)', bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontFamily: 'var(--sans)', fontSize: '0.95rem', color: 'var(--text-h)' }}>
                        Entries Per Sitemap (Pagination)
                      </Typography>
                      <Chip 
                        label={`${sitemapSettings.sitemapEntriesPerPage} URLs / file`} 
                        sx={{ fontWeight: 800, fontFamily: 'var(--sans)', color: 'var(--primary)', bgcolor: 'rgba(99, 102, 241, 0.1)' }} 
                      />
                    </Box>
                    <Typography sx={{ color: 'var(--text)', opacity: 0.82, fontSize: '0.82rem', fontFamily: 'var(--sans)', mb: 3 }}>
                      When a post type exceeds this limit, Frank SEO automatically generates paginated sitemaps (e.g. <code style={{ fontFamily: 'var(--mono)' }}>post-sitemap1.xml</code>, <code style={{ fontFamily: 'var(--mono)' }}>post-sitemap2.xml</code>) to prevent memory crashes on large databases.
                    </Typography>
                    <Slider
                      value={sitemapSettings.sitemapEntriesPerPage}
                      min={100}
                      max={2000}
                      step={100}
                      marks={[
                        { value: 100, label: '100' },
                        { value: 500, label: '500' },
                        { value: 1000, label: '1000 (Recommended)' },
                        { value: 1500, label: '1500' },
                        { value: 2000, label: '2000' },
                      ]}
                      onChange={(e, val) => setSitemapSettings(prev => ({ ...prev, sitemapEntriesPerPage: val }))}
                      sx={{
                        mx: 1.5,
                        width: 'calc(100% - 24px)',
                        color: 'var(--primary)',
                        '& .MuiSlider-markLabel': {
                          fontFamily: 'var(--sans)',
                          fontSize: '0.75rem',
                        }
                      }}
                    />
                  </Box>
                </Grid>

                {/* Exclude Post/Page IDs */}
                <Grid item xs={12}>
                  <Box sx={{ p: 3, borderRadius: '14px', border: '1px solid var(--border)', bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                    <Typography sx={{ fontWeight: 700, fontFamily: 'var(--sans)', fontSize: '0.95rem', color: 'var(--text-h)', mb: 0.5 }}>
                      Exclude Specific Post or Page IDs
                    </Typography>
                    <Typography sx={{ color: 'var(--text)', opacity: 0.82, fontSize: '0.82rem', fontFamily: 'var(--sans)', mb: 2 }}>
                      Enter individual post or page IDs separated by commas to permanently omit them from sitemap indexing.
                    </Typography>
                    <TextField
                      variant="outlined"
                      fullWidth
                      value={sitemapSettings.sitemapExcludePostIds || ''}
                      onChange={(e) => setSitemapSettings(prev => ({ ...prev, sitemapExcludePostIds: e.target.value }))}
                      placeholder="e.g. 14, 28, 105"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          fontFamily: 'var(--sans)',
                          fontSize: '0.9rem',
                          '& fieldset': { borderColor: 'var(--border)' },
                          '&:hover fieldset': { borderColor: 'var(--primary)' },
                          '&.Mui-focused fieldset': { borderColor: 'var(--primary)', borderWidth: '1px' }
                        }
                      }}
                    />
                  </Box>
                </Grid>

                {/* Developer Extensibility Hooks */}
                <Grid item xs={12}>
                  <Box sx={{ p: 3, borderRadius: '14px', border: '1px solid var(--border)', bgcolor: 'rgba(255, 255, 255, 0.01)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                      <CodeIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 700, fontFamily: 'var(--sans)', fontSize: '0.92rem', color: 'var(--text-h)' }}>
                        Developer Filters & Actions
                      </Typography>
                    </Box>
                    <Typography sx={{ color: 'var(--text)', opacity: 0.82, fontSize: '0.82rem', fontFamily: 'var(--sans)', mb: 2 }}>
                      Extend or customize the sitemap output in your child theme or custom plugin without touching core files:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2.5, m: 0, '& li': { mb: 0.8, color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'var(--sans)' } }}>
                      <li><code style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>apply_filters('frank_seo_sitemap_url_entry', $url, $post)</code> — Modify or filter any single URL entry.</li>
                      <li><code style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>apply_filters('frank_seo_sitemap_post_types', $types)</code> — Dynamically add or remove included post types.</li>
                      <li><code style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>apply_filters('frank_seo_sitemap_index_items', $items)</code> — Push custom sub-sitemaps into the index.</li>
                      <li><code style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>apply_filters('frank_seo_sitemap_items_per_page', $limit)</code> — Programmatically override the pagination limit.</li>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Bottom Save Action */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              className="btn-glow btn-pulse"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                py: 1.2,
                px: 3.5,
                fontSize: '0.9rem',
                fontFamily: 'var(--sans)',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '10px'
              }}
            >
              {saving ? 'Saving Changes...' : 'Save Configuration'}
            </Button>
          </Box>
        </Box>
      ) : (
        /* Disabled State Panel */
        <Box className="glass-panel" sx={{ p: 5, borderRadius: '20px', textAlign: 'center', border: '1px solid var(--border)' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'var(--sans)', color: 'var(--text-h)', mb: 1 }}>
            XML Sitemap is currently disabled
          </Typography>
          <Typography sx={{ color: 'var(--text)', opacity: 0.8, fontSize: '0.88rem', fontFamily: 'var(--sans)', maxWidth: 500, mx: 'auto', mb: 3 }}>
            Toggle the master switch above and click "Save Configuration" to activate high-performance Google-compliant XML sitemaps for your website.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setSitemapSettings(prev => ({ ...prev, enableSitemap: true }))}
            sx={{
              py: 1,
              px: 3,
              fontFamily: 'var(--sans)',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '10px'
            }}
          >
            Enable XML Sitemap
          </Button>
        </Box>
      )}

      {/* Modern Toast Notifications */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={4000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity} 
          sx={{ 
            borderRadius: '12px', 
            fontFamily: 'var(--sans)', 
            fontWeight: 600,
            boxShadow: toast.severity === 'success' 
              ? '0 8px 32px 0 rgba(16, 185, 129, 0.2)' 
              : '0 8px 32px 0 rgba(239, 68, 68, 0.2)',
            border: toast.severity === 'success' 
              ? '1px solid rgba(16, 185, 129, 0.3)' 
              : '1px solid rgba(239, 68, 68, 0.3)'
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Sitemap;
