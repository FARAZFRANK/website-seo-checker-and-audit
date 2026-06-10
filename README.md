# Frank Website SEO Checker And Audit

![Version](https://img.shields.io/badge/version-1.0.9-blue.svg)
![WordPress](https://img.shields.io/badge/WordPress-5.8+-blue.svg)
![PHP](https://img.shields.io/badge/PHP-7.4+-blue.svg)
![License](https://img.shields.io/badge/license-GPLv2-green.svg)

**Frank Website SEO Checker And Audit** provides a modern, single-page application (SPA) dashboard inside your WordPress admin to run on-page SEO audits across all your published posts and pages. It helps you monitor your website's SEO health, identify technical issues, and improve your search engine rankings without slowing down your server.

## ✨ Key Features

- **Asynchronous Background Auditing** — Scan hundreds of pages automatically in the background without worrying about browser timeouts or tab-switching interruptions.
- **Real-Time SEO Score (0–100%)** — Each page receives an automated SEO health score based on detected errors, warnings, and notices.
- **Deep Issue Detection** — Identifies missing meta titles, meta descriptions, heading structure problems, missing alt tags, and more.
- **Inbound & Outbound Link Audit** — Tracks all internal and external links on each page, verifying HTTP status codes to catch broken links.
- **Audit History & Attribution** — Logs every scan and issue status change with timestamps and user attribution.
- **Bulk Actions** — Select and delete multiple page audits at once.
- **Interactive Filtering** — Sort by any column and filter pages by SEO score ranges (Excellent, Fair, Critical) and post types.
- **Advanced Settings Panel** — Configure crawl depth, crawl interval, background schedule frequency (Daily/Weekly/Monthly), and toggle specific audit checks.
- **Email Reporting** — Receive automated email summaries when scans complete, highlighting top issues.
- **Modern UI** — Beautiful Glassmorphic React + Material UI interface featuring responsive design and Dark Mode support.

## 🚀 Installation

1. Download the plugin package.
2. Upload the `frank-website-seo-checker-and-audit` folder to your `/wp-content/plugins/` directory.
3. Activate the plugin through the **Plugins** menu in WordPress.
4. Navigate to **Frank SEO Audit** in the admin sidebar.
5. Click **Run Global Audit** to begin your first background crawl!

## 🛠 Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Backend    | PHP (OOP), WordPress REST API, Async  |
| Database   | MySQL / MariaDB (custom tables)       |
| Frontend   | React 18, Vite, Material UI (MUI)     |
| Build      | Vite → `assets/dist/`                 |

## 📁 Project Structure

```
frank-website-seo-checker-and-audit/
├── frank-website-seo-checker-and-audit.php  # Main plugin file
├── readme.txt                               # WordPress.org readme
├── README.md                                # GitHub documentation
├── includes/
│   ├── class-frank-seo-activator.php        # DB table creation on activation
│   ├── class-frank-seo-admin.php            # Admin menu & asset enqueueing
│   ├── class-frank-seo-auditor.php          # Core crawl & audit engine
│   └── class-frank-seo-rest-api.php         # REST API endpoints & Async queues
├── app/                                     # React SPA source
│   ├── src/
│   │   ├── pages/                           # Dashboard, PageDetail, History, Settings
│   │   ├── api.js                           # REST API client
│   │   └── App.jsx                          # Router & layout shell
│   ├── package.json
│   └── vite.config.js
└── assets/
    └── dist/                                # Production build output (tracked)
```

## 💻 Development & Building

The source code for the React single-page application is included inside the plugin package under the `app/` directory. 

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup Instructions

```bash
# Clone into your plugins directory
cd wp-content/plugins/
git clone https://github.com/FARAZFRANK/website-seo-checker-and-audit.git frank-website-seo-checker-and-audit

# Install frontend dependencies
cd frank-website-seo-checker-and-audit/app
npm install

# Build for production
npm run build

# Run dev server with Hot Module Replacement (HMR)
npm run dev
```

The Vite build automatically outputs the compiled JavaScript and CSS to the `assets/dist/` folder, which is enqueued by the WordPress backend.

## 🔌 REST API Endpoints

All endpoints require `manage_options` capability (admin only).

| Method   | Endpoint                              | Description                 |
|----------|---------------------------------------|-----------------------------|
| `GET`    | `/frank-seo/v1/summary`              | Dashboard summary stats     |
| `GET`    | `/frank-seo/v1/pages`                | List audited pages          |
| `GET`    | `/frank-seo/v1/pages/{id}`           | Page audit details          |
| `POST`   | `/frank-seo/v1/scan/start-background`| Initiate background scan    |
| `GET`    | `/frank-seo/v1/scan/progress`        | Poll scan progress          |
| `POST`   | `/frank-seo/v1/scan/process-chunk`   | Internal async processor    |
| `DELETE` | `/frank-seo/v1/pages/{id}`           | Delete page audit           |
| `POST`   | `/frank-seo/v1/pages/bulk-delete`    | Bulk delete audits          |
| `POST`   | `/frank-seo/v1/issues/{id}/status`   | Update issue status         |
| `GET`    | `/frank-seo/v1/settings`             | Get plugin settings         |
| `POST`   | `/frank-seo/v1/settings`             | Update plugin settings      |

## 📊 Score Calculation

```
Score = 100 - (Errors × 15) - (Warnings × 5) - (Notices × 2)
```
*Note: The score is securely clamped between 0 and 100.*

## 📝 Changelog

### 1.0.9 (2026-06-10)
- **Feature**: Refactored the scanning process to run entirely as an asynchronous background job, preventing timeouts when switching browser tabs.
- **Enhancement**: Updated dashboard UI to intelligently poll and resume scanning progress if the user navigates away and comes back.

### 1.0.8
- Added a collapse toggle button to the main dashboard sidebar for a cleaner UI experience.

### 1.0.7
- Added "Global Features Integration" toggles in Settings so admins can easily disable major components.
- Updated "Comparison" tab to showcase newly added features.

### 1.0.6
- Added WooCommerce SEO tags (Product Schema and OpenGraph Pricing).
- Added Local Business SEO settings and Auto-Schema Generation.
- Added Advanced Social Media Override UI (OpenGraph/Twitter).
- Added Missing Image Alt Tag Auto-injector (`the_content` filter).
- Added Custom JSON-LD Schema builder for posts/pages.
- Added WordPress FAQ blocks Auto-Schema Generation.

## 📄 License

GPLv2 or later — [License](https://www.gnu.org/licenses/gpl-2.0.html)
