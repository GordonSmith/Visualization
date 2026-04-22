import { Test7 } from "./test7.ts";

export class Test8 extends Test7 {

    enter(domNode: HTMLElement, element) {
        domNode.style.colorScheme = "dark";
        super.enter(domNode, element);
    }
}
