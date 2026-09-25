<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Enterprise-Grade Dynamic XML Sitemap Engine
 *
 * Implements Google-compliant XML sitemaps with intelligent pagination,
 * dynamic transient caching, automated image extraction, taxonomy support,
 * noindex & redirect filtering, and developer extensibility.
 *
 * @package Frank_Website_SEO_Checker
 */
class Frank_SEO_Sitemap {

	/**
	 * Cache prefix for transients.
	 */
	const CACHE_PREFIX = 'frank_seo_sm_';

	/**
	 * Default entries per sitemap page.
	 */
	const DEFAULT_PER_PAGE = 1000;

	/**
	 * Register actions and filters.
	 */
	public function init() {
		add_action( 'init', array( $this, 'register_sitemap_rules' ) );
		add_filter( 'query_vars', array( $this, 'register_query_vars' ) );
		add_action( 'template_redirect', array( $this, 'handle_sitemap_request' ), 1 );

		// Intelligent cache invalidation hooks
		add_action( 'save_post', array( $this, 'invalidate_cache_on_post' ), 10, 2 );
		add_action( 'transition_post_status', array( $this, 'invalidate_cache_on_status' ), 10, 3 );
		add_action( 'deleted_post', array( $this, 'clear_cache' ) );
		add_action( 'created_term', array( $this, 'clear_cache' ) );
		add_action( 'edited_term', array( $this, 'clear_cache' ) );
		add_action( 'delete_term', array( $this, 'clear_cache' ) );
		add_action( 'update_option_frank_seo_settings', array( $this, 'clear_cache' ) );
	}

	/**
	 * Register sitemap rewrite rules.
	 * Supports standard industry patterns:
	 * - /sitemap_index.xml
	 * - /sitemap.xml
	 * - /{type}-sitemap{page}.xml (e.g. post-sitemap1.xml, post-sitemap.xml)
	 * - /sitemap-{type}.xml (backward compatibility)
	 */
	public function register_sitemap_rules() {
		add_rewrite_rule( 'sitemap_index\.xml$', 'index.php?frank_seo_sitemap=index', 'top' );
		add_rewrite_rule( 'sitemap\.xml$', 'index.php?frank_seo_sitemap=index', 'top' );
		add_rewrite_rule( '([a-zA-Z0-9_-]+)-sitemap([0-9]*)\.xml$', 'index.php?frank_seo_sitemap=$matches[1]&frank_seo_sitemap_page=$matches[2]', 'top' );
		add_rewrite_rule( 'sitemap-([a-zA-Z0-9_-]+)\.xml$', 'index.php?frank_seo_sitemap=$matches[1]', 'top' );
	}

	/**
	 * Register query variables.
	 */
	public function register_query_vars( $vars ) {
		$vars[] = 'frank_seo_sitemap';
		$vars[] = 'frank_seo_sitemap_page';
		return $vars;
	}

	/**
	 * Intercepts the request and serves the XML Sitemap with caching & compression.
	 */
	public function handle_sitemap_request() {
		$sitemap_type = get_query_var( 'frank_seo_sitemap' );

		if ( empty( $sitemap_type ) ) {
			return;
		}

		$page = max( 1, (int) get_query_var( 'frank_seo_sitemap_page' ) );

		// 1. Verify if sitemaps are enabled
		$settings = get_option( 'frank_seo_settings', array() );
		$enabled = isset( $settings['enableSitemap'] ) ? (bool) $settings['enableSitemap'] : ( isset( $settings['xmlSitemaps'] ) ? (bool) $settings['xmlSitemaps'] : true );
		$enabled = apply_filters( 'frank_seo_sitemap_enabled', $enabled );

		if ( ! $enabled ) {
			global $wp_query;
			$wp_query->set_404();
			status_header( 404 );
			nocache_headers();
			$template = get_query_template( '404' );
			if ( $template && file_exists( $template ) ) {
				include $template;
			}
			exit;
		}

		// 2. Check intelligent cache
		$cache_key = self::CACHE_PREFIX . md5( $sitemap_type . '_' . $page . '_' . get_current_blog_id() );
		$caching_enabled = apply_filters( 'frank_seo_sitemap_cache_enabled', true );

		if ( $caching_enabled ) {
			$cached_xml = get_transient( $cache_key );
			if ( ! empty( $cached_xml ) ) {
				$this->send_headers();
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo $cached_xml;
				exit;
			}
		}

		// 3. Generate XML buffer
		while ( ob_get_level() ) {
			ob_end_clean();
		}
		ob_start();

		$this->render_xml_header();

		$valid = false;
		if ( 'index' === $sitemap_type ) {
			$valid = $this->render_sitemap_index();
		} else {
			$post_types = $this->get_supported_post_types();
			$taxonomies = $this->get_supported_taxonomies();

			if ( in_array( $sitemap_type, $post_types, true ) ) {
				$valid = $this->render_post_type_sitemap( $sitemap_type, $page );
			} elseif ( in_array( $sitemap_type, $taxonomies, true ) ) {
				$valid = $this->render_taxonomy_sitemap( $sitemap_type, $page );
			} else {
				// Allow developer custom sitemaps
				$valid = apply_filters( "frank_seo_sitemap_render_{$sitemap_type}", false, $page );
			}
		}

		if ( ! $valid ) {
			ob_end_clean();
			global $wp_query;
			$wp_query->set_404();
			status_header( 404 );
			$template = get_query_template( '404' );
			if ( $template && file_exists( $template ) ) {
				include $template;
			}
			exit;
		}

		$output = ob_get_clean();

		// 4. Save to transient cache (24 hours default, flushed on content change)
		if ( $caching_enabled && ! empty( $output ) ) {
			set_transient( $cache_key, $output, DAY_IN_SECONDS );
		}

		$this->send_headers();
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo $output;
		exit;
	}

