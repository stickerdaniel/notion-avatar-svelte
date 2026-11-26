export interface SvgGenerationOptions {
	includeOutlineFilter?: boolean;
	backgroundColor?: string | null;
}

const SVG_DOCUMENT =
	/^\s*(?:<\?xml[\s\S]*?\?>\s*)?(?:<!--[\s\S]*?-->\s*)*(?:<!DOCTYPE[^>]*>\s*)?<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/i;

const OUTLINE_WIDTH = 20;
const SHAPES = 'path, circle, ellipse, line, polygon, polyline, rect';
const NOT_OUTLINED = 'title, desc, defs, mask, [mask]';

function resolveProperty(element: Element, property: string, fallback: string): string {
	for (let node: Element | null = element; node?.parentElement; node = node.parentElement) {
		const value =
			(node instanceof SVGElement && node.style.getPropertyValue(property)) ||
			node.getAttribute(property);
		if (value) return value.trim();
	}
	return fallback;
}

function outlineMarkup(svgText: string): string {
	const root = new DOMParser().parseFromString(svgText, 'image/svg+xml').documentElement;
	root.querySelectorAll(NOT_OUTLINED).forEach((element) => element.remove());

	for (const shape of root.querySelectorAll(SHAPES)) {
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

export async function generateSvgDataUrl(
	layers: string[],
	flipped: boolean = false
): Promise<string> {
	return generateSvgCore(layers, { includeOutlineFilter: true }, flipped);
}

export async function generateSvgWithoutOutlineDataUrl(
	layers: string[],
	flipped: boolean = false
): Promise<string> {
	return generateSvgCore(layers, { includeOutlineFilter: false }, flipped);
}

export async function generateSvgWithOutlineDataUrl(
	layers: string[],
	flipped: boolean = false
): Promise<string> {
	return generateSvgCore(layers, { includeOutlineFilter: true }, flipped);
}

export async function generateSvgWithColoredBackgroundDataUrl(
	layers: string[],
	backgroundColor: string,
	flipped: boolean = false
): Promise<string> {
	return generateSvgCore(layers, { includeOutlineFilter: true, backgroundColor }, flipped);
}
