#!/bin/bash
echo "File ID: 12"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 12 2>/data/var/projects/ignet/data/12.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/12.parses /data/var/projects/ignet/data/12.tags.matched >/data/var/projects/ignet/data/12.paths 2>>/data/var/projects/ignet/data/12.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 12 2>>/data/var/projects/ignet/data/12.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/12.filtered.paths /data/var/projects/ignet/data/12.filtered.paths.svm 2>>/data/var/projects/ignet/data/12.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/12.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/12.filtered.scores 2>>/data/var/projects/ignet/data/12.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 12  2>>/data/var/projects/ignet/data/12.error



echo "File ID: 28"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 28 2>/data/var/projects/ignet/data/28.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/28.parses /data/var/projects/ignet/data/28.tags.matched >/data/var/projects/ignet/data/28.paths 2>>/data/var/projects/ignet/data/28.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 28 2>>/data/var/projects/ignet/data/28.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/28.filtered.paths /data/var/projects/ignet/data/28.filtered.paths.svm 2>>/data/var/projects/ignet/data/28.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/28.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/28.filtered.scores 2>>/data/var/projects/ignet/data/28.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 28  2>>/data/var/projects/ignet/data/28.error



echo "File ID: 44"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 44 2>/data/var/projects/ignet/data/44.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/44.parses /data/var/projects/ignet/data/44.tags.matched >/data/var/projects/ignet/data/44.paths 2>>/data/var/projects/ignet/data/44.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 44 2>>/data/var/projects/ignet/data/44.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/44.filtered.paths /data/var/projects/ignet/data/44.filtered.paths.svm 2>>/data/var/projects/ignet/data/44.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/44.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/44.filtered.scores 2>>/data/var/projects/ignet/data/44.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 44  2>>/data/var/projects/ignet/data/44.error



echo "File ID: 60"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 60 2>/data/var/projects/ignet/data/60.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/60.parses /data/var/projects/ignet/data/60.tags.matched >/data/var/projects/ignet/data/60.paths 2>>/data/var/projects/ignet/data/60.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 60 2>>/data/var/projects/ignet/data/60.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/60.filtered.paths /data/var/projects/ignet/data/60.filtered.paths.svm 2>>/data/var/projects/ignet/data/60.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/60.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/60.filtered.scores 2>>/data/var/projects/ignet/data/60.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 60  2>>/data/var/projects/ignet/data/60.error



echo "File ID: 76"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 76 2>/data/var/projects/ignet/data/76.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/76.parses /data/var/projects/ignet/data/76.tags.matched >/data/var/projects/ignet/data/76.paths 2>>/data/var/projects/ignet/data/76.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 76 2>>/data/var/projects/ignet/data/76.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/76.filtered.paths /data/var/projects/ignet/data/76.filtered.paths.svm 2>>/data/var/projects/ignet/data/76.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/76.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/76.filtered.scores 2>>/data/var/projects/ignet/data/76.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 76  2>>/data/var/projects/ignet/data/76.error



echo "File ID: 92"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 92 2>/data/var/projects/ignet/data/92.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/92.parses /data/var/projects/ignet/data/92.tags.matched >/data/var/projects/ignet/data/92.paths 2>>/data/var/projects/ignet/data/92.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 92 2>>/data/var/projects/ignet/data/92.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/92.filtered.paths /data/var/projects/ignet/data/92.filtered.paths.svm 2>>/data/var/projects/ignet/data/92.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/92.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/92.filtered.scores 2>>/data/var/projects/ignet/data/92.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 92  2>>/data/var/projects/ignet/data/92.error



echo "File ID: 108"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 108 2>/data/var/projects/ignet/data/108.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/108.parses /data/var/projects/ignet/data/108.tags.matched >/data/var/projects/ignet/data/108.paths 2>>/data/var/projects/ignet/data/108.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 108 2>>/data/var/projects/ignet/data/108.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/108.filtered.paths /data/var/projects/ignet/data/108.filtered.paths.svm 2>>/data/var/projects/ignet/data/108.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/108.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/108.filtered.scores 2>>/data/var/projects/ignet/data/108.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 108  2>>/data/var/projects/ignet/data/108.error



echo "File ID: 124"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 124 2>/data/var/projects/ignet/data/124.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/124.parses /data/var/projects/ignet/data/124.tags.matched >/data/var/projects/ignet/data/124.paths 2>>/data/var/projects/ignet/data/124.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 124 2>>/data/var/projects/ignet/data/124.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/124.filtered.paths /data/var/projects/ignet/data/124.filtered.paths.svm 2>>/data/var/projects/ignet/data/124.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/124.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/124.filtered.scores 2>>/data/var/projects/ignet/data/124.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 124  2>>/data/var/projects/ignet/data/124.error



