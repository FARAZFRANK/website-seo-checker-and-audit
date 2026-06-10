# Frank SEO Checker & Audit - Final Testing Guide

Use this guide to meticulously test the plugin before releasing it to your final users. Follow these steps sequentially to ensure every feature is robust and bug-free.

---

## 1. Installation & Activation
- [ ] **Fresh Install:** Deactivate and delete the plugin, then upload the `.zip` (or re-activate it).
- [ ] **Database Check:** Go to your database (phpMyAdmin) and verify that the 6 custom tables were created:
  - `wp_frank_audit_pages`
  - `wp_frank_audit_issues`
  - `wp_frank_audit_links`
  - `wp_frank_audit_history`
  - `wp_frank_seo_redirects`
  - `wp_frank_seo_404_logs`
- [ ] **Onboarding Alert:** Go to the Frank SEO Dashboard. You should see a yellow warning banner at the top asking you to configure your Gemini API Key.

## 2. Settings & Integrations
- [ ] **Save Settings:** Go to the **Settings** tab. Enable all features, paste a dummy Google Search Console ID and GA4 ID, and paste your actual Google Gemini API Key. Click **Save Settings**.
- [ ] **Verify Integrations:** Open the frontend of your website in an incognito window, right-click, and select **View Page Source**. Search for your GA4 ID and GSC ID to ensure the tags are successfully injected into the `<head>`.
- [ ] **Alert Dismissal:** Go back to the Dashboard. The yellow API key warning banner should now be gone.

## 3. Gutenberg SEO Sidebar (On-Page SEO)
- [ ] **Open Editor:** Create a new Post or edit an existing one. Open the "Frank SEO" sidebar icon (the chart area icon) in the top right.
- [ ] **AI Generation:** Click the **✨ AI Generate** button. Wait a few seconds to ensure Gemini AI generates a relevant SEO Title and Description based on the post content.
- [ ] **Live Scoring:** Type a Focus Keyword. Watch the Live SEO Score update in real-time as you add the keyword to the title, description, and content.
- [ ] **Advanced Schema:** Add some dummy JSON-LD code into the Advanced Schema Builder box. Verify the placeholder and "Need help?" link look good.
- [ ] **Publish & Check:** Publish the post. Go to the frontend URL, view the source code, and verify that the Title, Description, Robots (Index/Follow), Canonical URL, OpenGraph tags, and your custom Schema are perfectly formatted in the `<head>`.

## 4. Dashboard & Scanning Engine
- [ ] **Run Manual Scan:** Go to the Frank SEO Dashboard and click **Run Full Website Audit**.
- [ ] **Progress UI:** Watch the progress bar. It should fetch pages via the REST API and update the UI without refreshing the page.
- [ ] **Verify Results:** Once finished, check the total score. Click the "Details" (Magnifying Glass) icon on one of the scanned pages.
- [ ] **Issue Breakdown:** Verify that the issues (Errors, Warnings, Notices) match what is actually on the page (e.g., missing H1, short meta descriptions, missing image alt text).

## 5. Visual Broken Link Highlighter
- [ ] **Create a Broken Link:** Edit a post and add a link pointing to a fake URL (e.g., `https://google.com/fake-broken-link-12345`). Save the post.
- [ ] **Re-Scan Page:** Go to the Frank SEO Dashboard and re-run the scan for that specific page (or run a full scan).
- [ ] **Test Highlighter:** As a logged-in admin, open that post on the frontend. The broken link you created should now have a **bold red dashed border** around it with a warning tooltip.

## 6. Competitor AI Audit
- [ ] **Run Audit:** Go to the Dashboard and click the **Find Competitor** (Search on Google) helper link. Copy a real competitor's URL.
- [ ] **Compare:** Paste the URL into the Analyze Competitor Page input and click **Start Comparison**.
- [ ] **Verify UI:** Verify that the competitor's SEO score is displayed side-by-side with your own site average. Expand their issues list to ensure the DOM parser correctly grabbed their H1s, Titles, and broken links.

## 7. 404 Monitor & Redirect Manager
- [ ] **Trigger a 404:** Open an incognito window and visit a URL on your site that doesn't exist (e.g., `yoursite.com/this-is-a-fake-page`).
- [ ] **Check Logs:** Go back to wp-admin -> Frank SEO -> **404 Monitor**. You should see the fake URL logged there along with the hit count.
- [ ] **Create Redirect:** Go to the **Redirects** tab. Create a new 301 Redirect sending `/this-is-a-fake-page` to your homepage `/`.
- [ ] **Test Redirect:** Open a new incognito tab and visit `yoursite.com/this-is-a-fake-page`. You should be instantly redirected to the homepage.

## 8. Dynamic XML Sitemap & Breadcrumbs
- [ ] **Check Sitemap:** Visit `yoursite.com/sitemap.xml`. Verify that it loads as an XML file (not a 404 page).
- [ ] **Image Sitemaps:** Verify that `<image:image>` tags are included for pages that have images.
- [ ] **Test Auto-Flush:** Go to WordPress **Settings -> Permalinks**. Click **Save Changes**. Visit `yoursite.com/sitemap.xml` again to ensure it still loads perfectly (proving our auto-flush fix works).
- [ ] **Breadcrumbs:** If you're using a supported theme (or shortcode), verify that the breadcrumb JSON-LD schema is outputting correctly in the source code of your pages.

---
*If your plugin passes all 8 of these phases perfectly, it is extremely robust and 100% ready to ship to production users!*
