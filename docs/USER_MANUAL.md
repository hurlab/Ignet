# Ignet User Manual

## Introduction

### What is Ignet?

Ignet is an **Integrative Gene Network** database that helps researchers discover gene-gene interactions and co-occurrence networks from biomedical literature. Rather than manually reviewing thousands of scientific papers, Ignet automatically extracts gene interactions using advanced natural language processing and machine learning techniques.

Whether you're investigating vaccine mechanisms, understanding cancer biology, or exploring drug targets, Ignet provides interactive tools to explore millions of gene relationships extracted from PubMed research.

### Data Sources

Ignet integrates multiple authoritative biomedical data sources:

- **PubMed Literature**: 868,526+ PMIDs (biomedical abstracts) analyzed for gene mentions, updated daily
- **BioBERT**: Machine learning model trained to predict gene interactions from text with high accuracy
- **INO (Interaction Network Ontology)**: 800+ standardized terms describing types of molecular interactions
- **DrugBank**: Drug-gene associations for 7+ million annotations
- **HDO (Human Disease Ontology)**: Disease classifications and disease-gene relationships
- **Vaccine Ontology**: Vaccine-related genes and interactions

### Database Statistics

The Ignet database (pubmed26n) is updated daily with new PubMed publications and currently contains:

- **35,619 genes** with biomedical literature mentions
- **5,260,005 gene pairs** with co-occurrence evidence
- **1,943,248 sentences** containing gene interactions
- **868,526 PMIDs** analyzed from PubMed
- **42+ million annotations** linking genes to INO interaction types
- Coverage includes human genes plus model organisms (mouse, rat, zebrafish, etc.)
- The footer of every page shows the date of the most recent database update

### Who Uses Ignet?

Ignet is designed for:

- **Bioinformatics researchers** analyzing genomic data and needing literature context
- **Systems biologists** understanding gene regulatory networks
- **Pharmacologists** investigating drug mechanisms and targets
- **Immunologists** studying vaccine responses and immune pathways
- **Cancer researchers** exploring oncogene networks
- **Students and educators** learning about gene relationships in biology

---

## Getting Started

### Accessing Ignet

Navigate to **https://ignet.org/ignet/** in your web browser. No login is required for basic access.

The home page displays:

- A clear overview of what Ignet is and what you can do with it
- Database statistics showing the scale of available data
- Quick-access buttons to major tools (Search Networks, Explore Genes)
- A complete list of analysis tools available

### Home Page Overview

![Home](screenshots/home.png)

The home page is organized into several sections:

**Tools Section**: Cards describing each analysis tool with brief explanations. You can click directly on any tool card to launch it.

**Database Statistics**: Shows the current database scope:
- Total genes indexed
- Total gene pair relationships
- Total PMIDs analyzed
- Total sentences with gene interactions

This gives you confidence in the breadth and depth of data available.

**Developer Access**: Quick links to the REST API and MCP interface for programmatic access.

**Navigation Bar**: Top menu bar organized into three dropdown groups:
- **Explore**: Dignet, Gene, GenePair, Explore
- **Analyze**: Enrichment, Compare, INO, Report
- **AI Tools**: BioSummarAI, Analyze Text, Assistant
- PubMed search box for quick lookups
- Gene Set badge (when genes are saved)
- Sign In button (for saved analyses)

---

## Tools

### Dignet — PubMed Network Builder

**Purpose**: Convert a PubMed keyword search into an interactive gene interaction network visualization.

**When to Use**: When you want to explore gene relationships around a specific biological topic, disease, or research area.

#### How to Use Dignet

**Step 1: Enter Your Search**

Click the PubMed Query input field and enter keywords describing your research area. Examples:

- "vaccine immunity" — finds genes mentioned in vaccine and immunity papers
- "BRCA1 breast cancer" — explores genetic factors in breast cancer
- "IFNG tuberculosis" — investigates interferon-gamma in TB
- "COVID-19 cytokine" — analyzes cytokine responses to COVID

Ignet supports standard PubMed query syntax including parentheses, AND, OR, NOT operators.

**Step 2: Set Result Limit**

The default limit is 100 papers. You can adjust this to:
- 10-50: Quick analysis of most relevant papers
- 100-500: Comprehensive view of the topic
- 1000+: Complete landscape analysis (may take longer)

Higher limits = more genes found but longer processing time.

**Step 3: Search and Visualize**

Click "Search" and wait for the network to build. Ignet:
1. Queries PubMed for matching papers
2. Extracts gene names from abstracts using BioBERT
3. Calculates co-occurrence relationships
4. Renders an interactive network graph

**Step 4: Explore the Network**

The interactive Cytoscape visualization shows:

- **Nodes (circles)**: Represent genes. Node size indicates how central the gene is to your search topic (larger = more co-occurrences)
- **Edges (connecting lines)**: Represent gene-gene co-occurrence. Thicker lines indicate more papers mention both genes together
- **Colors**: Different colors represent different network communities (clusters of highly connected genes)

**Interaction Tips**:

