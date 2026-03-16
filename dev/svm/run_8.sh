#!/bin/bash
echo "File ID: 9"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 9 2>/data/var/projects/ignet/data/9.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/9.parses /data/var/projects/ignet/data/9.tags.matched >/data/var/projects/ignet/data/9.paths 2>>/data/var/projects/ignet/data/9.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 9 2>>/data/var/projects/ignet/data/9.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/9.filtered.paths /data/var/projects/ignet/data/9.filtered.paths.svm 2>>/data/var/projects/ignet/data/9.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/9.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/9.filtered.scores 2>>/data/var/projects/ignet/data/9.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 9  2>>/data/var/projects/ignet/data/9.error



echo "File ID: 25"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 25 2>/data/var/projects/ignet/data/25.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/25.parses /data/var/projects/ignet/data/25.tags.matched >/data/var/projects/ignet/data/25.paths 2>>/data/var/projects/ignet/data/25.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 25 2>>/data/var/projects/ignet/data/25.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/25.filtered.paths /data/var/projects/ignet/data/25.filtered.paths.svm 2>>/data/var/projects/ignet/data/25.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/25.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/25.filtered.scores 2>>/data/var/projects/ignet/data/25.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 25  2>>/data/var/projects/ignet/data/25.error



echo "File ID: 41"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 41 2>/data/var/projects/ignet/data/41.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/41.parses /data/var/projects/ignet/data/41.tags.matched >/data/var/projects/ignet/data/41.paths 2>>/data/var/projects/ignet/data/41.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 41 2>>/data/var/projects/ignet/data/41.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/41.filtered.paths /data/var/projects/ignet/data/41.filtered.paths.svm 2>>/data/var/projects/ignet/data/41.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/41.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/41.filtered.scores 2>>/data/var/projects/ignet/data/41.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 41  2>>/data/var/projects/ignet/data/41.error



echo "File ID: 57"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 57 2>/data/var/projects/ignet/data/57.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/57.parses /data/var/projects/ignet/data/57.tags.matched >/data/var/projects/ignet/data/57.paths 2>>/data/var/projects/ignet/data/57.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 57 2>>/data/var/projects/ignet/data/57.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/57.filtered.paths /data/var/projects/ignet/data/57.filtered.paths.svm 2>>/data/var/projects/ignet/data/57.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/57.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/57.filtered.scores 2>>/data/var/projects/ignet/data/57.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 57  2>>/data/var/projects/ignet/data/57.error



echo "File ID: 73"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 73 2>/data/var/projects/ignet/data/73.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/73.parses /data/var/projects/ignet/data/73.tags.matched >/data/var/projects/ignet/data/73.paths 2>>/data/var/projects/ignet/data/73.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 73 2>>/data/var/projects/ignet/data/73.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/73.filtered.paths /data/var/projects/ignet/data/73.filtered.paths.svm 2>>/data/var/projects/ignet/data/73.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/73.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/73.filtered.scores 2>>/data/var/projects/ignet/data/73.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 73  2>>/data/var/projects/ignet/data/73.error



echo "File ID: 89"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 89 2>/data/var/projects/ignet/data/89.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/89.parses /data/var/projects/ignet/data/89.tags.matched >/data/var/projects/ignet/data/89.paths 2>>/data/var/projects/ignet/data/89.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 89 2>>/data/var/projects/ignet/data/89.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/89.filtered.paths /data/var/projects/ignet/data/89.filtered.paths.svm 2>>/data/var/projects/ignet/data/89.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/89.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/89.filtered.scores 2>>/data/var/projects/ignet/data/89.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 89  2>>/data/var/projects/ignet/data/89.error



echo "File ID: 105"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 105 2>/data/var/projects/ignet/data/105.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/105.parses /data/var/projects/ignet/data/105.tags.matched >/data/var/projects/ignet/data/105.paths 2>>/data/var/projects/ignet/data/105.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 105 2>>/data/var/projects/ignet/data/105.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/105.filtered.paths /data/var/projects/ignet/data/105.filtered.paths.svm 2>>/data/var/projects/ignet/data/105.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/105.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/105.filtered.scores 2>>/data/var/projects/ignet/data/105.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 105  2>>/data/var/projects/ignet/data/105.error



echo "File ID: 121"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 121 2>/data/var/projects/ignet/data/121.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/121.parses /data/var/projects/ignet/data/121.tags.matched >/data/var/projects/ignet/data/121.paths 2>>/data/var/projects/ignet/data/121.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 121 2>>/data/var/projects/ignet/data/121.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/121.filtered.paths /data/var/projects/ignet/data/121.filtered.paths.svm 2>>/data/var/projects/ignet/data/121.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/121.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/121.filtered.scores 2>>/data/var/projects/ignet/data/121.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 121  2>>/data/var/projects/ignet/data/121.error