echo "File ID: 140"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 140 2>/data/var/projects/ignet/data/140.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/140.parses /data/var/projects/ignet/data/140.tags.matched >/data/var/projects/ignet/data/140.paths 2>>/data/var/projects/ignet/data/140.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 140 2>>/data/var/projects/ignet/data/140.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/140.filtered.paths /data/var/projects/ignet/data/140.filtered.paths.svm 2>>/data/var/projects/ignet/data/140.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/140.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/140.filtered.scores 2>>/data/var/projects/ignet/data/140.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 140  2>>/data/var/projects/ignet/data/140.error



echo "File ID: 156"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 156 2>/data/var/projects/ignet/data/156.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/156.parses /data/var/projects/ignet/data/156.tags.matched >/data/var/projects/ignet/data/156.paths 2>>/data/var/projects/ignet/data/156.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 156 2>>/data/var/projects/ignet/data/156.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/156.filtered.paths /data/var/projects/ignet/data/156.filtered.paths.svm 2>>/data/var/projects/ignet/data/156.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/156.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/156.filtered.scores 2>>/data/var/projects/ignet/data/156.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 156  2>>/data/var/projects/ignet/data/156.error



echo "File ID: 172"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 172 2>/data/var/projects/ignet/data/172.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/172.parses /data/var/projects/ignet/data/172.tags.matched >/data/var/projects/ignet/data/172.paths 2>>/data/var/projects/ignet/data/172.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 172 2>>/data/var/projects/ignet/data/172.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/172.filtered.paths /data/var/projects/ignet/data/172.filtered.paths.svm 2>>/data/var/projects/ignet/data/172.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/172.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/172.filtered.scores 2>>/data/var/projects/ignet/data/172.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 172  2>>/data/var/projects/ignet/data/172.error



echo "File ID: 188"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 188 2>/data/var/projects/ignet/data/188.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/188.parses /data/var/projects/ignet/data/188.tags.matched >/data/var/projects/ignet/data/188.paths 2>>/data/var/projects/ignet/data/188.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 188 2>>/data/var/projects/ignet/data/188.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/188.filtered.paths /data/var/projects/ignet/data/188.filtered.paths.svm 2>>/data/var/projects/ignet/data/188.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/188.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/188.filtered.scores 2>>/data/var/projects/ignet/data/188.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 188  2>>/data/var/projects/ignet/data/188.error



echo "File ID: 204"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 204 2>/data/var/projects/ignet/data/204.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/204.parses /data/var/projects/ignet/data/204.tags.matched >/data/var/projects/ignet/data/204.paths 2>>/data/var/projects/ignet/data/204.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 204 2>>/data/var/projects/ignet/data/204.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/204.filtered.paths /data/var/projects/ignet/data/204.filtered.paths.svm 2>>/data/var/projects/ignet/data/204.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/204.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/204.filtered.scores 2>>/data/var/projects/ignet/data/204.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 204  2>>/data/var/projects/ignet/data/204.error



echo "File ID: 220"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 220 2>/data/var/projects/ignet/data/220.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/220.parses /data/var/projects/ignet/data/220.tags.matched >/data/var/projects/ignet/data/220.paths 2>>/data/var/projects/ignet/data/220.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 220 2>>/data/var/projects/ignet/data/220.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/220.filtered.paths /data/var/projects/ignet/data/220.filtered.paths.svm 2>>/data/var/projects/ignet/data/220.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/220.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/220.filtered.scores 2>>/data/var/projects/ignet/data/220.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 220  2>>/data/var/projects/ignet/data/220.error



echo "File ID: 236"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 236 2>/data/var/projects/ignet/data/236.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/236.parses /data/var/projects/ignet/data/236.tags.matched >/data/var/projects/ignet/data/236.paths 2>>/data/var/projects/ignet/data/236.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 236 2>>/data/var/projects/ignet/data/236.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/236.filtered.paths /data/var/projects/ignet/data/236.filtered.paths.svm 2>>/data/var/projects/ignet/data/236.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/236.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/236.filtered.scores 2>>/data/var/projects/ignet/data/236.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 236  2>>/data/var/projects/ignet/data/236.error



echo "File ID: 252"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 252 2>/data/var/projects/ignet/data/252.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/252.parses /data/var/projects/ignet/data/252.tags.matched >/data/var/projects/ignet/data/252.paths 2>>/data/var/projects/ignet/data/252.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 252 2>>/data/var/projects/ignet/data/252.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/252.filtered.paths /data/var/projects/ignet/data/252.filtered.paths.svm 2>>/data/var/projects/ignet/data/252.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/252.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/252.filtered.scores 2>>/data/var/projects/ignet/data/252.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 252  2>>/data/var/projects/ignet/data/252.error



