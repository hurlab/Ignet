#!/bin/bash
echo "File ID: 7"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 7 2>/data/var/projects/ignet/data/7.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/7.parses /data/var/projects/ignet/data/7.tags.matched >/data/var/projects/ignet/data/7.paths 2>>/data/var/projects/ignet/data/7.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 7 2>>/data/var/projects/ignet/data/7.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/7.filtered.paths /data/var/projects/ignet/data/7.filtered.paths.svm 2>>/data/var/projects/ignet/data/7.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/7.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/7.filtered.scores 2>>/data/var/projects/ignet/data/7.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 7  2>>/data/var/projects/ignet/data/7.error



echo "File ID: 23"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 23 2>/data/var/projects/ignet/data/23.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/23.parses /data/var/projects/ignet/data/23.tags.matched >/data/var/projects/ignet/data/23.paths 2>>/data/var/projects/ignet/data/23.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 23 2>>/data/var/projects/ignet/data/23.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/23.filtered.paths /data/var/projects/ignet/data/23.filtered.paths.svm 2>>/data/var/projects/ignet/data/23.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/23.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/23.filtered.scores 2>>/data/var/projects/ignet/data/23.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 23  2>>/data/var/projects/ignet/data/23.error



echo "File ID: 39"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 39 2>/data/var/projects/ignet/data/39.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/39.parses /data/var/projects/ignet/data/39.tags.matched >/data/var/projects/ignet/data/39.paths 2>>/data/var/projects/ignet/data/39.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 39 2>>/data/var/projects/ignet/data/39.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/39.filtered.paths /data/var/projects/ignet/data/39.filtered.paths.svm 2>>/data/var/projects/ignet/data/39.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/39.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/39.filtered.scores 2>>/data/var/projects/ignet/data/39.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 39  2>>/data/var/projects/ignet/data/39.error



echo "File ID: 55"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 55 2>/data/var/projects/ignet/data/55.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/55.parses /data/var/projects/ignet/data/55.tags.matched >/data/var/projects/ignet/data/55.paths 2>>/data/var/projects/ignet/data/55.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 55 2>>/data/var/projects/ignet/data/55.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/55.filtered.paths /data/var/projects/ignet/data/55.filtered.paths.svm 2>>/data/var/projects/ignet/data/55.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/55.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/55.filtered.scores 2>>/data/var/projects/ignet/data/55.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 55  2>>/data/var/projects/ignet/data/55.error



echo "File ID: 71"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 71 2>/data/var/projects/ignet/data/71.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/71.parses /data/var/projects/ignet/data/71.tags.matched >/data/var/projects/ignet/data/71.paths 2>>/data/var/projects/ignet/data/71.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 71 2>>/data/var/projects/ignet/data/71.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/71.filtered.paths /data/var/projects/ignet/data/71.filtered.paths.svm 2>>/data/var/projects/ignet/data/71.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/71.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/71.filtered.scores 2>>/data/var/projects/ignet/data/71.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 71  2>>/data/var/projects/ignet/data/71.error



echo "File ID: 87"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 87 2>/data/var/projects/ignet/data/87.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/87.parses /data/var/projects/ignet/data/87.tags.matched >/data/var/projects/ignet/data/87.paths 2>>/data/var/projects/ignet/data/87.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 87 2>>/data/var/projects/ignet/data/87.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/87.filtered.paths /data/var/projects/ignet/data/87.filtered.paths.svm 2>>/data/var/projects/ignet/data/87.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/87.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/87.filtered.scores 2>>/data/var/projects/ignet/data/87.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 87  2>>/data/var/projects/ignet/data/87.error



echo "File ID: 103"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 103 2>/data/var/projects/ignet/data/103.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/103.parses /data/var/projects/ignet/data/103.tags.matched >/data/var/projects/ignet/data/103.paths 2>>/data/var/projects/ignet/data/103.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 103 2>>/data/var/projects/ignet/data/103.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/103.filtered.paths /data/var/projects/ignet/data/103.filtered.paths.svm 2>>/data/var/projects/ignet/data/103.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/103.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/103.filtered.scores 2>>/data/var/projects/ignet/data/103.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 103  2>>/data/var/projects/ignet/data/103.error



echo "File ID: 119"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 119 2>/data/var/projects/ignet/data/119.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/119.parses /data/var/projects/ignet/data/119.tags.matched >/data/var/projects/ignet/data/119.paths 2>>/data/var/projects/ignet/data/119.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 119 2>>/data/var/projects/ignet/data/119.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/119.filtered.paths /data/var/projects/ignet/data/119.filtered.paths.svm 2>>/data/var/projects/ignet/data/119.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/119.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/119.filtered.scores 2>>/data/var/projects/ignet/data/119.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 119  2>>/data/var/projects/ignet/data/119.error



