#!/bin/bash
echo "File ID: 5"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 5 2>/data/var/projects/ignet/data/5.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/5.parses /data/var/projects/ignet/data/5.tags.matched >/data/var/projects/ignet/data/5.paths 2>>/data/var/projects/ignet/data/5.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 5 2>>/data/var/projects/ignet/data/5.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/5.filtered.paths /data/var/projects/ignet/data/5.filtered.paths.svm 2>>/data/var/projects/ignet/data/5.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/5.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/5.filtered.scores 2>>/data/var/projects/ignet/data/5.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 5  2>>/data/var/projects/ignet/data/5.error



echo "File ID: 21"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 21 2>/data/var/projects/ignet/data/21.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/21.parses /data/var/projects/ignet/data/21.tags.matched >/data/var/projects/ignet/data/21.paths 2>>/data/var/projects/ignet/data/21.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 21 2>>/data/var/projects/ignet/data/21.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/21.filtered.paths /data/var/projects/ignet/data/21.filtered.paths.svm 2>>/data/var/projects/ignet/data/21.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/21.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/21.filtered.scores 2>>/data/var/projects/ignet/data/21.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 21  2>>/data/var/projects/ignet/data/21.error



echo "File ID: 37"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 37 2>/data/var/projects/ignet/data/37.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/37.parses /data/var/projects/ignet/data/37.tags.matched >/data/var/projects/ignet/data/37.paths 2>>/data/var/projects/ignet/data/37.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 37 2>>/data/var/projects/ignet/data/37.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/37.filtered.paths /data/var/projects/ignet/data/37.filtered.paths.svm 2>>/data/var/projects/ignet/data/37.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/37.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/37.filtered.scores 2>>/data/var/projects/ignet/data/37.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 37  2>>/data/var/projects/ignet/data/37.error



echo "File ID: 53"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 53 2>/data/var/projects/ignet/data/53.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/53.parses /data/var/projects/ignet/data/53.tags.matched >/data/var/projects/ignet/data/53.paths 2>>/data/var/projects/ignet/data/53.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 53 2>>/data/var/projects/ignet/data/53.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/53.filtered.paths /data/var/projects/ignet/data/53.filtered.paths.svm 2>>/data/var/projects/ignet/data/53.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/53.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/53.filtered.scores 2>>/data/var/projects/ignet/data/53.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 53  2>>/data/var/projects/ignet/data/53.error



echo "File ID: 69"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 69 2>/data/var/projects/ignet/data/69.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/69.parses /data/var/projects/ignet/data/69.tags.matched >/data/var/projects/ignet/data/69.paths 2>>/data/var/projects/ignet/data/69.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 69 2>>/data/var/projects/ignet/data/69.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/69.filtered.paths /data/var/projects/ignet/data/69.filtered.paths.svm 2>>/data/var/projects/ignet/data/69.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/69.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/69.filtered.scores 2>>/data/var/projects/ignet/data/69.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 69  2>>/data/var/projects/ignet/data/69.error



echo "File ID: 85"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 85 2>/data/var/projects/ignet/data/85.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/85.parses /data/var/projects/ignet/data/85.tags.matched >/data/var/projects/ignet/data/85.paths 2>>/data/var/projects/ignet/data/85.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 85 2>>/data/var/projects/ignet/data/85.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/85.filtered.paths /data/var/projects/ignet/data/85.filtered.paths.svm 2>>/data/var/projects/ignet/data/85.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/85.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/85.filtered.scores 2>>/data/var/projects/ignet/data/85.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 85  2>>/data/var/projects/ignet/data/85.error



echo "File ID: 101"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 101 2>/data/var/projects/ignet/data/101.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/101.parses /data/var/projects/ignet/data/101.tags.matched >/data/var/projects/ignet/data/101.paths 2>>/data/var/projects/ignet/data/101.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 101 2>>/data/var/projects/ignet/data/101.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/101.filtered.paths /data/var/projects/ignet/data/101.filtered.paths.svm 2>>/data/var/projects/ignet/data/101.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/101.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/101.filtered.scores 2>>/data/var/projects/ignet/data/101.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 101  2>>/data/var/projects/ignet/data/101.error



echo "File ID: 117"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 117 2>/data/var/projects/ignet/data/117.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/117.parses /data/var/projects/ignet/data/117.tags.matched >/data/var/projects/ignet/data/117.paths 2>>/data/var/projects/ignet/data/117.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 117 2>>/data/var/projects/ignet/data/117.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/117.filtered.paths /data/var/projects/ignet/data/117.filtered.paths.svm 2>>/data/var/projects/ignet/data/117.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/117.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/117.filtered.scores 2>>/data/var/projects/ignet/data/117.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 117  2>>/data/var/projects/ignet/data/117.error



