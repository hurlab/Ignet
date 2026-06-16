const labs = [
  {
    name: 'Hur Lab — University of North Dakota (UND)',
    pi: 'Dr. Junguk Hur',
    description:
      'Systems biology, network medicine, and bioinformatics. Lead development team for Ignet 2.0.',
    url: 'https://hurlab.med.und.edu',
  },
]

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-navy">Contact Us</h1>
      <p className="text-gray-600 text-sm leading-relaxed">
        For questions, bug reports, or collaboration inquiries related to Ignet,
        please reach out through the channels below.
      </p>

      {/* General Contact */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">General Inquiries</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-semibold text-gray-700">Email: </span>
            <a
              href="mailto:hurlabshared@gmail.com"
              className="text-blue-600 hover:underline"
            >
              hurlabshared@gmail.com
            </a>
          </p>
          <p className="leading-relaxed">
            We welcome feedback from the research community, including reports of data
            inconsistencies, feature requests, and questions about Ignet data or methodology.
          </p>
        </div>
      </div>

      {/* Bug Reports */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">Bug Reports</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          If you encounter an issue with Ignet, please open a GitHub Issue so we
          can track and resolve it efficiently. Include the steps to reproduce the
          problem, the expected behavior, and the observed behavior.
        </p>
        <p className="text-sm">
          <a
            href="https://github.com/hurlab/Ignet/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Open a GitHub Issue
          </a>
        </p>
      </div>

      {/* Source Code */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-bold text-navy">Source Code</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ignet is an open research project. The source code for Ignet 2.0 is
          available on GitHub.
        </p>
        <p className="text-sm">
          <a
            href="https://github.com/hurlab/Ignet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            github.com/hurlab/Ignet
          </a>
        </p>
      </div>

      {/* Research Labs */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <h2 className="text-lg font-bold text-navy">Research Groups</h2>
        <div className="space-y-4">
          {labs.map((lab) => (
            <div key={lab.name} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <h3 className="font-semibold text-gray-800 text-sm">{lab.name}</h3>
              <p className="text-gray-500 text-sm">PI: {lab.pi}</p>
              <p className="text-gray-600 text-sm leading-relaxed mt-1">{lab.description}</p>
              <a
                href={lab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {lab.url}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
