import { Utility } from "@hpcc-js/common";
import { Icon, TextBox, VertexProps, React } from "@hpcc-js/react";

interface CustomVertexProps extends VertexProps {
    origData: any;
}

export const CustomVertex: React.FunctionComponent<CustomVertexProps> = ({
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
    textFontFamily = "Verdana",
    showLabel = true,
    origData = {}
}) => {
    const textboxStrokeWidth = 1;
    const cornerRadius = 3;
    const noLabelRadius = 5;

    icon = {
        height: 50,
        imageChar: "?",
        imageFontFamily: "FontAwesome",
        imageCharFill: "#555555",
        fill: "transparent",
        strokeWidth: 0,
        ...icon
    };

    const subText = React.useMemo(() => {
        return {
            text: "" + ((origData?.payload?.neighbors?.company ?? 0) + (origData?.payload?.neighbors?.person ?? 0) - (origData?.neighborCount ?? 0)),
            fill: "white",
            textFill: "#555555"
        };
    }, [origData?.neighborCount, origData?.payload?.neighbors?.company, origData?.payload?.neighbors?.person]);
    let fullAnnotationWidth = 0;

    const annoOffsetY = 0;

    const labelWidth = React.useMemo(() => {
        return Utility.textSize(text, textFontFamily, textHeight, false).width;
    }, [text, textFontFamily, textHeight]);

    let labelShapeWidth = 0;
    if (text !== "") {
        labelShapeWidth = labelWidth + (textPadding * 2) + (textboxStrokeWidth * 2);
    }
    fullAnnotationWidth += labelShapeWidth;
    const textOffsetX = fullAnnotationWidth - (labelShapeWidth / 2);

    const textShapeHeight = textHeight + (textPadding * 2) + (textboxStrokeWidth * 2);
    const textElement = React.useMemo(() => {
        return <g transform={`translate(${textOffsetX} ${annoOffsetY})`}>
            {!showLabel || text === "" ?
                <circle r={noLabelRadius} stroke={textboxStroke} fill={textFill} /> :
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
                </>
            }
        </g>;
    }, [showLabel, text, textFill, textFontFamily, textHeight, textOffsetX, textPadding, textboxFill, textboxStroke]);

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

    const subtextElement = React.useMemo(() => subText.text === "" ? null :
        <g transform={`translate(${subTextOffsetX} ${subTextOffsetY})`}>
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
        </g>, [subText, subTextOffsetY, textFill, textFontFamily, textHeight, textPadding, textboxStroke]);
    return <g>
        <g transform={`translate(${iconOffsetX} ${iconOffsetY})`}>
            <Icon {...icon} />
        </g>
        <g transform={`translate(${-fullAnnotationWidth / 2} ${annoOffsetY})`}>
            {textElement}
        </g>
        {subtextElement}
    </g>;
};

export const CustomCentroidVertex: React.FunctionComponent<CustomVertexProps> = function ({
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
    textFontFamily = "Verdana",
    origData = {}
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
        textFontFamily,
        origData
    };
    return <CustomVertex
        {...props}
        icon={icon}
    />;
};

