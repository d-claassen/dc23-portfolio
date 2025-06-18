<?php
/**
 * Plugin Name:       DC23 Portfolio
 * Description:       A plugin to help list your portfolio.
 * Requires at least: 6.6
 * Requires PHP:      7.2
 * Requires Plugins:  wordpress-seo
 * Version:           0.1.1
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
	// register_block_type( __DIR__ . '/build/date' );
}
add_action( 'init', 'dc23_portfolio_block_init' );
