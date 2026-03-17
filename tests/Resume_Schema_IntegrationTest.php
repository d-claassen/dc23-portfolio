<?php

namespace DC23\Tests\Portfolio;

/**
 * Class Resume_Schema_IntegrationTest.
 *
 * @testdox Resume Schema for ProfilePage
 */
class Resume_Schema_IntegrationTest extends \WP_UnitTestCase {

	private $user_id;

	public function setUp(): void {
		parent::setUp();

		// Create test user for portfolio
		$this->user_id = self::factory()->user->create( [
			'display_name' => 'Test User',
			'user_email'   => 'test@example.com',
			'user_url'     => 'https://example.com',
		] );

		// Set Yoast user settings to use person schema
		\YoastSEO()->helpers->options->set( 'company_or_person', 'person' );
		\YoastSEO()->helpers->options->set( 'company_or_person_user_id', $this->user_id );
	}

	// Override WordPress function that's incompatible with PHPUnit 10+.
	public function expectDeprecated() {
	}

	/**
	 * Test that Person schema is enhanced with resume data on ProfilePage.
	 */
	public function test_should_enhance_person_with_resume_data(): void {
		$page_id = $this->create_portfolio_page_with_blocks();

		$this->go_to( \get_permalink( $page_id ) );

		// Set page type to ProfilePage (simulating what Yoast does)
		add_filter( 'wpseo_schema_webpage_type', function() {
			return [ 'ProfilePage', 'WebPage' ];
		} );

		$yoast_schema = $this->get_yoast_schema_output();
		$this->assertJson( $yoast_schema, 'Yoast schema should be valid JSON' );
		$yoast_schema_data = \json_decode( $yoast_schema, JSON_OBJECT_AS_ARRAY );

		$person_piece = $this->get_piece_by_type( $yoast_schema_data['@graph'], 'Person' );

		// Test that Person has work experience
		$this->assertArrayHasKey( 'worksFor', $person_piece, 'Person should have worksFor property' );
		$this->assertIsArray( $person_piece['worksFor'], 'worksFor should be an array' );
		$this->assertCount( 1, $person_piece['worksFor'], 'Should have 1 work experience' );
		$this->assertSame( 'http://schema.org/EmployeeRole', $person_piece['worksFor'][0]['@type'] );
		$this->assertSame( 'Senior Developer', $person_piece['worksFor'][0]['roleName'] );

		// Test that Person has education
		$this->assertArrayHasKey( 'alumniOf', $person_piece, 'Person should have alumniOf property' );
		$this->assertIsArray( $person_piece['alumniOf'], 'alumniOf should be an array' );
		$this->assertCount( 1, $person_piece['alumniOf'], 'Should have 1 education entry' );
		$this->assertSame( 'http://schema.org/Role', $person_piece['alumniOf'][0]['@type'] );
		$this->assertSame( 'Computer Science', $person_piece['alumniOf'][0]['roleName'] );

		// Test that Person has skills
		$this->assertArrayHasKey( 'knowsAbout', $person_piece, 'Person should have knowsAbout property' );
		$this->assertIsArray( $person_piece['knowsAbout'], 'knowsAbout should be an array' );
		$this->assertCount( 2, $person_piece['knowsAbout'], 'Should have 2 skills' );
	}

	/**
	 * Test that Organizations are added to the schema graph.
	 */
	public function test_should_add_organizations_to_schema_graph(): void {
		$page_id = $this->create_portfolio_page_with_blocks();

		$this->go_to( \get_permalink( $page_id ) );

		add_filter( 'wpseo_schema_webpage_type', function() {
			return [ 'ProfilePage', 'WebPage' ];
		} );

		$yoast_schema = $this->get_yoast_schema_output();
		$yoast_schema_data = \json_decode( $yoast_schema, JSON_OBJECT_AS_ARRAY );

		// Find the Test Company organization specifically
		$test_company = $this->get_piece_by_name( $yoast_schema_data['@graph'], 'Test Company' );

		$this->assertNotNull( $test_company, 'Test Company organization should be in schema graph' );
		$this->assertSame( 'https://schema.org/Organization', $test_company['@type'] );
		$this->assertSame( 'Test Company', $test_company['name'] );
		$this->assertStringContainsString( '#/schema/organization/', $test_company['@id'] );
	}

	/**
	 * Test that Specialties are added to the schema graph.
	 */
	public function test_should_add_specialties_to_schema_graph(): void {
		$page_id = $this->create_portfolio_page_with_blocks();

		$this->go_to( \get_permalink( $page_id ) );

		add_filter( 'wpseo_schema_webpage_type', function() {
			return [ 'ProfilePage', 'WebPage' ];
		} );

		$yoast_schema = $this->get_yoast_schema_output();
		$yoast_schema_data = \json_decode( $yoast_schema, JSON_OBJECT_AS_ARRAY );

		// Find specialty pieces
		$specialties = array_filter( $yoast_schema_data['@graph'], function( $piece ) {
			return isset( $piece['@type'] ) && $piece['@type'] === 'http://schema.org/Specialty';
		} );

		$this->assertCount( 2, $specialties, 'Should have 2 specialty pieces in graph' );

		$specialty_names = array_column( $specialties, 'name' );
		$this->assertContains( 'PHP', $specialty_names );
		$this->assertContains( 'JavaScript', $specialty_names );
	}

