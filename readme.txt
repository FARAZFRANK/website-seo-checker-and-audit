=== Frank Website SEO Checker And Audit ===
Contributors: FARAZFRANK
Tags: seo, seo plugin, woocommerce seo, xml sitemap, schema
Requires at least: 5.8
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A complete on-page SEO audit plugin with a React dashboard. Crawl pages, detect issues, track links, and monitor SEO health.

== Description ==

**Frank Website SEO Checker And Audit** is a powerful, all-in-one **WordPress SEO plugin** designed to help you rank higher in search engines, boost organic traffic, and optimize your website like a professional. Whether you are a beginner or an advanced user, our complete **Search Engine Optimization (SEO)** toolkit provides a modern, single-page application (SPA) dashboard inside your WordPress admin to run comprehensive **on-page SEO audits** across your entire site.

Unlike many other SEO solutions that lock essential functionality behind premium upgrades or expensive subscriptions, this plugin gives you a complete, fully-featured toolkit right out of the box. We believe great SEO should be accessible to everyone. Enjoy advanced **Schema markup generation**, **WooCommerce SEO**, **Local SEO**, automated **XML sitemaps**, **404 monitoring**, and **301 redirects** without hitting a paywall!

= Why Choose Frank SEO Checker & Audit? =

When evaluating SEO solutions, you might notice that many free plugins only offer basic metadata editing. Here is what makes this the perfect **SEO analyzer** and optimization plugin for your WordPress website:

* **Fully Featured, No Upsells:** From Local Business SEO to WooCommerce Product Schema, everything is included. Get access to a professional suite of tools to improve your search rankings.
* **Modern React Dashboard:** The administration panel is built using React, offering a lightning-fast, responsive, glassmorphic design. Manage your **technical SEO** without constant page reloads.
* **Zero Front-End Bloat:** The dashboard and scanning engine run exclusively in the WordPress backend. Your website's public-facing speed and Core Web Vitals remain completely unaffected.
* **Asynchronous Background Audits:** Scanning your site happens efficiently in the background. You can navigate away from the page, and the SEO checker will continue auditing your content.
* **All-in-One SEO Toolkit:** It replaces the need for multiple separate plugins by offering a **Redirect Manager**, **404 Error Log**, **XML Sitemaps generator**, and an **AI Bot Blocker** all in a single, cohesive package.

= Key SEO Features & Functionality =

* **Comprehensive SEO Audit** — Run a global scan on all published posts and pages to detect crucial SEO issues with a single click.
* **SEO Score & Analyzer** — Each page receives an automated SEO health score (0–100%). The scanner identifies missing meta titles, meta descriptions, heading structure problems, missing alt tags, and more.
* **Broken Link Checker** — Automatically track all internal and outbound links on each page, complete with HTTP status code verification to catch broken links and 404s.
* **Scheduled Scans & Email Reports** — Automate your SEO monitoring with Daily, Weekly, or Monthly background audits. Receive a beautifully formatted HTML report directly in your inbox.
* **Dynamic XML Sitemaps** — Automatically generate and maintain up-to-date XML sitemaps to help Google, Bing, and other search engines discover and index your content faster.
* **Redirect Manager & 404 Monitor** — Easily track 404 Not Found errors and create 301 permanent redirects to recover lost link equity and traffic.
* **WooCommerce SEO Integration** — Boost your e-commerce sales. The plugin automatically injects Product Schema (JSON-LD) and OpenGraph pricing tags for your products.
* **Local Business SEO** — Configure your business address, phone, and type to automatically generate LocalBusiness JSON-LD Schema.
* **Advanced Schema Builder** — Craft custom JSON-LD Schema directly on your posts and pages. Automatically detects and builds Schema for WordPress FAQ blocks.
* **Image SEO Optimizer** — Automatically injects missing `alt` attributes into images within your content based on the post title or keyword.
* **AI Bot Blocker** — Protect your content by optionally blocking aggressive AI scrapers and bots from crawling your site.
* **Breadcrumbs System** — Easily implement SEO-friendly breadcrumbs to improve site navigation and search engine understanding.
* **Audit History & Bulk Actions** — Logs every scan and status change with timestamps. Select and delete multiple page audits or mark issues as "Fixed" or "Ignored".
* **Extensive Settings Panel** — Complete control over crawl depth, crawl interval, schedule frequency, and the ability to toggle specific global integrations on or off.

