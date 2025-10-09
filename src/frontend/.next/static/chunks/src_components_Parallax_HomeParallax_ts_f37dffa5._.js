(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/components/Parallax/HomeParallax.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>HomeParallax)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
function HomeParallax() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomeParallax.useEffect": ()=>{
            const handleScroll = {
                "HomeParallax.useEffect.handleScroll": ()=>{
                    const layers = document.querySelectorAll('.parallax-layer');
                    layers.forEach({
                        "HomeParallax.useEffect.handleScroll": (layer)=>{
                            const speed = parseFloat(layer.dataset.speed || '0');
                            layer.style.transform = `translateY(${window.scrollY * speed}px)`;
                        }
                    }["HomeParallax.useEffect.handleScroll"]);
                }
            }["HomeParallax.useEffect.handleScroll"];
            window.addEventListener('scroll', handleScroll);
            return ({
                "HomeParallax.useEffect": ()=>window.removeEventListener('scroll', handleScroll)
            })["HomeParallax.useEffect"];
        }
    }["HomeParallax.useEffect"], []);
    return null;
}
_s(HomeParallax, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = HomeParallax;
var _c;
__turbopack_context__.k.register(_c, "HomeParallax");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_components_Parallax_HomeParallax_ts_f37dffa5._.js.map