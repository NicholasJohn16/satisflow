import { useRef, useEffect } from "react";

export default function DefaultNode() {
    const renderCount = useRef(0);

    useEffect(() => {
        renderCount.current++;
    });

    return (
        <div>
            {renderCount.current}
        </div>
    )
}