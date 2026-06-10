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
		$settings = get_option( 'frank_seo_settings', array() );
		$enable_local = isset( $settings['enableLocalSEO'] ) ? (bool) $settings['enableLocalSEO'] : true;
		$enable_woo   = isset( $settings['enableWooCommerceSEO'] ) ? (bool) $settings['enableWooCommerceSEO'] : true;
		$enable_adv   = isset( $settings['enableAdvancedSchema'] ) ? (bool) $settings['enableAdvancedSchema'] : true;

		$schemas = array();

		// 1. Organization Schema (Rendered globally or on the front page)
		if ( is_front_page() || is_home() ) {
			$schemas[] = $this->build_organization_schema();
			$schemas[] = $this->build_website_schema();
			if ( $enable_local ) {
				$schemas[] = $this->build_local_business_schema();
			}
		}

		// 2. Article or Product Schema (Rendered on single posts/articles)
		if ( $enable_woo && function_exists( 'is_product' ) && is_product() ) {
			$schemas[] = $this->build_product_schema();
		} elseif ( is_singular( 'post' ) ) {
			$schemas[] = $this->build_article_schema();
		}

		// 3. Breadcrumb Schema (Rendered on posts and pages)
		if ( is_singular() && ! is_front_page() ) {
			$schemas[] = $this->build_breadcrumb_schema();
		}

		// 4. FAQ Schema (Auto-detect FAQ blocks)
		if ( $enable_adv && is_singular() ) {
			$schemas[] = $this->build_faq_schema();
		}

		// 5. Custom User Schema (Rendered on specific post if set)
		$custom_schema = '';
		if ( $enable_adv && is_singular() ) {
			$custom_schema = get_post_meta( get_queried_object_id(), '_frank_seo_custom_schema', true );
		}

		// Clean null values and print schemas
		$schemas = array_filter( $schemas );

		if ( ! empty( $schemas ) || ! empty( $custom_schema ) ) {
			echo '<!-- Frank SEO Schema Markup -->' . "\n";
			foreach ( $schemas as $schema ) {
				echo '<script type="application/ld+json">' . "\n";
				echo wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT ) . "\n";
				echo '</script>' . "\n";
			}
			
			if ( ! empty( $custom_schema ) ) {
				echo '<!-- Frank SEO Custom JSON-LD Schema -->' . "\n";
				echo '<script type="application/ld+json">' . "\n";
				echo wp_kses_post( wp_unslash( $custom_schema ) ) . "\n";
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
	 * Build LocalBusiness Schema.
	 */
	private function build_local_business_schema() {
		$settings = get_option( 'frank_seo_settings', array() );
		$name     = isset( $settings['localBusinessName'] ) ? $settings['localBusinessName'] : '';
		
		if ( empty( $name ) ) {
			return null;
		}

		$type    = isset( $settings['localBusinessType'] ) ? $settings['localBusinessType'] : 'LocalBusiness';
		$address = isset( $settings['localBusinessAddress'] ) ? $settings['localBusinessAddress'] : '';
		$city    = isset( $settings['localBusinessCity'] ) ? $settings['localBusinessCity'] : '';
		$zip     = isset( $settings['localBusinessZip'] ) ? $settings['localBusinessZip'] : '';
		$phone   = isset( $settings['localBusinessPhone'] ) ? $settings['localBusinessPhone'] : '';

		$site_url  = home_url( '/' );

		$schema = array(
			'@context' => 'https://schema.org',
			'@type'    => esc_html( $type ),
			'@id'      => esc_url( $site_url . '#localbusiness' ),
			'name'     => esc_html( $name ),
			'url'      => esc_url( $site_url ),
		);

		if ( ! empty( $phone ) ) {
			$schema['telephone'] = esc_html( $phone );
		}

		if ( ! empty( $address ) || ! empty( $city ) || ! empty( $zip ) ) {
			$schema['address'] = array(
				'@type'           => 'PostalAddress',
				'streetAddress'   => esc_html( $address ),
				'addressLocality' => esc_html( $city ),
				'postalCode'      => esc_html( $zip ),
			);
		}

		$logo = get_site_icon_url( 512 );
		if ( $logo ) {
			$schema['image'] = esc_url( $logo );
		}

		return $schema;
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
	 * Build Product Schema for WooCommerce.
	 */
	private function build_product_schema() {
		if ( ! function_exists( 'is_product' ) || ! is_product() ) {
			return null;
		}

		global $product;
		if ( ! is_a( $product, 'WC_Product' ) ) {
			return null;
		}

		$post_id   = get_the_ID();
		$site_url  = home_url( '/' );

		$custom_title = get_post_meta( $post_id, '_frank_seo_title', true ) ?: $product->get_name();
		$custom_desc  = get_post_meta( $post_id, '_frank_seo_description', true ) ?: wp_strip_all_tags( $product->get_short_description() );

		$schema = array(
			'@context'    => 'https://schema.org/',
			'@type'       => 'Product',
			'@id'         => esc_url( get_permalink( $post_id ) . '#product' ),
			'name'        => esc_html( $custom_title ),
			'description' => esc_html( $custom_desc ),
			'sku'         => esc_attr( $product->get_sku() ),
			'offers'      => array(
				'@type'         => 'Offer',
				'price'         => esc_attr( $product->get_price() ),
				'priceCurrency' => esc_attr( get_woocommerce_currency() ),
				'availability'  => $product->is_in_stock() ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
				'url'           => esc_url( get_permalink( $post_id ) ),
				'seller'        => array(
					'@type' => 'Organization',
					'name'  => esc_html( get_bloginfo( 'name' ) ),
				)
			)
		);

		if ( has_post_thumbnail( $post_id ) ) {
			$schema['image'] = esc_url( get_the_post_thumbnail_url( $post_id, 'large' ) );
		}

		if ( $product->get_review_count() > 0 ) {
			$schema['aggregateRating'] = array(
				'@type'       => 'AggregateRating',
				'ratingValue' => esc_attr( $product->get_average_rating() ),
				'reviewCount' => esc_attr( $product->get_review_count() ),
			);
		}

		return $schema;
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

	/**
	 * Build FAQ Schema by parsing Gutenberg blocks.
	 */
	private function build_faq_schema() {
		if ( ! function_exists( 'parse_blocks' ) ) {
			return null;
		}

		$post = get_post();
		if ( ! $post ) {
			return null;
		}

		$blocks = parse_blocks( $post->post_content );
		$questions = $this->extract_faq_from_blocks( $blocks );

		if ( empty( $questions ) ) {
			return null;
		}

		$main_entity = array();
		foreach ( $questions as $q ) {
			$main_entity[] = array(
				'@type' => 'Question',
				'name'  => esc_html( wp_strip_all_tags( $q['question'] ) ),
				'acceptedAnswer' => array(
					'@type' => 'Answer',
					'text'  => wp_kses_post( $q['answer'] ),
				)
			);
		}

		return array(
			'@context'   => 'https://schema.org',
			'@type'      => 'FAQPage',
			'@id'        => esc_url( get_permalink( $post->ID ) . '#faq' ),
			'mainEntity' => $main_entity
		);
	}

	/**
	 * Recursively extract FAQ items from Gutenberg blocks.
	 */
	private function extract_faq_from_blocks( $blocks ) {
		$questions = array();

		foreach ( $blocks as $block ) {
			// Rank Math FAQ block
			if ( 'rankmath/faq-block' === $block['blockName'] && ! empty( $block['attrs']['questions'] ) ) {
				foreach ( $block['attrs']['questions'] as $q ) {
					if ( ! empty( $q['title'] ) && ! empty( $q['content'] ) ) {
						$questions[] = array(
							'question' => $q['title'],
							'answer'   => $q['content'],
						);
					}
				}
			}

			// Yoast FAQ block
			if ( 'yoast/faq-block' === $block['blockName'] && ! empty( $block['innerBlocks'] ) ) {
				foreach ( $block['innerBlocks'] as $inner_block ) {
					if ( 'yoast/faq-question' === $inner_block['blockName'] ) {
						$question = '';
						$answer = '';
						foreach ( $inner_block['innerBlocks'] as $faq_inner ) {
							if ( strpos( $faq_inner['blockName'], 'yoast/faq-question-title' ) !== false || empty( $faq_inner['blockName'] ) ) {
								$question .= $faq_inner['innerHTML'];
							} else {
								$answer .= $faq_inner['innerHTML'];
							}
						}
						// If Yoast stores it in attrs
						if ( empty( $question ) && isset( $inner_block['attrs']['question'] ) ) {
							$question = $inner_block['attrs']['question'];
						}
						if ( empty( $answer ) && isset( $inner_block['attrs']['answer'] ) ) {
							$answer = $inner_block['attrs']['answer'];
						}

						if ( ! empty( $question ) && ! empty( $answer ) ) {
							$questions[] = array(
								'question' => $question,
								'answer'   => $answer,
							);
						}
					}
				}
			}

			// Custom Frank SEO FAQ block (if we build one later)
			if ( 'frank-seo/faq' === $block['blockName'] && ! empty( $block['attrs']['faqs'] ) ) {
				foreach ( $block['attrs']['faqs'] as $q ) {
					$questions[] = array(
						'question' => $q['question'],
						'answer'   => $q['answer'],
					);
				}
			}

			// Recurse inner blocks (e.g. if FAQ is inside a Group block)
			if ( ! empty( $block['innerBlocks'] ) ) {
				$questions = array_merge( $questions, $this->extract_faq_from_blocks( $block['innerBlocks'] ) );
			}
		}

		return $questions;
	}
}
