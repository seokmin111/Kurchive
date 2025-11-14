module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/Desktop/Kurchive/FE/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Desktop/Kurchive/FE/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

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
"[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/search/result/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SearchResultsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Kurchive/FE/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Kurchive/node_modules/axios/lib/axios.js [app-rsc] (ecmascript)");
;
;
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMyIsImlhdCI6MTc2MzEwMzg0OSwiZXhwIjoxNzYzMTA3NDQ5LCJzY29wZSI6InVzZXIifQ.ag1fPajyEKgv6voFFKfpIrW15k0K7_3MuxIlUwR0Okw";
async function SearchResultsPage({ searchParams }) {
    // 3. 쿼리 파라미터 파싱
    const region = searchParams.region_id || [];
    const minPrice = searchParams.price_min || '0';
    const maxPrice = searchParams.price_max || '0';
    // (API 호출을 위한 baseURL)
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://152.69.228.114:8000';
    let restaurants = [];
    try {
        // 4. 백엔드 API에 쿼리 파라미터를 그대로 전달하여 데이터 요청
        // (백엔드 API가 이 파라미터들을 처리하도록 구현되어 있어야 함)
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].get(`${baseURL}/api/restaurants`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            },
            params: {
                region_id: region,
                price_min: minPrice,
                price_max: maxPrice
            }
        });
        restaurants = response.data;
    } catch (error) {
        console.error("식당 검색 실패:", error);
    // (에러 처리)
    }
    console.log(restaurants);
    // 5. 받아온 데이터로 화면 그리기
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        children: restaurants.length != 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: restaurants[0].name
        }, void 0, false, {
            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/search/result/page.tsx",
            lineNumber: 76,
            columnNumber: 9
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Kurchive$2f$FE$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "실패함 ㅠㅠ (데이터 0개)"
        }, void 0, false, {
            fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/search/result/page.tsx",
            lineNumber: 77,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/search/result/page.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/search/result/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Desktop/Kurchive/FE/src/app/restaurant_archive/search/result/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9f6e1cd5._.js.map