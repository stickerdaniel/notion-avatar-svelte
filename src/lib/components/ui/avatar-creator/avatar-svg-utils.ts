/**
 * Generates a complete avatar SVG as a base64 encoded data URL.
 * @param layers An array of string paths to individual SVG layer files.
 * @param flipped Whether the avatar should be horizontally flipped (currently unused).
 * @returns A promise that resolves to the SVG data URL string.
 */
export async function generateAvatarSvgDataUrl(
	layers: string[],
	flipped: boolean = false
): Promise<string> {
	const avatarId = `avatar-${Math.random().toString(36).substring(2, 9)}`;

	const svgFilter = `
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
  `;

	try {
		const groupElements = await Promise.all(
			layers.map(async (path, index) => {
				const partMatch = path.match(/([^/]+)\/[^/]+\.svg$/);
				const partType = partMatch ? partMatch[1] : `part-${index}`;

				const response = await fetch(path);
				const svgText = await response.text();

				const contentMatch = svgText.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
				const svgContent = contentMatch ? contentMatch[1] : svgText;

				return `
          <g id="${avatarId}-${partType}" ${partType.includes('face') ? 'fill="#ffffff"' : ''} 
             ${flipped ? 'transform="scale(-1,1) translate(-1080, 0)"' : ''}>
            ${svgContent}
          </g>
        `;
			})
		);

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

		return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(combinedSvg)))}`;
	} catch (error) {
		console.error('Error generating avatar SVG:', error);
		return ''; // Return an empty string or a default placeholder SVG data URL on error
	}
}
