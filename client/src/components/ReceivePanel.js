import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import FileQueue from './FileQueue';
export default function ReceivePanel({ items }) {
    if (items.length === 0) {
        return (_jsx("div", { className: "rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6 text-sm text-zinc-400", children: "Waiting for files..." }));
    }
    return (_jsxs("div", { children: [_jsx("p", { className: "mb-3 text-sm font-semibold text-zinc-100", children: "Received This Session" }), _jsx(FileQueue, { items: items })] }));
}