	/**
	 * Send proper HTTP response headers.
	 */
	private function send_headers() {
		header( 'Content-Type: application/xml; charset=utf-8' );
		header( 'X-Robots-Tag: noindex, follow', true );
		nocache_headers();
	}

	/**
	 * Send XML declaration and XSL stylesheet reference.
	 */
	private function render_xml_header() {
		echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
		echo '<?xml-stylesheet type="text/xsl" href="' . esc_url( FRANK_SEO_AUDIT_URL . 'assets/sitemap.xsl' ) . '"?>' . "\n";
	}

	/**
	 * Output the parent Sitemap Index XML.
	 *
	 * @return bool True on success.
	 */
	private function render_sitemap_index() {
		$sitemaps = array();
		$per_page = $this->get_per_page();

		// 1. Post Types Sitemaps
		$post_types = $this->get_supported_post_types();
		foreach ( $post_types as $pt ) {
			$total_posts = $this->get_published_post_count( $pt );
			if ( $total_posts <= 0 ) {
				continue;
			}

			$pages = (int) ceil( $total_posts / $per_page );
			$lastmod = $this->get_last_modified_date_post_type( $pt );

			if ( $pages <= 1 ) {
				$sitemaps[] = array(
					'loc'     => home_url( "/{$pt}-sitemap.xml" ),
					'lastmod' => $lastmod,
				);
			} else {
				for ( $i = 1; $i <= $pages; $i++ ) {
					$sitemaps[] = array(
						'loc'     => home_url( "/{$pt}-sitemap{$i}.xml" ),
						'lastmod' => $lastmod,
					);
				}
			}
		}

		// 2. Taxonomies Sitemaps
		$taxonomies = $this->get_supported_taxonomies();
		foreach ( $taxonomies as $tax ) {
			$total_terms = $this->get_term_count( $tax );
			if ( $total_terms <= 0 ) {
				continue;
			}

			$pages = (int) ceil( $total_terms / $per_page );
			$lastmod = $this->get_last_modified_date_taxonomy( $tax );

			if ( $pages <= 1 ) {
				$sitemaps[] = array(
					'loc'     => home_url( "/{$tax}-sitemap.xml" ),
					'lastmod' => $lastmod,
				);
			} else {
				for ( $i = 1; $i <= $pages; $i++ ) {
					$sitemaps[] = array(
						'loc'     => home_url( "/{$tax}-sitemap{$i}.xml" ),
						'lastmod' => $lastmod,
					);
				}
			}
		}

		// 3. Developer hook to add custom sub-sitemaps
		$sitemaps = apply_filters( 'frank_seo_sitemap_index_items', $sitemaps );

		echo '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
		foreach ( $sitemaps as $sm ) {
			echo "  <sitemap>\n";
			echo '    <loc>' . esc_url( $sm['loc'] ) . "</loc>\n";
			if ( ! empty( $sm['lastmod'] ) ) {
				echo '    <lastmod>' . esc_html( $sm['lastmod'] ) . "</lastmod>\n";
			}
			echo "  </sitemap>\n";
		}
		echo '</sitemapindex>' . "\n";

		return true;
	}

