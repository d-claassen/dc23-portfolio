/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { TextControl, PanelBody } from '@wordpress/components';

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
export default function Edit( { attributes, setAttributes, isSelected } ) {
	const { name, description, sameAs, specialtyId } = attributes;
	const setName = (name) => setAttributes( { ...attributes, name });
	const setDescription = (description) => setAttributes( { ...attributes, description });

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Schema Settings', 'dc23-portfolio' ) }>
					<TextControl
						label={ __( 'Specialty ID', 'dc23-portfolio' ) }
						value={ specialtyId }
						onChange={ ( value ) => setAttributes( { specialtyId: value } ) }
						help={ __( 'Optional: Override the auto-generated @id', 'dc23-portfolio' ) }
					/>
					<TextControl
						label={ __( 'Same As URL', 'dc23-portfolio' ) }
						value={ sameAs }
						onChange={ ( value ) => setAttributes( { sameAs: value } ) }
						placeholder={ __( 'e.g., https://en.wikipedia.org/wiki/Web_development', 'dc23-portfolio' ) }
						help={ __( 'Reference URL (Wikipedia, etc.)', 'dc23-portfolio' ) }
						type="url"
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps() }>
			<div className="skills-block">
				<div className="skill-item">
					<div className="skill-preview" style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
						{ isSelected ? (
							<>
								<TextControl
									className="skill-name"
									value={name}
									onChange={setName}
									placeholder={__('Skill name', 'dc23-portfolio')}
									aria-label={__('Skill name', 'dc23-portfolio')}
									hideLabelFromVision
									style={{ marginBottom: 0, minWidth: '6em', flex: '0 1 auto' }}
								/>
								<TextControl
									className="skill-description"
									value={description}
									onChange={setDescription}
									placeholder={__('Description', 'dc23-portfolio')}
									aria-label={__('Description', 'dc23-portfolio')}
									hideLabelFromVision
									style={{ marginBottom: 0, minWidth: '10em', flex: '1 1 auto' }}
								/>
							</>
						) : (
							<>
								<span className="skill-name">{name || __('Skill name', 'dc23-portfolio')}</span>
								{ (description || description === '') && (
									<span className="skill-description">
										{description || __('Description', 'dc23-portfolio')}
									</span>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
		</>
	);
}
