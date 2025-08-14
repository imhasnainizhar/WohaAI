module.exports = {

"[project]/src/components/functional-comps/textareaa.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>TextArea)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$provider$2f$ThemeProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/provider/ThemeProvider.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function TextArea() {
    const textArea = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const container = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { theme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$provider$2f$ThemeProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const darkTheme = theme === "dark";
    const [height, setHeight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(40);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const ta = textArea.current;
        const parent = container.current;
        if (!ta || !parent) return;
        const lineHeight = 24;
        const maxHeight = lineHeight * 6;
        const handleInput = ()=>{
            ta.style.height = "auto";
            const newHeight = Math.min(ta.scrollHeight, maxHeight);
            ta.style.height = `${newHeight}px`;
            ta.style.overflowY = ta.scrollHeight > maxHeight ? "scroll" : "hidden";
            setHeight(newHeight);
        };
        ta.addEventListener("input", handleInput);
        handleInput();
        return ()=>ta.removeEventListener("input", handleInput);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: container,
        style: {
            minHeight: `${height + 60}px`,
            transition: "min-height 0.2s ease, max-height 0.2s ease"
        },
        className: `flex flex-col justify-between gap-3.5 p-2 pb-1 rounded-[25px] w-full relative border border-solid border-gray-dark ${darkTheme ? "bg-dark-black-secondary" : "bg-light-white-secondary"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                ref: textArea,
                placeholder: "How Can We Help You?",
                className: `w-full max-w-[700px] min-w-[280px] resize-none text-left text-[15px] font-montserrat-sans pl-[5px] whitespace-pre-wrap break-words leading-[24px] focus:outline-none rounded-md p-2 pb-[4px] touch-auto [webkit-overflow-scrolling:touch] ${darkTheme ? "bg-dark-secondary text-dark-white-primary" : "bg-light-secondary text-light-black-primary"}`,
                style: {
                    minHeight: "40px",
                    maxHeight: "144px",
                    overflowY: "auto"
                }
            }, void 0, false, {
                fileName: "[project]/src/components/functional-comps/textareaa.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute bottom-[50px] left-0 w-full h-[50px] pointer-events-none z-0 ${darkTheme ? "bg-gradient-to-t from-dark-black-secondary/90 to-transparent" : "bg-gradient-to-t from-light-white-secondary/90 to-transparent"}`
            }, void 0, false, {
                fileName: "[project]/src/components/functional-comps/textareaa.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative flex items-center justify-between z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-3 items-center justify-start",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `border border-solid border-gray-dark rounded-[90px] w-[80px] h-[35px] flex items-center justify-center cursor-pointer ${darkTheme ? "text-dark-white-primary" : "text-light-black-primary"}`,
                                children: "Tools"
                            }, void 0, false, {
                                fileName: "[project]/src/components/functional-comps/textareaa.tsx",
                                lineNumber: 74,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `border border-solid border-gray-dark rounded-full flex items-center justify-center cursor-pointer w-[35px] h-[35px] ${darkTheme ? "text-dark-white-primary" : "text-light-black-primary"}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                    className: "bx bx-plus",
                                    style: {
                                        color: darkTheme ? "#ffffff" : "#000000",
                                        fontSize: "24px"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/functional-comps/textareaa.tsx",
                                    lineNumber: 90,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/functional-comps/textareaa.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/functional-comps/textareaa.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `border border-solid border-gray-dark rounded-full flex items-center justify-center cursor-pointer w-[35px] h-[35px] ${darkTheme ? "text-dark-white-primary" : "text-light-black-primary"}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            src: "/icons/arrow-up-stroke.png",
                            alt: "Submit",
                            width: 30,
                            height: 30
                        }, void 0, false, {
                            fileName: "[project]/src/components/functional-comps/textareaa.tsx",
                            lineNumber: 104,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/functional-comps/textareaa.tsx",
                        lineNumber: 99,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/functional-comps/textareaa.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/functional-comps/textareaa.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
}}),

};

//# sourceMappingURL=src_components_functional-comps_textareaa_tsx_d8521075._.js.map