	/**
	 * Output sitemap for a specific post type with pagination & image tags.
	 *
	 * @param string $post_type The post type.
	 * @param int    $page      The pagination page.
	 * @return bool True if valid, false if empty page.
	 */
	private function render_post_type_sitemap( $post_type, $page = 1 ) {
		$per_page = $this->get_per_page();
		$offset   = ( $page - 1 ) * $per_page;

		$excluded_ids = $this->get_excluded_post_ids();
		$active_redirects = $this->get_active_redirect_paths();

		$args = array(
			'post_type'              => $post_type,
			'post_status'            => 'publish',
			'posts_per_page'         => $per_page,
			'offset'                 => $offset,
			'orderby'                => 'modified',
			'order'                  => 'DESC',
			'no_found_rows'          => true,
			'update_post_term_cache' => false,
		);

		if ( ! empty( $excluded_ids ) ) {
			$args['post__not_in'] = $excluded_ids;
		}

		$query = new WP_Query( $args );

		if ( ! $query->have_posts() && $page > 1 ) {
			return false;
		}

		$settings = get_option( 'frank_seo_settings', array() );
		$include_images = isset( $settings['sitemapIncludeImages'] ) ? (bool) $settings['sitemapIncludeImages'] : ( isset( $settings['enableImageSEO'] ) ? (bool) $settings['enableImageSEO'] : true );

		echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

		while ( $query->have_posts() ) {
			$query->the_post();
			$post = $query->post;

			// Skip password protected posts
			if ( ! empty( $post->post_password ) ) {
				continue;
			}

			// Respect robots noindex
			$robots_index = get_post_meta( $post->ID, '_frank_seo_robots_index', true );
			if ( 'noindex' === $robots_index ) {
				continue;
			}

			// Check custom developer exclusion filter
			if ( apply_filters( 'frank_seo_sitemap_exclude_post', false, $post->ID, $post_type ) ) {
				continue;
			}

			$permalink = get_permalink( $post->ID );
			$path      = wp_parse_url( $permalink, PHP_URL_PATH );

			// Filter out posts that are active 301/302 redirects
			if ( ! empty( $path ) && isset( $active_redirects[ rtrim( $path, '/' ) ] ) ) {
				continue;
			}

			$canonical = get_post_meta( $post->ID, '_frank_seo_canonical', true );
			$loc = ! empty( $canonical ) ? $canonical : $permalink;

			$is_front = ( (int) get_option( 'page_on_front' ) === $post->ID ) || ( 'page' === $post_type && is_front_page() );
			$priority = $is_front ? '1.0' : ( 'page' === $post_type ? '0.8' : '0.7' );
			$changefreq = $is_front ? 'daily' : 'weekly';

			// Format lastmod strictly in W3C ISO 8601 format
			$mod_gmt = $post->post_modified_gmt;
			$lastmod = ( ! empty( $mod_gmt ) && '0000-00-00 00:00:00' !== $mod_gmt )
				? gmdate( 'Y-m-d\TH:i:s+00:00', strtotime( $mod_gmt ) )
				: get_the_modified_date( 'c', $post->ID );

			$images = array();
			if ( $include_images ) {
				$images = $this->extract_post_images( $post );
			}

			$entry = array(
				'loc'        => $loc,
				'lastmod'    => $lastmod,
				'changefreq' => $changefreq,
				'priority'   => $priority,
				'images'     => $images,
			);

			$entry = apply_filters( 'frank_seo_sitemap_url_entry', $entry, $post, 'post' );

			if ( empty( $entry ) || empty( $entry['loc'] ) ) {
				continue;
			}

			echo "  <url>\n";
			echo '    <loc>' . esc_url( $entry['loc'] ) . "</loc>\n";
			if ( ! empty( $entry['lastmod'] ) ) {
				echo '    <lastmod>' . esc_html( $entry['lastmod'] ) . "</lastmod>\n";
			}
			if ( ! empty( $entry['changefreq'] ) ) {
				echo '    <changefreq>' . esc_html( $entry['changefreq'] ) . "</changefreq>\n";
			}
			if ( ! empty( $entry['priority'] ) ) {
				echo '    <priority>' . esc_html( $entry['priority'] ) . "</priority>\n";
			}

			if ( ! empty( $entry['images'] ) && is_array( $entry['images'] ) ) {
				foreach ( $entry['images'] as $img ) {
					if ( empty( $img['loc'] ) ) {
						continue;
					}
					echo "    <image:image>\n";
					echo '      <image:loc>' . esc_url( $img['loc'] ) . "</image:loc>\n";
					if ( ! empty( $img['title'] ) ) {
						echo '      <image:title>' . esc_html( $img['title'] ) . "</image:title>\n";
					}
					if ( ! empty( $img['caption'] ) ) {
						echo '      <image:caption>' . esc_html( $img['caption'] ) . "</image:caption>\n";
					}
					echo "    </image:image>\n";
				}
			}

			echo "  </url>\n";
		}

		wp_reset_postdata();
		echo '</urlset>' . "\n";

		return true;
	}