echo "File ID: 135"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 135 2>/data/var/projects/ignet/data/135.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/135.parses /data/var/projects/ignet/data/135.tags.matched >/data/var/projects/ignet/data/135.paths 2>>/data/var/projects/ignet/data/135.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 135 2>>/data/var/projects/ignet/data/135.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/135.filtered.paths /data/var/projects/ignet/data/135.filtered.paths.svm 2>>/data/var/projects/ignet/data/135.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/135.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/135.filtered.scores 2>>/data/var/projects/ignet/data/135.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 135  2>>/data/var/projects/ignet/data/135.error



echo "File ID: 151"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 151 2>/data/var/projects/ignet/data/151.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/151.parses /data/var/projects/ignet/data/151.tags.matched >/data/var/projects/ignet/data/151.paths 2>>/data/var/projects/ignet/data/151.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 151 2>>/data/var/projects/ignet/data/151.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/151.filtered.paths /data/var/projects/ignet/data/151.filtered.paths.svm 2>>/data/var/projects/ignet/data/151.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/151.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/151.filtered.scores 2>>/data/var/projects/ignet/data/151.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 151  2>>/data/var/projects/ignet/data/151.error



echo "File ID: 167"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 167 2>/data/var/projects/ignet/data/167.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/167.parses /data/var/projects/ignet/data/167.tags.matched >/data/var/projects/ignet/data/167.paths 2>>/data/var/projects/ignet/data/167.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 167 2>>/data/var/projects/ignet/data/167.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/167.filtered.paths /data/var/projects/ignet/data/167.filtered.paths.svm 2>>/data/var/projects/ignet/data/167.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/167.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/167.filtered.scores 2>>/data/var/projects/ignet/data/167.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 167  2>>/data/var/projects/ignet/data/167.error



echo "File ID: 183"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 183 2>/data/var/projects/ignet/data/183.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/183.parses /data/var/projects/ignet/data/183.tags.matched >/data/var/projects/ignet/data/183.paths 2>>/data/var/projects/ignet/data/183.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 183 2>>/data/var/projects/ignet/data/183.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/183.filtered.paths /data/var/projects/ignet/data/183.filtered.paths.svm 2>>/data/var/projects/ignet/data/183.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/183.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/183.filtered.scores 2>>/data/var/projects/ignet/data/183.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 183  2>>/data/var/projects/ignet/data/183.error



echo "File ID: 199"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 199 2>/data/var/projects/ignet/data/199.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/199.parses /data/var/projects/ignet/data/199.tags.matched >/data/var/projects/ignet/data/199.paths 2>>/data/var/projects/ignet/data/199.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 199 2>>/data/var/projects/ignet/data/199.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/199.filtered.paths /data/var/projects/ignet/data/199.filtered.paths.svm 2>>/data/var/projects/ignet/data/199.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/199.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/199.filtered.scores 2>>/data/var/projects/ignet/data/199.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 199  2>>/data/var/projects/ignet/data/199.error



echo "File ID: 215"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 215 2>/data/var/projects/ignet/data/215.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/215.parses /data/var/projects/ignet/data/215.tags.matched >/data/var/projects/ignet/data/215.paths 2>>/data/var/projects/ignet/data/215.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 215 2>>/data/var/projects/ignet/data/215.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/215.filtered.paths /data/var/projects/ignet/data/215.filtered.paths.svm 2>>/data/var/projects/ignet/data/215.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/215.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/215.filtered.scores 2>>/data/var/projects/ignet/data/215.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 215  2>>/data/var/projects/ignet/data/215.error



echo "File ID: 231"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 231 2>/data/var/projects/ignet/data/231.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/231.parses /data/var/projects/ignet/data/231.tags.matched >/data/var/projects/ignet/data/231.paths 2>>/data/var/projects/ignet/data/231.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 231 2>>/data/var/projects/ignet/data/231.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/231.filtered.paths /data/var/projects/ignet/data/231.filtered.paths.svm 2>>/data/var/projects/ignet/data/231.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/231.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/231.filtered.scores 2>>/data/var/projects/ignet/data/231.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 231  2>>/data/var/projects/ignet/data/231.error



echo "File ID: 247"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 247 2>/data/var/projects/ignet/data/247.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/247.parses /data/var/projects/ignet/data/247.tags.matched >/data/var/projects/ignet/data/247.paths 2>>/data/var/projects/ignet/data/247.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 247 2>>/data/var/projects/ignet/data/247.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/247.filtered.paths /data/var/projects/ignet/data/247.filtered.paths.svm 2>>/data/var/projects/ignet/data/247.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/247.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/247.filtered.scores 2>>/data/var/projects/ignet/data/247.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 247  2>>/data/var/projects/ignet/data/247.error