echo "File ID: 137"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 137 2>/data/var/projects/ignet/data/137.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/137.parses /data/var/projects/ignet/data/137.tags.matched >/data/var/projects/ignet/data/137.paths 2>>/data/var/projects/ignet/data/137.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 137 2>>/data/var/projects/ignet/data/137.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/137.filtered.paths /data/var/projects/ignet/data/137.filtered.paths.svm 2>>/data/var/projects/ignet/data/137.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/137.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/137.filtered.scores 2>>/data/var/projects/ignet/data/137.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 137  2>>/data/var/projects/ignet/data/137.error



echo "File ID: 153"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 153 2>/data/var/projects/ignet/data/153.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/153.parses /data/var/projects/ignet/data/153.tags.matched >/data/var/projects/ignet/data/153.paths 2>>/data/var/projects/ignet/data/153.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 153 2>>/data/var/projects/ignet/data/153.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/153.filtered.paths /data/var/projects/ignet/data/153.filtered.paths.svm 2>>/data/var/projects/ignet/data/153.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/153.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/153.filtered.scores 2>>/data/var/projects/ignet/data/153.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 153  2>>/data/var/projects/ignet/data/153.error



echo "File ID: 169"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 169 2>/data/var/projects/ignet/data/169.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/169.parses /data/var/projects/ignet/data/169.tags.matched >/data/var/projects/ignet/data/169.paths 2>>/data/var/projects/ignet/data/169.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 169 2>>/data/var/projects/ignet/data/169.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/169.filtered.paths /data/var/projects/ignet/data/169.filtered.paths.svm 2>>/data/var/projects/ignet/data/169.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/169.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/169.filtered.scores 2>>/data/var/projects/ignet/data/169.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 169  2>>/data/var/projects/ignet/data/169.error



echo "File ID: 185"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 185 2>/data/var/projects/ignet/data/185.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/185.parses /data/var/projects/ignet/data/185.tags.matched >/data/var/projects/ignet/data/185.paths 2>>/data/var/projects/ignet/data/185.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 185 2>>/data/var/projects/ignet/data/185.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/185.filtered.paths /data/var/projects/ignet/data/185.filtered.paths.svm 2>>/data/var/projects/ignet/data/185.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/185.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/185.filtered.scores 2>>/data/var/projects/ignet/data/185.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 185  2>>/data/var/projects/ignet/data/185.error



echo "File ID: 201"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 201 2>/data/var/projects/ignet/data/201.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/201.parses /data/var/projects/ignet/data/201.tags.matched >/data/var/projects/ignet/data/201.paths 2>>/data/var/projects/ignet/data/201.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 201 2>>/data/var/projects/ignet/data/201.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/201.filtered.paths /data/var/projects/ignet/data/201.filtered.paths.svm 2>>/data/var/projects/ignet/data/201.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/201.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/201.filtered.scores 2>>/data/var/projects/ignet/data/201.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 201  2>>/data/var/projects/ignet/data/201.error



echo "File ID: 217"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 217 2>/data/var/projects/ignet/data/217.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/217.parses /data/var/projects/ignet/data/217.tags.matched >/data/var/projects/ignet/data/217.paths 2>>/data/var/projects/ignet/data/217.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 217 2>>/data/var/projects/ignet/data/217.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/217.filtered.paths /data/var/projects/ignet/data/217.filtered.paths.svm 2>>/data/var/projects/ignet/data/217.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/217.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/217.filtered.scores 2>>/data/var/projects/ignet/data/217.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 217  2>>/data/var/projects/ignet/data/217.error



echo "File ID: 233"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 233 2>/data/var/projects/ignet/data/233.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/233.parses /data/var/projects/ignet/data/233.tags.matched >/data/var/projects/ignet/data/233.paths 2>>/data/var/projects/ignet/data/233.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 233 2>>/data/var/projects/ignet/data/233.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/233.filtered.paths /data/var/projects/ignet/data/233.filtered.paths.svm 2>>/data/var/projects/ignet/data/233.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/233.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/233.filtered.scores 2>>/data/var/projects/ignet/data/233.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 233  2>>/data/var/projects/ignet/data/233.error



echo "File ID: 249"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 249 2>/data/var/projects/ignet/data/249.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/249.parses /data/var/projects/ignet/data/249.tags.matched >/data/var/projects/ignet/data/249.paths 2>>/data/var/projects/ignet/data/249.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 249 2>>/data/var/projects/ignet/data/249.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/249.filtered.paths /data/var/projects/ignet/data/249.filtered.paths.svm 2>>/data/var/projects/ignet/data/249.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/249.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/249.filtered.scores 2>>/data/var/projects/ignet/data/249.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 249  2>>/data/var/projects/ignet/data/249.error



