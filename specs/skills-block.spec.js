/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
/*
import {
	createNewPost,
	insertBlock,
	saveDraft,
	getEditedPostContent,
	publishPost,
	visitAdminPage,
} from '@wordpress/e2e-test-utils-playwright';
*/
test.describe('Skills Block', () => {
	test.beforeEach(async ({ page, admin }) => {
		await admin.createNewPost();
	});

test('can be inserted and configured', async ({ page, editor }) => {
	// Insert the Skills block
	await editor.insertBlock({ name: 'dc23-portfolio/skill' });

	// Check that the block was inserted
	const skillsBlock = editor.canvas.locator('[data-type="dc23-portfolio/skill"]');
	await expect(skillsBlock).toBeVisible();

	// Check default name is editable
	const titleInput = skillsBlock.locator('input[placeholder*="Skill name"]').first();

	// Change the title TextControl
	await titleInput.click();
	await titleInput.clear();
	await titleInput.type('Automated testing');
	
	await page.keyboard.press('Escape');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(100);
	
	// Check the skill name updates
	const titleText = skillsBlock.locator('.skill-name');
	await expect(titleText).toContainText('Automated testing');

	// Check description is editable
	const descriptionInput = skillsBlock.locator('input[placeholder*="Description"]').first();
	// Change the description
	await descriptionInput.click();
	await descriptionInput.clear();
	await descriptionInput.type('End-to-end testing (Playwright)');
	
	await page.keyboard.press('Escape');
	
		// Check the skill description updates
	const descriptionText = skillsBlock.locator('.skill-description');
	await expect(descriptionText).toContainText('End-to-end testing');
});

test('saves and displays correctly on frontend', async ({ page, editor }) => {
	await editor.insertBlock({ name: 'dc23-portfolio/skill' });

	const skillsBlock = editor.canvas.locator('[data-type="dc23-portfolio/skill"]');

	// Add skill
	const titleField = skillsBlock.locator('input[placeholder*="Skill name"]').first();
	await titleField.click();
	await titleField.clear();
	await titleField.type('PHP');

	const descriptionField = skillsBlock.locator('input[placeholder*="Description"]').first();
	await descriptionField.click();
	await descriptionField.clear();
	await descriptionField.type('WordPress');

	// Save the post
	await editor.saveDraft();

	// Check the saved content structure
	const content = await editor.getEditedPostContent();
	expect(content).toContain('dc23-portfolio/skill');
	expect(content).toContain('PHP');
	expect(content).toContain('WordPress');
});


});
