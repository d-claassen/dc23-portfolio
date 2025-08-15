const { test, expect } = require('@wordpress/e2e-test-utils-playwright');

test.describe('Author Socials block', () => {
  let consoleLogs = [];

  test.beforeEach(async ({ page }) => {
    consoleLogs = [];
    page.on('console', msg => consoleLogs.push(msg.text()));
  });

  test.afterEach(async ({ page }) => {
    if (consoleLogs.length > 0) {
      console.log('Page logs:', consoleLogs);
    }
    page.removeAllListeners('console');
  });

  // Test 1: Block Registration & Availability
  test('block appears in inserter', async ({ admin, editor }) => {
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });

    await expect(editor.canvas.locator('body')).not.toContainText('This block has encountered an error');

    const block = editor.canvas.locator('[data-type="dc23-portfolio/socials"]');
    await expect(block).toBeVisible();
  });

  // Test 2: Basic Block Structure
  test('block contains social-links inner block', async ({ admin, editor }) => {
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });

    await expect(editor.canvas.locator('body')).not.toContainText('This block has encountered an error');

    const socialLinksBlock = editor.canvas.locator('[data-type="core/social-links"]');
    await expect(socialLinksBlock).toBeVisible();
  });

  // Test 3: Inspector Controls Exist
  test('shows inspector controls', async ({ admin, editor, page }) => {
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });

    // Select the block
    await editor.canvas.locator('[data-type="dc23-portfolio/socials"]').click();
    
    // @TODO. Check for author selection
    // await expect(page.locator('label:has-text("Author")')).toBeVisible();
    
    // Check for platform filtering
    await expect(page.getByText('Social Platforms')).toBeVisible();
    
    // Check for display options
    await expect(page.locator('label:has-text("Show Labels")')).toBeVisible();
    await expect(page.locator('label:has-text("Icon Size")')).toBeVisible();
  });

  // Test 4: Author Selection Functionality
  test.fixme('author dropdown contains authors', async ({ admin, editor, page }) => {
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });
    
    await editor.canvas.locator('[data-type="dc23-portfolio/socials"]').click();
    
    const authorSelect = page.locator('select[aria-label="Author"], .components-select-control__input');
    await expect(authorSelect).toBeVisible();
    
    // Should have at least "Current Post Author" option
    const options = authorSelect.locator('option');
    await expect(options).toHaveCountGreaterThan(0);
  });

  // Test 5: Platform Filtering Controls
  test.fixme('shows platform checkboxes', async ({ admin, editor, page }) => {
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });
    
    await editor.canvas.locator('[data-type="dc23-portfolio/socials"]').click();
    
    // Common platforms should have checkboxes
    await expect(page.locator('input[type="checkbox"] + label:has-text("Facebook")')).toBeVisible();
    await expect(page.locator('input[type="checkbox"] + label:has-text("Twitter")')).toBeVisible();
    await expect(page.locator('input[type="checkbox"] + label:has-text("LinkedIn")')).toBeVisible();
  });

  // Test 6: Display Options Toggle
  test('show labels toggle works', async ({ admin, editor, page }) => {
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });
    
    await editor.canvas.locator('[data-type="dc23-portfolio/socials"]').click();
    
    const labelsToggle = page.getByText('Show Labels');
    await labelsToggle.click();
    
    // Verify the social-links block receives the showLabels attribute
    const socialLinksBlock = editor.canvas.locator('[data-type="core/social-links"]');
    await expect(socialLinksBlock).toHaveClass(/has-visible-labels/);
  });

  // Test 7: Icon Size Selection
  test('icon size dropdown changes size', async ({ admin, editor, page }) => {
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });
    
    await editor.canvas.locator('[data-type="dc23-portfolio/socials"]').click();
    
    const sizeSelect = page.getByLabel('Icon Size');
    await sizeSelect.selectOption('large');
    
    // Verify the social-links block receives the size attribute
    const socialLinksBlock = editor.canvas.locator('[data-type="core/social-links"]');
    await expect(socialLinksBlock).toHaveClass(/large/);
  });

  // Test 8: Empty State Handling
  test.fixme('shows message when author has no social profiles', async ({ admin, editor }) => {
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });
    
    // Should show empty state or placeholder
    const emptyMessage = editor.canvas.locator('text=No social profiles found');
    await expect(emptyMessage).toBeVisible();
  });

  // Test 9: Social Links Generation (with mock data)
  test('generates social links from yoast data', async ({ admin, editor, page }) => {
    // setup author with social profiles first
    await admin.visitAdminPage('profile.php');
    await page.getByLabel('Facebook profile URL').fill('https://www.facebook.com/authorprofile');
    await page.getByLabel('Instagram profile URL').fill('https://instagram.com/authorprofile');
    await page.getByLabel('LinkedIn profile URL').fill('https://linkedin.com/authorprofile');
    await page.getByLabel('MySpace profile URL').fill('https://myspace.com/authorprofile');
    await page.getByLabel('Pinterest profile URL').fill('https://pinterest.com/authorprofile');
    await page.getByLabel('SoundCloud profile URL').fill('https://soundcloud.com/authorprofile');
    await page.getByLabel('Tumblr profile URL').fill('https://tumblr.com/authorprofile');
    await page.getByLabel('Wikipedia page').fill('https://wikipedia.org/w/authorprofile');
    await page.getByLabel('X username').fill('https://twitter.com/authorprofile');
    await page.getByLabel('YouTube profile URL').fill('https://youtube.com/authorprofile');
    await page.getByRole('button', { name: 'Update Profile' }).click();
    
    // This test assumes author has Yoast social data
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });

    const platformSelector = page.getByLabel('Social Platforms');
    await platformSelector.pressSequentially('facebook instagram myspace pinterest soundcloud tumblr youtube ');
    await platformSelector.press('Tab');
    
    // Then verify social-link blocks are generated
    const socialLinks = editor.canvas.locator('[data-type="core/social-link"]');
    expect(await socialLinks.count()).toBe(8);
  });

  // Test 10: Frontend Rendering
  test.fixme('renders correctly on frontend', async ({ admin, editor, page }) => {
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });
    
    // Publish post
    await editor.publishPost();
    
    // Visit frontend
    const postUrl = await editor.getPermalink();
    await page.goto(postUrl);
    
    // Verify social links render
    const socialLinksContainer = page.locator('.wp-block-social-links');
    await expect(socialLinksContainer).toBeVisible();
  });

  // Test 11: Platform Filtering Works
  test.fixme('unchecking platform removes social link', async ({ admin, editor, page }) => {
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });
    
    await editor.canvas.locator('[data-type="dc23-portfolio/socials"]').click();
    
    // Uncheck Facebook
    const facebookCheckbox = page.locator('input[type="checkbox"] + label:has-text("Facebook")').locator('..');
    await facebookCheckbox.uncheck();
    
    // Verify Facebook social-link is not present
    const facebookLink = editor.canvas.locator('[data-type="core/social-link"][data-service="facebook"]');
    await expect(facebookLink).not.toBeVisible();
  });

  // Test 12: Block Saves and Loads Correctly
  test.fixme('block attributes persist after save/reload', async ({ admin, editor, page }) => {
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });
    
    await editor.canvas.locator('[data-type="dc23-portfolio/socials"]').click();
    
    // Change settings
    await page.locator('input[type="checkbox"] + label:has-text("Show Labels")').click();
    
    // Save and reload
    await editor.saveDraft();
    await page.reload();
    
    // Verify settings persisted
    await editor.canvas.locator('[data-type="dc23-portfolio/socials"]').click();
    const labelsToggle = page.locator('input[type="checkbox"] + label:has-text("Show Labels")');
    await expect(labelsToggle).toBeChecked();
  });

});