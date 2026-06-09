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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { getRedirects, saveRedirect, deleteRedirect } from '../api';

function Redirects() {
  const [redirects, setRedirects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog form state
  const [open, setOpen] = useState(false);
  const [formId, setFormId] = useState(0);
  const [urlFrom, setUrlFrom] = useState('');
  const [urlTo, setUrlTo] = useState('');
  const [status, setStatus] = useState(301);
  const [submitting, setSubmitting] = useState(false);

  const fetchRedirectsData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRedirects();
      setRedirects(data.redirects || []);
    } catch (err) {
      console.error('Failed to fetch redirects:', err);
      setError('Could not retrieve redirect rules.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRedirectsData();
  }, []);

  const handleOpenDialog = (rule = null) => {
    if (rule) {
      setFormId(rule.id);
      setUrlFrom(rule.url_from);
      setUrlTo(rule.url_to);
      setStatus(rule.status);
    } else {
      setFormId(0);
      setUrlFrom('');
      setUrlTo('');
      setStatus(301);
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await saveRedirect({
        id: formId,
        url_from: urlFrom,
        url_to: urlTo,
        status: status
      });
      if (response.success) {
        handleCloseDialog();
        fetchRedirectsData();
      }
    } catch (err) {
      console.error('Failed to save redirect:', err);
      setError(err.response?.data?.message || 'Error occurred while saving redirect rule.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this redirect rule?')) {
      return;
    }
    try {
      const response = await deleteRedirect(id);
      if (response.success) {
        fetchRedirectsData();
      }
    } catch (err) {
      console.error('Failed to delete redirect:', err);
      setError('Could not delete redirect rule.');
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
          <Box className="metric-icon-bg" sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary)', mr: 2.5 }}>
            <SwapCallsIcon sx={{ fontSize: 28 }} />
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
              SEO <span className="gradient-text">Redirection Manager</span>
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
              Configure 301, 302, and 307 HTTP redirects to handle moved content and prevent user 404s.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: '#fff',
            fontFamily: 'var(--sans)',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '10px',
            px: 3,
            py: 1.2,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)'
            }
          }}
        >
          Add Redirect
        </Button>
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
      ) : redirects.length === 0 ? (
        <Box className="glass-panel" sx={{ p: 5, borderRadius: '20px', textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)', fontWeight: 500, mb: 1 }}>
            No redirect rules configured.
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text)', opacity: 0.8, fontFamily: 'var(--sans)', maxWidth: '480px', mx: 'auto' }}>
            Redirect broken URLs or old paths to active posts, pages, or external URLs.
          </Typography>
        </Box>
      ) : (
        <TableContainer className="glass-panel" sx={{ borderRadius: '20px', overflow: 'hidden', mb: 5 }}>
          <Table>
            <TableHead sx={{ background: 'rgba(99, 102, 241, 0.03)' }}>
              <TableRow>
                <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)' }}>Source Path</TableCell>
                <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)' }}>Target Destination</TableCell>
                <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)' }}>Type</TableCell>
                <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)' }}>Hits</TableCell>
                <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)' }}>Created At</TableCell>
                <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {redirects.map((row) => (
                <TableRow key={row.id} className="smooth-table-row">
                  <TableCell sx={{ fontFamily: 'var(--sans)', fontWeight: 600, color: 'var(--text-h)' }}>{row.url_from}</TableCell>
                  <TableCell sx={{ fontFamily: 'var(--sans)', color: 'var(--text)', wordBreak: 'break-all' }}>{row.url_to}</TableCell>
                  <TableCell align="center">
                    <span
                      style={{
                        backgroundColor: row.status === 301 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                        color: row.status === 301 ? 'var(--success)' : 'var(--primary)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        fontFamily: 'var(--sans)'
                      }}
                    >
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'var(--sans)', fontWeight: 700, color: 'var(--text-h)' }}>{row.hits}</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'var(--sans)', color: 'var(--text)', fontSize: '0.85rem' }}>
                    {new Date(row.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenDialog(row)} sx={{ color: 'var(--primary)' }} title="Edit">
                      <SwapCallsIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(row.id)} sx={{ color: 'var(--error)' }} title="Delete">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={handleCloseDialog} 
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
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontFamily: 'var(--sans)', fontWeight: 800 }}>
            {formId > 0 ? 'Edit Redirect Rule' : 'Add Redirect Rule'}
          </DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Source Path (from)"
              placeholder="/old-slug-here/"
              fullWidth
              variant="outlined"
              value={urlFrom}
              onChange={(e) => setUrlFrom(e.target.value)}
              required
              helperText="Relative path starting with /"
              sx={{ mb: 2, mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
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
            <Button onClick={handleCloseDialog} sx={{ fontFamily: 'var(--sans)', textTransform: 'none', color: 'var(--text)' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
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
              {submitting ? 'Saving...' : 'Save Rule'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Redirects;
