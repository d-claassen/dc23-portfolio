<?php
/**
 * Plugin Name:       DC23 Portfolio
 * Description:       A plugin to help list your portfolio.
 * Requires at least: 6.6
 * Requires PHP:      7.2
 * Requires Plugins:  wordpress-seo
 * Version:           0.2.2
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
	add_filter( 'wpseo_schema_block_dc23-portfolio/skill', 'dc23_portfolio_skills_to_schema', 10, 3 );
	add_filter( 'wpseo_schema_webpage', 'dc23_portfolio_schema_webpage', 10, 1 );
	add_filter( 'wpseo_schema_graph_pieces', 'dc23_portfolio_schema_graph_pieces', 11, 2 );
	// add_filter( 'wpseo_pre_schema_block_type_dc23-portfolio/education', 'dc23_portfolio_education_to_schema', 10, 3 );
	// add_filter( 'wpseo_pre_schema_block_type_dc23-portfolio/experience', 'dc23_portfolio_experience_to_schema', 10, 3 );
}
add_action( 'init', 'dc23_portfolio_schema_init' );

/**
 * Convert skills block attributes to schema.org data.
 *
 * @param array $schema_graph Current schema data.
 * @param array $block_data Block data including attributes.
 * @param Meta_Tags_Context $context Yoast context.
 * @return array Modified schema data.
 */
function dc23_portfolio_skills_to_schema( $schema_graph, $block_data, $context ) {
	if ( empty( $block_data['attrs']['name'] ) ) {
		return $schema_graph;
	}

    $specialty = [
        '@id'   => $context->canonical . '#/schema/Specialty/' . $block['id'],
        '@type'=>'http://schema.org/Specialty',
        'name'=>$block_data['attrs']['name'],
    ];

	$description = $block_data['attrs']['description'];
	if ( ! empty( $description ) ) {
        $specialty['description'] = $description;
	}

/* 
@id":"https://www.dennisclaassen.nl/#/schema/Specialty/5"
"@type":"http://schema.org/Specialty"
"name":"Soft skills"
"description":"Communication, coaching, prioritizing, proactive."
"sameAs":"https://en.wikipedia.org/wiki/Soft_skills"
*/

    array_push( $schema_graph, $specialty );

	return $schema_graph;
}

function custom_rest_user_profiles() {
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

add_action('rest_api_init', 'custom_rest_user_profiles');

/**
 * Modify WebPage schema to add mainEntity and about properties for ProfilePage.
 *
 * @param array $data WebPage schema data.
 * @return array Modified WebPage schema data.
 */
function dc23_portfolio_schema_webpage( $data ) {
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

	// Generate the Person @id
	$person_id = trailingslashit( get_permalink() ) . '#/schema/person/' . $user_id;

	// Add mainEntity and about properties
	$data['mainEntity'] = array( '@id' => $person_id );
	$data['about']      = array( '@id' => $person_id );

	return $data;
}

/**
 * Add Person schema piece for the selected user.
 *
 * @param array $pieces Current schema pieces.
 * @param \Yoast\WP\SEO\Context\Meta_Tags_Context $context Yoast context.
 * @return array Modified schema pieces.
 */
function dc23_portfolio_schema_graph_pieces( $pieces, $context ) {
	// Only process on singular pages
	if ( ! is_singular( 'page' ) ) {
		return $pieces;
	}

	// Get the selected user ID from post meta
	$user_id = get_post_meta( get_the_ID(), '_dc23_portfolio_user_id', true );

	// Return early if no user selected
	if ( empty( $user_id ) ) {
		return $pieces;
	}

	// Get the user
	$user = get_userdata( $user_id );
	if ( ! $user ) {
		return $pieces;
	}

	// Build Person schema
	$person_schema = array(
		'@type' => 'Person',
		'@id'   => trailingslashit( get_permalink() ) . '#/schema/person/' . $user_id,
		'name'  => $user->display_name,
	);

	// Add Yoast SEO Premium profile fields if available
	$yoast_title = get_user_meta( $user_id, 'wpseo_title', true );
	if ( ! empty( $yoast_title ) ) {
		$person_schema['jobTitle'] = $yoast_title;
	}

	$yoast_pronouns = get_user_meta( $user_id, 'wpseo_pronouns', true );
	if ( ! empty( $yoast_pronouns ) ) {
		$person_schema['knowsAbout'] = $yoast_pronouns; // Using knowsAbout as there's no perfect property for pronouns
	}

	$yoast_employer = get_user_meta( $user_id, 'wpseo_employer', true );
	if ( ! empty( $yoast_employer ) ) {
		$person_schema['worksFor'] = array(
			'@type' => 'Organization',
			'name'  => $yoast_employer,
		);
	}

	// Add email if available
	if ( ! empty( $user->user_email ) ) {
		$person_schema['email'] = $user->user_email;
	}

	// Add URL if available
	if ( ! empty( $user->user_url ) ) {
		$person_schema['url'] = $user->user_url;
	}

	// Add the Person piece to the graph
	$pieces[] = $person_schema;

	return $pieces;
}