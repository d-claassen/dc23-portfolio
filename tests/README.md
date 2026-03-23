# DC23 Portfolio Integration Tests

This directory contains PHPUnit integration tests for the DC23 Portfolio plugin, specifically testing the Schema.org/Yoast SEO integration.

## Setup

### Prerequisites

1. **WordPress Test Suite**: You need a WordPress development environment with the test suite installed.

### Option 1: Using WordPress Development Repository

1. Clone the WordPress development repository:
   ```bash
   git clone https://github.com/WordPress/wordpress-develop.git
   cd wordpress-develop
   ```

2. Set up the test environment:
   ```bash
   npm install
   npm run build:dev
   ```

3. Create a test database and configure `wp-tests-config.php`:
   ```bash
   cp wp-tests-config-sample.php wp-tests-config.php
   # Edit wp-tests-config.php with your test database credentials
   ```

4. Set the `WP_DEVELOP_DIR` environment variable:
   ```bash
   export WP_DEVELOP_DIR=/path/to/wordpress-develop
   ```

### Option 2: Using WP-CLI Scaffold

1. Install the WordPress test library using WP-CLI:
   ```bash
   cd /path/to/dc23-portfolio
   wp scaffold plugin-tests dc23-portfolio
   ```

2. Run the install script:
   ```bash
   bash bin/install-wp-tests.sh wordpress_test root '' localhost latest
   ```

### Option 3: Environment Variable in phpunit.xml

Create a `phpunit.xml` file (not tracked in git) with the test directory path:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
	bootstrap="tests/bootstrap.php">
	<php>
		<env name="WP_TESTS_DIR" value="/path/to/wordpress-develop/tests/phpunit"/>
		<!-- Or -->
		<env name="WP_DEVELOP_DIR" value="/path/to/wordpress-develop"/>
	</php>
</phpunit>
```

## Running Tests

Once the environment is set up:

```bash
# Run all tests
composer test

# Run tests with coverage (if configured)
./vendor/bin/phpunit

# Run specific test
./vendor/bin/phpunit --filter test_should_enhance_person_with_resume_data
```

## Test Structure

### Resume_Schema_IntegrationTest.php

Tests the `Resume` class Schema.org integration:

- **test_should_enhance_person_with_resume_data**: Verifies that Person schema is enhanced with work experience, education, and skills on ProfilePage
- **test_should_add_organizations_to_schema_graph**: Ensures Organization pieces are added to the schema graph
- **test_should_add_specialties_to_schema_graph**: Validates that Specialty pieces are added to the schema graph
- **test_should_make_person_main_entity_of_webpage**: Confirms Person becomes mainEntity of ProfilePage
- **test_should_not_enhance_schema_without_portfolio_user**: Tests that schema enhancement only occurs when a portfolio user is selected
- **test_should_generate_correct_schema_references**: Validates proper @id generation and cross-referencing

## Test Utilities

The test class provides helper methods:

- `get_yoast_schema_output()`: Captures and extracts JSON-LD schema from Yoast's `wpseo_head` output
- `get_piece_by_type($graph, $type)`: Finds a specific schema piece in the graph by its @type
- `create_portfolio_page_with_blocks()`: Creates a test page with portfolio blocks (experience, education, skills, organizations)

## Notes

- Tests extend `WP_UnitTestCase` from the WordPress test framework
- Tests use WordPress factory methods to create test data
- Process isolation is enabled to prevent test interference
- Execution order is randomized for better test independence
