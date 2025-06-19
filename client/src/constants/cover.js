const coverModules = import.meta.glob('../assets/covers/*.{png,jpg,jpeg,webp,svg}', { eager: true });

const covers = {};
for (const path in coverModules) {
    const mod = coverModules[path];
    const fileName = path.split('/').pop();
    covers[fileName] = mod.default;
}

export default covers;