echo "File ID: 265"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 265 2>/data/var/projects/ignet/data/265.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/265.parses /data/var/projects/ignet/data/265.tags.matched >/data/var/projects/ignet/data/265.paths 2>>/data/var/projects/ignet/data/265.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 265 2>>/data/var/projects/ignet/data/265.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/265.filtered.paths /data/var/projects/ignet/data/265.filtered.paths.svm 2>>/data/var/projects/ignet/data/265.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/265.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/265.filtered.scores 2>>/data/var/projects/ignet/data/265.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 265  2>>/data/var/projects/ignet/data/265.error



echo "File ID: 281"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 281 2>/data/var/projects/ignet/data/281.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/281.parses /data/var/projects/ignet/data/281.tags.matched >/data/var/projects/ignet/data/281.paths 2>>/data/var/projects/ignet/data/281.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 281 2>>/data/var/projects/ignet/data/281.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/281.filtered.paths /data/var/projects/ignet/data/281.filtered.paths.svm 2>>/data/var/projects/ignet/data/281.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/281.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/281.filtered.scores 2>>/data/var/projects/ignet/data/281.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 281  2>>/data/var/projects/ignet/data/281.error



echo "File ID: 297"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 297 2>/data/var/projects/ignet/data/297.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/297.parses /data/var/projects/ignet/data/297.tags.matched >/data/var/projects/ignet/data/297.paths 2>>/data/var/projects/ignet/data/297.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 297 2>>/data/var/projects/ignet/data/297.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/297.filtered.paths /data/var/projects/ignet/data/297.filtered.paths.svm 2>>/data/var/projects/ignet/data/297.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/297.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/297.filtered.scores 2>>/data/var/projects/ignet/data/297.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 297  2>>/data/var/projects/ignet/data/297.error



echo "File ID: 313"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 313 2>/data/var/projects/ignet/data/313.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/313.parses /data/var/projects/ignet/data/313.tags.matched >/data/var/projects/ignet/data/313.paths 2>>/data/var/projects/ignet/data/313.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 313 2>>/data/var/projects/ignet/data/313.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/313.filtered.paths /data/var/projects/ignet/data/313.filtered.paths.svm 2>>/data/var/projects/ignet/data/313.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/313.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/313.filtered.scores 2>>/data/var/projects/ignet/data/313.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 313  2>>/data/var/projects/ignet/data/313.error



echo "File ID: 329"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 329 2>/data/var/projects/ignet/data/329.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/329.parses /data/var/projects/ignet/data/329.tags.matched >/data/var/projects/ignet/data/329.paths 2>>/data/var/projects/ignet/data/329.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 329 2>>/data/var/projects/ignet/data/329.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/329.filtered.paths /data/var/projects/ignet/data/329.filtered.paths.svm 2>>/data/var/projects/ignet/data/329.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/329.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/329.filtered.scores 2>>/data/var/projects/ignet/data/329.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 329  2>>/data/var/projects/ignet/data/329.error



echo "File ID: 345"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 345 2>/data/var/projects/ignet/data/345.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/345.parses /data/var/projects/ignet/data/345.tags.matched >/data/var/projects/ignet/data/345.paths 2>>/data/var/projects/ignet/data/345.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 345 2>>/data/var/projects/ignet/data/345.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/345.filtered.paths /data/var/projects/ignet/data/345.filtered.paths.svm 2>>/data/var/projects/ignet/data/345.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/345.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/345.filtered.scores 2>>/data/var/projects/ignet/data/345.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 345  2>>/data/var/projects/ignet/data/345.error



echo "File ID: 361"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 361 2>/data/var/projects/ignet/data/361.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/361.parses /data/var/projects/ignet/data/361.tags.matched >/data/var/projects/ignet/data/361.paths 2>>/data/var/projects/ignet/data/361.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 361 2>>/data/var/projects/ignet/data/361.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/361.filtered.paths /data/var/projects/ignet/data/361.filtered.paths.svm 2>>/data/var/projects/ignet/data/361.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/361.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/361.filtered.scores 2>>/data/var/projects/ignet/data/361.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 361  2>>/data/var/projects/ignet/data/361.error



echo "File ID: 377"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 377 2>/data/var/projects/ignet/data/377.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/377.parses /data/var/projects/ignet/data/377.tags.matched >/data/var/projects/ignet/data/377.paths 2>>/data/var/projects/ignet/data/377.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 377 2>>/data/var/projects/ignet/data/377.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/377.filtered.paths /data/var/projects/ignet/data/377.filtered.paths.svm 2>>/data/var/projects/ignet/data/377.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/377.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/377.filtered.scores 2>>/data/var/projects/ignet/data/377.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 377  2>>/data/var/projects/ignet/data/377.error



