/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl, Notice } from '@wordpress/components';

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
		organizationId,
		name,
		type,
		url,
		sameAs,
		parentOrganizationId,
		parentStartDate,
	} = attributes;

	// Parse sameAs array for display
	const sameAsString = Array.isArray( sameAs ) ? sameAs.join( '\n' ) : '';

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Parent Organization', 'dc23-portfolio' ) }>
					<TextControl
						label={ __( 'Parent Organization ID', 'dc23-portfolio' ) }
						value={ parentOrganizationId }
						onChange={ ( value ) => setAttributes( { parentOrganizationId: value } ) }
						help={ __( 'Reference to parent organization @id (for acquisitions, mergers)', 'dc23-portfolio' ) }
					/>
					<TextControl
						label={ __( 'Parent Relationship Start Date', 'dc23-portfolio' ) }
						value={ parentStartDate }
						onChange={ ( value ) => setAttributes( { parentStartDate: value } ) }
						placeholder={ __( 'YYYY-MM-DD', 'dc23-portfolio' ) }
						type="date"
						help={ __( 'When did this organization become part of the parent?', 'dc23-portfolio' ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...useBlockProps() }>
				<Notice status="info" isDismissible={ false }>
					<strong>{ __( 'Organization Metadata', 'dc23-portfolio' ) }</strong>
					<p>{ __( 'This block creates schema.org data but is not visible on the page. Reference this organization from Experience or Education blocks using its Organization ID.', 'dc23-portfolio' ) }</p>
				</Notice>
				<div className="organization-block">
					<div className="organization-item">
						<TextControl
							label={ __( 'Organization ID', 'dc23-portfolio' ) }
							value={ organizationId }
							onChange={ ( value ) => setAttributes( { organizationId: value } ) }
							placeholder={ __( 'e.g., https://example.com/#/schema/Organization/yoast', 'dc23-portfolio' ) }
							help={ __( 'Unique identifier - use this in Experience/Education blocks', 'dc23-portfolio' ) }
						/>
						<TextControl
							label={ __( 'Name', 'dc23-portfolio' ) }
							value={ name }
							onChange={ ( value ) => setAttributes( { name: value } ) }
							placeholder={ __( 'e.g., Yoast', 'dc23-portfolio' ) }
						/>
						<SelectControl
							label={ __( 'Type', 'dc23-portfolio' ) }
							value={ type }
							options={ [
								{ label: __( 'Corporation', 'dc23-portfolio' ), value: 'Corporation' },
								{ label: __( 'College or University', 'dc23-portfolio' ), value: 'CollegeOrUniversity' },
								{ label: __( 'Educational Organization', 'dc23-portfolio' ), value: 'EducationalOrganization' },
								{ label: __( 'Organization', 'dc23-portfolio' ), value: 'Organization' },
							] }
							onChange={ ( value ) => setAttributes( { type: value } ) }
						/>
						<TextControl
							label={ __( 'URL', 'dc23-portfolio' ) }
							value={ url }
							onChange={ ( value ) => setAttributes( { url: value } ) }
							placeholder={ __( 'e.g., https://yoast.com', 'dc23-portfolio' ) }
							type="url"
						/>
						<TextControl
							label={ __( 'Same As URLs', 'dc23-portfolio' ) }
							value={ sameAsString }
							onChange={ ( value ) => {
								const urls = value.split( '\n' ).filter( ( u ) => u.trim() !== '' );
								setAttributes( { sameAs: urls } );
							} }
							placeholder={ __( 'One URL per line\ne.g., https://en.wikipedia.org/wiki/Yoast', 'dc23-portfolio' ) }
							help={ __( 'Reference URLs (Wikipedia, social profiles, etc.) - one per line', 'dc23-portfolio' ) }
							rows={ 3 }
						/>
					</div>
				</div>
			</div>
		</>
	);
}
