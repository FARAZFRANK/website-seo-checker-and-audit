<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * The core crawling and auditing engine.
 */

class Frank_SEO_Auditor {

	/**
	 * Scanned links store.
	 * @var array
	 */
	private $scanned_links = array();

	/**
	 * Constructor.
	 */
	public function __construct() {
		// Constructor logic
	}

	/**
	 * Run audit for a specific post/page ID.
	 *
	 * @param int $post_id The ID of the post/page to audit.
	 * @return array The audit results.
	 */
	public function audit_post( $post_id ) {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return new WP_Error( 'invalid_post', 'Invalid post ID.' );
		}

		$url = get_permalink( $post_id );
		
		// Fetch the rendered HTML of the page
		$response = wp_remote_get( $url, array( 'timeout' => 15 ) );
		if ( is_wp_error( $response ) ) {
			return array( 'success' => false, 'message' => $response->get_error_message() );
		}

		$html = wp_remote_retrieve_body( $response );
		
		// Run checks on HTML
		$issues = $this->analyze_html( $html, $url, $post );

		$this->save_results( $post_id, $url, $post->post_title, $issues );

		return array( 'success' => true, 'post_id' => $post_id, 'issues' => count($issues) );
	}

	/**
	 * Run audit for an external/competitor URL.
	 *
	 * @param string $url The URL of the competitor page.
	 * @return array The audit results (score, issues).
	 */
	public function audit_external_url( $url ) {
		$response = wp_remote_get( $url, array( 
			'timeout'    => 15,
			'user-agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		) );
		
		if ( is_wp_error( $response ) ) {
			return array( 'success' => false, 'message' => $response->get_error_message() );
		}

		$html = wp_remote_retrieve_body( $response );
		if ( empty( $html ) ) {
			return array( 'success' => false, 'message' => 'Empty response from URL.' );
		}
		
		// Run checks on HTML (pass null for WordPress post object)
		$issues = $this->analyze_html( $html, $url, null );

		$errors_count = 0;
		$warnings_count = 0;
		$notices_count = 0;

		foreach ($issues as $issue) {
			if ($issue['severity'] === 'Error') $errors_count++;
			elseif ($issue['severity'] === 'Warning') $warnings_count++;
			elseif ($issue['severity'] === 'Notice') $notices_count++;
		}

		$seo_score = 100 - ($errors_count * 15) - ($warnings_count * 5) - ($notices_count * 2);
		$seo_score = max(0, min(100, $seo_score));

		return array(
			'success'        => true,
			'url'            => $url,
			'seo_score'      => $seo_score,
			'errors_count'   => $errors_count,
			'warnings_count' => $warnings_count,
			'notices_count'  => $notices_count,
			'issues'         => $issues,
		);
	}

	/**
	 * Analyze HTML string and return an array of issues.
	 */
	private function analyze_html( $html, $url, $post ) {
		$issues = array();

		// Basic DOM parsing
		$dom = new DOMDocument();
		libxml_use_internal_errors(true);
		@$dom->loadHTML( mb_convert_encoding( $html, 'HTML-ENTITIES', 'UTF-8' ) );
		libxml_clear_errors();

		// 1. Title Check
		$titles = $dom->getElementsByTagName( 'title' );
		if ( $titles->length === 0 ) {
			$issues[] = array(
				'type' => 'missing_title',
				'severity' => 'Error',
				'details' => 'Page is missing a <title> tag.',
			);
		} else {
			$title_length = mb_strlen( $titles->item(0)->textContent );
			if ( $title_length < 30 ) {
				$issues[] = array(
					'type' => 'short_title',
					'severity' => 'Warning',
					'details' => "Title is too short ($title_length characters). Recommended > 30.",
				);
			} elseif ( $title_length > 65 ) {
				$issues[] = array(
					'type' => 'long_title',
					'severity' => 'Warning',
					'details' => "Title is too long ($title_length characters). Recommended < 65.",
				);
			}
		}

		// 2. Meta Description Check
		$xpath = new DOMXPath($dom);
		$meta_desc = $xpath->query("//meta[@name='description']");
		if ($meta_desc->length === 0) {
			$issues[] = array(
				'type' => 'missing_meta_desc',
				'severity' => 'Error',
				'details' => 'Page is missing a meta description.',
			);
		} else {
			$desc_content = $meta_desc->item(0)->getAttribute('content');
			$desc_length = mb_strlen($desc_content);
			if ($desc_length < 50) {
				$issues[] = array(
					'type' => 'short_meta_desc',
					'severity' => 'Warning',
					'details' => "Meta description is too short ($desc_length characters). Recommended > 50.",
				);
			} elseif ($desc_length > 160) {
				$issues[] = array(
					'type' => 'long_meta_desc',
					'severity' => 'Warning',
					'details' => "Meta description is too long ($desc_length characters). Recommended < 160.",
				);
			}
		}

		// 3. H1 Check
		$h1s = $dom->getElementsByTagName( 'h1' );
		if ( $h1s->length === 0 ) {
			$issues[] = array(
				'type' => 'missing_h1',
				'severity' => 'Error',
				'details' => 'Page is missing an <h1> tag.',
			);
		} elseif ( $h1s->length > 1 ) {
			$issues[] = array(
				'type' => 'multiple_h1',
				'severity' => 'Warning',
				'details' => 'Page has more than one <h1> tag.',
			);
		}

		// 4. Image Alt Attribute Check
		$images = $dom->getElementsByTagName('img');
		$missing_alt = 0;
		foreach ($images as $img) {
			if (!$img->hasAttribute('alt') || trim($img->getAttribute('alt')) === '') {
				$missing_alt++;
			}
		}
		if ($missing_alt > 0) {
			$issues[] = array(
				'type' => 'missing_img_alt',
				'severity' => 'Warning',
				'details' => "$missing_alt image(s) missing 'alt' attribute.",
			);
		}

		// 5. Links Check (Internal/External)
		$links = $dom->getElementsByTagName('a');
		$internal_links = 0;
		$external_links = 0;
		$home_url = home_url();
		$this->scanned_links = array();
		$checked_statuses = array();

		// Fetch exclusion settings
		$settings = get_option( 'frank_seo_settings', array() );
		$exclude_menus    = isset( $settings['excludeMenus'] ) ? (bool) $settings['excludeMenus'] : true;
		$exclude_footers  = isset( $settings['excludeFooters'] ) ? (bool) $settings['excludeFooters'] : true;
		$exclude_sidebars = isset( $settings['excludeSidebars'] ) ? (bool) $settings['excludeSidebars'] : true;

		foreach ($links as $link) {
			// Skip links located inside excluded sections if enabled
			if ( $exclude_menus && $this->is_node_in_area( $link, 'menu' ) ) {
				continue;
			}
			if ( $exclude_footers && $this->is_node_in_area( $link, 'footer' ) ) {
				continue;
			}
			if ( $exclude_sidebars && $this->is_node_in_area( $link, 'sidebar' ) ) {
				continue;
			}

			$href = $link->getAttribute('href');
			$anchor_text = trim($link->textContent);
			$resolved_url = $this->resolve_url($href, $url);

			if (!$resolved_url) {
				continue;
			}

			// Determine if internal or external
			$link_type = (strpos($resolved_url, $home_url) === 0) ? 'internal' : 'external';
			if ($link_type === 'internal') {
				$internal_links++;
			} else {
				$external_links++;
			}

			// Check status code (deduplicated)
			if (!isset($checked_statuses[$resolved_url])) {
				$status_code = $this->check_url_status($resolved_url);
				$checked_statuses[$resolved_url] = $status_code;
			} else {
				$status_code = $checked_statuses[$resolved_url];
			}

			// Store link info for database
			$this->scanned_links[] = array(
				'url' => $resolved_url,
				'anchor_text' => $anchor_text,
				'link_type' => $link_type,
				'status_code' => $status_code,
			);

			// Register broken links as warnings
			if ($status_code === 0 || $status_code >= 400) {
				$status_display = $status_code === 0 ? 'Timeout/Error' : $status_code;
				$issues[] = array(
					'type' => 'broken_link',
					'severity' => 'Warning',
					'details' => sprintf(
						'Broken %s link: "%s" (Anchor: "%s", Status: %s)',
						$link_type,
						$resolved_url,
						empty($anchor_text) ? '[No text]' : $anchor_text,
						$status_display
					),
				);
			}
		}

		if ($internal_links === 0) {
			$issues[] = array(
				'type' => 'no_internal_links',
				'severity' => 'Notice',
				'details' => 'Page has no internal links.',
			);
		}

		// 6. Schema.org JSON-LD Check
		$scripts = $dom->getElementsByTagName('script');
		$has_schema = false;
		foreach ($scripts as $script) {
			if ($script->getAttribute('type') === 'application/ld+json') {
				$has_schema = true;
				break;
			}
		}
		if (!$has_schema) {
			$issues[] = array(
				'type' => 'missing_schema',
				'severity' => 'Notice',
				'details' => 'No Schema.org JSON-LD structured data found.',
			);
		}

		// 7. Canonical Tag Check
		$canonical = $xpath->query("//link[@rel='canonical']");
		if ($canonical->length === 0) {
			$issues[] = array(
				'type' => 'missing_canonical',
				'severity' => 'Warning',
				'details' => 'Page is missing a canonical link tag.',
			);
		}

		// 8. Basic Readability / Word Count
		$body = $dom->getElementsByTagName('body')->item(0);
		if ($body) {
			$text = wp_strip_all_tags($body->nodeValue);
			$word_count = str_word_count($text);
			if ($word_count < 300) {
				$issues[] = array(
					'type' => 'low_word_count',
					'severity' => 'Notice',
					'details' => "Low word count ($word_count words). Recommended > 300 for SEO.",
				);
			}
		}

		return $issues;
	}

	private function save_results( $page_id, $url, $title, $issues ) {
		$page_id = absint( $page_id );
		$url     = esc_url_raw( $url );
		$title   = sanitize_text_field( $title );

		global $wpdb;
		$table_pages = $wpdb->prefix . 'frank_audit_pages';
		$table_issues = $wpdb->prefix . 'frank_audit_issues';
		$table_links = $wpdb->prefix . 'frank_audit_links';

		// Clean old links first
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->delete($table_links, array('page_id' => $page_id), array('%d'));

		// Save new links
		if (!empty($this->scanned_links)) {
			foreach ($this->scanned_links as $link_data) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
				$wpdb->insert(
					$table_links,
					array(
						'page_id'     => $page_id,
						'url'         => esc_url_raw($link_data['url']),
						'anchor_text' => sanitize_text_field($link_data['anchor_text']),
						'link_type'   => sanitize_text_field($link_data['link_type']),
						'status_code' => $link_data['status_code'] !== null ? intval($link_data['status_code']) : null,
					),
					array('%d', '%s', '%s', '%s', '%d')
				);
			}
		}

		$errors_count = 0;
		$warnings_count = 0;
		$notices_count = 0;

		foreach ($issues as $issue) {
			if ($issue['severity'] === 'Error') $errors_count++;
			elseif ($issue['severity'] === 'Warning') $warnings_count++;
			elseif ($issue['severity'] === 'Notice') $notices_count++;
		}

		// Base score 100, deduct for issues
		$seo_score = 100 - ($errors_count * 15) - ($warnings_count * 5) - ($notices_count * 2);
		$seo_score = max(0, min(100, $seo_score)); // Clamp between 0 and 100

		// Update or Insert Page
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$existing_page = $wpdb->get_var($wpdb->prepare("SELECT page_id FROM $table_pages WHERE page_id = %d", $page_id));
		$current_time = current_time('mysql');
		
		if ($existing_page) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->update(
				$table_pages,
				array(
					'url' => $url,
					'title' => $title,
					'seo_score' => $seo_score,
					'errors_count' => $errors_count,
					'warnings_count' => $warnings_count,
					'notices_count' => $notices_count,
					'last_scanned_at' => $current_time
				),
				array('page_id' => $page_id)
			);
		} else {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$wpdb->insert(
				$table_pages,
				array(
					'page_id' => $page_id,
					'url' => $url,
					'title' => $title,
					'seo_score' => $seo_score,
					'errors_count' => $errors_count,
					'warnings_count' => $warnings_count,
					'notices_count' => $notices_count,
					'last_scanned_at' => $current_time
				)
			);
		}

		// Handle Issues
		// For simplicity, we just mark old Open issues as 'Fixed' if they are no longer detected,
		// and insert new ones.
		
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$existing_issues_raw = $wpdb->get_results($wpdb->prepare("SELECT issue_id, issue_type, status FROM $table_issues WHERE page_id = %d AND status != 'Fixed'", $page_id));
		$existing_issues = array();
		foreach ($existing_issues_raw as $ei) {
			$existing_issues[$ei->issue_type] = $ei;
		}

		$detected_types = array();

		foreach ($issues as $issue) {
			$type     = sanitize_key( $issue['type'] );
			$details  = sanitize_text_field( $issue['details'] );
			$severity = sanitize_text_field( $issue['severity'] );

			$detected_types[] = $type;

			if (isset($existing_issues[$type])) {
				// Issue still exists. Update last scanned at, if it was 'Ignored', we leave it 'Ignored'.
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$wpdb->update(
					$table_issues,
					array(
						'last_scanned_at' => $current_time,
						'details' => $details
					),
					array('issue_id' => $existing_issues[$type]->issue_id)
				);
			} else {
				// New issue
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
				$wpdb->insert(
					$table_issues,
					array(
						'page_id' => $page_id,
						'issue_type' => $type,
						'severity' => $severity,
						'status' => 'Open',
						'details' => $details,
						'first_detected_at' => $current_time,
						'last_scanned_at' => $current_time
					)
				);
			}
		}

		// Check for fixed issues
		foreach ($existing_issues as $type => $ei) {
			if (!in_array($type, $detected_types)) {
				// Issue is fixed
				if ($ei->status === 'Open') {
					// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
					$wpdb->update(
						$table_issues,
						array(
							'status' => 'Fixed',
							'last_scanned_at' => $current_time
						),
						array('issue_id' => $ei->issue_id)
					);
				}
			}
		}
	}

	/**
	 * Resolve a relative URL to absolute URL.
	 */
	private function resolve_url( $href, $page_url ) {
		$href = trim($href);
		if ( empty( $href ) || strpos( $href, '#' ) === 0 || strpos( $href, 'javascript:' ) === 0 || strpos( $href, 'mailto:' ) === 0 || strpos( $href, 'tel:' ) === 0 || strpos( $href, 'sms:' ) === 0 ) {
			return false;
		}

		// If it's already an absolute URL
		if ( strpos( $href, 'http://' ) === 0 || strpos( $href, 'https://' ) === 0 ) {
			return $href;
		}

		// Protocol relative //
		if ( strpos( $href, '//' ) === 0 ) {
			$scheme = wp_parse_url( $page_url, PHP_URL_SCHEME ) ?: 'http';
			return $scheme . ':' . $href;
		}

		// Root relative /
		if ( strpos( $href, '/' ) === 0 ) {
			$parsed_base = wp_parse_url( home_url() );
			$scheme = isset($parsed_base['scheme']) ? $parsed_base['scheme'] : 'http';
			$host = isset($parsed_base['host']) ? $parsed_base['host'] : '';
			return $scheme . '://' . $host . $href;
		}

		// Path relative
		$parsed_page = wp_parse_url( $page_url );
		$scheme = isset($parsed_page['scheme']) ? $parsed_page['scheme'] : 'http';
		$host = isset($parsed_page['host']) ? $parsed_page['host'] : '';
		$path = isset($parsed_page['path']) ? $parsed_page['path'] : '/';

		$dir = dirname( $path );
		if ( $dir === '\\' || $dir === '/' ) {
			$dir = '';
		}

		return $scheme . '://' . $host . '/' . ltrim( $dir . '/' . $href, '/' );
	}

	/**
	 * Perform HTTP ping check on a target URL.
	 */
	private function check_url_status( $url ) {
		$args = array(
			'timeout'     => 5,
			'redirection' => 5,
			'user-agent'  => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		);

		// Try HEAD request first
		$response = wp_remote_head( $url, $args );
		
		if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) >= 400 ) {
			// Fallback to GET request
			$response = wp_remote_get( $url, array_merge( $args, array( 'limit_response_size' => 1 ) ) );
		}

		if ( is_wp_error( $response ) ) {
			return 0; // Error / Connection Timeout
		}

		return (int) wp_remote_retrieve_response_code( $response );
	}

	/**
	 * Check if a DOMNode is inside a specific area (menu/header/navigation, footer, sidebar).
	 *
	 * @param DOMNode $node The node to check.
	 * @param string  $area The area type ('menu', 'footer', or 'sidebar').
	 * @return bool True if the node is inside the specified area.
	 */
	private function is_node_in_area( $node, $area ) {
		$parent = $node->parentNode;
		while ( $parent && $parent->nodeType === XML_ELEMENT_NODE ) {
			$tag_name = strtolower( $parent->nodeName );
			if ( $tag_name === 'body' || $tag_name === 'html' ) {
				break;
			}
			$class    = strtolower( $parent->getAttribute( 'class' ) );
			$id       = strtolower( $parent->getAttribute( 'id' ) );

			if ( $area === 'menu' ) {
				if ( $tag_name === 'header' || $tag_name === 'nav' ) {
					return true;
				}
				if ( 
					strpos( $class, 'menu' ) !== false || 
					strpos( $class, 'nav' ) !== false || 
					strpos( $class, 'header' ) !== false || 
					strpos( $class, 'navigation' ) !== false || 
					strpos( $class, 'navbar' ) !== false || 
					strpos( $id, 'menu' ) !== false || 
					strpos( $id, 'nav' ) !== false || 
					strpos( $id, 'header' ) !== false || 
					strpos( $id, 'navigation' ) !== false || 
					strpos( $id, 'navbar' ) !== false 
				) {
					return true;
				}
			} elseif ( $area === 'footer' ) {
				if ( $tag_name === 'footer' ) {
					return true;
				}
				if ( strpos( $class, 'footer' ) !== false || strpos( $id, 'footer' ) !== false ) {
					return true;
				}
			} elseif ( $area === 'sidebar' ) {
				if ( $tag_name === 'aside' ) {
					return true;
				}
				if ( 
					strpos( $class, 'sidebar' ) !== false || 
					strpos( $class, 'widget' ) !== false || 
					strpos( $id, 'sidebar' ) !== false || 
					strpos( $id, 'widget' ) !== false 
				) {
					return true;
				}
			}
			$parent = $parent->parentNode;
		}
		return false;
	}
}
