import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
export default function DropZone({ disabled, onFiles }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    function pushFiles(list) {
        if (!list || list.length === 0)
            return;
        onFiles(Array.from(list));
    }
    return (_jsxs("div", { onDragOver: (event) => {
            event.preventDefault();
            setDragging(true);
        }, onDragLeave: () => setDragging(false), onDrop: (event) => {
            event.preventDefault();
            setDragging(false);
            if (disabled)
                return;
            pushFiles(event.dataTransfer.files);
        }, onClick: () => {
            if (disabled)
                return;
            inputRef.current?.click();
        }, className: `cursor-pointer rounded-2xl border border-dashed p-8 text-center transition ${dragging ? 'border-violet-400 bg-violet-500/10' : 'border-zinc-700 bg-zinc-900/70'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`, children: [_jsx("p", { className: "text-sm font-medium text-zinc-100", children: "Drag and drop files here" }), _jsx("p", { className: "mt-2 text-xs text-zinc-400", children: "or click to browse" }), _jsx("input", { ref: inputRef, type: "file", multiple: true, className: "hidden", disabled: disabled, onChange: (event) => pushFiles(event.target.files) })] }));
}
