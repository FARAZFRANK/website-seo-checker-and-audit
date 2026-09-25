# Complete Advanced XML Sitemap Module - Technical Architecture & Implementation Plan

## 1. Executive Summary
This document outlines the architectural blueprint and phased implementation plan to transform the XML Sitemap module in **Frank Website SEO Checker and Audit** into an enterprise-grade, high-performance, and feature-complete solution that meets or exceeds current industry standards (Yoast SEO, Rank Math, AIOSEO).

---

## 2. Core Requirements & Technical Blueprint

### Phase 1: Smart Architecture & Performance (Under the Hood)
1. **Sitemap Indexing & Pagination**:
   - Master index: `/sitemap_index.xml` (also alias `/sitemap.xml` for maximum compatibility).
   - Paginated sub-sitemaps: `post-sitemap.xml` (or `post-sitemap1.xml`, `post-sitemap2.xml` when > 1000 URLs).
   - URL limit per sitemap: Configurable between 100 and 2000 (default: 1000) to prevent memory exhaustion and server crashes on large sites.
   - Support standard route formats:
     - `/sitemap_index.xml`
     - `/sitemap.xml`
     - `/{post_type}-sitemap{page}.xml` (e.g. `post-sitemap.xml`, `page-sitemap.xml`, `product-sitemap.xml`)
     - `/{taxonomy}-sitemap{page}.xml` (e.g. `category-sitemap.xml`, `post_tag-sitemap.xml`, `product_cat-sitemap.xml`)
     - Backward compatibility for `sitemap-{type}.xml` routes.

2. **Intelligent Caching System**:
   - Cache generated XML strings in WordPress transients / custom transients (`frank_seo_sm_{type}_{page}`).
   - Automatic cache invalidation hooks:
     - `save_post`, `transition_post_status`, `deleted_post`
     - `created_term`, `edited_term`, `delete_term`
     - `frank_seo_settings_updated`
   - Cache clearing endpoint in REST API: `POST /frank-seo/v1/sitemap/clear-cache`.

3. **Modern XSLT Styling (`assets/sitemap.xsl`)**:
   - Beautiful, responsive, branded interface matching Frank SEO's modern aesthetic.
   - Informative header with site title, total indexed URLs, generated timestamp, and breadcrumb link back to sitemap index.
   - Structured table with columns: URL, Images Count, Last Modified, Change Frequency, Priority.
   - Interactive search filter and sortable columns using lightweight vanilla JavaScript in the XSL template.

4. **Multisite Network Support & Safe Rewrite Rules**:
   - Use WordPress Rewrite API hooked at `init` with proper rewrite tags (`frank_seo_sitemap`, `frank_seo_sitemap_page`).
   - Clean handling for sub-folder and sub-domain multisite networks without htaccess 404 conflicts.
   - Native integration with `home_url()` and `get_site_url()`.

---

### Phase 2: Auto-Sync Logic & Control
1. **No-Index Synchronization**:
   - Exclude posts marked with `_frank_seo_robots_index = 'noindex'`.
   - Exclude posts/pages if site-wide search engine visibility is disabled (`blog_public == '0'`).
   - Filter out individual posts specified in the settings exclusion list.

2. **Custom Post Types & WooCommerce Support**:
   - Automatically detect all public custom post types (`get_post_types(array('public' => true))`).
   - Include WooCommerce Products, portfolio items, custom landing pages, etc.
   - Settings UI allows users to toggle each post type on/off individually.

3. **Taxonomy & Term Sitemaps**:
   - Automatically detect all public taxonomies (`get_taxonomies(array('public' => true))`).
   - Categories, Tags, WooCommerce Product Categories, Product Tags, etc.
   - Only include terms with at least 1 published post assigned (`hide_empty => true` and verification against published status) to prevent empty term 404s.

4. **Redirects & Orphan Pages Handling**:
   - Query plugin's redirects table (`$wpdb->prefix . 'frank_seo_redirects'`).
   - Automatically filter out any URLs that have an active 301/302/307 redirect rule.
   - Strictly filter by `post_status = 'publish'`. Exclude drafts, pending, future, trash, auto-drafts, and password-protected posts.

