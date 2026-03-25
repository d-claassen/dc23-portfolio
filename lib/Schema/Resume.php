<?php

declare( strict_types=1 );

namespace DC23\Portfolio\Schema;

use Yoast\WP\SEO\Context\Meta_Tags_Context;

/**
 * Resume schema handler for portfolio pages.
 *
 * Enhances Person schema with resume data from portfolio blocks
 * (experience, education, skills) for pages with a selected user.
 */
final class Resume {

	/**
	 * Register WordPress hooks for schema enhancement.
	 */
	public function register(): void {
		\add_filter( 'wpseo_schema_person', [ $this, 'enhance_person_with_resume' ], 11, 2 );
		\add_filter( 'wpseo_schema_graph_pieces', [ $this, 'add_portfolio_person_and_related_pieces' ], 11, 2 );
	}

	/**
	 * Check if the current page has a portfolio user selected.
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

	/**
	 * Recursively flatten nested blocks into a single-level array.
	 *
	 * WordPress blocks can be nested inside container blocks (Group, Columns, etc.).
	 * This method recursively traverses the block tree and returns all blocks
	 * in a flat array, making it easier to find portfolio blocks at any nesting level.
	 *
	 * @param array<array<string, mixed>> $blocks Array of blocks from parse_blocks().
	 *
	 * @return array<array<string, mixed>> Flattened array of all blocks.
	 */
	private function flatten_blocks( array $blocks ): array {
		$flattened = [];

		foreach ( $blocks as $block ) {
			// Skip blocks without a name (usually whitespace/HTML comments).
			if ( empty( $block['blockName'] ) ) {
				continue;
			}

			// Add the current block to the flattened array.
			$flattened[] = $block;

			// Recursively process inner blocks if they exist.
			if ( ! empty( $block['innerBlocks'] ) && \is_array( $block['innerBlocks'] ) ) {
				$flattened = \array_merge( $flattened, $this->flatten_blocks( $block['innerBlocks'] ) );
			}
		}

		return $flattened;
	}

	/**
	 * Enhance a Schema.org Person piece with resume data from blocks.
	 *
	 * @param array<string, mixed> $person_data The Person data.
	 * @param Meta_Tags_Context    $context     The page context.
	 *
	 * @return array<string, mixed> Full person resume data.
	 */
	public function enhance_person_with_resume( $person_data, $context ) {
		\assert( $context instanceof Meta_Tags_Context );

		$user_id = $this->get_portfolio_user_id();

		if ( ! $user_id ) {
			return $person_data;
		}

		// Only enhance on ProfilePage.
		$webpage_type = (array) ( $context->schema_page_type ?? [] );
		if ( ! \in_array( 'ProfilePage', $webpage_type, true ) ) {
			return $person_data;
		}

		// Only enhance if this Person piece is for the portfolio user.
		// Use Yoast's ID_Helper to generate the expected @id for comparison.
		$expected_id = \YoastSEO()->helpers->schema->id->get_user_schema_id( $user_id, $context );
		if ( ! isset( $person_data['@id'] ) || $person_data['@id'] !== $expected_id ) {
			// This is a different Person piece - don't modify it.
			return $person_data;
		}

		// Add interaction statistics.
		$nr_of_posts = \count_user_posts( $user_id, 'post', true );
		if ( $nr_of_posts > 0 ) {
			$person_data['agentInteractionStatistic'] = [
				'@type'                => 'InteractionCounter',
				'interactionType'      => 'https://schema.org/WriteAction',
				'userInteractionCount' => $nr_of_posts,
			];
		}

		// Collect work experience from blocks.
		$work_experiences = $this->collect_work_experiences();
		if ( ! empty( $work_experiences ) ) {
			// Merge with existing worksFor if present (from Yoast).
			if ( isset( $person_data['worksFor'] ) ) {
				// If worksFor is a single item, convert to array.
				if ( isset( $person_data['worksFor']['@type'] ) ) {
					$person_data['worksFor'] = [ $person_data['worksFor'] ];
				}
				$person_data['worksFor'] = \array_merge( $person_data['worksFor'], $work_experiences );
			} else {
				$person_data['worksFor'] = $work_experiences;
			}
		}

		// Collect education from blocks.
		$education = $this->collect_education();
		if ( ! empty( $education ) ) {
			$person_data['alumniOf'] = $education;
		}

		// Collect skills/specialties from blocks.
		$specialties = $this->collect_specialties();
		if ( ! empty( $specialties ) ) {
			// Create references to specialty pieces.
			$person_data['knowsAbout'] = \array_map(
				static function ( $specialty ) {
					return [ '@id' => $specialty['@id'] ];
				},
				$specialties
			);
		}

		return $person_data;
	}

