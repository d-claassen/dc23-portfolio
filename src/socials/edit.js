import { __ } from '@wordpress/i18n';
import { InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
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
export default function Edit({ attributes, setAttributes }) {
    const { showLabels, iconSize } = attributes;

    console.log('Edit component rendered', { showLabels, iconSize });
    console.log('setAttributes function:', typeof setAttributes);
   

   const authorSocials = [
      {service: "github", url: "testurlwhocaresright", lsbel: "pretty text"},
      {service: "facebook", url: "testurlwhocaresright", lsbel: "pretty text"},
   ];
    /*
    // Get Yoast social data
    const authorSocials = useSelect(select => {
        // Fetch author meta via REST API or store
        return getAuthorYoastSocials(authorId);
    });
    */
    // Generate social link blocks template
    const socialTemplate = authorSocials.map(social => [
        'core/social-link', 
        { 
            service: social.service,
            url: social.url,
            label: social.label 
        }
    ]);

    return (
        <div {...useBlockProps() }>
            <InspectorControls>
                <PanelBody title="Settings">
                    {console.log('Rendering inspector controls')}
                    
                    <ToggleControl
                        label="Show Labels"
                        checked={showLabels}
                        onChange={(value) => setAttributes({ showLabels: value })}
                    />
                    <SelectControl
                        label="Icon Size"
                        value={iconSize}
                        onChange={(value) => setAttributes({ iconSize: value })}
                        options={[
                            { label: 'Small', value: 'small' },
                            { label: 'Normal', value: 'normal' },
                            { label: 'Large', value: 'large' }
                        ]}
                    />
                </PanelBody>
            </InspectorControls>

            <InnerBlocks
                allowedBlocks={['core/social-links']}
                template={[['core/social-links', { 
                    showLabels,
                    size: iconSize,
                }, socialTemplate]]}
                templateLock="all"
            />
        </div>
    );
};
