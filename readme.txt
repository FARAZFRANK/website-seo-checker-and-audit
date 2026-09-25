=== Website SEO Checker & Site Audit – On-Page SEO, Schema Markup, Sitemap & Redirects ===
Contributors: awordpresslife, razipathhan, hanif0991, muhammadshahid, fkfaisalkhan007, sharikkhan007, zishlife, FARAZFRANK
Tags: seo, seo audit, schema, xml sitemap, redirects
Requires at least: 5.8
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.1.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

On-page SEO audits, JSON-LD schema, XML sitemaps, 301 redirects, 404 monitoring, and broken link checking for WordPress. All features included free.

== Description ==

**Frank Website SEO Checker And Audit** is a WordPress SEO plugin that audits your published posts and pages, reports on-page SEO issues, and generates the technical output search engines rely on: JSON-LD schema markup, meta tags, XML sitemaps, and breadcrumbs. It also monitors broken links and 404 errors and lets you fix them with 301 redirects from the same dashboard.

Every feature listed below is included in the free version. There is no premium tier or paid upgrade.

The audit runs entirely inside your WordPress admin on your own server. It does not send your content to third-party services.

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

= SEO Audit =

* Run a global audit of all published posts and pages in one click, or schedule automatic scans daily, weekly, or monthly.
* Each page receives a SEO score between 0 and 100, with a breakdown of detected errors, warnings, and notices — such as missing meta titles, missing meta descriptions, heading structure problems, and missing image alt attributes.
* Track internal and outbound links on every audited page, including HTTP status verification, so broken links and 404 responses are caught early.
* Scans run asynchronously in the background: you can navigate away while the audit continues, watch live progress, or cancel a scan at any time.
* Receive an HTML audit report by email when scheduled scans finish, with support for multiple recipients.
* Review audit history with timestamps, re-scan a single page on demand, and use bulk actions to delete audits or mark issues as Fixed or Ignored.

= Schema Markup =

* Generate LocalBusiness JSON-LD schema from your business name, address, phone number, and business type.
* Output WooCommerce Product schema (JSON-LD) and OpenGraph product pricing tags automatically on product pages.
* Create custom JSON-LD schema for individual posts and pages.
* Detect WordPress FAQ blocks (including Yoast and Rank Math FAQ blocks) and generate matching FAQ schema automatically.

= Meta Tags and Social Sharing =

* Fix missing or duplicated meta titles and meta descriptions flagged by the audit using the built-in editors.
* Override OpenGraph and Twitter card tags per page through the social media settings screen.

= Sitemaps and Indexing =

* Generate a dynamic XML sitemap that stays up to date as you publish new content, helping Google and Bing discover and index your pages.
* Output SEO-friendly breadcrumbs for site navigation and search engine understanding.

= Redirects and Error Monitoring =

* Log 404 Not Found requests as they happen and create 301 permanent redirects to recover traffic from moved or deleted URLs.

= Additional Tools =

* Fill in missing image alt attributes automatically, using the post title or keyword as the fallback value.
* Optionally block known AI scraper bots from crawling your site.
* Enable or disable each major integration individually in Settings.

= Dashboard =

* All tools run in a single-page admin dashboard built with React, including light/dark mode, sortable tables, column visibility controls, score-range filtering, and a visual scan progress bar.
* The scanner and dashboard operate in the admin area; public-facing pages only receive the generated meta tags, schema output, and sitemap files described above.

= How It Works =

1. Navigate to **Frank SEO Audit** in your WordPress admin sidebar.
2. Click **Run Global Audit** to crawl your published content, or set up a scheduled scan in the settings.
3. Review SEO scores, errors, warnings, and link statuses in the dashboard table.
4. Open **View Details** on any page for the full issue and link breakdown.
5. Fix issues with the built-in meta editors, or mark them as ignored to track remediation progress.

= Privacy =

All auditing is performed locally on your own server. No website data is sent to external APIs or third-party services. The only optional external connection is Google Analytics 4, which activates solely if you enter a GA4 Tracking ID in the settings yourself.

== Installation ==

1. In your WordPress admin, go to Plugins > Add New, search for "Website SEO Checker", then click Install Now. Alternatively, upload the `frank-website-seo-checker-and-audit` folder to the `/wp-content/plugins/` directory.
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
All published **posts** and **pages** are audited by default.

= How is the SEO score calculated? =
Each page starts at 100 points. Points are deducted per detected issue: -15 for each error, -5 for each warning, and -2 for each notice. The final score is clamped between 0 and 100.

= Is this plugin compatible with my theme and page builders? =
Yes. The plugin works independently of your theme and is compatible with Gutenberg, Elementor, Divi, Beaver Builder, and other major WordPress page builders.

= Does this plugin work with WooCommerce? =
Yes. When WooCommerce products are detected, the plugin outputs Product schema (JSON-LD) and OpenGraph pricing metadata automatically.

= Will this plugin slow down my website? =
Scanning runs asynchronously in the WordPress admin, so audits continue in the background even if you close the tab. Public-facing pages receive only generated output such as meta tags, schema markup, and the XML sitemap.

= Can I use this plugin alongside other SEO plugins? =
You can, but it is not recommended. Running multiple SEO plugins together can produce duplicate meta tags and conflicting schema markup, which may confuse search engines. If you switch from another SEO plugin (such as Yoast, Rank Math, or AIOSEO), disable its overlapping modules first.

= Do I need to be an SEO expert to use this plugin? =
No. The audit lists each issue with a clear explanation of what to fix, so beginners can work through errors and warnings step by step.

= Is there a premium or "Pro" version I have to pay for? =
No. All features — including Local Business schema, WooCommerce integration, schema generation, sitemaps, and redirects — are included in the free version.

= Does it automatically generate a sitemap? =
Yes. The plugin includes a dynamic XML sitemap engine that keeps an up-to-date map of your content for Google, Bing, and other search engines.

= Can I re-audit a single page? =
Yes. On the page details screen you can re-scan an individual page without running a full global audit.

= Does this plugin send my website data to external servers? =
No. All auditing is performed locally on your server. No data is sent to external APIs or third-party services. The only external connection is Google Analytics 4, which is strictly optional and activates only if you manually enter your GA4 Tracking ID in the settings.

= How does the AI Bot Blocker work? =
When enabled, the AI Bot Blocker adds crawl directives to your site intended to deter known AI scrapers (such as ChatGPT, Claude, and others) from crawling your content. Compliance depends on each bot respecting those directives.

= What PHP version is required? =
PHP 7.4 or higher.

== Screenshots ==

1. SEO analysis overview dashboard with per-page audit scores
2. Global audit configuration options
3. Audit scheduling and email report preferences
4. Global feature integration toggles in Settings

== Changelog ==

= 1.1.1 =
* [2026-08-24]
* Tested plugin with latest WordPress v7.1

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
Readme documentation refresh with expanded FAQs covering setup, scoring, privacy, and compatibility.

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
