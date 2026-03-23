import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { degree, roleName, organizationName, startDate, endDate, description } = attributes;

	return (
		<div { ...useBlockProps.save() }>
			<div className="education-block">
				<div className="education-item">
					{ ( degree || roleName ) && (
						<h3 className="education-degree">{ degree || roleName }</h3>
					) }
					{ organizationName && (
						<div className="education-institution">{ organizationName }</div>
					) }
					{ ( startDate || endDate ) && (
						<div className="education-dates">
							{ startDate && <time dateTime={ startDate }>{ startDate }</time> }
							{ startDate && endDate && ' - ' }
							{ endDate && <time dateTime={ endDate }>{ endDate }</time> }
						</div>
					) }
					{ description && (
						<div className="education-description">{ description }</div>
					) }
				</div>
			</div>
		</div>
	);
}
