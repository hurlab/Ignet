const linkGroups = [
  {
    category: 'Literature & Gene Databases',
    links: [
      {
        label: 'PubMed',
        url: 'https://pubmed.ncbi.nlm.nih.gov/',
        description:
          'NCBI\'s biomedical literature database — primary source for Ignet\'s gene interaction mining.',
      },
      {
        label: 'NCBI Gene',
        url: 'https://www.ncbi.nlm.nih.gov/gene/',
        description:
          'Authoritative gene records including nomenclature, genomic location, and functional annotations.',
      },
    ],
  },
  {
    category: 'Interaction & Network Databases',
    links: [
      {
        label: 'STRING',
        url: 'https://string-db.org/',
        description:
          'Protein interaction network database integrating experimental, computational, and text-mining evidence.',
      },
      {
        label: 'BioGRID',
        url: 'https://thebiogrid.org/',
        description:
          'Curated repository of protein and genetic interactions from published literature.',
      },
    ],
  },
  {
    category: 'Ontologies',
    links: [
      {
        label: 'INO — Interaction Network Ontology',
        url: 'https://bioportal.bioontology.org/ontologies/INO',
        description:
          'OBO Foundry ontology for representing and classifying gene, protein, and molecular interaction types. Used by Ignet to classify all interaction records.',
      },
      {
        label: 'Vaccine Ontology (VO)',
        url: 'https://bioportal.bioontology.org/ontologies/VO',
        description:
          'Community ontology for vaccine representation, developed in part by the He Lab at University of Michigan.',
      },
    ],
  },
  {
    category: 'NLP & AI Tools',
    links: [
      {
        label: 'SciMiner',
        url: 'http://sciminer.org/',
        description:
          'Web-based literature mining tool for biomedical entity recognition and gene co-occurrence extraction. Core NLP engine behind Ignet\'s literature mining pipeline.',
      },
      {
        label: 'BioBERT',
        url: 'https://github.com/dmis-lab/biobert',
        description:
          'Pre-trained biomedical language model used in Ignet for gene interaction classification and relationship prediction.',
      },
    ],
  },
]

export default function Links() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-navy">Related Resources</h1>
      <p className="text-gray-600 text-sm leading-relaxed">
        External databases, ontologies, and tools relevant to gene interaction research
        and the technologies that power Ignet.
      </p>

      {linkGroups.map((group) => (
        <div key={group.category} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h2 className="text-lg font-bold text-navy">{group.category}</h2>
          <ul className="space-y-3">
            {group.links.map((link) => (
              <li key={link.label} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm font-semibold"
                >
                  {link.label}
                </a>
                <p className="text-gray-600 text-sm leading-relaxed mt-1">{link.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
