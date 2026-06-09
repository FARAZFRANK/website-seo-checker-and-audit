<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Handles building and rendering of JSON-LD schemas on the front-end.
 */
class Frank_SEO_Schema_Builder {

	/**
	 * Register actions and filters.
	 */
	public function init() {
		add_action( 'wp_head', array( $this, 'render_schema' ), 30 );
	}

	/**
	 * Render the structured data JSON-LD scripts in the header.
	 */
	public function render_schema() {
		$schemas = array();

		// 1. Organization Schema (Rendered globally or on the front page)
		if ( is_front_page() || is_home() ) {
			$schemas[] = $this->build_organization_schema();
			$schemas[] = $this->build_website_schema();
		}

		// 2. Article Schema (Rendered on single posts/articles)
		if ( is_singular( 'post' ) ) {
			$schemas[] = $this->build_article_schema();
		}

		// 3. Breadcrumb Schema (Rendered on posts and pages)
		if ( is_singular() && ! is_front_page() ) {
			$schemas[] = $this->build_breadcrumb_schema();
		}

		// Clean null values and print schemas
		$schemas = array_filter( $schemas );

		if ( ! empty( $schemas ) ) {
			echo '<!-- Frank SEO Schema Markup -->' . "\n";
			foreach ( $schemas as $schema ) {
				echo '<script type="application/ld+json">' . "\n";
				echo wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT ) . "\n";
				echo '</script>' . "\n";
			}
		}
	}

	/**
	 * Build Organization Schema.
	 */
	private function build_organization_schema() {
		$site_url  = home_url( '/' );
		$site_name = get_bloginfo( 'name' );
		
		return array(
			'@context' => 'https://schema.org',
			'@type'    => 'Organization',
			'@id'      => esc_url( $site_url . '#organization' ),
			'name'     => esc_html( $site_name ),
			'url'      => esc_url( $site_url ),
			'logo'     => array(
				'@type' => 'ImageObject',
				'url'   => esc_url( get_site_icon_url( 512 ) ?: '' ),
			)
		);
	}

	/**
	 * Build WebSite Schema (Search Box Support).
	 */
	private function build_website_schema() {
		$site_url  = home_url( '/' );
		$site_name = get_bloginfo( 'name' );

		return array(
			'@context' => 'https://schema.org',
			'@type'    => 'WebSite',
			'@id'      => esc_url( $site_url . '#website' ),
			'url'      => esc_url( $site_url ),
			'name'     => esc_html( $site_name ),
			'potentialAction' => array(
				array(
					'@type'       => 'SearchAction',
					'target'      => array(
						'@type' => 'EntryPoint',
						'urlTemplate' => esc_url( $site_url . '?s={search_term_string}' )
					),
					'query-input' => 'required name=search_term_string'
				)
			)
		);
	}

	/**
	 * Build Article Schema for blog posts.
	 */
	private function build_article_schema() {
		$post_id   = get_the_ID();
		$post      = get_post( $post_id );
		$author_id = $post->post_author;

		$author_name = get_the_author_meta( 'display_name', $author_id );
		$author_url  = get_author_posts_url( $author_id );

		$custom_title = get_post_meta( $post_id, '_frank_seo_title', true ) ?: get_the_title( $post_id );
		$custom_desc  = get_post_meta( $post_id, '_frank_seo_description', true );

		if ( empty( $custom_desc ) ) {
			$custom_desc = wp_strip_all_tags( wp_trim_words( $post->post_content, 25 ) );
		}

		$article = array(
			'@context'      => 'https://schema.org',
			'@type'         => 'Article',
			'@id'           => esc_url( get_permalink( $post_id ) . '#article' ),
			'isPartOf'      => array(
				'@type' => 'WebPage',
				'@id'   => esc_url( get_permalink( $post_id ) )
			),
			'headline'      => esc_html( $custom_title ),
			'description'   => esc_html( $custom_desc ),
			'datePublished' => esc_attr( get_the_date( 'c', $post_id ) ),
			'dateModified'  => esc_attr( get_the_modified_date( 'c', $post_id ) ),
			'mainEntityOfPage' => esc_url( get_permalink( $post_id ) ),
			'author'        => array(
				'@type' => 'Person',
				'name'  => esc_html( $author_name ),
				'url'   => esc_url( $author_url )
			),
			'publisher'     => array(
				'@type' => 'Organization',
				'@id'   => esc_url( home_url( '/' ) . '#organization' )
			)
		);

		if ( has_post_thumbnail( $post_id ) ) {
			$article['image'] = array(
				'@type' => 'ImageObject',
				'url'   => esc_url( get_the_post_thumbnail_url( $post_id, 'large' ) )
			);
		}

		return $article;
	}

	/**
	 * Build BreadcrumbList Schema.
	 */
	private function build_breadcrumb_schema() {
		$post_id   = get_the_ID();
		$post_type = get_post_type( $post_id );
		
		$items = array();

		// First item is always Home
		$items[] = array(
			'@type'    => 'ListItem',
			'position' => 1,
			'name'     => esc_html__( 'Home', 'frank-website-seo-checker-and-audit' ),
			'item'     => esc_url( home_url( '/' ) )
		);

		$position = 2;

		if ( 'post' === $post_type ) {
			// Include categories for blog posts
			$categories = get_the_category( $post_id );
			if ( ! empty( $categories ) ) {
				$primary_cat = $categories[0];
				$cat_url = get_category_link( $primary_cat->term_id );

				$items[] = array(
					'@type'    => 'ListItem',
					'position' => $position++,
					'name'     => esc_html( $primary_cat->name ),
					'item'     => esc_url( $cat_url )
				);
			}
		} elseif ( is_page() ) {
			// Include parent pages hierarchy
			$ancestors = get_post_ancestors( $post_id );
			if ( ! empty( $ancestors ) ) {
				$ancestors = array_reverse( $ancestors );
				foreach ( $ancestors as $ancestor_id ) {
					$items[] = array(
						'@type'    => 'ListItem',
						'position' => $position++,
						'name'     => esc_html( get_the_title( $ancestor_id ) ),
						'item'     => esc_url( get_permalink( $ancestor_id ) )
					);
				}
			}
		}

		// Last item is the current page/post itself
		$items[] = array(
			'@type'    => 'ListItem',
			'position' => $position,
			'name'     => esc_html( get_the_title( $post_id ) ),
			'item'     => esc_url( get_permalink( $post_id ) )
		);

		return array(
			'@context'        => 'https://schema.org',
			'@type'           => 'BreadcrumbList',
			'@id'             => esc_url( get_permalink( $post_id ) . '#breadcrumb' ),
			'itemListElement' => $items
		);
	}
}
