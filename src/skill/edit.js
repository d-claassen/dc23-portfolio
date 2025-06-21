/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const { name, description } = attributes;
	const setName = (name) => setAttributes( { ...attributes, name });
	const setDescription = (description) => setAttributes( { ...attributes, description });


	return (
		<div { ...useBlockProps() }>
			<div className="skills-block">
					<div className="skill-item">
						<div className="skill-controls">
								<TextControl
									label={__('Skill name', 'dc23-portfolio')}
									value={name}
									onChange={setName}
									placeholder={__('Enter skill name', 'dc23-portfolio')}
								/>
								<TextControl
									label={__('Description', 'dc23-portfolio')}
									value={description}
									onChange={setDescription}
									placeholder={__('Enter description', 'dc23-portfolio')}
								/>
							</div>
							<div className="skill-preview">
								<span className="skill-name">{name || __('Skill name', 'dc23-portfolio')}</span>

								{description && (
									<span className="skill-description">{description}</span>
								)}
						</div>
					</div>
			</div>
		</div>
	);
}
