"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
    text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            aria-label="Copy code"
            className="copy-btn"
            onClick={handleCopy}
            type="button"
        >
            {copied
                ? <CheckIcon size={13} />
                : <CopyIcon size={13} />}
        </button>
    );
}
