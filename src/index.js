/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import { Fill, PanelBody, SearchControl, Spinner } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { store as editorStore } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';

/**
 * ProfilePage Schema Section Component
 */
function ProfilePageSchemaSection() {
	const [searchTerm, setSearchTerm] = useState('');
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [userProfile, setUserProfile] = useState(null);

	// Get the page type from Yoast SEO
	const { pageType } = useSelect((select) => {
		const yoastStore = select('yoast-seo/editor');
		
		console.log( Object.keys( yoastStore ) );
		
		return {
			pageType: yoastStore.getPageType(),
		};
	}, []);

	// Get current post type
	const { postType, savedUserId } = useSelect((select) => {
		const store = select(editorStore);
		return {
			postType: store.getCurrentPostType(),
			savedUserId: store.getEditedPostAttribute('meta')?._dc23_portfolio_user_id,
		};
	}, [] );

	const { editPost } = useDispatch(editorStore);

	// Load saved user when component mounts
	useEffect(() => {
		if (savedUserId) {
			loadUserProfile(savedUserId);
		}
	}, [savedUserId]);

	// Only show this section when post type is page and page type is ProfilePage
	console.log({postType, pageType});
	if (postType !== 'page' || pageType !== 'ProfilePage') {
		return null;
	}

	// Search for users
	const searchUsers = async (search) => {
		if (!search || search.length < 2) {
			setUsers([]);
			return;
		}

		setIsLoading(true);
		try {
			const results = await apiFetch({
				path: `/wp/v2/users?search=${encodeURIComponent(search)}&per_page=10`,
			});
			setUsers(results);
		} catch (error) {
			console.error('Error searching users:', error);
			setUsers([]);
		} finally {
			setIsLoading(false);
		}
	};

	// Load full user profile
	const loadUserProfile = async (userId) => {
		try {
			const user = await apiFetch({
				path: `/wp/v2/users/${userId}?context=edit`,
			});
			setSelectedUser(user);
			setUserProfile(user);
			setSearchTerm(user.name);
		} catch (error) {
			console.error('Error loading user profile:', error);
		}
	};

	// Handle user selection
	const handleUserSelect = (userId) => {
		// Save to post meta
		editPost({
			meta: {
				_dc23_portfolio_user_id: userId,
			},
		});

		// Load user profile
		loadUserProfile(userId);

		// Clear search results
		setUsers([]);
	};

	// Handle search input change
	const handleSearchChange = (value) => {
		setSearchTerm(value);
		searchUsers(value);
	};

	return (
		<Fill name="YoastSidebar">
			<PanelBody
				title={__('ProfilePage Schema', 'dc23-portfolio')}
				initialOpen={true}
			>
				<div className="dc23-profile-schema">
					<SearchControl
						label={__('Select User Profile', 'dc23-portfolio')}
						value={searchTerm}
						onChange={handleSearchChange}
						placeholder={__('Search for a user...', 'dc23-portfolio')}
						help={__('Select the main user profile for this page.', 'dc23-portfolio')}
					/>

					{isLoading && <Spinner />}

					{users.length > 0 && (
						<ul className="dc23-user-search-results">
							{users.map((user) => (
								<li key={user.id}>
									<button
										type="button"
										onClick={() => handleUserSelect(user.id)}
										className="dc23-user-select-button"
									>
										{user.name}
									</button>
								</li>
							))}
						</ul>
					)}

					{userProfile && (
						<div className="dc23-user-profile">
							<h4>{__('Selected Profile', 'dc23-portfolio')}</h4>
							<div className="dc23-user-info">
								<p>
									<strong>{__('Name:', 'dc23-portfolio')}</strong>{' '}
									{userProfile.name}
								</p>
								{userProfile.wpseo_title && (
									<p>
										<strong>{__('Title:', 'dc23-portfolio')}</strong>{' '}
										{userProfile.wpseo_title}
									</p>
								)}
								{userProfile.wpseo_pronouns && (
									<p>
										<strong>{__('Pronouns:', 'dc23-portfolio')}</strong>{' '}
										{userProfile.wpseo_pronouns}
									</p>
								)}
								{userProfile.wpseo_employer && (
									<p>
										<strong>{__('Employer:', 'dc23-portfolio')}</strong>{' '}
										{userProfile.wpseo_employer}
									</p>
								)}
							</div>
						</div>
					)}
				</div>
			</PanelBody>
		</Fill>
	);
}

// Register the plugin
registerPlugin('dc23-profile-page-schema', {
	render: ProfilePageSchemaSection,
});
