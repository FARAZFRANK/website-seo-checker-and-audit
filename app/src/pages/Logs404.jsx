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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ShortcutIcon from '@mui/icons-material/Shortcut';
import { get404Logs, delete404Log, clear404Logs, saveRedirect } from '../api';

function Logs404() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Redirect dialog state (when creating redirect from 404 logs)
  const [redirectOpen, setRedirectOpen] = useState(false);
  const [urlFrom, setUrlFrom] = useState('');
  const [urlTo, setUrlTo] = useState('');
  const [status, setStatus] = useState(301);
  const [submittingRedirect, setSubmittingRedirect] = useState(false);

  const fetchLogsData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await get404Logs();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch 404 logs:', err);
      setError('Could not retrieve 404 logs.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogsData();
  }, []);

  const handleOpenRedirectDialog = (url) => {
    setUrlFrom(url);
    setUrlTo('');
    setStatus(301);
    setRedirectOpen(true);
  };

  const handleCloseRedirectDialog = () => {
    setRedirectOpen(false);
    setError('');
  };

  const handleCreateRedirect = async (e) => {
    e.preventDefault();
    setSubmittingRedirect(true);
    setError('');
    try {
      const response = await saveRedirect({
        id: 0,
        url_from: urlFrom,
        url_to: urlTo,
        status: status
      });
      if (response.success) {
        handleCloseRedirectDialog();
        // Option to delete the log now that it's redirected
        const logEntry = logs.find(log => log.url === urlFrom);
        if (logEntry) {
          await delete404Log(logEntry.id);
        }
        fetchLogsData();
      }
    } catch (err) {
      console.error('Failed to create redirect:', err);
      setError(err.response?.data?.message || 'Error occurred while creating redirect.');
    }
    setSubmittingRedirect(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this 404 log entry?')) {
      return;
    }
    try {
      const response = await delete404Log(id);
      if (response.success) {
        fetchLogsData();
      }
    } catch (err) {
      console.error('Failed to delete log:', err);
      setError('Could not delete log entry.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all 404 logs? This cannot be undone.')) {
      return;
    }
    try {
      const response = await clear404Logs();
      if (response.success) {
        fetchLogsData();
      }
    } catch (err) {
      console.error('Failed to clear logs:', err);
      setError('Could not clear 404 logs.');
    }
  };

  return (
    <Box sx={{ fontFamily: 'var(--sans)' }}>
      {/* Banner */}
      <Box
        className="glass-panel"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3.5,
          mb: 4.5,
          borderRadius: '20px'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box className="metric-icon-bg" sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', color: 'var(--error)', mr: 2.5 }}>
            <ReportProblemIcon sx={{ fontSize: 28 }} />
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
              404 <span className="gradient-text">Error Monitor</span>
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
              Monitor broken links and missing assets. Instantly convert hits into redirects to restore traffic.
            </Typography>
          </Box>
        </Box>
        {logs.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<ClearAllIcon />}
            onClick={handleClearAll}
            sx={{
              fontFamily: 'var(--sans)',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--error)',
              px: 3,
              py: 1.2,
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.04)',
                border: '1px solid var(--error)'
              }
            }}
          >
            Clear All Logs
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontFamily: 'var(--sans)' }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box className="glass-panel" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8, borderRadius: '20px' }}>
          <CircularProgress sx={{ color: 'var(--primary)' }} />
        </Box>
      ) : logs.length === 0 ? (
        <Box className="glass-panel" sx={{ p: 5, borderRadius: '20px', textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)', fontWeight: 500, mb: 1 }}>
            No 404 hits logged.
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text)', opacity: 0.8, fontFamily: 'var(--sans)', maxWidth: '480px', mx: 'auto' }}>
            When visitors request invalid paths or broken links on your site, they will be captured and reported here.
          </Typography>
        </Box>
      ) : (
        <TableContainer className="glass-panel" sx={{ borderRadius: '20px', overflow: 'hidden', mb: 5 }}>
          <Table>
            <TableHead sx={{ background: 'rgba(239, 68, 68, 0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)' }}>Request Path (404)</TableCell>
                <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)' }}>Referer</TableCell>
                <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)', maxWidth: 200 }}>User Agent</TableCell>
                <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)' }}>Hits</TableCell>
                <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)' }}>Last Hit</TableCell>
                <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((row) => (
                <TableRow key={row.id} className="smooth-table-row">
                  <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)' }}>{row.url}</TableCell>
                  <TableCell sx={{ fontFamily: 'var(--sans)', color: 'var(--text)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    {row.referer || <span style={{ opacity: 0.5 }}>Direct Traffic</span>}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'var(--sans)', color: 'var(--text)', fontSize: '0.75rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.user_agent}>
                    {row.user_agent}
                  </TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)' }}>{row.hits}</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'var(--sans)', color: 'var(--text)', fontSize: '0.85rem' }}>
                    {new Date(row.last_hit).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<ShortcutIcon />}
                      onClick={() => handleOpenRedirectDialog(row.url)}
                      sx={{
                        fontFamily: 'var(--sans)',
                        textTransform: 'none',
                        fontWeight: 600,
                        color: 'var(--primary)',
                        mr: 1
                      }}
                    >
                      Redirect
                    </Button>
                    <IconButton onClick={() => handleDelete(row.id)} sx={{ color: 'var(--error)' }} title="Delete log">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Redirect Dialog */}
      <Dialog 
        open={redirectOpen} 
        onClose={handleCloseRedirectDialog} 
        container={() => document.getElementById('frank-seo-audit-root')}
        PaperProps={{ 
          sx: { 
            borderRadius: '16px', 
            p: 1,
            bgcolor: 'var(--bg)',
            backgroundImage: 'none',
            border: '1px solid var(--border)'
          } 
        }}
      >
        <form onSubmit={handleCreateRedirect}>
          <DialogTitle sx={{ fontFamily: 'var(--sans)', fontWeight: 800 }}>
            Create Redirection for Broken Link
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: 'var(--text)', mb: 2, fontFamily: 'var(--sans)' }}>
              Set up a redirect to intercept hits to <strong>{urlFrom}</strong> and send visitors to a working page instead.
            </Typography>
            <TextField
              margin="dense"
              label="Source Path (from)"
              fullWidth
              variant="outlined"
              value={urlFrom}
              disabled
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
            <TextField
              margin="dense"
              label="Target Destination (to)"
              placeholder="/new-slug-here/ or https://example.com/page/"
              fullWidth
              variant="outlined"
              value={urlTo}
              onChange={(e) => setUrlTo(e.target.value)}
              required
              helperText="Relative path or absolute URL"
              autoFocus
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
            <FormControl fullWidth variant="outlined" sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}>
              <InputLabel>Redirect Type</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
                label="Redirect Type"
                MenuProps={{ container: () => document.getElementById('frank-seo-audit-root') }}
              >
                <MenuItem value={301}>301 Permanent Redirect</MenuItem>
                <MenuItem value={302}>302 Temporary Redirect</MenuItem>
                <MenuItem value={307}>307 Temporary Redirect</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseRedirectDialog} sx={{ fontFamily: 'var(--sans)', textTransform: 'none', color: 'var(--text)' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingRedirect}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: '#fff',
                fontFamily: 'var(--sans)',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                px: 3
              }}
            >
              {submittingRedirect ? 'Redirecting...' : 'Create Redirect'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Logs404;