echo "File ID: 263"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 263 2>/data/var/projects/ignet/data/263.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/263.parses /data/var/projects/ignet/data/263.tags.matched >/data/var/projects/ignet/data/263.paths 2>>/data/var/projects/ignet/data/263.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 263 2>>/data/var/projects/ignet/data/263.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/263.filtered.paths /data/var/projects/ignet/data/263.filtered.paths.svm 2>>/data/var/projects/ignet/data/263.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/263.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/263.filtered.scores 2>>/data/var/projects/ignet/data/263.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 263  2>>/data/var/projects/ignet/data/263.error



echo "File ID: 279"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 279 2>/data/var/projects/ignet/data/279.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/279.parses /data/var/projects/ignet/data/279.tags.matched >/data/var/projects/ignet/data/279.paths 2>>/data/var/projects/ignet/data/279.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 279 2>>/data/var/projects/ignet/data/279.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/279.filtered.paths /data/var/projects/ignet/data/279.filtered.paths.svm 2>>/data/var/projects/ignet/data/279.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/279.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/279.filtered.scores 2>>/data/var/projects/ignet/data/279.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 279  2>>/data/var/projects/ignet/data/279.error



echo "File ID: 295"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 295 2>/data/var/projects/ignet/data/295.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/295.parses /data/var/projects/ignet/data/295.tags.matched >/data/var/projects/ignet/data/295.paths 2>>/data/var/projects/ignet/data/295.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 295 2>>/data/var/projects/ignet/data/295.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/295.filtered.paths /data/var/projects/ignet/data/295.filtered.paths.svm 2>>/data/var/projects/ignet/data/295.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/295.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/295.filtered.scores 2>>/data/var/projects/ignet/data/295.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 295  2>>/data/var/projects/ignet/data/295.error



echo "File ID: 311"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 311 2>/data/var/projects/ignet/data/311.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/311.parses /data/var/projects/ignet/data/311.tags.matched >/data/var/projects/ignet/data/311.paths 2>>/data/var/projects/ignet/data/311.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 311 2>>/data/var/projects/ignet/data/311.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/311.filtered.paths /data/var/projects/ignet/data/311.filtered.paths.svm 2>>/data/var/projects/ignet/data/311.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/311.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/311.filtered.scores 2>>/data/var/projects/ignet/data/311.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 311  2>>/data/var/projects/ignet/data/311.error



echo "File ID: 327"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 327 2>/data/var/projects/ignet/data/327.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/327.parses /data/var/projects/ignet/data/327.tags.matched >/data/var/projects/ignet/data/327.paths 2>>/data/var/projects/ignet/data/327.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 327 2>>/data/var/projects/ignet/data/327.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/327.filtered.paths /data/var/projects/ignet/data/327.filtered.paths.svm 2>>/data/var/projects/ignet/data/327.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/327.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/327.filtered.scores 2>>/data/var/projects/ignet/data/327.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 327  2>>/data/var/projects/ignet/data/327.error



echo "File ID: 343"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 343 2>/data/var/projects/ignet/data/343.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/343.parses /data/var/projects/ignet/data/343.tags.matched >/data/var/projects/ignet/data/343.paths 2>>/data/var/projects/ignet/data/343.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 343 2>>/data/var/projects/ignet/data/343.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/343.filtered.paths /data/var/projects/ignet/data/343.filtered.paths.svm 2>>/data/var/projects/ignet/data/343.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/343.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/343.filtered.scores 2>>/data/var/projects/ignet/data/343.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 343  2>>/data/var/projects/ignet/data/343.error



echo "File ID: 359"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 359 2>/data/var/projects/ignet/data/359.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/359.parses /data/var/projects/ignet/data/359.tags.matched >/data/var/projects/ignet/data/359.paths 2>>/data/var/projects/ignet/data/359.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 359 2>>/data/var/projects/ignet/data/359.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/359.filtered.paths /data/var/projects/ignet/data/359.filtered.paths.svm 2>>/data/var/projects/ignet/data/359.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/359.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/359.filtered.scores 2>>/data/var/projects/ignet/data/359.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 359  2>>/data/var/projects/ignet/data/359.error



echo "File ID: 375"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 375 2>/data/var/projects/ignet/data/375.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/375.parses /data/var/projects/ignet/data/375.tags.matched >/data/var/projects/ignet/data/375.paths 2>>/data/var/projects/ignet/data/375.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 375 2>>/data/var/projects/ignet/data/375.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/375.filtered.paths /data/var/projects/ignet/data/375.filtered.paths.svm 2>>/data/var/projects/ignet/data/375.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/375.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/375.filtered.scores 2>>/data/var/projects/ignet/data/375.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 375  2>>/data/var/projects/ignet/data/375.error