echo "File ID: 393"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 393 2>/data/var/projects/ignet/data/393.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/393.parses /data/var/projects/ignet/data/393.tags.matched >/data/var/projects/ignet/data/393.paths 2>>/data/var/projects/ignet/data/393.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 393 2>>/data/var/projects/ignet/data/393.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/393.filtered.paths /data/var/projects/ignet/data/393.filtered.paths.svm 2>>/data/var/projects/ignet/data/393.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/393.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/393.filtered.scores 2>>/data/var/projects/ignet/data/393.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 393  2>>/data/var/projects/ignet/data/393.error



echo "File ID: 409"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 409 2>/data/var/projects/ignet/data/409.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/409.parses /data/var/projects/ignet/data/409.tags.matched >/data/var/projects/ignet/data/409.paths 2>>/data/var/projects/ignet/data/409.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 409 2>>/data/var/projects/ignet/data/409.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/409.filtered.paths /data/var/projects/ignet/data/409.filtered.paths.svm 2>>/data/var/projects/ignet/data/409.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/409.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/409.filtered.scores 2>>/data/var/projects/ignet/data/409.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 409  2>>/data/var/projects/ignet/data/409.error



echo "File ID: 425"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 425 2>/data/var/projects/ignet/data/425.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/425.parses /data/var/projects/ignet/data/425.tags.matched >/data/var/projects/ignet/data/425.paths 2>>/data/var/projects/ignet/data/425.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 425 2>>/data/var/projects/ignet/data/425.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/425.filtered.paths /data/var/projects/ignet/data/425.filtered.paths.svm 2>>/data/var/projects/ignet/data/425.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/425.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/425.filtered.scores 2>>/data/var/projects/ignet/data/425.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 425  2>>/data/var/projects/ignet/data/425.error



echo "File ID: 441"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 441 2>/data/var/projects/ignet/data/441.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/441.parses /data/var/projects/ignet/data/441.tags.matched >/data/var/projects/ignet/data/441.paths 2>>/data/var/projects/ignet/data/441.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 441 2>>/data/var/projects/ignet/data/441.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/441.filtered.paths /data/var/projects/ignet/data/441.filtered.paths.svm 2>>/data/var/projects/ignet/data/441.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/441.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/441.filtered.scores 2>>/data/var/projects/ignet/data/441.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 441  2>>/data/var/projects/ignet/data/441.error



echo "File ID: 457"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 457 2>/data/var/projects/ignet/data/457.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/457.parses /data/var/projects/ignet/data/457.tags.matched >/data/var/projects/ignet/data/457.paths 2>>/data/var/projects/ignet/data/457.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 457 2>>/data/var/projects/ignet/data/457.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/457.filtered.paths /data/var/projects/ignet/data/457.filtered.paths.svm 2>>/data/var/projects/ignet/data/457.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/457.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/457.filtered.scores 2>>/data/var/projects/ignet/data/457.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 457  2>>/data/var/projects/ignet/data/457.error



echo "File ID: 473"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 473 2>/data/var/projects/ignet/data/473.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/473.parses /data/var/projects/ignet/data/473.tags.matched >/data/var/projects/ignet/data/473.paths 2>>/data/var/projects/ignet/data/473.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 473 2>>/data/var/projects/ignet/data/473.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/473.filtered.paths /data/var/projects/ignet/data/473.filtered.paths.svm 2>>/data/var/projects/ignet/data/473.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/473.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/473.filtered.scores 2>>/data/var/projects/ignet/data/473.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 473  2>>/data/var/projects/ignet/data/473.error



echo "File ID: 489"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 489 2>/data/var/projects/ignet/data/489.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/489.parses /data/var/projects/ignet/data/489.tags.matched >/data/var/projects/ignet/data/489.paths 2>>/data/var/projects/ignet/data/489.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 489 2>>/data/var/projects/ignet/data/489.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/489.filtered.paths /data/var/projects/ignet/data/489.filtered.paths.svm 2>>/data/var/projects/ignet/data/489.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/489.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/489.filtered.scores 2>>/data/var/projects/ignet/data/489.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 489  2>>/data/var/projects/ignet/data/489.error



