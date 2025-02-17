const currDir = import.meta.dir;
const filepath = `${currDir}/../dist/dist.js`;
const bin = Bun.file(filepath);
let content = await new Response(bin).text();
const pattern =
	/var Yoga = await initYoga\(await E\(_\(import\.meta\.url\)\.resolve\("\.\/yoga\.wasm"\)\)\);/g;
const replacement = `import initYogaAsm from 'yoga-wasm-web/asm'; const Yoga = initYogaAsm();`;
content = content.replace(pattern, replacement);
await Bun.write(filepath, content);
