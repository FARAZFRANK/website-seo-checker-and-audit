<?php
/**
 * Plugin Name:       Frank Website SEO Checker And Audit
 * Description:       A complete on-page SEO audit plugin with a React-powered dashboard. Crawls pages, detects SEO issues, and maintains history.
 * Version:           1.0.9
 * Author:			  FARAZFRANK
 * Author URI:        https://wpfrank.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       frank-website-seo-checker-and-audit
 * Domain Path:       /languages
 *
 */

// If this file is called directly, abort.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Currently plugin version.
 */
define('FRANK_SEO_AUDIT_VERSION', '1.0.9');

/**
 * Plugin directory path.
 */
define('FRANK_SEO_AUDIT_DIR', plugin_dir_path(__FILE__));

/**
 * Plugin directory URL.
 */
define('FRANK_SEO_AUDIT_URL', plugin_dir_url(__FILE__));

/**
 * The code that runs during plugin activation.
 */
function frank_seo_audit_activate()
{
	require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-activator.php';
	Frank_SEO_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 */
function frank_seo_audit_deactivate()
{
	// Require deactivator if needed in the future
}

register_activation_hook(__FILE__, 'frank_seo_audit_activate');
register_deactivation_hook(__FILE__, 'frank_seo_audit_deactivate');

/**
 * Flush rewrite rules automatically when permalink structure changes.
 */
add_action( 'update_option_permalink_structure', 'frank_seo_flush_rules_on_permalink_change' );
function frank_seo_flush_rules_on_permalink_change() {
	flush_rewrite_rules();
}

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-admin.php';
require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-rest-api.php';
require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-auditor.php';
require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-meta-renderer.php';
require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-schema-builder.php';
require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-redirect-manager.php';
require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-sitemap.php';
require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-image-optimizer.php';
require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-bot-blocker.php';
require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-breadcrumbs.php';

/**
 * Begins execution of the plugin.
 */
function frank_seo_audit_run()
{
	$plugin_admin = new Frank_SEO_Admin();
	$plugin_admin->init();

	$plugin_rest_api = new Frank_SEO_REST_API();
	$plugin_rest_api->init();

	// Initialize Front-End rendering engines
	$meta_renderer = new Frank_SEO_Meta_Renderer();
	$meta_renderer->init();

	$schema_builder = new Frank_SEO_Schema_Builder();
	$schema_builder->init();

	// Initialize Redirection & 404 Interceptor
	$redirect_manager = new Frank_SEO_Redirect_Manager();
	$redirect_manager->init();

	// Initialize Dynamic XML Sitemap Engine
	$sitemap_engine = new Frank_SEO_Sitemap();
	$sitemap_engine->init();

	// Initialize Image Optimizer
	$image_optimizer = new Frank_SEO_Image_Optimizer();
	$image_optimizer->init();

	// Initialize AI Bot Blocker
	$bot_blocker = new Frank_SEO_Bot_Blocker();
	$bot_blocker->init();

	// Initialize Breadcrumbs System
	$breadcrumbs = new Frank_SEO_Breadcrumbs();
	$breadcrumbs->init();

	// Run automatic DB upgrades on version mismatch
	$db_version = get_option('frank_seo_db_version');
	if (!$db_version || $db_version !== FRANK_SEO_AUDIT_VERSION) {
		require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-activator.php';
		Frank_SEO_Activator::activate();
		update_option('frank_seo_db_version', FRANK_SEO_AUDIT_VERSION);
	}
}
frank_seo_audit_run();

// Register custom cron schedules
add_filter('cron_schedules', 'frank_seo_add_cron_schedules');
function frank_seo_add_cron_schedules($schedules)
{
	$schedules['weekly'] = array(
		'interval' => 7 * 24 * 60 * 60,
		'display' => esc_html__('Once Weekly', 'frank-website-seo-checker-and-audit'),
	);
	$schedules['monthly'] = array(
		'interval' => 30 * 24 * 60 * 60,
		'display' => esc_html__('Once Monthly', 'frank-website-seo-checker-and-audit'),
	);
	return $schedules;
}

// Hook cron task
add_action('frank_seo_scheduled_scan', 'frank_seo_run_scheduled_scan');
function frank_seo_run_scheduled_scan()
{
	$pages = get_posts(array(
		'post_type' => array('post', 'page'),
		'post_status' => 'publish',
		'posts_per_page' => -1,
		'fields' => 'ids',
	));

	if (!empty($pages)) {
		$auditor = new Frank_SEO_Auditor();
		foreach ($pages as $pid) {
			$auditor->audit_post($pid);
		}
	}

	frank_seo_send_email_report('scheduled');
}

// Send email report
function frank_seo_send_email_report($trigger_type = 'manual')
{
	$settings = get_option('frank_seo_settings', array());

	// Check if this specific email trigger is enabled
	if ($trigger_type === 'manual') {
		if (empty($settings['enableScanEmail'])) {
			return false;
		}
	} else {
		if (empty($settings['enableScheduledEmail'])) {
			return false;
		}
	}

	$recipients = isset($settings['emailRecipients']) ? sanitize_text_field($settings['emailRecipients']) : get_option('admin_email');
	if (empty($recipients)) {
		return false;
	}

	// Compile multiple emails
	$to = array_map('trim', explode(',', $recipients));

	// Fetch current summary stats
	global $wpdb;
	$table_pages = $wpdb->prefix . 'frank_audit_pages';
	$table_issues = $wpdb->prefix . 'frank_audit_issues';

	// Check if tables exist
	if ($wpdb->get_var("SHOW TABLES LIKE '$table_pages'") !== $table_pages) {
		return false;
	}

	// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
	$total_pages = (int) $wpdb->get_var("SELECT COUNT(*) FROM $table_pages");
	$total_issues = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_issues WHERE status = %s", 'Open'));
	$average_score = (int) $wpdb->get_var("SELECT AVG(seo_score) FROM $table_pages");

	// Fetch top 5 pages with lowest scores
	$low_score_pages = $wpdb->get_results("SELECT url, title, seo_score, errors_count, warnings_count FROM $table_pages ORDER BY seo_score ASC LIMIT 5");
	// phpcs:enable

	// Build the HTML email content
	$subject = sprintf('[%s] SEO Audit Report - %s', get_bloginfo('name'), date('M d, Y'));

	// Setup headers
	$headers = array('Content-Type: text/html; charset=UTF-8');

	// Determine title and subtitle based on trigger
	$title = $trigger_type === 'manual' ? 'SEO Audit Scan Completed' : 'Scheduled SEO Audit Report';
	$subtitle = $trigger_type === 'manual' ? 'A manual crawl and SEO check has successfully finished on your website.' : 'Your automated background SEO check-up report is ready.';

	$score_color = '#ef4444'; // Red
	if ($average_score >= 90) {
		$score_color = '#10b981'; // Green
	} elseif ($average_score >= 70) {
		$score_color = '#f59e0b'; // Orange
	}

	$issues_color = $total_issues > 0 ? '#ef4444' : '#10b981';

	// HTML body
	$body = '
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8">
		<title>' . esc_html($subject) . '</title>
		<style>
			body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 20px; }
			.container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
			.header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px; text-align: center; color: #ffffff; }
			.header h1 { margin: 0 0 10px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
			.header p { margin: 0; font-size: 14px; opacity: 0.9; }
			.content { padding: 30px; }
			.grid { display: flex; gap: 15px; margin-bottom: 30px; }
			.card { flex: 1; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; }
			.card-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; }
			.card-value { font-size: 28px; font-weight: 800; color: #0f172a; }
			.table-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 15px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; }
			.table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
			.table th { text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
			.table td { padding: 12px 10px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
			.table tr:last-child td { border-bottom: none; }
			.score-badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 12px; color: #ffffff; }
			.btn-container { text-align: center; margin-top: 10px; }
			.btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: #ffffff !important; padding: 12px 30px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3); }
			.footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
			.footer a { color: #6366f1; text-decoration: none; }
		</style>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<h1>' . esc_html($title) . '</h1>
				<p>' . esc_html($subtitle) . '</p>
			</div>
			<div class="content">
				<div class="grid">
					<div class="card">
						<div class="card-label">Pages Scanned</div>
						<div class="card-value">' . $total_pages . '</div>
					</div>
					<div class="card">
						<div class="card-label">Open Issues</div>
						<div class="card-value" style="color: ' . $issues_color . '">' . $total_issues . '</div>
					</div>
					<div class="card">
						<div class="card-label">Avg SEO Score</div>
						<div class="card-value" style="color: ' . $score_color . '">' . $average_score . '%</div>
					</div>
				</div>';

	if (!empty($low_score_pages)) {
		$body .= '<h2 class="table-title">Pages Requiring Attention</h2>
				<table class="table">
					<thead>
						<tr>
							<th>Page Title</th>
							<th>Score</th>
							<th>Errors</th>
							<th>Warnings</th>
						</tr>
					</thead>
					<tbody>';
		foreach ($low_score_pages as $p) {
			$p_color = '#ef4444';
			if ($p->seo_score >= 90) {
				$p_color = '#10b981';
			} elseif ($p->seo_score >= 70) {
				$p_color = '#f59e0b';
			}

			$body .= '<tr>
				<td>
					<div style="font-weight: 600; color: #0f172a;">' . esc_html($p->title) . '</div>
					<div style="font-size: 11px; color: #64748b; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' . esc_html($p->url) . '</div>
				</td>
				<td>
					<span class="score-badge" style="background-color: ' . $p_color . ';">' . $p->seo_score . '%</span>
				</td>
				<td style="color: #ef4444; font-weight: 600;">' . $p->errors_count . '</td>
				<td style="color: #f59e0b; font-weight: 600;">' . $p->warnings_count . '</td>
			</tr>';
		}
		$body .= '</tbody>
				</table>';
	}

	$body .= '
				<div class="btn-container">
					<a href="' . esc_url(admin_url('admin.php?page=frank-seo-audit')) . '" class="btn">View Full SEO Dashboard</a>
				</div>
			</div>
			<div class="footer">
				<p>This report was generated by Frank Website SEO Checker And Audit plugin on <a href="' . esc_url(home_url()) . '">' . esc_html(get_bloginfo('name')) . '</a>.</p>
			</div>
		</div>
	</body>
	</html>';

	return wp_mail($to, $subject, $body, $headers);
}