echo "File ID: 133"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 133 2>/data/var/projects/ignet/data/133.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/133.parses /data/var/projects/ignet/data/133.tags.matched >/data/var/projects/ignet/data/133.paths 2>>/data/var/projects/ignet/data/133.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 133 2>>/data/var/projects/ignet/data/133.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/133.filtered.paths /data/var/projects/ignet/data/133.filtered.paths.svm 2>>/data/var/projects/ignet/data/133.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/133.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/133.filtered.scores 2>>/data/var/projects/ignet/data/133.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 133  2>>/data/var/projects/ignet/data/133.error



echo "File ID: 149"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 149 2>/data/var/projects/ignet/data/149.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/149.parses /data/var/projects/ignet/data/149.tags.matched >/data/var/projects/ignet/data/149.paths 2>>/data/var/projects/ignet/data/149.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 149 2>>/data/var/projects/ignet/data/149.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/149.filtered.paths /data/var/projects/ignet/data/149.filtered.paths.svm 2>>/data/var/projects/ignet/data/149.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/149.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/149.filtered.scores 2>>/data/var/projects/ignet/data/149.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 149  2>>/data/var/projects/ignet/data/149.error



echo "File ID: 165"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 165 2>/data/var/projects/ignet/data/165.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/165.parses /data/var/projects/ignet/data/165.tags.matched >/data/var/projects/ignet/data/165.paths 2>>/data/var/projects/ignet/data/165.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 165 2>>/data/var/projects/ignet/data/165.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/165.filtered.paths /data/var/projects/ignet/data/165.filtered.paths.svm 2>>/data/var/projects/ignet/data/165.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/165.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/165.filtered.scores 2>>/data/var/projects/ignet/data/165.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 165  2>>/data/var/projects/ignet/data/165.error



echo "File ID: 181"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 181 2>/data/var/projects/ignet/data/181.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/181.parses /data/var/projects/ignet/data/181.tags.matched >/data/var/projects/ignet/data/181.paths 2>>/data/var/projects/ignet/data/181.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 181 2>>/data/var/projects/ignet/data/181.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/181.filtered.paths /data/var/projects/ignet/data/181.filtered.paths.svm 2>>/data/var/projects/ignet/data/181.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/181.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/181.filtered.scores 2>>/data/var/projects/ignet/data/181.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 181  2>>/data/var/projects/ignet/data/181.error



echo "File ID: 197"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 197 2>/data/var/projects/ignet/data/197.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/197.parses /data/var/projects/ignet/data/197.tags.matched >/data/var/projects/ignet/data/197.paths 2>>/data/var/projects/ignet/data/197.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 197 2>>/data/var/projects/ignet/data/197.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/197.filtered.paths /data/var/projects/ignet/data/197.filtered.paths.svm 2>>/data/var/projects/ignet/data/197.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/197.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/197.filtered.scores 2>>/data/var/projects/ignet/data/197.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 197  2>>/data/var/projects/ignet/data/197.error



echo "File ID: 213"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 213 2>/data/var/projects/ignet/data/213.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/213.parses /data/var/projects/ignet/data/213.tags.matched >/data/var/projects/ignet/data/213.paths 2>>/data/var/projects/ignet/data/213.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 213 2>>/data/var/projects/ignet/data/213.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/213.filtered.paths /data/var/projects/ignet/data/213.filtered.paths.svm 2>>/data/var/projects/ignet/data/213.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/213.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/213.filtered.scores 2>>/data/var/projects/ignet/data/213.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 213  2>>/data/var/projects/ignet/data/213.error



echo "File ID: 229"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 229 2>/data/var/projects/ignet/data/229.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/229.parses /data/var/projects/ignet/data/229.tags.matched >/data/var/projects/ignet/data/229.paths 2>>/data/var/projects/ignet/data/229.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 229 2>>/data/var/projects/ignet/data/229.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/229.filtered.paths /data/var/projects/ignet/data/229.filtered.paths.svm 2>>/data/var/projects/ignet/data/229.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/229.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/229.filtered.scores 2>>/data/var/projects/ignet/data/229.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 229  2>>/data/var/projects/ignet/data/229.error



echo "File ID: 245"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 245 2>/data/var/projects/ignet/data/245.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/245.parses /data/var/projects/ignet/data/245.tags.matched >/data/var/projects/ignet/data/245.paths 2>>/data/var/projects/ignet/data/245.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 245 2>>/data/var/projects/ignet/data/245.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/245.filtered.paths /data/var/projects/ignet/data/245.filtered.paths.svm 2>>/data/var/projects/ignet/data/245.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/245.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/245.filtered.scores 2>>/data/var/projects/ignet/data/245.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 245  2>>/data/var/projects/ignet/data/245.error



