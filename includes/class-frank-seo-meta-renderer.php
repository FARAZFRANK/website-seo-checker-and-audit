<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Handles rendering of custom meta tags, canonicals, OG tags, and titles on the front-end.
 */
class Frank_SEO_Meta_Renderer {

	/**
	 * Register actions and filters.
	 */
	public function init() {
		// Document title filter
		add_filter( 'pre_get_document_title', array( $this, 'filter_document_title' ), 15 );
		add_filter( 'document_title_parts', array( $this, 'filter_title_parts' ), 15 );

		// Front-end head meta tags
		add_action( 'wp_head', array( $this, 'render_head_meta_tags' ), 2 );
	}

	/**
	 * Filter the entire page title if custom SEO title is set.
	 */
	public function filter_document_title( $title ) {
		if ( is_singular() ) {
			$post_id = get_the_ID();
			$custom_title = get_post_meta( $post_id, '_frank_seo_title', true );
			if ( ! empty( $custom_title ) ) {
				return esc_html( $custom_title );
			}
		}
		return $title;
	}

	/**
	 * Filter the document title parts to inject custom title cleanly.
	 */
	public function filter_title_parts( $parts ) {
		if ( is_singular() ) {
			$post_id = get_the_ID();
			$custom_title = get_post_meta( $post_id, '_frank_seo_title', true );
			if ( ! empty( $custom_title ) ) {
				$parts['title'] = esc_html( $custom_title );
			}
		}
		return $parts;
	}

	/**
	 * Render standard meta tags, Open Graph, and Twitter Cards in wp_head.
	 */
	public function render_head_meta_tags() {
		if ( ! is_singular() ) {
			return;
		}

		$post_id = get_the_ID();
		
		// 1. Fetch custom post meta settings
		$meta_description = get_post_meta( $post_id, '_frank_seo_description', true );
		$robots_index     = get_post_meta( $post_id, '_frank_seo_robots_index', true ) ?: 'index';
		$robots_follow    = get_post_meta( $post_id, '_frank_seo_robots_follow', true ) ?: 'follow';
		$canonical_url    = get_post_meta( $post_id, '_frank_seo_canonical', true );

		// Fallback to default excerpt/content if custom description is empty
		if ( empty( $meta_description ) ) {
			$post = get_post( $post_id );
			if ( ! empty( $post->post_excerpt ) ) {
				$meta_description = wp_strip_all_tags( $post->post_excerpt );
			} else {
				$meta_description = wp_strip_all_tags( wp_trim_words( $post->post_content, 25 ) );
			}
		}
		$meta_description = sanitize_text_field( $meta_description );

		// Output standard description
		if ( ! empty( $meta_description ) ) {
			echo '<meta name="description" content="' . esc_attr( $meta_description ) . '" />' . "\n";
		}

		// Output robots meta
		$robots_content = sprintf( '%s, %s', $robots_index, $robots_follow );
		echo '<meta name="robots" content="' . esc_attr( $robots_content ) . '" />' . "\n";

		// Output Canonical URL
		if ( empty( $canonical_url ) ) {
			$canonical_url = get_permalink( $post_id );
		}
		echo '<link rel="canonical" href="' . esc_url( $canonical_url ) . '" />' . "\n";

		// 2. Open Graph Tags (Facebook)
		$og_title = get_post_meta( $post_id, '_frank_seo_og_title', true );
		if ( empty( $og_title ) ) {
			$og_title = get_post_meta( $post_id, '_frank_seo_title', true ) ?: get_the_title( $post_id );
		}

		$og_desc = get_post_meta( $post_id, '_frank_seo_og_description', true ) ?: $meta_description;

		$og_image = get_post_meta( $post_id, '_frank_seo_og_image', true );
		if ( empty( $og_image ) && has_post_thumbnail( $post_id ) ) {
			$og_image = get_the_post_thumbnail_url( $post_id, 'large' );
		}

		echo '<!-- Frank SEO Open Graph Tags -->' . "\n";
		echo '<meta property="og:locale" content="' . esc_attr( get_locale() ) . '" />' . "\n";
		echo '<meta property="og:type" content="' . ( is_single() ? 'article' : 'website' ) . '" />' . "\n";
		echo '<meta property="og:title" content="' . esc_attr( $og_title ) . '" />' . "\n";
		if ( ! empty( $og_desc ) ) {
			echo '<meta property="og:description" content="' . esc_attr( $og_desc ) . '" />' . "\n";
		}
		echo '<meta property="og:url" content="' . esc_url( $canonical_url ) . '" />' . "\n";
		echo '<meta property="og:site_name" content="' . esc_attr( get_bloginfo( 'name' ) ) . '" />' . "\n";
		if ( ! empty( $og_image ) ) {
			echo '<meta property="og:image" content="' . esc_url( $og_image ) . '" />' . "\n";
			echo '<meta property="og:image:secure_url" content="' . esc_url( $og_image ) . '" />' . "\n";
		}

		// WooCommerce OpenGraph extensions
		if ( function_exists( 'is_product' ) && is_product() ) {
			global $product;
			if ( is_a( $product, 'WC_Product' ) ) {
				echo '<meta property="product:price:amount" content="' . esc_attr( $product->get_price() ) . '" />' . "\n";
				echo '<meta property="product:price:currency" content="' . esc_attr( get_woocommerce_currency() ) . '" />' . "\n";
				echo '<meta property="product:availability" content="' . ( $product->is_in_stock() ? 'instock' : 'oos' ) . '" />' . "\n";
			}
		}

		// Article publisher details
		if ( is_single() ) {
			$publish_date = get_the_date( 'c', $post_id );
			$modified_date = get_the_modified_date( 'c', $post_id );
			echo '<meta property="article:published_time" content="' . esc_attr( $publish_date ) . '" />' . "\n";
			echo '<meta property="article:modified_time" content="' . esc_attr( $modified_date ) . '" />' . "\n";
		}

		// 3. Twitter Card Tags
		echo '<!-- Frank SEO Twitter Card Tags -->' . "\n";
		echo '<meta name="twitter:card" content="summary_large_image" />' . "\n";
		echo '<meta name="twitter:title" content="' . esc_attr( $og_title ) . '" />' . "\n";
		if ( ! empty( $og_desc ) ) {
			echo '<meta name="twitter:description" content="' . esc_attr( $og_desc ) . '" />' . "\n";
		}
		if ( ! empty( $og_image ) ) {
			echo '<meta name="twitter:image" content="' . esc_url( $og_image ) . '" />' . "\n";
		}
	}
}
