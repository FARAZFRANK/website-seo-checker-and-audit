import React from 'react';
import { Box, Typography, Paper, Grid, Accordion, AccordionSummary, AccordionDetails, Divider, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import MapIcon from '@mui/icons-material/Map';
import SettingsIcon from '@mui/icons-material/Settings';
import LinkOffIcon from '@mui/icons-material/LinkOff';

function HowToUse() {
  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'var(--text-h)' }}>
          How To Use Frank SEO 🚀
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text)' }}>
          Welcome to the most advanced, AI-powered SEO plugin for WordPress. This guide will walk you through every feature and setting so you can rank higher, faster.
        </Typography>
      </Box>

      {/* Gutenberg Editor */}
      <Accordion defaultExpanded sx={{ mb: 2, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '12px !important', boxShadow: 'none', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>1. Gutenberg AI SEO Sidebar</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ color: 'var(--text)' }}>
          <Typography variant="body1" paragraph>
            When writing a Post or Page in the standard WordPress block editor, you will see a new <strong>Frank SEO</strong> icon in the top right corner. Clicking this opens our real-time SEO sidebar.
          </Typography>
          <ul>
            <li><strong>Focus Keyword:</strong> Enter the primary keyword you want this page to rank for. Our analyzer will immediately check your content, title, and URL against this keyword.</li>
            <li><strong>SEO Title & Description:</strong> Write your meta tags manually, or click the <strong>✨ AI Generate</strong> button. The Gemini AI will read your entire post content and generate a highly optimized, click-worthy title and description instantly.</li>
            <li><strong>Robots Meta:</strong> Control whether search engines should Index or Follow this specific page using the simple toggle switches.</li>
            <li><strong>Real-time Checklist:</strong> As you type in the editor, the SEO checklist (keyword density, length, readability) updates automatically without needing to refresh the page.</li>
          </ul>
        </AccordionDetails>
      </Accordion>

      {/* Competitor Audits */}
      <Accordion sx={{ mb: 2, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '12px !important', boxShadow: 'none', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FindInPageIcon sx={{ color: '#ec4899' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>2. AI Competitor Audits (Dashboard)</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ color: 'var(--text)' }}>
          <Typography variant="body1" paragraph>
            The core feature of this plugin is the Competitor Audit tool found right on the <strong>Dashboard</strong>. 
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>How to run an audit:</strong>
            <br />
            1. Enter your Target URL (the page on your site you want to rank).<br />
            2. Enter the Competitor URL (the page currently ranking #1 on Google).<br />
            3. Enter your Focus Keyword.<br />
            4. Click "Run Audit".
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>What the results mean:</strong>
            <br />
            The tool will scrape both pages and display a side-by-side comparison matrix of word count, keyword density, loading speed estimates, and content structure.
            Below the matrix, our Gemini AI will analyze the differences and generate a custom, actionable <strong>Beat-Them Guideline</strong> list. These are exact steps you must take to outrank that specific competitor!
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Redirects Manager */}
      <Accordion sx={{ mb: 2, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '12px !important', boxShadow: 'none', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CompareArrowsIcon sx={{ color: '#10b981' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>3. Redirects Manager</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ color: 'var(--text)' }}>
          <Typography variant="body1" paragraph>
            Never lose SEO juice when deleting or moving pages. The Redirects Manager allows you to safely route traffic from old URLs to new ones.
          </Typography>
          <ul>
            <li><strong>Source URL:</strong> The old URL that no longer exists (e.g. `/old-blog-post`).</li>
            <li><strong>Target URL:</strong> Where the user should be sent instead (e.g. `/new-blog-post`).</li>
            <li><strong>Type:</strong> Choose <strong>301 (Permanent)</strong> for SEO value transfer, or <strong>302 (Temporary)</strong> if the move is not permanent.</li>
          </ul>
        </AccordionDetails>
      </Accordion>

      {/* 404 Monitor */}
      <Accordion sx={{ mb: 2, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '12px !important', boxShadow: 'none', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinkOffIcon sx={{ color: '#f59e0b' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>4. 404 Error Monitor</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ color: 'var(--text)' }}>
          <Typography variant="body1" paragraph>
            Broken links hurt your user experience and SEO rankings. The 404 Monitor silently watches your site for users hitting broken pages.
          </Typography>
          <Typography variant="body1" paragraph>
            On the 404 Monitor page, you'll see a log of every broken URL visited, how many times it was hit, and when. 
            <strong>Pro Tip:</strong> If you see a URL getting lots of 404 hits, click the "Create Redirect" button next to it to immediately send that traffic to a working page using the Redirects Manager!
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* XML Sitemap */}
      <Accordion sx={{ mb: 2, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '12px !important', boxShadow: 'none', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MapIcon sx={{ color: '#8b5cf6' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>5. Dynamic XML Sitemap</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ color: 'var(--text)' }}>
          <Typography variant="body1" paragraph>
            A sitemap is crucial for Google to discover your pages. Frank SEO automatically generates a blazing-fast, dynamic XML sitemap.
          </Typography>
          <Typography variant="body1">
            <strong>Where is it?</strong> Your sitemap is permanently available at <code>yourwebsite.com/sitemap.xml</code>.
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            It updates automatically every time you publish, edit, or delete a post. Pages marked as "NoIndex" in the Gutenberg sidebar are automatically excluded from the sitemap. You do not need to configure anything—it just works.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Settings */}
      <Accordion sx={{ mb: 4, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '12px !important', boxShadow: 'none', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SettingsIcon sx={{ color: '#64748b' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>6. Plugin Settings & API Key</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ color: 'var(--text)' }}>
          <Typography variant="body1" paragraph>
            To power the AI generation and Competitor Audits, Frank SEO uses the Google Gemini AI.
          </Typography>
          <Typography variant="body1">
            Navigate to the <strong>Settings</strong> tab to enter your Gemini API Key. You can get a free API key from the Google AI Studio. Once saved, the key is securely encrypted in your WordPress database and all AI features will instantly unlock.
          </Typography>
        </AccordionDetails>
      </Accordion>
      
    </Box>
  );
}

export default HowToUse;
