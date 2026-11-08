(() => {
    const canvas = document.getElementById('particles');
    const context = canvas?.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const shapes = [
        {
            // Five broad lobes.
            edge: 'M 0 35 L -4 14 -16 18 -34 4 -26 1 -30 -12 -17 -7 -11 -12 -15 -25 -6 -22 0 -37 7 -22 16 -26 12 -11 18 -7 32 -13 28 1 36 4 17 19 5 14 2 35 Z',
            veins: 'M 0 23 Q 1 0 0 -31 M 0 10 L -24 -6 M 0 10 L 26 -7 M 0 1 L -10 -19 M 1 1 L 11 -19'
        },
        {
            // Narrow, deeply divided lobes.
            edge: 'M -1 36 L -3 15 -16 20 -30 15 -24 10 -39 -3 -30 -3 -35 -15 -19 -8 -12 1 -18 -15 -24 -24 -13 -21 -11 -32 -4 -19 0 -39 5 -23 11 -28 10 -15 6 1 16 -12 31 -21 29 -10 37 -9 23 2 16 10 33 8 28 17 13 20 4 15 1 36 Z',
            veins: 'M 0 25 Q 2 0 0 -34 M 0 12 L -30 -8 M 1 13 L 27 -14 M 1 10 L -15 -22 M 1 14 L 25 13'
        },
        {
            // Three pointed lobes with serrated shoulders.
            edge: 'M 0 35 L -4 16 -13 20 -23 14 -30 8 -27 4 -36 -7 -28 -5 -32 -18 -20 -12 -18 -17 -12 -8 -10 -21 -5 -19 -3 -30 2 -26 6 -38 12 -23 10 -19 16 -15 12 -7 21 -13 22 -8 34 -15 30 -5 38 -5 29 6 31 10 17 19 5 15 2 35 Z',
            veins: 'M 0 25 Q 0 1 6 -31 M 0 12 L -27 -12 M 0 12 L 30 -9 M 1 5 L -7 -17'
        }
    ];
    const palettes = [
        ['#a36616', '#784108', '#4b270c'],
        ['#9e4820', '#773016', '#431b11'],
        ['#a5312e', '#741b23', '#430e19']
    ];

    function makeSprite(shape, palette) {
        const sprite = document.createElement('canvas');
        sprite.width = sprite.height = 84;
        const brush = sprite.getContext('2d');
        brush.translate(42, 42);
        const gradient = brush.createLinearGradient(-30, -32, 26, 35);
        gradient.addColorStop(0, palette[0]);
        gradient.addColorStop(.64, palette[1]);
        gradient.addColorStop(1, palette[2]);
        const edge = new Path2D(shape.edge);
        brush.fillStyle = gradient;
        brush.fill(edge);
        brush.strokeStyle = palette[2];
        brush.lineJoin = 'round';
        brush.lineCap = 'round';
        brush.lineWidth = 1.25;
        brush.stroke(edge);
        brush.stroke(new Path2D(shape.veins));
        return sprite;
    }

    const sprites = shapes.map(shape => palettes.map(palette => makeSprite(shape, palette))).flat();
    const random = (min, max) => min + Math.random() * (max - min);
    const storageKey = 'study-site:autumn-leaves:v1';
    const maxLeaves = 36;
    const tau = Math.PI * 2;
    let width = 0;
    let height = 0;
    let leaves = [];
    let frame = 0;
    let previousTime;
    let windTime = random(0, 30);

    function createLeaf(y, x = random(-35, width + 35), sprite = Math.floor(Math.random() * sprites.length)) {
        const depth = random(0, 1);
        return {
            x, y, sprite,
            size: random(15, 22) + depth * 26,
            speed: random(16, 27) + depth * 28,
            drift: random(-7, 12),
            sway: random(9, 30) + depth * 12,
            rate: random(.75, 1.55),
            roll: random(-.45, .45),
            angle: random(0, tau),
            phase: random(0, tau),
            flip: random(0, tau),
            age: 0
        };
    }

    function resize() {
        const bounds = canvas.getBoundingClientRect();
        const newWidth = bounds.width;
        const newHeight = bounds.height;
        if (!newWidth || !newHeight) return;

        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(newWidth * ratio);
        canvas.height = Math.round(newHeight * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        if (width && height) {
            leaves.forEach(leaf => {
                leaf.x *= newWidth / width;
                leaf.y *= newHeight / height;
            });
        }
        width = newWidth;
        height = newHeight;

        const count = Math.round(Math.max(14, Math.min(maxLeaves, width * height / 37000)));
        leaves.length = Math.min(leaves.length, count);
        while (leaves.length < count) {
            const index = leaves.length;
            leaves.push(createLeaf(
                random(height * index / count, height * (index + 1) / count),
                random(-10, width + 10),
                (index % shapes.length) * palettes.length + Math.floor(index / shapes.length) % palettes.length
            ));
        }
    }

    function animate(now) {
        const dt = previousTime === undefined ? 0 : Math.min((now - previousTime) / 1000, .045);
        previousTime = now;
        windTime += dt;
        // Continuous waves keep gusts smooth across frame rates.
        const wind = 9 + 8 * Math.sin(windTime * .31) + 4 * Math.sin(windTime * .73);
        context.clearRect(0, 0, width, height);

        leaves.forEach((leaf, index) => {
            leaf.age += dt;
            const phase = leaf.phase + leaf.age * leaf.rate;
            leaf.x += (leaf.drift + wind + Math.cos(phase) * leaf.sway * leaf.rate) * dt;
            leaf.y += leaf.speed * (1 + .27 * Math.sin(phase * 1.12)) * dt;

            if (leaf.y > height + 55 || leaf.x > width + 100 || leaf.x < -100) {
                leaves[index] = createLeaf(random(-135, -45));
                return;
            }

            const tilt = Math.sin(leaf.flip + leaf.age * leaf.rate * 1.4);
            const yaw = Math.cos(leaf.flip + leaf.age * leaf.rate * 1.1);
            context.save();
            context.translate(leaf.x, leaf.y);
            context.rotate(leaf.angle + leaf.age * leaf.roll + .37 * Math.sin(phase));
            context.scale(.19 + .81 * Math.abs(tilt), .87 + .13 * yaw);
            const half = leaf.size / 2;
            context.drawImage(sprites[leaf.sprite], -half, -half, leaf.size, leaf.size);
            context.restore();
        });

        frame = requestAnimationFrame(animate);
    }

    function stopMotion() {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = undefined;
    }

    function saveState() {
        if (!leaves.length) return;
        try {
            sessionStorage.setItem(storageKey, JSON.stringify({ width, height, windTime, leaves }));
        } catch {
            // Animation still works when browser storage is unavailable.
        }
    }

    function restoreState() {
        try {
            const saved = JSON.parse(sessionStorage.getItem(storageKey));
            if (!saved || !Number.isFinite(saved.width) || saved.width <= 0 ||
                !Number.isFinite(saved.height) || saved.height <= 0 || !Number.isFinite(saved.windTime) ||
                !Array.isArray(saved.leaves) || saved.leaves.length > maxLeaves ||
                !saved.leaves.every(leaf => leaf && Number.isInteger(leaf.sprite) && sprites[leaf.sprite])) return;
            ({ width, height, windTime, leaves } = saved);
        } catch {
            // A new field is generated if the saved state cannot be read.
        }
    }

    function syncMotion() {
        if (reducedMotion.matches || document.hidden) {
            stopMotion();
            if (reducedMotion.matches) context.clearRect(0, 0, width, height);
        } else if (!frame) {
            resize();
            frame = requestAnimationFrame(animate);
        }
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pagehide', () => {
        stopMotion();
        saveState();
    });
    window.addEventListener('pageshow', event => {
        if (event.persisted) {
            stopMotion();
            restoreState();
            syncMotion();
        }
    });
    document.addEventListener('visibilitychange', syncMotion);
    reducedMotion.addEventListener('change', syncMotion);
    restoreState();
    syncMotion();
})();
