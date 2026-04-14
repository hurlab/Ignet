from transformers import pipeline



#summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

summarizer = pipeline("summarization", model="Falconsai/medical_summarization")

ARTICLE = """ 

PubMed	Sentence
333673	Untreated malaria for more than 4 days in eleven patients decreased significantly prealbumin, transferrin levels and increased SGOT activity when compared with a control group and a group of 10 malaria patients who were admitted to the hospital at an earlier stage of the infection.
333673	In all malaria patients independent of the duration of the acute infection the 1st post albumin peak in polyacrylamide gel electrophoresis (consisting mainly of Gc-globulin, alpha-1-antichymotrypsin and alpha-1 B-glycoprotein) and creatinine were found to be significantly higher compared with the control group.
1290785	After both 1 and 3 months, histologically and biochemically well-formed bone was present in ABG/PDS and DBM/PDS-treated defects, but not in control defects (PDS alone).
1290785	Maximum load before failure of DBM/PDS increased from 65% at 1 month to 100% of that of intact skull at 3 months.
1290785	In contrast, ABG/PDS was 50% as strong as DBM/PDS and not significantly stronger than PDS alone.
1290785	ABG/DBM did not significantly increase in strength from 1 to 3 months.
1290785	We conclude that DBM/PDS is better than ABG/PDS in treating cranial defects in the rat model, and that an absorbable osteoinductive bone substitute with superior mechanical advantage is possible without the disadvantages of ABG.
1458835	Clear species-specific patterns were observed in albumin, transferrin, and for E. grevyi in protease inhibitor-1.
1458835	Protein polymorphism was found in all studied species: E. grevyi--transferrin; E. z. hartmannae--protease inhibitor-1; E. b. boehmi--albumin, GC, transferrin, protease inhibitor-1, protease inhibitor-T; E. b. chapmanni--albumin, GC, transferrin, protease inhibitor-1; E. b. antiquorum--GC, transferrin, protease inhibitor-1. 4.
1458835	The main transferrin components and alpha 1B glycoprotein of zebra (E. b. boehmi) were characterized for terminal sialic acid content.
1493915	Genetic polymorphisms of plasma alpha 1-acid glycoprotein (oro-somucoid, ORM), alpha 2-HS-glycoprotein (A2HS) and alpha 1-B-glycoprotein (alpha 1B) were studied in a group of Parsis in Bombay, India.
1861640	Type 1 (decreased after menopause and increased by estrogen; alpha 1-antitrypsin, alpha 2-HS - glycoprotein, beta 2-glycoprotein III, Gc-globulin, alpha 1-lipoprotein and alpha 2-AP-glycoprotein), type 2 (unchanged and increased; ceruloplasmin), type 3 (increased and decreased; alpha 1-acid glycoprotein, haptoglobin, serum amyloid P-component, Zn-alpha 2-glycoprotein, beta-lipoprotein and C1-components), type 4 (unchanged and decreased; hemopexin, antithrombin III, beta 2-glycoprotein I, prealbumin and retinol-binding-protein), type 5 (unchanged by estrogen; immunoglobulin M (IgM), IgG and others).
1861640	Serum levels of type 1 proteins and some type 5 proteins (IgM, alpha 1B-glycoprotein, C9-component and alpha 2-macroglobulin) were higher in pre-menopausal women than in men, whereas type 3 proteins were the opposite.
1902264	The data demonstrate that the continuous ED fentanyl method offers excellent relief of pain and improvement in ventilatory function and has distinct advantages over IV fentanyl administration with respect to changes in ABGs and MIP.
1952284	Absence of genetic linkage between A1BG, PGD and HPX loci in rabbits.
1952284	Linkage relationships between A1BG, PGD, and HPX loci of rabbits were studied on segregation data in backcross matings.
1969931	Vectobac AS, Skeetal G, Teknar HPD, ABG 6172, ABG 6188, ABG 6193, ABG 6197, ABG 6199, ABG 6138F and ABG 6221 provided excellent control at high dosages and good control (generally greater than 85%) at relatively low concentrations.
2013693	Phenotypes of cat plasma apolipoprotein A4 (APOA4), antithrombin 3 (AT3), alpha 1B-glycoprotein (A1BG), transferrin (TF), vitamin D-binding protein (GC), and an unidentified pretransferrin (PTF) were determined by using simple methods of horizontal, nondenaturing gel electrophoresis followed by protein staining.
2013693	Three alleles were reported for each of TF and PTF, and two alleles were reported for each of GC, APOA4, AT3, and A1BG.
2051488	Examples discussed include the lipocalins, human alpha 1 B-glycoprotein, the cystic fibrosis transmembrane conductance regulator and the globins.
2132132	Patients served as their own controls because RIP and ABG data were obtained the night prior to surgery during sleep.
2132132	Postoperative assessment included RIP, ABG, CONC, and visual analog pain score (PS).
2619106	Genetic polymorphism in both species is described for alpha 1B-glycoprotein (alpha 1B) and three other unidentified proteins designated prealbumin (Pr), postalbumin 1 and 2 (Pa1 and Pa2). alpha 1B was identified by cross-reactivity with antisera for human and pig alpha 1B.
2972708	These repeats show homology to the neural-cell adhesion molecule N-CAM and the plasma alpha 1B-glycoprotein.
3033672	We have cloned a member of this gene family by using long oligonucleotide probes (42-54 nucleotides) based on our protein sequence data for CEA and NCA (nonspecific cross-reacting antigen) and on human codon usage.
3033672	We discuss a domain structure for CEA based on the CEA sequence data and the NCA exon sequence data.
3033672	It is likely that this gene family evolved from a common ancestor shared with neural cell adhesion molecule and alpha 1 B-glycoprotein and is perhaps a family within the immunoglobulin superfamily.
3142478	Haptoglobin and alpha 1 B glycoprotein were shown to be positive acute phase reactants whereas albumin was a negative acute phase reactant.
3145191	Both the GAB and SAB will take 5 working days for a technician to process 15-20 samples at multiple dilutions.
3145191	This clearly demonstrates that both the GAB and SAB are in vitro bioassays and do not fully reflect in vivo activity.
3207218	Genetic polymorphism of plasma alpha 1 B-glycoprotein and transferrin in arctic and silver foxes.
6114940	Urine and serum leucine aminopeptidase, N-acetyl-beta-glucosaminidase and gamma-glutamyl transpeptidase activities in diabetics with and without nephropathy.
6114940	Urinary and serum activities of leucine aminopeptidase (LAP), N-acetyl-beta-glucosaminidase (ABG) and gamma-glutamyl transpeptidase (GGTP) were determined in four groups: 1) control subjects with normal oral glucose tolerance test and normal renal function; 2) latent diabetics with elevated oral glucose tolerance test and diabetic parents; 3) overt diabetics; 4) diabetics with slight nephropathy, exemplified by elevated serum creatinine levels and decreased creatinine clearance.
6300743	Affinity constants were similar in CBG and ABG.
6525475	Of a total of 1725 ears, 1450 had both normal acoustic reflex threshold (ART less than or equal to 100 dB; see text) and air-bone gap (ABG less than or equal to 15 dB); 70 had both abnormal ART and ABG; 160 had abnormal ART but normal ABG; 45 had abnormal ABG but normal ART.
6525475	However, a more comprehensive clinical picture is obtained when both ART and ABG are measured.
6530429	The method was applied to a series of human plasma proteins, including immunoglobulin D, ceruloplasmin, hemopexin, beta-2-glycoprotein I, 3.1S alpha-2-leucine-rich glycoprotein, and alpha-1-B-glycoprotein.
6786325	Preschool children and schoolchildren from a rural area in the northeast of Thailand were compared with children from urban areas for prealbumin, albumin, transferrin, alpha 1 B-glucoprotein, the acute-phase reactants alpha 1-acid glycoprotein, alpha 1-antichymotrypsin, haptoglobin and the proteinase inhibitors alpha 1-protease inhibitor (A1PI) as well as alpha 2-microglobulin (alpha 2M).
6786325	In rural schoolchildren haemoglobin was lower but albumin, transferrin, alpha 1B-glycoprotein and haptoglobin were higher than in urban schoolchildren from the provincial town of Khon Kaen. 5.
7277944	Two-week treatment of PAH patients with propranolol caused a sharp increase in the plasma aldosterone content and 14C-aldosterone binding with ABG and GBG.
7600640	Serum TNF-alpha, ABGs, blood glucose, and hematological studies were determined at 0, 2, and 6 hr after the LPS challenge.
7617239	Bading on CVP, MAP and ABG results, a pharmacologic therapy with enoximone, furosemide, bronchodilators, mucolytics, antacids, antibiotics and inotropics was performed.
7943985	There was complete correlation between MH status of the 392 animals, as diagnosed by a combination of the halothane challenge test with S, GPI, H, A1BG, PGD haplotyping, and the DNA-based test.
8299356	Some serum proteins were identified, and easily interpretable polymorphisms were found in transferrin alpha 1B glycoprotein, protease inhibitors ATC2, ATC3 and AT1, esterase ES1 and in an unidentified postalbumin PO. 3.
8339502	Histologic analysis of bone ingrowth showed that at 12 weeks, bony ingrowth accounted for 21%, 22%, 16%, and 32% of the porous area in the ABG, DBM, DBM + FG, and press-fit groups, respectively.
8344670	Polymorphisms and exclusion data were found for the following markers: A1BG, ABO, ACP1, AHSG, C1R, C6, FY, GC, GLO1, GPT, HP, ITIH1, JK, GYPA, GYPB, ORM, P1, PGM1, PI, PON, RH and TCN2.
8344670	The following markers were nonpolymorphic in this material: ADA, AK1, ALAD, APOA4, APOH, BF, C3, BCHE, CHE2, CO, ESD, FUCA2, F13A1, F13B, KEL, LE, FUT1, LU, PEPD, PGD, PGP, PLG, FUT2, SOD1 and TF.
8479305	Pi decreased in M and H without change in Pe, MVV, or lung mechanics; it was still abnormal 2.5 h after the race and did not correlate with LAC, ABG, training parameters, running times, or subjective tiredness.
8676442	Cyclophilin A is required for the replication of group M human immunodeficiency virus type 1 (HIV-1) and simian immunodeficiency virus SIV(CPZ)GAB but not group O HIV-1 or other primate immunodeficiency viruses.
8930072	Linkage was demonstrated between the locus for F18 E. coli receptors and the loci S, RYR1, GPI, EAH, A1BG and PGD (Z > 20).
9438810	All 18 sites were then randomly assigned to one of six fusion methods: autogenous bone graft (ABG) alone, ABG + rhBMP-2, ABG + collagen (Helistat) "sandwich" + rhBMP-2, ABG + collagen (Helistat) morsels + rhBMP-2, ABG + polylactic/glycolic acid sponge (PLGA) sandwich + rhBMP-2, and ABG + open-pore polylactic acid morsels + rhBMP-2.
11063745	Synthesis and characterization of insulin-like growth factor (IGF)-1 photoprobes selective for the IGF-binding proteins (IGFBPS). photoaffinity labeling of the IGF-binding domain on IGFBP-2.
11063745	Elevated insulin-like growth factor (IGF)-1 levels are prognostic for the development of prostate and breast cancers and exacerbate the complications of diabetes.
11063745	To this end, two IGF-1 photoprobes, N(alphaGly1)-(4-azidobenzoyl)-IGF-1 (abG(1)IGF-1) and N(alphaGly1)-([2-6-(biotinamido)-2(p-azidobenzamido)hexanoamido]ethyl-1,3'-dithiopropionoyl)-IGF-1 (bedG(1)IGF-1), selective for the IGFBPs were synthesized by derivatization of the alpha-amino group of Gly(1), known to be part of the IGFBP-binding domain.
11063745	Mass spectrometric analysis of the reduced, alkylated, and trypsin-digested abG(1)IGF-1.recombinant human IGFBP-2 (rhIGFBP-2) complex indicated photoincorporation near the carboxyl terminus of rhIGFBP-2, between residues 266 and 287.
11063745	Taken together, these data indicate that the IGFBP-binding domain on IGF-1 contacts the distal third of IGFBP-2, providing evidence that the IGF-1-binding domain is located within the C terminus of IGFBP-2.
33491346	Males were significantly higher in PP, ICU, and NP groups, from 2 to 4-fold higher than females, while in the NN group, the number of females was mildly higher than males; the PP patients showed a marked alkalotic, hypoxic, hypocapnia ABG profile with hyperventilation at the time of admission; finally, the laboratory and microbiology results showed lymphopenia, fibrinogen, ESR, CRP, and eGFR were markedly anomalous.
33491346	The total number of CD4+ and CD8+ T cells was dramatically reduced in COVID-19 patients with levels lower than the normal range delimited by 400/μL and 800/μL, respectively, and were negatively correlated with blood inflammatory responses.
33550091	The up-regulated proteins that showed changes of higher magnitude were mucin-7 (MUC-7), peroxiredoxin-4 (PRDX4) and galectin-3 (LEGALS3) whereas proteins such as alpha-1-acid glycoprotein (A1G1) and alpha-1B-glycoprotein (A1BG) were the most down-regulated.
33550091	MUC-7 and PRDX4 expression in saliva after ejaculation could be associated with the protective "environment" created by the organism to exert pr 3o-fertility activities and antioxidants benefits in spermatozoa.
33625304	The results of this study initially identified A2M, IGF2, A1BG and APOA1 as candidate proteins for seasonal estrus induced by nutrition.
33915895	The notable upregulated urinary proteins were serotransferrin, transthyretin, serum albumin, ceruloplasmin, alpha-1B-glycoprotein, syntenin-1, and glutaminyl peptide cyclotransferase, whereas the three notable downregulated proteins were plasma kallikrein, protein glutamine gamma-glutamyl transferase, and serpin B3 (SERPINB3).
33915895	Bioinformatic analysis using ingenuity pathway analysis (IPA) identified the dysregulation of pathways associated with cellular compromise, inflammatory response, cellular assembly, and organization and identified the involvement of the APP and AKT signaling pathways via their interactions with interleukins as the central nodes.
34142023	The MLK-1/SCD-4 Mixed Lineage Kinase/MAP3K functions to promote dauer formation upstream of DAF-2/InsR.
34142023	Mutations disrupting the HEN-1/Jeb ligand, SOC-1/DOS/GAB adaptor protein and SMA-5/ERK5 atypical MAP Kinase caused Scd phenotypes similar to that of mutant SCD-2.
34142023	We validated this finding by showing that a previously characterized deletion in MLK-1 caused a Scd phenotype similar to that of mutant SCD-4 and altered expression from the TGF-beta-responsive GFP reporter, suggesting that SCD-4 and MLK-1 are the same protein.
34142023	Based on shared phenotypes and molecular identities, we hypothesize that MLK-1 functions as a MAP3K in the SCD-2/ALK cascade that signals through SMA-5/ERK5 MAP Kinase to modulate the output of the TGF-beta cascade controlling dauer formation in response to environmental cues.
34885011	Proteomic Analysis Identifies FNDC1, A1BG, and Antigen Processing Proteins Associated with Tumor Heterogeneity and Malignancy in a Canine Model of Breast Cancer.
34885011	Peptides assigned to FNDC1, A1BG, and double-matching keratins 18 and 19 presented a higher intensity in poorly differentiated regions.
34885011	In contrast, we observed a lower intensity of peptides matching calnexin, PDIA3, and HSPA5 in poorly differentiated cells, which enriched for protein folding in the endoplasmic reticulum and antigen processing, assembly, and loading of class I MHC.
34885011	Over-representation of collagen metabolism, coagulation cascade, extracellular matrix components, cadherin-binding and cell adhesion pathways also distinguished cell populations.
34885011	Finally, an independent validation showed FNDC1, A1BG, PDIA3, HSPA5, and calnexin as significant prognostic markers for human breast cancer patients.
34938176	Secondary endpoints included rate of successful weaning, changes in arterial blood gas (ABG) parameters, GCS and sequential organ failure assessment (SOFA) score, hemoglobin (Hgb), ICU-mortality, and duration of ICU stay, were measured before and after the intervention and if successful weaning was recorded.
34938176	No significant difference in ABG, Hgb, GCS and SOFA score, and duration of intubation were seen in the medroxyprogesterone group, but weaning duration was significantly reduced to 1.429 days compared with the control group (p-Value = 0.038).
35054033	The analysis of plasma proteome was performed using LC-MS (liquid chromatography-mass spectrometry). (3) Results: Ten proteins with significantly different serum concentrations between groups volunteers were: complement-factor-B, apolipoprotein-A-I, fibronectin, alpha-2-HS-glycoprotein, alpha-1B-glycoprotein, heat-shock-cognate-71kDa protein/heat-shock-related-70kDa-protein-2, thymidine phosphorylase-2, cytoplasmic-tryptophan-tRNA-ligase, ficolin-2, beta-Ala-His-dipeptidase. (4) Conclusions: This is the first dynamic LC-MS study performed on a clinical model which differentiates serum proteome of patients in acute phase of ischemic stroke in time series and compares to control group.
35112740	The cytokine levels of IL-10, IFN-γ, IL-5, transcription factors T-bet, Foxp-3, and GATA3 were measured.
35112740	Following 6-day treatment, GAB inhibited IL-5 production, but IL-10 and IFN-γ remained high.
35112740	GAB suppressed GATA3 and maintained Foxp-3 and T-bet gene expression, while Dex significantly suppressed GATA3 and T-bet expression.
35112740	GAB simultaneously increased IL-10, IFN-γ associated with induction of T-bet and Foxp3, while suppressing IL-5, which was associated with suppression of GATA3, demonstrating unique beneficial cytokine modulatory effect, which distinguishes from Dex's overall suppression.
35379827	Experimental isotherm data correlated well with BET, FHH and GAB isotherm models.
35500421	Although the significant changes in any protein in Group PC were absent, significant changes were observed in Alpha-1B-glycoprotein (A1BG), Zinc transporterZIP11 (S39AB), Cathelicidin-1 (CTHL1), Actin_ cytoplasmic-1 (ACTB), and Apolipoprotein A-IV (APOA4) proteins in Group PCOL and Alpha-1-antiproteinase (A1AT), Serum amyloid A protein (SAA), Actin-cytoplasmic-2 (ACTG), Protein HP-20 homolog (HP20) proteins in Group PBCOL with colostral treatment, which indicated that the use of colostrum had an effect on calf serum proteomes.
38069155	Thirteen potential markers of IUGR (Gelsolin, Alpha-2-macroglobulin, Apolipoprotein A-IV, Apolipoprotein B-100, Apolipoprotein(a), Adiponectin, Complement C5, Apolipoprotein D, Alpha-1B-glycoprotein, Serum albumin, Fibronectin, Glutathione peroxidase 3, Lipopolysaccharide-binding protein) were found to be inter-connected in a protein-protein network.
38135922	Cutoff values for α-L-iduronidase (IDUA), α-galactosidase (GLA), acid beta glucosidase (ABG), β-galactocerebrosidase (GALC), acid sphingomyelinase (ASM), and acid alpha glucosidase (GAA) were as follows: GLA, > 2.06 μmol/L·h; ABG, > 1.78 μmol/L·h; ASM, > 0.99 μmol/L·h; IDUA, > 1.33 μmol/L·h; GALC, > 0.84 μmol/L·h; and GAA, > 2.06 μmol/L·h.
38206862	Unexpectedly, ABG is not related to saxiphilin, albumin, or other known vitamin carriers, but instead exhibits sequence and structural homology to mammalian hormone carriers and amphibian biliverdin-binding proteins.


"""
print(summarizer(ARTICLE, max_length=1000, min_length=30, do_sample=False))


