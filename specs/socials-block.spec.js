const { test, expect } = require('@wordpress/e2e-test-utils-playwright');

test.describe('Author Socials block', () => {
  
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

    // Capture any console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    // Select the block
    await editor.canvas.locator('[data-type="dc23-portfolio/socials"]').click();
    
     // Log errors if controls aren't visible
    const labelsControl = page.locator('label:has-text("Show Labels")');
    if (!(await labelsControl.isVisible())) {
        console.log('Errors:', errors);
        throw new Error('Inspector controls not visible');
    }
    
    // @TODO. Check for author selection
    // await expect(page.locator('label:has-text("Author")')).toBeVisible();
    
    // @TODO. Check for platform filtering
    // await expect(page.locator('text=Social Platforms')).toBeVisible();
    
    // Check for display options
    await expect(labelsControl).toBeVisible();
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
  test.fixme('show labels toggle works', async ({ admin, editor, page }) => {
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });
    
    await editor.canvas.locator('[data-type="dc23-portfolio/socials"]').click();
    
    const labelsToggle = page.locator('input[type="checkbox"] + label:has-text("Show Labels")').locator('..');
    await labelsToggle.click();
    
    // Verify the social-links block receives the showLabels attribute
    const socialLinksBlock = editor.canvas.locator('[data-type="core/social-links"]');
    await expect(socialLinksBlock).toHaveAttribute('data-show-labels', 'true');
  });

  // Test 7: Icon Size Selection
  test.fixme('icon size dropdown changes size', async ({ admin, editor, page }) => {
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });
    
    await editor.canvas.locator('[data-type="dc23-portfolio/socials"]').click();
    
    const sizeSelect = page.locator('select[aria-label="Icon Size"], .components-select-control__input').last();
    await sizeSelect.selectOption('large');
    
    // Verify the social-links block receives the size attribute
    const socialLinksBlock = editor.canvas.locator('[data-type="core/social-links"]');
    await expect(socialLinksBlock).toHaveClass(/has-large-icon-size/);
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
  test.fixme('generates social links from yoast data', async ({ admin, editor, page }) => {
    // This test assumes author has Yoast social data
    await admin.createNewPost();
    await editor.insertBlock({ name: 'dc23-portfolio/socials' });
    
    // Mock or setup author with social profiles first
    // Then verify social-link blocks are generated
    const socialLinks = editor.canvas.locator('[data-type="core/social-link"]');
    await expect(socialLinks).toHaveCountGreaterThan(0);
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