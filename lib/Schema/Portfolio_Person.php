<?php

declare( strict_types=1 );

namespace DC23\Portfolio\Schema;

use Yoast\WP\SEO\Generators\Schema\Person;

/**
 * Portfolio Person schema generator.
 *
 * Extends Yoast's Person schema to generate Person pieces for portfolio users.
 * Only activates when a portfolio user is selected and it's different from the
 * site's represented person.
 */
final class Portfolio_Person extends Person {

	/**
	 * Determines whether this Person piece is needed.
	 *
	 * @return bool True if a portfolio Person should be generated.
	 */
	public function is_needed() {
		// Only on ProfilePage with portfolio user set
		if ( ! \is_singular( 'page' ) ) {
			return false;
		}

		$webpage_type = (array) ( $this->context->schema_page_type ?? [] );
		if ( ! \in_array( 'ProfilePage', $webpage_type, true ) ) {
			return false;
		}

		$portfolio_user_id = $this->get_portfolio_user_id();
		if ( ! $portfolio_user_id ) {
			return false;
		}

		// Don't create duplicate Person if portfolio user is the site's represented person
		if ( $this->context->site_represents === 'person' && $this->context->site_user_id === $portfolio_user_id ) {
			return false;
		}

		return true;
	}

	/**
	 * Determines the user ID for the Person schema.
	 *
	 * @return int|false The portfolio user ID, or false if not set.
	 */
	protected function determine_user_id() {
		$user_id = $this->get_portfolio_user_id();

		// Must be an integer greater than 0
		if ( \is_int( $user_id ) && $user_id > 0 ) {
			return $user_id;
		}

		return false;
	}

	/**
	 * Get the portfolio user ID from post meta.
	 *
	 * @return int|null The user ID if set, null otherwise.
	 */
	private function get_portfolio_user_id(): ?int {
		if ( ! \is_singular( 'page' ) ) {
			return null;
		}

		$user_id = \get_post_meta( \get_the_ID(), '_dc23_portfolio_user_id', true );

		return $user_id ? (int) $user_id : null;
	}
}
