<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Handles Breadcrumbs generation for shortcode and Schema.
 */
class Frank_SEO_Breadcrumbs {

	/**
	 * Register actions and filters.
	 */
	public function init() {
		add_shortcode( 'frank_seo_breadcrumbs', array( $this, 'render_breadcrumbs_shortcode' ) );
		add_action( 'wp_head', array( $this, 'render_breadcrumbs_schema' ) );
	}

	/**
	 * Get the breadcrumb trail items.
	 */
	public function get_breadcrumb_items() {
		$items = array();
		
		// Home
		$items[] = array(
			'name' => get_bloginfo( 'name' ),
			'url'  => home_url( '/' ),
		);

		if ( is_home() || is_front_page() ) {
			return $items; // Just home
		}

		if ( is_singular() ) {
			$post = get_post();
			
			// Category logic for posts
			if ( 'post' === $post->post_type ) {
				$categories = get_the_category( $post->ID );
				if ( ! empty( $categories ) ) {
					$cat = $categories[0];
					$items[] = array(
						'name' => $cat->name,
						'url'  => get_category_link( $cat->term_id ),
					);
				}
			} elseif ( 'page' === $post->post_type && $post->post_parent ) {
				// Parent pages
				$parent_id = $post->post_parent;
				$parents = array();
				while ( $parent_id ) {
					$page = get_post( $parent_id );
					$parents[] = array(
						'name' => get_the_title( $page->ID ),
						'url'  => get_permalink( $page->ID ),
					);
					$parent_id = $page->post_parent;
				}
				$parents = array_reverse( $parents );
				$items = array_merge( $items, $parents );
			}

			// Current Post/Page
			$items[] = array(
				'name' => get_the_title( $post->ID ),
				'url'  => get_permalink( $post->ID ),
			);
		} elseif ( is_category() ) {
			$items[] = array(
				'name' => single_cat_title( '', false ),
				'url'  => '',
			);
		} elseif ( is_tag() ) {
			$items[] = array(
				'name' => single_tag_title( '', false ),
				'url'  => '',
			);
		} elseif ( is_search() ) {
			$items[] = array(
				'name' => 'Search Results',
				'url'  => '',
			);
		} elseif ( is_404() ) {
			$items[] = array(
				'name' => 'Page Not Found',
				'url'  => '',
			);
		} else {
			$items[] = array(
				'name' => wp_title( '', false ),
				'url'  => '',
			);
		}

		return $items;
	}

	/**
	 * Shortcode handler for [frank_seo_breadcrumbs]
	 */
	public function render_breadcrumbs_shortcode() {
		$settings = get_option( 'frank_seo_settings', array() );
		$enable_breadcrumbs = isset( $settings['enableBreadcrumbs'] ) ? (bool) $settings['enableBreadcrumbs'] : true;

		if ( ! $enable_breadcrumbs ) {
			return '';
		}

		$items = $this->get_breadcrumb_items();
		if ( empty( $items ) || count( $items ) <= 1 ) {
			return '';
		}

		$html = '<nav class="frank-seo-breadcrumbs" aria-label="Breadcrumb">';
		$html .= '<ol style="list-style: none; padding: 0; margin: 0; display: flex; gap: 8px;">';

		foreach ( $items as $index => $item ) {
			$is_last = ( $index === count( $items ) - 1 );
			$html .= '<li>';
			
			if ( ! $is_last && ! empty( $item['url'] ) ) {
				$html .= '<a href="' . esc_url( $item['url'] ) . '">' . esc_html( $item['name'] ) . '</a>';
				$html .= '<span style="margin-left: 8px; color: #888;">&raquo;</span>';
			} else {
				$html .= '<span aria-current="page">' . esc_html( $item['name'] ) . '</span>';
			}

			$html .= '</li>';
		}

		$html .= '</ol>';
		$html .= '</nav>';

		return $html;
	}

	/**
	 * Render BreadcrumbList JSON-LD schema in wp_head
	 */
	public function render_breadcrumbs_schema() {
		$settings = get_option( 'frank_seo_settings', array() );
		$enable_breadcrumbs = isset( $settings['enableBreadcrumbs'] ) ? (bool) $settings['enableBreadcrumbs'] : true;

		if ( ! $enable_breadcrumbs ) {
			return;
		}

		$items = $this->get_breadcrumb_items();
		if ( empty( $items ) || count( $items ) <= 1 ) {
			return;
		}

		$list_items = array();
		$position = 1;
		foreach ( $items as $item ) {
			$list_item = array(
				'@type'    => 'ListItem',
				'position' => $position,
				'name'     => $item['name'],
			);
			
			if ( ! empty( $item['url'] ) ) {
				$list_item['item'] = $item['url'];
			}

			$list_items[] = $list_item;
			$position++;
		}

		$schema = array(
			'@context'        => 'https://schema.org',
			'@type'           => 'BreadcrumbList',
			'itemListElement' => $list_items,
		);

		echo '<!-- Frank SEO Breadcrumbs Schema -->' . "\n";
		echo '<script type="application/ld+json">' . wp_json_encode( $schema ) . '</script>' . "\n";
	}
}
