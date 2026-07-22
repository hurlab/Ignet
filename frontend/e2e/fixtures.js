// A small, fixed cohort of real PubMed IDs (an NFE2L2 / oxidative-stress set)
// used to drive Dignet's PMID mode in e2e tests. Kept compact so tests stay
// fast; large enough to produce a populated entity sidebar and a real
// gene<->ontology network. These PMIDs are in the corpus as of 2026-07.
export const NFE2L2_PMIDS = [
  '33307193', '34303275', '36627482', '37473958', '37503591', '31607206',
  '37879763', '30236989', '37511362', '33618031', '32272498', '29983246',
  '36193742', '34617407', '26887053', '30030777', '36641074', '28383996',
  '35184662', '39062593', '30515697', '40571556', '39020084', '41754117',
  '40676628', '38876457', '26511009', '42196424', '39025451', '27770706',
  '40831377', '41790137', '29729523', '40600748', '34845361', '39978690',
  '27636860', '26435321', '38753446', '34637322',
].join(', ')
