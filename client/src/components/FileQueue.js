import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatBytes } from '../lib/utils';
import ProgressBar from './ProgressBar';
export default function FileQueue({ items }) {
    if (items.length === 0) {
        return _jsx("p", { className: "text-sm text-zinc-400", children: "No files queued yet." });
    }
    return (_jsx("div", { className: "space-y-3", children: items.map((item) => (_jsxs("div", { className: "rounded-xl border border-zinc-700 bg-zinc-900/70 p-3", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between gap-2", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-sm font-medium text-zinc-100", children: item.name }), _jsx("p", { className: "text-xs text-zinc-400", children: formatBytes(item.size) })] }), _jsx("span", { className: "rounded border border-zinc-700 px-2 py-1 text-xs uppercase text-zinc-300", children: item.status })] }), _jsx(ProgressBar, { progress: item.progress }), _jsxs("div", { className: "mt-2 flex justify-between text-xs text-zinc-400", children: [_jsx("span", { children: item.speed || '0 KB/s' }), _jsxs("span", { children: ["ETA ", item.eta || '00:00'] })] })] }, item.id))) }));
}
