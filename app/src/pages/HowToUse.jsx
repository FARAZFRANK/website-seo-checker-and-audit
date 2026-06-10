import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import MapIcon from '@mui/icons-material/Map';
import TuneIcon from '@mui/icons-material/Tune';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`how-to-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function HowToUse() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const accordionStyle = {
    mb: 2, 
    background: 'var(--glass-bg)', 
    backdropFilter: 'blur(10px)', 
    border: '1px solid var(--border)', 
    borderRadius: '12px !important', 
    boxShadow: 'none', 
    '&:before': { display: 'none' }
  };

  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto', fontFamily: 'var(--sans)' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'var(--text-h)', fontFamily: 'var(--sans)' }}>
          How To Use Frank SEO 🚀
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
          Welcome to your complete, easy-to-understand guide for Frank SEO. We've broken down every feature so you can get the best rankings on Google without needing technical knowledge!
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'var(--border)' }}>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { color: 'var(--text)', fontFamily: 'var(--sans)', fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
            '& .Mui-selected': { color: 'var(--primary) !important' },
            '& .MuiTabs-indicator': { backgroundColor: 'var(--primary)' }
          }}
        >
          <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="Audit History" />
          <Tab icon={<SwapCallsIcon />} iconPosition="start" label="Redirects" />
          <Tab icon={<ReportProblemIcon />} iconPosition="start" label="404 Monitor" />
          <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" />
        </Tabs>
      </Box>

      {/* =========================================
          DASHBOARD TAB 
      ========================================= */}
      <TabPanel value={value} index={0}>
        <Accordion defaultExpanded sx={accordionStyle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FindInPageIcon sx={{ color: '#ec4899' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>AI Competitor Audits (Beat #1 on Google)</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
            <Typography variant="body1" paragraph>
              <strong>What it does:</strong> This is our most powerful tool. It looks at the website currently ranking #1 on Google, compares it to your website, and tells you exactly what you need to change to steal their spot!
            </Typography>
            <Typography variant="body1" paragraph><strong>How to use the options:</strong></Typography>
            <ul>
              <li style={{ marginBottom: '10px' }}><strong>Target URL:</strong> Paste the link of YOUR page that you want to rank higher.</li>
              <li style={{ marginBottom: '10px' }}><strong>Competitor URL:</strong> Go to Google, search for your keyword, copy the link of the #1 result, and paste it here.</li>
              <li style={{ marginBottom: '10px' }}><strong>Focus Keyword:</strong> The exact search term you are trying to win (e.g., "best pizza in New York").</li>
            </ul>
            <Typography variant="body1">
              <strong>Usecase:</strong> Use this whenever you write a new blog post or if you have an old page that is stuck on page 2 of Google and refuses to climb higher.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={accordionStyle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AutoAwesomeIcon sx={{ color: 'var(--primary)' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>Gutenberg Page Editor (AI SEO Sidebar)</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
            <Typography variant="body1" paragraph>
              <strong>What it does:</strong> When you are writing a post inside WordPress, click the Frank SEO icon in the top right corner. It opens a sidebar that guides you while you type.
            </Typography>
            <Typography variant="body1" paragraph><strong>How to use the options:</strong></Typography>
            <ul>
              <li style={{ marginBottom: '10px' }}><strong>Focus Keyword:</strong> Type the word you want to rank for. The sidebar will instantly check your text and tell you if you've used the word enough times.</li>
              <li style={{ marginBottom: '10px' }}><strong>AI Generate Button (✨):</strong> Don't know how to write a catchy title? Click this button! The AI will read your whole post and write a perfect, click-worthy SEO Title and Description for you.</li>
              <li style={{ marginBottom: '10px' }}><strong>Social Media (OpenGraph):</strong> Want your link to look different when shared on Facebook or Twitter? You can override the title, description, and even upload a custom share image here.</li>
              <li style={{ marginBottom: '10px' }}><strong>Advanced Schema Builder:</strong> Paste raw JSON-LD here for recipes, courses, or events. Frank SEO also automatically detects your FAQ blocks (Yoast/RankMath) and turns them into Google FAQ snippets automatically!</li>
              <li style={{ marginBottom: '10px' }}><strong>Index vs NoIndex Toggle:</strong> Leave this on "Index" so Google can find your page. Only turn it to "NoIndex" if it's a private page (like a Thank You page or login screen) that you want to hide from search engines.</li>
            </ul>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={accordionStyle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AutoAwesomeIcon sx={{ color: '#f59e0b' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>E-Commerce & Images Automation (Set & Forget)</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
            <Typography variant="body1" paragraph>
              <strong>What it does:</strong> Frank SEO automatically works in the background to optimize your WooCommerce products and images without any extra setup.
            </Typography>
            <Typography variant="body1" paragraph><strong>Included Features:</strong></Typography>
            <ul>
              <li style={{ marginBottom: '10px' }}><strong>WooCommerce Product Schema:</strong> Automatically outputs rich snippets for products (Price, Currency, Stock Status, Reviews) so your products look amazing in Google Shopping results.</li>
              <li style={{ marginBottom: '10px' }}><strong>Missing Image SEO:</strong> Forget to add 'Alt' text to your images? Frank SEO safely injects your post title as the Alt text for any empty images, keeping Google happy and improving accessibility.</li>
            </ul>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={accordionStyle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MapIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>Automatic XML Sitemap</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
            <Typography variant="body1" paragraph>
              <strong>What it does:</strong> A sitemap is like a map of your website that Google uses to find all your pages. Unlike old plugins that generate a slow physical file, Frank SEO generates your sitemap entirely on-the-fly dynamically. This guarantees it is updated the exact second you publish a new post!
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>How to use it:</strong> Go to the <strong>Settings tab</strong> and make sure "Discover & Crawl XML Sitemaps" is toggled ON. <strong>IMPORTANT:</strong> You must click the "Save Configuration" button at the bottom of the Settings page at least once so that WordPress registers the dynamic link! 
            </Typography>
            <Typography variant="body1">
              Once saved, you can find your beautiful sitemap by typing <code>yourwebsite.com/sitemap.xml</code> in your browser. Just submit that link to Google Search Console once, and you're done forever!
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={accordionStyle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TuneIcon sx={{ color: '#ec4899' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>External Integrations & Core Systems</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
            <Typography variant="body1" paragraph>
              <strong>What it does:</strong> Frank SEO includes advanced systems that usually cost $99/yr in other plugins. 
            </Typography>
            <Typography variant="body1" paragraph><strong>Included Premium Features:</strong></Typography>
            <ul>
              <li style={{ marginBottom: '10px' }}><strong>Google Analytics 4 & Search Console:</strong> Paste your measurement ID in Settings, and Frank SEO automatically injects the exact verification and tracking codes securely into your website header. No coding required.</li>
              <li style={{ marginBottom: '10px' }}><strong>AI Bot Blocker (Anti-Scraping):</strong> Turn this on to automatically add special rules to your <code>robots.txt</code> file that stop AI companies (like OpenAI and Anthropic) from scraping your content to train their AI models.</li>
              <li style={{ marginBottom: '10px' }}><strong>Auto-Redirects on Slug Change:</strong> Never lose traffic again! If you edit an old blog post and accidentally change its link (slug), Frank SEO automatically creates a 301 Permanent Redirect behind the scenes from the old link to the new link.</li>
              <li style={{ marginBottom: '10px' }}><strong>SEO Breadcrumbs:</strong> You can place the shortcode <code>[frank_seo_breadcrumbs]</code> anywhere on your pages to output a beautiful, Google-friendly breadcrumb trail with full Schema.org JSON-LD markup attached.</li>
            </ul>
          </AccordionDetails>
        </Accordion>
      </TabPanel>

      {/* =========================================
          AUDIT HISTORY TAB 
      ========================================= */}
      <TabPanel value={value} index={1}>
        <Accordion defaultExpanded sx={accordionStyle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <HistoryIcon sx={{ color: 'var(--text-h)' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>Viewing Your Past SEO Scans</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
            <Typography variant="body1" paragraph>
              <strong>What it does:</strong> This tab saves a record of every time the plugin scanned your website for SEO errors.
            </Typography>
            <Typography variant="body1" paragraph><strong>What the options mean:</strong></Typography>
            <ul>
              <li style={{ marginBottom: '10px' }}><strong>View Details Button:</strong> Click this to open the exact report from that specific day. It will show you exactly which pages were broken or missing titles on that date.</li>
              <li style={{ marginBottom: '10px' }}><strong>Delete Button:</strong> Removes old scans to keep your database clean.</li>
            </ul>
            <Typography variant="body1">
              <strong>Usecase:</strong> Imagine your website traffic suddenly drops today. You can come to the Audit History, open yesterday's scan, and compare it to last month's scan to see if any critical SEO errors (like broken links) recently appeared on your site!
            </Typography>
          </AccordionDetails>
        </Accordion>
      </TabPanel>

      {/* =========================================
          REDIRECTS TAB 
      ========================================= */}
      <TabPanel value={value} index={2}>
        <Accordion defaultExpanded sx={accordionStyle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SwapCallsIcon sx={{ color: '#10b981' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>URL Redirects Manager</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
            <Typography variant="body1" paragraph>
              <strong>What it does:</strong> If you delete an old post or change its link, visitors will hit a dead end (a 404 error) and Google will penalize your ranking. A redirect safely forwards visitors from the old deleted link to a new working link automatically!
            </Typography>
            <Typography variant="body1" paragraph><strong>How to use the options:</strong></Typography>
            <ul>
              <li style={{ marginBottom: '10px' }}><strong>Source Path:</strong> Type the old, broken link here (e.g. <code>/old-pizza-recipe/</code>).</li>
              <li style={{ marginBottom: '10px' }}><strong>Target Destination:</strong> Type the new working link where you want people to go instead (e.g. <code>/new-pizza-recipe/</code>).</li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Redirect Type (Important!):</strong>
                <ul>
                  <li><strong>301 Permanent (Use this 99% of the time):</strong> Tells Google "I permanently moved this page. Please transfer all my old SEO ranking power to the new link!"</li>
                  <li><strong>302/307 Temporary:</strong> Tells Google "This page is broken today, but it will be back soon, so don't update my SEO rankings." Rarely used.</li>
                </ul>
              </li>
            </ul>
          </AccordionDetails>
        </Accordion>
      </TabPanel>

      {/* =========================================
          404 MONITOR TAB 
      ========================================= */}
      <TabPanel value={value} index={3}>
        <Accordion defaultExpanded sx={accordionStyle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ReportProblemIcon sx={{ color: '#f59e0b' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>404 Error Monitor (Broken Links)</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
            <Typography variant="body1" paragraph>
              <strong>What it does:</strong> It silently acts like a security camera for your website. Whenever a real person or a Google Search bot tries to visit a page that doesn't exist, it logs it here.
            </Typography>
            <Typography variant="body1" paragraph><strong>How to use the options:</strong></Typography>
            <ul>
              <li style={{ marginBottom: '10px' }}><strong>Hits Column:</strong> Shows how many times people tried to visit that broken link. High numbers mean you are actively losing lots of visitors!</li>
              <li style={{ marginBottom: '10px' }}><strong>Redirect Button:</strong> If you see a broken link with high hits, click this button. It will instantly pop open the Redirects Manager so you can forward that lost traffic to your homepage or a related article, saving your visitors!</li>
            </ul>
            <Typography variant="body1">
              <strong>Usecase:</strong> Check this tab once a week. If you see a lot of broken links getting hit, use the Redirect button to plug the holes in your website's traffic bucket.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </TabPanel>

      {/* =========================================
          SETTINGS TAB 
      ========================================= */}
      <TabPanel value={value} index={4}>
        <Accordion defaultExpanded sx={accordionStyle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text)' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SettingsIcon sx={{ color: '#64748b' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'var(--sans)', color: 'var(--text-h)' }}>Plugin Configuration</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ color: 'var(--text)', fontFamily: 'var(--sans)' }}>
            <Typography variant="body1" paragraph>
              <strong>What it does:</strong> This is the engine room. It controls how the plugin scans your website and connects to artificial intelligence.
            </Typography>
            
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1, color: 'var(--text-h)' }}>1. API Integrations</Typography>
            <Typography variant="body2" paragraph>
              <strong>Google Gemini API Key:</strong> The plugin needs this "key" to unlock its AI powers (like generating titles or analyzing competitors). You can generate a free key from Google AI Studio and paste it here. It is kept completely secure.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1, color: 'var(--text-h)' }}>2. Automation & Emails</Typography>
            <Typography variant="body2" paragraph>
              <strong>Background Audits:</strong> You can tell the plugin to scan your entire website automatically (Daily, Weekly, or Monthly) while you sleep. Monthly is recommended for most websites so it doesn't slow down your server.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Email Reports:</strong> If you turn this on, the plugin will email you a beautiful PDF-like summary report whenever a scan finishes, telling you your SEO score and what needs fixing.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1, color: 'var(--text-h)' }}>3. Crawl Settings</Typography>
            <Typography variant="body2" paragraph>
              <strong>Max Crawl Depth:</strong> How many "clicks" deep the scanner should go when checking your website. Leaving it at 3 means it checks your homepage, pages linked from your homepage, and pages linked from those pages.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Crawl Delay (Seconds):</strong> If you have a very cheap or slow web host, scanning hundreds of pages fast might crash your site. Increasing this delay makes the scanner wait a few seconds between checking each page, keeping your site fast and safe.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1, color: 'var(--text-h)' }}>4. Link Analytics (Exclusions)</Typography>
            <Typography variant="body2" paragraph>
              <strong>Exclude Menus / Footers / Sidebars:</strong> When the auditor checks your page for broken links, you can tell it to ignore links inside your header menus, footers, and sidebars so it focuses strictly on the main content of your article.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1, color: 'var(--text-h)' }}>5. Global Features Integration</Typography>
            <Typography variant="body2" paragraph>
              <strong>Toggle Major Features:</strong> If you use another plugin for a specific task (like WooCommerce SEO or Local Business Schema) and don't want Frank SEO to handle it, you can individually turn off those features here to prevent conflicts. By default, everything is enabled so you don't need any other plugins.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </TabPanel>
      
    </Box>
  );
}

export default HowToUse;
