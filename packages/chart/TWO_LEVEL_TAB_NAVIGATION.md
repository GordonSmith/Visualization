# Two-Level Tab Navigation Implementation

## Overview

This implementation adds two-level tab navigation to chart widgets using [Tabster's Groupper API](https://tabster.io/docs/groupper/). This allows users to tab between visualizations at the outer level and only enter the inner interactive elements by pressing **Enter**.

## User Experience

### Navigation Flow

1. **Tab to visualization**: User tabs and lands on the visualization outer container
2. **Press Enter**: User presses Enter to activate inner navigation
3. **Tab within**: User can now tab through individual chart elements (pie slices, bars, etc.)
4. **Press Escape**: User presses Escape to exit inner navigation and return to outer container
5. **Tab away**: User tabs to move to the next visualization

### Without Entering Inner Navigation

- If the user doesn't press Enter, they can simply Tab again to skip to the next visualization
- This provides efficient navigation when users only want to move between visualizations, not interact with individual data points

## Implementation Details

### Critical: Apply to HTML Elements, Not SVG

**Important**: Tabster is designed to work with HTML DOM elements, not SVG elements. The `data-tabster` attribute must be applied to an HTML element.

- For `SVGWidget` (like Pie), apply to `this._parentRelativeDiv` (the HTML div wrapping the SVG)
- For `XYAxis` charts (like Column), apply to `host._parentRelativeDiv` (the HTML div wrapping the chart SVG)
- **DO NOT** apply `data-tabster` directly to SVG `<g>` elements - it won't work!

### Tabster Groupper Configuration

The implementation uses Tabster's `Groupper` with `"limited"` tabbability:

```typescript
.attr("data-tabster", JSON.stringify({
    groupper: {
        tabbability: "limited"
    }
}))
```

### Key Requirements

1. **Outer container** must have:

   - `tabindex="0"` - Makes it part of the natural tab order
   - `data-tabster` attribute with groupper configuration
   - `role="group"` - ARIA role for accessibility
   - `aria-label` - Descriptive label for screen readers

2. **Inner focusable elements** must have:
   - `tabindex="0"` - Makes them focusable (Tabster Groupper manages when they're accessible)
   - `role="button"` - ARIA role for interactive elements
   - `aria-label` - Descriptive label for each element

### Why `tabindex="0"` for Inner Elements?

The inner elements should have `tabindex="0"` to make them focusable:

- Tabster's Groupper API internally manages when these elements become accessible
- When the groupper is not activated (before pressing Enter), Tabster prevents tabbing to inner elements
- After pressing Enter, Tabster allows natural tab navigation through the inner `tabindex="0"` elements
- This is the pattern used in all Tabster examples and tests

## Charts Updated

### 1. Pie Chart (`src/Pie.ts`)

- **Outer container**: `this._parentRelativeDiv` (HTML div wrapping the SVG widget)
- **Inner elements**: Individual pie slices (`.arc` SVG `<g>` elements)
- **Configuration**: Applied in `update()` method to the HTML parent div

### 2. Column Chart (`src/Column.ts`)

- **Outer container**: `host._parentRelativeDiv` (HTML div wrapping the XYAxis chart)
- **Inner elements**: Individual bars/columns (`.dataCell` SVG `<g>` elements)
- **Configuration**: Applied in `layerUpdate()` method to the host's HTML parent div
- **Note**: Also applies to Bar, Line, Area, and other XYAxis-based charts that extend Column

## Code Pattern

### Initialization (in `enter` or `layerEnter`)

```typescript
// Initialize Tabster and Groupper
this._tabster =
  getTabster(domNode.ownerDocument?.defaultView) ||
  createTabster(domNode.ownerDocument?.defaultView);
if (this._tabster) {
  getGroupper(this._tabster);
}
```

### Configuration (in `update` or `layerUpdate`)

**For Pie Chart (SVGWidget):**

```typescript
// Configure Tabster Groupper on the parent HTML div (not SVG element)
if (this.tabNavigation() && this._parentRelativeDiv) {
  this._parentRelativeDiv
    .attr("tabindex", "0")
    .attr(
      "data-tabster",
      JSON.stringify({
        groupper: {
          tabbability: "limited",
        },
      })
    )
    .attr("role", "group")
    .attr("aria-label", "Pie chart");
} else if (this._parentRelativeDiv) {
  this._parentRelativeDiv
    .attr("tabindex", null)
    .attr("data-tabster", null)
    .attr("role", null)
    .attr("aria-label", null);
}
```

**For Column Chart (XYAxis layer):**

```typescript
// Configure Tabster Groupper on the host's parent HTML div
const hostWidget = host as any; // Cast to access protected _parentRelativeDiv
if (this.tabNavigation() && hostWidget._parentRelativeDiv) {
  hostWidget._parentRelativeDiv
    .attr("tabindex", "0")
    .attr(
      "data-tabster",
      JSON.stringify({
        groupper: {
          tabbability: "limited",
        },
      })
    )
    .attr("role", "group")
    .attr("aria-label", `${this.columns()[0] || "Chart"} data`);
} else if (hostWidget._parentRelativeDiv) {
  hostWidget._parentRelativeDiv
    .attr("tabindex", null)
    .attr("data-tabster", null)
    .attr("role", null)
    .attr("aria-label", null);
}
```

    .attr("role", "group")
    .attr("aria-label", "Chart name");

} else {
outerContainer
.attr("tabindex", null)
.attr("data-tabster", null)
.attr("role", null)
.attr("aria-label", null);
}

````

### Inner Elements

```typescript
innerElement
  .attr("tabindex", context.tabNavigation() ? 0 : undefined) // Tabster Groupper manages these
  .attr("role", context.tabNavigation() ? "button" : undefined)
  .attr(
    "aria-label",
    context.tabNavigation() ? (d: any) => `Label: ${d.value}` : undefined
  );
````

## Property Control

The feature is controlled by the `tabNavigation` published property:

```typescript
widget.tabNavigation(true); // Enable two-level tab navigation
widget.tabNavigation(false); // Disable (default)
```

## Testing

To test the implementation:

1. Enable tab navigation: `chart.tabNavigation(true).render()`
2. Tab to the visualization - outer container should receive focus
3. Press Tab again - should move to next focusable element (not inner chart elements)
4. Tab back and press Enter - should activate inner navigation
5. Tab within - should navigate through chart elements
6. Press Escape - should return to outer container
7. Press Tab - should move to next visualization

## Future Enhancements

Other charts that could benefit from this pattern:

- Scatter
- Bubble
- HexBin
- Radar
- RadialBar
- Heat
- WordCloud

The same pattern can be applied by identifying the outer container and inner interactive elements for each chart type.

## References

- [Tabster Groupper Documentation](https://tabster.io/docs/groupper/)
- [Tabster Storybook Examples](https://tabster.io/storybook/?path=/story/groupper)
