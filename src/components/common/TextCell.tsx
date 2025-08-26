import { Tooltip } from "antd";
import { CSSProperties, useEffect, useRef, useState } from "react";



export const TextCell = ({ text, clamp = 1, style }: { text: string, clamp?: number, style?: CSSProperties  }) => {
    const textRef = useRef<HTMLParagraphElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useEffect(() => {
        const el = textRef.current;
        if(el) {
            setIsTruncated(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight);
        }
    }, [text]);

    const textElement = (
        <p ref={textRef} style={{margin: 0, ...style}} className={`line-clamp line-clamp-${clamp}`}>
            {text}
        </p>
    );

    return isTruncated ? (
        <Tooltip title={text} placement="top">
            {textElement}
        </Tooltip>    
    ) : (
        textElement
    );
}