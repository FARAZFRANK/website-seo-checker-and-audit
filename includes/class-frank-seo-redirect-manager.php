<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Handles 301/302/307 redirections and logs 404 hits.
 */
class Frank_SEO_Redirect_Manager {

	/**
	 * Register actions.
	 */
	public function init() {
		add_action( 'template_redirect', array( $this, 'handle_redirects_and_404s' ), 1 );
	}

	/**
	 * Intercepts 404 queries, performs redirection, or logs the request.
	 */
	public function handle_redirects_and_404s() {
		// Run only on front-end 404 requests
		if ( ! is_404() ) {
			return;
		}

		global $wpdb;

		// Clean and parse URL (path relative to WordPress root)
		$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
		$parsed_url = wp_parse_url( $request_uri );
		$path = isset( $parsed_url['path'] ) ? $parsed_url['path'] : '';

		// Strip site home subdirectory from request if WordPress is installed in a subdirectory
		$site_path = wp_parse_url( home_url(), PHP_URL_PATH );
		if ( ! empty( $site_path ) && $site_path !== '/' ) {
			if ( strpos( $path, $site_path ) === 0 ) {
				$path = substr( $path, strlen( $site_path ) );
			}
		}

		$path = '/' . ltrim( $path, '/' );

		// 1. Check if a redirection rule exists for this path
		$table_redirects = $wpdb->prefix . 'frank_seo_redirects';
		
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$rule = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_redirects WHERE url_from = %s", $path ) );

		if ( $rule ) {
			// Increment hits counter
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->query( $wpdb->prepare( "UPDATE $table_redirects SET hits = hits + 1 WHERE id = %d", (int) $rule->id ) );

			// Trigger redirection redirecting to absolute URL or custom target
			$redirect_url = $rule->url_to;
			if ( strpos( $redirect_url, 'http' ) !== 0 ) {
				$redirect_url = home_url( $redirect_url );
			}

			wp_redirect( $redirect_url, (int) $rule->status );
			exit;
		}

		// 2. If no rule is found, log this 404 hit
		$table_404 = $wpdb->prefix . 'frank_seo_404_logs';
		$referer = isset( $_SERVER['HTTP_REFERER'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_REFERER'] ) ) : '';
		$user_agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '';

		// Check if this path already exists in the 404 log table
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$log_entry = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_404 WHERE url = %s", $path ) );

		if ( $log_entry ) {
			// Update hits count, last hit date, and referer
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->update(
				$table_404,
				array(
					'hits'     => (int) $log_entry->hits + 1,
					'last_hit' => current_time( 'mysql' ),
					'referer'  => $referer,
				),
				array( 'id' => (int) $log_entry->id )
			);
		} else {
			// Create new 404 log entry
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$wpdb->insert(
				$table_404,
				array(
					'url'        => $path,
					'referer'    => $referer,
					'user_agent' => $user_agent,
					'hits'       => 1,
					'last_hit'   => current_time( 'mysql' ),
				)
			);
		}
	}
}
