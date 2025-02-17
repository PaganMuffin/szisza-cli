

path=$(pwd)
echo $path
bun build --bundle $path/source/cli.tsx --outfile $path/dist/dist.js --target=bun
bun $path/builder/shim_yoga.ts
bun build --compile --minify $path/dist/dist.js --outfile $path/dist/szisza-cli