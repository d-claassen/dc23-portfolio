<?php

use Yoast\WP\SEO\User_Meta\Application\Additional_Contactmethods_Collector;

/**
 * Render callback for the Yoast Author Social block.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      Block instance.
 * @return string  Block HTML output.
 */

// Get attributes with defaults
$author_id = isset($attributes['authorId']) ? intval($attributes['authorId']) : 0;
$selected_platforms = isset($attributes['selectedPlatforms']) ? $attributes['selectedPlatforms'] : [];
$show_labels = isset($attributes['showLabels']) ? $attributes['showLabels'] : false;
$icon_size = isset($attributes['iconSize']) ? $attributes['iconSize'] : '';

// Use current post author if no author specified
if (!$author_id) {
	$author_id = get_the_author_meta('ID');
}

if ( ! function_exists( 'get_yoast_author_socials' ) ):
// Get Yoast social profile data
function get_yoast_author_socials($author_id, $selected_platforms = []) {
	$socials = [];

	$collector = \YoastSEO()->classes->get( Additional_Contactmethods_Collector::class );
	foreach ($collector->get_additional_contactmethods() as $contactmethod) {
		$service = $contactmethod->get_key();
		$label = $contactmethod->get_label();

        // Skip if platform filtering is enabled and this platform isn't selected
		if (!empty($selected_platforms) && !in_array($service, $selected_platforms)) {
			continue;
		}

		$url = get_user_meta($author_id, $service, true);
		if (!empty($url)) {
			$socials[] = [
				'service' => $service,
				'url' => esc_url($url),
				'label' => $label
			];
		}
	}

	return $socials;
}
endif;

// Get social profiles
$socials = get_yoast_author_socials($author_id, $selected_platforms);

// Return empty if no social profiles found
if (empty($socials)) {
	return '';
}

// Build social-link inner blocks
$social_link_blocks = [];
foreach ($socials as $social) {
	$social_link_blocks[] = [
		'blockName' => 'core/social-link',
		'attrs' => [
			'service' => $social['service'],
			'url' => $social['url'],
			'label' => $social['label']
		],
		'innerBlocks' => [],
		'innerHTML' => '',
		'innerContent' => []
	];
}

// Build the social-links block
$social_links_block = [
	'blockName' => 'core/social-links',
	'attrs' => [
		'showLabels' => $show_labels,
		'size' => $icon_size
	],
	'innerBlocks' => $social_link_blocks,
	'innerHTML' => '',
	'innerContent' => [
		'<ul class="wp-block-social-links ' . $icon_size . '">',
		...array_fill(0, count($social_link_blocks), null),
		'</ul>',
    ],
];
//var_dump( $social_links_block );

echo (new WP_Block( $social_links_block))->render();
