export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-navy">About Ignet</h1>

      {/* What is Ignet */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">What is Ignet?</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ignet (Integrative Gene Network) is a biomedical database and web platform built
          from large-scale literature mining of PubMed abstracts. It employs NLP-based tools, including
          SciMiner, to systematically extract gene co-occurrence relationships from over 2.6 million
          PubMed publications. BioBERT, a domain-specific pre-trained language model, further refines
          these co-occurrences into directional gene interaction predictions. For each gene pair with
          supporting literature, GPT-4o generates concise, AI-powered summaries via BioSummarAI,
          enabling rapid biological insight without manual literature review.
        </p>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ignet integrates these data streams into a unified, searchable network database covering
          15.8 million gene interactions, 11,800+ genes, and over 800 Interaction Network Ontology
          (INO) interaction types derived from 6 million sentences across PubMed abstracts.
        </p>
      </div>

      {/* CONDL Strategy */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">The CONDL Strategy</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ignet is powered by the <strong>CONDL (Centrality and Ontology-based Network Discovery
          using Literature)</strong> strategy, a computational framework that prioritizes biologically
          meaningful genes and interactions from massive literature-derived networks.
        </p>
        <p className="text-gray-600 text-sm leading-relaxed">
          CONDL combines four complementary centrality metrics — degree, eigenvector, closeness,
          and betweenness — with INO-based interaction classification to rank gene importance and
          interaction quality within a network context. This approach allows researchers to identify
          hub genes, key regulatory relationships, and ontologically characterized interactions that
          are most likely to be biologically relevant.
        </p>
      </div>

      {/* Database Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">Database at a Glance</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-navy font-semibold min-w-fit">Gene Interactions:</span>
            <span>15.8 million literature-mined gene interaction records</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-navy font-semibold min-w-fit">Genes Indexed:</span>
            <span>11,800+ human and model organism genes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-navy font-semibold min-w-fit">PubMed Coverage:</span>
            <span>2.6 million PMIDs processed from PubMed abstracts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-navy font-semibold min-w-fit">INO Interaction Types:</span>
            <span>800+ ontology-classified interaction categories</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-navy font-semibold min-w-fit">Sentences Analyzed:</span>
            <span>6 million sentences extracted from PubMed abstracts</span>
          </li>
        </ul>
      </div>

      {/* Development */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">Development Teams</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ignet is co-developed by three research groups with complementary expertise in
          biomedical informatics, ontology engineering, and natural language processing:
        </p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>
            <strong className="text-gray-800">University of North Dakota (UND)</strong> — Hur Lab, led by
            Dr. Junguk Hur, specializing in systems biology, network medicine, and bioinformatics.
          </li>
          <li>
            <strong className="text-gray-800">University of Michigan (UM)</strong> — He Lab, led by
            Dr. Yongqun "Oliver" He, with expertise in biomedical ontology engineering and
            vaccine informatics.
          </li>
          <li>
            <strong className="text-gray-800">Bogazici University</strong> — Led by Dr. Arzucan Ozgur,
            specializing in NLP, biomedical text mining, and machine learning.
          </li>
        </ul>
      </div>

      {/* Ignet 2.0 Features */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">Ignet 2.0 Features</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ignet 2.0 is a complete modernization of the original platform, rebuilt as a
          React single-page application with a REST API backend:
        </p>
        <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
          <li>React SPA with fast client-side navigation and lazy-loaded pages</li>
          <li>REST API with 18+ endpoints for programmatic data access</li>
          <li>BioBERT-powered gene interaction prediction</li>
          <li>BioSummarAI — GPT-4o-driven literature summarization for gene pairs</li>
          <li>Gene Set Enrichment analysis tools</li>
          <li>Comparative Network analysis for multiple gene sets</li>
          <li>INO Explorer for browsing ontology-classified interaction types</li>
          <li>AI Literature Assistant for natural language queries over gene interaction data</li>
          <li>Interactive network visualization with Cytoscape.js</li>
        </ul>
      </div>

      {/* Citation */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">How to Cite Ignet</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          If you use Ignet in your research, please cite:
        </p>
        <blockquote className="border-l-4 border-navy pl-4 text-sm text-gray-600 leading-relaxed italic">
          Ozgur A, Hur J, Xiang Z, Ong E, Radev D, and He Y. Ignet: A centrality and INO-based
          web system for analyzing and visualizing literature-mined gene interaction networks.
          <em> ICBO 2016, BioCreative 2016.</em>
        </blockquote>
      </div>
    </div>
  )
}