echo "File ID: 261"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 261 2>/data/var/projects/ignet/data/261.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/261.parses /data/var/projects/ignet/data/261.tags.matched >/data/var/projects/ignet/data/261.paths 2>>/data/var/projects/ignet/data/261.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 261 2>>/data/var/projects/ignet/data/261.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/261.filtered.paths /data/var/projects/ignet/data/261.filtered.paths.svm 2>>/data/var/projects/ignet/data/261.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/261.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/261.filtered.scores 2>>/data/var/projects/ignet/data/261.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 261  2>>/data/var/projects/ignet/data/261.error



echo "File ID: 277"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 277 2>/data/var/projects/ignet/data/277.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/277.parses /data/var/projects/ignet/data/277.tags.matched >/data/var/projects/ignet/data/277.paths 2>>/data/var/projects/ignet/data/277.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 277 2>>/data/var/projects/ignet/data/277.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/277.filtered.paths /data/var/projects/ignet/data/277.filtered.paths.svm 2>>/data/var/projects/ignet/data/277.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/277.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/277.filtered.scores 2>>/data/var/projects/ignet/data/277.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 277  2>>/data/var/projects/ignet/data/277.error



echo "File ID: 293"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 293 2>/data/var/projects/ignet/data/293.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/293.parses /data/var/projects/ignet/data/293.tags.matched >/data/var/projects/ignet/data/293.paths 2>>/data/var/projects/ignet/data/293.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 293 2>>/data/var/projects/ignet/data/293.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/293.filtered.paths /data/var/projects/ignet/data/293.filtered.paths.svm 2>>/data/var/projects/ignet/data/293.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/293.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/293.filtered.scores 2>>/data/var/projects/ignet/data/293.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 293  2>>/data/var/projects/ignet/data/293.error



echo "File ID: 309"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 309 2>/data/var/projects/ignet/data/309.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/309.parses /data/var/projects/ignet/data/309.tags.matched >/data/var/projects/ignet/data/309.paths 2>>/data/var/projects/ignet/data/309.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 309 2>>/data/var/projects/ignet/data/309.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/309.filtered.paths /data/var/projects/ignet/data/309.filtered.paths.svm 2>>/data/var/projects/ignet/data/309.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/309.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/309.filtered.scores 2>>/data/var/projects/ignet/data/309.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 309  2>>/data/var/projects/ignet/data/309.error



echo "File ID: 325"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 325 2>/data/var/projects/ignet/data/325.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/325.parses /data/var/projects/ignet/data/325.tags.matched >/data/var/projects/ignet/data/325.paths 2>>/data/var/projects/ignet/data/325.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 325 2>>/data/var/projects/ignet/data/325.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/325.filtered.paths /data/var/projects/ignet/data/325.filtered.paths.svm 2>>/data/var/projects/ignet/data/325.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/325.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/325.filtered.scores 2>>/data/var/projects/ignet/data/325.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 325  2>>/data/var/projects/ignet/data/325.error



echo "File ID: 341"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 341 2>/data/var/projects/ignet/data/341.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/341.parses /data/var/projects/ignet/data/341.tags.matched >/data/var/projects/ignet/data/341.paths 2>>/data/var/projects/ignet/data/341.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 341 2>>/data/var/projects/ignet/data/341.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/341.filtered.paths /data/var/projects/ignet/data/341.filtered.paths.svm 2>>/data/var/projects/ignet/data/341.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/341.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/341.filtered.scores 2>>/data/var/projects/ignet/data/341.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 341  2>>/data/var/projects/ignet/data/341.error



echo "File ID: 357"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 357 2>/data/var/projects/ignet/data/357.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/357.parses /data/var/projects/ignet/data/357.tags.matched >/data/var/projects/ignet/data/357.paths 2>>/data/var/projects/ignet/data/357.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 357 2>>/data/var/projects/ignet/data/357.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/357.filtered.paths /data/var/projects/ignet/data/357.filtered.paths.svm 2>>/data/var/projects/ignet/data/357.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/357.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/357.filtered.scores 2>>/data/var/projects/ignet/data/357.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 357  2>>/data/var/projects/ignet/data/357.error



echo "File ID: 373"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 373 2>/data/var/projects/ignet/data/373.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/373.parses /data/var/projects/ignet/data/373.tags.matched >/data/var/projects/ignet/data/373.paths 2>>/data/var/projects/ignet/data/373.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 373 2>>/data/var/projects/ignet/data/373.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/373.filtered.paths /data/var/projects/ignet/data/373.filtered.paths.svm 2>>/data/var/projects/ignet/data/373.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/373.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/373.filtered.scores 2>>/data/var/projects/ignet/data/373.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 373  2>>/data/var/projects/ignet/data/373.error



