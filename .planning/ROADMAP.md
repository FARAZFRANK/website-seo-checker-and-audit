# Project Roadmap: Frank Website SEO Checker And Audit

This roadmap tracks our plan to beat major WordPress.org SEO competitors (Yoast, Rank Math, SEOPress, SureRank, etc.).

## Milestones

### [x] Phase 1: Front-End Metadata & Schema Hook Engine
* **Goal**: Outputs SEO optimized title, descriptions, OpenGraph meta, and JSON-LD schema on frontend web pages.
* **Target Files**:
  * `includes/class-frank-seo-meta-renderer.php`
  * `includes/class-frank-seo-schema-builder.php`

### [x] Phase 2: Gutenberg Editor Real-Time SEO Sidebar
* **Goal**: Build an interactive sidebar in WordPress Block Editor showing live snippet preview, readability score, and focus keyword checklist.
* **Target Files**:
  * `assets/js/editor-sidebar.js`
  * `assets/css/editor-sidebar.css`

### [x] Phase 3: Redirects Manager & 404 Monitoring
* **Goal**: Detects 404 hits in real-time, logs them, and allows users to set up 301/302/307 redirects from dashboard.
* **Target Files**:
  * `includes/class-frank-seo-redirect-manager.php`

### [x] Phase 4: Dynamic XML Sitemap Generator
* **Goal**: Dynamically output optimized `/sitemap.xml` with index pages for posts, pages, and categories.
* **Target Files**:
  * `includes/class-frank-seo-sitemap.php`

### [x] Phase 5: AI SEO Assistant & Competitor Audits
* **Goal**: Integrate AI metadata generation (via Gemini API) and side-by-side Competitor SEO Audits in the React Dashboard.
* **Target Files**:
  * `app/src/pages/Dashboard.jsx`
  * `includes/class-frank-seo-auditor.php`
