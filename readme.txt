=== Frank Website SEO Checker And Audit ===
Contributors: FARAZFRANK
Tags: seo, audit, seo-checker, on-page-seo, seo-audit
Requires at least: 5.8
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A complete on-page SEO audit plugin with a React dashboard. Crawl pages, detect issues, track links, and monitor SEO health.

== Description ==

**Frank Website SEO Checker And Audit** provides a modern, single-page application (SPA) dashboard inside your WordPress admin to run on-page SEO audits across all your published posts and pages.

= Key Features =

* **One-Click Global Audit** — Scan all published posts and pages for SEO issues with a single click.
* **SEO Score** — Each page receives an automated SEO health score (0–100%) based on detected errors, warnings, and notices.
* **Issue Detection** — Identifies missing meta titles, meta descriptions, heading structure problems, missing alt tags, and more.
* **Inbound & Outbound Link Audit** — Tracks all internal and external links on each page with HTTP status code verification.
* **Audit History** — Logs every scan and status change with timestamps and user attribution.
* **Column Toggle** — Customize the dashboard table by showing/hiding columns to focus on the data you need.
* **Bulk Actions** — Select and delete multiple page audits at once.
* **Sorting & Filtering** — Sort by any column and filter pages by SEO score ranges (Excellent, Fair, Critical).
* **Settings Panel** — Configure crawl depth, crawl interval, schedule frequency, and toggle specific audit checks.
* **Modern UI** — Glassmorphic React + Material UI interface with responsive design.

= How It Works =

1. Navigate to **Frank SEO Audit** in your WordPress admin sidebar.
2. Click **Run Global Audit** to crawl your published content.
3. Review your SEO scores, errors, and warnings in the dashboard table.
4. Click **View Details** on any page to see a full breakdown of issues and links.
5. Mark issues as Fixed or Ignored to track remediation progress.

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

= Does this plugin affect my site's frontend performance? =
No. The plugin runs entirely within the WordPress admin area. It does not load any scripts or styles on the public-facing frontend.

= Can I re-audit a single page? =
Yes. On the page details screen, you can re-scan an individual page without running a full global audit.

= Does this plugin connect to any external services? =
No. All auditing is performed locally on your server. No data is sent to external APIs or third-party services.

== Screenshots ==

1. Dashboard overview with SEO score summary cards and audited pages table.
2. Page detail view showing detected SEO issues and their severity.
3. Link audit panel displaying inbound and outbound links with status codes.
4. Settings panel for configuring audit behavior.

== Changelog ==

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

= 1.0.2 =
Adds batch-based crawl processing, real-time visual progress bar, cancel button, and removes the 20-page limit.

= 1.0.1 =
Minor update fixing dialog readability issues and naming consistency.

= 1.0.0 =
Initial release — install to begin auditing your site's on-page SEO.