- **Drag nodes** to rearrange the layout for better viewing
- **Click a node** to select it and see its details in the sidebar
- **Hover over edges** to see how many papers mention that gene pair together
- **Zoom** using your mouse wheel or trackpad
- **Pan** by clicking and dragging the empty space
- **Double-click** a node to center it in view

#### Understanding the Results

**Entity Sidebar** (right side): When you click a gene node:

- Shows the gene symbol and name
- Displays centrality metrics (how "important" this gene is in the network)
- Lists neighbor genes (genes it co-occurs with most frequently)
- Shows associated drugs and diseases from DrugBank and HDO

**Summary Statistics** at the top show:

- Total papers analyzed
- Total unique genes found
- Total gene pairs discovered

#### Advanced Features

**Year Filtering**: Select a date range to focus on recent literature or historical trends

**INO Type Filtering**: Narrow results to specific interaction types:
- Protein interactions (binding, phosphorylation)
- Gene regulation (activation, repression)
- Pathway membership
- Disease associations

**Export Options**:

- **CSV**: Download gene list and interaction data for external analysis
- **GraphML**: Export network in GraphML format for use in Cytoscape Desktop, gephi, or other visualization tools
- **PNG/PDF**: Save the current network visualization as an image

![Dignet](screenshots/dignet.png)

---

### Gene Search & Profile

**Purpose**: Find comprehensive information about a single gene, including its interaction partners, associated drugs, and diseases.

**When to Use**: When you want detailed information about one gene, its neighbors, and biological roles.

#### How to Search for a Gene

**Step 1: Access Gene Search**

Click "Gene" in the top navigation menu or use the home page button.

**Step 2: Enter Gene Symbol**

Type a gene symbol (e.g., IFNG, TP53, BRCA1, TNF) in the search field.

Ignet accepts:
- Official HGNC gene symbols (preferred): BRCA1, TP53, IFNG
- Common aliases: p53 (for TP53)
- Partial names (auto-complete will suggest matches)

**Step 3: View Gene Report Card**

The gene profile displays:

**Basic Information**:
- Official gene name and aliases
- Gene location (chromosome and coordinates)
- Brief description of gene function

**Centrality Metrics** (importance in the network):
- **Degree**: Total number of genes this gene interacts with
- **Betweenness**: How often this gene appears in pathways between other genes
- **Clustering Coefficient**: How tightly connected its interaction partners are to each other

These metrics help you understand if a gene is a major network hub or a more specialized player.

**Top Interaction Partners**:
- Ranked list of genes this gene co-occurs with most frequently
- Shows co-occurrence count (number of papers mentioning both genes)
- Click any partner to view that gene's profile

**Associated Drugs** (from DrugBank):
- Drugs that target or interact with this gene
- Useful for pharmacology research and drug development

**Associated Diseases** (from HDO):
- Diseases linked to dysfunction of this gene
- Helps understand the biological role and clinical relevance

**Interaction Types** (from INO):
- Types of interactions this gene is involved in
- Examples: protein binding, gene activation, pathway membership

#### Tips for Gene Search

- Genes may have multiple names; if your search doesn't work, try the official HGNC symbol
- Large hub genes (like TNF, IL6) will have extensive interaction networks
- Lesser-studied genes may have fewer documented interactions—this is accurate to current literature

![Gene](screenshots/gene.png)

---

### GenePair — Interaction Evidence

**Purpose**: Query a specific pair of genes and examine the evidence (sentences from papers) supporting their interaction, along with BioBERT prediction scores.

**When to Use**: When you want to verify that two genes actually interact, and you want to see the original evidence from research papers.

#### How to Analyze a Gene Pair

**Step 1: Access GenePair Tool**

Click "GenePair" in the top navigation menu.

**Step 2: Enter Two Gene Symbols**

Fill in:
- **Gene 1**: First gene symbol (e.g., IFNG)
- **Gene 2**: Second gene symbol (e.g., TNF)

**Step 3: Predict Interaction**

Click "Predict" and Ignet will:

1. Query the database for all papers mentioning both genes together
2. Extract sentences containing both gene names
3. Calculate BioBERT prediction score for interaction likelihood
4. Display evidence sentences with highlighted gene names

#### Understanding the Results

**BioBERT Prediction Score** (0.0-1.0):

- **0.8-1.0**: Strong prediction of interaction (both genes likely interact)
- **0.5-0.8**: Moderate evidence (genes co-occur but interaction type unclear)
- **0.0-0.5**: Weak or no predicted interaction (genes mentioned in same papers but may not directly interact)

The score reflects how often papers discuss these genes together and the language patterns around them.

**Evidence Sentences**:

Each sentence showing both genes is displayed with:

- Original text from the paper
- Gene names highlighted
- PMID (PubMed ID)—click to view the full paper on PubMed
- INO interaction type labels (if annotated)

Read these sentences carefully to understand *how* the genes interact:

- "IFNG activates the transcription of TNF in immune cells" = Gene regulation
- "IFNG and TNF form a protein complex" = Direct binding
- "Both IFNG and TNF are elevated in COVID-19 patients" = Co-regulation

