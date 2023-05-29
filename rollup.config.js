const svelte = require("rollup-plugin-svelte")
const {default: resolve} = require("@rollup/plugin-node-resolve")
const commonjs = require("@rollup/plugin-commonjs")
const sveltePreprocess = require("svelte-preprocess")
const postcss = require("rollup-plugin-postcss")

const pkg = require("./package.json")

module.exports = {
	input: pkg.main,
	output: [
		{file: pkg.module, format: "es"}
		// { file: pkg.name, format: "umd", name: "svelte-adminlte" }
	],
	plugins: [
		svelte({
			preprocess: sveltePreprocess()
		}),
		resolve(),
		commonjs(),
		postcss()
	]
}
