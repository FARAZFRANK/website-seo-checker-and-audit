<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * The admin-specific functionality of the plugin.
 */
class Frank_SEO_Admin {

	/**
	 * Initialize the class and set its properties.
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'add_plugin_admin_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_styles_and_scripts' ) );
		
		// Register meta fields for REST API access (needed for Gutenberg)
		add_action( 'init', array( $this, 'register_seo_meta' ) );

		// Enqueue Gutenberg block editor sidebar assets
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );

		// Add type="module" to enqueued ESM script tags
		// add_filter( 'script_loader_tag', array( $this, 'add_module_type_attribute' ), 10, 3 );
	}

	/**
	 * Register the administration menu for this plugin into the WordPress Dashboard menu.
	 */
	public function add_plugin_admin_menu() {
		add_menu_page(
			__( 'Frank SEO Checker & Audit', 'frank-website-seo-checker-and-audit' ),
			__( 'Frank SEO Checker & Audit', 'frank-website-seo-checker-and-audit' ),
			'manage_options',
			'frank-seo-audit',
			array( $this, 'display_plugin_setup_page' ),
			'dashicons-chart-area',
			80
		);

		add_submenu_page(
			'frank-seo-audit',
			__( 'Dashboard', 'frank-website-seo-checker-and-audit' ),
			__( 'Dashboard', 'frank-website-seo-checker-and-audit' ),
			'manage_options',
			'frank-seo-audit',
			array( $this, 'display_plugin_setup_page' )
		);

		add_submenu_page(
			'frank-seo-audit',
			__( 'How To Use', 'frank-website-seo-checker-and-audit' ),
			__( 'How To Use', 'frank-website-seo-checker-and-audit' ),
			'manage_options',
			'frank-seo-how-to-use',
			array( $this, 'display_plugin_setup_page' )
		);

		add_submenu_page(
			'frank-seo-audit',
			__( 'Our Plugin vs Others', 'frank-website-seo-checker-and-audit' ),
			__( 'Comparison', 'frank-website-seo-checker-and-audit' ),
			'manage_options',
			'frank-seo-comparison',
			array( $this, 'display_plugin_setup_page' )
		);
	}

	/**
	 * Render the settings page for this plugin.
	 */
	public function display_plugin_setup_page() {
		// Provide the React root node
		echo wp_kses_post( '<div id="frank-seo-audit-root"></div>' );
	}

	/**
	 * Register post meta fields for SEO so Gutenberg can save/read them automatically.
	 */
	public function register_seo_meta() {
		$meta_keys = array(
			'_frank_seo_title'          => 'string',
			'_frank_seo_description'    => 'string',
			'_frank_seo_focus_keyword'  => 'string',
			'_frank_seo_robots_index'   => 'string',
			'_frank_seo_robots_follow'  => 'string',
			'_frank_seo_canonical'      => 'string',
		);

		$post_types = array( 'post', 'page' );

		foreach ( $post_types as $post_type ) {
			foreach ( $meta_keys as $key => $type ) {
				register_post_meta( $post_type, $key, array(
					'show_in_rest'  => true,
					'single'        => true,
					'type'          => $type,
					'auth_callback' => function() {
						return current_user_can( 'edit_posts' );
					}
				) );
			}
		}
	}

	/**
	 * Enqueue Gutenberg sidebar assets.
	 */
	public function enqueue_editor_assets() {
		$js_path = FRANK_SEO_AUDIT_DIR . 'assets/dist/sidebar.js';
		$css_path = FRANK_SEO_AUDIT_DIR . 'assets/dist/style.css';

		if ( file_exists( $js_path ) ) {
			$js_version = filemtime( $js_path );
			wp_enqueue_script(
				'frank-seo-editor-sidebar',
				FRANK_SEO_AUDIT_URL . 'assets/dist/sidebar.js',
				array(
					'wp-plugins',
					'wp-edit-post',
					'wp-element',
					'wp-components',
					'wp-data',
					'wp-i18n',
					'wp-editor',
				),
				$js_version,
				true
			);
		}

		if ( file_exists( $css_path ) ) {
			$css_version = filemtime( $css_path );
			wp_enqueue_style(
				'frank-seo-editor-sidebar-css',
				FRANK_SEO_AUDIT_URL . 'assets/dist/style.css',
				array( 'wp-edit-post' ),
				$css_version,
				'all'
			);
		}
	}

	/**
	 * Register and enqueue the admin-specific stylesheet and JavaScript.
	 */
	public function enqueue_styles_and_scripts( $hook_suffix ) {
		// Only load assets on our plugin pages
		$allowed_pages = array(
			'frank-seo-audit',
			'frank-seo-how-to-use',
			'frank-seo-comparison',
		);

		if ( ! isset( $_GET['page'] ) || ! in_array( $_GET['page'], $allowed_pages, true ) ) {
			return;
		}
		
		$js_path = FRANK_SEO_AUDIT_DIR . 'assets/dist/index.js';
		$css_path = FRANK_SEO_AUDIT_DIR . 'assets/dist/style.css';

		if ( file_exists( $js_path ) ) {
			$js_version = filemtime( $js_path );
			wp_enqueue_script(
				'frank-seo-audit-js',
				FRANK_SEO_AUDIT_URL . 'assets/dist/index.js',
				array(), // bundled React natively
				$js_version,
				true
			);
		}

		if ( file_exists( $css_path ) ) {
			$css_version = filemtime( $css_path );
			wp_enqueue_style(
				'frank-seo-audit-css',
				FRANK_SEO_AUDIT_URL . 'assets/dist/style.css',
				array(),
				$css_version,
				'all'
			);
		}

		// Localize script to pass data to React
		wp_localize_script( 'frank-seo-audit-js', 'frankSeoData', array(
			'api_url' => esc_url_raw( rest_url( 'frank-seo/v1/' ) ),
			'nonce'   => wp_create_nonce( 'wp_rest' ),
		) );
	}

	/**
	 * Add type="module" to enqueued ESM script tags.
	 */
	public function add_module_type_attribute( $tag, $handle, $src ) {
		if ( 'frank-seo-audit-js' === $handle || 'frank-seo-editor-sidebar' === $handle ) {
			return '<script type="module" src="' . esc_url( $src ) . '" id="' . esc_attr( $handle ) . '-js"></script>';
		}
		return $tag;
	}
}
