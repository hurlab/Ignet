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

      {/* Team */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <h2 className="text-lg font-bold text-navy">Team</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ignet is co-developed by three research groups with complementary expertise in
          biomedical informatics, ontology engineering, and natural language processing.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: 'Junguk Hur, Ph.D.',
              role: 'Principal Investigator',
              lab: 'Hur Lab',
              institution: 'University of North Dakota',
              focus: 'Systems biology, network medicine, bioinformatics, and vaccine informatics.',
              photo: '/ignet/images/hur.jpg',
              url: 'https://hurlab.med.und.edu',
            },
            {
              name: 'Yongqun "Oliver" He, DVM, Ph.D.',
              role: 'Co-Investigator',
              lab: 'He Lab',
              institution: 'University of Michigan',
              focus: 'Biomedical ontology engineering, vaccine informatics (VIOLIN, VO), and knowledge representation.',
              photo: '/ignet/images/he.png',
              url: 'https://he-group.github.io',
            },
            {
              name: 'Arzucan Ozgur, Ph.D.',
              role: 'Co-Investigator',
              lab: 'Ozgur Lab',
              institution: 'Bogazici University',
              focus: 'Natural language processing, biomedical text mining, and machine learning.',
              photo: '/ignet/images/ozgur.jpg',
              url: 'https://cogsci.bogazici.edu.tr/content/arzucan-%C3%B6zg%C3%BCr',
            },
          ].map((pi) => (
            <a
              key={pi.name}
              href={pi.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <img
                src={pi.photo}
                alt={pi.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-colors mb-3"
              />
              <h3 className="font-semibold text-navy text-sm group-hover:text-blue-700">{pi.name}</h3>
              <p className="text-xs text-gray-500 font-medium">{pi.role}</p>
              <p className="text-xs text-blue-600 mt-0.5">{pi.lab} &mdash; {pi.institution}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{pi.focus}</p>
            </a>
          ))}
        </div>
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
