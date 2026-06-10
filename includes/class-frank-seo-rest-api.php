<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * The REST API functionality of the plugin.
 */

class Frank_SEO_REST_API {

	public function init() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		$namespace = 'frank-seo/v1';

		register_rest_route( $namespace, '/summary', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_summary' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );

		register_rest_route( $namespace, '/pages', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_pages' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );

		register_rest_route( $namespace, '/history', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_history' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );

		register_rest_route( $namespace, '/pages/(?P<id>\d+)', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_page_details' ),
			'permission_callback' => array( $this, 'check_permission' ),
			'args'                => array(
				'id' => array(
					'validate_callback' => function($param, $request, $key) {
						return is_numeric( $param );
					},
					'sanitize_callback' => 'absint',
				),
			),
		) ) ;

		register_rest_route( $namespace, '/pages/(?P<id>\d+)', array(
			'methods'             => WP_REST_Server::DELETABLE,
			'callback'            => array( $this, 'delete_page' ),
			'permission_callback' => array( $this, 'check_permission' ),
			'args'                => array(
				'id' => array(
					'validate_callback' => function($param, $request, $key) {
						return is_numeric( $param );
					},
					'sanitize_callback' => 'absint',
				),
			),
		) );

		register_rest_route( $namespace, '/pages/bulk-delete', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'bulk_delete_pages' ),
			'permission_callback' => array( $this, 'check_permission' ),
			'args'                => array(
				'ids' => array(
					'required'          => true,
					'validate_callback' => function($param, $request, $key) {
						return is_array( $param );
					},
					'sanitize_callback' => function($param, $request, $key) {
						return map_deep( $param, 'absint' );
					},
				),
			),
		) );

