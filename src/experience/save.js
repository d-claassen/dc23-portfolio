import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { roleName, organizationName, startDate, endDate, description } = attributes;

	return (
		<div { ...useBlockProps.save() }>
			<div className="experience-block">
				<div className="experience-item">
					{ roleName && (
						<h3 className="experience-role">{ roleName }</h3>
					) }
					{ organizationName && (
						<div className="experience-organization">{ organizationName }</div>
					) }
					{ ( startDate || endDate ) && (
						<div className="experience-dates">
							{ startDate && <time dateTime={ startDate }>{ startDate }</time> }
							{ startDate && endDate && ' - ' }
							{ endDate && <time dateTime={ endDate }>{ endDate }</time> }
							{ startDate && ! endDate && ' - Present' }
						</div>
					) }
					{ description && (
						<div className="experience-description">{ description }</div>
					) }
				</div>
			</div>
		</div>
	);
}