5. **Priority to `<lastmod>`**:
   - Google and Bing prioritize `<lastmod>` over changefreq/priority.
   - Provide accurate W3C ISO-8601 timestamps (`YYYY-MM-DD\THH:mm:ss+00:00` or `c` format) based on `post_modified_gmt`.
   - For sitemap index, accurately calculate the latest `<lastmod>` of all items in each sub-sitemap.

---

### Phase 3: Specialized Parsers
1. **Google Image Sitemap Parser**:
   - Extract featured images (`get_the_post_thumbnail_url`).
   - Extract images from Gutenberg blocks and classic HTML content (`<img src="...">`).
   - For WooCommerce products, extract gallery images.
   - Generate standard Google Image tags:
     ```xml
     <image:image>
       <image:loc>https://example.com/image.jpg</image:loc>
       <image:title>Clean Alt/Title</image:title>
     </image:image>
     ```
   - Respect Google's 1000 images per URL limit.
   - User toggle to enable/disable image inclusion in sitemaps.

---

### Phase 4: Developer-Friendly Extensibility
Expose clean WordPress hooks and filters for theme and third-party plugin developers:
- `apply_filters('frank_seo_sitemap_enabled', $enabled)`
- `apply_filters('frank_seo_sitemap_post_types', $post_types)`
- `apply_filters('frank_seo_sitemap_taxonomies', $taxonomies)`
- `apply_filters('frank_seo_sitemap_items_per_page', $limit)`
- `apply_filters('frank_seo_sitemap_url_entry', $url_data, $post_or_term, $type)`
- `apply_filters('frank_seo_sitemap_index_items', $sitemaps)`
- `apply_filters('frank_seo_sitemap_exclude_post', $exclude, $post_id)`
- `apply_filters('frank_seo_sitemap_exclude_term', $exclude, $term_id)`
- `do_action('frank_seo_sitemap_cache_cleared')`

---

### Phase 5: Frictionless UI/UX & Dashboard Design
1. **Settings Tab Enhancement (`app/src/pages/Settings.jsx`)**:
   - **Dedicated "XML Sitemap Generator" Card**:
     - Global Master Toggle: "Enable XML Sitemaps".
     - Live Sitemap Link button (opens `/sitemap_index.xml` in new tab with visual status).
     - "Purge / Clear Sitemap Cache" action button with instant feedback.
     - "Include Images in Sitemap" toggle.
     - "Entries Per Sitemap" numeric/slider setting (default: 1000).
     - "Excluded Post IDs" comma-separated text input.
   - **Post Types Accordion / Grid**:
     - Toggle switches for each detected public post type (Posts, Pages, Products, etc.).
   - **Taxonomies Accordion / Grid**:
     - Toggle switches for each detected public taxonomy (Categories, Post Tags, Product Categories, etc.).
2. **Backend API Endpoints**:
   - `GET /frank-seo/v1/sitemap/metadata`: Returns available post types, taxonomies, sitemap URL, cache status, and statistics.
   - `POST /frank-seo/v1/sitemap/clear-cache`: Flushes all sitemap transients and rewrites.
3. **Frontend React Build**:
   - Compile React assets into `assets/dist/index.js` and `assets/dist/sidebar.js`.

---

## 3. Implementation Steps & Milestones
- [x] **Milestone 1**: Git initialization and repository synchronization with `origin/main`.
- [x] **Milestone 2**: Core Backend Refactoring in `includes/class-frank-seo-sitemap.php` (Pagination, Caching, Redirect filtering, Noindex exclusion, Image extraction, Term handling, Extensibility filters).
- [x] **Milestone 3**: Enhanced XSLT Stylesheet `assets/sitemap.xsl` with modern UI, statistics, search/filter, and image count.
- [x] **Milestone 4**: REST API endpoints for sitemap metadata and cache purging in `includes/class-frank-seo-rest-api.php`.
- [x] **Milestone 5**: UI enhancements in `app/src/pages/Settings.jsx` and `app/src/api/index.js`.
- [x] **Milestone 6**: React build compilation (`npm run build`) and verification.
- [x] **Milestone 7**: Testing XML sitemaps, pagination, headers, and cache flushing.

