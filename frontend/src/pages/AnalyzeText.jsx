export default function AnalyzeText() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center space-y-4">
        <div className="text-4xl">📄</div>
        <span className="inline-block bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
          COMING SOON
        </span>
        <h1 className="text-xl font-bold text-navy">Analyze Your Text</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Upload or paste your own biomedical text to extract gene co-occurrence networks
          and build custom interaction graphs. This feature is currently in development
          as part of Ignet 2.0.
        </p>
        <div className="border-t border-gray-100 pt-4 text-xs text-gray-400">
          Planned features: PDF upload, abstract pasting, custom NLP pipeline,
          interactive result visualization.
        </div>
      </div>
    </div>
  )
}