echo "File ID: 505"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 505 2>/data/var/projects/ignet/data/505.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/505.parses /data/var/projects/ignet/data/505.tags.matched >/data/var/projects/ignet/data/505.paths 2>>/data/var/projects/ignet/data/505.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 505 2>>/data/var/projects/ignet/data/505.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/505.filtered.paths /data/var/projects/ignet/data/505.filtered.paths.svm 2>>/data/var/projects/ignet/data/505.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/505.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/505.filtered.scores 2>>/data/var/projects/ignet/data/505.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 505  2>>/data/var/projects/ignet/data/505.error



echo "File ID: 521"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 521 2>/data/var/projects/ignet/data/521.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/521.parses /data/var/projects/ignet/data/521.tags.matched >/data/var/projects/ignet/data/521.paths 2>>/data/var/projects/ignet/data/521.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 521 2>>/data/var/projects/ignet/data/521.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/521.filtered.paths /data/var/projects/ignet/data/521.filtered.paths.svm 2>>/data/var/projects/ignet/data/521.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/521.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/521.filtered.scores 2>>/data/var/projects/ignet/data/521.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 521  2>>/data/var/projects/ignet/data/521.error



echo "File ID: 537"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 537 2>/data/var/projects/ignet/data/537.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/537.parses /data/var/projects/ignet/data/537.tags.matched >/data/var/projects/ignet/data/537.paths 2>>/data/var/projects/ignet/data/537.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 537 2>>/data/var/projects/ignet/data/537.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/537.filtered.paths /data/var/projects/ignet/data/537.filtered.paths.svm 2>>/data/var/projects/ignet/data/537.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/537.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/537.filtered.scores 2>>/data/var/projects/ignet/data/537.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 537  2>>/data/var/projects/ignet/data/537.error



echo "File ID: 553"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 553 2>/data/var/projects/ignet/data/553.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/553.parses /data/var/projects/ignet/data/553.tags.matched >/data/var/projects/ignet/data/553.paths 2>>/data/var/projects/ignet/data/553.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 553 2>>/data/var/projects/ignet/data/553.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/553.filtered.paths /data/var/projects/ignet/data/553.filtered.paths.svm 2>>/data/var/projects/ignet/data/553.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/553.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/553.filtered.scores 2>>/data/var/projects/ignet/data/553.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 553  2>>/data/var/projects/ignet/data/553.error



echo "File ID: 569"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 569 2>/data/var/projects/ignet/data/569.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/569.parses /data/var/projects/ignet/data/569.tags.matched >/data/var/projects/ignet/data/569.paths 2>>/data/var/projects/ignet/data/569.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 569 2>>/data/var/projects/ignet/data/569.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/569.filtered.paths /data/var/projects/ignet/data/569.filtered.paths.svm 2>>/data/var/projects/ignet/data/569.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/569.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/569.filtered.scores 2>>/data/var/projects/ignet/data/569.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 569  2>>/data/var/projects/ignet/data/569.error



echo "File ID: 585"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 585 2>/data/var/projects/ignet/data/585.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/585.parses /data/var/projects/ignet/data/585.tags.matched >/data/var/projects/ignet/data/585.paths 2>>/data/var/projects/ignet/data/585.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 585 2>>/data/var/projects/ignet/data/585.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/585.filtered.paths /data/var/projects/ignet/data/585.filtered.paths.svm 2>>/data/var/projects/ignet/data/585.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/585.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/585.filtered.scores 2>>/data/var/projects/ignet/data/585.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 585  2>>/data/var/projects/ignet/data/585.error



echo "File ID: 601"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 601 2>/data/var/projects/ignet/data/601.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/601.parses /data/var/projects/ignet/data/601.tags.matched >/data/var/projects/ignet/data/601.paths 2>>/data/var/projects/ignet/data/601.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 601 2>>/data/var/projects/ignet/data/601.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/601.filtered.paths /data/var/projects/ignet/data/601.filtered.paths.svm 2>>/data/var/projects/ignet/data/601.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/601.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/601.filtered.scores 2>>/data/var/projects/ignet/data/601.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 601  2>>/data/var/projects/ignet/data/601.error



echo "File ID: 617"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 617 2>/data/var/projects/ignet/data/617.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/617.parses /data/var/projects/ignet/data/617.tags.matched >/data/var/projects/ignet/data/617.paths 2>>/data/var/projects/ignet/data/617.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 617 2>>/data/var/projects/ignet/data/617.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/617.filtered.paths /data/var/projects/ignet/data/617.filtered.paths.svm 2>>/data/var/projects/ignet/data/617.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/617.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/617.filtered.scores 2>>/data/var/projects/ignet/data/617.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 617  2>>/data/var/projects/ignet/data/617.error



