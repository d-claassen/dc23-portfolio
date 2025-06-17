/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

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
    const setName = (name) => setAtttributes( { name });
    const setDescription = (description) => setAttributes( { description });
	return (
		<p { ...useBlockProps() }>
			{ __( 'Portfolio skill – hello from the editor!', 'skill' ) }
		</p>
	);
}
