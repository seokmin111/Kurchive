module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "back_btn": "page-module__uKAcpG__back_btn",
  "button_wrapper": "page-module__uKAcpG__button_wrapper",
  "footer": "page-module__uKAcpG__footer",
  "input_box": "page-module__uKAcpG__input_box",
  "nomrg": "page-module__uKAcpG__nomrg",
  "recipe_container": "page-module__uKAcpG__recipe_container",
  "recipe_contentCarrier": "page-module__uKAcpG__recipe_contentCarrier",
  "recipe_date": "page-module__uKAcpG__recipe_date",
  "recipe_descriptionContainer": "page-module__uKAcpG__recipe_descriptionContainer",
  "recipe_icon": "page-module__uKAcpG__recipe_icon",
  "recipe_item": "page-module__uKAcpG__recipe_item",
  "recipe_reviewer": "page-module__uKAcpG__recipe_reviewer",
  "recipe_text": "page-module__uKAcpG__recipe_text",
  "recipe_title": "page-module__uKAcpG__recipe_title",
  "red_btn": "page-module__uKAcpG__red_btn",
  "search_btn": "page-module__uKAcpG__search_btn",
  "search_container": "page-module__uKAcpG__search_container",
  "sub_title": "page-module__uKAcpG__sub_title",
  "title": "page-module__uKAcpG__title",
});
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MainPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Kurchive/FE/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.module.css [app-ssr] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Kurchive/FE/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Kurchive/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Kurchive/FE/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function MainPage() {
    const getRestaurants = ()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get("http://138.2.124.34:8000/api/restaurants").then((res)=>{
            console.log(res.data);
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        getRestaurants();
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].nomrg,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].header,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 23,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].title,
                        style: {
                            display: 'inline'
                        },
                        children: "커카이브"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 24,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sub_title,
                        style: {
                            display: 'inline'
                        },
                        children: "우리만의 미식 지도"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 25,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                lineNumber: 22,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].search_container,
                    action: "#",
                    method: "get",
                    children: [
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input_box,
                            placeholder: "식당 정보를 입력해주세요"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                            lineNumber: 30,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].search_btn
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                            lineNumber: 31,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                    lineNumber: 29,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                lineNumber: 28,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].button_wrapper,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "../",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].back_btn,
                            children: [
                                "<",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 37,
                                    columnNumber: 61
                                }, this),
                                "메인화면으로 ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 37,
                                    columnNumber: 74
                                }, this),
                                " 돌아가기"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                            lineNumber: 37,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 36,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/restaurant_archive/archiving",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].red_btn,
                            children: "식당 아카이빙"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                            lineNumber: 41,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 40,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                lineNumber: 35,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_container,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_item,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_contentCarrier,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_title,
                                    children: "음식 이름"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 48,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_text,
                                    children: "뭔가 내용이 들어갈듯"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 49,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_descriptionContainer,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_icon
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 51,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_underContainer,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_reviewer,
                                                    children: "reviewer name"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 53,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_date,
                                                    children: "Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 54,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 52,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 50,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                            lineNumber: 47,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 46,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_item,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_contentCarrier,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_title,
                                    children: "음식 이름"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 61,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_text,
                                    children: "뭔가 내용이 들어갈듯"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 62,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_descriptionContainer,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_icon
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 64,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_underContainer,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_reviewer,
                                                    children: "reviewer name"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 66,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_date,
                                                    children: "Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 67,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 65,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 63,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                            lineNumber: 60,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 59,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_item,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_contentCarrier,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_title,
                                    children: "음식 이름"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 74,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_text,
                                    children: "뭔가 내용이 들어갈듯"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 75,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_descriptionContainer,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_icon
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 77,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_underContainer,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_reviewer,
                                                    children: "reviewer name"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 79,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_date,
                                                    children: "Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 80,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 78,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 76,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                            lineNumber: 73,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 72,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_item,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_contentCarrier,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_title,
                                    children: "음식 이름"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 87,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_text,
                                    children: "뭔가 내용이 들어갈듯"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 88,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_descriptionContainer,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_icon
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 90,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_underContainer,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_reviewer,
                                                    children: "reviewer name"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 92,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_date,
                                                    children: "Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 93,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 91,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 89,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                            lineNumber: 86,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 85,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_item,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_contentCarrier,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_title,
                                    children: "음식 이름"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 100,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_text,
                                    children: "뭔가 내용이 들어갈듯"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 101,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_descriptionContainer,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_icon
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 103,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_underContainer,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_reviewer,
                                                    children: "reviewer name"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 105,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_date,
                                                    children: "Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 106,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 104,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 102,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                            lineNumber: 99,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 98,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_item,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_contentCarrier,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_title,
                                    children: "음식 이름"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 113,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_text,
                                    children: "뭔가 내용이 들어갈듯"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 114,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_descriptionContainer,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_icon
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 116,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_underContainer,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_reviewer,
                                                    children: "reviewer name"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 118,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_date,
                                                    children: "Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 119,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 117,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 115,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                            lineNumber: 112,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 111,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_item,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_contentCarrier,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_title,
                                    children: "음식 이름"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 126,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_text,
                                    children: "뭔가 내용이 들어갈듯"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 127,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_descriptionContainer,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_icon
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 129,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_underContainer,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_reviewer,
                                                    children: "reviewer name"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 131,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_date,
                                                    children: "Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 132,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 130,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 128,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                            lineNumber: 125,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 124,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_item,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_contentCarrier,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_title,
                                    children: "음식 이름"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 139,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_text,
                                    children: "뭔가 내용이 들어갈듯"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 140,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_descriptionContainer,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_icon
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 142,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_underContainer,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_reviewer,
                                                    children: "reviewer name"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 144,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_date,
                                                    children: "Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 145,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 143,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 141,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                            lineNumber: 138,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 137,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_item,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_contentCarrier,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_title,
                                    children: "음식 이름"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 152,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_text,
                                    children: "뭔가 내용이 들어갈듯"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 153,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_descriptionContainer,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_icon
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 155,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_underContainer,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_reviewer,
                                                    children: "reviewer name"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 157,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_date,
                                                    children: "Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 158,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 156,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 154,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                            lineNumber: 151,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 150,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_item,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_contentCarrier,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_title,
                                    children: "음식 이름"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 165,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_text,
                                    children: "뭔가 내용이 들어갈듯"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 166,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_descriptionContainer,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_icon
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 168,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_underContainer,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_reviewer,
                                                    children: "reviewer name"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 170,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].recipe_date,
                                                    children: "Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                                    lineNumber: 171,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                            lineNumber: 169,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                                    lineNumber: 167,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                            lineNumber: 164,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                        lineNumber: 163,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                lineNumber: 45,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$src$2f$app$2f$restaurant_archive$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].footer
            }, void 0, false, {
                fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
                lineNumber: 179,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/page.tsx",
        lineNumber: 21,
        columnNumber: 9
    }, this);
} //const data:[] = 
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3f391f16._.js.map