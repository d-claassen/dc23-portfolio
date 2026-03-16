<?php
/**
 * Plugin Name:       DC23 Portfolio
 * Description:       A plugin to help list your portfolio.
 * Requires at least: 6.6
 * Requires PHP:      7.2
 * Requires Plugins:  wordpress-seo
 * Version:           0.3.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       dc23-portfolio
 * GitHub Plugin URI: https://github.com/d-claassen/dc23-portfolio
 * Primary Branch:    main
 * Release Asset:     true
 *
 * @package Dc23
 */

declare( strict_types=1 );

use Yoast\WP\SEO\Context\Meta_Tags_Context;
use Yoast\WP\SEO\User_Meta\Application\Additional_Contactmethods_Collector;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once 'vendor/autoload.php';

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function dc23_portfolio_block_init() {
	register_block_type( __DIR__ . '/build/skill' );
	register_block_type( __DIR__ . '/build/socials' );
	register_block_type( __DIR__ . '/build/experience' );
	register_block_type( __DIR__ . '/build/education' );
	register_block_type( __DIR__ . '/build/organization' );
}
add_action( 'init', 'dc23_portfolio_block_init' );

/**
 * Register post meta for ProfilePage user selection.
 */
function dc23_portfolio_register_post_meta() {
	register_post_meta(
		'page',
		'_dc23_portfolio_user_id',
		array(
			'type'              => 'integer',
			'single'            => true,
			'show_in_rest'      => true,
			'sanitize_callback' => 'absint',
			'auth_callback'     => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}
add_action( 'init', 'dc23_portfolio_register_post_meta' );

/**
 * Enqueue ProfilePage schema sidebar script.
 */
function dc23_portfolio_enqueue_editor_assets() {
	$asset_file = include plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

	wp_enqueue_script(
		'dc23-portfolio-profile-schema',
		plugins_url( 'build/index.js', __FILE__ ),
		$asset_file['dependencies'],
		$asset_file['version'],
		true
	);
}
add_action( 'enqueue_block_editor_assets', 'dc23_portfolio_enqueue_editor_assets' );


/**
 * Initialize schema hooks for portfolio blocks.
 */
function dc23_portfolio_schema_init() {
	// Initialize Resume schema aggregator.
	$resume = new \DC23\Portfolio\Schema\Resume();
	$resume->register();

	// Add mainEntity reference to ProfilePage WebPage schema.
	add_filter( 'wpseo_schema_webpage', 'dc23_portfolio_schema_webpage', 10, 2 );
}
add_action( 'init', 'dc23_portfolio_schema_init' );

function dc23_portfolio_rest_user_profiles() {
	if ( ! function_exists( 'YoastSEO' ) ) {
		return;
	}

	$collector = \YoastSEO()->classes->get( Additional_Contactmethods_Collector::class );
	foreach( $collector->get_additional_contactmethods() as $contactmethod){
		register_rest_field('user', $contactmethod->get_key(), array(
			'get_callback' => function($user) use ($contactmethod) {
				return get_user_meta($user['id'], $contactmethod->get_key(), true);
			},
			'update_callback' => function($value, $user) use ($contactmethod) {
				return update_user_meta($user->ID, $contactmethod->get_key(), $value);
			},
			'schema' => array(
				'type' => 'string',
				'description' => $contactmethod->get_label(),
				)
			)
		);
	}
}

add_action('rest_api_init', 'dc23_portfolio_rest_user_profiles');

/**
 * Modify WebPage schema to add mainEntity and about properties for ProfilePage.
 *
 * @param array                                       $data    WebPage schema data.
 * @param \Yoast\WP\SEO\Context\Meta_Tags_Context $context Yoast context.
 * @return array Modified WebPage schema data.
 */
function dc23_portfolio_schema_webpage( $data, $context ) {
	// Only process on singular pages
	if ( ! is_singular( 'page' ) ) {
		return $data;
	}

	// Get the selected user ID from post meta
	$user_id = get_post_meta( get_the_ID(), '_dc23_portfolio_user_id', true );

	// Return early if no user selected
	if ( empty( $user_id ) ) {
		return $data;
	}

	// Get the user
	$user = get_userdata( $user_id );
	if ( ! $user ) {
		return $data;
	}

	// Generate the Person @id using Yoast's ID_Helper with context for complete URL
	$person_id = YoastSEO()->helpers->schema->id->get_user_schema_id( $user_id, $context );

	// Add mainEntity and about properties
	$data['mainEntity'] = array( '@id' => $person_id );
	$data['about']      = array( '@id' => $person_id );

	return $data;
}