echo "File ID: 268"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 268 2>/data/var/projects/ignet/data/268.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/268.parses /data/var/projects/ignet/data/268.tags.matched >/data/var/projects/ignet/data/268.paths 2>>/data/var/projects/ignet/data/268.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 268 2>>/data/var/projects/ignet/data/268.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/268.filtered.paths /data/var/projects/ignet/data/268.filtered.paths.svm 2>>/data/var/projects/ignet/data/268.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/268.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/268.filtered.scores 2>>/data/var/projects/ignet/data/268.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 268  2>>/data/var/projects/ignet/data/268.error



echo "File ID: 284"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 284 2>/data/var/projects/ignet/data/284.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/284.parses /data/var/projects/ignet/data/284.tags.matched >/data/var/projects/ignet/data/284.paths 2>>/data/var/projects/ignet/data/284.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 284 2>>/data/var/projects/ignet/data/284.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/284.filtered.paths /data/var/projects/ignet/data/284.filtered.paths.svm 2>>/data/var/projects/ignet/data/284.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/284.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/284.filtered.scores 2>>/data/var/projects/ignet/data/284.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 284  2>>/data/var/projects/ignet/data/284.error



echo "File ID: 300"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 300 2>/data/var/projects/ignet/data/300.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/300.parses /data/var/projects/ignet/data/300.tags.matched >/data/var/projects/ignet/data/300.paths 2>>/data/var/projects/ignet/data/300.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 300 2>>/data/var/projects/ignet/data/300.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/300.filtered.paths /data/var/projects/ignet/data/300.filtered.paths.svm 2>>/data/var/projects/ignet/data/300.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/300.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/300.filtered.scores 2>>/data/var/projects/ignet/data/300.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 300  2>>/data/var/projects/ignet/data/300.error



echo "File ID: 316"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 316 2>/data/var/projects/ignet/data/316.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/316.parses /data/var/projects/ignet/data/316.tags.matched >/data/var/projects/ignet/data/316.paths 2>>/data/var/projects/ignet/data/316.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 316 2>>/data/var/projects/ignet/data/316.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/316.filtered.paths /data/var/projects/ignet/data/316.filtered.paths.svm 2>>/data/var/projects/ignet/data/316.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/316.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/316.filtered.scores 2>>/data/var/projects/ignet/data/316.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 316  2>>/data/var/projects/ignet/data/316.error



echo "File ID: 332"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 332 2>/data/var/projects/ignet/data/332.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/332.parses /data/var/projects/ignet/data/332.tags.matched >/data/var/projects/ignet/data/332.paths 2>>/data/var/projects/ignet/data/332.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 332 2>>/data/var/projects/ignet/data/332.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/332.filtered.paths /data/var/projects/ignet/data/332.filtered.paths.svm 2>>/data/var/projects/ignet/data/332.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/332.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/332.filtered.scores 2>>/data/var/projects/ignet/data/332.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 332  2>>/data/var/projects/ignet/data/332.error



echo "File ID: 348"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 348 2>/data/var/projects/ignet/data/348.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/348.parses /data/var/projects/ignet/data/348.tags.matched >/data/var/projects/ignet/data/348.paths 2>>/data/var/projects/ignet/data/348.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 348 2>>/data/var/projects/ignet/data/348.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/348.filtered.paths /data/var/projects/ignet/data/348.filtered.paths.svm 2>>/data/var/projects/ignet/data/348.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/348.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/348.filtered.scores 2>>/data/var/projects/ignet/data/348.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 348  2>>/data/var/projects/ignet/data/348.error



echo "File ID: 364"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 364 2>/data/var/projects/ignet/data/364.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/364.parses /data/var/projects/ignet/data/364.tags.matched >/data/var/projects/ignet/data/364.paths 2>>/data/var/projects/ignet/data/364.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 364 2>>/data/var/projects/ignet/data/364.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/364.filtered.paths /data/var/projects/ignet/data/364.filtered.paths.svm 2>>/data/var/projects/ignet/data/364.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/364.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/364.filtered.scores 2>>/data/var/projects/ignet/data/364.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 364  2>>/data/var/projects/ignet/data/364.error



echo "File ID: 380"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 380 2>/data/var/projects/ignet/data/380.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/380.parses /data/var/projects/ignet/data/380.tags.matched >/data/var/projects/ignet/data/380.paths 2>>/data/var/projects/ignet/data/380.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 380 2>>/data/var/projects/ignet/data/380.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/380.filtered.paths /data/var/projects/ignet/data/380.filtered.paths.svm 2>>/data/var/projects/ignet/data/380.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/380.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/380.filtered.scores 2>>/data/var/projects/ignet/data/380.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 380  2>>/data/var/projects/ignet/data/380.error