echo "File ID: 633"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 633 2>/data/var/projects/ignet/data/633.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/633.parses /data/var/projects/ignet/data/633.tags.matched >/data/var/projects/ignet/data/633.paths 2>>/data/var/projects/ignet/data/633.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 633 2>>/data/var/projects/ignet/data/633.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/633.filtered.paths /data/var/projects/ignet/data/633.filtered.paths.svm 2>>/data/var/projects/ignet/data/633.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/633.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/633.filtered.scores 2>>/data/var/projects/ignet/data/633.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 633  2>>/data/var/projects/ignet/data/633.error



echo "File ID: 649"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 649 2>/data/var/projects/ignet/data/649.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/649.parses /data/var/projects/ignet/data/649.tags.matched >/data/var/projects/ignet/data/649.paths 2>>/data/var/projects/ignet/data/649.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 649 2>>/data/var/projects/ignet/data/649.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/649.filtered.paths /data/var/projects/ignet/data/649.filtered.paths.svm 2>>/data/var/projects/ignet/data/649.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/649.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/649.filtered.scores 2>>/data/var/projects/ignet/data/649.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 649  2>>/data/var/projects/ignet/data/649.error



echo "File ID: 665"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 665 2>/data/var/projects/ignet/data/665.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/665.parses /data/var/projects/ignet/data/665.tags.matched >/data/var/projects/ignet/data/665.paths 2>>/data/var/projects/ignet/data/665.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 665 2>>/data/var/projects/ignet/data/665.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/665.filtered.paths /data/var/projects/ignet/data/665.filtered.paths.svm 2>>/data/var/projects/ignet/data/665.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/665.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/665.filtered.scores 2>>/data/var/projects/ignet/data/665.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 665  2>>/data/var/projects/ignet/data/665.error



echo "File ID: 681"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 681 2>/data/var/projects/ignet/data/681.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/681.parses /data/var/projects/ignet/data/681.tags.matched >/data/var/projects/ignet/data/681.paths 2>>/data/var/projects/ignet/data/681.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 681 2>>/data/var/projects/ignet/data/681.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/681.filtered.paths /data/var/projects/ignet/data/681.filtered.paths.svm 2>>/data/var/projects/ignet/data/681.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/681.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/681.filtered.scores 2>>/data/var/projects/ignet/data/681.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 681  2>>/data/var/projects/ignet/data/681.error



echo "File ID: 697"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 697 2>/data/var/projects/ignet/data/697.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/697.parses /data/var/projects/ignet/data/697.tags.matched >/data/var/projects/ignet/data/697.paths 2>>/data/var/projects/ignet/data/697.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 697 2>>/data/var/projects/ignet/data/697.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/697.filtered.paths /data/var/projects/ignet/data/697.filtered.paths.svm 2>>/data/var/projects/ignet/data/697.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/697.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/697.filtered.scores 2>>/data/var/projects/ignet/data/697.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 697  2>>/data/var/projects/ignet/data/697.error



echo "File ID: 713"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 713 2>/data/var/projects/ignet/data/713.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/713.parses /data/var/projects/ignet/data/713.tags.matched >/data/var/projects/ignet/data/713.paths 2>>/data/var/projects/ignet/data/713.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 713 2>>/data/var/projects/ignet/data/713.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/713.filtered.paths /data/var/projects/ignet/data/713.filtered.paths.svm 2>>/data/var/projects/ignet/data/713.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/713.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/713.filtered.scores 2>>/data/var/projects/ignet/data/713.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 713  2>>/data/var/projects/ignet/data/713.error



echo "File ID: 729"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 729 2>/data/var/projects/ignet/data/729.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/729.parses /data/var/projects/ignet/data/729.tags.matched >/data/var/projects/ignet/data/729.paths 2>>/data/var/projects/ignet/data/729.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 729 2>>/data/var/projects/ignet/data/729.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/729.filtered.paths /data/var/projects/ignet/data/729.filtered.paths.svm 2>>/data/var/projects/ignet/data/729.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/729.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/729.filtered.scores 2>>/data/var/projects/ignet/data/729.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 729  2>>/data/var/projects/ignet/data/729.error



echo "File ID: 745"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 745 2>/data/var/projects/ignet/data/745.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/745.parses /data/var/projects/ignet/data/745.tags.matched >/data/var/projects/ignet/data/745.paths 2>>/data/var/projects/ignet/data/745.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 745 2>>/data/var/projects/ignet/data/745.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/745.filtered.paths /data/var/projects/ignet/data/745.filtered.paths.svm 2>>/data/var/projects/ignet/data/745.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/745.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/745.filtered.scores 2>>/data/var/projects/ignet/data/745.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 745  2>>/data/var/projects/ignet/data/745.error



