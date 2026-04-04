import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ConnectionBadge from './ConnectionBadge';
import QRDisplay from './QRDisplay';
export default function RoomCard({ roomId, peerCount, connectionState }) {
    async function copyRoom() {
        await navigator.clipboard.writeText(roomId);
    }
    return (_jsxs("section", { className: "grid gap-4 rounded-2xl border border-zinc-700 bg-zinc-900/80 p-4 md:grid-cols-[1fr_auto]", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-zinc-400", children: "Transfer Room" }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-3", children: [_jsx("h2", { className: "text-xl font-semibold text-zinc-100", children: roomId }), _jsx("button", { type: "button", onClick: () => void copyRoom(), className: "rounded-lg border border-violet-500/40 px-3 py-1 text-xs font-medium text-violet-300 hover:bg-violet-500/10", children: "Copy" })] }), _jsxs("div", { className: "mt-4 flex items-center gap-3", children: [_jsx(ConnectionBadge, { state: connectionState }), _jsxs("span", { className: "text-sm text-zinc-300", children: ["Peers: ", peerCount] })] })] }), _jsx(QRDisplay, { roomId: roomId })] }));
}