echo "File ID: 389"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 389 2>/data/var/projects/ignet/data/389.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/389.parses /data/var/projects/ignet/data/389.tags.matched >/data/var/projects/ignet/data/389.paths 2>>/data/var/projects/ignet/data/389.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 389 2>>/data/var/projects/ignet/data/389.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/389.filtered.paths /data/var/projects/ignet/data/389.filtered.paths.svm 2>>/data/var/projects/ignet/data/389.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/389.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/389.filtered.scores 2>>/data/var/projects/ignet/data/389.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 389  2>>/data/var/projects/ignet/data/389.error



echo "File ID: 405"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 405 2>/data/var/projects/ignet/data/405.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/405.parses /data/var/projects/ignet/data/405.tags.matched >/data/var/projects/ignet/data/405.paths 2>>/data/var/projects/ignet/data/405.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 405 2>>/data/var/projects/ignet/data/405.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/405.filtered.paths /data/var/projects/ignet/data/405.filtered.paths.svm 2>>/data/var/projects/ignet/data/405.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/405.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/405.filtered.scores 2>>/data/var/projects/ignet/data/405.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 405  2>>/data/var/projects/ignet/data/405.error



echo "File ID: 421"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 421 2>/data/var/projects/ignet/data/421.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/421.parses /data/var/projects/ignet/data/421.tags.matched >/data/var/projects/ignet/data/421.paths 2>>/data/var/projects/ignet/data/421.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 421 2>>/data/var/projects/ignet/data/421.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/421.filtered.paths /data/var/projects/ignet/data/421.filtered.paths.svm 2>>/data/var/projects/ignet/data/421.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/421.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/421.filtered.scores 2>>/data/var/projects/ignet/data/421.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 421  2>>/data/var/projects/ignet/data/421.error



echo "File ID: 437"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 437 2>/data/var/projects/ignet/data/437.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/437.parses /data/var/projects/ignet/data/437.tags.matched >/data/var/projects/ignet/data/437.paths 2>>/data/var/projects/ignet/data/437.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 437 2>>/data/var/projects/ignet/data/437.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/437.filtered.paths /data/var/projects/ignet/data/437.filtered.paths.svm 2>>/data/var/projects/ignet/data/437.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/437.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/437.filtered.scores 2>>/data/var/projects/ignet/data/437.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 437  2>>/data/var/projects/ignet/data/437.error



echo "File ID: 453"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 453 2>/data/var/projects/ignet/data/453.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/453.parses /data/var/projects/ignet/data/453.tags.matched >/data/var/projects/ignet/data/453.paths 2>>/data/var/projects/ignet/data/453.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 453 2>>/data/var/projects/ignet/data/453.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/453.filtered.paths /data/var/projects/ignet/data/453.filtered.paths.svm 2>>/data/var/projects/ignet/data/453.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/453.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/453.filtered.scores 2>>/data/var/projects/ignet/data/453.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 453  2>>/data/var/projects/ignet/data/453.error



echo "File ID: 469"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 469 2>/data/var/projects/ignet/data/469.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/469.parses /data/var/projects/ignet/data/469.tags.matched >/data/var/projects/ignet/data/469.paths 2>>/data/var/projects/ignet/data/469.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 469 2>>/data/var/projects/ignet/data/469.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/469.filtered.paths /data/var/projects/ignet/data/469.filtered.paths.svm 2>>/data/var/projects/ignet/data/469.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/469.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/469.filtered.scores 2>>/data/var/projects/ignet/data/469.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 469  2>>/data/var/projects/ignet/data/469.error



echo "File ID: 485"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 485 2>/data/var/projects/ignet/data/485.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/485.parses /data/var/projects/ignet/data/485.tags.matched >/data/var/projects/ignet/data/485.paths 2>>/data/var/projects/ignet/data/485.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 485 2>>/data/var/projects/ignet/data/485.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/485.filtered.paths /data/var/projects/ignet/data/485.filtered.paths.svm 2>>/data/var/projects/ignet/data/485.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/485.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/485.filtered.scores 2>>/data/var/projects/ignet/data/485.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 485  2>>/data/var/projects/ignet/data/485.error



