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
	const nameField = skillsBlock.locator('.skill-name');
	const titleField = skillsBlock.locator('input[placeholder*="Enter skill name"]').first();
	//await expect(titleField).toContainText('Skill');

	// Change the title TextControl
	await titleField.click();
	await titleField.clear();
	await titleField.type('Automated testing');
	// Check the skill name updates
	await expect(nameField).toContainText('Automated testing');

	// Check description is editable
	const descriptionField = skillsBlock.locator('input[placeholder*="Enter description"]').first();
	const descriptionText = skillsBlock.locator('.skill-description');

	// Change the description
	await descriptionField.click();
	await descriptionField.clear();
	await descriptionField.type('End-to-end testing (Playwright)');
		// Check the skill descriptiom updates
	await expect(descriptionText).toContainText('End-to-end testing');
});

test.skip('can add and remove skills', async ({ page, editor }) => {
	await editor.insertBlock({ name: 'dc23-portfolio/skill' });
	
	const skillsBlock = page.locator('[data-type="dc23-portfolio/skill"]');
	
	// Find first skill input (default skill)
	const firstSkillInput = skillsBlock.locator('input[placeholder*="Enter skill name"]').first();
	await firstSkillInput.fill('JavaScript');
	
	// Add a new skill
	const addButton = skillsBlock.getByRole('button', { name: 'Add Skill' });
	await addButton.click();
	
	// Check that we now have 2 skill items
	const skillItems = skillsBlock.locator('.skill-item');
	await expect(skillItems).toHaveCount(2);
	
	// Fill the second skill
	const secondSkillInput = skillsBlock.locator('input[placeholder*="Enter skill name"]').nth(1);
	await secondSkillInput.fill('React');
	
	// Remove the second skill
	const removeButtons = skillsBlock.getByRole('button', { name: 'Remove' });
	await removeButtons.nth(1).click();
	
	// Check that we're back to 1 skill
	await expect(skillItems).toHaveCount(1);
	
	// Verify first skill is still there
	await expect(firstSkillInput).toHaveValue('JavaScript');
});

test.skip('cannot remove the last skill', async ({ page, editor }) => {
	await editor.insertBlock({ name: 'dc23-portfolio/skill' });
	
	const skillsBlock = page.locator('[data-type="dc23-portfolio/skill"]');
	const removeButton = skillsBlock.getByRole('button', { name: 'Remove' });
	
	// The remove button should be disabled when there's only one skill
	await expect(removeButton).toBeDisabled();
});

test.skip('can configure skill levels', async ({ page, editor }) => {
	await editor.insertBlock({ name: 'dc23-portfolio/skill' });
	
	const skillsBlock = page.locator('[data-type="dc23-portfolio/skill"]');
	
	// Fill skill name
	const skillInput = skillsBlock.locator('input[placeholder*="Enter skill name"]').first();
	await skillInput.fill('TypeScript');
	
	// Change skill level
	const levelSelect = skillsBlock.locator('select').first();
	await levelSelect.selectOption('advanced');
	
	// Check preview shows the level
	const skillPreview = skillsBlock.locator('.skill-preview').first();
	await expect(skillPreview).toContainText('Advanced');
	await expect(skillPreview.locator('.level-advanced')).toBeVisible();
});

