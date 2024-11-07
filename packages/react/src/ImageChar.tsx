import React from "react";
import { Utility } from "@hpcc-js/common";

interface ImageChar {
    x?: number;
    y?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    fontFamily?: string;
    char?: string;
    yOffset?: number;
    fontWeight?: number;
}

export const ImageChar: React.FunctionComponent<ImageChar> = ({
    x,
    y = 0,
    height = 12,
    fill,
    stroke,
    fontFamily = "FontAwesome",
    char = "",
    fontWeight
}) => {

    const renderChar = React.useMemo(() => {
        return fontFamily === "FontAwesome" ? Utility.faChar(char) : char;
    }, [char, fontFamily]);

    return <text
        x={x}
        y={y}
        fill={fill}
        stroke={stroke}
        fontFamily={fontFamily}
        fontSize={`${height}px`}
        fontWeight={fontWeight}
        dominantBaseline="middle"
        style={{ textAnchor: "middle", alignmentBaseline: "middle" }}
    >{renderChar}</text>;
};