echo "File ID: 391"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 391 2>/data/var/projects/ignet/data/391.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/391.parses /data/var/projects/ignet/data/391.tags.matched >/data/var/projects/ignet/data/391.paths 2>>/data/var/projects/ignet/data/391.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 391 2>>/data/var/projects/ignet/data/391.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/391.filtered.paths /data/var/projects/ignet/data/391.filtered.paths.svm 2>>/data/var/projects/ignet/data/391.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/391.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/391.filtered.scores 2>>/data/var/projects/ignet/data/391.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 391  2>>/data/var/projects/ignet/data/391.error



echo "File ID: 407"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 407 2>/data/var/projects/ignet/data/407.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/407.parses /data/var/projects/ignet/data/407.tags.matched >/data/var/projects/ignet/data/407.paths 2>>/data/var/projects/ignet/data/407.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 407 2>>/data/var/projects/ignet/data/407.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/407.filtered.paths /data/var/projects/ignet/data/407.filtered.paths.svm 2>>/data/var/projects/ignet/data/407.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/407.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/407.filtered.scores 2>>/data/var/projects/ignet/data/407.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 407  2>>/data/var/projects/ignet/data/407.error



echo "File ID: 423"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 423 2>/data/var/projects/ignet/data/423.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/423.parses /data/var/projects/ignet/data/423.tags.matched >/data/var/projects/ignet/data/423.paths 2>>/data/var/projects/ignet/data/423.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 423 2>>/data/var/projects/ignet/data/423.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/423.filtered.paths /data/var/projects/ignet/data/423.filtered.paths.svm 2>>/data/var/projects/ignet/data/423.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/423.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/423.filtered.scores 2>>/data/var/projects/ignet/data/423.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 423  2>>/data/var/projects/ignet/data/423.error



echo "File ID: 439"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 439 2>/data/var/projects/ignet/data/439.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/439.parses /data/var/projects/ignet/data/439.tags.matched >/data/var/projects/ignet/data/439.paths 2>>/data/var/projects/ignet/data/439.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 439 2>>/data/var/projects/ignet/data/439.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/439.filtered.paths /data/var/projects/ignet/data/439.filtered.paths.svm 2>>/data/var/projects/ignet/data/439.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/439.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/439.filtered.scores 2>>/data/var/projects/ignet/data/439.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 439  2>>/data/var/projects/ignet/data/439.error



echo "File ID: 455"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 455 2>/data/var/projects/ignet/data/455.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/455.parses /data/var/projects/ignet/data/455.tags.matched >/data/var/projects/ignet/data/455.paths 2>>/data/var/projects/ignet/data/455.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 455 2>>/data/var/projects/ignet/data/455.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/455.filtered.paths /data/var/projects/ignet/data/455.filtered.paths.svm 2>>/data/var/projects/ignet/data/455.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/455.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/455.filtered.scores 2>>/data/var/projects/ignet/data/455.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 455  2>>/data/var/projects/ignet/data/455.error



echo "File ID: 471"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 471 2>/data/var/projects/ignet/data/471.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/471.parses /data/var/projects/ignet/data/471.tags.matched >/data/var/projects/ignet/data/471.paths 2>>/data/var/projects/ignet/data/471.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 471 2>>/data/var/projects/ignet/data/471.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/471.filtered.paths /data/var/projects/ignet/data/471.filtered.paths.svm 2>>/data/var/projects/ignet/data/471.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/471.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/471.filtered.scores 2>>/data/var/projects/ignet/data/471.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 471  2>>/data/var/projects/ignet/data/471.error



echo "File ID: 487"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 487 2>/data/var/projects/ignet/data/487.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/487.parses /data/var/projects/ignet/data/487.tags.matched >/data/var/projects/ignet/data/487.paths 2>>/data/var/projects/ignet/data/487.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 487 2>>/data/var/projects/ignet/data/487.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/487.filtered.paths /data/var/projects/ignet/data/487.filtered.paths.svm 2>>/data/var/projects/ignet/data/487.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/487.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/487.filtered.scores 2>>/data/var/projects/ignet/data/487.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 487  2>>/data/var/projects/ignet/data/487.error



