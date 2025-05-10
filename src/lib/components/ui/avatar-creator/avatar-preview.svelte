<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';

	// Accept layers from parent component - expect SVG paths
	let {
		layers = $bindable([]),
		flipped = false,
		alt = 'Avatar',
		previewBgClass = 'bg-green-400' // Default background color
	}: {
		layers: string[];
		flipped?: boolean;
		alt?: string;
		previewBgClass?: string;
	} = $props();

	// Generate a unique ID for SVG filter
	const avatarId = $derived(`avatar-${Math.random().toString(36).substring(2, 9)}`);

	// State for the SVG data URL
	let svgDataUrl = $state('');

	// Use $derived for the filter to make it react to avatarId changes
	const svgFilter = $derived(`
    <filter id="${avatarId}-filter" x="-20%" y="-20%" width="140%" height="140%" 
            filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" 
            color-interpolation-filters="linearRGB">
      <feMorphology operator="dilate" radius="20 20" in="SourceAlpha" result="morphology"/>
      <feFlood flood-color="#ffffff" flood-opacity="1" result="flood"/>
      <feComposite in="flood" in2="morphology" operator="in" result="composite"/>
      <feMerge result="merge">
        <feMergeNode in="composite" result="mergeNode"/>
        <feMergeNode in="SourceGraphic" result="mergeNode1"/>
      </feMerge>
    </filter>
  `);

	// Generate SVG when layers change
	$effect(() => {
		generateAvatar();
	});

	// Fetch and process SVG layers - matches the original approach
	async function generateAvatar() {
		try {
			// Fetch each SVG part
			const groupElements = await Promise.all(
				layers.map(async (path, index) => {
					// Get the part type from the path
					const partMatch = path.match(/\/([^\/]+)\/[^\/]+\.svg$/);
					const partType = partMatch ? partMatch[1] : `part-${index}`;

					// Fetch the SVG content
					const response = await fetch(path);
					const svgText = await response.text();

					// Extract the SVG content (without svg wrapper)
					const contentMatch = svgText.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
					const svgContent = contentMatch ? contentMatch[1] : svgText;

					// Create group element with appropriate attributes
					// Only add fill="#ffffff" for face parts, following Notion's approach
					return `
            <g id="${avatarId}-${partType}" ${partType.includes('face') ? 'fill="#ffffff"' : ''} 
               ${flipped ? 'transform="scale(-1,1) translate(-1080, 0)"' : ''}>
              ${svgContent}
            </g>
          `;
				})
			);

			// Combine into a single SVG with filter - just like Notion
			const combinedSvg = `
        <svg viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            ${svgFilter}
          </defs>
          <g id="${avatarId}-avatar" filter="url(#${avatarId}-filter)">
            ${groupElements.join('\n')}
          </g>
        </svg>
      `;

			// Convert to data URL for Avatar.Image
			svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(combinedSvg)))}`;
		} catch (error) {
			console.error('Error generating avatar:', error);
		}
	}
</script>

<Avatar.Root class="h-36 w-36 {previewBgClass}">
	{#if svgDataUrl}
		<Avatar.Image src={svgDataUrl} {alt} />
	{:else}
		<Avatar.Fallback>...</Avatar.Fallback>
	{/if}
</Avatar.Root>