echo "File ID: 501"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 501 2>/data/var/projects/ignet/data/501.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/501.parses /data/var/projects/ignet/data/501.tags.matched >/data/var/projects/ignet/data/501.paths 2>>/data/var/projects/ignet/data/501.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 501 2>>/data/var/projects/ignet/data/501.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/501.filtered.paths /data/var/projects/ignet/data/501.filtered.paths.svm 2>>/data/var/projects/ignet/data/501.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/501.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/501.filtered.scores 2>>/data/var/projects/ignet/data/501.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 501  2>>/data/var/projects/ignet/data/501.error



echo "File ID: 517"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 517 2>/data/var/projects/ignet/data/517.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/517.parses /data/var/projects/ignet/data/517.tags.matched >/data/var/projects/ignet/data/517.paths 2>>/data/var/projects/ignet/data/517.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 517 2>>/data/var/projects/ignet/data/517.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/517.filtered.paths /data/var/projects/ignet/data/517.filtered.paths.svm 2>>/data/var/projects/ignet/data/517.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/517.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/517.filtered.scores 2>>/data/var/projects/ignet/data/517.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 517  2>>/data/var/projects/ignet/data/517.error



echo "File ID: 533"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 533 2>/data/var/projects/ignet/data/533.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/533.parses /data/var/projects/ignet/data/533.tags.matched >/data/var/projects/ignet/data/533.paths 2>>/data/var/projects/ignet/data/533.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 533 2>>/data/var/projects/ignet/data/533.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/533.filtered.paths /data/var/projects/ignet/data/533.filtered.paths.svm 2>>/data/var/projects/ignet/data/533.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/533.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/533.filtered.scores 2>>/data/var/projects/ignet/data/533.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 533  2>>/data/var/projects/ignet/data/533.error



echo "File ID: 549"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 549 2>/data/var/projects/ignet/data/549.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/549.parses /data/var/projects/ignet/data/549.tags.matched >/data/var/projects/ignet/data/549.paths 2>>/data/var/projects/ignet/data/549.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 549 2>>/data/var/projects/ignet/data/549.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/549.filtered.paths /data/var/projects/ignet/data/549.filtered.paths.svm 2>>/data/var/projects/ignet/data/549.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/549.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/549.filtered.scores 2>>/data/var/projects/ignet/data/549.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 549  2>>/data/var/projects/ignet/data/549.error



echo "File ID: 565"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 565 2>/data/var/projects/ignet/data/565.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/565.parses /data/var/projects/ignet/data/565.tags.matched >/data/var/projects/ignet/data/565.paths 2>>/data/var/projects/ignet/data/565.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 565 2>>/data/var/projects/ignet/data/565.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/565.filtered.paths /data/var/projects/ignet/data/565.filtered.paths.svm 2>>/data/var/projects/ignet/data/565.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/565.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/565.filtered.scores 2>>/data/var/projects/ignet/data/565.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 565  2>>/data/var/projects/ignet/data/565.error



echo "File ID: 581"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 581 2>/data/var/projects/ignet/data/581.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/581.parses /data/var/projects/ignet/data/581.tags.matched >/data/var/projects/ignet/data/581.paths 2>>/data/var/projects/ignet/data/581.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 581 2>>/data/var/projects/ignet/data/581.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/581.filtered.paths /data/var/projects/ignet/data/581.filtered.paths.svm 2>>/data/var/projects/ignet/data/581.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/581.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/581.filtered.scores 2>>/data/var/projects/ignet/data/581.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 581  2>>/data/var/projects/ignet/data/581.error



echo "File ID: 597"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 597 2>/data/var/projects/ignet/data/597.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/597.parses /data/var/projects/ignet/data/597.tags.matched >/data/var/projects/ignet/data/597.paths 2>>/data/var/projects/ignet/data/597.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 597 2>>/data/var/projects/ignet/data/597.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/597.filtered.paths /data/var/projects/ignet/data/597.filtered.paths.svm 2>>/data/var/projects/ignet/data/597.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/597.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/597.filtered.scores 2>>/data/var/projects/ignet/data/597.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 597  2>>/data/var/projects/ignet/data/597.error



echo "File ID: 613"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 613 2>/data/var/projects/ignet/data/613.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/613.parses /data/var/projects/ignet/data/613.tags.matched >/data/var/projects/ignet/data/613.paths 2>>/data/var/projects/ignet/data/613.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 613 2>>/data/var/projects/ignet/data/613.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/613.filtered.paths /data/var/projects/ignet/data/613.filtered.paths.svm 2>>/data/var/projects/ignet/data/613.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/613.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/613.filtered.scores 2>>/data/var/projects/ignet/data/613.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 613  2>>/data/var/projects/ignet/data/613.error