echo "File ID: 396"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 396 2>/data/var/projects/ignet/data/396.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/396.parses /data/var/projects/ignet/data/396.tags.matched >/data/var/projects/ignet/data/396.paths 2>>/data/var/projects/ignet/data/396.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 396 2>>/data/var/projects/ignet/data/396.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/396.filtered.paths /data/var/projects/ignet/data/396.filtered.paths.svm 2>>/data/var/projects/ignet/data/396.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/396.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/396.filtered.scores 2>>/data/var/projects/ignet/data/396.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 396  2>>/data/var/projects/ignet/data/396.error



echo "File ID: 412"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 412 2>/data/var/projects/ignet/data/412.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/412.parses /data/var/projects/ignet/data/412.tags.matched >/data/var/projects/ignet/data/412.paths 2>>/data/var/projects/ignet/data/412.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 412 2>>/data/var/projects/ignet/data/412.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/412.filtered.paths /data/var/projects/ignet/data/412.filtered.paths.svm 2>>/data/var/projects/ignet/data/412.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/412.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/412.filtered.scores 2>>/data/var/projects/ignet/data/412.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 412  2>>/data/var/projects/ignet/data/412.error



echo "File ID: 428"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 428 2>/data/var/projects/ignet/data/428.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/428.parses /data/var/projects/ignet/data/428.tags.matched >/data/var/projects/ignet/data/428.paths 2>>/data/var/projects/ignet/data/428.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 428 2>>/data/var/projects/ignet/data/428.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/428.filtered.paths /data/var/projects/ignet/data/428.filtered.paths.svm 2>>/data/var/projects/ignet/data/428.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/428.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/428.filtered.scores 2>>/data/var/projects/ignet/data/428.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 428  2>>/data/var/projects/ignet/data/428.error



echo "File ID: 444"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 444 2>/data/var/projects/ignet/data/444.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/444.parses /data/var/projects/ignet/data/444.tags.matched >/data/var/projects/ignet/data/444.paths 2>>/data/var/projects/ignet/data/444.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 444 2>>/data/var/projects/ignet/data/444.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/444.filtered.paths /data/var/projects/ignet/data/444.filtered.paths.svm 2>>/data/var/projects/ignet/data/444.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/444.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/444.filtered.scores 2>>/data/var/projects/ignet/data/444.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 444  2>>/data/var/projects/ignet/data/444.error



echo "File ID: 460"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 460 2>/data/var/projects/ignet/data/460.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/460.parses /data/var/projects/ignet/data/460.tags.matched >/data/var/projects/ignet/data/460.paths 2>>/data/var/projects/ignet/data/460.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 460 2>>/data/var/projects/ignet/data/460.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/460.filtered.paths /data/var/projects/ignet/data/460.filtered.paths.svm 2>>/data/var/projects/ignet/data/460.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/460.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/460.filtered.scores 2>>/data/var/projects/ignet/data/460.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 460  2>>/data/var/projects/ignet/data/460.error



echo "File ID: 476"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 476 2>/data/var/projects/ignet/data/476.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/476.parses /data/var/projects/ignet/data/476.tags.matched >/data/var/projects/ignet/data/476.paths 2>>/data/var/projects/ignet/data/476.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 476 2>>/data/var/projects/ignet/data/476.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/476.filtered.paths /data/var/projects/ignet/data/476.filtered.paths.svm 2>>/data/var/projects/ignet/data/476.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/476.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/476.filtered.scores 2>>/data/var/projects/ignet/data/476.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 476  2>>/data/var/projects/ignet/data/476.error



echo "File ID: 492"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 492 2>/data/var/projects/ignet/data/492.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/492.parses /data/var/projects/ignet/data/492.tags.matched >/data/var/projects/ignet/data/492.paths 2>>/data/var/projects/ignet/data/492.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 492 2>>/data/var/projects/ignet/data/492.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/492.filtered.paths /data/var/projects/ignet/data/492.filtered.paths.svm 2>>/data/var/projects/ignet/data/492.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/492.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/492.filtered.scores 2>>/data/var/projects/ignet/data/492.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 492  2>>/data/var/projects/ignet/data/492.error



echo "File ID: 508"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 508 2>/data/var/projects/ignet/data/508.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/508.parses /data/var/projects/ignet/data/508.tags.matched >/data/var/projects/ignet/data/508.paths 2>>/data/var/projects/ignet/data/508.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 508 2>>/data/var/projects/ignet/data/508.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/508.filtered.paths /data/var/projects/ignet/data/508.filtered.paths.svm 2>>/data/var/projects/ignet/data/508.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/508.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/508.filtered.scores 2>>/data/var/projects/ignet/data/508.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 508  2>>/data/var/projects/ignet/data/508.error



