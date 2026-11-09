/**
 * Options for generating SVG avatars
 */
export interface SvgGenerationOptions {
	/** Draws a white outline OUTLINE_WIDTH units wide around the whole avatar. */
	includeOutlineFilter?: boolean;
	backgroundColor?: string | null;
}

// An SVG document: optional XML declaration, comments and doctype, then a root <svg> element
const SVG_DOCUMENT =
	/^\s*(?:<\?xml[\s\S]*?\?>\s*)?(?:<!--[\s\S]*?-->\s*)*(?:<!DOCTYPE[^>]*>\s*)?<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/i;

// The outline reaches this far beyond every drawn shape, in units of the 1080 × 1080 viewBox.
const OUTLINE_WIDTH = 20;
const SHAPES = 'path, circle, ellipse, line, polygon, polyline, rect';
// Metadata, and masked details that only draw inside another shape of the layer.
const NOT_OUTLINED = 'title, desc, defs, mask, [mask]';

// A presentation property as the composed avatar resolves it: the style attribute wins over the
// attribute, and an unset property inherits from the ancestors. The layer's root <svg> is not
// part of the composed avatar, so its attributes do not count.
function resolveProperty(element: Element, property: string, fallback: string): string {
	for (let node: Element | null = element; node?.parentElement; node = node.parentElement) {
		const value =
			(node instanceof SVGElement && node.style.getPropertyValue(property)) ||
			node.getAttribute(property);
		if (value) return value.trim();
	}
	return fallback;
}

/**
 * Returns a layer's drawing as white shapes grown by OUTLINE_WIDTH on every side: each shape
 * keeps its fill area and gets a round stroke 2 × OUTLINE_WIDTH wider than its own stroke.
 * Drawn beneath all layers, these copies form the avatar's outline. Unlike an SVG filter, they
 * are vector paths, so they stay sharp at any pixel density, including in WebKit.
 */
function outlineMarkup(svgText: string): string {
	const root = new DOMParser().parseFromString(svgText, 'image/svg+xml').documentElement;
	root.querySelectorAll(NOT_OUTLINED).forEach((element) => element.remove());

	for (const shape of root.querySelectorAll(SHAPES)) {
		// Layers are drawn inside a group with a white fill, so an unset fill is visible.
		const filled = resolveProperty(shape, 'fill', '#ffffff') !== 'none';
		const stroked = resolveProperty(shape, 'stroke', 'none') !== 'none';
		if (!filled && !stroked) {
			shape.remove();
			continue;
		}
		const strokeWidth = stroked ? parseFloat(resolveProperty(shape, 'stroke-width', '1')) : 0;
		shape.removeAttribute('style');
		shape.setAttribute('fill', filled ? '#ffffff' : 'none');
		shape.setAttribute('stroke', '#ffffff');
		shape.setAttribute('stroke-width', String(strokeWidth + 2 * OUTLINE_WIDTH));
		shape.setAttribute('stroke-linejoin', 'round');
		shape.setAttribute('stroke-linecap', 'round');
	}
	root.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
	return root.innerHTML;
}

/**
 * Core function that generates SVG based on provided options.
 * @param layers An array of string paths to individual SVG layer files.
 * @param options Configuration options for SVG generation
 * @param flipped Whether the avatar should be horizontally flipped
 * @returns A promise that resolves to the SVG data URL string. It rejects when a layer fails to
 * load or is not an SVG document, so callers never receive a partial avatar.
 */
async function generateSvgCore(
	layers: string[],
	options: SvgGenerationOptions = {},
	flipped: boolean = false
): Promise<string> {
	const { includeOutlineFilter = false, backgroundColor = null } = options;
	const avatarId = `avatar-${Math.random().toString(36).substring(2, 9)}`;
	const flipTransform = flipped ? 'transform="scale(-1,1) translate(-1080, 0)"' : '';

	const layerElements = await Promise.all(
		layers.map(async (path, index) => {
			const partMatch = path.match(/([^/]+)\/[^/]+\.svg$/);
			const partType = partMatch ? partMatch[1] : `part-${index}`;

			const response = await fetch(path);
			if (!response.ok) {
				throw new Error(`Avatar layer ${partType} failed to load: HTTP ${response.status}`);
			}
			const svgText = await response.text();

			// The document root must be <svg> (after an optional prolog), so an HTML page that merely
			// contains SVG markup is rejected. Keep only the drawing inside that root element.
			const contentMatch = svgText.match(SVG_DOCUMENT);
			if (!contentMatch) {
				throw new Error(`Avatar layer ${partType} is not an SVG document`);
			}

			return {
				drawing: `
          <g id="${avatarId}-${partType}" fill="#ffffff" ${flipTransform}>
            ${contentMatch[1]}
          </g>
        `,
				outline: includeOutlineFilter ? `<g ${flipTransform}>${outlineMarkup(svgText)}</g>` : ''
			};
		})
	);

	// Build SVG structure based on options
	const svgContent = `
      <svg viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
        ${backgroundColor ? `<rect width="1080" height="1080" fill="${backgroundColor}" />` : ''}
        <g id="${avatarId}-avatar">
          ${includeOutlineFilter ? `<g id="${avatarId}-outline">${layerElements.map((layer) => layer.outline).join('\n')}</g>` : ''}
          ${layerElements.map((layer) => layer.drawing).join('\n')}
        </g>
      </svg>
    `;

	return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
}

/**
 * Generates a complete avatar SVG as a base64 encoded data URL.
 * Includes the outline but no background.
 * @param layers An array of string paths to individual SVG layer files.
 * @param flipped Whether the avatar should be horizontally flipped (currently unused).
 * @returns A promise that resolves to the SVG data URL string and rejects if a layer fails.
 */
export async function generateSvgDataUrl(
	layers: string[],
	flipped: boolean = false
): Promise<string> {
	return generateSvgCore(layers, { includeOutlineFilter: true }, flipped);
}

/**
 * Generates a complete avatar SVG without the outline as a base64 encoded data URL.
 * Transparent background, no outline.
 * @param layers An array of string paths to individual SVG layer files.
 * @param flipped Whether the avatar should be horizontally flipped (currently unused).
 * @returns A promise that resolves to the SVG data URL string and rejects if a layer fails.
 */
export async function generateSvgWithoutOutlineDataUrl(
	layers: string[],
	flipped: boolean = false
): Promise<string> {
	return generateSvgCore(layers, { includeOutlineFilter: false }, flipped);
}

/**
 * Generates a complete avatar SVG with transparent background and the outline.
 * @param layers An array of string paths to individual SVG layer files.
 * @param flipped Whether the avatar should be horizontally flipped (currently unused).
 * @returns A promise that resolves to the SVG data URL string and rejects if a layer fails.
 */
export async function generateSvgWithOutlineDataUrl(
	layers: string[],
	flipped: boolean = false
): Promise<string> {
	return generateSvgCore(layers, { includeOutlineFilter: true }, flipped);
}

/**
 * Generates a complete avatar SVG with colored background as a base64 encoded data URL.
 * Includes the outline.
 * @param layers An array of string paths to individual SVG layer files.
 * @param backgroundColor The background color to use (hex format).
 * @param flipped Whether the avatar should be horizontally flipped (currently unused).
 * @returns A promise that resolves to the SVG data URL string and rejects if a layer fails.
 */
export async function generateSvgWithColoredBackgroundDataUrl(
	layers: string[],
	backgroundColor: string,
	flipped: boolean = false
): Promise<string> {
	return generateSvgCore(layers, { includeOutlineFilter: true, backgroundColor }, flipped);
}
