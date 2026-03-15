/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe('education Block', () => {
	test.beforeEach(async ({ page, admin }) => {
		await admin.createNewPost();
	});

test('can be inserted and configured', async ({ page, editor }) => {
	// Insert the education block
	await editor.insertBlock({ name: 'dc23-portfolio/education' });

	// Check that the block was inserted
	const educationBlock = editor.canvas.locator('[data-type="dc23-portfolio/education"]');
	await expect(educationBlock).toBeVisible();

	// Check default name is editable
	const titleInput = educationBlock.locator('input[placeholder*="name"]').first();

	// Change the title TextControl
	await titleInput.click();
	await titleInput.clear();
	await titleInput.type('University of City');

	// Move focus to post title.
	await editor.canvas.getByRole( 'textbox', { name: 'Add title' } ).click();

	// Check the education name updates
	const titleText = educationBlock.locator('.education-name');
	await expect(titleText).toContainText('University of City');

	// Check description is editable
	await educationBlock.click();
	const descriptionInput = educationBlock.locator('input[placeholder*="Description"]').first();
	// Change the description
	await descriptionInput.click();
	await descriptionInput.clear();
	await descriptionInput.type('During my time at University of City I learned many important lessons.');

	// Move focus to post title.
	await editor.canvas.getByRole( 'textbox', { name: 'Add title' } ).click();

		// Check the education description updates
	const descriptionText = educationBlock.locator('.education-description');
	await expect(descriptionText).toContainText('important lessons');
});

test('saves and displays correctly on frontend', async ({ page, editor }) => {
	await editor.insertBlock({ name: 'dc23-portfolio/education' });

	const educationBlock = editor.canvas.locator('[data-type="dc23-portfolio/education"]');

	// Add skill
	const titleField = educationBlock.locator('input[placeholder*="name"]').first();
	await titleField.click();
	await titleField.clear();
	await titleField.type('University of City');

	const descriptionField = educationBlock.locator('input[placeholder*="Description"]').first();
	await descriptionField.click();
	await descriptionField.clear();
	await descriptionField.type('Majored in software engineering and testing.');

	// Save the post
	await editor.saveDraft();

	// Check the saved content structure
	const content = await editor.getEditedPostContent();
	expect(content).toContain('dc23-portfolio/education');
	expect(content).toContain('University of City');
	expect(content).toContain('software engineering');
});


});