echo "File ID: 524"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 524 2>/data/var/projects/ignet/data/524.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/524.parses /data/var/projects/ignet/data/524.tags.matched >/data/var/projects/ignet/data/524.paths 2>>/data/var/projects/ignet/data/524.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 524 2>>/data/var/projects/ignet/data/524.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/524.filtered.paths /data/var/projects/ignet/data/524.filtered.paths.svm 2>>/data/var/projects/ignet/data/524.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/524.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/524.filtered.scores 2>>/data/var/projects/ignet/data/524.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 524  2>>/data/var/projects/ignet/data/524.error



echo "File ID: 540"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 540 2>/data/var/projects/ignet/data/540.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/540.parses /data/var/projects/ignet/data/540.tags.matched >/data/var/projects/ignet/data/540.paths 2>>/data/var/projects/ignet/data/540.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 540 2>>/data/var/projects/ignet/data/540.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/540.filtered.paths /data/var/projects/ignet/data/540.filtered.paths.svm 2>>/data/var/projects/ignet/data/540.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/540.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/540.filtered.scores 2>>/data/var/projects/ignet/data/540.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 540  2>>/data/var/projects/ignet/data/540.error



echo "File ID: 556"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 556 2>/data/var/projects/ignet/data/556.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/556.parses /data/var/projects/ignet/data/556.tags.matched >/data/var/projects/ignet/data/556.paths 2>>/data/var/projects/ignet/data/556.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 556 2>>/data/var/projects/ignet/data/556.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/556.filtered.paths /data/var/projects/ignet/data/556.filtered.paths.svm 2>>/data/var/projects/ignet/data/556.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/556.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/556.filtered.scores 2>>/data/var/projects/ignet/data/556.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 556  2>>/data/var/projects/ignet/data/556.error



echo "File ID: 572"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 572 2>/data/var/projects/ignet/data/572.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/572.parses /data/var/projects/ignet/data/572.tags.matched >/data/var/projects/ignet/data/572.paths 2>>/data/var/projects/ignet/data/572.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 572 2>>/data/var/projects/ignet/data/572.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/572.filtered.paths /data/var/projects/ignet/data/572.filtered.paths.svm 2>>/data/var/projects/ignet/data/572.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/572.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/572.filtered.scores 2>>/data/var/projects/ignet/data/572.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 572  2>>/data/var/projects/ignet/data/572.error



echo "File ID: 588"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 588 2>/data/var/projects/ignet/data/588.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/588.parses /data/var/projects/ignet/data/588.tags.matched >/data/var/projects/ignet/data/588.paths 2>>/data/var/projects/ignet/data/588.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 588 2>>/data/var/projects/ignet/data/588.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/588.filtered.paths /data/var/projects/ignet/data/588.filtered.paths.svm 2>>/data/var/projects/ignet/data/588.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/588.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/588.filtered.scores 2>>/data/var/projects/ignet/data/588.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 588  2>>/data/var/projects/ignet/data/588.error



echo "File ID: 604"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 604 2>/data/var/projects/ignet/data/604.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/604.parses /data/var/projects/ignet/data/604.tags.matched >/data/var/projects/ignet/data/604.paths 2>>/data/var/projects/ignet/data/604.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 604 2>>/data/var/projects/ignet/data/604.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/604.filtered.paths /data/var/projects/ignet/data/604.filtered.paths.svm 2>>/data/var/projects/ignet/data/604.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/604.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/604.filtered.scores 2>>/data/var/projects/ignet/data/604.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 604  2>>/data/var/projects/ignet/data/604.error



echo "File ID: 620"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 620 2>/data/var/projects/ignet/data/620.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/620.parses /data/var/projects/ignet/data/620.tags.matched >/data/var/projects/ignet/data/620.paths 2>>/data/var/projects/ignet/data/620.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 620 2>>/data/var/projects/ignet/data/620.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/620.filtered.paths /data/var/projects/ignet/data/620.filtered.paths.svm 2>>/data/var/projects/ignet/data/620.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/620.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/620.filtered.scores 2>>/data/var/projects/ignet/data/620.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 620  2>>/data/var/projects/ignet/data/620.error



