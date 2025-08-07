<?php
/**
 * Plugin Name:       DC23 Portfolio
 * Description:       A plugin to help list your portfolio.
 * Requires at least: 6.6
 * Requires PHP:      7.2
 * Requires Plugins:  wordpress-seo
 * Version:           0.1.2
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
 * Initialize schema hooks for portfolio blocks.
 */
function dc23_portfolio_schema_init() {
	add_filter( 'wpseo_schema_block_dc23-portfolio/skill', 'dc23_portfolio_skills_to_schema', 10, 3 );
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
		if ( ! in_array( $contactmethod->get_key(), [ 'facebook' ], true ) ) {
			continue;
		}
		
		register_rest_field('user', $contactmethod->get_key(), array(
			'get_callback' => function($user) {
				return get_user_meta($user['id'], $contactmethod->get_key(), true);
			},
			'update_callback' => function($value, $user) {
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