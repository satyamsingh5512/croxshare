import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { QRCodeSVG } from 'qrcode.react';
export default function QRDisplay({ roomId }) {
    const value = `http://${window.location.hostname}:5173/?room=${roomId}`;
    return (_jsxs("div", { className: "rounded-xl border border-zinc-700 bg-zinc-900/60 p-4", children: [_jsx("p", { className: "mb-3 text-xs uppercase tracking-wide text-zinc-400", children: "Scan to join" }), _jsx("div", { className: "inline-block rounded-lg bg-white p-2", children: _jsx(QRCodeSVG, { value: value, size: 160 }) }), _jsx("p", { className: "mt-3 break-all text-xs text-zinc-400", children: value })] }));
}
