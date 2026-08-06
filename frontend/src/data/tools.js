// Single source of truth for the tool catalogue.
//
// Header.jsx (nav dropdowns + mobile panel) and Home.jsx (tool cards) both read
// from here. They used to keep independent hand-maintained lists, which drifted:
// four tools carried two different names depending on where you met them
// (Compare/Compare Networks, INO/INO Explorer, Report/Analysis Report,
// Assistant/Literature Assistant), and the group itself differed too
// ("AI Tools" in the header, "AI" on Home). One list, one name each.
//
// Naming rule: no group label may equal a tool label, and no group label may
// equal a route segment belonging to a tool in a different group. The old
// "Explore" group contained a tool called "Explore", and the old "Analyze"
// group did not contain /analyze (that route is Analyze Text, which lived under
// "AI Tools") -- both are fixed here.
//
// Ordering rule: within a group, simple input first. One gene before two genes
// before a corpus; analyse before contrast before export. This is a stand-in
// for real usage data -- the site runs GA (G-SDLV4JKY0V), so per-route page
// views should replace this ordering when someone pulls them.
//
// `homeCard: false` marks a destination that belongs in the nav but already has
// its own dedicated section on Home (the Developer Access block), so it is not
// duplicated as a tool card.

export const TOOL_GROUPS = [
  {
    id: 'genes',
    label: 'Genes',
    card: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    tag: 'bg-blue-100 text-blue-800',
    tools: [
      {
        label: 'Gene',
        to: '/gene',
        tagline: 'Gene profile and network',
        description: 'Look up a gene symbol to find its top interacting partners and co-occurrence scores.',
        icon: '🧬',
      },
      {
        label: 'GenePair',
        to: '/genepair',
        tagline: 'Pairwise gene evidence',
        description: 'Query a pair of genes to assess their interaction probability and co-occurrence evidence.',
        icon: '🔗',
      },
      {
        label: 'Dignet',
        to: '/dignet',
        tagline: 'Full-text literature search',
        description: 'Search PubMed for gene co-occurrence networks with interactive graph visualization.',
        icon: '🔬',
      },
      {
        // Renamed from "Explore", which collided with its own group name.
        label: 'Top Genes',
        to: '/explore',
        tagline: 'Most connected genes',
        description: 'Browse the most connected genes in the network, ranked by co-occurrence count.',
        icon: '🌐',
      },
    ],
  },
  {
    id: 'sets',
    label: 'Gene Sets',
    card: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    tag: 'bg-emerald-100 text-emerald-800',
    tools: [
      {
        label: 'Enrichment',
        to: '/enrichment',
        tagline: 'Gene set enrichment',
        description: 'Paste a gene list to analyze pairwise interactions, INO types, and associated drugs and diseases.',
        icon: '📊',
      },
      {
        label: 'Compare Networks',
        to: '/compare',
        tagline: 'Compare two gene sets',
        description: 'Compare two PubMed-driven gene networks side by side with overlap analysis.',
        icon: '⚖️',
      },
      {
        label: 'Analysis Report',
        to: '/report',
        tagline: 'Downloadable summary',
        description: 'Generate a downloadable report summarizing gene set interactions, enrichment, and literature context.',
        icon: '📄',
      },
    ],
  },
  {
    id: 'ai',
    label: 'AI',
    card: 'bg-violet-50 border-violet-200 hover:border-violet-400',
    tag: 'bg-violet-100 text-violet-800',
    tools: [
      {
        label: 'Literature Assistant',
        to: '/assistant',
        tagline: 'Grounded literature Q&A',
        description: "Ask questions about gene interactions and get answers grounded in Ignet's PubMed evidence database.",
        icon: '💬',
      },
      {
        label: 'BioSummarAI',
        to: '/biosummarai',
        tagline: 'AI literature summary',
        description: 'AI-powered summarization of gene interactions from biomedical literature.',
        icon: '🤖',
      },
      {
        label: 'Analyze Text',
        to: '/analyze',
        tagline: 'Extract genes from text',
        description: 'Paste biomedical text to detect genes and predict interactions with BioBERT.',
        icon: '📝',
      },
    ],
  },
  {
    id: 'reference',
    label: 'Reference',
    card: 'bg-slate-50 border-slate-200 hover:border-slate-400',
    tag: 'bg-slate-100 text-slate-700',
    tools: [
      {
        // Moved out of the old "Analyze" group: INO Explorer takes no gene set,
        // so it never belonged beside Enrichment and Compare. It browses the
        // ontology vocabulary and can pivot from an interaction type to genes.
        label: 'INO Explorer',
        to: '/ino',
        tagline: 'Interaction Network Ontology',
        description: 'Browse 800+ interaction types from the Interaction Network Ontology.',
        icon: '🔖',
      },
      {
        // Previously reachable only from Home -- no nav entry at all.
        label: 'REST API',
        to: '/api-docs',
        tagline: 'JSON API reference',
        description: 'Programmatic access to all Ignet data and analyses via a JSON REST API.',
        icon: '⚙️',
        homeCard: false,
      },
      {
        label: 'MCP',
        to: '/mcp',
        tagline: 'Connect AI assistants',
        description: 'Connect Claude, ChatGPT, or other AI assistants directly to Ignet and Vignet data.',
        icon: '🔌',
        homeCard: false,
      },
    ],
  },
]

// Header nav: every group, every destination.
export const NAV_GROUPS = TOOL_GROUPS.map(({ id, label, tools }) => ({
  id,
  label,
  items: tools.map(({ label: itemLabel, to, tagline }) => ({
    label: itemLabel,
    to,
    desc: tagline,
  })),
}))

// Home cards: same catalogue, minus the destinations that already have their
// own section on that page.
export const HOME_TOOL_GROUPS = TOOL_GROUPS
  .map(group => ({ ...group, tools: group.tools.filter(t => t.homeCard !== false) }))
  .filter(group => group.tools.length > 0)
