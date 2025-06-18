import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
const { name, description } = attributes;

return (
	<div {...useBlockProps.save()}>
		<div className="skills-block">
						<div className="skill-item">
							<span className="skill-name">{name}</span>

							{description && (
								<span className="skill-description">{skill.description}</span>
							)}
						</div>
		</div>
	</div>
);
}