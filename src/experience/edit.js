/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl } from '@wordpress/components';

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
 * @param {Object} props Component props.
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const {
		roleId,
		roleName,
		organizationId,
		organizationName,
		startDate,
		endDate,
		description,
	} = attributes;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Schema Settings', 'dc23-portfolio' ) }>
					<TextControl
						label={ __( 'Role ID', 'dc23-portfolio' ) }
						value={ roleId }
						onChange={ ( value ) => setAttributes( { roleId: value } ) }
						help={ __( 'Unique identifier for this role (e.g., https://example.com/#/schema/role/lead-developer)', 'dc23-portfolio' ) }
					/>
					<TextControl
						label={ __( 'Organization ID', 'dc23-portfolio' ) }
						value={ organizationId }
						onChange={ ( value ) => setAttributes( { organizationId: value } ) }
						help={ __( 'Reference to organization @id (e.g., https://example.com/#/schema/Organization/yoast)', 'dc23-portfolio' ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...useBlockProps() }>
				<div className="experience-block">
					<div className="experience-item">
						<TextControl
							label={ __( 'Role Name', 'dc23-portfolio' ) }
							value={ roleName }
							onChange={ ( value ) => setAttributes( { roleName: value } ) }
							placeholder={ __( 'e.g., Senior Developer', 'dc23-portfolio' ) }
						/>
						<TextControl
							label={ __( 'Organization', 'dc23-portfolio' ) }
							value={ organizationName }
							onChange={ ( value ) => setAttributes( { organizationName: value } ) }
							placeholder={ __( 'e.g., Yoast', 'dc23-portfolio' ) }
							help={ __( 'Display name (not used in schema)', 'dc23-portfolio' ) }
						/>
						<div style={ { display: 'flex', gap: '1em' } }>
							<TextControl
								label={ __( 'Start Date', 'dc23-portfolio' ) }
								value={ startDate }
								onChange={ ( value ) => setAttributes( { startDate: value } ) }
								placeholder={ __( 'YYYY-MM-DD', 'dc23-portfolio' ) }
								type="date"
							/>
							<TextControl
								label={ __( 'End Date', 'dc23-portfolio' ) }
								value={ endDate }
								onChange={ ( value ) => setAttributes( { endDate: value } ) }
								placeholder={ __( 'YYYY-MM-DD or leave empty for current', 'dc23-portfolio' ) }
								type="date"
							/>
						</div>
						<TextareaControl
							label={ __( 'Description', 'dc23-portfolio' ) }
							value={ description }
							onChange={ ( value ) => setAttributes( { description: value } ) }
							placeholder={ __( 'Brief description of your role and responsibilities', 'dc23-portfolio' ) }
						/>
					</div>
				</div>
			</div>
		</>
	);
}
