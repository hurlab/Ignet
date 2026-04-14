import { useGeneSet } from '../GeneSetContext.jsx'

export default function AddToSetButton({ gene, genes, label }) {
  const gs = useGeneSet()
  if (!gs) return null

  // Bulk mode
  if (genes) {
    const newCount = genes.filter(g => !gs.hasGene(g)).length
    if (newCount === 0) {
      return (
        <span className="text-[10px] text-green-600 px-2 py-0.5 bg-green-50 rounded-full">
          All in set
        </span>
      )
    }
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); gs.addGenes(genes) }}
        className="text-[10px] text-blue-600 hover:text-blue-800 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
        title={`Add ${newCount} gene${newCount > 1 ? 's' : ''} to set`}
      >
        + {label || `Add ${newCount} to set`}
      </button>
    )
  }

  // Single gene mode
  const inSet = gs.hasGene(gene)
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); gs.toggleGene(gene) }}
      className={`text-[10px] w-5 h-5 rounded-full inline-flex items-center justify-center transition-colors ${
        inSet
          ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600'
          : 'bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600'
      }`}
      title={inSet ? `Remove ${gene} from set` : `Add ${gene} to set`}
    >
      {inSet ? '\u2713' : '+'}
    </button>
  )
}
