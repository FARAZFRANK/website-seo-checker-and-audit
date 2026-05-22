import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Box, 
  Button,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  Grid,
  Tabs,
  Tab,
  Snackbar,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LaunchIcon from '@mui/icons-material/Launch';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useParams, useNavigate } from 'react-router-dom';
import { getPageDetails, updateIssueStatus, triggerScan } from '../api';

function PageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ page: null, issues: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [rescanning, setRescanning] = useState(false);
  const [rescanToast, setRescanToast] = useState({ open: false, severity: 'success', message: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const details = await getPageDetails(id);
      setData(details);
    } catch (error) {
      console.error("Failed to fetch page details:", error);
    }
    setLoading(false);
  };

  const handleRescan = async () => {
    setRescanning(true);
    try {
      await triggerScan([parseInt(id)]);
      // Re-fetch fresh data after scan completes
      const details = await getPageDetails(id);
      setData(details);
      setRescanToast({ open: true, severity: 'success', message: 'Page rescanned successfully! Data has been refreshed.' });
    } catch (error) {
      console.error('Rescan failed:', error);
      setRescanToast({ open: true, severity: 'error', message: 'Rescan failed. Please try again.' });
    }
    setRescanning(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStatusChange = async (issueId, newStatus) => {
    setUpdating(issueId);
    try {
      await updateIssueStatus(issueId, newStatus);
      // Update local state
      setData(prev => ({
        ...prev,
        issues: prev.issues.map(issue => 
          issue.issue_id === issueId ? { ...issue, status: newStatus } : issue
        )
      }));
    } catch (error) {
      console.error("Failed to update status:", error);
    }
    setUpdating(null);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--success)';
    if (score >= 70) return 'var(--warning)';
    return 'var(--error)';
  };

  const getStatusBadge = (code) => {
    let bgColor = 'rgba(239, 68, 68, 0.12)';
    let color = 'var(--error)';
    let border = 'rgba(239, 68, 68, 0.2)';
    let text = code === 0 || code === null ? 'Timeout/Error' : code;

    if (code >= 200 && code < 300) {
      bgColor = 'rgba(16, 185, 129, 0.12)';
      color = 'var(--success)';
      border = 'rgba(16, 185, 129, 0.2)';
    } else if (code >= 300 && code < 400) {
      bgColor = 'rgba(245, 158, 11, 0.12)';
      color = 'var(--warning)';
      border = 'rgba(245, 158, 11, 0.2)';
    }

    return (
      <span 
        style={{
          backgroundColor: bgColor,
          color: color,
          border: `1px solid ${border}`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '8px',
          fontSize: '0.78rem',
          fontWeight: 600,
          fontFamily: 'var(--sans)'
        }}
      >
        {text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === '0000-00-00 00:00:00') return '-';
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8, minHeight: '50vh' }}>
        <CircularProgress sx={{ color: 'var(--primary)' }} />
      </Box>
    );
  }

  if (!data.page) {
    return (
      <Box sx={{ p: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/')} 
          sx={{ 
            mb: 3, 
            color: 'var(--text-h)', 
            borderColor: 'var(--border)',
            borderRadius: '12px',
            textTransform: 'none',
            fontFamily: 'var(--sans)',
            fontWeight: 600,
            '&:hover': {
              borderColor: 'var(--primary)',
              backgroundColor: 'rgba(99, 102, 241, 0.04)'
            }
          }}
          variant="outlined"
        >
          Back to Dashboard
        </Button>
        <Box className="glass-panel" sx={{ p: 4, borderRadius: '20px', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: 'var(--error)', fontWeight: 700, fontFamily: 'var(--sans)' }}>
            Page details could not be found.
          </Typography>
        </Box>
      </Box>
    );
  }

  const links = data.links || [];
  const totalLinks = links.length;
  const internalLinks = links.filter(l => l.link_type === 'internal').length;
  const externalLinks = links.filter(l => l.link_type === 'external').length;
  const brokenLinks = links.filter(l => l.status_code === 0 || l.status_code === null || l.status_code >= 400).length;

  return (
    <Box sx={{ fontFamily: 'var(--sans)' }}>
      {/* Navigation Top Row */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/')} 
        sx={{ 
          mb: 3, 
          color: 'var(--text-h)', 
          borderColor: 'var(--border)',
          borderRadius: '12px',
          textTransform: 'none',
          fontFamily: 'var(--sans)',
          fontWeight: 600,
          '&:hover': {
            borderColor: 'var(--primary)',
            backgroundColor: 'rgba(99, 102, 241, 0.04)'
          }
        }}
        variant="outlined"
      >
        Back to Dashboard
      </Button>

      {/* Main Glass Detail Hero Card */}
      <Box 
        className="glass-panel" 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          mb: 4, 
          borderRadius: '20px'
        }}
      >
        <Grid container spacing={4} alignItems="center">
          {/* Left Block - Title & Path */}
          <Grid item xs={12} md={7}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: 'var(--sans)', 
                fontWeight: 800, 
                color: 'var(--text-h)',
                letterSpacing: '-0.02em',
                mb: 1
              }}
            >
              {data.page.title}
            </Typography>
            <Box 
              sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 1, 
                bgcolor: 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(4px)',
                px: 2, 
                py: 0.8, 
                borderRadius: '8px',
                border: '1px solid var(--border)',
                wordBreak: 'break-all'
              }}
            >
              <a 
                href={data.page.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: 'var(--primary)', 
                  textDecoration: 'none', 
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {data.page.url}
                <LaunchIcon sx={{ fontSize: 14 }} />
              </a>
            </Box>

            {/* Rescan Button */}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                className="btn-glow"
                startIcon={rescanning ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                onClick={handleRescan}
                disabled={rescanning}
                sx={{
                  textTransform: 'none',
                  fontFamily: 'var(--sans)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  background: rescanning ? 'rgba(99, 102, 241, 0.5)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.25)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {rescanning ? 'Rescanning...' : 'Rescan This Page'}
              </Button>
            </Box>
          </Grid>

          {/* Right Block - Radial SEO Gauge & Micro Stats */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 3.5 }}>
              {/* Radial Progress Score Container */}
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress 
                  variant="determinate" 
                  value={data.page.seo_score} 
                  size={100}
                  thickness={6}
                  sx={{ 
                    color: getScoreColor(data.page.seo_score),
                    filter: `drop-shadow(0 0 10px ${getScoreColor(data.page.seo_score)}40)`
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography 
                    variant="h5" 
                    component="div" 
                    sx={{ 
                      fontWeight: 800, 
                      color: 'var(--text-h)', 
                      fontFamily: 'var(--sans)',
                      letterSpacing: '-0.03em'
                    }}
                  >
                    {data.page.seo_score}
                  </Typography>
                </Box>
              </Box>

              {/* Counters Column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--error)' }}></span>
                  <strong>Errors:</strong> {data.page.errors_count}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }}></span>
                  <strong>Warnings:</strong> {data.page.warnings_count}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                  <strong>Notices:</strong> {data.page.notices_count}
                </Typography>
              </Box>
              
              {/* Links Column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                  <strong>Inbound (Internal):</strong> {internalLinks}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }}></span>
                  <strong>Outbound (External):</strong> {externalLinks}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--info)' }}></span>
                  <strong>Linked From:</strong> {data.page.linking_from_count || 0} pages
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs System */}
      <Box sx={{ borderBottom: 1, borderColor: 'var(--border)', mb: 3.5 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--primary)',
              height: '3px',
              borderRadius: '3px'
            },
            '& .MuiTab-root': {
              fontFamily: 'var(--sans)',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1.05rem',
              color: 'var(--text)',
              pb: 1.5,
              '&.Mui-selected': {
                color: 'var(--primary)',
              }
            }
          }}
        >
          <Tab label={`SEO Issues (${data.issues.length})`} />
          <Tab label={`Link Analysis (${links.length})`} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <Box>
          <TableContainer className="glass-panel" sx={{ borderRadius: '20px', overflow: 'hidden', mb: 5 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'rgba(99, 102, 241, 0.03)' }}>
                  <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>Type</TableCell>
                  <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>Severity</TableCell>
                  <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>Details</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>Detected On</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>Last Updated</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>Update Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.issues.length > 0 ? (
                  data.issues.map((issue) => (
                    <TableRow key={issue.issue_id} className="smooth-table-row">
                      {/* Type */}
                      <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 500, color: 'var(--text-h)' }}>
                        {issue.issue_type}
                      </TableCell>
                      
                      {/* Severity Badge */}
                      <TableCell>
                        <span 
                          style={{
                            backgroundColor: issue.severity === 'Error' ? 'rgba(239, 68, 68, 0.12)' : issue.severity === 'Warning' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                            color: issue.severity === 'Error' ? 'var(--error)' : issue.severity === 'Warning' ? 'var(--warning)' : 'var(--primary)',
                            border: `1px solid ${issue.severity === 'Error' ? 'rgba(239, 68, 68, 0.2)' : issue.severity === 'Warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            fontFamily: 'var(--sans)'
                          }}
                        >
                          {issue.severity === 'Error' ? <ErrorOutlineIcon sx={{ fontSize: 14 }} /> : issue.severity === 'Warning' ? <WarningAmberIcon sx={{ fontSize: 14 }} /> : <InfoOutlinedIcon sx={{ fontSize: 14 }} />}
                          {issue.severity}
                        </span>
                      </TableCell>
                      
                      {/* Details */}
                      <TableCell sx={{ fontFamily: 'var(--sans)', color: 'var(--text)', maxWidth: '350px' }}>
                        {issue.details}
                      </TableCell>
                      
                      {/* Status Capsule */}
                      <TableCell align="center">
                        <span 
                          style={{
                            backgroundColor: issue.status === 'Fixed' ? 'rgba(16, 185, 129, 0.12)' : issue.status === 'Ignored' ? 'rgba(148, 163, 184, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: issue.status === 'Fixed' ? 'var(--success)' : issue.status === 'Ignored' ? 'var(--text)' : 'var(--error)',
                            border: `1px solid ${issue.status === 'Fixed' ? 'rgba(16, 185, 129, 0.2)' : issue.status === 'Ignored' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            fontFamily: 'var(--sans)'
                          }}
                        >
                          {issue.status === 'Fixed' && <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                          {issue.status}
                        </span>
                      </TableCell>
                      
                      {/* Dates */}
                      <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontSize: '0.85rem', color: 'var(--text)' }}>
                        {formatDate(issue.first_detected_at)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontSize: '0.85rem', color: 'var(--text)' }}>
                        {formatDate(issue.status_updated_at)}
                      </TableCell>
                      
                      {/* Action Dropdown Trigger */}
                      <TableCell align="center">
                        <FormControl size="small" disabled={updating === issue.issue_id}>
                          <Select
                            value={issue.status}
                            onChange={(e) => handleStatusChange(issue.issue_id, e.target.value)}
                            sx={{ 
                              minWidth: 120,
                              borderRadius: '10px',
                              fontFamily: 'var(--sans)',
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--border)',
                              '.MuiOutlinedInput-notchedOutline': {
                                border: 'none'
                              },
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid var(--primary)'
                              },
                              '&.Mui-focused': {
                                border: '1px solid var(--primary)'
                              }
                            }}
                          >
                            <MenuItem value="Open" sx={{ fontFamily: 'var(--sans)', fontSize: '0.85rem' }}>Open</MenuItem>
                            <MenuItem value="Fixed" sx={{ fontFamily: 'var(--sans)', fontSize: '0.85rem' }}>Fixed</MenuItem>
                            <MenuItem value="Ignored" sx={{ fontFamily: 'var(--sans)', fontSize: '0.85rem' }}>Ignored</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)', fontWeight: 500 }}>
                        ✨ No SEO issues found on this page. Exceptional work!
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {/* Link Statistics Dashboard */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Total Links Card */}
            <Grid item xs={6} md={3}>
              <Box className="glass-panel" sx={{ p: 2.5, borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Links
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--text-h)' }}>
                  {totalLinks}
                </Typography>
              </Box>
            </Grid>

            {/* Internal Links Card */}
            <Grid item xs={6} md={3}>
              <Box className="glass-panel" sx={{ p: 2.5, borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: 0.5, borderLeft: '4px solid var(--primary)' }}>
                <Typography variant="caption" sx={{ color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Internal Links
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--text-h)' }}>
                  {internalLinks}
                </Typography>
              </Box>
            </Grid>

            {/* External Links Card */}
            <Grid item xs={6} md={3}>
              <Box className="glass-panel" sx={{ p: 2.5, borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: 0.5, borderLeft: '4px solid var(--secondary)' }}>
                <Typography variant="caption" sx={{ color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  External Links
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--text-h)' }}>
                  {externalLinks}
                </Typography>
              </Box>
            </Grid>

            {/* Broken Links Card */}
            <Grid item xs={6} md={3}>
              <Box 
                className="glass-panel" 
                sx={{ 
                  p: 2.5, 
                  borderRadius: '16px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 0.5, 
                  borderLeft: brokenLinks > 0 ? '4px solid var(--error)' : '4px solid var(--success)',
                  backgroundColor: brokenLinks > 0 ? 'rgba(239, 68, 68, 0.02)' : 'transparent'
                }}
              >
                <Typography variant="caption" sx={{ color: brokenLinks > 0 ? 'var(--error)' : 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Broken Links
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: brokenLinks > 0 ? 'var(--error)' : 'var(--text-h)' }}>
                  {brokenLinks}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Links Details Table */}
          <TableContainer className="glass-panel" sx={{ borderRadius: '20px', overflow: 'hidden', mb: 5 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'rgba(99, 102, 241, 0.03)' }}>
                  <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>URL</TableCell>
                  <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>Anchor Text</TableCell>
                  <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>Type</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {links.length > 0 ? (
                  links.map((link) => (
                    <TableRow key={link.link_id} className="smooth-table-row">
                      {/* URL */}
                      <TableCell sx={{ fontFamily: 'var(--sans)', maxWidth: '300px', wordBreak: 'break-all' }}>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            color: 'var(--primary)', 
                            textDecoration: 'none', 
                            fontWeight: 500,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {link.url}
                          <LaunchIcon sx={{ fontSize: 13 }} />
                        </a>
                      </TableCell>

                      {/* Anchor Text */}
                      <TableCell sx={{ fontFamily: 'var(--sans)', color: 'var(--text-h)', fontWeight: 500 }}>
                        {link.anchor_text ? (
                          link.anchor_text
                        ) : (
                          <em style={{ color: 'var(--text)', opacity: 0.6 }}>[No text]</em>
                        )}
                      </TableCell>

                      {/* Type Badge */}
                      <TableCell>
                        <span 
                          style={{
                            backgroundColor: link.link_type === 'internal' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(168, 85, 247, 0.12)',
                            color: link.link_type === 'internal' ? 'var(--primary)' : 'var(--secondary)',
                            border: `1px solid ${link.link_type === 'internal' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(168, 85, 247, 0.2)'}`,
                            display: 'inline-flex',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            fontFamily: 'var(--sans)',
                            textTransform: 'capitalize'
                          }}
                        >
                          {link.link_type}
                        </span>
                      </TableCell>

                      {/* HTTP Status Badge */}
                      <TableCell align="center">
                        {getStatusBadge(link.status_code)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)', fontWeight: 500 }}>
                        No links were discovered or audited on this page.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Rescan Toast Notification */}
      <Snackbar
        open={rescanToast.open}
        autoHideDuration={4000}
        onClose={() => setRescanToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setRescanToast(prev => ({ ...prev, open: false }))}
          severity={rescanToast.severity}
          sx={{
            borderRadius: '12px',
            fontFamily: 'var(--sans)',
            fontWeight: 600,
            boxShadow: rescanToast.severity === 'success'
              ? '0 8px 32px 0 rgba(16, 185, 129, 0.15)'
              : '0 8px 32px 0 rgba(239, 68, 68, 0.15)',
            border: rescanToast.severity === 'success'
              ? '1px solid rgba(16, 185, 129, 0.25)'
              : '1px solid rgba(239, 68, 68, 0.25)',
          }}
        >
          {rescanToast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PageDetail;
