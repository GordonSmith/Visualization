import { Graphviz } from "../src/index.ts";

// =================================================================================
// Test 9 — many nested subgraphs with non-linear cross-cluster edges.
//
// The shape is loosely modelled on a pipeline graph (compare the screenshot in
// the originating ticket): several "smart denormalize" style clusters, each
// containing nested clusters and inline activities, with edges that:
//   - flow vertically inside a single cluster,
//   - span between sibling clusters,
//   - cross several levels of nesting.
//
// Test9   — renders the full graph.
// Test9P  — renders a *partial view* limited to a couple of clusters; edges
//           that leave the visible clusters cause the hidden endpoint to be
//           rendered as a "ghost" expand-icon outside the visible subgraphs.
// =================================================================================

interface Block {
    /** Cluster id for this block (e.g. "agp671"). */
    id: string;
    /** Optional id of the inner nested "Smart Denormalize Group" cluster. */
    innerId?: string;
    /** Optional id of the deepest nested "agpNNN" cluster. */
    coreId?: string;
}

const blocks: Block[] = [
    { id: "agp671", innerId: "sdg671", coreId: "agp682" },
    { id: "agp854" },
    { id: "agp880", innerId: "sdg880", coreId: "agp823" },
    { id: "agp809", innerId: "sdg809", coreId: "agp817" },
    { id: "agp923" },
    { id: "agp926" },
];

const subgraphs: Graphviz.Cluster[] = [];
const vertices: Graphviz.Node[] = [];
const edges: Graphviz.Edge[] = [];

function vid(block: string, name: string) {
    return `${block}_${name}`;
}

function addBlock(b: Block, parentID?: string) {
    // Outer cluster ("agpNNN -")
    subgraphs.push({ id: b.id, label: `${b.id} -`, parentID });

    if (b.innerId && b.coreId) {
        // Smart Denormalize Group (mid level)
        subgraphs.push({ id: b.innerId, label: "Smart Denormalize Group", parentID: b.id });
        // Deep "agpNNN -" cluster inside the group
        subgraphs.push({ id: b.coreId, label: `${b.coreId} -`, parentID: b.innerId });

        const child = vid(b.coreId, "child");
        const project = vid(b.coreId, "project");
        const sort = vid(b.coreId, "sort");
        const local = vid(b.coreId, "local");
        const sdgFooter = vid(b.innerId, "sdg");

        vertices.push(
            { id: child, label: "Child Dataset", shape: "box", parentID: b.coreId },
            { id: project, label: "Project", shape: "trapezium", parentID: b.coreId },
            { id: sort, label: "Sort", shape: "doubleoctagon", parentID: b.coreId },
            { id: local, label: "Local Result", shape: "box", parentID: b.coreId },
            { id: sdgFooter, label: "Smart Denormalize Group", shape: "box", parentID: b.innerId },
        );
        edges.push(
            { id: `e_${b.id}_1`, sourceID: child, targetID: project },
            { id: `e_${b.id}_2`, sourceID: project, targetID: sort },
            { id: `e_${b.id}_3`, sourceID: sort, targetID: local },
            { id: `e_${b.id}_4`, sourceID: local, targetID: sdgFooter, label: "Child" },
        );
    }

    // Outer-level activities for this block
    const splitWrite = vid(b.id, "splitWrite");
    vertices.push({ id: splitWrite, label: "Split Write", shape: "box", parentID: b.id });

    return { splitWrite };
}

// --- Block: agp671 (top-left smart denormalize) ---
addBlock(blocks[0]);
const agp671_sdgFooter = vid(blocks[0].innerId!, "sdg");
edges.push({ id: "e_agp671_out", sourceID: agp671_sdgFooter, targetID: vid("agp671", "splitWrite") });

