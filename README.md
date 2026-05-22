# Website SEO Checker And Audit

A comprehensive on-page SEO audit plugin for WordPress with a modern React-powered admin dashboard.

## Features

- **One-Click Global Audit** — Scan all published posts and pages for SEO issues.
- **SEO Score (0–100%)** — Automated health score based on errors, warnings, and notices.
- **Issue Detection** — Missing meta titles/descriptions, heading structure problems, missing alt tags, and more.
- **Inbound & Outbound Link Audit** — Tracks internal/external links with HTTP status code verification.
- **Audit History** — Logs scans and status changes with timestamps and user attribution.
- **Column Toggle** — Show/hide table columns to focus on specific data points.
- **Bulk Actions** — Select and delete multiple page audits at once.
- **Sorting & Filtering** — Sort by any column, filter by score range (Excellent / Fair / Critical).
- **Settings Panel** — Configure crawl depth, interval, schedule, and toggle audit checks.

## Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Backend    | PHP (OOP), WordPress REST API         |
| Database   | MySQL / MariaDB (4 custom tables)     |
| Frontend   | React 18, Vite, Material UI (MUI)     |
| Build      | Vite → `assets/dist/`                 |

## Project Structure

```
frank-website-seo-checker-and-audit/
├── frank-website-seo-checker-and-audit.php  # Main plugin file
├── readme.txt                               # WordPress.org readme
├── includes/
│   ├── class-frank-seo-activator.php        # DB table creation on activation
│   ├── class-frank-seo-admin.php            # Admin menu & asset enqueueing
│   ├── class-frank-seo-auditor.php          # Core crawl & audit engine
│   └── class-frank-seo-rest-api.php         # REST API endpoints
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

## Development

### Prerequisites

- WordPress 5.8+
- PHP 7.4+
- Node.js 18+

### Setup

```bash
# Clone into your plugins directory
cd wp-content/plugins/
git clone https://github.com/user/frank-website-seo-checker-and-audit.git

# Install frontend dependencies
cd frank-website-seo-checker-and-audit/app
npm install

# Build for production
npm run build

# Or run dev server (for development)
npm run dev
```

### Building

The Vite build outputs to `assets/dist/` which is loaded by the plugin:

```bash
cd app
npm run build
```

## REST API Endpoints

All endpoints require `manage_options` capability (admin only).

| Method   | Endpoint                              | Description              |
|----------|---------------------------------------|--------------------------|
| `GET`    | `/frank-seo/v1/summary`              | Dashboard summary stats  |
| `GET`    | `/frank-seo/v1/pages`                | List audited pages       |
| `GET`    | `/frank-seo/v1/pages/{id}`           | Page audit details       |
| `DELETE` | `/frank-seo/v1/pages/{id}`           | Delete page audit        |
| `POST`   | `/frank-seo/v1/pages/bulk-delete`    | Bulk delete audits       |
| `POST`   | `/frank-seo/v1/scan`                 | Trigger audit scan       |
| `POST`   | `/frank-seo/v1/issues/{id}/status`   | Update issue status      |
| `GET`    | `/frank-seo/v1/settings`             | Get plugin settings      |
| `POST`   | `/frank-seo/v1/settings`             | Update plugin settings   |

## Score Calculation

```
Score = 100 - (Errors × 15) - (Warnings × 5) - (Notices × 2)
```

Clamped between 0 and 100.

## License

GPLv2 or later — [License](https://www.gnu.org/licenses/gpl-2.0.html)
