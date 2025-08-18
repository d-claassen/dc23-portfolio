import { __ } from '@wordpress/i18n';
import { InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { FormTokenField, PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { useEntityRecord } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

const platforms = [
    { service: 'facebook', userMeta: 'facebook' },
    { service: 'instagram', userMeta: 'instagram' },
    { service: 'linkedin', userMeta: 'linkedin' },
    { service: 'pinterest', userMeta: 'pinterest' },
    { service: 'soundcloud', userMeta: 'soundcloud' },
    { service: 'tumblr', userMeta: 'tumblr' },
    { service: 'twitter', userMeta: 'twitter' },
    { service: 'youtube', userMeta: 'youtube' },
];

const supportedPlatforms = platforms.map(p => p.service);

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes, clientId }) {
    const { 
        showLabels, 
        iconSize,
        activePlatforms = platforms.map(p => p.service),
    } = attributes;
    const { replaceInnerBlocks } = useDispatch('core/block-editor');

    const { authorId } = useSelect(select => {
        return {
            authorId: select('core/editor').getEditedPostAttribute('author'),
        };
    }, []);
    
    const { record: user, isResolving } = useEntityRecord( 'root', 'user', authorId );

    useEffect(() => {
        if ( isResolving || ! user ) {
            return;
        }

        const socials = platforms
            .filter(p => (activePlatforms.indexOf(p.service) >= 0))
            .map(({ service, userMeta })  => ({
                service, 
                url: user[userMeta],
                label: ''
            }))

        console.log({nrOfSocials: socials.length});
        if ( socials.length === 0 ) {
            console.log({mag:'no social profiles found'});
    
            replaceInnerBlocks( 
                clientId, 
                [ 
                    createBlock(
                        'core/paragraph',
                        // @todo provavly 
                        {
                            content: "No social profiles found",
                        },
                    )
                ]
            );
            return;
        }

        // Create individual social-link blocks
        const socialLinkBlocks = socials.map(social => 
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
    }, [activePlatforms, showLabels, iconSize, user, isResolving, clientId]);


    const validateInput = useCallback((nextActivePlatform) => {
        return supportedPlatforms.indexOf(nextActivePlatform) >= 0;
    }, [supportedPlatforms]);

    const onChange = useCallback((nextActivePlatforms) => {
        return setAttributes({
            activePlatforms: nextActivePlatforms,
        });
    }, [setAttributes]);

    return (
        <div {...useBlockProps() }>
            <InspectorControls>
                <PanelBody title="Settings">
                    <FormTokenField
                        __experimentalExpandOnFocus
                        __experimentalAutoSelectFirstMatch
                        tokenizeOnSpace
                        __experimentalValidateInput={ validateInput }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                        label="Social Platforms"
                        onChange={ onChange }
                        suggestions={ supportedPlatforms }
                        value={ activePlatforms }
                    />
                    
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