// --- Block: agp854 (right of agp671) ---
addBlock(blocks[1]);
const agp854 = blocks[1].id;
const agp854_groupRead = vid(agp854, "groupedSplitRead");
const agp854_topN = vid(agp854, "groupedTopN");
const agp854_degroup = vid(agp854, "degroup");
const agp854_splitReadL = vid(agp854, "splitReadL");
const agp854_splitReadR = vid(agp854, "splitReadR");
const agp854_smartJoin = vid(agp854, "smartJoin");
const agp854_split = vid(agp854, "split");
const agp854_project = vid(agp854, "project");
const agp854_splitReadInner = vid(agp854, "splitReadInner");
vertices.push(
    { id: agp854_groupRead, label: "Grouped\\nSplit Read", shape: "cylinder", parentID: agp854 },
    { id: agp854_topN, label: "Grouped Top N", shape: "box", parentID: agp854 },
    { id: agp854_degroup, label: "Degroup", shape: "box", parentID: agp854 },
    { id: agp854_splitReadL, label: "Split Read", shape: "box", parentID: agp854 },
    { id: agp854_splitReadR, label: "Split Read", shape: "box", parentID: agp854 },
    { id: agp854_smartJoin, label: "Smart Join", shape: "invhouse", parentID: agp854 },
    { id: agp854_split, label: "Split", shape: "diamond", parentID: agp854 },
    { id: agp854_project, label: "Project", shape: "trapezium", parentID: agp854 },
    { id: agp854_splitReadInner, label: "Split Read", shape: "box", parentID: agp854 },
);
edges.push(
    { id: "e_agp854_a", sourceID: agp854_groupRead, targetID: agp854_topN },
    { id: "e_agp854_b", sourceID: agp854_topN, targetID: agp854_degroup },
    { id: "e_agp854_c", sourceID: agp854_degroup, targetID: agp854_split },
    { id: "e_agp854_d", sourceID: agp854_splitReadL, targetID: agp854_smartJoin, label: "LEFT" },
    { id: "e_agp854_e", sourceID: agp854_splitReadR, targetID: agp854_smartJoin, label: "RIGHT" },
    { id: "e_agp854_f", sourceID: agp854_smartJoin, targetID: agp854_splitReadInner },
    { id: "e_agp854_g", sourceID: agp854_split, targetID: agp854_project, label: "LEFT" },
    { id: "e_agp854_h", sourceID: agp854_split, targetID: vid(blocks[0].innerId!, "sdg"), label: "RIGHT" },
    { id: "e_agp854_i", sourceID: agp854_project, targetID: vid(agp854, "splitWrite") },
);

// --- Block: agp880 (middle large block, contains nested smart denormalize) ---
addBlock(blocks[2]);
const agp880 = blocks[2].id;
const agp880_splitRead = vid(agp880, "splitRead");
const agp880_localGroup = vid(agp880, "localGroup");
const agp880_groupRead = vid(agp880, "groupedSplitRead");
const agp880_topN = vid(agp880, "groupedTopN");
const agp880_sortL = vid(agp880, "groupedSortL");
const agp880_sortR = vid(agp880, "groupedSortR");
const agp880_degroupL = vid(agp880, "degroupL");
const agp880_degroupR = vid(agp880, "degroupR");
const agp880_lwjoin = vid(agp880, "lwjoin");
vertices.push(
    { id: agp880_splitRead, label: "Split Read", shape: "box", parentID: agp880 },
    { id: agp880_localGroup, label: "Local Group", shape: "box", parentID: agp880 },
    { id: agp880_groupRead, label: "Grouped\\nSplit Read", shape: "cylinder", parentID: agp880 },
    { id: agp880_topN, label: "Grouped Top N", shape: "box", parentID: agp880 },
    { id: agp880_sortL, label: "Grouped Sort", shape: "doubleoctagon", parentID: agp880 },
    { id: agp880_sortR, label: "Grouped Sort", shape: "doubleoctagon", parentID: agp880 },
    { id: agp880_degroupL, label: "Degroup", shape: "box", parentID: agp880 },
    { id: agp880_degroupR, label: "Degroup", shape: "box", parentID: agp880 },
    { id: agp880_lwjoin, label: "Lightweight Join", shape: "invhouse", parentID: agp880 },
);
edges.push(
    { id: "e_agp880_a", sourceID: agp854_splitReadInner, targetID: agp880_splitRead },
    { id: "e_agp880_b", sourceID: agp880_splitRead, targetID: agp880_localGroup },
    { id: "e_agp880_c", sourceID: agp880_localGroup, targetID: agp880_sortL },
    { id: "e_agp880_d", sourceID: agp880_groupRead, targetID: agp880_topN },
    { id: "e_agp880_e", sourceID: agp880_topN, targetID: agp880_sortR },
    { id: "e_agp880_f", sourceID: agp880_sortL, targetID: agp880_degroupL },
    { id: "e_agp880_g", sourceID: agp880_sortR, targetID: agp880_degroupR },
    { id: "e_agp880_h", sourceID: agp880_degroupL, targetID: agp880_lwjoin, label: "RIGHT" },
    { id: "e_agp880_i", sourceID: agp880_degroupR, targetID: agp880_lwjoin, label: "LEFT" },
    { id: "e_agp880_j", sourceID: vid(blocks[2].innerId!, "sdg"), targetID: vid(agp880, "splitWrite") },
    { id: "e_agp880_k", sourceID: agp880_lwjoin, targetID: vid(blocks[2].innerId!, "sdg") },
);

