import { __ } from '@wordpress/i18n';
import { InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useMemo, useState } from '@wordpress/element';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

const authorSocials = [
   {service: "github", url: "testurlwhocaresright", label: "pretty text"},
   {service: "facebook", url: "testurlwhocaresright", label: "pretty text"},
];
   
/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes, clientId }) {
    const { showLabels, iconSize } = attributes;
    const { replaceInnerBlocks } = useDispatch('core/block-editor');

    const { authorId } = useSelect(select => {
        return {
            authorId: select('core/editor').getEditedPostAttribute('author'),
        };
    }, []);

    // Get Yoast social meta for the author
    const [facebook] = useEntityProp('root', 'user', 'facebook', authorId);
    const [twitter] = useEntityProp('root', 'user', 'twitter', authorId);
    const [linkedin] = useEntityProp('root', 'user', 'linkedin', authorId);
    console.log({authorId, facebook, twitter, linkedin});
    
    const meta = useEntityProp('root', 'user', 'meta', authorId);
    console.log({authorId, meta});
    console.log(meta);

    // Build social template from meta
    const socialTemplate = useMemo(() => {
        const socials = [];
        if (facebook) socials.push({ service: 'facebook', url: facebook });
        if (twitter) socials.push({ service: 'twitter', url: twitter });
        if (linkedin) socials.push({ service: 'linkedin', url: linkedin });

        console.log({authorId, socials});

        return socials;
    }, [facebook, twitter, linkedin]);
    
    /* this should end as dep for below memo.
    // Get Yoast social data
    const authorSocials = useSelect(select => {
        // Fetch author meta via REST API or store
        return getAuthorYoastSocials(authorId);
    });
    */
      
   useEffect(() => {
        // Create individual social-link blocks
        const socialLinkBlocks = authorSocials.map(social => 
            createBlock('core/social-link', {
                service: social.service,
                url: social.url,
                label: social.label
            })
        );
        
        // Create the wrapper social-links block
        const socialLinksBlock = createBlock('core/social-links', {
            showLabels,
            size: iconSize
        }, socialLinkBlocks);
        
        // Replace all inner blocks with our new structure
        replaceInnerBlocks( clientId, [ socialLinksBlock ] );
    }, [showLabels, iconSize, authorSocials, clientId]);

    return (
        <div {...useBlockProps() }>
            <InspectorControls>
                <PanelBody title="Settings">
                    <ToggleControl
                        label="Show Labels"
                        checked={showLabels}
                        onChange={(value) => setAttributes({ showLabels: value })}
                        __nextHasNoMarginBottom={true}
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
                        __nextHasNoMarginBottom={true}
                        __next40pxDefaultSize={true}
                    />
                </PanelBody>
            </InspectorControls>

            <InnerBlocks templateLock="all" />
        </div>
    );
};
