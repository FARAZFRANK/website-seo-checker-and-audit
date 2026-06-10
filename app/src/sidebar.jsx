import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar } from '@wordpress/edit-post';
import { PanelBody, TextControl, TextareaControl, SelectControl, Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect } from 'react';
import { generateSeoMetaAi } from './api';

// Custom Sidebar Component
const FrankSeoSidebar = () => {
	// 1. Select data from WordPress Editor Store
	const { meta, postTitle, postContent, permalink } = useSelect( ( select ) => {
		const editor = select( 'core/editor' );
		return {
			meta: editor.getEditedPostAttribute( 'meta' ) || {},
			postTitle: editor.getEditedPostAttribute( 'title' ) || '',
			postContent: editor.getEditedPostContent() || '',
			permalink: editor.getPermalink() || '',
		};
	} );

	const { editPost } = useDispatch( 'core/editor' );

	// 2. Local State / Helper variables for custom meta fields
	const seoTitle = meta._frank_seo_title || '';
	const seoDesc = meta._frank_seo_description || '';
	const focusKeyword = meta._frank_seo_focus_keyword || '';
	const robotsIndex = meta._frank_seo_robots_index || 'index';
	const robotsFollow = meta._frank_seo_robots_follow || 'follow';
	const canonicalUrl = meta._frank_seo_canonical || '';
	const ogTitle = meta._frank_seo_og_title || '';
	const ogDesc = meta._frank_seo_og_description || '';
	const ogImage = meta._frank_seo_og_image || '';
	const customSchema = meta._frank_seo_custom_schema || '';

	// Update meta values helper
	const updateMeta = ( key, value ) => {
		editPost( {
			meta: {
				...meta,
				[ key ]: value,
			},
		} );
	};

	// Preview Tab state ('desktop' or 'mobile')
	const [ previewDevice, setPreviewDevice ] = useState( 'desktop' );

	// 3. Real-Time SEO Analyzer Logic
	const [ score, setScore ] = useState( 0 );
	const [ checklist, setChecklist ] = useState( [] );

	const [ isGenerating, setIsGenerating ] = useState( false );
	const [ aiError, setAiError ] = useState( '' );
	const [ aiSuccess, setAiSuccess ] = useState( false );

	useEffect( () => {
		const checks = [];
		let earnedPoints = 0;
		let totalPoints = 0;

		const cleanContent = postContent.replace( /<[^>]*>/g, ' ' );
		const words = cleanContent.trim().split( /\s+/ ).filter( Boolean );
		const wordCount = words.length;

		// 1. Focus Keyword Check
		totalPoints += 10;
		if ( focusKeyword ) {
			earnedPoints += 10;
			checks.push( { id: 'has-kw', text: 'Focus keyword defined', status: 'pass' } );
			
			const kwLower = focusKeyword.toLowerCase();

			// 2. Keyword in SEO Title
			const activeTitle = seoTitle || postTitle;
			totalPoints += 15;
			if ( activeTitle.toLowerCase().includes( kwLower ) ) {
				earnedPoints += 15;
				checks.push( { id: 'kw-in-title', text: 'Keyword found in SEO Title', status: 'pass' } );
			} else {
				checks.push( { id: 'kw-in-title', text: 'Keyword missing in SEO Title', status: 'fail' } );
			}

			// 3. Keyword in Description
			totalPoints += 15;
			if ( seoDesc.toLowerCase().includes( kwLower ) ) {
				earnedPoints += 15;
				checks.push( { id: 'kw-in-desc', text: 'Keyword found in Meta Description', status: 'pass' } );
			} else {
				checks.push( { id: 'kw-in-desc', text: 'Keyword missing in Meta Description', status: 'fail' } );
			}

			// 4. Keyword in Content
			totalPoints += 15;
			const kwCount = ( cleanContent.toLowerCase().match( new RegExp( '\\b' + kwLower.replace( /[-\/\\^$*+?.()|[\]{}]/g, '\\$&' ) + '\\b', 'g' ) ) || [] ).length;
			if ( kwCount > 0 ) {
				earnedPoints += 15;
				checks.push( { id: 'kw-in-content', text: `Keyword found in content (${kwCount} times)`, status: 'pass' } );
			} else {
				checks.push( { id: 'kw-in-content', text: 'Keyword not found in page content', status: 'fail' } );
			}

			// 5. Keyword Density
			totalPoints += 10;
			const density = wordCount > 0 ? ( kwCount / wordCount ) * 100 : 0;
			if ( density >= 0.5 && density <= 2.5 ) {
				earnedPoints += 10;
				checks.push( { id: 'kw-density', text: `Keyword density is optimal (${density.toFixed(2)}%)`, status: 'pass' } );
			} else if ( density > 0 ) {
				checks.push( { id: 'kw-density', text: `Keyword density is suboptimal (${density.toFixed(2)}%)`, status: 'warning' } );
			} else {
				checks.push( { id: 'kw-density', text: 'Keyword density is 0%', status: 'fail' } );
			}
		} else {
			checks.push( { id: 'has-kw', text: 'Define a focus keyword to unlock analysis', status: 'warning' } );
		}

		// 6. Title Length Check
		totalPoints += 10;
		const finalTitle = seoTitle || postTitle;
		if ( finalTitle.length >= 40 && finalTitle.length <= 60 ) {
			earnedPoints += 10;
			checks.push( { id: 'title-len', text: `SEO Title length is perfect (${finalTitle.length} chars)`, status: 'pass' } );
		} else {
			checks.push( { id: 'title-len', text: `Title length (${finalTitle.length} chars) should be 40-60`, status: 'warning' } );
		}

		// 7. Meta Description Length Check
		totalPoints += 10;
		if ( seoDesc.length >= 120 && seoDesc.length <= 160 ) {
			earnedPoints += 10;
			checks.push( { id: 'desc-len', text: `Meta Description length is perfect (${seoDesc.length} chars)`, status: 'pass' } );
		} else if ( seoDesc.length > 0 ) {
			checks.push( { id: 'desc-len', text: `Description length (${seoDesc.length} chars) should be 120-160`, status: 'warning' } );
		} else {
			checks.push( { id: 'desc-len', text: 'Meta Description is missing', status: 'fail' } );
		}

		// 8. Word Count Check
		totalPoints += 15;
		if ( wordCount >= 300 ) {
			earnedPoints += 15;
			checks.push( { id: 'word-count', text: `Content has ${wordCount} words (optimal)`, status: 'pass' } );
		} else {
			checks.push( { id: 'word-count', text: `Content has ${wordCount} words (aim for 300+)`, status: 'warning' } );
		}

		// Calculate total score
		const finalScore = totalPoints > 0 ? Math.round( ( earnedPoints / totalPoints ) * 100 ) : 0;
		setScore( finalScore );
		setChecklist( checks );
	}, [ postTitle, postContent, seoTitle, seoDesc, focusKeyword ] );

	// Determine score theme colors
	const scoreColor = score >= 85 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

	return (
		<PluginSidebar
			name="frank-seo-sidebar"
			title="Frank SEO Checker"
			icon="chart-area"
		>
			<PanelBody title="Google Snippet Preview" initialOpen={ true }>
				<div style={ { display: 'flex', gap: '8px', marginBottom: '16px' } }>
					<Button
						isSmall
						isPressed={ previewDevice === 'desktop' }
						onClick={ () => setPreviewDevice( 'desktop' ) }
					>
						Desktop
					</Button>
					<Button
						isSmall
						isPressed={ previewDevice === 'mobile' }
						onClick={ () => setPreviewDevice( 'mobile' ) }
					>
						Mobile
					</Button>
				</div>

				{ /* Snippet Preview Box */ }
				<div style={ {
					border: '1px solid #e2e8f0',
					borderRadius: '8px',
					padding: '12px',
					background: '#fff',
					color: '#1a0dab',
					fontFamily: 'arial, sans-serif',
					fontSize: previewDevice === 'mobile' ? '14px' : '16px',
					lineHeight: '1.2',
					maxWidth: previewDevice === 'mobile' ? '360px' : '600px'
				} }>
					{ /* Domain / URL path */ }
					<div style={ { color: '#202124', fontSize: '12px', paddingBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }>
						{ permalink || 'https://example.com' }
					</div>
					{ /* SEO Title */ }
					<div style={ { color: '#1a0dab', fontSize: previewDevice === 'mobile' ? '16px' : '20px', fontWeight: 'normal', textDecoration: 'none', cursor: 'pointer', paddingBottom: '4px' } }>
						{ seoTitle || postTitle || 'Please enter a title...' }
					</div>
					{ /* SEO Description */ }
					<div style={ { color: '#4d5156', fontSize: '14px', lineHeight: '1.4' } }>
						{ seoDesc || 'Please enter a meta description to preview snippet output here...' }
					</div>
				</div>
			</PanelBody>

			<PanelBody title="SEO Score & Analyzer" initialOpen={ true }>
				{ /* Circular Score Display */ }
				<div style={ { display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0', gap: '16px' } }>
					<div style={ {
						width: '72px',
						height: '72px',
						borderRadius: '50%',
						border: `6px solid ${scoreColor}`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: '20px',
						fontWeight: 'bold',
						color: '#0f172a'
					} }>
						{ score }%
					</div>
					<div>
						<h4 style={ { margin: '0 0 4px 0', fontWeight: 'bold' } }>On-Page Score</h4>
						<p style={ { margin: 0, fontSize: '12px', color: '#64748b' } }>
							{ score >= 85 ? 'Excellent SEO optimization!' : score >= 60 ? 'Good, but has room to improve.' : 'Needs critical optimizations.' }
						</p>
					</div>
				</div>

				{ /* Checklist items */ }
				<div style={ { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' } }>
					{ checklist.map( ( check, idx ) => {
						const statusColor = check.status === 'pass' ? '#10b981' : check.status === 'warning' ? '#f59e0b' : '#ef4444';
						const icon = check.status === 'pass' ? '✓' : check.status === 'warning' ? '⚠' : '✗';
						return (
							<div key={ idx } style={ { display: 'flex', gap: '8px', fontSize: '13px', alignItems: 'flex-start' } }>
								<span style={ { color: statusColor, fontWeight: 'bold', minWidth: '16px' } }>{ icon }</span>
								<span style={ { color: '#334155' } }>{ check.text }</span>
							</div>
						);
					} ) }
				</div>
			</PanelBody>

			<PanelBody title="SEO Configuration" initialOpen={ true }>
				<TextControl
					label="Focus Keyword"
					value={ focusKeyword }
					onChange={ ( val ) => updateMeta( '_frank_seo_focus_keyword', val ) }
					placeholder="Enter focus keyword..."
				/>

				{ /* AI Meta Assistant */ }
				<div style={ { 
					background: 'rgba(99, 102, 241, 0.04)', 
					border: '1px dashed rgba(99, 102, 241, 0.3)', 
					borderRadius: '8px', 
					padding: '12px', 
					marginBottom: '20px' 
				} }>
					<h5 style={ { margin: '0 0 6px 0', fontSize: '13px', fontWeight: 'bold', color: '#1e293b' } }>
						✨ AI Meta Suggestions
					</h5>
					<p style={ { fontSize: '11px', color: '#64748b', margin: '0 0 10px 0', lineHeight: '1.4' } }>
						Suggest title and description based on page content and focus keyword.
					</p>
					{ aiError && (
						<div style={ { 
							color: '#ef4444', 
							background: '#fef2f2', 
							border: '1px solid #fca5a5', 
							borderRadius: '6px', 
							padding: '6px 8px', 
							fontSize: '11px', 
							marginBottom: '10px',
							lineHeight: '1.3'
						} }>
							{ aiError }
						</div>
					) }
					{ aiSuccess && (
						<div style={ { 
							color: '#10b981', 
							background: '#ecfdf5', 
							border: '1px solid #6ee7b7', 
							borderRadius: '6px', 
							padding: '6px 8px', 
							fontSize: '11px', 
							marginBottom: '10px',
							lineHeight: '1.3'
						} }>
							Metadata generated and applied successfully!
						</div>
					) }
					<Button
						isSecondary
						isBusy={ isGenerating }
						disabled={ isGenerating }
						onClick={ async () => {
							setIsGenerating( true );
							setAiError( '' );
							setAiSuccess( false );
							try {
								const response = await generateSeoMetaAi( postTitle, postContent, focusKeyword );
								if ( response && response.success && response.title && response.description ) {
									updateMeta( '_frank_seo_title', response.title );
									updateMeta( '_frank_seo_description', response.description );
									setAiSuccess( true );
								} else {
									setAiError( response?.message || 'Failed to generate SEO metadata.' );
								}
							} catch ( err ) {
								console.error( 'AI generation failed:', err );
								const message = err.response?.data?.message || err.message || 'An error occurred during metadata generation.';
								setAiError( message );
							} finally {
								setIsGenerating( false );
							}
						} }
						style={ { width: '100%', justifyContent: 'center', height: '30px', fontSize: '12px' } }
					>
						✨ AI Suggest Title & Desc
					</Button>
				</div>

				<TextControl
					label="Custom SEO Title"
					value={ seoTitle }
					onChange={ ( val ) => updateMeta( '_frank_seo_title', val ) }
					help={ `Optimal length: 40-60 chars (Current: ${seoTitle.length})` }
				/>

				<TextareaControl
					label="Meta Description"
					value={ seoDesc }
					onChange={ ( val ) => updateMeta( '_frank_seo_description', val ) }
					help={ `Optimal length: 120-160 chars (Current: ${seoDesc.length})` }
				/>

				<TextControl
					label="Canonical URL"
					value={ canonicalUrl }
					onChange={ ( val ) => updateMeta( '_frank_seo_canonical', val ) }
					placeholder={ permalink }
				/>

				<div style={ { display: 'flex', gap: '12px' } }>
					<div style={ { flex: 1 } }>
						<SelectControl
							label="Robots Index"
							value={ robotsIndex }
							options={ [
								{ label: 'Index', value: 'index' },
								{ label: 'No Index', value: 'noindex' },
							] }
							onChange={ ( val ) => updateMeta( '_frank_seo_robots_index', val ) }
						/>
					</div>
					<div style={ { flex: 1 } }>
						<SelectControl
							label="Robots Follow"
							value={ robotsFollow }
							options={ [
								{ label: 'Follow', value: 'follow' },
								{ label: 'No Follow', value: 'nofollow' },
							] }
							onChange={ ( val ) => updateMeta( '_frank_seo_robots_follow', val ) }
						/>
					</div>
				</div>
			</PanelBody>

			<PanelBody title="Social Media (OpenGraph)" initialOpen={ false }>
				<p style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px', marginTop: '0' }}>
					Overrides the default SEO metadata when shared on Facebook, X (Twitter), and LinkedIn.
				</p>
				<TextControl
					label="Social Title"
					value={ ogTitle }
					onChange={ ( val ) => updateMeta( '_frank_seo_og_title', val ) }
					placeholder="Leave blank to use SEO Title"
				/>
				<TextareaControl
					label="Social Description"
					value={ ogDesc }
					onChange={ ( val ) => updateMeta( '_frank_seo_og_description', val ) }
					placeholder="Leave blank to use SEO Desc"
				/>
				<TextControl
					label="Social Image URL"
					value={ ogImage }
					onChange={ ( val ) => updateMeta( '_frank_seo_og_image', val ) }
					placeholder="https://..."
					help="Leave blank to automatically use the Featured Image."
				/>
			</PanelBody>

			<PanelBody title="Advanced Schema Builder" initialOpen={ false }>
				<p style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px', marginTop: '0' }}>
					Frank SEO automatically detects FAQ blocks on this page and converts them into Schema. If you want to inject custom JSON-LD (like a Recipe or Course), paste it here.
				</p>
				<TextareaControl
					label="Raw JSON-LD"
					value={ customSchema }
					onChange={ ( val ) => updateMeta( '_frank_seo_custom_schema', val ) }
					placeholder='{ "@context": "https://schema.org", ... }'
					rows={ 8 }
					style={{ fontFamily: 'monospace', fontSize: '11px' }}
				/>
			</PanelBody>
		</PluginSidebar>
	);
};

// Register the sidebar plugin
registerPlugin( 'frank-seo-editor-sidebar', {
	render: FrankSeoSidebar,
	icon: 'chart-area',
} );
