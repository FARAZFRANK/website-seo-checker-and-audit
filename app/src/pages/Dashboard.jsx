import React, { useEffect, useState, useMemo } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  Grid, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  InputBase,
  ButtonGroup,
  Checkbox,
  IconButton,
  TablePagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TableSortLabel,
  Select,
  FormControl,
  Tabs,
  Tab,
  TextField
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import PageviewIcon from '@mui/icons-material/Pageview';
import BugReportIcon from '@mui/icons-material/BugReport';
import SpeedIcon from '@mui/icons-material/Speed';
import LaunchIcon from '@mui/icons-material/Launch';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

import { getSummary, getPages, triggerScan, deletePage, bulkDeletePages, getPagesToScan, getSettings, triggerScanComplete, runCompetitorAudit } from '../api';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [summary, setSummary] = useState({ total_pages: 0, total_issues: 0, average_score: 0 });
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all'); // 'all', 'excellent', 'warning', 'critical'
  const [postTypeFilter, setPostTypeFilter] = useState('all');
  
  // Scan progress states
  const [scanProgress, setScanProgress] = useState(0);
  const [scanTotal, setScanTotal] = useState(0);
  const [scanCurrent, setScanCurrent] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('');
  const scanCancelledRef = React.useRef(false);

  const handleCancelScan = () => {
    scanCancelledRef.current = true;
    setScanStatusText("Cancelling scan...");
  };

  // Pagination & deletion states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedPages, setSelectedPages] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState('single'); // 'single' or 'bulk'
  const [targetId, setTargetId] = useState(null);

  // Sorting state
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState({
    url: true,
    title: true,
    postType: true,
    score: true,
    errors: true,
    warnings: true,
    inboundLinks: false,
    outboundLinks: false,
    createdDate: true,
  });
  const [anchorElColumnMenu, setAnchorElColumnMenu] = useState(null);
  const openColumnMenu = Boolean(anchorElColumnMenu);

  const handleColumnMenuClick = (event) => {
    setAnchorElColumnMenu(event.currentTarget);
  };
  const handleColumnMenuClose = () => {
    setAnchorElColumnMenu(null);
  };

  const handleToggleColumn = (column) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const navigate = useNavigate();

  // Dynamically extract unique post types from loaded data
  const uniquePostTypes = useMemo(() => {
    const types = new Set(pages.map(p => (p.post_type || 'post').toLowerCase()));
    return Array.from(types).sort();
  }, [pages]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const summaryData = await getSummary();
      const pagesData = await getPages();
      setSummary(summaryData);
      
      // Coerce page_id fields to standard JS Numbers to prevent type mismatches (string vs number)
      const normalizedPages = (pagesData.pages || []).map(p => ({
        ...p,
        page_id: Number(p.page_id)
      }));
      
      setPages(normalizedPages);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScan = async () => {
    scanCancelledRef.current = false;
    setScanning(true);
    setScanProgress(0);
    setScanCurrent(0);
    setScanTotal(0);
    setScanStatusText("Initializing audit...");

    try {
      // 1. Fetch settings to get crawl interval
      const settingsData = await getSettings();
      const delayMs = settingsData && settingsData.crawlInterval ? settingsData.crawlInterval * 1000 : 2000;

      // 2. Fetch all publish page IDs
      const pagesToScanResponse = await getPagesToScan();
      const allIds = pagesToScanResponse.ids || [];
      
      if (allIds.length === 0) {
        setScanStatusText("No pages found to audit.");
        await new Promise(r => setTimeout(r, 1500));
        setScanning(false);
        return;
      }

      setScanTotal(allIds.length);
      setScanStatusText(`Preparing audit for ${allIds.length} pages...`);

      // 3. Scan in batches of 2
      const batchSize = 2;
      let completed = 0;

      for (let i = 0; i < allIds.length; i += batchSize) {
        // Check if user cancelled
        if (scanCancelledRef.current) {
          setScanStatusText("Audit cancelled by user.");
          break;
        }

        const batch = allIds.slice(i, i + batchSize);
        setScanStatusText(`Auditing pages ${i + 1}-${Math.min(i + batchSize, allIds.length)} of ${allIds.length}...`);
        
        await triggerScan(batch);
        
        completed += batch.length;
        setScanCurrent(completed);
        setScanProgress(Math.min(100, Math.round((completed / allIds.length) * 100)));

        // If there's another batch, respect crawlInterval
        if (i + batchSize < allIds.length) {
          // Wait in small steps so cancellation is responsive during the delay
          const delayStep = 250; // check every 250ms
          const steps = Math.ceil(delayMs / delayStep);
          for (let step = 0; step < steps; step++) {
            if (scanCancelledRef.current) {
              break;
            }
            setScanStatusText(`Auditing page ${completed} of ${allIds.length}... Delaying next request for ${Math.max(0, ((delayMs - (step * delayStep)) / 1000).toFixed(1))}s...`);
            await new Promise(r => setTimeout(r, delayStep));
          }
        }
      }

      if (scanCancelledRef.current) {
        setScanStatusText("Audit cancelled.");
      } else {
        setScanStatusText("Audit complete! Sending email reports...");
        try {
          await triggerScanComplete();
        } catch (emailErr) {
          console.error("Failed to send scan completion email:", emailErr);
        }
        setScanStatusText("Audit complete! Updating dashboard...");
      }

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error("Scan failed:", error);
      setScanStatusText("Scan failed. Check console logs.");
    } finally {
      // Let the status message rest so the user can read the result
      await new Promise(r => setTimeout(r, 2000));
      setScanning(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreBgClass = (score) => {
    if (score >= 90) return 'metric-card-success';
    if (score >= 70) return 'metric-card-indigo';
    return 'metric-card-pink';
  };

  // Sorting logic
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const descendingComparator = (a, b, orderBy) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];
    
    // Handle string comparisons case-insensitively if possible
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    // Handle potential nulls or undefined
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';

    if (bValue < aValue) {
      return -1;
    }
    if (bValue > aValue) {
      return 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  // Perform dynamic interactive filtering
  let filteredPages = pages.filter(page => {
    const matchesSearch = page.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          page.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesScore = true;
    if (scoreFilter === 'excellent') {
      matchesScore = page.seo_score >= 90;
    } else if (scoreFilter === 'warning') {
      matchesScore = page.seo_score >= 70 && page.seo_score < 90;
    } else if (scoreFilter === 'critical') {
      matchesScore = page.seo_score < 70;
    }

    const matchesPostType = postTypeFilter === 'all' || 
      (page.post_type || 'post').toLowerCase() === postTypeFilter;
    
    return matchesSearch && matchesScore && matchesPostType;
  });

  if (orderBy) {
    filteredPages = stableSort(filteredPages, getComparator(order, orderBy));
  }

  const paginatedPages = filteredPages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const isSelected = (id) => {
    return selectedPages.map(Number).includes(Number(id));
  };

  const handleSelectClick = (event, id) => {
    const normalizedId = Number(id);
    setSelectedPages((prev) => {
      const normalizedPrev = prev.map(Number);
      if (normalizedPrev.includes(normalizedId)) {
        return normalizedPrev.filter(item => item !== normalizedId);
      } else {
        return [...normalizedPrev, normalizedId];
      }
    });
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const paginatedIds = paginatedPages.map(p => Number(p.page_id));
      setSelectedPages(prev => {
        const normalizedPrev = prev.map(Number);
        const newSelected = [...normalizedPrev];
        paginatedIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    } else {
      const paginatedIds = paginatedPages.map(p => Number(p.page_id));
      setSelectedPages(prev => {
        const normalizedPrev = prev.map(Number);
        return normalizedPrev.filter(id => !paginatedIds.includes(id));
      });
    }
  };

  const isAllSelectedOnPage = paginatedPages.length > 0 && paginatedPages.every(p => selectedPages.map(Number).includes(Number(p.page_id)));
  const isSomeSelectedOnPage = paginatedPages.length > 0 && paginatedPages.some(p => selectedPages.map(Number).includes(Number(p.page_id))) && !isAllSelectedOnPage;

  const handleRowClick = (event, id) => {
    const target = event.target;
    // Don't toggle selection if clicking on buttons, links, or inputs/checkbox wrappers
    if (
      target.closest('a') ||
      target.closest('button') ||
      target.closest('.MuiIconButton-root') ||
      target.closest('.MuiCheckbox-root')
    ) {
      return;
    }
    handleSelectClick(event, id);
  };

  const handleConfirmDelete = async () => {
    setDeleteConfirmOpen(false);
    setLoading(true);
    try {
      if (deleteType === 'single') {
        await deletePage(targetId);
        setSelectedPages(prev => prev.filter(id => id !== targetId));
      } else {
        await bulkDeletePages(selectedPages);
        setSelectedPages([]);
      }
      await fetchData();
    } catch (error) {
      console.error("Deletion failed:", error);
    }
    setLoading(false);
  };

  const [activeTab, setActiveTab] = useState('site-audit');
  
  // Competitor Audit States
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [auditingCompetitor, setAuditingCompetitor] = useState(false);
  const [competitorResult, setCompetitorResult] = useState(null);
  const [competitorError, setCompetitorError] = useState('');

  const handleCompetitorAudit = async () => {
    if (!competitorUrl) return;
    
    // Simple URL validation
    try {
      new URL(competitorUrl);
    } catch (_) {
      setCompetitorError('Please enter a valid absolute URL (e.g., https://example.com)');
      return;
    }

    setAuditingCompetitor(true);
    setCompetitorError('');
    setCompetitorResult(null);

    try {
      const response = await runCompetitorAudit(competitorUrl);
      if (response && response.success) {
        setCompetitorResult(response);
      } else {
        setCompetitorError(response?.message || 'Competitor audit failed.');
      }
    } catch (err) {
      console.error("Competitor audit API error:", err);
      const message = err.response?.data?.message || err.message || 'An error occurred during competitor audit.';
      setCompetitorError(message);
    } finally {
      setAuditingCompetitor(false);
    }
  };

  return (
    <Box sx={{ fontFamily: 'var(--sans)' }}>
      {/* Dashboard Top Header Banner */}
      <Box 
        className="glass-panel"
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 3, 
          mb: 4,
          borderRadius: '20px'
        }}
      >
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
            SEO Analysis <span className="gradient-text">Overview</span>
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
            Real-time crawler data, performance diagnostic results, and critical optimization summaries.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={fetchData}
            disabled={loading || scanning}
            sx={{
              borderColor: 'var(--border)',
              color: 'var(--text-h)',
              borderRadius: '12px',
              px: 2.5,
              py: 1.2,
              fontFamily: 'var(--sans)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: 'var(--primary)',
                backgroundColor: 'rgba(99, 102, 241, 0.04)'
              }
            }}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            className={`btn-glow ${scanning ? '' : 'btn-pulse'}`}
            startIcon={scanning ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            onClick={handleScan}
            disabled={scanning}
            sx={{
              px: 3.5,
              py: 1.2,
              fontFamily: 'var(--sans)'
            }}
          >
            {scanning ? 'Scanning Workspace...' : 'Run Global Audit'}
          </Button>
        </Box>
      </Box>

      {/* Tabs Switcher */}
      <Box sx={{ borderBottom: '1px solid var(--border)', mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, val) => {
            setActiveTab(val);
            setCompetitorError('');
          }}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--primary)',
              height: '3px',
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTab-root': {
              fontFamily: 'var(--sans)',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--text)',
              textTransform: 'none',
              pb: 1.5,
              '&.Mui-selected': {
                color: 'var(--primary)'
              }
            }
          }}
        >
          <Tab label="Site Audit Overview" value="site-audit" />
          <Tab label="Competitor Analysis" value="competitor-analysis" />
        </Tabs>
      </Box>

      {activeTab === 'site-audit' && (
        <>
          {/* Progress Bar Panel when scanning */}
      {scanning && (
        <Box 
          className="glass-panel" 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: '20px',
            borderLeft: '4px solid var(--primary)',
            background: 'var(--glass-bg)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={20} sx={{ color: 'var(--primary)' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--text-h)', fontFamily: 'var(--sans)' }}>
                {scanStatusText}
              </Typography>
            </Box>
            {scanTotal > 0 && (
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--sans)' }}>
                {scanCurrent} of {scanTotal} Pages Audited ({scanProgress}%)
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flexGrow: 1, height: 8, bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
              <Box 
                sx={{ 
                  height: '100%', 
                  width: `${scanProgress}%`, 
                  bgcolor: 'var(--primary)', 
                  background: 'var(--accent-gradient)',
                  borderRadius: 4, 
                  transition: 'width 0.4s ease' 
                }} 
              />
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancelScan}
              sx={{
                borderColor: 'var(--error)',
                color: 'var(--error)',
                borderRadius: '8px',
                textTransform: 'none',
                fontFamily: 'var(--sans)',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.05)',
                  borderColor: 'var(--error)'
                }
              }}
            >
              Cancel Scan
            </Button>
          </Box>
        </Box>
      )}

      {loading ? (
        <Box className="glass-panel" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8, borderRadius: '20px' }}>
          <CircularProgress sx={{ color: 'var(--primary)' }} />
        </Box>
      ) : (
        <>
          {/* Visual Glass Metrics Grid */}
          <Grid container spacing={3.5} sx={{ mb: 4.5 }}>
            <Grid item xs={12} md={4}>
              <Box className="glass-panel metric-card-indigo" sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box className="metric-icon-bg" sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary)' }}>
                  <PageviewIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'var(--text)', fontWeight: 500, mb: 0.5 }}>
                    Total Pages Scanned
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'var(--text-h)', letterSpacing: '-0.02em' }}>
                    {summary.total_pages}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box className="glass-panel metric-card-pink" sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box className="metric-icon-bg" sx={{ bgcolor: 'rgba(236, 72, 153, 0.08)', color: 'var(--secondary)' }}>
                  <BugReportIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'var(--text)', fontWeight: 500, mb: 0.5 }}>
                    Open SEO Issues
                  </Typography>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800, 
                      color: summary.total_issues > 0 ? "var(--error)" : "var(--text-h)",
                      letterSpacing: '-0.02em',
                      textShadow: summary.total_issues > 0 ? '0 0 12px rgba(239, 68, 68, 0.15)' : 'none'
                    }}
                  >
                    {summary.total_issues}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box className="glass-panel metric-card-success" sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box className="metric-icon-bg" sx={{ bgcolor: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)' }}>
                  <SpeedIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'var(--text)', fontWeight: 500, mb: 0.5 }}>
                    Average SEO Score
                  </Typography>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800, 
                      color: getScoreColor(summary.average_score), 
                      letterSpacing: '-0.02em',
                      textShadow: `0 0 12px ${getScoreColor(summary.average_score)}25`
                    }}
                  >
                    {summary.average_score}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Interactive Search & Category Filter Panel */}
          <Box 
            className="glass-panel"
            sx={{ 
              p: 2.5, 
              mb: 3.5, 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              gap: 2,
              borderRadius: '16px'
            }}
          >
            {/* Search Input Box */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                bgcolor: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                px: 2,
                py: 0.8,
                flexGrow: 1,
                maxWidth: { md: 400 },
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <SearchIcon sx={{ color: 'var(--text)', mr: 1, fontSize: 20 }} />
              <InputBase
                placeholder="Search audited pages..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                sx={{ 
                  flexGrow: 1,
                  fontFamily: 'var(--sans)',
                  fontSize: '0.9rem',
                  color: 'var(--text-h)',
                  width: '100%'
                }}
              />
            </Box>

            {/* Score Filters Pills */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {/* Post Type Filter */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                <FilterListIcon sx={{ fontSize: 18, color: 'var(--text)', opacity: 0.7 }} />
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <Select
                    value={postTypeFilter}
                    onChange={(e) => {
                      setPostTypeFilter(e.target.value);
                      setPage(0);
                    }}
                    displayEmpty
                    sx={{
                      fontFamily: 'var(--sans)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-h)',
                      borderRadius: '10px',
                      height: 38,
                      bgcolor: postTypeFilter !== 'all' ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: postTypeFilter !== 'all' ? 'rgba(99, 102, 241, 0.3)' : 'var(--border)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--primary)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--primary)',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'var(--text)',
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          mt: 0.5,
                          bgcolor: 'var(--glass-bg)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid var(--glass-border)',
                          boxShadow: 'var(--glass-shadow)',
                          borderRadius: '12px',
                          '& .MuiMenuItem-root': {
                            fontFamily: 'var(--sans)',
                            fontSize: '0.85rem',
                            color: 'var(--text-h)',
                            borderRadius: '8px',
                            mx: 0.5,
                            '&:hover': {
                              bgcolor: 'rgba(99, 102, 241, 0.06)',
                            },
                            '&.Mui-selected': {
                              bgcolor: 'rgba(99, 102, 241, 0.1)',
                              fontWeight: 700,
                              '&:hover': {
                                bgcolor: 'rgba(99, 102, 241, 0.14)',
                              },
                            }
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    {uniquePostTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ width: '1px', height: 24, bgcolor: 'var(--border)', mx: 0.5 }} />

              <Typography variant="body2" sx={{ color: 'var(--text)', fontWeight: 600, mr: 1 }}>
                Score:
              </Typography>
              <ButtonGroup 
                variant="outlined" 
                sx={{ 
                  gap: 1,
                  '& .MuiButtonGroup-firstButton, & .MuiButtonGroup-middleButton, & .MuiButtonGroup-lastButton': {
                    border: '1px solid var(--border) !important',
                    borderRadius: '10px !important'
                  }
                }}
              >
                {[
                  { id: 'all', label: 'All Pages' },
                  { id: 'excellent', label: 'Good (90+)', color: 'var(--success)' },
                  { id: 'warning', label: 'Fair (70-89)', color: 'var(--warning)' },
                  { id: 'critical', label: 'Critical (<70)', color: 'var(--error)' }
                ].map((pill) => {
                  const isActive = scoreFilter === pill.id;
                  return (
                    <Button
                      key={pill.id}
                      onClick={() => {
                        setScoreFilter(pill.id);
                        setPage(0);
                      }}
                      sx={{
                        textTransform: 'none',
                        fontFamily: 'var(--sans)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.85rem',
                        px: 2,
                        py: 0.7,
                        bgcolor: isActive ? 'var(--text-h)' : 'transparent',
                        color: isActive ? 'var(--bg)' : 'var(--text)',
                        borderColor: 'var(--border)',
                        '&:hover': {
                          bgcolor: isActive ? 'var(--text-h)' : 'rgba(99, 102, 241, 0.04)',
                          borderColor: 'var(--border)'
                        }
                      }}
                    >
                      {pill.label}
                    </Button>
                  );
                })}
              </ButtonGroup>

              {/* Column Visibility Toggle */}
              <Tooltip title="Show/Hide Columns" arrow>
                <IconButton
                  onClick={handleColumnMenuClick}
                  sx={{
                    ml: 1,
                    color: openColumnMenu ? 'var(--primary)' : 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    bgcolor: openColumnMenu ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(99, 102, 241, 0.04)',
                      borderColor: 'var(--border)'
                    }
                  }}
                >
                  <ViewColumnIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorElColumnMenu}
                open={openColumnMenu}
                onClose={handleColumnMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    bgcolor: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)',
                    borderRadius: '12px',
                    '& .MuiMenuItem-root': {
                      fontFamily: 'var(--sans)',
                      fontSize: '0.9rem',
                      color: 'var(--text-h)',
                    }
                  }
                }}
              >
                {[
                  { id: 'url', label: 'Page URL' },
                  { id: 'title', label: 'Page Title' },
                  { id: 'postType', label: 'Post Type' },
                  { id: 'score', label: 'Score' },
                  { id: 'errors', label: 'Errors' },
                  { id: 'warnings', label: 'Warnings' },
                  { id: 'inboundLinks', label: 'Inbound Links' },
                  { id: 'outboundLinks', label: 'Outbound Links' },
                  { id: 'createdDate', label: 'Date' }
                ].map((col) => (
                  <MenuItem key={col.id} onClick={() => handleToggleColumn(col.id)}>
                    <ListItemIcon>
                      <Checkbox
                        checked={columnVisibility[col.id]}
                        disableRipple
                        size="small"
                        sx={{
                          p: 0,
                          color: 'var(--border)',
                          '&.Mui-checked': { color: 'var(--primary)' }
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={col.label} />
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>

          {/* Bulk Action Bar */}
          {selectedPages.length > 0 && (
            <Box 
              className="glass-panel" 
              sx={{ 
                p: 2, 
                mb: 2.5, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderRadius: '16px',
                bgcolor: 'rgba(239, 68, 68, 0.03)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                boxShadow: '0 4px 20px 0 rgba(239, 68, 68, 0.05)',
                transition: 'all 0.3s ease'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="subtitle2" sx={{ color: 'var(--error)', fontWeight: 700, fontFamily: 'var(--sans)' }}>
                  {selectedPages.length} {selectedPages.length === 1 ? 'page' : 'pages'} selected
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
                  for bulk deletion.
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => { setDeleteType('bulk'); setDeleteConfirmOpen(true); }}
                startIcon={<DeleteIcon />}
                sx={{
                  textTransform: 'none',
                  fontFamily: 'var(--sans)',
                  fontWeight: 600,
                  borderRadius: '10px',
                  bgcolor: 'var(--error)',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.3)',
                  '&:hover': {
                    bgcolor: '#dc2626',
                    boxShadow: '0 6px 20px 0 rgba(239, 68, 68, 0.4)'
                  }
                }}
              >
                Delete Selected
              </Button>
            </Box>
          )}

          {/* Interactive Audited Pages Table */}
          <TableContainer 
            className="glass-panel custom-scrollbar" 
            sx={{ 
              borderRadius: '20px', 
              overflow: 'auto',
              boxShadow: 'var(--glass-shadow)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border)' }}>
                  <TableCell padding="checkbox" sx={{ py: 2, pl: 2 }}>
                    <Checkbox
                      color="primary"
                      indeterminate={isSomeSelectedOnPage}
                      checked={isAllSelectedOnPage}
                      onChange={handleSelectAllClick}
                      inputProps={{ 'aria-label': 'select all pages' }}
                      sx={{
                        color: 'var(--border)',
                        '&.Mui-checked': {
                          color: 'var(--primary)',
                        },
                        '&.MuiCheckbox-indeterminate': {
                          color: 'var(--primary)',
                        }
                      }}
                    />
                  </TableCell>
                  {columnVisibility.url && (
                    <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)', py: 2 }}>
                      <TableSortLabel
                        active={orderBy === 'url'}
                        direction={orderBy === 'url' ? order : 'asc'}
                        onClick={() => handleRequestSort('url')}
                      >
                        Page URL
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {columnVisibility.title && (
                    <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)', py: 2 }}>
                      <TableSortLabel
                        active={orderBy === 'title'}
                        direction={orderBy === 'title' ? order : 'asc'}
                        onClick={() => handleRequestSort('title')}
                      >
                        Page Title
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {columnVisibility.postType && (
                    <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)', py: 2 }}>
                      <TableSortLabel
                        active={orderBy === 'post_type'}
                        direction={orderBy === 'post_type' ? order : 'asc'}
                        onClick={() => handleRequestSort('post_type')}
                      >
                        Post Type
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {columnVisibility.score && (
                    <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)', py: 2 }}>
                      <TableSortLabel
                        active={orderBy === 'seo_score'}
                        direction={orderBy === 'seo_score' ? order : 'asc'}
                        onClick={() => handleRequestSort('seo_score')}
                      >
                        Score
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {columnVisibility.errors && (
                    <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)', py: 2 }}>
                      <TableSortLabel
                        active={orderBy === 'errors_count'}
                        direction={orderBy === 'errors_count' ? order : 'asc'}
                        onClick={() => handleRequestSort('errors_count')}
                      >
                        Errors
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {columnVisibility.warnings && (
                    <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)', py: 2 }}>
                      <TableSortLabel
                        active={orderBy === 'warnings_count'}
                        direction={orderBy === 'warnings_count' ? order : 'asc'}
                        onClick={() => handleRequestSort('warnings_count')}
                      >
                        Warnings
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {columnVisibility.inboundLinks && (
                    <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)', py: 2 }}>
                      <TableSortLabel
                        active={orderBy === 'internal_links'}
                        direction={orderBy === 'internal_links' ? order : 'asc'}
                        onClick={() => handleRequestSort('internal_links')}
                      >
                        Inbound Links
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {columnVisibility.outboundLinks && (
                    <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)', py: 2 }}>
                      <TableSortLabel
                        active={orderBy === 'external_links'}
                        direction={orderBy === 'external_links' ? order : 'asc'}
                        onClick={() => handleRequestSort('external_links')}
                      >
                        Outbound Links
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {columnVisibility.createdDate && (
                    <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)', py: 2 }}>
                      <TableSortLabel
                        active={orderBy === 'post_date'}
                        direction={orderBy === 'post_date' ? order : 'asc'}
                        onClick={() => handleRequestSort('post_date')}
                      >
                        Date
                      </TableSortLabel>
                    </TableCell>
                  )}
                  <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)', py: 2 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPages.length > 0 ? (
                  paginatedPages.map((row) => {
                    const isItemSelected = isSelected(row.page_id);
                    return (
                      <TableRow 
                        key={row.page_id} 
                        className="smooth-table-row"
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        selected={isItemSelected}
                        onClick={(event) => handleRowClick(event, row.page_id)}
                        sx={{ 
                          borderBottom: '1px solid var(--border)', 
                          '&:last-child': { borderBottom: 0 },
                          '&.Mui-selected': {
                            bgcolor: 'rgba(99, 102, 241, 0.04) !important',
                            '&:hover': {
                              bgcolor: 'rgba(99, 102, 241, 0.08) !important',
                            }
                          }
                        }}
                      >
                        <TableCell padding="checkbox" sx={{ py: 2, pl: 2 }}>
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            onChange={(event) => handleSelectClick(event, row.page_id)}
                            onClick={(event) => event.stopPropagation()}
                            inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${row.page_id}` }}
                            sx={{
                              color: 'var(--border)',
                              '&.Mui-checked': {
                                color: 'var(--primary)',
                              }
                            }}
                          />
                        </TableCell>
                        {columnVisibility.url && (
                          <TableCell sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', py: 2 }}>
                            <a 
                              href={row.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
                              title={row.url}
                            >
                              {row.url} <LaunchIcon sx={{ fontSize: 13, ml: 0.3, verticalAlign: 'middle', opacity: 0.7 }} />
                            </a>
                          </TableCell>
                        )}
                        {columnVisibility.title && (
                          <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 500, color: 'var(--text-h)', py: 2 }}>{row.title || <span style={{ opacity: 0.5 }}>Untitled Page</span>}</TableCell>
                        )}
                        {columnVisibility.postType && (
                          <TableCell sx={{ py: 2 }}>
                            <span 
                              style={{
                                background: row.post_type === 'page' 
                                  ? 'rgba(99, 102, 241, 0.1)' 
                                  : row.post_type === 'post'
                                  ? 'rgba(16, 185, 129, 0.1)'
                                  : 'rgba(236, 72, 153, 0.1)',
                                color: row.post_type === 'page' 
                                  ? 'var(--primary)' 
                                  : row.post_type === 'post'
                                  ? 'var(--success)'
                                  : 'var(--secondary)',
                                fontWeight: 600,
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '0.72rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                display: 'inline-block',
                                border: `1px solid ${
                                  row.post_type === 'page' 
                                    ? 'rgba(99, 102, 241, 0.2)' 
                                    : row.post_type === 'post'
                                    ? 'rgba(16, 185, 129, 0.2)'
                                    : 'rgba(236, 72, 153, 0.2)'
                                }`
                              }}
                            >
                              {row.post_type || 'post'}
                            </span>
                          </TableCell>
                        )}
                        {columnVisibility.score && (
                          <TableCell align="center" sx={{ py: 2 }}>
                            <span 
                              style={{
                                background: `linear-gradient(135deg, ${getScoreColor(row.seo_score)}f0 0%, ${getScoreColor(row.seo_score)}b0 100%)`,
                                color: '#ffffff',
                                fontWeight: 700,
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                display: 'inline-block',
                                boxShadow: `0 3px 10px 0 ${getScoreColor(row.seo_score)}30`,
                                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                              }}
                            >
                              {row.seo_score}%
                            </span>
                          </TableCell>
                        )}
                        {columnVisibility.errors && (
                          <TableCell align="center" sx={{ fontFamily: 'var(--mono)', fontWeight: 600, color: row.errors_count > 0 ? 'var(--error)' : 'var(--text)', py: 2 }}>
                            {row.errors_count}
                          </TableCell>
                        )}
                        {columnVisibility.warnings && (
                          <TableCell align="center" sx={{ fontFamily: 'var(--mono)', fontWeight: 600, color: row.warnings_count > 0 ? 'var(--warning)' : 'var(--text)', py: 2 }}>
                            {row.warnings_count}
                          </TableCell>
                        )}
                        {columnVisibility.inboundLinks && (
                          <TableCell align="center" sx={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--text)', py: 2 }}>
                            {row.internal_links || 0}
                          </TableCell>
                        )}
                        {columnVisibility.outboundLinks && (
                          <TableCell align="center" sx={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--text)', py: 2 }}>
                            {row.external_links || 0}
                          </TableCell>
                        )}
                        {columnVisibility.createdDate && (
                          <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 500, color: 'var(--text)', py: 2, whiteSpace: 'nowrap' }}>
                            {row.post_date ? new Date(row.post_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                          </TableCell>
                        )}
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              onClick={() => navigate(`/page/${row.page_id}`)}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontFamily: 'var(--sans)',
                                fontWeight: 600,
                                borderColor: 'var(--border)',
                                color: 'var(--text)',
                                '&:hover': {
                                  borderColor: 'var(--primary)',
                                  color: 'var(--primary)',
                                  backgroundColor: 'rgba(99, 102, 241, 0.04)',
                                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.1)'
                                }
                              }}
                            >
                              View Details
                            </Button>
                            <Tooltip title="Delete Page & Audit Logs" arrow>
                              <IconButton
                                size="small"
                                onClick={() => { setTargetId(row.page_id); setDeleteType('single'); setDeleteConfirmOpen(true); }}
                                sx={{
                                  color: 'var(--text)',
                                  borderRadius: '8px',
                                  border: '1px solid var(--border)',
                                  '&:hover': {
                                    color: 'var(--error)',
                                    borderColor: 'rgba(239, 68, 68, 0.2)',
                                    backgroundColor: 'rgba(239, 68, 68, 0.04)'
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography color="var(--text)" sx={{ fontFamily: 'var(--sans)' }}>
                        {pages.length === 0 
                          ? "No pages audited yet. Click 'Run Global Audit' to kick off your first analysis!"
                          : "No matching pages found for your filters. Try adjusting your search query."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredPages.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              color: 'var(--text-h)',
              fontFamily: 'var(--sans)',
              borderBottom: 'none',
              mt: 1.5,
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontFamily: 'var(--sans)',
                fontWeight: 500,
                color: 'var(--text)'
              },
              '& .MuiTablePagination-select': {
                fontFamily: 'var(--sans)',
                fontWeight: 600
              },
              '& .MuiIconButton-root': {
                color: 'var(--text-h)',
                '&.Mui-disabled': {
                  color: 'var(--text)',
                  opacity: 0.3
                }
              }
            }}
          />
        </>
      )}
      </>
      )}

      {/* Competitor Analysis Tab View */}
      {activeTab === 'competitor-analysis' && (
        <Box>
          <Grid container spacing={4}>
            {/* Input Card */}
            <Grid item xs={12}>
              <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text-h)', mb: 1.5, fontFamily: 'var(--sans)' }}>
                  Analyze Competitor Page
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text)', opacity: 0.8, mb: 3, fontFamily: 'var(--sans)' }}>
                  Enter the full URL of a competitor's page to run a live SEO check and compare it side-by-side with your own site's performance.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    placeholder="https://competitor.com/blog-post"
                    fullWidth
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    error={!!competitorError}
                    helperText={competitorError}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontFamily: 'var(--sans)',
                        fontSize: '0.95rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        '& fieldset': { borderColor: 'var(--border)' },
                        '&:hover fieldset': { borderColor: 'var(--primary)' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--primary)', borderWidth: '1px' }
                      },
                      '& .MuiFormHelperText-root': { fontFamily: 'var(--sans)', fontSize: '0.78rem' }
                    }}
                  />
                  <Button
                    variant="contained"
                    className={`btn-glow ${auditingCompetitor ? '' : 'btn-pulse'}`}
                    onClick={handleCompetitorAudit}
                    disabled={auditingCompetitor || !competitorUrl}
                    startIcon={auditingCompetitor ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontFamily: 'var(--sans)',
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {auditingCompetitor ? 'Analyzing URL...' : 'Start Comparison'}
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Audit Results Comparison */}
            {competitorResult && (
              <>
                {/* Score Cards Side-by-Side */}
                <Grid item xs={12} md={6}>
                  <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px', height: '100%' }}>
                    <Typography variant="subtitle2" sx={{ color: 'var(--primary)', fontWeight: 700, mb: 1, fontFamily: 'var(--sans)', textTransform: 'uppercase' }}>
                      Your Site Average
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--text-h)', mb: 3, fontFamily: 'var(--sans)' }}>
                      Performance Scorecard
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                      <Box 
                        sx={{ 
                          width: 90, 
                          height: 90, 
                          borderRadius: '50%', 
                          border: `6px solid ${getScoreColor(summary.average_score)}`, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '24px', 
                          fontWeight: 800, 
                          color: 'var(--text-h)',
                          boxShadow: `0 0 20px ${getScoreColor(summary.average_score)}20`
                        }}
                      >
                        {summary.average_score}%
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'var(--text)', opacity: 0.8, fontFamily: 'var(--sans)' }}>
                          Average of all {summary.total_pages} audited pages across your site.
                        </Typography>
                      </Box>
                    </Box>

                    {/* Issue Breakdown */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', pb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>Average Errors</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--error)', fontFamily: 'var(--sans)' }}>
                          {pages.length ? (pages.reduce((acc, p) => acc + (p.errors_count || 0), 0) / pages.length).toFixed(1) : 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', pb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>Average Warnings</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--warning)', fontFamily: 'var(--sans)' }}>
                          {pages.length ? (pages.reduce((acc, p) => acc + (p.warnings_count || 0), 0) / pages.length).toFixed(1) : 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>Average Notices</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-h)', fontFamily: 'var(--sans)' }}>
                          {pages.length ? (pages.reduce((acc, p) => acc + (p.notices_count || 0), 0) / pages.length).toFixed(1) : 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px', height: '100%' }}>
                    <Typography variant="subtitle2" sx={{ color: 'var(--secondary)', fontWeight: 700, mb: 1, fontFamily: 'var(--sans)', textTransform: 'uppercase' }}>
                      Competitor Page
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--text-h)', mb: 3, fontFamily: 'var(--sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={competitorResult.url}>
                      {competitorResult.url}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                      <Box 
                        sx={{ 
                          width: 90, 
                          height: 90, 
                          borderRadius: '50%', 
                          border: `6px solid ${getScoreColor(competitorResult.seo_score)}`, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '24px', 
                          fontWeight: 800, 
                          color: 'var(--text-h)',
                          boxShadow: `0 0 20px ${getScoreColor(competitorResult.seo_score)}20`
                        }}
                      >
                        {competitorResult.seo_score}%
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'var(--text)', opacity: 0.8, fontFamily: 'var(--sans)' }}>
                          {competitorResult.seo_score > summary.average_score 
                            ? 'This page currently outscores your website average. Review their setup below to improve.' 
                            : 'You are currently outperforming this competitor page on average! Keep it up.'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Issue Breakdown */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', pb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>Errors</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--error)', fontFamily: 'var(--sans)' }}>
                          {competitorResult.errors_count}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', pb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>Warnings</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--warning)', fontFamily: 'var(--sans)' }}>
                          {competitorResult.warnings_count}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>Notices</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-h)', fontFamily: 'var(--sans)' }}>
                          {competitorResult.notices_count}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                {/* Competitor Page Issues Details */}
                <Grid item xs={12}>
                  <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text-h)', mb: 3, fontFamily: 'var(--sans)' }}>
                      Competitor SEO Audit Log & Beat-Them Strategy
                    </Typography>

                    {competitorResult.issues && competitorResult.issues.length > 0 ? (
                      <TableContainer>
                        <Table sx={{ minWidth: 600 }}>
                          <TableHead>
                            <TableRow sx={{ borderBottom: '1px solid var(--border)' }}>
                              <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)' }}>Issue Type</TableCell>
                              <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)' }}>Severity</TableCell>
                              <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)' }}>Details</TableCell>
                              <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)' }}>Strategy to Outrank</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {competitorResult.issues.map((issue, index) => {
                              // Beat them strategy mapper
                              let strategy = "Ensure your page is correctly optimized for this aspect.";
                              if (issue.type === 'missing_title') {
                                strategy = "Make sure all your pages have clean, keyword-rich titles between 40-60 characters.";
                              } else if (issue.type === 'short_title' || issue.type === 'long_title') {
                                strategy = "Write an optimal length title (40-60 characters) with your main keyword at the beginning.";
                              } else if (issue.type === 'missing_meta_desc') {
                                strategy = "Write a compelling meta description between 120-160 characters containing your focus keyword.";
                              } else if (issue.type === 'short_meta_desc' || issue.type === 'long_meta_desc') {
                                strategy = "Write an optimized description (120-160 characters) with a clear call-to-action.";
                              } else if (issue.type === 'missing_h1' || issue.type === 'multiple_h1') {
                                strategy = "Ensure your target page contains exactly one clear <h1> header defining the main topic.";
                              } else if (issue.type === 'missing_img_alt') {
                                strategy = "Use descriptive keywords in your image 'alt' tags; this competitor misses them, giving you an edge in Image Search.";
                              } else if (issue.type === 'broken_link') {
                                strategy = "Perform periodic link sweeps to keep internal/external links healthy. Broken links ruin competitor authority.";
                              } else if (issue.type === 'no_internal_links') {
                                strategy = "Link to other relevant pages on your site to pass Link Juice. Competitor lacks internal linkage structure.";
                              } else if (issue.type === 'low_word_count') {
                                strategy = "Write deep, helpful content (aim for 1000+ words). Competitor page content is thin.";
                              } else if (issue.type === 'missing_schema') {
                                strategy = "Deploy Schema.org JSON-LD (handled automatically by our hooks engine) to secure Rich Snippets.";
                              } else if (issue.type === 'missing_canonical') {
                                strategy = "Verify your canonical tags are outputting correctly (default in our plugin) to prevent duplicate content hits.";
                              }

                              return (
                                <TableRow key={index} sx={{ borderBottom: '1px solid var(--border)', '&:last-child': { borderBottom: 0 } }}>
                                  <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)' }}>
                                    {issue.type ? issue.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'General Audit Check'}
                                  </TableCell>
                                  <TableCell>
                                    <span 
                                      style={{
                                        color: issue.severity === 'Error' ? 'var(--error)' : issue.severity === 'Warning' ? 'var(--warning)' : 'var(--text)',
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      {issue.severity || 'Notice'}
                                    </span>
                                  </TableCell>
                                  <TableCell sx={{ fontFamily: 'var(--sans)', color: 'var(--text)' }}>
                                    {issue.details}
                                  </TableCell>
                                  <TableCell sx={{ fontFamily: 'var(--sans)', color: 'var(--primary)', fontWeight: 500, fontStyle: 'italic' }}>
                                    💡 {strategy}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ py: 2, textAlign: 'center' }}>
                        <Typography sx={{ color: 'var(--success)', fontWeight: 600, fontFamily: 'var(--sans)' }}>
                          🎉 Excellent! This competitor page has 0 open SEO issues. To beat them, focus on deep backlinking and content quality.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      )}

      {/* Premium Glass Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        container={() => document.getElementById('frank-seo-audit-root')}
        PaperProps={{
          sx: {
            bgcolor: 'var(--bg)',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--glass-shadow)',
            maxWidth: '440px',
            p: 1.5
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
        <DialogTitle 
          sx={{ 
            fontFamily: 'var(--sans)', 
            fontWeight: 800, 
            color: 'var(--text-h)',
            fontSize: '1.25rem',
            pb: 1
          }}
        >
          Confirm Permanent Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            sx={{ 
              fontFamily: 'var(--sans)', 
              color: 'var(--text)',
              fontSize: '0.95rem',
              lineHeight: 1.6
            }}
          >
            {deleteType === 'single' 
              ? 'Are you sure you want to permanently delete this audited page? This will also purge all associated SEO crawl issues and change histories.'
              : `Are you sure you want to permanently delete the ${selectedPages.length} selected audited pages? This will also purge all their associated SEO crawl issues and change histories.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1.5 }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{
              textTransform: 'none',
              fontFamily: 'var(--sans)',
              fontWeight: 600,
              color: 'var(--text)',
              borderRadius: '8px',
              px: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.06)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            autoFocus
            sx={{
              textTransform: 'none',
              fontFamily: 'var(--sans)',
              fontWeight: 600,
              bgcolor: 'var(--error)',
              color: '#ffffff',
              borderRadius: '8px',
              px: 2.5,
              '&:hover': {
                bgcolor: '#dc2626'
              }
            }}
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard;