// --- Block: agp809 (right side, contains another nested SDG plus inline branch) ---
addBlock(blocks[3]);
const agp809 = blocks[3].id;
const agp809_inlineDataset = vid(agp809, "inlineDataset");
const agp809_split = vid(agp809, "split");
const agp809_project = vid(agp809, "project");
const agp809_funnel = vid(agp809, "funnel");
vertices.push(
    { id: agp809_inlineDataset, label: "Inline Dataset", shape: "box", parentID: agp809 },
    { id: agp809_split, label: "Split", shape: "diamond", parentID: agp809 },
    { id: agp809_project, label: "Project", shape: "trapezium", parentID: agp809 },
    { id: agp809_funnel, label: "Funnel", shape: "invtriangle", parentID: agp809 },
);
edges.push(
    { id: "e_agp809_a", sourceID: vid(agp880, "splitWrite"), targetID: agp809_inlineDataset, style: "dashed" },
    { id: "e_agp809_b", sourceID: agp809_inlineDataset, targetID: agp809_split },
    { id: "e_agp809_c", sourceID: agp809_split, targetID: agp809_project },
    { id: "e_agp809_d", sourceID: agp809_project, targetID: agp809_funnel },
    { id: "e_agp809_e", sourceID: agp809_funnel, targetID: vid(blocks[3].innerId!, "sdg"), label: "RIGHT" },
    { id: "e_agp809_f", sourceID: agp809_split, targetID: vid(blocks[3].coreId!, "child"), label: "LEFT" },
    { id: "e_agp809_g", sourceID: vid(blocks[3].innerId!, "sdg"), targetID: vid(agp809, "splitWrite") },
);

// --- Block: agp923 (small join cluster below) ---
addBlock(blocks[4]);
const agp923 = blocks[4].id;
const agp923_splitRead = vid(agp923, "splitRead");
const agp923_inlineDataset = vid(agp923, "inlineDataset");
const agp923_join = vid(agp923, "join");
vertices.push(
    { id: agp923_splitRead, label: "Split Read", shape: "box", parentID: agp923 },
    { id: agp923_inlineDataset, label: "Inline Dataset", shape: "box", parentID: agp923 },
    { id: agp923_join, label: "Join", shape: "invhouse", parentID: agp923 },
);
edges.push(
    { id: "e_agp923_a", sourceID: vid(agp809, "splitWrite"), targetID: agp923_splitRead },
    { id: "e_agp923_b", sourceID: agp923_splitRead, targetID: agp923_join, label: "LEFT" },
    { id: "e_agp923_c", sourceID: agp923_inlineDataset, targetID: agp923_join, label: "RIGHT" },
    { id: "e_agp923_d", sourceID: agp923_join, targetID: vid(agp923, "splitWrite") },
);

// --- Block: agp926 (output) ---
addBlock(blocks[5]);
const agp926 = blocks[5].id;
const agp926_splitRead = vid(agp926, "splitRead");
const agp926_sort = vid(agp926, "sort");
const agp926_project = vid(agp926, "project");
const agp926_output = vid(agp926, "output");
vertices.push(
    { id: agp926_splitRead, label: "Split Read", shape: "box", parentID: agp926 },
    { id: agp926_sort, label: "Sort", shape: "doubleoctagon", parentID: agp926 },
    { id: agp926_project, label: "Project", shape: "trapezium", parentID: agp926 },
    { id: agp926_output, label: "Output\\n'profileResults'", shape: "doublecircle", parentID: agp926 },
);
edges.push(
    { id: "e_agp926_a", sourceID: vid(agp923, "splitWrite"), targetID: agp926_splitRead },
    { id: "e_agp926_b", sourceID: agp926_splitRead, targetID: agp926_sort },
    { id: "e_agp926_c", sourceID: agp926_sort, targetID: agp926_project },
    { id: "e_agp926_d", sourceID: agp926_project, targetID: agp926_output },
);

const GRAPH: Graphviz.Graph = {
    label: "Nested Subgraphs Test",
    labelloc: "t",
    fontsize: 18,
    rankdir: "TB",
    compound: true,
    graphDefaults: { fontname: "Arial" },
    nodeDefaults: { fontname: "Arial", fontsize: 11 },
    edgeDefaults: { fontname: "Arial", fontsize: 10 },
};

const store = new Graphviz.Store();
store.load(vertices, edges, subgraphs, GRAPH);

export class Test9 extends Graphviz.Widget {
    constructor() {
        super();
        this.data({
            vertices: store.vertices(),
            edges: store.edges(),
            subgraphs: store.subgraphs(),
            graph: store.graph(),
        });
    }
}

// Partial view: only render two of the blocks. Edges that cross the visible /
// hidden boundary will produce ghost-expand placeholder vertices.
const partialView = store.createPartialView(["agp880", "agp809"]);

export class Test9P extends Graphviz.Widget {
    constructor() {
        super();
        this.data({
            vertices: partialView.vertices(),
            edges: partialView.edges(),
            subgraphs: partialView.subgraphs(),
            graph: partialView.graph(),
        });
    }
}
