<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Handles dynamic XML sitemaps generation and rewrite routing.
 */
class Frank_SEO_Sitemap {

	/**
	 * Register actions and filters.
	 */
	public function init() {
		add_action( 'init', array( $this, 'register_sitemap_rules' ) );
		add_filter( 'query_vars', array( $this, 'register_query_vars' ) );
		add_action( 'template_redirect', array( $this, 'handle_sitemap_request' ), 1 );
	}

	/**
	 * Add sitemap rewrite rules.
	 */
	public function register_sitemap_rules() {
		add_rewrite_rule( 'sitemap\.xml$', 'index.php?frank_seo_sitemap=index', 'top' );
		add_rewrite_rule( 'sitemap-([a-z0-9_-]+)\.xml$', 'index.php?frank_seo_sitemap=$matches[1]', 'top' );
	}

	/**
	 * Register sitemap query variables.
	 */
	public function register_query_vars( $vars ) {
		$vars[] = 'frank_seo_sitemap';
		return $vars;
	}

	/**
	 * Intercepts the request and serves the XML Sitemap.
	 */
	public function handle_sitemap_request() {
		$sitemap_type = get_query_var( 'frank_seo_sitemap' );

		if ( empty( $sitemap_type ) ) {
			return;
		}

		// 1. Verify if sitemaps are enabled in settings
		$settings = get_option( 'frank_seo_settings', array() );
		$enabled = isset( $settings['xmlSitemaps'] ) ? (bool) $settings['xmlSitemaps'] : true;

		if ( ! $enabled ) {
			global $wp_query;
			$wp_query->set_404();
			status_header( 404 );
			nocache_headers();
			include( get_query_template( '404' ) );
			exit;
		}

		// 2. Set headers
		header( 'Content-Type: text/xml; charset=utf-8' );
		nocache_headers();

		// Output XML sitemap
		echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
		echo '<?xml-stylesheet type="text/xsl" href="' . esc_url( FRANK_SEO_AUDIT_URL . 'assets/sitemap.xsl' ) . '"?>' . "\n";

		switch ( $sitemap_type ) {
			case 'index':
				$this->render_sitemap_index();
				break;
			case 'post':
			case 'page':
				$this->render_post_type_sitemap( $sitemap_type );
				break;
			case 'category':
				$this->render_category_sitemap();
				break;
			default:
				global $wp_query;
				$wp_query->set_404();
				status_header( 404 );
				include( get_query_template( '404' ) );
				break;
		}
		exit;
	}

	/**
	 * Output the parent Sitemap Index XML.
	 */
	private function render_sitemap_index() {
		echo '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

		// Post sitemap
		$lastmod_post = $this->get_last_modified_date( 'post' );
		echo '  <sitemap>' . "\n";
		echo '    <loc>' . esc_url( home_url( '/sitemap-post.xml' ) ) . '</loc>' . "\n";
		if ( $lastmod_post ) {
			echo '    <lastmod>' . esc_html( $lastmod_post ) . '</lastmod>' . "\n";
		}
		echo '  </sitemap>' . "\n";

		// Page sitemap
		$lastmod_page = $this->get_last_modified_date( 'page' );
		echo '  <sitemap>' . "\n";
		echo '    <loc>' . esc_url( home_url( '/sitemap-page.xml' ) ) . '</loc>' . "\n";
		if ( $lastmod_page ) {
			echo '    <lastmod>' . esc_html( $lastmod_page ) . '</lastmod>' . "\n";
		}
		echo '  </sitemap>' . "\n";

		// Category sitemap
		$lastmod_cat = $this->get_last_modified_date_category();
		echo '  <sitemap>' . "\n";
		echo '    <loc>' . esc_url( home_url( '/sitemap-category.xml' ) ) . '</loc>' . "\n";
		if ( $lastmod_cat ) {
			echo '    <lastmod>' . esc_html( $lastmod_cat ) . '</lastmod>' . "\n";
		}
		echo '  </sitemap>' . "\n";

		echo '</sitemapindex>' . "\n";
	}