	/**
	 * Output sitemap for Taxonomies (Categories, Tags, Custom Taxonomies).
	 *
	 * @param string $taxonomy The taxonomy name.
	 * @param int    $page     Pagination page.
	 * @return bool True if valid, false if empty page.
	 */
	private function render_taxonomy_sitemap( $taxonomy, $page = 1 ) {
		$per_page = $this->get_per_page();
		$offset   = ( $page - 1 ) * $per_page;

		$terms = get_terms( array(
			'taxonomy'   => $taxonomy,
			'hide_empty' => true,
			'number'     => $per_page,
			'offset'     => $offset,
		) );

		if ( empty( $terms ) || is_wp_error( $terms ) ) {
			return ( 1 === $page );
		}

		echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

		foreach ( $terms as $term ) {
			// Skip if term is excluded via filter
			if ( apply_filters( 'frank_seo_sitemap_exclude_term', false, $term->term_id, $taxonomy ) ) {
				continue;
			}

			$link = get_term_link( $term );
			if ( is_wp_error( $link ) ) {
				continue;
			}

			// Get last modified date of the newest published post assigned to this term
			$lastmod = $this->get_term_last_modified( $term->term_taxonomy_id );

			$entry = array(
				'loc'        => $link,
				'lastmod'    => $lastmod,
				'changefreq' => 'weekly',
				'priority'   => '0.6',
			);

			$entry = apply_filters( 'frank_seo_sitemap_url_entry', $entry, $term, 'taxonomy' );

			if ( empty( $entry ) || empty( $entry['loc'] ) ) {
				continue;
			}

			echo "  <url>\n";
			echo '    <loc>' . esc_url( $entry['loc'] ) . "</loc>\n";
			if ( ! empty( $entry['lastmod'] ) ) {
				echo '    <lastmod>' . esc_html( $entry['lastmod'] ) . "</lastmod>\n";
			}
			if ( ! empty( $entry['changefreq'] ) ) {
				echo '    <changefreq>' . esc_html( $entry['changefreq'] ) . "</changefreq>\n";
			}
			if ( ! empty( $entry['priority'] ) ) {
				echo '    <priority>' . esc_html( $entry['priority'] ) . "</priority>\n";
			}
			echo "  </url>\n";
		}

		echo '</urlset>' . "\n";
		return true;
	}