echo "File ID: 761"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 761 2>/data/var/projects/ignet/data/761.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/761.parses /data/var/projects/ignet/data/761.tags.matched >/data/var/projects/ignet/data/761.paths 2>>/data/var/projects/ignet/data/761.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 761 2>>/data/var/projects/ignet/data/761.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/761.filtered.paths /data/var/projects/ignet/data/761.filtered.paths.svm 2>>/data/var/projects/ignet/data/761.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/761.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/761.filtered.scores 2>>/data/var/projects/ignet/data/761.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 761  2>>/data/var/projects/ignet/data/761.error



echo "File ID: 777"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 777 2>/data/var/projects/ignet/data/777.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/777.parses /data/var/projects/ignet/data/777.tags.matched >/data/var/projects/ignet/data/777.paths 2>>/data/var/projects/ignet/data/777.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 777 2>>/data/var/projects/ignet/data/777.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/777.filtered.paths /data/var/projects/ignet/data/777.filtered.paths.svm 2>>/data/var/projects/ignet/data/777.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/777.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/777.filtered.scores 2>>/data/var/projects/ignet/data/777.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 777  2>>/data/var/projects/ignet/data/777.error



echo "File ID: 793"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 793 2>/data/var/projects/ignet/data/793.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/793.parses /data/var/projects/ignet/data/793.tags.matched >/data/var/projects/ignet/data/793.paths 2>>/data/var/projects/ignet/data/793.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 793 2>>/data/var/projects/ignet/data/793.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/793.filtered.paths /data/var/projects/ignet/data/793.filtered.paths.svm 2>>/data/var/projects/ignet/data/793.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/793.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/793.filtered.scores 2>>/data/var/projects/ignet/data/793.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 793  2>>/data/var/projects/ignet/data/793.error



echo "File ID: 809"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 809 2>/data/var/projects/ignet/data/809.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/809.parses /data/var/projects/ignet/data/809.tags.matched >/data/var/projects/ignet/data/809.paths 2>>/data/var/projects/ignet/data/809.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 809 2>>/data/var/projects/ignet/data/809.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/809.filtered.paths /data/var/projects/ignet/data/809.filtered.paths.svm 2>>/data/var/projects/ignet/data/809.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/809.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/809.filtered.scores 2>>/data/var/projects/ignet/data/809.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 809  2>>/data/var/projects/ignet/data/809.error



echo "File ID: 825"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 825 2>/data/var/projects/ignet/data/825.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/825.parses /data/var/projects/ignet/data/825.tags.matched >/data/var/projects/ignet/data/825.paths 2>>/data/var/projects/ignet/data/825.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 825 2>>/data/var/projects/ignet/data/825.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/825.filtered.paths /data/var/projects/ignet/data/825.filtered.paths.svm 2>>/data/var/projects/ignet/data/825.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/825.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/825.filtered.scores 2>>/data/var/projects/ignet/data/825.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 825  2>>/data/var/projects/ignet/data/825.error



echo "File ID: 841"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 841 2>/data/var/projects/ignet/data/841.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/841.parses /data/var/projects/ignet/data/841.tags.matched >/data/var/projects/ignet/data/841.paths 2>>/data/var/projects/ignet/data/841.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 841 2>>/data/var/projects/ignet/data/841.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/841.filtered.paths /data/var/projects/ignet/data/841.filtered.paths.svm 2>>/data/var/projects/ignet/data/841.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/841.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/841.filtered.scores 2>>/data/var/projects/ignet/data/841.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 841  2>>/data/var/projects/ignet/data/841.error



echo "File ID: 857"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 857 2>/data/var/projects/ignet/data/857.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/857.parses /data/var/projects/ignet/data/857.tags.matched >/data/var/projects/ignet/data/857.paths 2>>/data/var/projects/ignet/data/857.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 857 2>>/data/var/projects/ignet/data/857.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/857.filtered.paths /data/var/projects/ignet/data/857.filtered.paths.svm 2>>/data/var/projects/ignet/data/857.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/857.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/857.filtered.scores 2>>/data/var/projects/ignet/data/857.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 857  2>>/data/var/projects/ignet/data/857.error



echo "File ID: 873"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 873 2>/data/var/projects/ignet/data/873.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/873.parses /data/var/projects/ignet/data/873.tags.matched >/data/var/projects/ignet/data/873.paths 2>>/data/var/projects/ignet/data/873.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 873 2>>/data/var/projects/ignet/data/873.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/873.filtered.paths /data/var/projects/ignet/data/873.filtered.paths.svm 2>>/data/var/projects/ignet/data/873.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/873.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/873.filtered.scores 2>>/data/var/projects/ignet/data/873.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 873  2>>/data/var/projects/ignet/data/873.error



