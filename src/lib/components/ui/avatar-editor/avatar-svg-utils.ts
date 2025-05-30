/**
 * Options for generating SVG avatars
 */
export interface SvgGenerationOptions {
	includeOutlineFilter?: boolean;
	backgroundColor?: string | null;
}

/**
 * Core function that generates SVG based on provided options.
 * @param layers An array of string paths to individual SVG layer files.
 * @param options Configuration options for SVG generation
 * @param flipped Whether the avatar should be horizontally flipped
 * @returns A promise that resolves to the SVG data URL string.
 */
async function generateSvgCore(
	layers: string[],
	options: SvgGenerationOptions = {},
	flipped: boolean = false
): Promise<string> {
	const { includeOutlineFilter = false, backgroundColor = null } = options;
	const avatarId = `avatar-${Math.random().toString(36).substring(2, 9)}`;

	// Define filter only if needed
	const svgFilter = includeOutlineFilter
		? `
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
  `
		: '';

	try {
		const groupElements = await Promise.all(
			layers.map(async (path, index) => {
				const partMatch = path.match(/([^/]+)\/[^/]+\.svg$/);
				const partType = partMatch ? partMatch[1] : `part-${index}`;

				const response = await fetch(path);
				const svgText = await response.text();

				// Extract the SVG content from the SVG text (remove the <svg> and </svg> tags)
				const contentMatch = svgText.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
				// If the SVG content is not found, return the original SVG text
				const svgContent = contentMatch ? contentMatch[1] : svgText;

				return `
          <g id="${avatarId}-${partType}" fill="#ffffff" 
             ${flipped ? 'transform="scale(-1,1) translate(-1080, 0)"' : ''}>
            ${svgContent}
          </g>
        `;
			})
		);

		// Build SVG structure based on options
		const svgContent = `
      <svg viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
        ${svgFilter ? `<defs>${svgFilter}</defs>` : ''}
        ${backgroundColor ? `<rect width="1080" height="1080" fill="${backgroundColor}" />` : ''}
        <g id="${avatarId}-avatar" ${includeOutlineFilter ? `filter="url(#${avatarId}-filter)"` : ''}>
          ${groupElements.join('\n')}
        </g>
      </svg>
    `;

		return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
	} catch (error) {
		console.error('Error generating avatar SVG:', error);
		return ''; // Return an empty string or a default placeholder SVG data URL on error
	}
}

/**
 * Generates a complete avatar SVG as a base64 encoded data URL.
 * Includes outline filter but no background.
 * @param layers An array of string paths to individual SVG layer files.
 * @param flipped Whether the avatar should be horizontally flipped (currently unused).
 * @returns A promise that resolves to the SVG data URL string.
 */
export async function generateSvgDataUrl(
	layers: string[],
	flipped: boolean = false
): Promise<string> {
	return generateSvgCore(layers, { includeOutlineFilter: true }, flipped);
}

/**
 * Generates a complete avatar SVG without the outline filter as a base64 encoded data URL.
 * Transparent background, no outline.
 * @param layers An array of string paths to individual SVG layer files.
 * @param flipped Whether the avatar should be horizontally flipped (currently unused).
 * @returns A promise that resolves to the SVG data URL string.
 */
export async function generateSvgWithoutOutlineDataUrl(
	layers: string[],
	flipped: boolean = false
): Promise<string> {
	return generateSvgCore(layers, { includeOutlineFilter: false }, flipped);
}

/**
 * Generates a complete avatar SVG with transparent background but includes outline filter.
 * @param layers An array of string paths to individual SVG layer files.
 * @param flipped Whether the avatar should be horizontally flipped (currently unused).
 * @returns A promise that resolves to the SVG data URL string.
 */
export async function generateSvgWithOutlineDataUrl(
	layers: string[],
	flipped: boolean = false
): Promise<string> {
	return generateSvgCore(layers, { includeOutlineFilter: true }, flipped);
}

/**
 * Generates a complete avatar SVG with colored background as a base64 encoded data URL.
 * Includes outline filter.
 * @param layers An array of string paths to individual SVG layer files.
 * @param backgroundColor The background color to use (hex format).
 * @param flipped Whether the avatar should be horizontally flipped (currently unused).
 * @returns A promise that resolves to the SVG data URL string.
 */
export async function generateSvgWithColoredBackgroundDataUrl(
	layers: string[],
	backgroundColor: string,
	flipped: boolean = false
): Promise<string> {
	return generateSvgCore(layers, { includeOutlineFilter: true, backgroundColor }, flipped);
}
