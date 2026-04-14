export default function Disclaimer() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-navy">Disclaimer</h1>

      {/* Research Use Only */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">Research Purposes Only</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ignet is a research tool developed for academic and scientific use. All data,
          analysis results, and literature summaries provided by Ignet — including
          gene interaction records, network visualizations, centrality metrics, and
          BioSummarAI-generated content — are intended exclusively for research
          purposes and must not be used for clinical diagnosis, medical decision-making,
          or any patient care application.
        </p>
      </div>

      {/* Not Clinical Advice */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">Not Medical or Clinical Advice</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Nothing in Ignet constitutes medical advice, clinical guidance, or a
          recommendation for any therapeutic intervention. Gene interaction data
          derived from literature mining reflects associations reported in published
          research and does not imply causal relationships, clinical actionability,
          or regulatory approval for any biological target or therapy. Users should
          consult qualified healthcare professionals for all clinical and medical decisions.
        </p>
      </div>

      {/* Data Accuracy */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">Data Accuracy and Completeness</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Gene interaction records in Ignet are derived through automated text mining of
          PubMed abstracts using NLP and machine learning methods. While every effort is
          made to ensure accuracy, automated extraction is inherently subject to errors
          including false positives, false negatives, and ambiguous entity resolution.
          The development teams do not warrant the completeness, accuracy, or fitness
          for any particular purpose of the data provided.
        </p>
        <p className="text-gray-600 text-sm leading-relaxed">
          AI-generated literature summaries produced by BioSummarAI are based on
          language model outputs and may contain inaccuracies. Users are encouraged
          to consult primary literature sources directly for any research-critical findings.
        </p>
      </div>

      {/* No Warranty */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">No Warranty</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ignet is provided "as is" without warranty of any kind, express or implied,
          including but not limited to warranties of merchantability, fitness for a
          particular purpose, or non-infringement. The development teams at the
          University of North Dakota, the University of Michigan, and Bogazici
          University shall not be liable for any direct, indirect, incidental, special,
          or consequential damages arising from the use of or reliance on Ignet or its data.
        </p>
      </div>

      {/* Citation Requirement */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">Citation Requirement</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Users who publish research results derived from or supported by Ignet data
          are requested to cite the original Ignet publication:
        </p>
        <blockquote className="border-l-4 border-navy pl-4 text-sm text-gray-600 leading-relaxed italic">
          Ozgur A, Hur J, Xiang Z, Ong E, Radev D, and He Y. Ignet: A centrality and
          INO-based web system for analyzing and visualizing literature-mined gene
          interaction networks. ICBO 2016, BioCreative 2016.
        </blockquote>
      </div>

      {/* Third Party Links */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">Third-Party Resources</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ignet provides links to external databases, tools, and publications for
          informational purposes. The development teams do not endorse, control, or
          assume responsibility for the content, accuracy, or availability of any
          third-party resources linked from this platform.
        </p>
      </div>

      <p className="text-gray-400 text-xs text-right">Last updated: 2026</p>
    </div>
  )
}
