<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Handles automatic image SEO (alt attributes).
 */
class Frank_SEO_Image_Optimizer {

	public function init() {
		// Hook into the_content to add missing alt tags to images
		add_filter( 'the_content', array( $this, 'add_missing_alt_tags' ), 20 );
	}

	/**
	 * Parse content and automatically add alt attributes to images that don't have one.
	 */
	public function add_missing_alt_tags( $content ) {
		$settings = get_option( 'frank_seo_settings', array() );
		$enable_image_seo = isset( $settings['enableImageSEO'] ) ? (bool) $settings['enableImageSEO'] : true;
		$check_alt = isset( $settings['checkAltTags'] ) ? (bool) $settings['checkAltTags'] : true;

		// Only process if the setting is enabled and there is content
		if ( ! $enable_image_seo || ! $check_alt || empty( $content ) || ! is_singular() ) {
			return $content;
		}

		$post = get_post();
		if ( ! $post ) {
			return $content;
		}

		// Title of the post, used as fallback alt text
		$fallback_alt = esc_attr( get_post_meta( $post->ID, '_frank_seo_title', true ) ?: $post->post_title );

		// Use regex to find all img tags
		$pattern = '/<img([^>]+)>/i';
		$content = preg_replace_callback( $pattern, function( $matches ) use ( $fallback_alt ) {
			$img_tag = $matches[0];
			$attributes = $matches[1];

			// Check if alt attribute already exists
			if ( preg_match( '/\balt\s*=\s*(["\'])(.*?)\1/i', $attributes, $alt_match ) ) {
				$current_alt = trim( $alt_match[2] );
				// If it exists and is empty, replace it
				if ( empty( $current_alt ) ) {
					$img_tag = str_replace( $alt_match[0], 'alt="' . $fallback_alt . '"', $img_tag );
				}
			} else {
				// Alt attribute doesn't exist at all, so we append it
				$img_tag = str_replace( '<img ', '<img alt="' . $fallback_alt . '" ', $img_tag );
			}

			return $img_tag;
		}, $content );

		return $content;
	}
}
