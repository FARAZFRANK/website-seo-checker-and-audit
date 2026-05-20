import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Grid
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getHistory } from '../api';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setHistory(data.history || []);
    } catch (error) {
      console.error("Failed to fetch history data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Error': return 'var(--error)';
      case 'Warning': return 'var(--warning)';
      case 'Notice': return 'var(--primary)';
      default: return 'var(--text)';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'Error': return 'rgba(239, 68, 68, 0.12)';
      case 'Warning': return 'rgba(245, 158, 11, 0.12)';
      case 'Notice': return 'rgba(59, 130, 246, 0.12)';
      default: return 'rgba(148, 163, 184, 0.12)';
    }
  };

  const getSeverityBorder = (severity) => {
    switch (severity) {
      case 'Error': return 'rgba(239, 68, 68, 0.2)';
      case 'Warning': return 'rgba(245, 158, 11, 0.2)';
      case 'Notice': return 'rgba(59, 130, 246, 0.2)';
      default: return 'rgba(148, 163, 184, 0.2)';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Fixed': return 'var(--success)';
      case 'Ignored': return 'var(--warning)';
      case 'Open': return 'var(--primary)';
      default: return 'var(--text)';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'Fixed': return 'rgba(16, 185, 129, 0.12)';
      case 'Ignored': return 'rgba(245, 158, 11, 0.12)';
      case 'Open': return 'rgba(99, 102, 241, 0.12)';
      default: return 'rgba(148, 163, 184, 0.12)';
    }
  };

  const getStatusBorder = (status) => {
    switch (status) {
      case 'Fixed': return 'rgba(16, 185, 129, 0.2)';
      case 'Ignored': return 'rgba(245, 158, 11, 0.2)';
      case 'Open': return 'rgba(99, 102, 241, 0.2)';
      default: return 'rgba(148, 163, 184, 0.2)';
    }
  };

  return (
    <Box sx={{ fontFamily: 'var(--sans)' }}>
      {/* Premium Header Banner */}
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
          <HistoryIcon sx={{ fontSize: 28 }} />
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
            Audit <span className="gradient-text">Actions History</span>
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
            Track logs of issue corrections, exceptions ignored, and state updates across all audited pages.
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box className="glass-panel" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8, borderRadius: '20px' }}>
          <CircularProgress sx={{ color: 'var(--primary)' }} />
        </Box>
      ) : history.length === 0 ? (
        <Box className="glass-panel" sx={{ p: 5, borderRadius: '20px', textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)', fontWeight: 500, mb: 1 }}>
            No audit log entries recorded yet.
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text)', opacity: 0.8, fontFamily: 'var(--sans)', maxWidth: '480px', mx: 'auto' }}>
            Once you change the resolution status of any crawlers' discovered issue (e.g. marking an Error as Ignored or Fixed), the change log will be captured here.
          </Typography>
        </Box>
      ) : (
        /* History Glass Panel Container */
        <TableContainer className="glass-panel" sx={{ borderRadius: '20px', overflow: 'hidden', mb: 5 }}>
          <Table aria-label="audit actions history table">
            <TableHead sx={{ background: 'rgba(99, 102, 241, 0.03)' }}>
              <TableRow>
                <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><EventNoteIcon sx={{ fontSize: 16 }} /> Date & Time</Box></TableCell>
                <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>Page</TableCell>
                <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>Issue Details</TableCell>
                <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>Action</TableCell>
                <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}>Status Transition</TableCell>
                <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', py: 2 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PersonOutlineIcon sx={{ fontSize: 16 }} /> Changed By</Box></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((row) => (
                <TableRow key={row.history_id} className="smooth-table-row">
                  {/* Timestamp */}
                  <TableCell sx={{ fontFamily: 'var(--sans)', color: 'var(--text-h)', fontSize: '0.85rem' }}>
                    {new Date(row.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </TableCell>
                  
                  {/* Page Title */}
                  <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', maxWidth: 220, wordBreak: 'break-word' }}>
                    {row.page_title || `Page ID: ${row.page_id}`}
                  </TableCell>
                  
                  {/* Issue Type & Severity */}
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      <span 
                        style={{
                          backgroundColor: getSeverityBg(row.severity),
                          color: getSeverityColor(row.severity),
                          border: `1px solid ${getSeverityBorder(row.severity)}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          fontFamily: 'var(--sans)',
                          alignSelf: 'flex-start'
                        }}
                      >
                        {row.severity === 'Error' ? <ErrorOutlineIcon sx={{ fontSize: 12 }} /> : row.severity === 'Warning' ? <WarningAmberIcon sx={{ fontSize: 12 }} /> : <InfoOutlinedIcon sx={{ fontSize: 12 }} />}
                        {row.severity}
                      </span>
                      <Typography variant="body2" sx={{ fontFamily: 'var(--sans)', fontWeight: 500, color: 'var(--text)' }}>
                        {row.issue_type}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  {/* Action */}
                  <TableCell sx={{ fontFamily: 'var(--sans)', color: 'var(--text)', fontSize: '0.85rem', fontWeight: 500 }}>
                    {row.action}
                  </TableCell>
                  
                  {/* Transition flow */}
                  <TableCell align="center">
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                      {/* Old Value */}
                      <span 
                        style={{
                          backgroundColor: getStatusBg(row.old_value),
                          color: getStatusColor(row.old_value),
                          border: `1px solid ${getStatusBorder(row.old_value)}`,
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          fontFamily: 'var(--sans)'
                        }}
                      >
                        {row.old_value}
                      </span>
                      
                      <TrendingFlatIcon sx={{ color: 'var(--text)', opacity: 0.6, fontSize: 16 }} />
                      
                      {/* New Value */}
                      <span 
                        style={{
                          backgroundColor: getStatusBg(row.new_value),
                          color: getStatusColor(row.new_value),
                          border: `1px solid ${getStatusBorder(row.new_value)}`,
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          fontFamily: 'var(--sans)'
                        }}
                      >
                        {row.new_value}
                      </span>
                    </Box>
                  </TableCell>
                  
                  {/* Changed By User */}
                  <TableCell sx={{ fontFamily: 'var(--sans)', color: 'var(--text-h)', fontWeight: 500 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          bgcolor: 'rgba(99, 102, 241, 0.1)', 
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        {row.user_name.charAt(0).toUpperCase()}
                      </Box>
                      {row.user_name}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default History;
