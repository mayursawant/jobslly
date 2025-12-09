module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/frontend-nextjs/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "chunks/f11fe_39c7c20e._.js",
  "chunks/[root-of-the-server]__b7c4fc9e._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/frontend-nextjs/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];