#### Export Evidence

You can download the evidence sentences and scores as CSV for inclusion in your literature review or database compilation.

**Example Use Case**: You're writing a paper on interferon signaling. You want to confirm that IFN-gamma (IFNG) and TNF actually interact. GenePair shows you 15 papers supporting this interaction, with example sentences you can cite in your paper.

![GenePair](screenshots/genepair.png)

---

### BioSummarAI — AI Literature Summary

**Purpose**: Automatically generate an AI-powered literature summary of gene interactions from your custom gene list.

**When to Use**: When you want a high-level understanding of what a set of genes does together without reading hundreds of papers manually.

#### How to Generate an AI Summary

**Step 1: Access BioSummarAI**

Click "BioSummarAI" in the top navigation menu.

**Step 2: Select or Enter Genes**

You can:

- Enter genes individually in the search field and press Enter to add each one
- Use preset example categories (Immune signaling, Tumor suppressors, Vaccine targets)
- Paste a gene list from the Gene Set Builder (if you've created one)

**Step 3: Generate Summary**

Click "Summarize" and wait 10-30 seconds while the AI:

1. Retrieves all sentences from Ignet mentioning your genes
2. Sends them to GPT-4o (OpenAI's advanced AI model)
3. Generates a coherent narrative summary
4. Compiles references to all supporting papers

#### Understanding the AI Summary

**The Summary Section**:

A natural-language paragraph (or multiple paragraphs for larger gene sets) describing:

- What the genes are and their general roles
- How they interact with each other
- What biological processes they regulate
- Clinical or research significance

**Important Note**: The AI summary is generated from abstracts in Ignet's database, which is updated daily from PubMed. Always verify findings in original papers.

**Cited Papers**: Every fact in the summary is traced back to papers in Ignet. View the reference list to find papers relevant to specific claims.

#### Follow-up Questions

After reading the summary, you can ask follow-up questions in the chat interface:

- "What drugs target these genes?"
- "How do these genes relate to cancer?"
- "Which of these genes are vaccine antigens?"

The AI responds based on Ignet data, with citations to supporting papers.

**Example**: Generate a summary for genes IFNG, IL2, IL6, TNF. The AI produces:

*"The interferon-gamma and interleukin pathway represents a central node in immune activation, with IFNG acting as a master regulator of pro-inflammatory responses. IL-2 and IL-6 amplify this signaling, while TNF coordinates the systemic inflammation response. Together, these genes regulate T cell activation, macrophage polarization, and vaccine responses across multiple tissue types..."*

You get in minutes what would take hours to research manually.

![BioSummarAI](screenshots/biosummarai.png)

---

### Analyze Text — BioBERT Predictions from Custom Text

**Purpose**: Paste your own biomedical text (abstracts, paper excerpts, grant proposals) and have Ignet detect genes and predict interactions using BioBERT.

**When to Use**: When you want to analyze text from papers *outside* PubMed, extract genes automatically, or validate your writing for gene mentions.

#### How to Analyze Text

**Step 1: Access Analyze Text Tool**

Click "Analyze Text" in the top navigation menu.

**Step 2: Paste Your Text**

Paste biomedical text into the input field. This can be:

- An abstract from a paper
- Methods section from your research
- Grant proposal text
- Product description or whitepaper

**Step 3: Submit for Analysis**

Click "Analyze" and Ignet will:

1. Use BioBERT to identify all gene mentions in your text
2. Highlight each gene name with its confidence score
3. Show predicted interactions between mentioned genes
4. Provide a summary of genes and interactions found

#### Understanding Results

**Detected Genes**:

Displayed as clickable tags with:
- Gene symbol
- Confidence score (how confident BioBERT is that this is a gene mention, 0-1)
- Context (the surrounding words)

**Predicted Interactions**:

For each pair of genes mentioned, Ignet shows:
- The two genes
- BioBERT prediction score
- The sentences containing both genes

**Example**: You paste an abstract about vaccine development. Ignet detects 12 genes (IFNG, IL2, TNF, etc.), and shows that IFNG and IL2 are predicted to interact with 0.87 confidence based on the text.

#### Why This Matters

BioBERT isn't perfect—it can:
- Miss gene mentions (abbreviations, informal names)
- Falsely identify non-gene words as genes (rare)
- Miss context-dependent interactions

Use this tool to:
- Catch genes in your own writing
- Understand what BioBERT sees in text
- Find articles for further analysis

![Analyze](screenshots/analyze.png)

---

### Explore — Gene Cloud Browser

**Purpose**: Browse and search the most connected genes in Ignet without specifying a topic. Discover top genes and explore the gene landscape.

**When to Use**: When you want to discover important genes in your research area or explore the database without a specific query.

#### How to Use Explore

**Step 1: Access Explore Tool**

Click "Explore" in the top navigation menu.

**Step 2: View Top Genes**

The tool displays a cloud of the most-mentioned genes in the database, sized by frequency/centrality:

- Largest genes: Most frequently mentioned (e.g., IL6, TNF, BRCA1)
- Medium genes: Well-studied but more specialized
- Small genes: Less frequently mentioned but still in Ignet

**Step 3: Search and Filter**

- Type a disease or pathway name to filter genes relevant to that topic
- Browse gene categories (immune genes, oncogenes, metabolism genes)
- Use faceted filters to narrow by interaction type, disease association, etc.

**Step 4: View Gene Details**

Click any gene to see its full profile (same as Gene Search tool).

#### Why Explore Matters

Explore helps you:
- Discover "hub" genes that connect many pathways
- Understand what genes dominate your research area
- Find similar genes to ones you're studying
- Get an overview of gene landscape without preconceptions

**Example**: You're new to vaccine immunology. Click Explore, search "vaccine", and see which genes dominate vaccine research (IFNG, IL2, IL6). This gives you a starting point for deeper investigation.

![Explore](screenshots/explore.png)

---

### Enrichment — Gene Set Analysis

**Purpose**: Analyze a list of genes to discover enriched pathways, associated drugs, disease relationships, and gene interaction subnetworks.

**When to Use**: When you have a list of genes (from RNA-seq, GWAS, or other experiments) and want to understand what they do together.

#### How to Use Enrichment

**Step 1: Access Enrichment Tool**

Click "Enrichment" in the top navigation menu.

**Step 2: Enter Gene List**

Paste or enter your gene list:
- One gene per line or comma/space separated
- Gene symbols (BRCA1, TP53, TNF, etc.)
- Can include duplicates (they're deduplicated)
- Example provided: TNF, IL6, IFNG, IL1B, IL10

**Step 3: Run Analysis**

Click "Analyze" and wait for the enrichment analysis to complete. Ignet calculates:

1. **Gene Interaction Subnetwork**: How do your genes interact with each other? Which form clusters?
2. **Associated Drugs**: What drugs are known to target genes in your list?
3. **Associated Diseases**: What diseases are these genes linked to?
4. **Interaction Types**: What types of interactions (protein binding, regulation, etc.) are overrepresented?

#### Understanding Enrichment Results

**Gene Network Visualization**:

Shows how your input genes (highlighted in a different color) interact with nearby genes. This reveals:

- **Tight clusters**: Genes in your list that work together in specific pathways
- **Hub genes**: Genes in your list that connect multiple pathways
- **Missing genes**: Genes not in your list but central to connecting your genes

**Drug Enrichment**:

Lists drugs known to target genes in your set:

- Useful for understanding pharmacological approaches to your genes
- Can reveal off-target effects if a single drug hits multiple genes

**Disease Enrichment**:

Shows which diseases are associated with genes in your set:

- If your genes are associated with cancer, "cancer" will rank high
- Suggests biological relevance to disease processes
- Can reveal unexpected disease associations

**Interaction Type Enrichment**:

Reveals what types of interactions your genes are involved in (from INO):

- Protein binding, phosphorylation, activation, inhibition, etc.
- Helps understand the functional nature of your gene list

#### Example Use Case

You run RNA-seq on immune cells and get 50 upregulated genes. Upload this list to Enrichment. Ignet shows:

- Your genes form 3 clusters: Interferon signaling, IL6 signaling, and TNF signaling
- 12 of your genes are targets of FDA-approved drugs
- Strong association with "immune response" and "cytokine signaling"
- Proteins interact heavily through phosphorylation and transcriptional regulation

This gives you a comprehensive picture in minutes.

![Enrichment](screenshots/enrichment.png)

---

### Compare — Comparative Network Analysis

**Purpose**: Enter two different PubMed queries and compare the gene networks they produce side-by-side.

**When to Use**: When you want to understand similarities and differences between two topics, or find genes unique to one research area.

#### How to Use Compare

**Step 1: Access Compare Tool**

Click "Compare" in the top navigation menu.

**Step 2: Enter Two PubMed Queries**

Specify two different queries:
- Query 1: "vaccine immunity"
- Query 2: "COVID-19 pathogenesis"

Each can have its own result limit (10-1000 papers).

**Step 3: Run Comparison**

Click to generate networks for both queries. Ignet displays:

1. **Side-by-side networks**: Each query's gene network visualized separately
2. **Venn diagram**:
   - Genes unique to Query 1 (left circle)
   - Genes shared by both (intersection)
   - Genes unique to Query 2 (right circle)
3. **Shared gene analysis**: List genes that appear in both networks, ordered by how central they are to each topic

#### Understanding Comparison Results

**Unique Genes**:

Genes appearing in only one network often represent topic-specific biology:

- Vaccine-specific genes: IL2, IL12, CD4 (T cell markers)
- COVID-specific genes: ACE2, TMPRSS2, (viral entry factors)

**Shared Genes**:

Genes in both networks represent common biology:

- Immune response genes: IFNG, TNF, IL6 (present in both vaccine and COVID networks)
- These are your "bridging" genes—understanding them helps connect the topics

**Network Differences**:

- Different gene clusters between queries = different mechanisms
- Similar clusters = similar biology with different magnitudes

#### Example Use Case

Compare "breast cancer chemotherapy response" vs "breast cancer immunotherapy response".

Results show:

- Shared genes: TP53, BRCA1, BRCA2 (underlying genetic factors)
- Chemotherapy unique: DNA repair genes, cell cycle checkpoints
- Immunotherapy unique: T cell activation genes, checkpoint inhibitors

This helps you understand what genes determine treatment response type.

![Compare](screenshots/compare.png)

---

### INO Explorer — Interaction Network Ontology

**Purpose**: Browse the Interaction Network Ontology (INO)—the standardized vocabulary of 800+ gene interaction types used in Ignet.

**When to Use**: When you want to understand what types of interactions exist between genes, or find genes that have a specific type of interaction.

#### Understanding the Interaction Network Ontology

The INO provides standardized terms for types of molecular interactions:

**Broad Categories**:

- **Protein Interactions**: Binding, complex formation, oligomerization
- **Gene Regulation**: Transcriptional activation, repression, chromatin remodeling
- **Post-translational Modification**: Phosphorylation, ubiquitination, methylation
- **Pathway Membership**: Genes in the same pathway
- **Disease/Phenotype**: Genes associated with the same disease or trait

Each interaction type has a definition, broader parent categories, and narrower subtypes.

#### How to Use INO Explorer

**Step 1: Access INO Explorer**

Click "INO" in the top navigation menu.

**Step 2: Browse or Search**

- **Browse**: Navigate the INO hierarchy starting from broad categories
- **Search**: Find a specific interaction type (e.g., "phosphorylation")

**Step 3: View Interaction Details**

For each interaction type, see:

- **Definition**: What this interaction means
- **Gene Pairs**: Examples of genes with this interaction
- **Count**: How many gene pairs in Ignet have this interaction type

**Step 4: Find Genes with This Interaction**

Click on an interaction type to see all gene pairs annotated with this interaction in Ignet.

#### Example: Finding Phosphorylation Interactions

Search for "phosphorylation" in INO Explorer. Results show:

- 10,000+ gene pairs with documented phosphorylation interactions
- Examples: Kinase A phosphorylates Kinase B
- This helps you understand post-translational signal transduction in your pathway

![INO](screenshots/ino.png)

---

### Assistant — Evidence-Grounded Literature Q&A

**Purpose**: Ask natural-language questions about gene interactions and get answers grounded in Ignet's database with cited evidence.

**When to Use**: When you want to ask open-ended questions about genes and interactions in natural language, rather than using structured queries.

#### How to Use the Assistant

**Step 1: Access Assistant Tool**

Click "Assistant" in the top navigation menu.

**Step 2: Ask Your Question**

Type questions in natural language such as:

- "What genes does BRCA1 interact with in cancer?"
- "Which cytokines are upregulated in COVID-19?"
- "What drugs target the interferon pathway?"
- "Which genes are related to vaccine responses?"

The Assistant uses Claude AI to understand context and searches Ignet data to answer.

**Step 3: Review the Answer**

The Assistant provides:

- A natural-language answer explaining what Ignet data shows
- Cited references: Links to supporting papers and gene interactions
- Confidence: Whether this is well-established (high-evidence) or emerging (low-evidence)

**Step 4: Follow-up Questions**

Ask clarifying questions:

- "Can you explain that interaction more?"
- "What are the downstream effects?"
- "Are there any drugs that target these genes?"

The Assistant maintains conversation context and refines its answers.

#### Important Limitations

The Assistant is powered by Claude AI and Ignet data:

- Answers are limited to genes and interactions in Ignet's database (updated daily from PubMed)
- It can make mistakes or misinterpret ambiguous queries
- Always verify important findings in original papers
- It cannot perform real-time web searches or access papers outside Ignet

#### Example Conversation

**Q**: "What's the role of TNF in immune response?"

**A**: "TNF (Tumor Necrosis Factor) is a central pro-inflammatory cytokine. In Ignet, it co-occurs with 1,200+ genes including IL6, IFNG, and IL1B, indicating roles in broad immune activation. It's involved in T cell activation, macrophage polarization, and systemic inflammation. The genes most tightly connected to TNF include..."

**Q**: "What happens if TNF is blocked?"

**A**: "TNF inhibitors (like infliximab) are used clinically. Genes downstream of TNF signaling include NF-kappa B pathway members and other inflammatory mediators. Blocking TNF affects..."

**Follow-up**: "Can you list drugs that target TNF or its pathway?"

![Assistant](screenshots/assistant.png)

---

### Gene Set Builder — Persistent Gene Collections

**Purpose**: Create and save custom gene lists for use across Ignet tools.

**When to Use**: When you want to save a list of genes you're researching and reuse it across multiple analyses (Enrichment, BioSummarAI, etc.).

#### How to Create a Gene Set

**Step 1: Access Gene Set Builder**

In the top right of the page, look for the Gene Set icon (shopping cart or list icon).

**Step 2: Add Genes**

You can add genes by:

- Typing gene symbols manually and clicking "Add"
- Importing from a gene list (copy-paste)
- Clicking "Add to Set" buttons on gene profile pages
- Using results from previous Dignet or Explore searches

**Step 3: Manage Your Set**

- **View genes**: See all genes in your current set with counts
- **Remove genes**: Delete specific genes
- **Clear set**: Start over with an empty set
- **Copy genes**: Copy gene list for pasting elsewhere

**Step 4: Save and Name Your Set**

Click "Save Set" and give it a descriptive name:

- "Vaccine response genes"
- "COVID-19 upregulated genes"
- "Cancer-related genes"

Your set is saved to your browser's local storage (persists between sessions if not cleared).

#### Using Gene Sets with Other Tools

Once you've created a gene set:

- Click the set in the Gene Set menu
- Choose a tool to analyze it:
  - **Enrichment**: Analyze the full subnetwork
  - **BioSummarAI**: Generate an AI summary
  - **Compare**: Compare against a PubMed query

#### Example Workflow

1. Use Dignet to search "vaccine" → find 100 genes
2. Click genes to add to a set → "Vaccine genes" set created
3. Use Enrichment on this set → see enriched pathways and drugs
4. Use BioSummarAI → generate summary of vaccine biology
5. Export set → use in external analysis tools

![Gene Set](screenshots/geneset.png)

---

### Generate Report — Multi-Phase Analysis Reports

**Purpose**: Create downloadable HTML reports summarizing your gene analyses, including network visualizations, statistics, and interpretation.

**When to Use**: When you want to present analysis results to collaborators or include findings in a paper/presentation.

#### How to Generate a Report

**Step 1: Access Generate Report Tool**

Click "Report" under the **Analyze** dropdown in the navigation menu.

**Step 2: Configure Report Parameters**

Specify what to include:

- **Gene List**: Input genes for analysis
- **Report Title**: Give your analysis a name
- **PubMed Query** (optional): Include a Dignet analysis
- **Sections**: Choose what to include:
  - Gene network visualization
  - Interaction evidence table
  - Drug associations
  - Disease associations
  - Literature summary

**Step 3: Generate Report**

Click "Generate" and wait for Ignet to:

1. Run analyses on your genes
2. Create network visualizations
3. Compile statistics and tables
4. Generate narrative summaries

This typically takes 1-5 minutes depending on complexity.

**Step 4: Review and Download**

The report is generated as an interactive HTML page:

- Opens in your browser for review
- Click "Download" to save as HTML file
- Can be opened offline later
- Share with collaborators via email

#### What's in a Report?

**Executive Summary**: High-level overview of your genes and their relationships

**Network Visualization**: Interactive Cytoscape graph showing gene interactions

**Statistics Table**: Gene-by-gene metrics (degree, betweenness, etc.)

**Interaction Evidence**: Table of gene pair interactions with citation counts

**Drug and Disease Associations**: Enrichment results

**Interpretation**: AI-generated narrative explaining the findings

**References**: Complete list of supporting papers from Ignet

#### Example Report

A report on vaccine response genes might include:

- Network showing how IL2, IFNG, TNF, and IL6 interact
- Table showing degree and betweenness centrality for each gene
- 50+ papers citing vaccine + immune gene combinations
- 12 drugs targeting genes in the network
- AI interpretation: "These genes form a central hub coordinating T cell activation and pro-inflammatory cytokine production..."

![Report](screenshots/report.png)

---

### API Documentation

**Purpose**: Reference documentation for programmatic access to Ignet data via REST API and MCP endpoints.

**When to Use**: When you want to integrate Ignet into custom software, scripts, or AI assistants.

#### REST API Access

Ignet provides a JSON REST API with 30+ endpoints at `/api/v1/`:

**Base URL**: `https://ignet.org/api/v1/`

**Example Endpoints**:

- `GET /genes/search?query=IFNG` — Search genes
- `GET /genes/{gene_id}` — Get gene details
- `GET /pairs/search?gene1=IFNG&gene2=TNF` — Query gene pair
- `GET /enrichment` — Run enrichment analysis
- `GET /dignet/search?query=vaccine` — Perform Dignet search

**Authentication**: No API key required for public access

**Rate Limiting**: Fair use policy; heavy users should contact support

#### MCP Endpoint (AI Assistant Integration)

Ignet exposes a Model Context Protocol (MCP) endpoint for direct integration with AI assistants like Claude, ChatGPT, and others.

**Endpoint**: `https://ignet.org/api/v1/mcp`

**Available Tools** (8 MCP tools):

1. **search_genes** — Find genes by symbol or keyword
2. **get_gene_profile** — Retrieve detailed gene information
3. **find_gene_interactions** — Query gene pair interactions
4. **search_pubmed** — Find PubMed papers on a topic
5. **enrichment_analysis** — Analyze a gene set
6. **predict_interaction** — Predict if two genes interact
7. **get_drugs** — Find drugs targeting a gene
8. **get_diseases** — Find diseases associated with genes

**Configuration**: To connect Claude or another AI to Ignet:

1. Add the MCP endpoint to your AI assistant configuration
2. Select which tools to enable
3. Start asking questions about genes

**Example with Claude**:

> Add MCP server: `https://ignet.org/api/v1/mcp`
>
> Then ask: "What genes interact with BRCA1 and are targets of cancer drugs?"
>
> Claude automatically uses Ignet tools to find the answer.

#### Documentation Page

Click "API Docs" in the top navigation to view:

- Interactive API documentation
- Example API calls in multiple languages (curl, Python, JavaScript)
- Rate limits and usage guidelines
- Troubleshooting for common issues

![API Docs](screenshots/api-docs.png)

---

## Practical Workflows

### Workflow 1: Investigating a Gene from a Paper

You're reading a paper that mentions IFNG and want to understand what it interacts with.

**Steps**:

1. Navigate to **Gene** tool
2. Search "IFNG"
3. View its top 20 interaction partners
4. Click one that interests you (e.g., TNF)
5. Use **GenePair** tool to see evidence of IFNG-TNF interaction
6. Read 3-5 evidence sentences to understand the interaction
7. Use Enrichment on genes from the paper to see the full network

**Time**: 10-15 minutes

---

### Workflow 2: Understanding Your RNA-seq Results

You have 80 upregulated genes from an experiment and want to know what they do together.

**Steps**:

1. Create a **Gene Set** with your 80 genes
2. Run **Enrichment** analysis on the set
   - Discover gene network clusters
   - See enriched drug targets
   - Identify disease associations
3. Generate an **AI Summary** using BioSummarAI
4. Use **Compare** to contrast your genes against known disease signatures
5. Generate a **Report** for your collaborators

**Time**: 20-30 minutes

---

### Workflow 3: Literature Review on a Topic

You need to review vaccine immunology genes comprehensively.

**Steps**:

1. Use **Dignet** with query "vaccine immunity" → 200 papers
   - Review the resulting gene network
   - Identify major pathway hubs
2. Use **Explore** filtered to vaccine genes
3. Pick top 10 hub genes; create a **Gene Set**
4. Use **BioSummarAI** to generate high-level summary
5. Use **Enrichment** to see drug opportunities
6. Use **Assistant** to ask specific questions about mechanisms
7. Generate a **Report** summarizing findings

**Time**: 1-2 hours for comprehensive review

---

### Workflow 4: Finding Drug Targets in Your Gene List

You have 30 genes implicated in a disease and want to find which are drugged.

**Steps**:

1. Create a **Gene Set** with your 30 genes
2. Run **Enrichment** → View "Associated Drugs" section
   - See which drugs target your genes
   - Identify FDA-approved drugs vs. experimental ones
3. For each drug-gene interaction, use **GenePair** to see evidence
4. Use **Assistant** to ask: "What is the mechanism of these drugs on this pathway?"
5. Export drug-gene association table for your manuscript

**Time**: 15-20 minutes

---

### Workflow 5: Presenting Data to Collaborators

You want to share your analysis results with your lab in an easy-to-understand format.

**Steps**:

1. Perform your analysis (Dignet, Enrichment, or BioSummarAI)
2. Use **Generate Report** to create comprehensive HTML report
3. Download the report
4. Share report file via email or collaboration platform
5. Collaborators can open the report in any web browser
6. Interactive network visualization lets them explore gene relationships

**Time**: 10 minutes for report generation + sharing

---

## Daily Update Pipeline

Ignet's database is updated daily with new publications from PubMed. The automated pipeline works as follows:

1. **New papers are downloaded** from PubMed's daily update files
2. **Gene mentions are extracted** from each abstract using the SciMiner text-mining system
3. **Gene pairs and co-occurrences** are computed and stored in the database
4. **BioBERT interaction scores** are calculated for new gene pairs
5. **INO interaction types, drug associations, and disease links** are annotated

The footer of every Ignet page displays the date of the most recent database update, so you can always confirm how current the data is.

---

## FAQ & Tips

### General Questions

**Q: How often is Ignet updated?**
A: Ignet's database is updated daily with new PubMed publications. The footer of every page shows the date of the most recent update. New papers are automatically processed through the SciMiner pipeline, and gene interaction data is refreshed accordingly.

**Q: Can I use Ignet for commercial research?**
A: Yes, Ignet is freely available. Check the Disclaimer and Acknowledgements pages for proper attribution in publications.

**Q: Do I need an account to use Ignet?**
A: No. Basic browsing and analysis is free without an account. Sign in only if you want to save your gene sets and analysis history.

**Q: What if I find an error or bug?**
A: Click "Report an Issue" at the bottom of any page, or email the Ignet team. Feedback helps improve the database.

---

### Technical Questions

**Q: What does "BioBERT prediction score" mean?**
A: It's a machine learning confidence score (0-1) that two genes are likely to interact based on how they're mentioned in text. Higher scores = more confident prediction. It's not experimental validation—always check original papers.

**Q: Why are some genes missing from my search?**
A: BioBERT identifies genes mentioned in text. If a gene is discussed indirectly (e.g., "p53" instead of "TP53") it might be missed. Try searching for aliases or checking the original paper.

**Q: Can I download the entire Ignet database?**
A: Not currently. Use the REST API for programmatic access to specific data, or contact the Ignet team about bulk downloads for research.

---

### Usage Tips

**Tip 1: Start with Dignet**
If you're unfamiliar with a topic, start with Dignet. It gives you a quick overview of the gene landscape around your research area.

**Tip 2: Use Gene Sets for Reproducibility**
Save your gene lists as Gene Sets. This makes it easy to re-analyze or share with collaborators.

**Tip 3: Cross-Validate with GenePair**
Don't trust any single interaction in Ignet. Use GenePair to check evidence. If there's only one paper, be skeptical.

**Tip 4: Enrichment Reveals Network Structure**
Enrichment is powerful because it shows not just individual genes but how they cluster. Gene clusters often represent biological modules (pathways).

**Tip 5: AI Summaries Are Starting Points**
BioSummarAI summaries are great for quickly understanding a gene set, but always read actual papers for your final conclusions.

**Tip 6: INO Types Matter**
Use INO Explorer to understand interaction types. A "protein binding" interaction means something different from "co-regulation." This level of detail matters for mechanism.

---

### Troubleshooting

**Q: My search timed out. What should I do?**
A: Try reducing the result limit (use 100 instead of 1000) or refining your search query. Some very broad searches naturally take longer.

**Q: A gene I searched for didn't return any results.**
A: The gene may:
- Have no mentions in PubMed abstracts (rare for major genes)
- Be named differently (try aliases or official HGNC symbol)
- Be very recently published (new papers are added daily but processing may take 1-2 days)

Try Gene > Gene Search tool for a broader search.

**Q: The network visualization won't load.**
A: This is rare but can happen with very large networks (1000+ genes). Try:
- Reducing your search limits
- Using a different browser
- Contacting support if the problem persists

**Q: Can I print a network visualization?**
A: Yes, right-click the network visualization and select "Save image as" or use your browser's print function. For better results, use the Generate Report feature which creates a printable HTML document.

---

## Citation

If you use Ignet in your research, please cite:

**Publication** (pending): Ignet: An Integrative Gene Network Database from PubMed Literature Mining Using BioBERT and Natural Language Processing. *[Journal Name]*.

**Authors**: Junguk Hur (University of North Dakota), Yongqun "Oliver" He (University of Michigan), Arzucan Ozgur (Bogazici University), 2016-2026.

**Database**: Ignet Gene Interaction Database. Available at: https://ignet.org/ignet/

**Funding**: Supported by NIH/NIAID U24AI171008 — VIOLIN 2.0 (Vaccine Information and Ontology Linked kNowledge base).

**Example Citation**:

> "Gene interactions were identified using Ignet, an integrative gene network database constructed from 868,526+ PubMed abstracts (updated daily) using BioBERT natural language processing [Hur et al., 2016-2026]. The database contains 5,260,005 gene-gene co-occurrences with interaction predictions and evidence sentences."

---

## Contact & Resources

### Getting Help

- **Feedback & Bug Reports**: Click "Report an Issue" on any page
- **Questions**: Email support (contact link in footer)
- **Documentation**: This User Manual, API Docs, FAQs pages
- **Video Tutorials**: (if available) Check YouTube or the About page

### Related Resources

- **VIOLIN (Vaccine Information & Ontology Linked kNowledge base)**: http://www.violinet.org/ — Vaccine-specific gene network (sister project)
- **Vignet**: https://github.com/hurlab/Vignet — Vaccine-focused variant of Ignet
- **PubMed**: https://pubmed.ncbi.nlm.nih.gov/ — Original literature source
- **BioBERT**: https://github.com/dmis-lab/biobert — Gene extraction model used by Ignet
- **INO (Interaction Network Ontology)**: Standardized interaction vocabulary

### Affiliated Institutions

- University of North Dakota — Department of Biology
- University of Michigan — School of Medicine
- Bogazici University — Department of Computer Engineering

---

## About Ignet

Ignet is an open-access database providing researchers with tools to explore gene co-occurrence networks from biomedical literature. By automatically extracting gene relationships from PubMed abstracts using advanced machine learning (BioBERT), Ignet enables rapid hypothesis generation and literature-based discovery at scale that would be impossible to conduct manually.

The database has been continuously developed and curated since 2016 and currently indexes over 868,000 PubMed abstracts with daily updates, representing the collective biomedical knowledge of the field through the lens of gene interactions.

Whether you're a bioinformatics researcher analyzing genomic data, a systems biologist mapping gene networks, an immunologist studying vaccine responses, or a student learning about genes and disease, Ignet provides the interactive tools and data you need to understand how genes interact and work together in biological processes.

---

**Last Updated**: April 3, 2026
**Database Version**: pubmed26n (updated daily from PubMed)
**Manual Version**: 1.1