echo "File ID: 503"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 503 2>/data/var/projects/ignet/data/503.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/503.parses /data/var/projects/ignet/data/503.tags.matched >/data/var/projects/ignet/data/503.paths 2>>/data/var/projects/ignet/data/503.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 503 2>>/data/var/projects/ignet/data/503.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/503.filtered.paths /data/var/projects/ignet/data/503.filtered.paths.svm 2>>/data/var/projects/ignet/data/503.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/503.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/503.filtered.scores 2>>/data/var/projects/ignet/data/503.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 503  2>>/data/var/projects/ignet/data/503.error



echo "File ID: 519"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 519 2>/data/var/projects/ignet/data/519.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/519.parses /data/var/projects/ignet/data/519.tags.matched >/data/var/projects/ignet/data/519.paths 2>>/data/var/projects/ignet/data/519.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 519 2>>/data/var/projects/ignet/data/519.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/519.filtered.paths /data/var/projects/ignet/data/519.filtered.paths.svm 2>>/data/var/projects/ignet/data/519.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/519.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/519.filtered.scores 2>>/data/var/projects/ignet/data/519.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 519  2>>/data/var/projects/ignet/data/519.error



echo "File ID: 535"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 535 2>/data/var/projects/ignet/data/535.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/535.parses /data/var/projects/ignet/data/535.tags.matched >/data/var/projects/ignet/data/535.paths 2>>/data/var/projects/ignet/data/535.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 535 2>>/data/var/projects/ignet/data/535.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/535.filtered.paths /data/var/projects/ignet/data/535.filtered.paths.svm 2>>/data/var/projects/ignet/data/535.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/535.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/535.filtered.scores 2>>/data/var/projects/ignet/data/535.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 535  2>>/data/var/projects/ignet/data/535.error



echo "File ID: 551"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 551 2>/data/var/projects/ignet/data/551.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/551.parses /data/var/projects/ignet/data/551.tags.matched >/data/var/projects/ignet/data/551.paths 2>>/data/var/projects/ignet/data/551.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 551 2>>/data/var/projects/ignet/data/551.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/551.filtered.paths /data/var/projects/ignet/data/551.filtered.paths.svm 2>>/data/var/projects/ignet/data/551.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/551.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/551.filtered.scores 2>>/data/var/projects/ignet/data/551.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 551  2>>/data/var/projects/ignet/data/551.error



echo "File ID: 567"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 567 2>/data/var/projects/ignet/data/567.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/567.parses /data/var/projects/ignet/data/567.tags.matched >/data/var/projects/ignet/data/567.paths 2>>/data/var/projects/ignet/data/567.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 567 2>>/data/var/projects/ignet/data/567.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/567.filtered.paths /data/var/projects/ignet/data/567.filtered.paths.svm 2>>/data/var/projects/ignet/data/567.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/567.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/567.filtered.scores 2>>/data/var/projects/ignet/data/567.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 567  2>>/data/var/projects/ignet/data/567.error



echo "File ID: 583"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 583 2>/data/var/projects/ignet/data/583.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/583.parses /data/var/projects/ignet/data/583.tags.matched >/data/var/projects/ignet/data/583.paths 2>>/data/var/projects/ignet/data/583.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 583 2>>/data/var/projects/ignet/data/583.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/583.filtered.paths /data/var/projects/ignet/data/583.filtered.paths.svm 2>>/data/var/projects/ignet/data/583.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/583.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/583.filtered.scores 2>>/data/var/projects/ignet/data/583.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 583  2>>/data/var/projects/ignet/data/583.error



echo "File ID: 599"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 599 2>/data/var/projects/ignet/data/599.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/599.parses /data/var/projects/ignet/data/599.tags.matched >/data/var/projects/ignet/data/599.paths 2>>/data/var/projects/ignet/data/599.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 599 2>>/data/var/projects/ignet/data/599.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/599.filtered.paths /data/var/projects/ignet/data/599.filtered.paths.svm 2>>/data/var/projects/ignet/data/599.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/599.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/599.filtered.scores 2>>/data/var/projects/ignet/data/599.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 599  2>>/data/var/projects/ignet/data/599.error



echo "File ID: 615"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 615 2>/data/var/projects/ignet/data/615.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/615.parses /data/var/projects/ignet/data/615.tags.matched >/data/var/projects/ignet/data/615.paths 2>>/data/var/projects/ignet/data/615.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 615 2>>/data/var/projects/ignet/data/615.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/615.filtered.paths /data/var/projects/ignet/data/615.filtered.paths.svm 2>>/data/var/projects/ignet/data/615.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/615.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/615.filtered.scores 2>>/data/var/projects/ignet/data/615.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 615  2>>/data/var/projects/ignet/data/615.error