	/**
	 * Output sitemap for a specific post type (posts/pages).
	 */
	private function render_post_type_sitemap( $post_type ) {
		$posts = get_posts( array(
			'post_type'      => $post_type,
			'post_status'    => 'publish',
			'posts_per_page' => 1000,
			'orderby'        => 'modified',
			'order'          => 'DESC',
		) );

		echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
		foreach ( $posts as $p ) {
			// Skip password protected or specifically excluded items if applicable
			if ( ! empty( $p->post_password ) ) {
				continue;
			}
			
			// Respect robots noindex
			$robots_index = get_post_meta( $p->ID, '_frank_seo_robots_index', true );
			if ( 'noindex' === $robots_index ) {
				continue;
			}

			$canonical = get_post_meta( $p->ID, '_frank_seo_canonical', true ) ?: get_permalink( $p->ID );

			echo '  <url>' . "\n";
			echo '    <loc>' . esc_url( $canonical ) . '</loc>' . "\n";
			echo '    <lastmod>' . esc_html( get_the_modified_date( 'c', $p->ID ) ) . '</lastmod>' . "\n";
			echo '    <changefreq>weekly</changefreq>' . "\n";
			echo '    <priority>' . ( is_front_page() || $p->ID === (int) get_option( 'page_on_front' ) ? '1.0' : '0.8' ) . '</priority>' . "\n";
			echo '  </url>' . "\n";
		}
		echo '</urlset>' . "\n";
	}

	/**
	 * Output sitemap for Categories.
	 */
	private function render_category_sitemap() {
		$categories = get_terms( array(
			'taxonomy'   => 'category',
			'hide_empty' => true,
		) );

		echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
		foreach ( $categories as $cat ) {
			$link = get_term_link( $cat );
			if ( is_wp_error( $link ) ) {
				continue;
			}
			
			$lastmod = $this->get_last_modified_date_category( $cat->term_id );

			echo '  <url>' . "\n";
			echo '    <loc>' . esc_url( $link ) . '</loc>' . "\n";
			if ( $lastmod ) {
				echo '    <lastmod>' . esc_html( $lastmod ) . '</lastmod>' . "\n";
			}
			echo '    <changefreq>weekly</changefreq>' . "\n";
			echo '    <priority>0.6</priority>' . "\n";
			echo '  </url>' . "\n";
		}
		echo '</urlset>' . "\n";
	}

	/**
	 * Helper: Get last modified date for a post type.
	 */
	private function get_last_modified_date( $post_type ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$date = $wpdb->get_var( $wpdb->prepare( "SELECT post_modified_gmt FROM $wpdb->posts WHERE post_type = %s AND post_status = 'publish' ORDER BY post_modified_gmt DESC LIMIT 1", $post_type ) );
		return $date ? date( 'c', strtotime( $date ) ) : null;
	}

	/**
	 * Helper: Get last modified date for categories.
	 */
	private function get_last_modified_date_category( $term_id = null ) {
		global $wpdb;
		if ( $term_id ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
			$date = $wpdb->get_var( $wpdb->prepare( "
				SELECT p.post_modified_gmt FROM $wpdb->posts p
				INNER JOIN $wpdb->term_relationships tr ON p.ID = tr.object_id
				WHERE tr.term_taxonomy_id = %d AND p.post_status = 'publish'
				ORDER BY p.post_modified_gmt DESC LIMIT 1
			", (int) $term_id ) );
		} else {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
			$date = $wpdb->get_var( "SELECT post_modified_gmt FROM $wpdb->posts WHERE post_status = 'publish' AND post_type = 'post' ORDER BY post_modified_gmt DESC LIMIT 1" );
		}
		return $date ? date( 'c', strtotime( $date ) ) : null;
	}
}