	/**
	 * Collect work experience data from experience blocks.
	 *
	 * @return array<array<string, mixed>> Array of EmployeeRole schema.
	 */
	private function collect_work_experiences(): array {
		$post = \get_post();
		if ( ! $post || ! $post->post_content ) {
			return [];
		}

		$blocks      = \parse_blocks( $post->post_content );
		$experiences = [];

		foreach ( $this->flatten_blocks( $blocks ) as $block ) {
			if ( $block['blockName'] === 'dc23-portfolio/experience' && ! empty( $block['attrs'] ) ) {
				$experiences[] = $this->build_employee_role( $block['attrs'] );
			}
		}

		return $experiences;
	}

	/**
	 * Build an EmployeeRole schema from block attributes.
	 *
	 * @param array<string, mixed> $attrs Block attributes.
	 *
	 * @return array<string, mixed> EmployeeRole schema.
	 */
	private function build_employee_role( $attrs ): array {
		$role = [
			'@type'    => 'http://schema.org/EmployeeRole',
			'roleName' => $attrs['roleName'] ?? '',
		];

		if ( ! empty( $attrs['roleId'] ) ) {
			$role['@id'] = $attrs['roleId'];
		}

		if ( ! empty( $attrs['organizationId'] ) ) {
			$role['worksFor'] = [ '@id' => $attrs['organizationId'] ];
		}

		if ( ! empty( $attrs['startDate'] ) ) {
			$role['startDate'] = $attrs['startDate'];
		}

		if ( ! empty( $attrs['endDate'] ) ) {
			$role['endDate'] = $attrs['endDate'];
		}

		return $role;
	}

	/**
	 * Collect education data from education blocks.
	 *
	 * @return array<array<string, mixed>> Array of Role schema.
	 */
	private function collect_education(): array {
		$post = \get_post();
		if ( ! $post || ! $post->post_content ) {
			return [];
		}

		$blocks    = \parse_blocks( $post->post_content );
		$education = [];

		foreach ( $this->flatten_blocks( $blocks ) as $block ) {
			if ( $block['blockName'] === 'dc23-portfolio/education' && ! empty( $block['attrs'] ) ) {
				$education[] = $this->build_education_role( $block['attrs'] );
			}
		}

		return $education;
	}

	/**
	 * Build a Role schema for education from block attributes.
	 *
	 * @param array<string, mixed> $attrs Block attributes.
	 *
	 * @return array<string, mixed> Role schema.
	 */
	private function build_education_role( $attrs ): array {
		$role = [
			'@type'    => 'http://schema.org/Role',
			'roleName' => $attrs['degree'] ?? $attrs['roleName'] ?? '',
		];

		if ( ! empty( $attrs['roleId'] ) ) {
			$role['@id'] = $attrs['roleId'];
		}

		if ( ! empty( $attrs['organizationId'] ) ) {
			$role['alumniOf'] = [ '@id' => $attrs['organizationId'] ];
		}

		if ( ! empty( $attrs['startDate'] ) ) {
			$role['startDate'] = $attrs['startDate'];
		}

		if ( ! empty( $attrs['endDate'] ) ) {
			$role['endDate'] = $attrs['endDate'];
		}

		return $role;
	}

	/**
	 * Collect specialty data from skill blocks.
	 *
	 * @return array<array<string, mixed>> Array of Specialty schema.
	 */
	private function collect_specialties(): array {
		$post = \get_post();
		if ( ! $post || ! $post->post_content ) {
			return [];
		}

		$blocks      = \parse_blocks( $post->post_content );
		$specialties = [];

		foreach ( $this->flatten_blocks( $blocks ) as $block ) {
			if ( $block['blockName'] === 'dc23-portfolio/skill' && ! empty( $block['attrs']['name'] ) ) {
				$specialty = [
					'@type' => 'http://schema.org/Specialty',
					'name'  => $block['attrs']['name'],
				];

				// Generate @id if not provided.
				if ( ! empty( $block['attrs']['specialtyId'] ) ) {
					$specialty['@id'] = $block['attrs']['specialtyId'];
				} else {
					$specialty['@id'] = \trailingslashit( \get_permalink() ) . '#/schema/Specialty/' . \sanitize_title( $block['attrs']['name'] );
				}

				if ( ! empty( $block['attrs']['description'] ) ) {
					$specialty['description'] = $block['attrs']['description'];
				}

				if ( ! empty( $block['attrs']['sameAs'] ) ) {
					$specialty['sameAs'] = $block['attrs']['sameAs'];
				}

				$specialties[] = $specialty;
			}
		}

		return $specialties;
	}