echo "File ID: 636"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 636 2>/data/var/projects/ignet/data/636.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/636.parses /data/var/projects/ignet/data/636.tags.matched >/data/var/projects/ignet/data/636.paths 2>>/data/var/projects/ignet/data/636.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 636 2>>/data/var/projects/ignet/data/636.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/636.filtered.paths /data/var/projects/ignet/data/636.filtered.paths.svm 2>>/data/var/projects/ignet/data/636.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/636.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/636.filtered.scores 2>>/data/var/projects/ignet/data/636.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 636  2>>/data/var/projects/ignet/data/636.error



echo "File ID: 652"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 652 2>/data/var/projects/ignet/data/652.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/652.parses /data/var/projects/ignet/data/652.tags.matched >/data/var/projects/ignet/data/652.paths 2>>/data/var/projects/ignet/data/652.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 652 2>>/data/var/projects/ignet/data/652.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/652.filtered.paths /data/var/projects/ignet/data/652.filtered.paths.svm 2>>/data/var/projects/ignet/data/652.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/652.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/652.filtered.scores 2>>/data/var/projects/ignet/data/652.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 652  2>>/data/var/projects/ignet/data/652.error



echo "File ID: 668"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 668 2>/data/var/projects/ignet/data/668.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/668.parses /data/var/projects/ignet/data/668.tags.matched >/data/var/projects/ignet/data/668.paths 2>>/data/var/projects/ignet/data/668.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 668 2>>/data/var/projects/ignet/data/668.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/668.filtered.paths /data/var/projects/ignet/data/668.filtered.paths.svm 2>>/data/var/projects/ignet/data/668.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/668.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/668.filtered.scores 2>>/data/var/projects/ignet/data/668.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 668  2>>/data/var/projects/ignet/data/668.error



echo "File ID: 684"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 684 2>/data/var/projects/ignet/data/684.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/684.parses /data/var/projects/ignet/data/684.tags.matched >/data/var/projects/ignet/data/684.paths 2>>/data/var/projects/ignet/data/684.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 684 2>>/data/var/projects/ignet/data/684.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/684.filtered.paths /data/var/projects/ignet/data/684.filtered.paths.svm 2>>/data/var/projects/ignet/data/684.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/684.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/684.filtered.scores 2>>/data/var/projects/ignet/data/684.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 684  2>>/data/var/projects/ignet/data/684.error



echo "File ID: 700"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 700 2>/data/var/projects/ignet/data/700.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/700.parses /data/var/projects/ignet/data/700.tags.matched >/data/var/projects/ignet/data/700.paths 2>>/data/var/projects/ignet/data/700.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 700 2>>/data/var/projects/ignet/data/700.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/700.filtered.paths /data/var/projects/ignet/data/700.filtered.paths.svm 2>>/data/var/projects/ignet/data/700.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/700.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/700.filtered.scores 2>>/data/var/projects/ignet/data/700.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 700  2>>/data/var/projects/ignet/data/700.error



echo "File ID: 716"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 716 2>/data/var/projects/ignet/data/716.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/716.parses /data/var/projects/ignet/data/716.tags.matched >/data/var/projects/ignet/data/716.paths 2>>/data/var/projects/ignet/data/716.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 716 2>>/data/var/projects/ignet/data/716.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/716.filtered.paths /data/var/projects/ignet/data/716.filtered.paths.svm 2>>/data/var/projects/ignet/data/716.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/716.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/716.filtered.scores 2>>/data/var/projects/ignet/data/716.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 716  2>>/data/var/projects/ignet/data/716.error



echo "File ID: 732"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 732 2>/data/var/projects/ignet/data/732.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/732.parses /data/var/projects/ignet/data/732.tags.matched >/data/var/projects/ignet/data/732.paths 2>>/data/var/projects/ignet/data/732.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 732 2>>/data/var/projects/ignet/data/732.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/732.filtered.paths /data/var/projects/ignet/data/732.filtered.paths.svm 2>>/data/var/projects/ignet/data/732.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/732.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/732.filtered.scores 2>>/data/var/projects/ignet/data/732.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 732  2>>/data/var/projects/ignet/data/732.error



echo "File ID: 748"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 748 2>/data/var/projects/ignet/data/748.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/748.parses /data/var/projects/ignet/data/748.tags.matched >/data/var/projects/ignet/data/748.paths 2>>/data/var/projects/ignet/data/748.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 748 2>>/data/var/projects/ignet/data/748.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/748.filtered.paths /data/var/projects/ignet/data/748.filtered.paths.svm 2>>/data/var/projects/ignet/data/748.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/748.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/748.filtered.scores 2>>/data/var/projects/ignet/data/748.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 748  2>>/data/var/projects/ignet/data/748.error



