<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Handles blocking AI crawlers via robots.txt
 */
class Frank_SEO_Bot_Blocker {

	/**
	 * Register actions and filters.
	 */
	public function init() {
		add_filter( 'robots_txt', array( $this, 'filter_robots_txt' ), 10, 2 );
	}

	/**
	 * Append AI bot blocking rules to robots.txt if enabled.
	 *
	 * @param string $output The robots.txt output.
	 * @param bool   $public Whether the site is considered public.
	 * @return string
	 */
	public function filter_robots_txt( $output, $public ) {
		$settings = get_option( 'frank_seo_settings', array() );
		$enable_blocker = isset( $settings['enableAiBotBlocker'] ) ? (bool) $settings['enableAiBotBlocker'] : true;

		if ( ! $enable_blocker ) {
			return $output;
		}

		$ai_bots = array(
			'CCBot',
			'ChatGPT-User',
			'GPTBot',
			'Google-Extended',
			'OAI-SearchBot',
			'Omgilibot',
			'Omgili',
			'FacebookBot',
			'Diffbot',
			'Bytespider',
			'ImagesiftBot',
			'ClaudeBot',
			'Claude-Web',
			'Amazonbot',
			'anthropic-ai',
			'cohere-ai'
		);

		$rules  = "\n# Frank SEO - AI Bot Blocker (Anti-Scraping)\n";
		foreach ( $ai_bots as $bot ) {
			$rules .= "User-agent: " . $bot . "\nDisallow: /\n";
		}
		$rules .= "\n";

		return $output . $rules;
	}
}