	/**
	 * Test that Person becomes mainEntity of ProfilePage.
	 */
	public function test_should_make_person_main_entity_of_webpage(): void {
		$page_id = $this->create_portfolio_page_with_blocks();

		$this->go_to( \get_permalink( $page_id ) );

		add_filter( 'wpseo_schema_webpage_type', function() {
			return [ 'ProfilePage', 'WebPage' ];
		} );

		$yoast_schema = $this->get_yoast_schema_output();
		$yoast_schema_data = \json_decode( $yoast_schema, JSON_OBJECT_AS_ARRAY );

		$webpage_piece = $this->get_piece_by_type( $yoast_schema_data['@graph'], [ 'ProfilePage', 'WebPage' ] );
		$person_piece = $this->get_piece_by_type( $yoast_schema_data['@graph'], 'Person' );

		$this->assertArrayHasKey( 'mainEntity', $webpage_piece, 'WebPage should have mainEntity' );
		$this->assertArrayHasKey( 'about', $webpage_piece, 'WebPage should have about' );
		$this->assertSame( $person_piece['@id'], $webpage_piece['mainEntity']['@id'], 'mainEntity should reference Person' );
		$this->assertSame( $person_piece['@id'], $webpage_piece['about']['@id'], 'about should reference Person' );
	}

	/**
	 * Test that schema enhancement only happens when a portfolio user is selected.
	 */
	public function test_should_not_enhance_schema_without_portfolio_user(): void {
		// Create page without portfolio user selected
		$page_id = self::factory()->post->create( [
			'post_type'   => 'page',
			'post_title'  => 'Regular Page',
			'post_status' => 'publish',
		] );

		$this->go_to( \get_permalink( $page_id ) );

		add_filter( 'wpseo_schema_webpage_type', function() {
			return [ 'ProfilePage', 'WebPage' ];
		} );

		$yoast_schema = $this->get_yoast_schema_output();
		$yoast_schema_data = \json_decode( $yoast_schema, JSON_OBJECT_AS_ARRAY );

		$webpage_piece = $this->get_piece_by_type( $yoast_schema_data['@graph'], [ 'ProfilePage', 'WebPage' ] );

		$this->assertArrayNotHasKey( 'mainEntity', $webpage_piece, 'WebPage should not have mainEntity without portfolio user' );
		$this->assertArrayNotHasKey( 'about', $webpage_piece, 'WebPage should not have about without portfolio user' );
	}

	/**
	 * Test that schema references are correctly generated and linked.
	 */
	public function test_should_generate_correct_schema_references(): void {
		$page_id = $this->create_portfolio_page_with_blocks();

		$this->go_to( \get_permalink( $page_id ) );

		add_filter( 'wpseo_schema_webpage_type', function() {
			return [ 'ProfilePage', 'WebPage' ];
		} );

		$yoast_schema = $this->get_yoast_schema_output();
		$yoast_schema_data = \json_decode( $yoast_schema, JSON_OBJECT_AS_ARRAY );

		$person_piece = $this->get_piece_by_type( $yoast_schema_data['@graph'], 'Person' );

		// Check that Person @id includes the user ID
		$this->assertStringContainsString( \YoastSEO()->helpers->schema->id->get_user_schema_id( $thid->user_id, null ), $person_piece['@id'] );

		// Check that knowsAbout contains references (not embedded objects)
		if ( isset( $person_piece['knowsAbout'] ) ) {
			foreach ( $person_piece['knowsAbout'] as $skill_ref ) {
				$this->assertArrayHasKey( '@id', $skill_ref, 'Skills should be referenced by @id' );
				$this->assertStringContainsString( '#/schema/Specialty/', $skill_ref['@id'] );
			}
		}

		// Check that worksFor contains organization references
		if ( isset( $person_piece['worksFor'] ) ) {
			foreach ( $person_piece['worksFor'] as $work ) {
				if ( isset( $work['worksFor'] ) ) {
					$this->assertArrayHasKey( '@id', $work['worksFor'], 'Organization should be referenced by @id' );
				}
			}
		}
	}