= How It Works =

1. Navigate to **Frank SEO Audit** in your WordPress admin sidebar.
2. Click **Run Global Audit** to crawl your published content, or set up a scheduled scan in the settings.
3. Review your SEO scores, errors, and warnings in the dashboard table.
4. Click **View Details** on any page to see a full breakdown of issues and links.
5. Fix issues using the built-in meta editors, or mark them as ignored to track your remediation progress.

== Installation ==

1. Upload the `frank-website-seo-checker-and-audit` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the **Plugins** menu in WordPress.
3. Navigate to **Frank SEO Audit** in the admin sidebar to begin auditing.

== Build Instructions ==

The source code for the React single-page application is included inside the plugin package under the `app/` directory. If you wish to study, modify, or compile the JavaScript and CSS assets, follow these steps:

1. Navigate to the `app/` directory:
   `cd app`
2. Install npm dependencies:
   `npm install`
3. Compile the production bundles to `assets/dist/`:
   `npm run build`
4. For interactive development with hot module replacement (HMR), run:
   `npm run dev`

== Frequently Asked Questions ==

= What post types does the plugin audit? =
The plugin audits all published **posts** and **pages** by default.

= How is the SEO score calculated? =
The score starts at 100 and deducts points for each issue found: -15 per error, -5 per warning, and -2 per notice. The score is clamped between 0 and 100.

= Is this plugin compatible with my theme and page builders? =
Yes! The plugin works completely independent of your theme. It is fully compatible with Gutenberg, Elementor, Divi, Beaver Builder, and all other major WordPress page builders.

= Does this plugin work with WooCommerce? =
Absolutely. Our plugin automatically detects WooCommerce products and generates proper Product Schema (JSON-LD) and OpenGraph pricing metadata out of the box.

= Will this plugin slow down my website? =
No. All scanning processes and the React dashboard run exclusively in the WordPress backend. The frontend integrations (like meta tags and sitemaps) are highly optimized, caching effectively without relying on heavy frameworks. Your public-facing site speed remains unaffected.

= Can I use this plugin alongside other SEO plugins? =
While you can, we strongly recommend disabling other SEO plugins (such as Yoast, Rank Math, or AIOSEO) when using Frank SEO Checker & Audit. Running multiple SEO plugins simultaneously can result in duplicate meta tags and conflicting Schema markup, which may confuse search engines.

= Do I need to be an SEO expert to use this plugin? =
Not at all. The plugin is designed to be incredibly user-friendly for beginners. The built-in scanner provides clear, actionable recommendations and highlights exact errors so you know exactly what to fix.

= Is there a premium or "Pro" version I have to pay for? =
No! We believe in providing a complete SEO toolkit for free. Advanced features like Local Business SEO, WooCommerce integrations, Schema generation, and Redirects are included at no extra cost.

= Does it automatically generate a sitemap? =
Yes. The plugin includes a dynamic XML Sitemap engine that automatically maintains an up-to-date map of your content to help Google and Bing index your site faster.

= Can I re-audit a single page? =
Yes. On the page details screen, you can click to re-scan an individual page without having to run a full global audit of your entire site.

= Does this plugin send my website data to external servers? =
No. All auditing is performed locally on your server. No data is sent to external APIs or third-party services. The only external connection is Google Analytics 4, which is strictly optional and only activates if you manually enter your GA4 Tracking ID in the settings.

= How does the AI Bot Blocker work? =
When enabled, the AI Bot Blocker adds specific directives to your site to deter known AI scrapers (like ChatGPT, Claude, and others) and unauthorized bots from crawling your content, protecting your intellectual property.

= What PHP version is required? =
The plugin requires PHP 7.4 or higher to ensure optimal performance and security.

== Screenshots ==

1. Dashboard overview with SEO score summary cards and audited pages table.
2. Page detail view showing detected SEO issues and their severity.
3. Link audit panel displaying inbound and outbound links with status codes.
4. Settings panel for configuring audit behavior.

== Changelog ==