echo "File ID: 629"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 629 2>/data/var/projects/ignet/data/629.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/629.parses /data/var/projects/ignet/data/629.tags.matched >/data/var/projects/ignet/data/629.paths 2>>/data/var/projects/ignet/data/629.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 629 2>>/data/var/projects/ignet/data/629.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/629.filtered.paths /data/var/projects/ignet/data/629.filtered.paths.svm 2>>/data/var/projects/ignet/data/629.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/629.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/629.filtered.scores 2>>/data/var/projects/ignet/data/629.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 629  2>>/data/var/projects/ignet/data/629.error



echo "File ID: 645"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 645 2>/data/var/projects/ignet/data/645.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/645.parses /data/var/projects/ignet/data/645.tags.matched >/data/var/projects/ignet/data/645.paths 2>>/data/var/projects/ignet/data/645.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 645 2>>/data/var/projects/ignet/data/645.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/645.filtered.paths /data/var/projects/ignet/data/645.filtered.paths.svm 2>>/data/var/projects/ignet/data/645.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/645.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/645.filtered.scores 2>>/data/var/projects/ignet/data/645.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 645  2>>/data/var/projects/ignet/data/645.error



echo "File ID: 661"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 661 2>/data/var/projects/ignet/data/661.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/661.parses /data/var/projects/ignet/data/661.tags.matched >/data/var/projects/ignet/data/661.paths 2>>/data/var/projects/ignet/data/661.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 661 2>>/data/var/projects/ignet/data/661.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/661.filtered.paths /data/var/projects/ignet/data/661.filtered.paths.svm 2>>/data/var/projects/ignet/data/661.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/661.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/661.filtered.scores 2>>/data/var/projects/ignet/data/661.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 661  2>>/data/var/projects/ignet/data/661.error



echo "File ID: 677"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 677 2>/data/var/projects/ignet/data/677.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/677.parses /data/var/projects/ignet/data/677.tags.matched >/data/var/projects/ignet/data/677.paths 2>>/data/var/projects/ignet/data/677.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 677 2>>/data/var/projects/ignet/data/677.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/677.filtered.paths /data/var/projects/ignet/data/677.filtered.paths.svm 2>>/data/var/projects/ignet/data/677.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/677.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/677.filtered.scores 2>>/data/var/projects/ignet/data/677.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 677  2>>/data/var/projects/ignet/data/677.error



echo "File ID: 693"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 693 2>/data/var/projects/ignet/data/693.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/693.parses /data/var/projects/ignet/data/693.tags.matched >/data/var/projects/ignet/data/693.paths 2>>/data/var/projects/ignet/data/693.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 693 2>>/data/var/projects/ignet/data/693.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/693.filtered.paths /data/var/projects/ignet/data/693.filtered.paths.svm 2>>/data/var/projects/ignet/data/693.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/693.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/693.filtered.scores 2>>/data/var/projects/ignet/data/693.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 693  2>>/data/var/projects/ignet/data/693.error



echo "File ID: 709"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 709 2>/data/var/projects/ignet/data/709.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/709.parses /data/var/projects/ignet/data/709.tags.matched >/data/var/projects/ignet/data/709.paths 2>>/data/var/projects/ignet/data/709.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 709 2>>/data/var/projects/ignet/data/709.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/709.filtered.paths /data/var/projects/ignet/data/709.filtered.paths.svm 2>>/data/var/projects/ignet/data/709.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/709.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/709.filtered.scores 2>>/data/var/projects/ignet/data/709.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 709  2>>/data/var/projects/ignet/data/709.error



echo "File ID: 725"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 725 2>/data/var/projects/ignet/data/725.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/725.parses /data/var/projects/ignet/data/725.tags.matched >/data/var/projects/ignet/data/725.paths 2>>/data/var/projects/ignet/data/725.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 725 2>>/data/var/projects/ignet/data/725.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/725.filtered.paths /data/var/projects/ignet/data/725.filtered.paths.svm 2>>/data/var/projects/ignet/data/725.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/725.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/725.filtered.scores 2>>/data/var/projects/ignet/data/725.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 725  2>>/data/var/projects/ignet/data/725.error



echo "File ID: 741"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 741 2>/data/var/projects/ignet/data/741.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/741.parses /data/var/projects/ignet/data/741.tags.matched >/data/var/projects/ignet/data/741.paths 2>>/data/var/projects/ignet/data/741.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 741 2>>/data/var/projects/ignet/data/741.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/741.filtered.paths /data/var/projects/ignet/data/741.filtered.paths.svm 2>>/data/var/projects/ignet/data/741.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/741.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/741.filtered.scores 2>>/data/var/projects/ignet/data/741.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 741  2>>/data/var/projects/ignet/data/741.error



