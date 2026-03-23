<?php

declare( strict_types=1 );

namespace DC23\Portfolio\Schema;

use Yoast\WP\SEO\Generators\Schema\Abstract_Schema_Piece;

/**
 * Generic Schema.org piece to wrap any kind of data.
 *
 * @template T of array
 */
class Piece extends Abstract_Schema_Piece {

	/**
	 * Constructor.
	 *
	 * @param T           $output     The Schema.org output.
	 * @param string|null $identifier The piece identifier to detect potential duplicates.
	 */
	public function __construct(
		private array $output,
		?string $identifier = null
	) {
		if ( $identifier !== null ) {
			$this->identifier = $identifier;
		}
	}

	/**
	 * Determines whether this piece should be added to the graph.
	 *
	 * @return bool True when this piece should be added.
	 */
	public function is_needed(): bool {
		return true;
	}

	/**
	 * Return the Schema.org output.
	 *
	 * @return T The schema output.
	 */
	public function generate(): array {
		return $this->output;
	}
}