= 1.1.0 =
* [2026-06-11]
* Passed comprehensive WordPress Plugin Review Guidelines compliance audit.
* Refactored readme.txt for high SEO visibility with keyword-rich feature descriptions.
* Added a detailed "Frequently Asked Questions" section covering top SEO questions.

 = 1.0.9 =
 * [2026-06-10]
 * Refactored the scanning process to run entirely as an asynchronous background job, preventing timeouts when switching browser tabs.
 * Updated dashboard UI to intelligently poll and resume scanning progress if the user navigates away and comes back.

 = 1.0.8 =
 * [2026-06-10]
 * Added a collapse toggle button to the main dashboard sidebar for a cleaner UI experience.
 
 = 1.0.7 =
 * [2026-06-10]
 * Added "Global Features Integration" toggles in Settings so admins can easily disable major components.
 * Updated "Comparison" tab to showcase newly added features.
 
 = 1.0.6 =
 * [2026-06-10]
 * Added WooCommerce SEO tags (Product Schema and OpenGraph Pricing).
 * Added Local Business SEO settings and Auto-Schema Generation.
 * Added Advanced Social Media Override UI (OpenGraph/Twitter).
 * Added Missing Image Alt Tag Auto-injector (`the_content` filter).
 * Added Custom JSON-LD Schema builder for posts/pages.
 * Added WordPress FAQ blocks Auto-Schema Generation (Yoast & Rank Math detection).

= 1.0.5 =
* June 9, 2026
* Added a detailed "How To Use" documentation submenu page.
* Added a competitive "Comparison" submenu page.
* Fixed a critical Minified React Error #31 by decoupling the Dashboard React 19 app from WordPress's native React 18 element global.
* Fixed a styling bug where popup dialogs, inputs, and dropdown menus had unreadable white backgrounds in dark mode by applying a global Material UI ThemeProvider.
* Fixed a crash in the 404 Monitor page during redirect creation.

= 1.0.4 =
* Added a persistent Light/Dark mode switcher option to the admin dashboard header.
* Persisted selection across sessions using localStorage.
* Supported automated dark mode fallback based on system preferences.

= 1.0.3 =
* Added scan-completion email report setting to notify the admin with audit metrics.
* Added automated scheduled scans with Daily, Weekly, and Monthly background WP Cron options.
* Set Monthly background runs as the default frequency.
* Enabled multiple email recipients via a comma-separated setting.
* Created "Email & Report Preferences" UI card in settings.

= 1.0.2 =
* Resolved 20-page crawl limit to scan all published content.
* Implemented batch-based crawl processing to prevent timeouts.
* Added a beautiful visual scan progress bar (0-100%).
* Added "Cancel Scan" button to abort audits in real-time.
* Respected delay rate settings during scanning.

= 1.0.1 =
* Fixed dialog readability issues by making backgrounds solid and adding backdrop blur.
* Updated WP Admin menu and page title to "Frank SEO Checker & Audit".
* Version bump.

= 1.0.0 =
* Initial release.
* On-page SEO audit with score calculation.
* Inbound and outbound link tracking with HTTP status verification.
* Audit history with user attribution.
* React + Material UI admin dashboard.
* Column visibility toggle for the pages table.
* Bulk delete support.
* Sorting and score-range filtering.
* Settings panel with crawl configuration.

== Upgrade Notice ==

= 1.1.0 =
Major SEO and Search visibility update. Adds comprehensive documentation, expanded FAQs, and guarantees 100% adherence to WP guidelines.

= 1.0.9 =
Major refactor for the global audit scanner. It now runs as a stable asynchronous background job, fixing timeout and tab-switching issues.

= 1.0.5 =
Introduces the new "How To Use" and "Comparison" pages, plus major stability and dark mode UI fixes for the React dashboard.

= 1.0.4 =
Introduces a custom theme switcher toggle for Light/Dark modes in the dashboard header.

= 1.0.3 =
Introduces email reporting settings (manual completion reports & scheduled background runs), custom recipient emails list, and schedules.

= 1.0.2 =
Adds batch-based crawl processing, real-time visual progress bar, cancel button, and removes the 20-page limit.

= 1.0.1 =
Minor update fixing dialog readability issues and naming consistency.

= 1.0.0 =
Initial release — install to begin auditing your site's on-page SEO.
