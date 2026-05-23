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
			'schedule'         => 'Weekly',
			'checkMetaData'    => true,
			'checkAltTags'     => true,
			'checkBrokenLinks' => false,
			'excludeMenus'     => true,
			'excludeFooters'   => true,
			'excludeSidebars'  => true,
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

		$schedule = isset( $params['schedule'] ) ? sanitize_text_field( $params['schedule'] ) : 'Weekly';
		if ( ! in_array( $schedule, array( 'Disabled', 'Daily', 'Weekly', 'Monthly' ) ) ) {
			$schedule = 'Weekly';
		}
		$sanitized_settings['schedule'] = $schedule;

		$sanitized_settings['checkMetaData']    = isset( $params['checkMetaData'] ) ? (bool) $params['checkMetaData'] : true;
		$sanitized_settings['checkAltTags']     = isset( $params['checkAltTags'] ) ? (bool) $params['checkAltTags'] : true;
		$sanitized_settings['checkBrokenLinks'] = isset( $params['checkBrokenLinks'] ) ? (bool) $params['checkBrokenLinks'] : false;
		$sanitized_settings['excludeMenus']     = isset( $params['excludeMenus'] ) ? (bool) $params['excludeMenus'] : true;
		$sanitized_settings['excludeFooters']   = isset( $params['excludeFooters'] ) ? (bool) $params['excludeFooters'] : true;
		$sanitized_settings['excludeSidebars']  = isset( $params['excludeSidebars'] ) ? (bool) $params['excludeSidebars'] : true;

		update_option( 'frank_seo_settings', $sanitized_settings );

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

		// Empty all tables
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$wpdb->query( "TRUNCATE TABLE $table_pages" );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$wpdb->query( "TRUNCATE TABLE $table_issues" );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$wpdb->query( "TRUNCATE TABLE $table_links" );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$wpdb->query( "TRUNCATE TABLE $table_history" );

		// Delete options
		delete_option( 'frank_seo_settings' );
		delete_option( 'frank_seo_db_version' );

		return rest_ensure_response( array( 'success' => true, 'message' => 'Plugin reset successfully.' ) );
	}
}

