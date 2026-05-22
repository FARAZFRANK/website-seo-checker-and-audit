<?php
/**
 * Plugin Name:       Frank Website SEO Checker And Audit
 * Plugin URI:        https://wpfrank.com/
 * Description:       A complete on-page SEO audit plugin with a React-powered dashboard. Crawls pages, detects SEO issues, and maintains history.
 * Version:           1.0.1
 * Author:            WPFrank
 * Author URI:        https://wpfrank.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       frank-website-seo-checker-and-audit
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 */
define( 'FRANK_SEO_AUDIT_VERSION', '1.0.1' );

/**
 * Plugin directory path.
 */
define( 'FRANK_SEO_AUDIT_DIR', plugin_dir_path( __FILE__ ) );

/**
 * Plugin directory URL.
 */
define( 'FRANK_SEO_AUDIT_URL', plugin_dir_url( __FILE__ ) );

/**
 * The code that runs during plugin activation.
 */
function activate_frank_seo_audit() {
	require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-activator.php';
	Frank_SEO_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 */
function deactivate_frank_seo_audit() {
	// Require deactivator if needed in the future
}

register_activation_hook( __FILE__, 'activate_frank_seo_audit' );
register_deactivation_hook( __FILE__, 'deactivate_frank_seo_audit' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-admin.php';
require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-rest-api.php';
require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-auditor.php';

/**
 * Begins execution of the plugin.
 */
function run_frank_seo_audit() {
	$plugin_admin = new Frank_SEO_Admin();
	$plugin_admin->init();

	$plugin_rest_api = new Frank_SEO_REST_API();
	$plugin_rest_api->init();
}
run_frank_seo_audit();