echo "File ID: 631"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 631 2>/data/var/projects/ignet/data/631.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/631.parses /data/var/projects/ignet/data/631.tags.matched >/data/var/projects/ignet/data/631.paths 2>>/data/var/projects/ignet/data/631.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 631 2>>/data/var/projects/ignet/data/631.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/631.filtered.paths /data/var/projects/ignet/data/631.filtered.paths.svm 2>>/data/var/projects/ignet/data/631.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/631.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/631.filtered.scores 2>>/data/var/projects/ignet/data/631.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 631  2>>/data/var/projects/ignet/data/631.error



echo "File ID: 647"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 647 2>/data/var/projects/ignet/data/647.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/647.parses /data/var/projects/ignet/data/647.tags.matched >/data/var/projects/ignet/data/647.paths 2>>/data/var/projects/ignet/data/647.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 647 2>>/data/var/projects/ignet/data/647.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/647.filtered.paths /data/var/projects/ignet/data/647.filtered.paths.svm 2>>/data/var/projects/ignet/data/647.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/647.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/647.filtered.scores 2>>/data/var/projects/ignet/data/647.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 647  2>>/data/var/projects/ignet/data/647.error



echo "File ID: 663"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 663 2>/data/var/projects/ignet/data/663.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/663.parses /data/var/projects/ignet/data/663.tags.matched >/data/var/projects/ignet/data/663.paths 2>>/data/var/projects/ignet/data/663.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 663 2>>/data/var/projects/ignet/data/663.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/663.filtered.paths /data/var/projects/ignet/data/663.filtered.paths.svm 2>>/data/var/projects/ignet/data/663.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/663.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/663.filtered.scores 2>>/data/var/projects/ignet/data/663.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 663  2>>/data/var/projects/ignet/data/663.error



echo "File ID: 679"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 679 2>/data/var/projects/ignet/data/679.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/679.parses /data/var/projects/ignet/data/679.tags.matched >/data/var/projects/ignet/data/679.paths 2>>/data/var/projects/ignet/data/679.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 679 2>>/data/var/projects/ignet/data/679.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/679.filtered.paths /data/var/projects/ignet/data/679.filtered.paths.svm 2>>/data/var/projects/ignet/data/679.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/679.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/679.filtered.scores 2>>/data/var/projects/ignet/data/679.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 679  2>>/data/var/projects/ignet/data/679.error



echo "File ID: 695"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 695 2>/data/var/projects/ignet/data/695.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/695.parses /data/var/projects/ignet/data/695.tags.matched >/data/var/projects/ignet/data/695.paths 2>>/data/var/projects/ignet/data/695.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 695 2>>/data/var/projects/ignet/data/695.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/695.filtered.paths /data/var/projects/ignet/data/695.filtered.paths.svm 2>>/data/var/projects/ignet/data/695.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/695.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/695.filtered.scores 2>>/data/var/projects/ignet/data/695.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 695  2>>/data/var/projects/ignet/data/695.error



echo "File ID: 711"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 711 2>/data/var/projects/ignet/data/711.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/711.parses /data/var/projects/ignet/data/711.tags.matched >/data/var/projects/ignet/data/711.paths 2>>/data/var/projects/ignet/data/711.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 711 2>>/data/var/projects/ignet/data/711.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/711.filtered.paths /data/var/projects/ignet/data/711.filtered.paths.svm 2>>/data/var/projects/ignet/data/711.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/711.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/711.filtered.scores 2>>/data/var/projects/ignet/data/711.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 711  2>>/data/var/projects/ignet/data/711.error



echo "File ID: 727"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 727 2>/data/var/projects/ignet/data/727.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/727.parses /data/var/projects/ignet/data/727.tags.matched >/data/var/projects/ignet/data/727.paths 2>>/data/var/projects/ignet/data/727.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 727 2>>/data/var/projects/ignet/data/727.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/727.filtered.paths /data/var/projects/ignet/data/727.filtered.paths.svm 2>>/data/var/projects/ignet/data/727.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/727.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/727.filtered.scores 2>>/data/var/projects/ignet/data/727.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 727  2>>/data/var/projects/ignet/data/727.error



echo "File ID: 743"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 743 2>/data/var/projects/ignet/data/743.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/743.parses /data/var/projects/ignet/data/743.tags.matched >/data/var/projects/ignet/data/743.paths 2>>/data/var/projects/ignet/data/743.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 743 2>>/data/var/projects/ignet/data/743.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/743.filtered.paths /data/var/projects/ignet/data/743.filtered.paths.svm 2>>/data/var/projects/ignet/data/743.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/743.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/743.filtered.scores 2>>/data/var/projects/ignet/data/743.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 743  2>>/data/var/projects/ignet/data/743.error



