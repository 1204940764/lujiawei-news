(() => {
    // Chromium supports displacement maps on the backdrop. Other engines use the CSS glass treatment.
    if (!navigator.userAgentData?.brands.some(({ brand }) => brand === 'Chromium') ||
        !CSS.supports('backdrop-filter', 'url("#glass-lens")') ||
        matchMedia('(prefers-reduced-transparency: reduce)').matches) return;

    const surfaces = document.querySelectorAll('.profile-card, .score-card, .download-section, .cta-box');
    if (!surfaces.length) return;

    const namespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(namespace, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.style.pointerEvents = 'none';
    document.body.append(svg);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    function displacementMap(width, height, radius) {
        const resolution = Math.min(1, 480 / Math.max(width, height));
        const columns = Math.max(1, Math.round(width * resolution));
        const rows = Math.max(1, Math.round(height * resolution));
        canvas.width = columns;
        canvas.height = rows;
        const image = context.createImageData(columns, rows);
        const rim = Math.min(14, height * .26);

        for (let row = 0, index = 0; row < rows; row++) {
            const y = (row + .5) * height / rows - height / 2;
            const edgeY = Math.abs(y) - height / 2 + radius;
            for (let column = 0; column < columns; column++, index += 4) {
                const x = (column + .5) * width / columns - width / 2;
                const edgeX = Math.abs(x) - width / 2 + radius;
                const cornerX = Math.max(0, edgeX);
                const cornerY = Math.max(0, edgeY);
                const diagonal = Math.hypot(cornerX, cornerY);
                const distance = radius - diagonal - Math.min(0, Math.max(edgeX, edgeY));
                const t = Math.max(0, Math.min(1, distance / rim));
                const strength = Math.sin(t * Math.PI) * 110;
                const normalX = diagonal ? cornerX / diagonal : Number(edgeX >= edgeY);
                const normalY = diagonal ? cornerY / diagonal : Number(edgeY > edgeX);
                image.data[index] = 128 - Math.sign(x) * normalX * strength;
                image.data[index + 1] = 128 - Math.sign(y) * normalY * strength;
                image.data[index + 2] = 128;
                image.data[index + 3] = 255;
            }
        }
        context.putImageData(image, 0, 0);
        return canvas.toDataURL('image/png');
    }

    const maps = new Map();
    const observer = new ResizeObserver(entries => {
        for (const { target } of entries) {
            const width = target.offsetWidth;
            const height = target.offsetHeight;
            if (!width || !height) continue;
            const radius = Math.min(parseFloat(getComputedStyle(target).borderTopLeftRadius), width / 2, height / 2);
            maps.get(target).setAttribute('href', displacementMap(width, height, radius));
        }
    });

    surfaces.forEach((surface, index) => {
        const id = 'glass-lens-' + index;
        const filter = document.createElementNS(namespace, 'filter');
        filter.id = id;
        filter.setAttribute('x', '0');
        filter.setAttribute('y', '0');
        filter.setAttribute('width', '1');
        filter.setAttribute('height', '1');
        filter.setAttribute('color-interpolation-filters', 'sRGB');
        const map = document.createElementNS(namespace, 'feImage');
        map.setAttribute('preserveAspectRatio', 'none');
        map.setAttribute('result', 'rim-map');
        const warp = document.createElementNS(namespace, 'feDisplacementMap');
        warp.setAttribute('in', 'SourceGraphic');
        warp.setAttribute('in2', 'rim-map');
        warp.setAttribute('scale', '28');
        warp.setAttribute('xChannelSelector', 'R');
        warp.setAttribute('yChannelSelector', 'G');
        filter.append(map, warp);
        svg.append(filter);
        maps.set(surface, map);
        surface.style.setProperty('--glass-lens', 'url("#' + id + '")');
        observer.observe(surface);
    });
})();
