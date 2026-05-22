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
  FormControl
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

import { getSummary, getPages, triggerScan, deletePage, bulkDeletePages } from '../api';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [summary, setSummary] = useState({ total_pages: 0, total_issues: 0, average_score: 0 });
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all'); // 'all', 'excellent', 'warning', 'critical'
  const [postTypeFilter, setPostTypeFilter] = useState('all');
  
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
    setScanning(true);
    try {
      await triggerScan();
      await fetchData(); // Refresh data after scan
    } catch (error) {
      console.error("Scan failed:", error);
    }
    setScanning(false);
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

      {/* Premium Glass Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
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

