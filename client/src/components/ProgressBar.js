import { jsx as _jsx } from "react/jsx-runtime";
export default function ProgressBar({ progress }) {
    return (_jsx("div", { className: "h-2 w-full overflow-hidden rounded bg-zinc-800", children: _jsx("div", { className: "h-full rounded bg-violet-500 transition-all duration-200 ease-out", style: { width: `${Math.max(0, Math.min(100, progress))}%` } }) }));
}
