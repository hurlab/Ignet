export default function Acknowledgements() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-navy">Acknowledgements</h1>

      {/* Funding */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">Funding Support</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Development of Ignet has been supported in part by grants from the
          National Institutes of Health (NIH). We gratefully acknowledge NIH funding
          that has enabled the development and maintenance of this resource for the
          biomedical research community. Specific grant numbers are available upon
          request from the respective principal investigators.
        </p>
      </div>

      {/* Development Teams */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <h2 className="text-lg font-bold text-navy">Development Teams</h2>

        <div className="space-y-4">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-800 text-sm">
              Hur Lab — University of North Dakota (UND)
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mt-1">
              Lead development team for Ignet 2.0. Dr. Junguk Hur and the Hur Lab
              contributed to platform architecture, bioinformatics pipeline design,
              network analysis methodology, and the React-based frontend rebuild.
            </p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-800 text-sm">
              He Lab — University of Michigan (UM)
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mt-1">
              Dr. Yongqun "Oliver" He and the He Lab contributed expertise in biomedical
              ontology engineering, including the Interaction Network Ontology (INO)
              that underpins Ignet's interaction classification system.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              Ozgur Lab — Bogazici University
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mt-1">
              Dr. Arzucan Ozgur and the Ozgur Lab contributed natural language processing
              expertise, including the SciMiner text mining framework and gene
              co-occurrence extraction methodology central to Ignet's data pipeline.
            </p>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">Data Sources</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ignet's gene interaction database is derived from PubMed abstracts made
          available by the National Center for Biotechnology Information (NCBI) and
          the National Library of Medicine (NLM). We acknowledge the NLM for providing
          open access to PubMed data, without which large-scale literature mining
          would not be possible.
        </p>
        <p className="text-gray-600 text-sm leading-relaxed">
          Gene identifiers and nomenclature are sourced from the NCBI Gene database.
          Ontological interaction classifications are based on the Interaction Network
          Ontology (INO), an OBO Foundry ontology.
        </p>
      </div>

      {/* Open Source Tools */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">Open Source Technologies</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ignet 2.0 is built on a foundation of open source software. We acknowledge
          and thank the communities behind the following projects:
        </p>
        <ul className="space-y-2 text-sm text-gray-600">
          {[
            ['React', 'Frontend UI framework — https://react.dev'],
            ['Vite', 'Frontend build tooling — https://vitejs.dev'],
            ['Tailwind CSS', 'Utility-first CSS framework — https://tailwindcss.com'],
            ['Flask', 'Python REST API backend — https://flask.palletsprojects.com'],
            ['Cytoscape.js', 'Gene network visualization — https://cytoscape.org/cytoscape.js'],
            ['BioBERT', 'Biomedical language model — https://github.com/dmis-lab/biobert'],
            ['SciMiner', 'Biomedical NLP and entity recognition — http://sciminer.org'],
            ['SQLite / MySQL', 'Database systems for interaction storage'],
          ].map(([name, desc]) => (
            <li key={name} className="flex items-start gap-2">
              <span className="font-semibold text-gray-800 min-w-fit">{name}:</span>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Community */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">Community Contributions</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          We thank the wider biomedical informatics and bioinformatics communities
          for feedback, bug reports, and suggestions that have shaped the development
          of Ignet. Contributions via GitHub issues and direct correspondence from
          researchers are greatly appreciated.
        </p>
        <p className="text-sm">
          <a
            href="https://github.com/hurlab/Ignet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View the project on GitHub
          </a>
        </p>
      </div>
    </div>
  )
}
