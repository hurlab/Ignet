import { describe, it, expect } from 'vitest'
import { parseExperimentTable, validateExperiment, experimentColor, MAX_EXPERIMENT_BYTES } from '../experimentData.js'

describe('experiment import', () => {
  it('preserves quotes, signed/zero values, missing data and scientific notation', () => {
    expect(parseExperimentTable('\uFEFFgene,log2FC,padj\r\n"tp53",-1.5,0\r\nBRCA1,0,NA\r\nEGFR,NA,1e-4').rows).toEqual([
      { gene: 'TP53', inputSymbol: 'tp53', log2FC: -1.5, padj: 0 },
      { gene: 'BRCA1', inputSymbol: 'BRCA1', log2FC: 0, padj: null },
      { gene: 'EGFR', inputSymbol: 'EGFR', log2FC: null, padj: 0.0001 },
    ])
  })
  it('accepts TSV aliases and reports duplicate collapse', () => {
    const parsed = parseExperimentTable('gene_symbol\tlog2FoldChange\tadj_p\nTP53\t2\t0.1\ntp53\t2\t0.1')
    expect(parsed.rows).toHaveLength(1); expect(parsed.duplicates).toBe(1)
  })
  it.each([
    'gene,log2FC,padj\nTP53,1junk,0.1', 'gene,log2FC\nTP53,Infinity',
    'gene,padj\nTP53,-0.1', 'gene,padj\nTP53,1.1', 'gene,log2FC\nTP53,NA',
    'gene,log2FC\nBAD SYMBOL,1', 'gene,log2FC\nTP53,1\ntp53,2',
    'gene,symbol,log2FC\nTP53,TP53,1', 'gene\nTP53', 'gene,log2FC\n"TP53,1',
    'gene,log2FC\nTP53,0x10', 'gene,log2FC\nTP53,1,extra',
  ])('rejects malformed table: %s', text => expect(() => parseExperimentTable(text)).toThrow())
  it('ignores extra DESeq2 columns and accepts edgeR, limma and semicolon headers', () => {
    const tp53 = { gene: 'TP53', inputSymbol: 'TP53', log2FC: 1.5, padj: 0.01 }
    expect(parseExperimentTable('gene,baseMean,log2FoldChange,lfcSE,stat,pvalue,padj\nTP53,100,1.5,0.2,7,0.001,0.01')).toEqual({ rows: [tp53], duplicates: 0 })
    expect(parseExperimentTable('gene,logFC,FDR\nTP53,1.5,0.01').rows).toEqual([tp53])
    expect(parseExperimentTable('Gene,logFC,AveExpr,t,P.Value,adj.P.Val\nTP53,1.5,5,3,0.001,0.01').rows).toEqual([tp53])
    expect(parseExperimentTable('gene;log2FC;padj\nTP53;1.5;0.01').rows).toEqual([tp53])
  })
  it('treats an unnamed first column as gene only when no gene column exists', () => {
    expect(parseExperimentTable('"",baseMean,log2FoldChange,padj\nTP53,100,1.5,0.01').rows[0].gene).toBe('TP53')
    expect(parseExperimentTable(',symbol,log2FC\n1,TP53,2').rows[0]).toEqual({ gene: 'TP53', inputSymbol: 'TP53', log2FC: 2, padj: null })
  })
  it('ignores prototype-like and unknown headers', () => {
    expect(parseExperimentTable('gene,log2FC,constructor,__proto__\nTP53,1,x,y').rows).toEqual([{ gene: 'TP53', inputSymbol: 'TP53', log2FC: 1, padj: null }])
  })
  it('names found headers when no measurement column is recognized; pvalue is not padj', () => {
    expect(() => parseExperimentTable('gene,pvalue\nTP53,0.01')).toThrow(/log2FC and\/or padj; recognized: gene of \[gene, pvalue\]/)
    expect(() => parseExperimentTable('baseMean,pvalue\n1,0.01')).toThrow(/recognized: none of \[baseMean, pvalue\]/)
  })
  it('rejects duplicate recognized columns and ragged rows despite ignored columns', () => {
    expect(() => parseExperimentTable('gene,logFC,log2FoldChange\nTP53,1,1')).toThrow(/Duplicate recognized/)
    expect(() => parseExperimentTable('gene,log2FC,baseMean\nTP53,1')).toThrow(/Column count/)
    expect(() => parseExperimentTable('gene,log2FC,baseMean\nTP53,1,2,3')).toThrow(/Column count/)
  })
  it('bounds file and gene counts', () => {
    expect(() => parseExperimentTable(' '.repeat(MAX_EXPERIMENT_BYTES + 1))).toThrow(/2 MiB/)
    expect(() => parseExperimentTable('gene,log2FC\n' + Array.from({ length: 501 }, (_, i) => `GENE${i},1`).join('\n'))).toThrow(/500/)
  })
})
const valid = () => ({ schema: 'ignet-experiment-v1', name: 'test', importedAt: '2026-10-29T00:00:00.000Z', rows: [{ gene: 'TP53', inputSymbol: 'tp53', log2FC: 1, padj: null }] })
it('reconstructs portable validated values without shared references', () => {
  const value = valid(), result = validateExperiment(value)
  expect(result).toEqual(value); expect(result.rows[0]).not.toBe(value.rows[0])
})
it('rejects unknown fields, duplicate rows and inconsistent symbols', () => {
  expect(() => validateExperiment({ ...valid(), display: {} })).toThrow()
  expect(() => validateExperiment({ ...valid(), rows: [...valid().rows, ...valid().rows] })).toThrow()
  expect(() => validateExperiment({ ...valid(), rows: [{ ...valid().rows[0], inputSymbol: 'OTHER' }] })).toThrow()
})
it('distinguishes zero and missing, and clamps the symmetric color range', () => {
  expect(experimentColor(0, 2)).not.toBe(experimentColor(null, 2))
  expect(experimentColor(-2, 2)).not.toBe(experimentColor(2, 2))
  expect(experimentColor(20, 2)).toBe(experimentColor(2, 2))
})
