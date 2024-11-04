import * as React from "react";
import { DrawerProps, makeStyles, tokens } from "@fluentui/react-components";
import { useConst } from "@fluentui/react-hooks";
import { NavDrawer, NavDrawerBody, NavDrawerHeader, OnNavItemSelectData } from "@fluentui/react-nav-preview";
import { JSEditor } from "@hpcc-js/codemirror";
import { AutosizeHpccJSComponent } from "./HpccJSAdapter";
import { Samples } from "./Samples";

const useStyles = makeStyles({
    root: {
        overflow: "hidden",
        display: "flex",
        height: "100%",
    },
    content: {
        flex: "1",
        padding: "16px",
        display: "grid",
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    field: {
        display: "flex",
        marginTop: "4px",
        marginLeft: "8px",
        flexDirection: "column",
        gridRowGap: tokens.spacingVerticalS,
    },
});

type DrawerType = Required<DrawerProps>["type"];

export const App = () => {
    const styles = useStyles();

    const [type] = React.useState<DrawerType>("inline");
    const [isMultiple] = React.useState(true);
    const [selectedValue, setSelectedValue] = React.useState<string>("7");
    const editor = useConst(() => new JSEditor());

    const handleItemSelect = (_: Event | React.SyntheticEvent<Element, Event>, data: OnNavItemSelectData) => {
        setSelectedValue(data.value as string);
    };

    React.useEffect(() => {
        const target = document.getElementById("target");
        const targetSrc = document.getElementById("targetSrc");
        if (target && targetSrc) {
            target.innerHTML = "";
            targetSrc.innerHTML = "";
        }
        if (editor) {
            editor
                .javascript("")
                .lazyRender()
                ;
        }
        if (selectedValue?.indexOf(".js") > 0) {
            const path = import.meta.resolve("../" + selectedValue);
            fetch(path)
                .then(async (response) => {
                    const script = await response.text();
                    if (targetSrc) {
                        const scriptElement = document.createElement("script");
                        scriptElement.type = "module";
                        scriptElement.textContent = script;
                        targetSrc.appendChild(scriptElement);
                        if (editor) {
                            editor
                                .javascript(script)
                                .lazyRender()
                                ;
                        }
                    }
                })
                .catch((error) => {
                    console.error(error);
                    if (target) {
                        target.innerHTML = error;
                    }
                });
        }
    }, [editor, selectedValue]);

    return <div className={styles.root}>
        <NavDrawer selectedValue={selectedValue} onNavItemSelect={handleItemSelect} open={true} type={type} multiple={isMultiple}>
            <NavDrawerHeader><h1>@hpcc-js</h1></NavDrawerHeader>
            <NavDrawerBody>
                <Samples setSelectedValue={setSelectedValue} />
            </NavDrawerBody>
        </NavDrawer>

        <div >
            <div id="target" style={{ width: "800px", height: "600px" }}></div>
            <div id="targetSrc"></div>
            <div id="target" style={{ width: "800px", height: "600px" }}>
                <h2>{selectedValue}</h2>
                <AutosizeHpccJSComponent widget={editor} padding={8}></AutosizeHpccJSComponent>
            </div>
        </div>
    </div>;
};