	/**
	 * Create a test portfolio page with all types of blocks.
	 *
	 * @return int Page ID.
	 */
	private function create_portfolio_page_with_blocks(): int {
		$org_id = \trailingslashit( home_url() ) . '#/schema/organization/test-company';

		$blocks = [
			// Experience block
			[
				'blockName'    => 'dc23-portfolio/experience',
				'attrs'        => [
					'roleName'       => 'Senior Developer',
					'organizationId' => $org_id,
					'startDate'      => '2020-01-01',
					'endDate'        => '2023-12-31',
				],
				'innerBlocks'  => [],
				'innerHTML'    => '',
				'innerContent' => [],
			],
			// Education block
			[
				'blockName'    => 'dc23-portfolio/education',
				'attrs'        => [
					'degree'         => 'Computer Science',
					'organizationId' => $org_id,
					'startDate'      => '2015-09-01',
					'endDate'        => '2019-06-30',
				],
				'innerBlocks'  => [],
				'innerHTML'    => '',
				'innerContent' => [],
			],
			// Skill blocks
			[
				'blockName'    => 'dc23-portfolio/skill',
				'attrs'        => [
					'name'        => 'PHP',
					'description' => 'Expert in PHP development',
				],
				'innerBlocks'  => [],
				'innerHTML'    => '',
				'innerContent' => [],
			],
			[
				'blockName'    => 'dc23-portfolio/skill',
				'attrs'        => [
					'name'        => 'JavaScript',
					'description' => 'Advanced JavaScript skills',
				],
				'innerBlocks'  => [],
				'innerHTML'    => '',
				'innerContent' => [],
			],
			// Organization block
			[
				'blockName'    => 'dc23-portfolio/organization',
				'attrs'        => [
					'organizationId' => $org_id,
					'name'           => 'Test Company',
					'type'           => 'Organization',
					'url'            => 'https://testcompany.com',
				],
				'innerBlocks'  => [],
				'innerHTML'    => '',
				'innerContent' => [],
			],
		];

		$post_content = '';
		foreach ( $blocks as $block ) {
			$post_content .= serialize_block( $block );
		}

		$page_id = self::factory()->post->create( [
			'post_type'    => 'page',
			'post_title'   => 'Portfolio',
			'post_content' => $post_content,
			'post_status'  => 'publish',
		] );

		// Set the portfolio user ID
		\update_post_meta( $page_id, '_dc23_portfolio_user_id', $this->user_id );

		// Update object to persist meta value to indexable
		self::factory()->post->update_object( $page_id, [] );

		return $page_id;
	}

	/**
	 * Get Yoast schema output from wpseo_head action.
	 *
	 * @param bool $debug Whether to print debug output.
	 * @return string JSON-LD schema string.
	 */
	private function get_yoast_schema_output( bool $debug = false ): string {
		return $this->get_schema_output( 'wpseo_head', $debug );
	}

	/**
	 * Get schema output from an action.
	 *
	 * @param string $action              Action name to capture.
	 * @param bool   $debug_wpseo_head Whether to print debug output.
	 * @return string JSON-LD schema string.
	 */
	private function get_schema_output( string $action, bool $debug_wpseo_head = false ): string {
		ob_start();
		do_action( $action );
		$wpseo_head = ob_get_contents();
		ob_end_clean();

		if ( $debug_wpseo_head ) {
			print $wpseo_head;
		}

		$dom = new \DOMDocument();
		@$dom->loadHTML( $wpseo_head );
		$scripts = $dom->getElementsByTagName( 'script' );
		foreach ( $scripts as $script ) {
			if ( $script instanceof \DOMElement && $script->getAttribute( 'type' ) === 'application/ld+json' ) {
				return $script->textContent;
			}
		}

		throw new \LengthException( 'No schema script was found in the wpseo_head output.' );
	}

	/**
	 * Find a Schema.org piece in the root of the Graph by its type.
	 *
	 * @param array<int, array{"@type": string|array<string>}> $graph Schema.org graph.
	 * @param string|array<int, string>                        $type  Schema type to search for.
	 *
	 * @return array{"@type": string|array<string>} The matching schema.org piece.
	 */
	private function get_piece_by_type( $graph, $type ): array {
		$nodes_of_type = array_filter( $graph, fn( $piece ) => ! empty( array_intersect( (array) $piece['@type'], (array) $type ) ) );

		if ( empty( $nodes_of_type ) ) {
			throw new \InvalidArgumentException( 'No piece found for type: ' . print_r( $type, true ) );
		}

		// Return first instance.
		return reset( $nodes_of_type );
	}

	/**
	 * Find a Schema.org piece in the root of the Graph by its name.
	 *
	 * @param array<int, array{"name"?: string}> $graph Schema.org graph.
	 * @param string                             $name  Name to search for.
	 *
	 * @return array{"name": string}|null The matching schema.org piece or null if not found.
	 */
	private function get_piece_by_name( $graph, $name ): ?array {
		$nodes_with_name = array_filter( $graph, fn( $piece ) => isset( $piece['name'] ) && $piece['name'] === $name );

		if ( empty( $nodes_with_name ) ) {
			return null;
		}

		// Return first instance.
		return reset( $nodes_with_name );
	}
}
