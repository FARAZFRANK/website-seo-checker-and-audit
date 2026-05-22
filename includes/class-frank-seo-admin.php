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
	}

	/**
	 * Render the settings page for this plugin.
	 */
	public function display_plugin_setup_page() {
		// Provide the React root node
		echo '<div id="frank-seo-audit-root"></div>';
	}

	/**
	 * Register and enqueue the admin-specific stylesheet and JavaScript.
	 */
	public function enqueue_styles_and_scripts( $hook_suffix ) {
		// Only load assets on our plugin page
		if ( 'toplevel_page_frank-seo-audit' !== $hook_suffix ) {
			return;
		}

		// Enqueue Vite build files if they exist (we will handle the actual manifest later)
		// For now, this is a placeholder where we will inject the React App's built CSS/JS.
		
		// Ensure we don't try to load non-existent files yet
		$js_path = FRANK_SEO_AUDIT_DIR . 'assets/dist/index.js';
		$css_path = FRANK_SEO_AUDIT_DIR . 'assets/dist/index.css';

		if ( file_exists( $js_path ) ) {
			$js_version = filemtime( $js_path );
			wp_enqueue_script(
				'frank-seo-audit-js',
				FRANK_SEO_AUDIT_URL . 'assets/dist/index.js',
				array( 'wp-element' ), // depends on React
				$js_version,
				true
			);
		}

		if ( file_exists( $css_path ) ) {
			$css_version = filemtime( $css_path );
			wp_enqueue_style(
				'frank-seo-audit-css',
				FRANK_SEO_AUDIT_URL . 'assets/dist/index.css',
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
}