echo "File ID: 759"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 759 2>/data/var/projects/ignet/data/759.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/759.parses /data/var/projects/ignet/data/759.tags.matched >/data/var/projects/ignet/data/759.paths 2>>/data/var/projects/ignet/data/759.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 759 2>>/data/var/projects/ignet/data/759.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/759.filtered.paths /data/var/projects/ignet/data/759.filtered.paths.svm 2>>/data/var/projects/ignet/data/759.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/759.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/759.filtered.scores 2>>/data/var/projects/ignet/data/759.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 759  2>>/data/var/projects/ignet/data/759.error



echo "File ID: 775"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 775 2>/data/var/projects/ignet/data/775.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/775.parses /data/var/projects/ignet/data/775.tags.matched >/data/var/projects/ignet/data/775.paths 2>>/data/var/projects/ignet/data/775.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 775 2>>/data/var/projects/ignet/data/775.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/775.filtered.paths /data/var/projects/ignet/data/775.filtered.paths.svm 2>>/data/var/projects/ignet/data/775.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/775.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/775.filtered.scores 2>>/data/var/projects/ignet/data/775.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 775  2>>/data/var/projects/ignet/data/775.error



echo "File ID: 791"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 791 2>/data/var/projects/ignet/data/791.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/791.parses /data/var/projects/ignet/data/791.tags.matched >/data/var/projects/ignet/data/791.paths 2>>/data/var/projects/ignet/data/791.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 791 2>>/data/var/projects/ignet/data/791.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/791.filtered.paths /data/var/projects/ignet/data/791.filtered.paths.svm 2>>/data/var/projects/ignet/data/791.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/791.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/791.filtered.scores 2>>/data/var/projects/ignet/data/791.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 791  2>>/data/var/projects/ignet/data/791.error



echo "File ID: 807"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 807 2>/data/var/projects/ignet/data/807.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/807.parses /data/var/projects/ignet/data/807.tags.matched >/data/var/projects/ignet/data/807.paths 2>>/data/var/projects/ignet/data/807.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 807 2>>/data/var/projects/ignet/data/807.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/807.filtered.paths /data/var/projects/ignet/data/807.filtered.paths.svm 2>>/data/var/projects/ignet/data/807.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/807.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/807.filtered.scores 2>>/data/var/projects/ignet/data/807.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 807  2>>/data/var/projects/ignet/data/807.error



echo "File ID: 823"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 823 2>/data/var/projects/ignet/data/823.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/823.parses /data/var/projects/ignet/data/823.tags.matched >/data/var/projects/ignet/data/823.paths 2>>/data/var/projects/ignet/data/823.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 823 2>>/data/var/projects/ignet/data/823.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/823.filtered.paths /data/var/projects/ignet/data/823.filtered.paths.svm 2>>/data/var/projects/ignet/data/823.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/823.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/823.filtered.scores 2>>/data/var/projects/ignet/data/823.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 823  2>>/data/var/projects/ignet/data/823.error



echo "File ID: 839"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 839 2>/data/var/projects/ignet/data/839.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/839.parses /data/var/projects/ignet/data/839.tags.matched >/data/var/projects/ignet/data/839.paths 2>>/data/var/projects/ignet/data/839.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 839 2>>/data/var/projects/ignet/data/839.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/839.filtered.paths /data/var/projects/ignet/data/839.filtered.paths.svm 2>>/data/var/projects/ignet/data/839.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/839.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/839.filtered.scores 2>>/data/var/projects/ignet/data/839.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 839  2>>/data/var/projects/ignet/data/839.error



echo "File ID: 855"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 855 2>/data/var/projects/ignet/data/855.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/855.parses /data/var/projects/ignet/data/855.tags.matched >/data/var/projects/ignet/data/855.paths 2>>/data/var/projects/ignet/data/855.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 855 2>>/data/var/projects/ignet/data/855.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/855.filtered.paths /data/var/projects/ignet/data/855.filtered.paths.svm 2>>/data/var/projects/ignet/data/855.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/855.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/855.filtered.scores 2>>/data/var/projects/ignet/data/855.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 855  2>>/data/var/projects/ignet/data/855.error



echo "File ID: 871"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 871 2>/data/var/projects/ignet/data/871.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/871.parses /data/var/projects/ignet/data/871.tags.matched >/data/var/projects/ignet/data/871.paths 2>>/data/var/projects/ignet/data/871.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 871 2>>/data/var/projects/ignet/data/871.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/871.filtered.paths /data/var/projects/ignet/data/871.filtered.paths.svm 2>>/data/var/projects/ignet/data/871.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/871.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/871.filtered.scores 2>>/data/var/projects/ignet/data/871.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 871  2>>/data/var/projects/ignet/data/871.error