		register_rest_route( $namespace, '/scan', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'scan_all' ),
			'permission_callback' => array( $this, 'check_permission' ),
			'args'                => array(
				'page_ids' => array(
					'required'          => false,
					'validate_callback' => function($param, $request, $key) {
						return is_array( $param );
					},
					'sanitize_callback' => function($param, $request, $key) {
						return map_deep( $param, 'absint' );
					},
				),
			),
		) );

		register_rest_route( $namespace, '/pages-to-scan', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_pages_to_scan' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );

		register_rest_route( $namespace, '/scan/complete', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'scan_complete_report' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );

		register_rest_route( $namespace, '/issues/(?P<id>\d+)/status', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'update_issue_status' ),
			'permission_callback' => array( $this, 'check_permission' ),
			'args'                => array(
				'id' => array(
					'validate_callback' => function($param, $request, $key) {
						return is_numeric( $param );
					},
					'sanitize_callback' => 'absint',
				),
				'status' => array(
					'required' => true,
					'validate_callback' => function($param, $request, $key) {
						return in_array( $param, array('Open', 'Ignored', 'Fixed') );
					},
					'sanitize_callback' => 'sanitize_text_field',
				),
			),
		) );

		register_rest_route( $namespace, '/settings', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_settings' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );

		register_rest_route( $namespace, '/settings', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'update_settings' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );

		register_rest_route( $namespace, '/reset', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'reset_plugin' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );

		// Redirects routes
		register_rest_route( $namespace, '/redirects', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_redirects' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );

		register_rest_route( $namespace, '/redirects', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'save_redirect' ),
			'permission_callback' => array( $this, 'check_permission' ),
			'args'                => array(
				'url_from' => array(
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
				),
				'url_to' => array(
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
				),
				'status' => array(
					'required'          => false,
					'sanitize_callback' => 'absint',
				),
			),
		) );

		register_rest_route( $namespace, '/redirects/(?P<id>\d+)', array(
			'methods'             => WP_REST_Server::DELETABLE,
			'callback'            => array( $this, 'delete_redirect' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );

		// 404 Logs routes
		register_rest_route( $namespace, '/logs-404', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_404_logs' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );

		register_rest_route( $namespace, '/logs-404/(?P<id>\d+)', array(
			'methods'             => WP_REST_Server::DELETABLE,
			'callback'            => array( $this, 'delete_404_log' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );

		register_rest_route( $namespace, '/logs-404/clear', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'clear_404_logs' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );

		// Competitor Audit route
		register_rest_route( $namespace, '/competitor-audit', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'run_competitor_audit' ),
			'permission_callback' => array( $this, 'check_permission' ),
			'args'                => array(
				'url' => array(
					'required'          => true,
					'sanitize_callback' => 'esc_url_raw',
				),
			),
		) );

		// AI Optimization route
		register_rest_route( $namespace, '/seo-ai/generate', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'generate_seo_meta_ai' ),
			'permission_callback' => array( $this, 'check_permission' ),
		) );
	}

	public function check_permission() {
		return current_user_can( 'manage_options' );
	}

	public function get_summary( $request ) {
		global $wpdb;
		$table_pages = $wpdb->prefix . 'frank_audit_pages';
		$table_issues = $wpdb->prefix . 'frank_audit_issues';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$total_pages = $wpdb->get_var( "SELECT COUNT(*) FROM $table_pages" );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$total_issues = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table_issues WHERE status = %s", 'Open' ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$average_score = $wpdb->get_var( "SELECT AVG(seo_score) FROM $table_pages" );

		return rest_ensure_response( array(
			'total_pages' => (int) $total_pages,
			'total_issues' => (int) $total_issues,
			'average_score' => (int) $average_score,
		) );
	}

	public function get_pages( $request ) {
		global $wpdb;
		$table_pages = $wpdb->prefix . 'frank_audit_pages';

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$pages = $wpdb->get_results( "
			SELECT p.*,
				(SELECT COUNT(*) FROM {$wpdb->prefix}frank_audit_links l WHERE l.page_id = p.page_id AND l.link_type = 'internal') as internal_links,
				(SELECT COUNT(*) FROM {$wpdb->prefix}frank_audit_links l WHERE l.page_id = p.page_id AND l.link_type = 'external') as external_links
			FROM $table_pages p 
			ORDER BY p.last_scanned_at DESC LIMIT 100
		", ARRAY_A );
		// phpcs:enable
		foreach ( $pages as &$page ) {
			$page['post_type'] = get_post_type( $page['page_id'] ) ?: 'post';
			$page['post_date'] = get_post_field( 'post_date', $page['page_id'] ) ?: '';
		}
		unset( $page );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$total = $wpdb->get_var( "SELECT COUNT(*) FROM $table_pages" );

		return rest_ensure_response( array(
			'pages' => $pages,
			'total' => (int) $total
		) );
	}

	public function get_history( $request ) {
		global $wpdb;
		$table_history = $wpdb->prefix . 'frank_audit_history';
		$table_pages = $wpdb->prefix . 'frank_audit_pages';
		$table_issues = $wpdb->prefix . 'frank_audit_issues';

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$history = $wpdb->get_results( "
			SELECT h.*, p.title as page_title, i.issue_type, i.severity 
			FROM $table_history h
			LEFT JOIN $table_pages p ON h.page_id = p.page_id
			LEFT JOIN $table_issues i ON h.issue_id = i.issue_id
			ORDER BY h.created_at DESC 
			LIMIT 100
		", ARRAY_A );
		// phpcs:enable

		// Hydrate user display names
		foreach ( $history as &$item ) {
			$user_id = (int) $item['user_id'];
			$user_data = get_userdata( $user_id );
			$item['user_name'] = $user_data ? $user_data->display_name : __( 'Unknown User', 'frank-website-seo-checker-and-audit' );
		}

		return rest_ensure_response( array( 'history' => $history ) );
	}

	public function get_page_details( $request ) {
		global $wpdb;
		$page_id = absint( $request->get_param( 'id' ) );
		$table_pages = $wpdb->prefix . 'frank_audit_pages';
		$table_issues = $wpdb->prefix . 'frank_audit_issues';
		$table_links = $wpdb->prefix . 'frank_audit_links';
		$table_history = $wpdb->prefix . 'frank_audit_history';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$page = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_pages WHERE page_id = %d", $page_id ), ARRAY_A );
		if ( ! $page ) {
			return new WP_Error( 'not_found', 'Page not found in audit database', array( 'status' => 404 ) );
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$page['linking_from_count'] = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(DISTINCT page_id) FROM $table_links WHERE url = %s AND link_type = 'internal'", $page['url'] ) );

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$issues = $wpdb->get_results( $wpdb->prepare( "
			SELECT i.*, 
				(SELECT MAX(created_at) FROM $table_history WHERE issue_id = i.issue_id AND action = 'Status Change') as status_updated_at
			FROM $table_issues i 
			WHERE i.page_id = %d 
			ORDER BY FIELD(i.severity, 'Error', 'Warning', 'Notice')
		", $page_id ), ARRAY_A );
		// phpcs:enable
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$links = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table_links WHERE page_id = %d ORDER BY link_id ASC", $page_id ), ARRAY_A );

		return rest_ensure_response( array(
			'page' => $page,
			'issues' => $issues,
			'links' => $links
		) );
	}

	public function delete_page( $request ) {
		global $wpdb;
		$page_id = absint( $request->get_param( 'id' ) );
		$table_pages = $wpdb->prefix . 'frank_audit_pages';
		$table_issues = $wpdb->prefix . 'frank_audit_issues';
		$table_history = $wpdb->prefix . 'frank_audit_history';
		$table_links = $wpdb->prefix . 'frank_audit_links';

		// Verify page exists
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$page = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_pages WHERE page_id = %d", $page_id ) );
		if ( ! $page ) {
			return new WP_Error( 'not_found', 'Page not found', array( 'status' => 404 ) );
		}

		// Delete from all four tables
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->delete( $table_pages, array( 'page_id' => $page_id ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->delete( $table_issues, array( 'page_id' => $page_id ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->delete( $table_history, array( 'page_id' => $page_id ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->delete( $table_links, array( 'page_id' => $page_id ) );

		return rest_ensure_response( array( 'success' => true, 'page_id' => $page_id ) );
	}

	public function bulk_delete_pages( $request ) {
		global $wpdb;
		$page_ids = $request->get_param( 'ids' );

		if ( empty( $page_ids ) || ! is_array( $page_ids ) ) {
			return new WP_Error( 'invalid_params', 'Invalid or empty IDs list', array( 'status' => 400 ) );
		}

		$page_ids = map_deep( $page_ids, 'absint' );
		$table_pages = $wpdb->prefix . 'frank_audit_pages';
		$table_issues = $wpdb->prefix . 'frank_audit_issues';
		$table_history = $wpdb->prefix . 'frank_audit_history';
		$table_links = $wpdb->prefix . 'frank_audit_links';

		$deleted_count = 0;
		foreach ( $page_ids as $page_id ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$deleted_pages = $wpdb->delete( $table_pages, array( 'page_id' => $page_id ) );
			if ( $deleted_pages ) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$wpdb->delete( $table_issues, array( 'page_id' => $page_id ) );
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$wpdb->delete( $table_history, array( 'page_id' => $page_id ) );
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$wpdb->delete( $table_links, array( 'page_id' => $page_id ) );
				$deleted_count++;
			}
		}

		return rest_ensure_response( array( 'success' => true, 'deleted_count' => $deleted_count ) );
	}

	public function update_issue_status( $request ) {
		global $wpdb;
		$issue_id = absint( $request->get_param( 'id' ) );
		$new_status = sanitize_text_field( $request->get_param( 'status' ) );
		$table_issues = $wpdb->prefix . 'frank_audit_issues';
		$table_history = $wpdb->prefix . 'frank_audit_history';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$issue = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_issues WHERE issue_id = %d", $issue_id ) );
		if ( ! $issue ) {
			return new WP_Error( 'not_found', 'Issue not found', array( 'status' => 404 ) );
		}

		$old_status = $issue->status;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$updated = $wpdb->update(
			$table_issues,
			array( 'status' => $new_status ),
			array( 'issue_id' => $issue_id )
		);

		if ( $updated !== false && $old_status !== $new_status ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$wpdb->insert(
				$table_history,
				array(
					'issue_id' => $issue_id,
					'page_id' => $issue->page_id,
					'user_id' => get_current_user_id(),
					'action' => 'Status Change',
					'old_value' => $old_status,
					'new_value' => $new_status,
					'created_at' => current_time('mysql')
				)
			);
		}

		return rest_ensure_response( array( 'success' => true, 'new_status' => $new_status ) );
	}

	public function scan_all( $request ) {
		$page_ids = $request->get_param( 'page_ids' );

		if ( ! empty( $page_ids ) && is_array( $page_ids ) ) {
			$page_ids = map_deep( $page_ids, 'absint' );
			$pages = array();
			foreach ( $page_ids as $pid ) {
				$post = get_post($pid);
				if ($post && in_array($post->post_type, array('post', 'page'))) {
					$pages[] = $post;
				}
			}
		} else {
			$pages = get_posts( array(
				'post_type' => array('post', 'page'),
				'posts_per_page' => 20, // Limit to 20 per request to avoid timeouts
				'post_status' => 'publish'
			));
		}

		$auditor = new Frank_SEO_Auditor();
		$results = array();
		foreach ( $pages as $page ) {
			$results[] = $auditor->audit_post( $page->ID );
		}

		return rest_ensure_response( array( 'success' => true, 'scanned' => count($results), 'results' => $results ) );
	}

	public function get_pages_to_scan( $request ) {
		$posts = get_posts( array(
			'post_type'      => array( 'post', 'page' ),
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'fields'         => 'ids',
		) );

		return rest_ensure_response( array(
			'success' => true,
			'ids'     => array_map( 'intval', $posts ),
		) );
	}

	/**
	 * Get the current plugin settings.
	 */
	public function get_settings( $request ) {
		$settings = get_option( 'frank_seo_settings', array() );

		// Ensure all keys are populated with defaults if they don't exist
		$defaults = array(
			'xmlSitemaps'      => true,
			'excludePatterns'  => "*/wp-admin/*\n*/wp-includes/*\n*?replytocom=*",
			'crawlDepth'       => 3,
			'crawlInterval'    => 2,
			'schedule'         => 'Monthly',
			'checkMetaData'    => true,
			'checkAltTags'     => true,
			'checkBrokenLinks' => false,
			'excludeMenus'     => true,
			'excludeFooters'   => true,
			'excludeSidebars'  => true,
			'emailRecipients'  => get_option( 'admin_email' ),
			'enableScanEmail'  => false,
			'enableScheduledEmail' => false,
			'geminiApiKey'     => '',
			'localBusinessName' => '',
			'localBusinessType' => 'LocalBusiness',
			'localBusinessAddress' => '',
			'localBusinessCity' => '',
			'localBusinessZip' => '',
			'localBusinessPhone' => '',
		);

		$settings = wp_parse_args( $settings, $defaults );

		// Type cast variables to match javascript types exactly
		$settings['xmlSitemaps']      = (bool) $settings['xmlSitemaps'];
		$settings['crawlDepth']       = (int) $settings['crawlDepth'];
		$settings['crawlInterval']    = (float) $settings['crawlInterval'];
		$settings['checkMetaData']    = (bool) $settings['checkMetaData'];
		$settings['checkAltTags']     = (bool) $settings['checkAltTags'];
		$settings['checkBrokenLinks'] = (bool) $settings['checkBrokenLinks'];
		$settings['excludeMenus']     = (bool) $settings['excludeMenus'];
		$settings['excludeFooters']   = (bool) $settings['excludeFooters'];
		$settings['excludeSidebars']  = (bool) $settings['excludeSidebars'];
		$settings['enableScheduledEmail'] = (bool) $settings['enableScheduledEmail'];
		$settings['emailRecipients']  = sanitize_text_field( $settings['emailRecipients'] );
		$settings['geminiApiKey']     = isset( $settings['geminiApiKey'] ) ? sanitize_text_field( $settings['geminiApiKey'] ) : '';
		$settings['localBusinessName'] = isset( $settings['localBusinessName'] ) ? sanitize_text_field( $settings['localBusinessName'] ) : '';
		$settings['localBusinessType'] = isset( $settings['localBusinessType'] ) ? sanitize_text_field( $settings['localBusinessType'] ) : 'LocalBusiness';
		$settings['localBusinessAddress'] = isset( $settings['localBusinessAddress'] ) ? sanitize_text_field( $settings['localBusinessAddress'] ) : '';
		$settings['localBusinessCity'] = isset( $settings['localBusinessCity'] ) ? sanitize_text_field( $settings['localBusinessCity'] ) : '';
		$settings['localBusinessZip'] = isset( $settings['localBusinessZip'] ) ? sanitize_text_field( $settings['localBusinessZip'] ) : '';
		$settings['localBusinessPhone'] = isset( $settings['localBusinessPhone'] ) ? sanitize_text_field( $settings['localBusinessPhone'] ) : '';

		return rest_ensure_response( $settings );
	}

	/**
	 * Update the plugin settings.
	 */
	public function update_settings( $request ) {
		$params = $request->get_json_params();
		if ( empty( $params ) ) {
			return new WP_Error( 'invalid_data', 'No settings data provided', array( 'status' => 400 ) );
		}

		// Sanitize inputs
		$sanitized_settings = array();
		$sanitized_settings['xmlSitemaps']      = isset( $params['xmlSitemaps'] ) ? (bool) $params['xmlSitemaps'] : true;
		$sanitized_settings['excludePatterns']  = isset( $params['excludePatterns'] ) ? sanitize_textarea_field( $params['excludePatterns'] ) : '';
		$sanitized_settings['crawlDepth']       = isset( $params['crawlDepth'] ) ? min( 5, max( 1, intval( $params['crawlDepth'] ) ) ) : 3;
		$sanitized_settings['crawlInterval']    = isset( $params['crawlInterval'] ) ? min( 5.0, max( 0.5, floatval( $params['crawlInterval'] ) ) ) : 2.0;

		$schedule = isset( $params['schedule'] ) ? sanitize_text_field( $params['schedule'] ) : 'Monthly';
		if ( ! in_array( $schedule, array( 'Disabled', 'Daily', 'Weekly', 'Monthly' ) ) ) {
			$schedule = 'Monthly';
		}
		$sanitized_settings['schedule'] = $schedule;

		$sanitized_settings['checkMetaData']    = isset( $params['checkMetaData'] ) ? (bool) $params['checkMetaData'] : true;
		$sanitized_settings['checkAltTags']     = isset( $params['checkAltTags'] ) ? (bool) $params['checkAltTags'] : true;
		$sanitized_settings['checkBrokenLinks'] = isset( $params['checkBrokenLinks'] ) ? (bool) $params['checkBrokenLinks'] : false;
		$sanitized_settings['excludeMenus']     = isset( $params['excludeMenus'] ) ? (bool) $params['excludeMenus'] : true;
		$sanitized_settings['excludeFooters']   = isset( $params['excludeFooters'] ) ? (bool) $params['excludeFooters'] : true;
		$sanitized_settings['excludeSidebars']  = isset( $params['excludeSidebars'] ) ? (bool) $params['excludeSidebars'] : true;

		$sanitized_settings['emailRecipients']  = isset( $params['emailRecipients'] ) ? sanitize_text_field( $params['emailRecipients'] ) : get_option( 'admin_email' );
		$sanitized_settings['enableScanEmail']  = isset( $params['enableScanEmail'] ) ? (bool) $params['enableScanEmail'] : false;
		$sanitized_settings['enableScheduledEmail'] = isset( $params['enableScheduledEmail'] ) ? (bool) $params['enableScheduledEmail'] : false;
		$sanitized_settings['geminiApiKey']     = isset( $params['geminiApiKey'] ) ? sanitize_text_field( $params['geminiApiKey'] ) : '';
		
		$sanitized_settings['localBusinessName'] = isset( $params['localBusinessName'] ) ? sanitize_text_field( $params['localBusinessName'] ) : '';
		$sanitized_settings['localBusinessType'] = isset( $params['localBusinessType'] ) ? sanitize_text_field( $params['localBusinessType'] ) : 'LocalBusiness';
		$sanitized_settings['localBusinessAddress'] = isset( $params['localBusinessAddress'] ) ? sanitize_text_field( $params['localBusinessAddress'] ) : '';
		$sanitized_settings['localBusinessCity'] = isset( $params['localBusinessCity'] ) ? sanitize_text_field( $params['localBusinessCity'] ) : '';
		$sanitized_settings['localBusinessZip'] = isset( $params['localBusinessZip'] ) ? sanitize_text_field( $params['localBusinessZip'] ) : '';
		$sanitized_settings['localBusinessPhone'] = isset( $params['localBusinessPhone'] ) ? sanitize_text_field( $params['localBusinessPhone'] ) : '';

		update_option( 'frank_seo_settings', $sanitized_settings );

		// Update background cron schedule
		$this->update_cron_schedule( $sanitized_settings );

		return rest_ensure_response( array( 'success' => true, 'settings' => $sanitized_settings ) );
	}

	/**
	 * Reset the plugin by deleting all data and options.
	 */
	public function reset_plugin( $request ) {
		global $wpdb;
		
		$table_pages = $wpdb->prefix . 'frank_audit_pages';
		$table_issues = $wpdb->prefix . 'frank_audit_issues';
		$table_links = $wpdb->prefix . 'frank_audit_links';
		$table_history = $wpdb->prefix . 'frank_audit_history';
		$table_redirects = $wpdb->prefix . 'frank_seo_redirects';
		$table_404 = $wpdb->prefix . 'frank_seo_404_logs';

		// Empty all tables
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$wpdb->query( "TRUNCATE TABLE $table_pages" );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$wpdb->query( "TRUNCATE TABLE $table_issues" );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$wpdb->query( "TRUNCATE TABLE $table_links" );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$wpdb->query( "TRUNCATE TABLE $table_history" );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$wpdb->query( "TRUNCATE TABLE $table_redirects" );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$wpdb->query( "TRUNCATE TABLE $table_404" );

		// Delete options
		delete_option( 'frank_seo_settings' );
		delete_option( 'frank_seo_db_version' );

		return rest_ensure_response( array( 'success' => true, 'message' => 'Plugin reset successfully.' ) );
	}

	public function scan_complete_report( $request ) {
		if ( function_exists( 'frank_seo_send_email_report' ) ) {
			$sent = frank_seo_send_email_report( 'manual' );
			return rest_ensure_response( array( 'success' => true, 'email_sent' => $sent ) );
		}
		return rest_ensure_response( array( 'success' => false, 'message' => 'Email reporter function missing.' ) );
	}

	private function update_cron_schedule( $settings ) {
		// Clear existing scheduled hook
		wp_clear_scheduled_hook( 'frank_seo_scheduled_scan' );

		// If scheduled emails are enabled and schedule is not Disabled
		if ( ! empty( $settings['enableScheduledEmail'] ) && isset( $settings['schedule'] ) && $settings['schedule'] !== 'Disabled' ) {
			$frequency = strtolower( $settings['schedule'] ); // 'daily', 'weekly', 'monthly'
			wp_schedule_event( time() + 10, $frequency, 'frank_seo_scheduled_scan' );
		}
	}

	/**
	 * Get all redirects.
	 */
	public function get_redirects( $request ) {
		global $wpdb;
		$table_redirects = $wpdb->prefix . 'frank_seo_redirects';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$redirects = $wpdb->get_results( "SELECT * FROM $table_redirects ORDER BY created_at DESC", ARRAY_A );

		return rest_ensure_response( array(
			'success'   => true,
			'redirects' => $redirects,
		) );
	}

	/**
	 * Save/Create a redirect rule.
	 */
	public function save_redirect( $request ) {
		global $wpdb;
		$table_redirects = $wpdb->prefix . 'frank_seo_redirects';

		$id       = absint( $request->get_param( 'id' ) );
		$url_from = '/' . ltrim( sanitize_text_field( $request->get_param( 'url_from' ) ), '/' );
		$url_to   = sanitize_text_field( $request->get_param( 'url_to' ) );
		$status   = absint( $request->get_param( 'status' ) ) ?: 301;

		if ( ! in_array( $status, array( 301, 302, 307 ) ) ) {
			$status = 301;
		}

		if ( empty( $url_from ) || empty( $url_to ) ) {
			return new WP_Error( 'invalid_data', 'Source and Target URLs cannot be empty', array( 'status' => 400 ) );
		}

		if ( $id > 0 ) {
			// Update existing redirect
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->update(
				$table_redirects,
				array(
					'url_from' => $url_from,
					'url_to'   => $url_to,
					'status'   => $status,
				),
				array( 'id' => $id )
			);
		} else {
			// Check if source path already has a redirect rule to prevent duplicates
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
			$exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table_redirects WHERE url_from = %s", $url_from ) );
			if ( $exists ) {
				return new WP_Error( 'duplicate_rule', 'A redirect rule for this source path already exists.', array( 'status' => 400 ) );
			}

			// Insert new redirect rule
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$wpdb->insert(
				$table_redirects,
				array(
					'url_from'   => $url_from,
					'url_to'     => $url_to,
					'status'     => $status,
					'hits'       => 0,
					'created_at' => current_time( 'mysql' ),
				)
			);
			$id = $wpdb->insert_id;
		}

		return rest_ensure_response( array(
			'success' => true,
			'id'      => $id,
			'message' => 'Redirect rule saved successfully.',
		) );
	}

	/**
	 * Delete a redirect rule.
	 */
	public function delete_redirect( $request ) {
		global $wpdb;
		$id = absint( $request->get_param( 'id' ) );
		$table_redirects = $wpdb->prefix . 'frank_seo_redirects';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$deleted = $wpdb->delete( $table_redirects, array( 'id' => $id ) );

		if ( ! $deleted ) {
			return new WP_Error( 'not_found', 'Redirect rule not found.', array( 'status' => 404 ) );
		}

		return rest_ensure_response( array(
			'success' => true,
			'message' => 'Redirect rule deleted successfully.',
		) );
	}

	/**
	 * Get all 404 logs.
	 */
	public function get_404_logs( $request ) {
		global $wpdb;
		$table_404 = $wpdb->prefix . 'frank_seo_404_logs';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$logs = $wpdb->get_results( "SELECT * FROM $table_404 ORDER BY last_hit DESC LIMIT 500", ARRAY_A );

		return rest_ensure_response( array(
			'success' => true,
			'logs'    => $logs,
		) );
	}

	/**
	 * Delete a 404 log entry.
	 */
	public function delete_404_log( $request ) {
		global $wpdb;
		$id = absint( $request->get_param( 'id' ) );
		$table_404 = $wpdb->prefix . 'frank_seo_404_logs';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$deleted = $wpdb->delete( $table_404, array( 'id' => $id ) );

		if ( ! $deleted ) {
			return new WP_Error( 'not_found', 'Log entry not found.', array( 'status' => 404 ) );
		}

		return rest_ensure_response( array(
			'success' => true,
			'message' => 'Log entry deleted successfully.',
		) );
	}

	/**
	 * Clear all 404 logs.
	 */
	public function clear_404_logs( $request ) {
		global $wpdb;
		$table_404 = $wpdb->prefix . 'frank_seo_404_logs';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$wpdb->query( "TRUNCATE TABLE $table_404" );

		return rest_ensure_response( array(
			'success' => true,
			'message' => 'All 404 logs cleared.',
		) );
	}

	/**
	 * Run an SEO audit against a competitor's URL.
	 */
	public function run_competitor_audit( $request ) {
		$url = esc_url_raw( $request->get_param( 'url' ) );
		if ( empty( $url ) ) {
			return new WP_Error( 'invalid_url', 'URL cannot be empty', array( 'status' => 400 ) );
		}

		require_once FRANK_SEO_AUDIT_DIR . 'includes/class-frank-seo-auditor.php';
		$auditor = new Frank_SEO_Auditor();
		$result = $auditor->audit_external_url( $url );

		if ( ! $result['success'] ) {
			return new WP_Error( 'audit_failed', $result['message'], array( 'status' => 500 ) );
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Generate SEO metadata using Gemini API.
	 */
	public function generate_seo_meta_ai( $request ) {
		// Fetch settings
		$settings = get_option( 'frank_seo_settings', array() );
		$api_key = isset( $settings['geminiApiKey'] ) ? sanitize_text_field( $settings['geminiApiKey'] ) : '';

		if ( empty( $api_key ) ) {
			return new WP_Error( 'missing_api_key', 'Gemini API Key is not configured. Please add your key in Settings.', array( 'status' => 400 ) );
		}

		$title   = sanitize_text_field( $request->get_param( 'title' ) );
		$content = wp_strip_all_tags( $request->get_param( 'content' ) );
		$keyword = sanitize_text_field( $request->get_param( 'keyword' ) );

		// Clean up content to limit token usage (truncate to ~800 words)
		$content = wp_trim_words( $content, 800 );

		// Prompt construction
		$prompt = sprintf(
			"Generate an SEO Title and Meta Description for a web page.\n\nFocus Keyword: %s\nOriginal Title: %s\nContent Snippet: %s\n\nRequirements:\n1. The SEO Title must be between 40 and 60 characters, and should include the Focus Keyword.\n2. The Meta Description must be between 120 and 160 characters, and must also include the Focus Keyword.\n3. Return the response as a JSON object with keys 'title' and 'description'. Do not wrap the JSON in markdown code blocks.",
			$keyword ?: '[None]',
			$title ?: '[None]',
			$content ?: '[None]'
		);

		// Google Gemini API call
		$api_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . $api_key;

		$response = wp_remote_post( $api_url, array(
			'timeout' => 15,
			'headers' => array( 'Content-Type' => 'application/json' ),
			'body'    => wp_json_encode( array(
				'contents' => array(
					array(
						'parts' => array(
							array( 'text' => $prompt )
						)
					)
				),
				'generationConfig' => array(
					'responseMimeType' => 'application/json'
				)
			) )
		) );

		if ( is_wp_error( $response ) ) {
			return new WP_Error( 'gemini_error', $response->get_error_message(), array( 'status' => 500 ) );
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );

		if ( $status_code !== 200 ) {
			$err_data = json_decode( $body, true );
			$err_msg = isset( $err_data['error']['message'] ) ? $err_data['error']['message'] : 'Failed to call Gemini API.';
			return new WP_Error( 'gemini_error', $err_msg, array( 'status' => $status_code ) );
		}

		$data = json_decode( $body, true );
		$text_response = isset( $data['candidates'][0]['content']['parts'][0]['text'] ) ? trim( $data['candidates'][0]['content']['parts'][0]['text'] ) : '';

		if ( empty( $text_response ) ) {
			return new WP_Error( 'gemini_empty', 'Empty response from Gemini AI.', array( 'status' => 500 ) );
		}

		// Parse JSON response
		$seo_meta = json_decode( $text_response, true );
		if ( ! is_array( $seo_meta ) || ! isset( $seo_meta['title'] ) || ! isset( $seo_meta['description'] ) ) {
			return new WP_Error( 'gemini_invalid_format', 'Gemini AI returned invalid JSON format. Response was: ' . $text_response, array( 'status' => 500 ) );
		}

		return rest_ensure_response( array(
			'success'     => true,
			'title'       => sanitize_text_field( $seo_meta['title'] ),
			'description' => sanitize_text_field( $seo_meta['description'] ),
		) );
	}
}