echo "File ID: 764"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 764 2>/data/var/projects/ignet/data/764.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/764.parses /data/var/projects/ignet/data/764.tags.matched >/data/var/projects/ignet/data/764.paths 2>>/data/var/projects/ignet/data/764.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 764 2>>/data/var/projects/ignet/data/764.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/764.filtered.paths /data/var/projects/ignet/data/764.filtered.paths.svm 2>>/data/var/projects/ignet/data/764.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/764.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/764.filtered.scores 2>>/data/var/projects/ignet/data/764.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 764  2>>/data/var/projects/ignet/data/764.error



echo "File ID: 780"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 780 2>/data/var/projects/ignet/data/780.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/780.parses /data/var/projects/ignet/data/780.tags.matched >/data/var/projects/ignet/data/780.paths 2>>/data/var/projects/ignet/data/780.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 780 2>>/data/var/projects/ignet/data/780.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/780.filtered.paths /data/var/projects/ignet/data/780.filtered.paths.svm 2>>/data/var/projects/ignet/data/780.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/780.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/780.filtered.scores 2>>/data/var/projects/ignet/data/780.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 780  2>>/data/var/projects/ignet/data/780.error



echo "File ID: 796"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 796 2>/data/var/projects/ignet/data/796.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/796.parses /data/var/projects/ignet/data/796.tags.matched >/data/var/projects/ignet/data/796.paths 2>>/data/var/projects/ignet/data/796.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 796 2>>/data/var/projects/ignet/data/796.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/796.filtered.paths /data/var/projects/ignet/data/796.filtered.paths.svm 2>>/data/var/projects/ignet/data/796.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/796.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/796.filtered.scores 2>>/data/var/projects/ignet/data/796.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 796  2>>/data/var/projects/ignet/data/796.error



echo "File ID: 812"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 812 2>/data/var/projects/ignet/data/812.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/812.parses /data/var/projects/ignet/data/812.tags.matched >/data/var/projects/ignet/data/812.paths 2>>/data/var/projects/ignet/data/812.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 812 2>>/data/var/projects/ignet/data/812.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/812.filtered.paths /data/var/projects/ignet/data/812.filtered.paths.svm 2>>/data/var/projects/ignet/data/812.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/812.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/812.filtered.scores 2>>/data/var/projects/ignet/data/812.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 812  2>>/data/var/projects/ignet/data/812.error



echo "File ID: 828"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 828 2>/data/var/projects/ignet/data/828.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/828.parses /data/var/projects/ignet/data/828.tags.matched >/data/var/projects/ignet/data/828.paths 2>>/data/var/projects/ignet/data/828.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 828 2>>/data/var/projects/ignet/data/828.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/828.filtered.paths /data/var/projects/ignet/data/828.filtered.paths.svm 2>>/data/var/projects/ignet/data/828.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/828.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/828.filtered.scores 2>>/data/var/projects/ignet/data/828.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 828  2>>/data/var/projects/ignet/data/828.error



echo "File ID: 844"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 844 2>/data/var/projects/ignet/data/844.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/844.parses /data/var/projects/ignet/data/844.tags.matched >/data/var/projects/ignet/data/844.paths 2>>/data/var/projects/ignet/data/844.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 844 2>>/data/var/projects/ignet/data/844.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/844.filtered.paths /data/var/projects/ignet/data/844.filtered.paths.svm 2>>/data/var/projects/ignet/data/844.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/844.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/844.filtered.scores 2>>/data/var/projects/ignet/data/844.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 844  2>>/data/var/projects/ignet/data/844.error



echo "File ID: 860"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 860 2>/data/var/projects/ignet/data/860.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/860.parses /data/var/projects/ignet/data/860.tags.matched >/data/var/projects/ignet/data/860.paths 2>>/data/var/projects/ignet/data/860.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 860 2>>/data/var/projects/ignet/data/860.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/860.filtered.paths /data/var/projects/ignet/data/860.filtered.paths.svm 2>>/data/var/projects/ignet/data/860.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/860.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/860.filtered.scores 2>>/data/var/projects/ignet/data/860.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 860  2>>/data/var/projects/ignet/data/860.error



echo "File ID: 876"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 876 2>/data/var/projects/ignet/data/876.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/876.parses /data/var/projects/ignet/data/876.tags.matched >/data/var/projects/ignet/data/876.paths 2>>/data/var/projects/ignet/data/876.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 876 2>>/data/var/projects/ignet/data/876.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/876.filtered.paths /data/var/projects/ignet/data/876.filtered.paths.svm 2>>/data/var/projects/ignet/data/876.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/876.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/876.filtered.scores 2>>/data/var/projects/ignet/data/876.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 876  2>>/data/var/projects/ignet/data/876.error