echo "File ID: 887"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 887 2>/data/var/projects/ignet/data/887.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/887.parses /data/var/projects/ignet/data/887.tags.matched >/data/var/projects/ignet/data/887.paths 2>>/data/var/projects/ignet/data/887.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 887 2>>/data/var/projects/ignet/data/887.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/887.filtered.paths /data/var/projects/ignet/data/887.filtered.paths.svm 2>>/data/var/projects/ignet/data/887.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/887.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/887.filtered.scores 2>>/data/var/projects/ignet/data/887.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 887  2>>/data/var/projects/ignet/data/887.error



echo "File ID: 903"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 903 2>/data/var/projects/ignet/data/903.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/903.parses /data/var/projects/ignet/data/903.tags.matched >/data/var/projects/ignet/data/903.paths 2>>/data/var/projects/ignet/data/903.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 903 2>>/data/var/projects/ignet/data/903.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/903.filtered.paths /data/var/projects/ignet/data/903.filtered.paths.svm 2>>/data/var/projects/ignet/data/903.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/903.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/903.filtered.scores 2>>/data/var/projects/ignet/data/903.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 903  2>>/data/var/projects/ignet/data/903.error



echo "File ID: 919"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 919 2>/data/var/projects/ignet/data/919.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/919.parses /data/var/projects/ignet/data/919.tags.matched >/data/var/projects/ignet/data/919.paths 2>>/data/var/projects/ignet/data/919.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 919 2>>/data/var/projects/ignet/data/919.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/919.filtered.paths /data/var/projects/ignet/data/919.filtered.paths.svm 2>>/data/var/projects/ignet/data/919.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/919.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/919.filtered.scores 2>>/data/var/projects/ignet/data/919.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 919  2>>/data/var/projects/ignet/data/919.error



echo "File ID: 935"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 935 2>/data/var/projects/ignet/data/935.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/935.parses /data/var/projects/ignet/data/935.tags.matched >/data/var/projects/ignet/data/935.paths 2>>/data/var/projects/ignet/data/935.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 935 2>>/data/var/projects/ignet/data/935.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/935.filtered.paths /data/var/projects/ignet/data/935.filtered.paths.svm 2>>/data/var/projects/ignet/data/935.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/935.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/935.filtered.scores 2>>/data/var/projects/ignet/data/935.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 935  2>>/data/var/projects/ignet/data/935.error



echo "File ID: 951"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 951 2>/data/var/projects/ignet/data/951.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/951.parses /data/var/projects/ignet/data/951.tags.matched >/data/var/projects/ignet/data/951.paths 2>>/data/var/projects/ignet/data/951.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 951 2>>/data/var/projects/ignet/data/951.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/951.filtered.paths /data/var/projects/ignet/data/951.filtered.paths.svm 2>>/data/var/projects/ignet/data/951.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/951.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/951.filtered.scores 2>>/data/var/projects/ignet/data/951.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 951  2>>/data/var/projects/ignet/data/951.error



echo "File ID: 967"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 967 2>/data/var/projects/ignet/data/967.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/967.parses /data/var/projects/ignet/data/967.tags.matched >/data/var/projects/ignet/data/967.paths 2>>/data/var/projects/ignet/data/967.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 967 2>>/data/var/projects/ignet/data/967.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/967.filtered.paths /data/var/projects/ignet/data/967.filtered.paths.svm 2>>/data/var/projects/ignet/data/967.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/967.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/967.filtered.scores 2>>/data/var/projects/ignet/data/967.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 967  2>>/data/var/projects/ignet/data/967.error



echo "File ID: 983"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 983 2>/data/var/projects/ignet/data/983.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/983.parses /data/var/projects/ignet/data/983.tags.matched >/data/var/projects/ignet/data/983.paths 2>>/data/var/projects/ignet/data/983.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 983 2>>/data/var/projects/ignet/data/983.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/983.filtered.paths /data/var/projects/ignet/data/983.filtered.paths.svm 2>>/data/var/projects/ignet/data/983.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/983.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/983.filtered.scores 2>>/data/var/projects/ignet/data/983.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 983  2>>/data/var/projects/ignet/data/983.error



echo "File ID: 999"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 999 2>/data/var/projects/ignet/data/999.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/999.parses /data/var/projects/ignet/data/999.tags.matched >/data/var/projects/ignet/data/999.paths 2>>/data/var/projects/ignet/data/999.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 999 2>>/data/var/projects/ignet/data/999.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/999.filtered.paths /data/var/projects/ignet/data/999.filtered.paths.svm 2>>/data/var/projects/ignet/data/999.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/999.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/999.filtered.scores 2>>/data/var/projects/ignet/data/999.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 999  2>>/data/var/projects/ignet/data/999.error


