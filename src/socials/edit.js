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
    const [instagram] = useEntityProp('root', 'user', 'instagram', authorId);
    const [linkedin] = useEntityProp('root', 'user', 'linkedin', authorId);
    const [myspace] = useEntityProp('root', 'user', 'myspace', authorId);
    const [pinterest] = useEntityProp('root', 'user', 'pinterest', authorId);
    const [soundcloud] = useEntityProp('root', 'user', 'soundcloud', authorId);
    const [tumblr] = useEntityProp('root', 'user', 'tumblr', authorId);
    const [twitter] = useEntityProp('root', 'user', 'twitter', authorId);
    const [wikipedia] = useEntityProp('root', 'user', 'wikipedia', authorId);
    const [youtube] = useEntityProp('root', 'user', 'youtube', authorId);
        
    // Build social template from meta
    const authorSocials = [];
    if (facebook) authorSocials.push({ service: 'facebook', url: facebook });
    if (instagram) authorSocials.push({ service: 'instagram', url: instagram });
    if (linkedin) authorSocials.push({ service: 'linkedin', url: linkedin });
    if (myspace) authorSocials.push({ service: 'myspace', url: myspace });
    if (pinterest) authorSocials.push({ service: 'pinterest', url: pinterest });
    if (soundcloud) authorSocials.push({ service: 'soundcloud', url: soundcloud });
    if (tumblr) authorSocials.push({ service: 'tumblr', url: tumblr });
    if (twitter) authorSocials.push({ service: 'twitter', url: twitter });
    // no wikipedia social support 
    // if (wikipedia) authorSocials.push({ service: 'wikipedia', url: wikipedia });
    if (youtube) authorSocials.push({ service: 'youtube', url: youtube });

    console.log(JSON.stringify(authorSocials));

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