echo "File ID: 892"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 892 2>/data/var/projects/ignet/data/892.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/892.parses /data/var/projects/ignet/data/892.tags.matched >/data/var/projects/ignet/data/892.paths 2>>/data/var/projects/ignet/data/892.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 892 2>>/data/var/projects/ignet/data/892.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/892.filtered.paths /data/var/projects/ignet/data/892.filtered.paths.svm 2>>/data/var/projects/ignet/data/892.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/892.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/892.filtered.scores 2>>/data/var/projects/ignet/data/892.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 892  2>>/data/var/projects/ignet/data/892.error



echo "File ID: 908"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 908 2>/data/var/projects/ignet/data/908.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/908.parses /data/var/projects/ignet/data/908.tags.matched >/data/var/projects/ignet/data/908.paths 2>>/data/var/projects/ignet/data/908.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 908 2>>/data/var/projects/ignet/data/908.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/908.filtered.paths /data/var/projects/ignet/data/908.filtered.paths.svm 2>>/data/var/projects/ignet/data/908.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/908.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/908.filtered.scores 2>>/data/var/projects/ignet/data/908.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 908  2>>/data/var/projects/ignet/data/908.error



echo "File ID: 924"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 924 2>/data/var/projects/ignet/data/924.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/924.parses /data/var/projects/ignet/data/924.tags.matched >/data/var/projects/ignet/data/924.paths 2>>/data/var/projects/ignet/data/924.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 924 2>>/data/var/projects/ignet/data/924.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/924.filtered.paths /data/var/projects/ignet/data/924.filtered.paths.svm 2>>/data/var/projects/ignet/data/924.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/924.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/924.filtered.scores 2>>/data/var/projects/ignet/data/924.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 924  2>>/data/var/projects/ignet/data/924.error



echo "File ID: 940"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 940 2>/data/var/projects/ignet/data/940.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/940.parses /data/var/projects/ignet/data/940.tags.matched >/data/var/projects/ignet/data/940.paths 2>>/data/var/projects/ignet/data/940.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 940 2>>/data/var/projects/ignet/data/940.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/940.filtered.paths /data/var/projects/ignet/data/940.filtered.paths.svm 2>>/data/var/projects/ignet/data/940.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/940.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/940.filtered.scores 2>>/data/var/projects/ignet/data/940.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 940  2>>/data/var/projects/ignet/data/940.error



echo "File ID: 956"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 956 2>/data/var/projects/ignet/data/956.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/956.parses /data/var/projects/ignet/data/956.tags.matched >/data/var/projects/ignet/data/956.paths 2>>/data/var/projects/ignet/data/956.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 956 2>>/data/var/projects/ignet/data/956.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/956.filtered.paths /data/var/projects/ignet/data/956.filtered.paths.svm 2>>/data/var/projects/ignet/data/956.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/956.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/956.filtered.scores 2>>/data/var/projects/ignet/data/956.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 956  2>>/data/var/projects/ignet/data/956.error



echo "File ID: 972"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 972 2>/data/var/projects/ignet/data/972.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/972.parses /data/var/projects/ignet/data/972.tags.matched >/data/var/projects/ignet/data/972.paths 2>>/data/var/projects/ignet/data/972.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 972 2>>/data/var/projects/ignet/data/972.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/972.filtered.paths /data/var/projects/ignet/data/972.filtered.paths.svm 2>>/data/var/projects/ignet/data/972.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/972.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/972.filtered.scores 2>>/data/var/projects/ignet/data/972.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 972  2>>/data/var/projects/ignet/data/972.error



echo "File ID: 988"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 988 2>/data/var/projects/ignet/data/988.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/988.parses /data/var/projects/ignet/data/988.tags.matched >/data/var/projects/ignet/data/988.paths 2>>/data/var/projects/ignet/data/988.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 988 2>>/data/var/projects/ignet/data/988.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/988.filtered.paths /data/var/projects/ignet/data/988.filtered.paths.svm 2>>/data/var/projects/ignet/data/988.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/988.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/988.filtered.scores 2>>/data/var/projects/ignet/data/988.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 988  2>>/data/var/projects/ignet/data/988.error



echo "File ID: 1004"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 1004 2>/data/var/projects/ignet/data/1004.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/1004.parses /data/var/projects/ignet/data/1004.tags.matched >/data/var/projects/ignet/data/1004.paths 2>>/data/var/projects/ignet/data/1004.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 1004 2>>/data/var/projects/ignet/data/1004.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/1004.filtered.paths /data/var/projects/ignet/data/1004.filtered.paths.svm 2>>/data/var/projects/ignet/data/1004.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/1004.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/1004.filtered.scores 2>>/data/var/projects/ignet/data/1004.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 1004  2>>/data/var/projects/ignet/data/1004.error


