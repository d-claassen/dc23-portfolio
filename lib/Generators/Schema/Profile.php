<?php

namespace DC23\Portfolio\Generators\Schema;

use \Yoast\WP\SEO\Generators\Schema\Abstract_Schema_Piece;

/**
 * Returns schema profile data.
 */
class Profile extends Abstract_Schema_Piece {

	/**
	 * Determines whether a piece should be added to the graph.
	 *
	 * @return bool
	 */
	public function is_needed() {
        if ( ! is_singular( 'page' ) ) {
            return false;
        }

        return false;
	}

	/**
	 * Generate a person of the profile.
	 *
	 * @return array<list<string, mixed>>
	 */
	public function generate() {
		$graph = [];

		$graph[] = $this->generate_profile();

		return $graph;
	}

	/**
	 * Generate a Person piece.
	 *
	 * @return array<sting, mixed>
	 */
        protected function generate_profile(): array {
                $data = [
                        '@type' => 'Person',
                ];

                return $data;
        }
}
