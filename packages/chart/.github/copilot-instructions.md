# Copilot Instructions for @hpcc-js/chart

## Architecture Overview

This package is part of the **HPCC Visualization Framework** mono-repository. It provides TypeScript/D3.js-based chart widgets that inherit from base classes in `@hpcc-js/common` and `@hpcc-js/api`.

### Key Inheritance Patterns

- **XY-based charts** (Bar, Column, Line, Area, etc.) extend `XYAxis` → `SVGWidget`
- **Pie-based charts** (Pie, HalfPie, QuarterPie) extend `SVGWidget` directly
- **Simple charts** like `Bar` are often thin wrappers: `Bar extends Column` with just orientation changes
- All charts implement mixins: `INDChart.call(this)`, `ITooltip.call(this)`, `Utility.SimpleSelectionMixin.call(this)`

### Widget Structure Pattern

Every chart widget follows this structure:

```typescript
export class ChartName extends BaseClass {
  static __inputs: InputField[] = [
    /* data shape definition */
  ];

  constructor() {
    super();
    // Mixin calls
    INDChart.call(this);
    ITooltip.call(this);
    // Default property setup
  }

  // Override lifecycle methods: layerEnter, layerUpdate, etc.
}
ChartName.prototype._class += " chart_ChartName"; // CSS class registration
```

## Development Workflows

### Build System

- **Vite** for bundling with shared config from `@hpcc-js/esbuild-plugins`
- **TypeScript** compilation with `emitDeclarationOnly: true` (generates types/ folder only)
- **Parallel tasks**: `npm run gen-types-watch` + `npm run bundle-watch` = `build` task
- **Development**: Use `npm run bundle-watch` (runs Vite dev server on port 5500)

### Key Commands

```bash
npm run build                # Generate types + bundle
npm run gen-types-watch      # Watch TypeScript compilation
npm run bundle-watch         # Vite dev server (port 5500)
npm run test-browser         # Browser-based Vitest tests
npm run docs                 # Generate TypeDoc documentation
```

## Code Conventions

### File Organization

- **One widget per file**: `src/ChartName.ts` + optional `src/ChartName.css`
- **Exports**: All widgets exported from `src/index.ts`
- **Tests**: `src/__tests__/` for development tests, `tests/` for comprehensive specs
- **Generated**: `types/` (TypeScript declarations), `dist/` (bundled output)

### Data Patterns

- **InputField definitions**: Static `__inputs` array defines expected data shape
- **Column-based data**: `columns()` defines headers, `data()` contains rows
- **Standard format**: `[["Label", value1, value2, ...], ...]` for most charts
- **Pie charts**: `[["Category", number], ...]` (label + single value)

### Property Patterns

- **Chainable setters**: `chart.property(value).anotherProperty(value).render()`
- **Default values**: `this.property_default(value)` in constructor
- **Conditional defaults**: `this.property_exists() ? this.property() : fallback`

### CSS Integration

- **Import CSS**: `import "../src/ChartName.css";` in widget file
- **Class naming**: `.chart_ChartName` for widget-specific styles
- **Inheritance**: CSS classes follow inheritance chain (e.g., Bar inherits Column styles)

## Testing Conventions

### Test Structure

- **Browser tests**: Vitest with `@vitest/ui` for visual testing
- **Test data**: Standardized datasets in `tests/chart.browser.spec.ts`
- **Render helpers**: `renderMedium()`, `renderShort()`, `renderWide()` from `../../common/tests/`
- **Development tests**: Simple widget instances in `src/__tests__/` for quick iteration

### Example Test Pattern

```typescript
// tests/chart.browser.spec.ts
case ChartName:
    renderMedium(new ChartName()
        .columns(simple.ND.columns)
        .data(simple.ND.data)
    );
    break;
```

## Integration Points

### Dependencies

- **Core**: `@hpcc-js/common` (base widgets), `@hpcc-js/api` (interfaces)
- **D3 modules**: Specific imports (e.g., `d3-scale`, `d3-shape`) not full D3
- **Types**: Separate `@types/d3-*` packages for TypeScript support

### Widget Lifecycle

1. **Constructor**: Setup defaults, register mixins, initialize D3 objects
2. **layerEnter**: First render setup, tooltip configuration
3. **layerUpdate**: Main render logic, data binding, transitions
4. **Mixins**: INDChart (interactions), ITooltip (hover states), SimpleSelectionMixin (selection)

### Data Flow

- **XYAxis charts**: Use `layerData(host)`, `adjustedData(host)` for data transformation
- **Stacked data**: Converted to `[prevValue, prevValue + currentValue]` format
- **Tooltips**: Custom `tooltipHTML()` functions with series/domain context

## Accessibility & Keyboard Navigation

### Tabster Integration

- **Pie chart** includes keyboard navigation using [Tabster](https://tabster.io/)
- **Tab navigation**: Each pie slice is focusable with `tabindex="0"`
- **Selection**: Space/Enter keys toggle selection state
- **ARIA support**: `role="button"` and `aria-label` for screen readers
- **Focus styling**: CSS `:focus` states with blue outline and stroke

### Implementation Pattern

```typescript
// Add to enter() method
.attr("tabindex", 0)
.attr("role", "button")
.attr("aria-label", (d) => `${d.data[0]}: ${d.data[1]}`)
.on("keydown", function (event, d) {
    if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        // Handle selection
    }
})
```

## Common Patterns for New Charts

1. **Extend appropriate base**: `XYAxis` for axis-based, `SVGWidget` for others
2. **Define InputField**: Specify expected data structure
3. **Import CSS**: Create and import corresponding stylesheet
4. **Override lifecycle**: Implement `layerEnter` and `layerUpdate` for XYAxis charts
5. **Add to index.ts**: Export from main entry point
6. **Add tests**: Both development test and browser spec
7. **Register CSS class**: Add `_class` prototype extension

When working with existing charts, always check the inheritance chain and understand which methods are overridden vs. inherited.
