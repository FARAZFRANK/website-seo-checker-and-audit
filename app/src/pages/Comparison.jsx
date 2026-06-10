import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';

function createData(feature, frank, rankMath, yoast, aio, squirrly, framework, engine, siteseo, surerank) {
  return { feature, frank, rankMath, yoast, aio, squirrly, framework, engine, siteseo, surerank };
}

const rows = [
  createData('Metadata & Schema Engine', true, true, true, true, true, true, true, true, true),
  createData('Gutenberg Real-Time Sidebar', true, true, true, true, true, true, true, true, true),
  createData('Dynamic XML Sitemaps', true, true, true, true, true, true, true, true, true),
  createData('Redirects Manager', true, 'Free', 'Premium', 'Premium', 'Premium', 'Premium', 'Free', 'Free', 'Premium'),
  createData('404 Error Monitor', true, 'Premium', 'Premium', 'Premium', 'Premium', 'Free', 'Premium', 'Premium', 'Premium'),
  createData('AI Title & Desc Generator', true, 'Premium', 'Premium', 'Premium', 'Premium', false, 'Premium', 'Premium', 'Premium'),
  createData('Side-by-Side Competitor Audit', true, false, false, false, false, false, false, false, false),
  createData('AI "Beat-Them" Guidelines', true, false, false, false, false, false, false, false, false),
  createData('WooCommerce SEO Integration', true, 'Premium', 'Premium', 'Premium', 'Premium', 'Premium', 'Premium', 'Premium', 'Premium'),
  createData('Local Business SEO (Auto-Schema)', true, 'Premium', 'Premium', 'Premium', 'Premium', 'Premium', 'Premium', 'Premium', 'Premium'),
  createData('Social Media (OpenGraph) Overrides', true, true, true, true, true, true, true, true, true),
  createData('Automated Image Alt Tag SEO', true, 'Premium', 'Premium', 'Premium', 'Premium', false, 'Premium', 'Premium', 'Premium'),
  createData('Advanced FAQ & Custom Schema Builder', true, 'Premium', 'Premium', 'Premium', 'Premium', false, 'Premium', 'Premium', 'Premium'),
  createData('100% Free / No Paywalls', true, false, false, false, false, true, false, false, false),
  createData('Modern React 19 UI', true, false, false, false, false, false, false, false, false),
];

function RenderStatus({ status }) {
  if (status === true) {
    return <CheckCircleIcon sx={{ color: '#10b981' }} />;
  } else if (status === false) {
    return <CancelIcon sx={{ color: '#ef4444' }} />;
  } else if (status === 'Free') {
    return <Chip label="Free" size="small" sx={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.5)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }} variant="outlined" />;
  } else if (status === 'Premium') {
    return <Chip label="Paid Add-on" size="small" sx={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.5)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }} variant="outlined" />;
  }
  return status;
}

function Comparison() {
  return (
    <Box sx={{ width: '100%', pb: 5 }}>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: 'var(--text-h)' }}>
          Frank SEO vs <span className="gradient-text">The Competition</span>
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text)', maxWidth: 800, margin: '0 auto' }}>
          Why pay $99/year for features that should be free? We built Frank SEO to completely disrupt the WordPress SEO industry by giving you advanced AI capabilities and premium features without the paywalls, ads, or bloat.
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: 'none', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1000 }} aria-label="comparison table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', borderBottom: '2px solid var(--border)', color: 'var(--text-h)', width: '22%' }}>Feature</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, fontSize: '1.1rem', borderTop: '2px solid var(--primary)', borderLeft: '2px solid var(--primary)', borderRight: '2px solid var(--primary)', borderBottom: '1px solid rgba(99, 102, 241, 0.2)', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary)', width: '12%', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon fontSize="small" />
                  Frank SEO
                </Box>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, borderBottom: '2px solid var(--border)', color: 'var(--text-h)' }}>Rank Math</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, borderBottom: '2px solid var(--border)', color: 'var(--text-h)' }}>Yoast</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, borderBottom: '2px solid var(--border)', color: 'var(--text-h)' }}>AIO SEO</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, borderBottom: '2px solid var(--border)', color: 'var(--text-h)' }}>Squirrly</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, borderBottom: '2px solid var(--border)', color: 'var(--text-h)' }}>SEO Framework</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, borderBottom: '2px solid var(--border)', color: 'var(--text-h)' }}>SEO Engine</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, borderBottom: '2px solid var(--border)', color: 'var(--text-h)' }}>SiteSEO</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, borderBottom: '2px solid var(--border)', color: 'var(--text-h)' }}>SureRank</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              const isLast = index === rows.length - 1;
              return (
              <TableRow
                key={row.feature}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' } }}
              >
                <TableCell component="th" scope="row" sx={{ fontWeight: 600, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
                  {row.feature}
                </TableCell>
                <TableCell align="center" sx={{ 
                  borderBottom: isLast ? '2px solid var(--primary) !important' : '1px solid rgba(99, 102, 241, 0.2)', 
                  background: 'rgba(99, 102, 241, 0.04)', 
                  borderLeft: '2px solid var(--primary) !important',
                  borderRight: '2px solid var(--primary) !important',
                  borderBottomLeftRadius: isLast ? '8px' : '0',
                  borderBottomRightRadius: isLast ? '8px' : '0'
                }}>
                  <RenderStatus status={row.frank} />
                </TableCell>
                <TableCell align="center" sx={{ borderBottom: '1px solid var(--border)' }}><RenderStatus status={row.rankMath} /></TableCell>
                <TableCell align="center" sx={{ borderBottom: '1px solid var(--border)' }}><RenderStatus status={row.yoast} /></TableCell>
                <TableCell align="center" sx={{ borderBottom: '1px solid var(--border)' }}><RenderStatus status={row.aio} /></TableCell>
                <TableCell align="center" sx={{ borderBottom: '1px solid var(--border)' }}><RenderStatus status={row.squirrly} /></TableCell>
                <TableCell align="center" sx={{ borderBottom: '1px solid var(--border)' }}><RenderStatus status={row.framework} /></TableCell>
                <TableCell align="center" sx={{ borderBottom: '1px solid var(--border)' }}><RenderStatus status={row.engine} /></TableCell>
                <TableCell align="center" sx={{ borderBottom: '1px solid var(--border)' }}><RenderStatus status={row.siteseo} /></TableCell>
                <TableCell align="center" sx={{ borderBottom: '1px solid var(--border)' }}><RenderStatus status={row.surerank} /></TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 5, p: 4, background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(236,72,153,0.1) 100%)', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.2)' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: 'var(--text-h)' }}>
          Why Frank SEO is the Ultimate Choice 👑
        </Typography>
        <Typography variant="body1" paragraph color="var(--text)">
          Most SEO plugins on the market follow an outdated model: give you basic meta tags for free, and charge $99/year for essential tools like Redirect Managers, 404 Monitors, and AI Generation.
        </Typography>
        <Typography variant="body1" paragraph color="var(--text)">
          <strong>Frank SEO changes the game.</strong> We built a lightning-fast React 19 application that lives directly in your WordPress dashboard, offering all "premium" features entirely for free.
        </Typography>
        <Typography variant="body1" color="var(--text)">
          But we didn't stop there. We introduced the <strong>first ever Side-by-Side Competitor Audit engine</strong>. Instead of guessing what Google wants, Frank SEO scrapes the #1 ranking competitor, compares their content to yours, and uses Gemini AI to give you a step-by-step checklist on exactly how to beat them. No other plugin—Yoast, RankMath, or AIO SEO—does this.
        </Typography>
      </Box>

    </Box>
  );
}

export default Comparison;