echo "File ID: 757"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 757 2>/data/var/projects/ignet/data/757.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/757.parses /data/var/projects/ignet/data/757.tags.matched >/data/var/projects/ignet/data/757.paths 2>>/data/var/projects/ignet/data/757.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 757 2>>/data/var/projects/ignet/data/757.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/757.filtered.paths /data/var/projects/ignet/data/757.filtered.paths.svm 2>>/data/var/projects/ignet/data/757.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/757.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/757.filtered.scores 2>>/data/var/projects/ignet/data/757.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 757  2>>/data/var/projects/ignet/data/757.error



echo "File ID: 773"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 773 2>/data/var/projects/ignet/data/773.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/773.parses /data/var/projects/ignet/data/773.tags.matched >/data/var/projects/ignet/data/773.paths 2>>/data/var/projects/ignet/data/773.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 773 2>>/data/var/projects/ignet/data/773.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/773.filtered.paths /data/var/projects/ignet/data/773.filtered.paths.svm 2>>/data/var/projects/ignet/data/773.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/773.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/773.filtered.scores 2>>/data/var/projects/ignet/data/773.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 773  2>>/data/var/projects/ignet/data/773.error



echo "File ID: 789"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 789 2>/data/var/projects/ignet/data/789.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/789.parses /data/var/projects/ignet/data/789.tags.matched >/data/var/projects/ignet/data/789.paths 2>>/data/var/projects/ignet/data/789.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 789 2>>/data/var/projects/ignet/data/789.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/789.filtered.paths /data/var/projects/ignet/data/789.filtered.paths.svm 2>>/data/var/projects/ignet/data/789.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/789.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/789.filtered.scores 2>>/data/var/projects/ignet/data/789.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 789  2>>/data/var/projects/ignet/data/789.error



echo "File ID: 805"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 805 2>/data/var/projects/ignet/data/805.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/805.parses /data/var/projects/ignet/data/805.tags.matched >/data/var/projects/ignet/data/805.paths 2>>/data/var/projects/ignet/data/805.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 805 2>>/data/var/projects/ignet/data/805.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/805.filtered.paths /data/var/projects/ignet/data/805.filtered.paths.svm 2>>/data/var/projects/ignet/data/805.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/805.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/805.filtered.scores 2>>/data/var/projects/ignet/data/805.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 805  2>>/data/var/projects/ignet/data/805.error



echo "File ID: 821"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 821 2>/data/var/projects/ignet/data/821.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/821.parses /data/var/projects/ignet/data/821.tags.matched >/data/var/projects/ignet/data/821.paths 2>>/data/var/projects/ignet/data/821.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 821 2>>/data/var/projects/ignet/data/821.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/821.filtered.paths /data/var/projects/ignet/data/821.filtered.paths.svm 2>>/data/var/projects/ignet/data/821.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/821.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/821.filtered.scores 2>>/data/var/projects/ignet/data/821.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 821  2>>/data/var/projects/ignet/data/821.error



echo "File ID: 837"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 837 2>/data/var/projects/ignet/data/837.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/837.parses /data/var/projects/ignet/data/837.tags.matched >/data/var/projects/ignet/data/837.paths 2>>/data/var/projects/ignet/data/837.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 837 2>>/data/var/projects/ignet/data/837.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/837.filtered.paths /data/var/projects/ignet/data/837.filtered.paths.svm 2>>/data/var/projects/ignet/data/837.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/837.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/837.filtered.scores 2>>/data/var/projects/ignet/data/837.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 837  2>>/data/var/projects/ignet/data/837.error



echo "File ID: 853"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 853 2>/data/var/projects/ignet/data/853.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/853.parses /data/var/projects/ignet/data/853.tags.matched >/data/var/projects/ignet/data/853.paths 2>>/data/var/projects/ignet/data/853.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 853 2>>/data/var/projects/ignet/data/853.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/853.filtered.paths /data/var/projects/ignet/data/853.filtered.paths.svm 2>>/data/var/projects/ignet/data/853.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/853.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/853.filtered.scores 2>>/data/var/projects/ignet/data/853.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 853  2>>/data/var/projects/ignet/data/853.error



echo "File ID: 869"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 869 2>/data/var/projects/ignet/data/869.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/869.parses /data/var/projects/ignet/data/869.tags.matched >/data/var/projects/ignet/data/869.paths 2>>/data/var/projects/ignet/data/869.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 869 2>>/data/var/projects/ignet/data/869.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/869.filtered.paths /data/var/projects/ignet/data/869.filtered.paths.svm 2>>/data/var/projects/ignet/data/869.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/869.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/869.filtered.scores 2>>/data/var/projects/ignet/data/869.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 869  2>>/data/var/projects/ignet/data/869.error



