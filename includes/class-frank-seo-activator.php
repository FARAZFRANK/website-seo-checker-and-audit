<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Fired during plugin activation.
 */

class Frank_SEO_Activator {

	/**
	 * Create database tables on activation.
	 */
	public static function activate() {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();

		// Pages table
		$table_pages = $wpdb->prefix . 'frank_audit_pages';
		$sql_pages = "CREATE TABLE $table_pages (
			page_id bigint(20) unsigned NOT NULL,
			url varchar(2048) NOT NULL,
			title text NOT NULL,
			seo_score tinyint(3) NOT NULL DEFAULT 0,
			errors_count mediumint(9) NOT NULL DEFAULT 0,
			warnings_count mediumint(9) NOT NULL DEFAULT 0,
			notices_count mediumint(9) NOT NULL DEFAULT 0,
			last_scanned_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
			PRIMARY KEY  (page_id)
		) $charset_collate;";

		// Issues table
		$table_issues = $wpdb->prefix . 'frank_audit_issues';
		$sql_issues = "CREATE TABLE $table_issues (
			issue_id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			page_id bigint(20) unsigned NOT NULL,
			issue_type varchar(100) NOT NULL,
			severity varchar(20) NOT NULL,
			status varchar(20) NOT NULL DEFAULT 'Open',
			details text NOT NULL,
			first_detected_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
			last_scanned_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
			PRIMARY KEY  (issue_id),
			KEY page_id (page_id)
		) $charset_collate;";

		// History table
		$table_history = $wpdb->prefix . 'frank_audit_history';
		$sql_history = "CREATE TABLE $table_history (
			history_id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			issue_id bigint(20) unsigned NOT NULL,
			page_id bigint(20) unsigned NOT NULL,
			user_id bigint(20) unsigned NOT NULL,
			action varchar(50) NOT NULL,
			old_value text NOT NULL,
			new_value text NOT NULL,
			created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
			PRIMARY KEY  (history_id),
			KEY issue_id (issue_id),
			KEY page_id (page_id)
		) $charset_collate;";

		// Links table
		$table_links = $wpdb->prefix . 'frank_audit_links';
		$sql_links = "CREATE TABLE $table_links (
			link_id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			page_id bigint(20) unsigned NOT NULL,
			url varchar(2048) NOT NULL,
			anchor_text text NOT NULL,
			link_type varchar(20) NOT NULL,
			status_code int(5) DEFAULT NULL,
			PRIMARY KEY  (link_id),
			KEY page_id (page_id),
			KEY url (url(255))
		) $charset_collate;";

		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql_pages );
		dbDelta( $sql_issues );
		dbDelta( $sql_history );
		dbDelta( $sql_links );
	}
}