	/**
	 * Extract images from a post: featured image + post_content images + WooCommerce galleries.
	 *
	 * @param WP_Post $post The post object.
	 * @return array Array of images with 'loc', 'title', 'caption'.
	 */
	private function extract_post_images( $post ) {
		$images = array();
		$seen   = array();

		// 1. Featured image
		if ( has_post_thumbnail( $post->ID ) ) {
			$thumb_id  = get_post_thumbnail_id( $post->ID );
			$thumb_url = wp_get_attachment_image_url( $thumb_id, 'full' );
			if ( $thumb_url ) {
				$alt   = get_post_meta( $thumb_id, '_wp_attachment_image_alt', true );
				$title = get_the_title( $thumb_id );
				$images[] = array(
					'loc'     => $thumb_url,
					'title'   => ! empty( $alt ) ? $alt : $title,
					'caption' => wp_get_attachment_caption( $thumb_id ) ?: '',
				);
				$seen[ $thumb_url ] = true;
			}
		}

		// 2. WooCommerce product gallery images
		if ( 'product' === $post->post_type && function_exists( 'wc_get_product' ) ) {
			$product = wc_get_product( $post->ID );
			if ( $product ) {
				$gallery_ids = $product->get_gallery_image_ids();
				if ( ! empty( $gallery_ids ) ) {
					foreach ( $gallery_ids as $gid ) {
						$g_url = wp_get_attachment_image_url( $gid, 'full' );
						if ( $g_url && ! isset( $seen[ $g_url ] ) ) {
							$alt   = get_post_meta( $gid, '_wp_attachment_image_alt', true );
							$title = get_the_title( $gid );
							$images[] = array(
								'loc'     => $g_url,
								'title'   => ! empty( $alt ) ? $alt : $title,
								'caption' => wp_get_attachment_caption( $gid ) ?: '',
							);
							$seen[ $g_url ] = true;
						}
					}
				}
			}
		}

		// 3. Images embedded inside post_content (Gutenberg blocks or classic HTML)
		if ( ! empty( $post->post_content ) ) {
			if ( preg_match_all( '/<img[^>]+src=[\'"]([^\'"]+)[\'"][^>]*>/i', $post->post_content, $matches, PREG_SET_ORDER ) ) {
				foreach ( $matches as $img_tag ) {
					$src = $img_tag[1];
					if ( empty( $src ) || isset( $seen[ $src ] ) ) {
						continue;
					}

					// Skip data URIs or base64
					if ( 0 === strpos( $src, 'data:' ) ) {
						continue;
					}

					// Make relative paths absolute
					if ( 0 === strpos( $src, '/' ) && 0 !== strpos( $src, '//' ) ) {
						$src = home_url( $src );
					}

					$alt = '';
					if ( preg_match( '/alt=[\'"]([^\'"]*)[\'"]/i', $img_tag[0], $alt_m ) ) {
						$alt = $alt_m[1];
					}

					$title = '';
					if ( preg_match( '/title=[\'"]([^\'"]*)[\'"]/i', $img_tag[0], $title_m ) ) {
						$title = $title_m[1];
					}

					$images[] = array(
						'loc'     => $src,
						'title'   => ! empty( $alt ) ? $alt : ( ! empty( $title ) ? $title : $post->post_title ),
						'caption' => $title,
					);
					$seen[ $src ] = true;

					// Limit to 1000 images per URL per Google spec
					if ( count( $images ) >= 1000 ) {
						break;
					}
				}
			}
		}

		return $images;
	}

	/**
	 * Get list of supported public post types based on settings.
	 *
	 * @return array Array of post type names.
	 */
	public function get_supported_post_types() {
		$all_public = get_post_types( array( 'public' => true ), 'names' );
		unset( $all_public['attachment'] );

		$settings = get_option( 'frank_seo_settings', array() );
		$configured = isset( $settings['sitemapPostTypes'] ) && is_array( $settings['sitemapPostTypes'] )
			? $settings['sitemapPostTypes']
			: array( 'post', 'page' );

		// Filter configured by currently registered public post types
		$result = array_intersect( $configured, array_keys( $all_public ) );
		if ( empty( $result ) ) {
			$result = array( 'post', 'page' );
		}

		return apply_filters( 'frank_seo_sitemap_post_types', array_values( $result ) );
	}

	/**
	 * Get list of supported public taxonomies based on settings.
	 *
	 * @return array Array of taxonomy names.
	 */
	public function get_supported_taxonomies() {
		$all_public = get_taxonomies( array( 'public' => true ), 'names' );
		unset( $all_public['post_format'] );

		$settings = get_option( 'frank_seo_settings', array() );
		$configured = isset( $settings['sitemapTaxonomies'] ) && is_array( $settings['sitemapTaxonomies'] )
			? $settings['sitemapTaxonomies']
			: array( 'category' );

		$result = array_intersect( $configured, array_keys( $all_public ) );

		return apply_filters( 'frank_seo_sitemap_taxonomies', array_values( $result ) );
	}

	/**
	 * Get entries per sitemap limit.
	 *
	 * @return int Limit between 100 and 2000.
	 */
	public function get_per_page() {
		$settings = get_option( 'frank_seo_settings', array() );
		$limit = isset( $settings['sitemapEntriesPerPage'] ) ? (int) $settings['sitemapEntriesPerPage'] : self::DEFAULT_PER_PAGE;
		$limit = max( 100, min( 2000, $limit ) );
		return apply_filters( 'frank_seo_sitemap_items_per_page', $limit );
	}

	/**
	 * Get excluded post IDs.
	 *
	 * @return array Array of integer IDs.
	 */
	public function get_excluded_post_ids() {
		$settings = get_option( 'frank_seo_settings', array() );
		$raw = isset( $settings['sitemapExcludePostIds'] ) ? $settings['sitemapExcludePostIds'] : '';
		if ( empty( $raw ) ) {
			return array();
		}
		$parts = explode( ',', $raw );
		return array_filter( array_map( 'absint', $parts ) );
	}