echo "File ID: 885"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 885 2>/data/var/projects/ignet/data/885.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/885.parses /data/var/projects/ignet/data/885.tags.matched >/data/var/projects/ignet/data/885.paths 2>>/data/var/projects/ignet/data/885.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 885 2>>/data/var/projects/ignet/data/885.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/885.filtered.paths /data/var/projects/ignet/data/885.filtered.paths.svm 2>>/data/var/projects/ignet/data/885.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/885.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/885.filtered.scores 2>>/data/var/projects/ignet/data/885.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 885  2>>/data/var/projects/ignet/data/885.error



echo "File ID: 901"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 901 2>/data/var/projects/ignet/data/901.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/901.parses /data/var/projects/ignet/data/901.tags.matched >/data/var/projects/ignet/data/901.paths 2>>/data/var/projects/ignet/data/901.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 901 2>>/data/var/projects/ignet/data/901.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/901.filtered.paths /data/var/projects/ignet/data/901.filtered.paths.svm 2>>/data/var/projects/ignet/data/901.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/901.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/901.filtered.scores 2>>/data/var/projects/ignet/data/901.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 901  2>>/data/var/projects/ignet/data/901.error



echo "File ID: 917"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 917 2>/data/var/projects/ignet/data/917.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/917.parses /data/var/projects/ignet/data/917.tags.matched >/data/var/projects/ignet/data/917.paths 2>>/data/var/projects/ignet/data/917.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 917 2>>/data/var/projects/ignet/data/917.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/917.filtered.paths /data/var/projects/ignet/data/917.filtered.paths.svm 2>>/data/var/projects/ignet/data/917.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/917.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/917.filtered.scores 2>>/data/var/projects/ignet/data/917.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 917  2>>/data/var/projects/ignet/data/917.error



echo "File ID: 933"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 933 2>/data/var/projects/ignet/data/933.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/933.parses /data/var/projects/ignet/data/933.tags.matched >/data/var/projects/ignet/data/933.paths 2>>/data/var/projects/ignet/data/933.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 933 2>>/data/var/projects/ignet/data/933.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/933.filtered.paths /data/var/projects/ignet/data/933.filtered.paths.svm 2>>/data/var/projects/ignet/data/933.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/933.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/933.filtered.scores 2>>/data/var/projects/ignet/data/933.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 933  2>>/data/var/projects/ignet/data/933.error



echo "File ID: 949"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 949 2>/data/var/projects/ignet/data/949.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/949.parses /data/var/projects/ignet/data/949.tags.matched >/data/var/projects/ignet/data/949.paths 2>>/data/var/projects/ignet/data/949.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 949 2>>/data/var/projects/ignet/data/949.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/949.filtered.paths /data/var/projects/ignet/data/949.filtered.paths.svm 2>>/data/var/projects/ignet/data/949.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/949.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/949.filtered.scores 2>>/data/var/projects/ignet/data/949.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 949  2>>/data/var/projects/ignet/data/949.error



echo "File ID: 965"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 965 2>/data/var/projects/ignet/data/965.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/965.parses /data/var/projects/ignet/data/965.tags.matched >/data/var/projects/ignet/data/965.paths 2>>/data/var/projects/ignet/data/965.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 965 2>>/data/var/projects/ignet/data/965.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/965.filtered.paths /data/var/projects/ignet/data/965.filtered.paths.svm 2>>/data/var/projects/ignet/data/965.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/965.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/965.filtered.scores 2>>/data/var/projects/ignet/data/965.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 965  2>>/data/var/projects/ignet/data/965.error



echo "File ID: 981"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 981 2>/data/var/projects/ignet/data/981.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/981.parses /data/var/projects/ignet/data/981.tags.matched >/data/var/projects/ignet/data/981.paths 2>>/data/var/projects/ignet/data/981.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 981 2>>/data/var/projects/ignet/data/981.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/981.filtered.paths /data/var/projects/ignet/data/981.filtered.paths.svm 2>>/data/var/projects/ignet/data/981.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/981.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/981.filtered.scores 2>>/data/var/projects/ignet/data/981.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 981  2>>/data/var/projects/ignet/data/981.error



echo "File ID: 997"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 997 2>/data/var/projects/ignet/data/997.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/997.parses /data/var/projects/ignet/data/997.tags.matched >/data/var/projects/ignet/data/997.paths 2>>/data/var/projects/ignet/data/997.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 997 2>>/data/var/projects/ignet/data/997.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/997.filtered.paths /data/var/projects/ignet/data/997.filtered.paths.svm 2>>/data/var/projects/ignet/data/997.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/997.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/997.filtered.scores 2>>/data/var/projects/ignet/data/997.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 997  2>>/data/var/projects/ignet/data/997.error