	/**
	 * Add Portfolio Person, Organizations, and Specialties to the schema graph.
	 *
	 * @param array<\Yoast\WP\SEO\Generators\Schema\Abstract_Schema_Piece> $pieces  Pieces in the graph.
	 * @param Meta_Tags_Context                                            $context The page context.
	 *
	 * @return array<\Yoast\WP\SEO\Generators\Schema\Abstract_Schema_Piece> Pieces for the graph.
	 */
	public function add_portfolio_person_and_related_pieces( $pieces, $context ) {
		\assert( $context instanceof Meta_Tags_Context );

		$user_id = $this->get_portfolio_user_id();

		if ( ! $user_id ) {
			return $pieces;
		}

		// Only add on ProfilePage.
		$webpage_type = (array) ( $context->schema_page_type ?? [] );
		if ( ! \in_array( 'ProfilePage', $webpage_type, true ) ) {
			return $pieces;
		}

		// Add Portfolio Person piece (extends Yoast's Person generator).
		$portfolio_person = new Portfolio_Person();
		$portfolio_person->context = $context;
		$portfolio_person->helpers = \YoastSEO()->helpers;
		$pieces[] = $portfolio_person;

		// Collect organizations.
		$organizations = $this->collect_organizations();
		foreach ( $organizations as $org ) {
			$pieces[] = new Piece( $org, $org['@id'] );
		}

		// Collect specialties.
		$specialties = $this->collect_specialties();
		foreach ( $specialties as $specialty ) {
			$pieces[] = new Piece( $specialty, $specialty['@id'] );
		}

		return $pieces;
	}

	/**
	 * Collect organization data from organization blocks.
	 *
	 * @return array<array<string, mixed>> Array of Organization schema.
	 */
	private function collect_organizations(): array {
		$post = \get_post();
		if ( ! $post || ! $post->post_content ) {
			return [];
		}

		$blocks        = \parse_blocks( $post->post_content );
		$organizations = [];

		foreach ( $this->flatten_blocks( $blocks ) as $block ) {
			if ( $block['blockName'] === 'dc23-portfolio/organization' && ! empty( $block['attrs'] ) ) {
				$organizations[] = $this->build_organization( $block['attrs'] );
			}
		}

		return $organizations;
	}

	/**
	 * Build an Organization schema from block attributes.
	 *
	 * @param array<string, mixed> $attrs Block attributes.
	 *
	 * @return array<string, mixed> Organization schema.
	 */
	private function build_organization( $attrs ): array {
		$org = [
			'@type' => 'https://schema.org/' . ( $attrs['type'] ?? 'Organization' ),
			'name'  => $attrs['name'] ?? '',
		];

		if ( ! empty( $attrs['organizationId'] ) ) {
			$org['@id'] = $attrs['organizationId'];
		}

		if ( ! empty( $attrs['url'] ) ) {
			$org['mainEntityOfPage'] = $attrs['url'];
		}

		if ( ! empty( $attrs['sameAs'] ) && \is_array( $attrs['sameAs'] ) ) {
			$org['sameAs'] = $attrs['sameAs'];
		}

		// Handle parent organization relationship.
		if ( ! empty( $attrs['parentOrganizationId'] ) ) {
			$parent_role = [
				'@type'              => 'http://schema.org/OrganizationRole',
				'parentOrganization' => [ '@id' => $attrs['parentOrganizationId'] ],
			];

			if ( ! empty( $attrs['parentStartDate'] ) ) {
				$parent_role['startDate'] = $attrs['parentStartDate'];
			}

			$org['parentOrganization'] = $parent_role;
		}

		return $org;
	}
}