	/**
	 * Get active redirect source paths mapped as an associative array for O(1) lookup.
	 *
	 * @return array Associative array of url_from => true.
	 */
	private function get_active_redirect_paths() {
		global $wpdb;
		$table = $wpdb->prefix . 'frank_seo_redirects';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_col( "SELECT url_from FROM $table" );
		if ( empty( $rows ) ) {
			return array();
		}

		$paths = array();
		foreach ( $rows as $rf ) {
			$clean = rtrim( '/' . ltrim( $rf, '/' ), '/' );
			$paths[ $clean ] = true;
		}
		return $paths;
	}

	/**
	 * Get published post count for a post type.
	 *
	 * @param string $post_type The post type.
	 * @return int Total published posts.
	 */
	private function get_published_post_count( $post_type ) {
		$count = wp_count_posts( $post_type );
		return isset( $count->publish ) ? (int) $count->publish : 0;
	}

	/**
	 * Get total terms with count > 0 for a taxonomy.
	 *
	 * @param string $taxonomy Taxonomy name.
	 * @return int Total terms.
	 */
	private function get_term_count( $taxonomy ) {
		return (int) wp_count_terms( array(
			'taxonomy'   => $taxonomy,
			'hide_empty' => true,
		) );
	}

	/**
	 * Get last modified date for a post type.
	 *
	 * @param string $post_type The post type.
	 * @return string|null ISO 8601 string or null.
	 */
	public function get_last_modified_date_post_type( $post_type ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$date = $wpdb->get_var( $wpdb->prepare( "SELECT post_modified_gmt FROM $wpdb->posts WHERE post_type = %s AND post_status = 'publish' ORDER BY post_modified_gmt DESC LIMIT 1", $post_type ) );
		return ( $date && '0000-00-00 00:00:00' !== $date ) ? gmdate( 'Y-m-d\TH:i:s+00:00', strtotime( $date ) ) : null;
	}

	/**
	 * Get last modified date for a taxonomy.
	 *
	 * @param string $taxonomy Taxonomy name.
	 * @return string|null ISO 8601 string or null.
	 */
	public function get_last_modified_date_taxonomy( $taxonomy ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$date = $wpdb->get_var( $wpdb->prepare( "
			SELECT p.post_modified_gmt FROM $wpdb->posts p
			INNER JOIN $wpdb->term_relationships tr ON p.ID = tr.object_id
			INNER JOIN $wpdb->term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
			WHERE tt.taxonomy = %s AND p.post_status = 'publish'
			ORDER BY p.post_modified_gmt DESC LIMIT 1
		", $taxonomy ) );

		return ( $date && '0000-00-00 00:00:00' !== $date ) ? gmdate( 'Y-m-d\TH:i:s+00:00', strtotime( $date ) ) : null;
	}

	/**
	 * Get last modified date for an individual term.
	 *
	 * @param int $term_taxonomy_id Term taxonomy ID.
	 * @return string|null ISO 8601 string or null.
	 */
	private function get_term_last_modified( $term_taxonomy_id ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$date = $wpdb->get_var( $wpdb->prepare( "
			SELECT p.post_modified_gmt FROM $wpdb->posts p
			INNER JOIN $wpdb->term_relationships tr ON p.ID = tr.object_id
			WHERE tr.term_taxonomy_id = %d AND p.post_status = 'publish'
			ORDER BY p.post_modified_gmt DESC LIMIT 1
		", (int) $term_taxonomy_id ) );

		return ( $date && '0000-00-00 00:00:00' !== $date ) ? gmdate( 'Y-m-d\TH:i:s+00:00', strtotime( $date ) ) : null;
	}

	/**
	 * Clear all sitemap transient caches.
	 */
	public function clear_cache() {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE '_transient_frank_seo_sm_%' OR option_name LIKE '_transient_timeout_frank_seo_sm_%'" );

		do_action( 'frank_seo_sitemap_cache_cleared' );
	}

	/**
	 * Invalidate cache when post is saved.
	 *
	 * @param int     $post_id Post ID.
	 * @param WP_Post $post    Post object.
	 */
	public function invalidate_cache_on_post( $post_id, $post ) {
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}
		if ( 'publish' === $post->post_status ) {
			$this->clear_cache();
		}
	}

	/**
	 * Invalidate cache when post status transitions.
	 *
	 * @param string  $new_status New status.
	 * @param string  $old_status Old status.
	 * @param WP_Post $post       Post object.
	 */
	public function invalidate_cache_on_status( $new_status, $old_status, $post ) {
		if ( 'publish' === $new_status || 'publish' === $old_status ) {
			$this->clear_cache();
		}
	}
}
