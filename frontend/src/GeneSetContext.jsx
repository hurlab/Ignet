import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

const GeneSetContext = createContext(null)
const STORAGE_KEY = 'ignet_geneset'
const SAVED_KEY = 'ignet_geneset_saved'
const MAX_GENES = 500

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

export function GeneSetProvider({ children }) {
  const [genes, setGenes] = useState(() => loadFromStorage(STORAGE_KEY, []))
  const [savedSets, setSavedSets] = useState(() => loadFromStorage(SAVED_KEY, []))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(genes))
  }, [genes])

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedSets))
  }, [savedSets])

  // Sync across tabs
  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) setGenes(e.newValue ? JSON.parse(e.newValue) : [])
      if (e.key === SAVED_KEY) setSavedSets(e.newValue ? JSON.parse(e.newValue) : [])
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const geneSet = useMemo(() => new Set(genes), [genes])

  const hasGene = useCallback((sym) => geneSet.has(sym.toUpperCase()), [geneSet])

  const addGene = useCallback((sym) => {
    const upper = sym.toUpperCase().trim()
    if (!upper || geneSet.has(upper)) return false
    if (genes.length >= MAX_GENES) return false
    setGenes(prev => [...prev, upper])
    return true
  }, [geneSet, genes.length])

  const addGenes = useCallback((syms) => {
    const unique = [...new Set(syms.map(s => s.toUpperCase().trim()).filter(s => s && !geneSet.has(s)))]
    const space = MAX_GENES - genes.length
    if (space <= 0) return 0
    const toAdd = unique.slice(0, space)
    if (toAdd.length === 0) return 0
    setGenes(prev => [...prev, ...toAdd])
    return toAdd.length
  }, [geneSet, genes.length])

  const removeGene = useCallback((sym) => {
    setGenes(prev => prev.filter(g => g !== sym.toUpperCase()))
  }, [])

  const toggleGene = useCallback((sym) => {
    const upper = sym.toUpperCase().trim()
    if (geneSet.has(upper)) {
      setGenes(prev => prev.filter(g => g !== upper))
    } else if (genes.length < MAX_GENES) {
      setGenes(prev => [...prev, upper])
    }
  }, [geneSet, genes.length])

  const clearGenes = useCallback(() => setGenes([]), [])

  const saveCurrentSet = useCallback((name) => {
    setSavedSets(prev => {
      const filtered = prev.filter(s => s.name !== name)
      return [...filtered, { name, genes: [...genes], createdAt: new Date().toISOString() }]
    })
  }, [genes])

  const loadSet = useCallback((name) => {
    const found = savedSets.find(s => s.name === name)
    if (found) setGenes([...found.genes])
  }, [savedSets])

  const deleteSet = useCallback((name) => {
    setSavedSets(prev => prev.filter(s => s.name !== name))
  }, [])

  const value = useMemo(() => ({
    genes, geneSet, savedSets, MAX_GENES,
    hasGene, addGene, addGenes, removeGene, toggleGene, clearGenes,
    saveCurrentSet, loadSet, deleteSet,
  }), [genes, geneSet, savedSets, hasGene, addGene, addGenes, removeGene, toggleGene, clearGenes, saveCurrentSet, loadSet, deleteSet])

  return (
    <GeneSetContext.Provider value={value}>
      {children}
    </GeneSetContext.Provider>
  )
}

export function useGeneSet() {
  return useContext(GeneSetContext)
}
