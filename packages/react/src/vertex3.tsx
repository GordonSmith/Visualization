import { Utility } from "@hpcc-js/common";
import * as React from "@hpcc-js/preact-shim";
import { Icon } from "./icon";
import { TextBox } from "./text";
import { Annotations, VertexProps } from "./vertex";

export interface Vertex3Props extends VertexProps {
    textboxStrokeWidth?: number;
    cornerRadius?: number;
    subText?: TextBox;
    noLabelRadius?: number;
}

export const Vertex3: React.FunctionComponent<Vertex3Props> = ({
    categoryID = "",
    text = "",
    textHeight = 10,
    textPadding = 4,
    icon = {},
    annotationsHeight = 12,
    annotationIDs = [],
    textFill = "#287EC4",
    textboxFill = "white",
    textboxStroke = "#CCCCCC",
    textboxStrokeWidth = 1,
    textFontFamily = "Verdana",
    cornerRadius = 3,
    subText = {},
    showLabel = true,
    noLabelRadius = 5

}) => {
    icon = {
        height: 50,
        imageChar: "?",
        imageFontFamily: "FontAwesome",
        imageCharFill: "#555555",
        fill: "transparent",
        strokeWidth: 0,
        ...icon
    };
    subText = {
        text: "",
        fill: "white",
        textFill: "#555555",
        ...subText
    };
    let fullAnnotationWidth = 0;

    const annoOffsetY = 0;

    const labelWidth = Utility.textSize(text, textFontFamily, textHeight, false).width;
    let labelShapeWidth = 0;
    if (text !== "") {
        labelShapeWidth = labelWidth + (textPadding * 2) + (textboxStrokeWidth * 2)
    }
    fullAnnotationWidth += labelShapeWidth;
    const textOffsetX = fullAnnotationWidth - (labelShapeWidth / 2);

    const textShapeHeight = textHeight + (textPadding * 2) + (textboxStrokeWidth * 2);
    const textElement = <g transform={`translate(${textOffsetX} ${annoOffsetY})`}>
        {!showLabel || text === "" ?
            <circle
                r={noLabelRadius}
                stroke={textboxStroke}
                fill={textFill}
            /> :
            <>
                <TextBox
                    text={text}
                    height={textHeight}
                    padding={textPadding}
                    strokeWidth={textboxStrokeWidth}
                    stroke={textboxStroke}
                    fill={textboxFill}
                    textFill={textFill}
                    fontFamily={textFontFamily}
                    cornerRadius={cornerRadius}
                />
                <Annotations x={labelWidth / 2} y={textHeight} annotationIDs={annotationIDs} />
            </>
        }
    </g>;
    const iconHeight = icon.height || 20;
    const iconStrokeWidth = icon.strokeWidth || 0;
    const iconOffsetX = 0;
    let iconOffsetY = 0;

    const subTextOffsetX = 0;
    let subTextOffsetY = textShapeHeight;

    if (text !== "") {
        iconOffsetY = - (iconHeight / 2) - (iconStrokeWidth) - (textShapeHeight / 2);
    } else if (subText.text !== "") {
        subTextOffsetY = (iconHeight / 2) + iconStrokeWidth;
    }
    const subtextElement = subText.text === "" ? null : <g
        transform={`translate(${subTextOffsetX} ${subTextOffsetY})`}
    >
        <TextBox
            fill={subText.fill || "#FFFFFF"}
            textFill={subText.textFill || textFill}
            {...subText}
            height={textHeight}
            padding={textPadding}
            strokeWidth={0}
            stroke={textboxStroke}
            fontFamily={textFontFamily}
            cornerRadius={cornerRadius}
        />
    </g>;
    return <g>
        <g
            transform={`translate(${iconOffsetX} ${iconOffsetY})`}
        >
            <Icon
                {...icon}
            />
        </g>
        <g
            transform={`translate(${-fullAnnotationWidth / 2} ${annoOffsetY})`}
        >
            {textElement}
        </g>
        {subtextElement}
    </g>
        ;
};

export const CentroidVertex3: React.FunctionComponent<Vertex3Props> = function ({
    categoryID = "",
    text = "",
    icon = {},
    annotationsHeight = 12,
    annotationIDs = [],
    textHeight = 12,
    textPadding = 10,
    textFill = "#287EC4",
    textboxFill = "white",
    textboxStroke = "#CCCCCC",
    textboxStrokeWidth = 1,
    textFontFamily = "Verdana",
    cornerRadius,
    subText = {}
}) {
    icon = {
        height: 91,
        padding: 40,
        imageCharFill: "#555555",
        imageFontFamily: "FontAwesome",
        fill: "#FFCC33",
        stroke: "#DFDFDF",
        imageChar: "?",
        strokeWidth: 4,
        yOffset: -15,
        ...icon
    };
    subText = {
        text: "",
        fill: "transparent",
        textFill: "#555555",
        ...subText
    };
    const props = {
        categoryID,
        text,
        icon,
        annotationsHeight,
        annotationIDs,
        textHeight,
        textPadding,
        textFill,
        textboxFill,
        textboxStroke,
        textboxStrokeWidth,
        textFontFamily,
        cornerRadius,
        subText
    };
    return <Vertex3
        {...props}
        icon={icon}
        subText={subText}
    />;
};