test.skip('can toggle display settings', async ({ page, editor }) => {
	await editor.insertBlock({ name: 'dc23-portfolio/skill' });
	
	// Open block inspector
	await editor.openDocumentSettingsSidebar();
	
	// Add a skill first
	const skillsBlock = page.locator('[data-type="dc23-portfolio/skill"]');
	await skillsBlock.locator('input[placeholder*="Enter skill name"]').first().fill('CSS');
	
	// Toggle off show levels
	const showLevelsToggle = page.getByRole('checkbox', { name: 'Show skill levels' });
	await showLevelsToggle.uncheck();
	
	// Level select should no longer be visible
	const levelSelect = skillsBlock.locator('select');
	await expect(levelSelect).not.toBeVisible();
	
	// Toggle on categories
	const showCategoriesToggle = page.getByRole('checkbox', { name: 'Show categories' });
	await showCategoriesToggle.check();
	
	// Category input should now be visible
	const categoryInput = skillsBlock.locator('input[placeholder*="Programming, Design"]');
	await expect(categoryInput).toBeVisible();
	
	// Fill category
	await categoryInput.fill('Frontend');
	
	// Check preview shows category
	const skillPreview = skillsBlock.locator('.skill-preview').first();
	await expect(skillPreview).toContainText('Frontend');
});

test('saves and displays correctly on frontend', async ({ page, editor }) => {
	await editor.insertBlock({ name: 'dc23-portfolio/skill' });
	
	const skillsBlock = editor.canvas.locator('[data-type="dc23-portfolio/skill"]');
	
	// Add skill
	const titleField = skillsBlock.locator('input[placeholder*="Enter skill name"]').first();
	await titleField.click();
	await titleField.clear();
	await titleField.type('PHP');
	
	const descriptionField = skillsBlock.locator('input[placeholder*="Enter description"]').first();
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

test.skip('validates empty skill names', async ({ page, editor }) => {
	await editor.insertBlock({ name: 'dc23-portfolio/skill' });
	
	const skillsBlock = page.locator('[data-type="dc23-portfolio/skill"]');
	
	// Add multiple skills but leave some empty
	await skillsBlock.getByRole('button', { name: 'Add Skill' }).click();
	await skillsBlock.getByRole('button', { name: 'Add Skill' }).click();
	
	// Fill only the middle skill
	await skillsBlock.locator('input[placeholder*="Enter skill name"]').nth(1).fill('Node.js');
	
	// Save and check that only filled skills are in content
	await editor.saveDraft();
	const content = await editor.getEditedPostContent();
	
	// Should contain the filled skill
	expect(content).toContain('Node.js');
	
	// The save function should handle empty skills gracefully
	expect(content).toMatch(/dc23-portfolio\/skills/);
});

test.skip('maintains data integrity during editing', async ({ page, editor }) => {
	await editor.insertBlock({ name: 'dc23-portfolio/skill' });
	
	const skillsBlock = page.locator('[data-type="dc23-portfolio/skill"]');
	
	// Add and configure multiple skills
	const skills = [
		{ name: 'JavaScript', level: 'advanced' },
		{ name: 'Python', level: 'intermediate' },
		{ name: 'Docker', level: 'beginner' }
	];
	
	for (let i = 0; i < skills.length; i++) {
		if (i > 0) {
			await skillsBlock.getByRole('button', { name: 'Add Skill' }).click();
		}
		
		await skillsBlock.locator('input[placeholder*="Enter skill name"]').nth(i).fill(skills[i].name);
		await skillsBlock.locator('select').nth(i).selectOption(skills[i].level);
	}
	
	// Verify all skills are present with correct data
	for (let i = 0; i < skills.length; i++) {
		await expect(skillsBlock.locator('input[placeholder*="Enter skill name"]').nth(i)).toHaveValue(skills[i].name);
		await expect(skillsBlock.locator('select').nth(i)).toHaveValue(skills[i].level);
	}
	
	// Remove middle skill
	await skillsBlock.getByRole('button', { name: 'Remove' }).nth(1).click();
	
	// Verify remaining skills are still correct
	await expect(skillsBlock.locator('input[placeholder*="Enter skill name"]').nth(0)).toHaveValue('JavaScript');
	await expect(skillsBlock.locator('input[placeholder*="Enter skill name"]').nth(1)).toHaveValue('Docker');
	await expect(skillsBlock.locator('select').nth(0)).toHaveValue('advanced');
	await expect(skillsBlock.locator('select').nth(1)).toHaveValue('beginner');
});

});