echo "File ID: 889"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 889 2>/data/var/projects/ignet/data/889.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/889.parses /data/var/projects/ignet/data/889.tags.matched >/data/var/projects/ignet/data/889.paths 2>>/data/var/projects/ignet/data/889.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 889 2>>/data/var/projects/ignet/data/889.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/889.filtered.paths /data/var/projects/ignet/data/889.filtered.paths.svm 2>>/data/var/projects/ignet/data/889.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/889.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/889.filtered.scores 2>>/data/var/projects/ignet/data/889.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 889  2>>/data/var/projects/ignet/data/889.error



echo "File ID: 905"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 905 2>/data/var/projects/ignet/data/905.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/905.parses /data/var/projects/ignet/data/905.tags.matched >/data/var/projects/ignet/data/905.paths 2>>/data/var/projects/ignet/data/905.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 905 2>>/data/var/projects/ignet/data/905.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/905.filtered.paths /data/var/projects/ignet/data/905.filtered.paths.svm 2>>/data/var/projects/ignet/data/905.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/905.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/905.filtered.scores 2>>/data/var/projects/ignet/data/905.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 905  2>>/data/var/projects/ignet/data/905.error



echo "File ID: 921"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 921 2>/data/var/projects/ignet/data/921.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/921.parses /data/var/projects/ignet/data/921.tags.matched >/data/var/projects/ignet/data/921.paths 2>>/data/var/projects/ignet/data/921.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 921 2>>/data/var/projects/ignet/data/921.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/921.filtered.paths /data/var/projects/ignet/data/921.filtered.paths.svm 2>>/data/var/projects/ignet/data/921.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/921.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/921.filtered.scores 2>>/data/var/projects/ignet/data/921.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 921  2>>/data/var/projects/ignet/data/921.error



echo "File ID: 937"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 937 2>/data/var/projects/ignet/data/937.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/937.parses /data/var/projects/ignet/data/937.tags.matched >/data/var/projects/ignet/data/937.paths 2>>/data/var/projects/ignet/data/937.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 937 2>>/data/var/projects/ignet/data/937.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/937.filtered.paths /data/var/projects/ignet/data/937.filtered.paths.svm 2>>/data/var/projects/ignet/data/937.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/937.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/937.filtered.scores 2>>/data/var/projects/ignet/data/937.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 937  2>>/data/var/projects/ignet/data/937.error



echo "File ID: 953"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 953 2>/data/var/projects/ignet/data/953.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/953.parses /data/var/projects/ignet/data/953.tags.matched >/data/var/projects/ignet/data/953.paths 2>>/data/var/projects/ignet/data/953.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 953 2>>/data/var/projects/ignet/data/953.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/953.filtered.paths /data/var/projects/ignet/data/953.filtered.paths.svm 2>>/data/var/projects/ignet/data/953.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/953.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/953.filtered.scores 2>>/data/var/projects/ignet/data/953.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 953  2>>/data/var/projects/ignet/data/953.error



echo "File ID: 969"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 969 2>/data/var/projects/ignet/data/969.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/969.parses /data/var/projects/ignet/data/969.tags.matched >/data/var/projects/ignet/data/969.paths 2>>/data/var/projects/ignet/data/969.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 969 2>>/data/var/projects/ignet/data/969.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/969.filtered.paths /data/var/projects/ignet/data/969.filtered.paths.svm 2>>/data/var/projects/ignet/data/969.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/969.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/969.filtered.scores 2>>/data/var/projects/ignet/data/969.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 969  2>>/data/var/projects/ignet/data/969.error



echo "File ID: 985"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 985 2>/data/var/projects/ignet/data/985.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/985.parses /data/var/projects/ignet/data/985.tags.matched >/data/var/projects/ignet/data/985.paths 2>>/data/var/projects/ignet/data/985.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 985 2>>/data/var/projects/ignet/data/985.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/985.filtered.paths /data/var/projects/ignet/data/985.filtered.paths.svm 2>>/data/var/projects/ignet/data/985.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/985.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/985.filtered.scores 2>>/data/var/projects/ignet/data/985.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 985  2>>/data/var/projects/ignet/data/985.error



echo "File ID: 1001"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 1001 2>/data/var/projects/ignet/data/1001.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/1001.parses /data/var/projects/ignet/data/1001.tags.matched >/data/var/projects/ignet/data/1001.paths 2>>/data/var/projects/ignet/data/1001.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 1001 2>>/data/var/projects/ignet/data/1001.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/1001.filtered.paths /data/var/projects/ignet/data/1001.filtered.paths.svm 2>>/data/var/projects/ignet/data/1001.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/1001.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/1001.filtered.scores 2>>/data/var/projects/ignet/data/1001.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 1001  2>>/data/var/projects/ignet/data/1001.error


