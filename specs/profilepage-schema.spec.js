/**
 * WordPress dependencies
 */
const { test, expect } = require('@wordpress/e2e-test-utils-playwright');

test.describe('ProfilePage Schema', () => {
	let testUserId;
	
	test.beforeAll(async ({ requestUtils }) => {
		// Create a test user for selection
		const user = await requestUtils.rest({
			method: 'POST',
			path: '/wp/v2/users',
			data: {
				username: 'testprofileuser',
				email: 'testprofile@example.com',
				password: 'TestPassword123!',
				name: 'Test Profile User',
				roles: ['author'],
			},
		});
		testUserId = user.id;
	});

	test.afterAll(async ({ requestUtils }) => {
		// Clean up test user
		if (testUserId) {
			await requestUtils.rest({
				method: 'DELETE',
				path: `/wp/v2/users/${testUserId}`,
				data: { force: true, reassign: 1 },
			});
		}
	});

	test.beforeEach(async ({ admin }) => {
		await admin.createNewPost({ postType: 'page' });
	});

	test('ProfilePage Schema section does not appear by default', async ({ page, editor }) => {
		// Open the Yoast SEO sidebar (if not already open)
		const yoastButton = page.locator('button[aria-label*="Yoast"]').first();
		if (await yoastButton.isVisible()) {
			await yoastButton.click();
		}

		// Check that ProfilePage Schema section is not visible
		await expect(page.locator('text=ProfilePage Schema')).not.toBeVisible({ timeout: 2000 });
	});

	test('ProfilePage Schema section appears when page type is ProfilePage', async ({ page }) => {
		// Open Yoast SEO settings
		const settingsButton = page.locator('button[aria-label*="Settings"]').first();
		if (await settingsButton.isVisible()) {
			await settingsButton.click();
		}

		// Navigate to Schema tab
		const schemaTab = page.locator('button:has-text("Schema")').first();
		await schemaTab.click();

		// Change page type to ProfilePage
		const pageTypeSelect = page.locator('select[name*="pageType"], select[name*="articleType"]').first();
		await pageTypeSelect.selectOption('ProfilePage');

		// Wait for ProfilePage Schema section to appear
		await expect(page.locator('text=ProfilePage Schema')).toBeVisible({ timeout: 5000 });
	});

	test('can search for users', async ({ page }) => {
		// Set page type to ProfilePage
		const settingsButton = page.locator('button[aria-label*="Settings"]').first();
		if (await settingsButton.isVisible()) {
			await settingsButton.click();
		}
		
		const schemaTab = page.locator('button:has-text("Schema")').first();
		await schemaTab.click();
		
		const pageTypeSelect = page.locator('select[name*="pageType"], select[name*="articleType"]').first();
		await pageTypeSelect.selectOption('ProfilePage');

		// Wait for ProfilePage Schema section
		await expect(page.locator('text=ProfilePage Schema')).toBeVisible();

		// Find the search input
		const searchInput = page.locator('input[placeholder*="Search for a user"]').first();
		await searchInput.click();
		await searchInput.fill('Test Profile');

		// Wait for search results
		await page.waitForTimeout(1000); // Wait for API call

		// Check that search results appear
		const searchResults = page.locator('.dc23-user-search-results');
		await expect(searchResults).toBeVisible({ timeout: 3000 });
		
		// Check that our test user appears in results
		await expect(page.locator('text=Test Profile User')).toBeVisible();
	});

	test('can select a user and save to post meta', async ({ page, editor }) => {
		// Set page type to ProfilePage
		const settingsButton = page.locator('button[aria-label*="Settings"]').first();
		if (await settingsButton.isVisible()) {
			await settingsButton.click();
		}
		
		const schemaTab = page.locator('button:has-text("Schema")').first();
		await schemaTab.click();
		
		const pageTypeSelect = page.locator('select[name*="pageType"], select[name*="articleType"]').first();
		await pageTypeSelect.selectOption('ProfilePage');

		// Search for user
		const searchInput = page.locator('input[placeholder*="Search for a user"]').first();
		await searchInput.fill('Test Profile');
		await page.waitForTimeout(1000);

		// Select the user
		const userButton = page.locator('button.dc23-user-select-button:has-text("Test Profile User")').first();
		await userButton.click();

		// Wait for user profile to load
		await expect(page.locator('text=Selected Profile')).toBeVisible({ timeout: 3000 });
		await expect(page.locator('text=Test Profile User')).toBeVisible();

		// Save the post
		await editor.publishPost();

		// Verify the meta was saved by reloading and checking
		await page.reload();
		
		// Wait for editor to load
		await page.waitForLoadState('domcontentloaded');
		
		// Open Yoast SEO and Schema tab again
		const settingsButtonReload = page.locator('button[aria-label*="Settings"]').first();
		if (await settingsButtonReload.isVisible()) {
			await settingsButtonReload.click();
		}
		
		const schemaTabReload = page.locator('button:has-text("Schema")').first();
		await schemaTabReload.click();

		// Check that the selected user is still shown
		await expect(page.locator('text=Selected Profile')).toBeVisible({ timeout: 5000 });
		await expect(page.locator('.dc23-user-profile:has-text("Test Profile User")')).toBeVisible();
	});

	test('displays user profile information', async ({ page }) => {
		// Set page type to ProfilePage
		const settingsButton = page.locator('button[aria-label*="Settings"]').first();
		if (await settingsButton.isVisible()) {
			await settingsButton.click();
		}
		
		const schemaTab = page.locator('button:has-text("Schema")').first();
		await schemaTab.click();
		
		const pageTypeSelect = page.locator('select[name*="pageType"], select[name*="articleType"]').first();
		await pageTypeSelect.selectOption('ProfilePage');

		// Search and select user
		const searchInput = page.locator('input[placeholder*="Search for a user"]').first();
		await searchInput.fill('Test Profile');
		await page.waitForTimeout(1000);

		const userButton = page.locator('button.dc23-user-select-button:has-text("Test Profile User")').first();
		await userButton.click();

		// Check that user info is displayed
		const userProfile = page.locator('.dc23-user-profile');
		await expect(userProfile).toBeVisible();
		
		// Check for name
		await expect(userProfile.locator('text=Name:')).toBeVisible();
		await expect(userProfile).toContainText('Test Profile User');
	});

	test('clears search results after user selection', async ({ page }) => {
		// Set page type to ProfilePage
		const settingsButton = page.locator('button[aria-label*="Settings"]').first();
		if (await settingsButton.isVisible()) {
			await settingsButton.click();
		}
		
		const schemaTab = page.locator('button:has-text("Schema")').first();
		await schemaTab.click();
		
		const pageTypeSelect = page.locator('select[name*="pageType"], select[name*="articleType"]').first();
		await pageTypeSelect.selectOption('ProfilePage');

		// Search for user
		const searchInput = page.locator('input[placeholder*="Search for a user"]').first();
		await searchInput.fill('Test Profile');
		await page.waitForTimeout(1000);

		// Verify search results are visible
		await expect(page.locator('.dc23-user-search-results')).toBeVisible();

		// Select the user
		const userButton = page.locator('button.dc23-user-select-button:has-text("Test Profile User")').first();
		await userButton.click();

		// Wait a moment for state update
		await page.waitForTimeout(500);

		// Verify search results are cleared
		await expect(page.locator('.dc23-user-search-results')).not.toBeVisible({ timeout: 2000 });
	});

	test('only shows for pages, not posts', async ({ admin, page }) => {
		// Create a regular post instead of a page
		await admin.createNewPost({ postType: 'post' });

		// Open Yoast SEO if available
		const settingsButton = page.locator('button[aria-label*="Settings"]').first();
		if (await settingsButton.isVisible()) {
			await settingsButton.click();
		}
		
		const schemaTab = page.locator('button:has-text("Schema")').first();
		if (await schemaTab.isVisible()) {
			await schemaTab.click();
		
			// Try to set article type to ProfilePage (if the option even exists for posts)
			const pageTypeSelect = page.locator('select[name*="pageType"], select[name*="articleType"]').first();
			if (await pageTypeSelect.isVisible()) {
				const hasProfilePage = await pageTypeSelect.locator('option[value="ProfilePage"]').count();
				
				if (hasProfilePage > 0) {
					await pageTypeSelect.selectOption('ProfilePage');
					
					// ProfilePage Schema section should still not appear for posts
					await expect(page.locator('text=ProfilePage Schema')).not.toBeVisible({ timeout: 2000 });
				}
			}
		}
	});
});
