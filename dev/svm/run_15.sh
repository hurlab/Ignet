#!/bin/bash
echo "File ID: 16"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 16 2>/data/var/projects/ignet/data/16.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/16.parses /data/var/projects/ignet/data/16.tags.matched >/data/var/projects/ignet/data/16.paths 2>>/data/var/projects/ignet/data/16.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 16 2>>/data/var/projects/ignet/data/16.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/16.filtered.paths /data/var/projects/ignet/data/16.filtered.paths.svm 2>>/data/var/projects/ignet/data/16.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/16.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/16.filtered.scores 2>>/data/var/projects/ignet/data/16.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 16  2>>/data/var/projects/ignet/data/16.error



echo "File ID: 32"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 32 2>/data/var/projects/ignet/data/32.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/32.parses /data/var/projects/ignet/data/32.tags.matched >/data/var/projects/ignet/data/32.paths 2>>/data/var/projects/ignet/data/32.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 32 2>>/data/var/projects/ignet/data/32.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/32.filtered.paths /data/var/projects/ignet/data/32.filtered.paths.svm 2>>/data/var/projects/ignet/data/32.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/32.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/32.filtered.scores 2>>/data/var/projects/ignet/data/32.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 32  2>>/data/var/projects/ignet/data/32.error



echo "File ID: 48"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 48 2>/data/var/projects/ignet/data/48.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/48.parses /data/var/projects/ignet/data/48.tags.matched >/data/var/projects/ignet/data/48.paths 2>>/data/var/projects/ignet/data/48.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 48 2>>/data/var/projects/ignet/data/48.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/48.filtered.paths /data/var/projects/ignet/data/48.filtered.paths.svm 2>>/data/var/projects/ignet/data/48.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/48.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/48.filtered.scores 2>>/data/var/projects/ignet/data/48.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 48  2>>/data/var/projects/ignet/data/48.error



echo "File ID: 64"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 64 2>/data/var/projects/ignet/data/64.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/64.parses /data/var/projects/ignet/data/64.tags.matched >/data/var/projects/ignet/data/64.paths 2>>/data/var/projects/ignet/data/64.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 64 2>>/data/var/projects/ignet/data/64.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/64.filtered.paths /data/var/projects/ignet/data/64.filtered.paths.svm 2>>/data/var/projects/ignet/data/64.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/64.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/64.filtered.scores 2>>/data/var/projects/ignet/data/64.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 64  2>>/data/var/projects/ignet/data/64.error



echo "File ID: 80"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 80 2>/data/var/projects/ignet/data/80.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/80.parses /data/var/projects/ignet/data/80.tags.matched >/data/var/projects/ignet/data/80.paths 2>>/data/var/projects/ignet/data/80.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 80 2>>/data/var/projects/ignet/data/80.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/80.filtered.paths /data/var/projects/ignet/data/80.filtered.paths.svm 2>>/data/var/projects/ignet/data/80.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/80.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/80.filtered.scores 2>>/data/var/projects/ignet/data/80.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 80  2>>/data/var/projects/ignet/data/80.error



echo "File ID: 96"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 96 2>/data/var/projects/ignet/data/96.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/96.parses /data/var/projects/ignet/data/96.tags.matched >/data/var/projects/ignet/data/96.paths 2>>/data/var/projects/ignet/data/96.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 96 2>>/data/var/projects/ignet/data/96.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/96.filtered.paths /data/var/projects/ignet/data/96.filtered.paths.svm 2>>/data/var/projects/ignet/data/96.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/96.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/96.filtered.scores 2>>/data/var/projects/ignet/data/96.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 96  2>>/data/var/projects/ignet/data/96.error



echo "File ID: 112"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 112 2>/data/var/projects/ignet/data/112.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/112.parses /data/var/projects/ignet/data/112.tags.matched >/data/var/projects/ignet/data/112.paths 2>>/data/var/projects/ignet/data/112.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 112 2>>/data/var/projects/ignet/data/112.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/112.filtered.paths /data/var/projects/ignet/data/112.filtered.paths.svm 2>>/data/var/projects/ignet/data/112.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/112.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/112.filtered.scores 2>>/data/var/projects/ignet/data/112.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 112  2>>/data/var/projects/ignet/data/112.error



echo "File ID: 128"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 128 2>/data/var/projects/ignet/data/128.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/128.parses /data/var/projects/ignet/data/128.tags.matched >/data/var/projects/ignet/data/128.paths 2>>/data/var/projects/ignet/data/128.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 128 2>>/data/var/projects/ignet/data/128.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/128.filtered.paths /data/var/projects/ignet/data/128.filtered.paths.svm 2>>/data/var/projects/ignet/data/128.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/128.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/128.filtered.scores 2>>/data/var/projects/ignet/data/128.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 128  2>>/data/var/projects/ignet/data/128.error



echo "File ID: 144"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 144 2>/data/var/projects/ignet/data/144.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/144.parses /data/var/projects/ignet/data/144.tags.matched >/data/var/projects/ignet/data/144.paths 2>>/data/var/projects/ignet/data/144.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 144 2>>/data/var/projects/ignet/data/144.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/144.filtered.paths /data/var/projects/ignet/data/144.filtered.paths.svm 2>>/data/var/projects/ignet/data/144.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/144.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/144.filtered.scores 2>>/data/var/projects/ignet/data/144.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 144  2>>/data/var/projects/ignet/data/144.error



echo "File ID: 160"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 160 2>/data/var/projects/ignet/data/160.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/160.parses /data/var/projects/ignet/data/160.tags.matched >/data/var/projects/ignet/data/160.paths 2>>/data/var/projects/ignet/data/160.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 160 2>>/data/var/projects/ignet/data/160.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/160.filtered.paths /data/var/projects/ignet/data/160.filtered.paths.svm 2>>/data/var/projects/ignet/data/160.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/160.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/160.filtered.scores 2>>/data/var/projects/ignet/data/160.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 160  2>>/data/var/projects/ignet/data/160.error



echo "File ID: 176"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 176 2>/data/var/projects/ignet/data/176.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/176.parses /data/var/projects/ignet/data/176.tags.matched >/data/var/projects/ignet/data/176.paths 2>>/data/var/projects/ignet/data/176.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 176 2>>/data/var/projects/ignet/data/176.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/176.filtered.paths /data/var/projects/ignet/data/176.filtered.paths.svm 2>>/data/var/projects/ignet/data/176.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/176.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/176.filtered.scores 2>>/data/var/projects/ignet/data/176.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 176  2>>/data/var/projects/ignet/data/176.error



echo "File ID: 192"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 192 2>/data/var/projects/ignet/data/192.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/192.parses /data/var/projects/ignet/data/192.tags.matched >/data/var/projects/ignet/data/192.paths 2>>/data/var/projects/ignet/data/192.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 192 2>>/data/var/projects/ignet/data/192.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/192.filtered.paths /data/var/projects/ignet/data/192.filtered.paths.svm 2>>/data/var/projects/ignet/data/192.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/192.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/192.filtered.scores 2>>/data/var/projects/ignet/data/192.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 192  2>>/data/var/projects/ignet/data/192.error



echo "File ID: 208"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 208 2>/data/var/projects/ignet/data/208.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/208.parses /data/var/projects/ignet/data/208.tags.matched >/data/var/projects/ignet/data/208.paths 2>>/data/var/projects/ignet/data/208.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 208 2>>/data/var/projects/ignet/data/208.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/208.filtered.paths /data/var/projects/ignet/data/208.filtered.paths.svm 2>>/data/var/projects/ignet/data/208.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/208.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/208.filtered.scores 2>>/data/var/projects/ignet/data/208.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 208  2>>/data/var/projects/ignet/data/208.error



echo "File ID: 224"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 224 2>/data/var/projects/ignet/data/224.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/224.parses /data/var/projects/ignet/data/224.tags.matched >/data/var/projects/ignet/data/224.paths 2>>/data/var/projects/ignet/data/224.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 224 2>>/data/var/projects/ignet/data/224.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/224.filtered.paths /data/var/projects/ignet/data/224.filtered.paths.svm 2>>/data/var/projects/ignet/data/224.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/224.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/224.filtered.scores 2>>/data/var/projects/ignet/data/224.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 224  2>>/data/var/projects/ignet/data/224.error



echo "File ID: 240"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 240 2>/data/var/projects/ignet/data/240.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/240.parses /data/var/projects/ignet/data/240.tags.matched >/data/var/projects/ignet/data/240.paths 2>>/data/var/projects/ignet/data/240.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 240 2>>/data/var/projects/ignet/data/240.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/240.filtered.paths /data/var/projects/ignet/data/240.filtered.paths.svm 2>>/data/var/projects/ignet/data/240.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/240.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/240.filtered.scores 2>>/data/var/projects/ignet/data/240.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 240  2>>/data/var/projects/ignet/data/240.error



echo "File ID: 256"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 256 2>/data/var/projects/ignet/data/256.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/256.parses /data/var/projects/ignet/data/256.tags.matched >/data/var/projects/ignet/data/256.paths 2>>/data/var/projects/ignet/data/256.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 256 2>>/data/var/projects/ignet/data/256.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/256.filtered.paths /data/var/projects/ignet/data/256.filtered.paths.svm 2>>/data/var/projects/ignet/data/256.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/256.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/256.filtered.scores 2>>/data/var/projects/ignet/data/256.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 256  2>>/data/var/projects/ignet/data/256.error



echo "File ID: 272"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 272 2>/data/var/projects/ignet/data/272.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/272.parses /data/var/projects/ignet/data/272.tags.matched >/data/var/projects/ignet/data/272.paths 2>>/data/var/projects/ignet/data/272.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 272 2>>/data/var/projects/ignet/data/272.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/272.filtered.paths /data/var/projects/ignet/data/272.filtered.paths.svm 2>>/data/var/projects/ignet/data/272.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/272.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/272.filtered.scores 2>>/data/var/projects/ignet/data/272.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 272  2>>/data/var/projects/ignet/data/272.error



echo "File ID: 288"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 288 2>/data/var/projects/ignet/data/288.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/288.parses /data/var/projects/ignet/data/288.tags.matched >/data/var/projects/ignet/data/288.paths 2>>/data/var/projects/ignet/data/288.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 288 2>>/data/var/projects/ignet/data/288.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/288.filtered.paths /data/var/projects/ignet/data/288.filtered.paths.svm 2>>/data/var/projects/ignet/data/288.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/288.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/288.filtered.scores 2>>/data/var/projects/ignet/data/288.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 288  2>>/data/var/projects/ignet/data/288.error



echo "File ID: 304"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 304 2>/data/var/projects/ignet/data/304.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/304.parses /data/var/projects/ignet/data/304.tags.matched >/data/var/projects/ignet/data/304.paths 2>>/data/var/projects/ignet/data/304.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 304 2>>/data/var/projects/ignet/data/304.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/304.filtered.paths /data/var/projects/ignet/data/304.filtered.paths.svm 2>>/data/var/projects/ignet/data/304.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/304.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/304.filtered.scores 2>>/data/var/projects/ignet/data/304.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 304  2>>/data/var/projects/ignet/data/304.error



echo "File ID: 320"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 320 2>/data/var/projects/ignet/data/320.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/320.parses /data/var/projects/ignet/data/320.tags.matched >/data/var/projects/ignet/data/320.paths 2>>/data/var/projects/ignet/data/320.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 320 2>>/data/var/projects/ignet/data/320.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/320.filtered.paths /data/var/projects/ignet/data/320.filtered.paths.svm 2>>/data/var/projects/ignet/data/320.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/320.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/320.filtered.scores 2>>/data/var/projects/ignet/data/320.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 320  2>>/data/var/projects/ignet/data/320.error



echo "File ID: 336"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 336 2>/data/var/projects/ignet/data/336.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/336.parses /data/var/projects/ignet/data/336.tags.matched >/data/var/projects/ignet/data/336.paths 2>>/data/var/projects/ignet/data/336.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 336 2>>/data/var/projects/ignet/data/336.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/336.filtered.paths /data/var/projects/ignet/data/336.filtered.paths.svm 2>>/data/var/projects/ignet/data/336.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/336.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/336.filtered.scores 2>>/data/var/projects/ignet/data/336.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 336  2>>/data/var/projects/ignet/data/336.error



echo "File ID: 352"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 352 2>/data/var/projects/ignet/data/352.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/352.parses /data/var/projects/ignet/data/352.tags.matched >/data/var/projects/ignet/data/352.paths 2>>/data/var/projects/ignet/data/352.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 352 2>>/data/var/projects/ignet/data/352.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/352.filtered.paths /data/var/projects/ignet/data/352.filtered.paths.svm 2>>/data/var/projects/ignet/data/352.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/352.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/352.filtered.scores 2>>/data/var/projects/ignet/data/352.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 352  2>>/data/var/projects/ignet/data/352.error



echo "File ID: 368"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 368 2>/data/var/projects/ignet/data/368.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/368.parses /data/var/projects/ignet/data/368.tags.matched >/data/var/projects/ignet/data/368.paths 2>>/data/var/projects/ignet/data/368.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 368 2>>/data/var/projects/ignet/data/368.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/368.filtered.paths /data/var/projects/ignet/data/368.filtered.paths.svm 2>>/data/var/projects/ignet/data/368.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/368.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/368.filtered.scores 2>>/data/var/projects/ignet/data/368.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 368  2>>/data/var/projects/ignet/data/368.error



echo "File ID: 384"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 384 2>/data/var/projects/ignet/data/384.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/384.parses /data/var/projects/ignet/data/384.tags.matched >/data/var/projects/ignet/data/384.paths 2>>/data/var/projects/ignet/data/384.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 384 2>>/data/var/projects/ignet/data/384.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/384.filtered.paths /data/var/projects/ignet/data/384.filtered.paths.svm 2>>/data/var/projects/ignet/data/384.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/384.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/384.filtered.scores 2>>/data/var/projects/ignet/data/384.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 384  2>>/data/var/projects/ignet/data/384.error



echo "File ID: 400"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 400 2>/data/var/projects/ignet/data/400.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/400.parses /data/var/projects/ignet/data/400.tags.matched >/data/var/projects/ignet/data/400.paths 2>>/data/var/projects/ignet/data/400.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 400 2>>/data/var/projects/ignet/data/400.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/400.filtered.paths /data/var/projects/ignet/data/400.filtered.paths.svm 2>>/data/var/projects/ignet/data/400.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/400.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/400.filtered.scores 2>>/data/var/projects/ignet/data/400.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 400  2>>/data/var/projects/ignet/data/400.error



echo "File ID: 416"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 416 2>/data/var/projects/ignet/data/416.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/416.parses /data/var/projects/ignet/data/416.tags.matched >/data/var/projects/ignet/data/416.paths 2>>/data/var/projects/ignet/data/416.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 416 2>>/data/var/projects/ignet/data/416.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/416.filtered.paths /data/var/projects/ignet/data/416.filtered.paths.svm 2>>/data/var/projects/ignet/data/416.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/416.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/416.filtered.scores 2>>/data/var/projects/ignet/data/416.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 416  2>>/data/var/projects/ignet/data/416.error



echo "File ID: 432"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 432 2>/data/var/projects/ignet/data/432.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/432.parses /data/var/projects/ignet/data/432.tags.matched >/data/var/projects/ignet/data/432.paths 2>>/data/var/projects/ignet/data/432.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 432 2>>/data/var/projects/ignet/data/432.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/432.filtered.paths /data/var/projects/ignet/data/432.filtered.paths.svm 2>>/data/var/projects/ignet/data/432.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/432.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/432.filtered.scores 2>>/data/var/projects/ignet/data/432.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 432  2>>/data/var/projects/ignet/data/432.error



echo "File ID: 448"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 448 2>/data/var/projects/ignet/data/448.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/448.parses /data/var/projects/ignet/data/448.tags.matched >/data/var/projects/ignet/data/448.paths 2>>/data/var/projects/ignet/data/448.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 448 2>>/data/var/projects/ignet/data/448.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/448.filtered.paths /data/var/projects/ignet/data/448.filtered.paths.svm 2>>/data/var/projects/ignet/data/448.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/448.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/448.filtered.scores 2>>/data/var/projects/ignet/data/448.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 448  2>>/data/var/projects/ignet/data/448.error



echo "File ID: 464"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 464 2>/data/var/projects/ignet/data/464.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/464.parses /data/var/projects/ignet/data/464.tags.matched >/data/var/projects/ignet/data/464.paths 2>>/data/var/projects/ignet/data/464.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 464 2>>/data/var/projects/ignet/data/464.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/464.filtered.paths /data/var/projects/ignet/data/464.filtered.paths.svm 2>>/data/var/projects/ignet/data/464.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/464.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/464.filtered.scores 2>>/data/var/projects/ignet/data/464.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 464  2>>/data/var/projects/ignet/data/464.error



echo "File ID: 480"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 480 2>/data/var/projects/ignet/data/480.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/480.parses /data/var/projects/ignet/data/480.tags.matched >/data/var/projects/ignet/data/480.paths 2>>/data/var/projects/ignet/data/480.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 480 2>>/data/var/projects/ignet/data/480.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/480.filtered.paths /data/var/projects/ignet/data/480.filtered.paths.svm 2>>/data/var/projects/ignet/data/480.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/480.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/480.filtered.scores 2>>/data/var/projects/ignet/data/480.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 480  2>>/data/var/projects/ignet/data/480.error



echo "File ID: 496"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 496 2>/data/var/projects/ignet/data/496.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/496.parses /data/var/projects/ignet/data/496.tags.matched >/data/var/projects/ignet/data/496.paths 2>>/data/var/projects/ignet/data/496.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 496 2>>/data/var/projects/ignet/data/496.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/496.filtered.paths /data/var/projects/ignet/data/496.filtered.paths.svm 2>>/data/var/projects/ignet/data/496.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/496.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/496.filtered.scores 2>>/data/var/projects/ignet/data/496.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 496  2>>/data/var/projects/ignet/data/496.error



echo "File ID: 512"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 512 2>/data/var/projects/ignet/data/512.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/512.parses /data/var/projects/ignet/data/512.tags.matched >/data/var/projects/ignet/data/512.paths 2>>/data/var/projects/ignet/data/512.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 512 2>>/data/var/projects/ignet/data/512.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/512.filtered.paths /data/var/projects/ignet/data/512.filtered.paths.svm 2>>/data/var/projects/ignet/data/512.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/512.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/512.filtered.scores 2>>/data/var/projects/ignet/data/512.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 512  2>>/data/var/projects/ignet/data/512.error



echo "File ID: 528"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 528 2>/data/var/projects/ignet/data/528.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/528.parses /data/var/projects/ignet/data/528.tags.matched >/data/var/projects/ignet/data/528.paths 2>>/data/var/projects/ignet/data/528.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 528 2>>/data/var/projects/ignet/data/528.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/528.filtered.paths /data/var/projects/ignet/data/528.filtered.paths.svm 2>>/data/var/projects/ignet/data/528.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/528.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/528.filtered.scores 2>>/data/var/projects/ignet/data/528.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 528  2>>/data/var/projects/ignet/data/528.error



echo "File ID: 544"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 544 2>/data/var/projects/ignet/data/544.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/544.parses /data/var/projects/ignet/data/544.tags.matched >/data/var/projects/ignet/data/544.paths 2>>/data/var/projects/ignet/data/544.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 544 2>>/data/var/projects/ignet/data/544.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/544.filtered.paths /data/var/projects/ignet/data/544.filtered.paths.svm 2>>/data/var/projects/ignet/data/544.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/544.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/544.filtered.scores 2>>/data/var/projects/ignet/data/544.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 544  2>>/data/var/projects/ignet/data/544.error



echo "File ID: 560"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 560 2>/data/var/projects/ignet/data/560.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/560.parses /data/var/projects/ignet/data/560.tags.matched >/data/var/projects/ignet/data/560.paths 2>>/data/var/projects/ignet/data/560.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 560 2>>/data/var/projects/ignet/data/560.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/560.filtered.paths /data/var/projects/ignet/data/560.filtered.paths.svm 2>>/data/var/projects/ignet/data/560.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/560.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/560.filtered.scores 2>>/data/var/projects/ignet/data/560.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 560  2>>/data/var/projects/ignet/data/560.error



echo "File ID: 576"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 576 2>/data/var/projects/ignet/data/576.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/576.parses /data/var/projects/ignet/data/576.tags.matched >/data/var/projects/ignet/data/576.paths 2>>/data/var/projects/ignet/data/576.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 576 2>>/data/var/projects/ignet/data/576.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/576.filtered.paths /data/var/projects/ignet/data/576.filtered.paths.svm 2>>/data/var/projects/ignet/data/576.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/576.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/576.filtered.scores 2>>/data/var/projects/ignet/data/576.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 576  2>>/data/var/projects/ignet/data/576.error



echo "File ID: 592"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 592 2>/data/var/projects/ignet/data/592.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/592.parses /data/var/projects/ignet/data/592.tags.matched >/data/var/projects/ignet/data/592.paths 2>>/data/var/projects/ignet/data/592.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 592 2>>/data/var/projects/ignet/data/592.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/592.filtered.paths /data/var/projects/ignet/data/592.filtered.paths.svm 2>>/data/var/projects/ignet/data/592.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/592.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/592.filtered.scores 2>>/data/var/projects/ignet/data/592.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 592  2>>/data/var/projects/ignet/data/592.error



echo "File ID: 608"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 608 2>/data/var/projects/ignet/data/608.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/608.parses /data/var/projects/ignet/data/608.tags.matched >/data/var/projects/ignet/data/608.paths 2>>/data/var/projects/ignet/data/608.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 608 2>>/data/var/projects/ignet/data/608.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/608.filtered.paths /data/var/projects/ignet/data/608.filtered.paths.svm 2>>/data/var/projects/ignet/data/608.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/608.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/608.filtered.scores 2>>/data/var/projects/ignet/data/608.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 608  2>>/data/var/projects/ignet/data/608.error



echo "File ID: 624"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 624 2>/data/var/projects/ignet/data/624.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/624.parses /data/var/projects/ignet/data/624.tags.matched >/data/var/projects/ignet/data/624.paths 2>>/data/var/projects/ignet/data/624.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 624 2>>/data/var/projects/ignet/data/624.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/624.filtered.paths /data/var/projects/ignet/data/624.filtered.paths.svm 2>>/data/var/projects/ignet/data/624.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/624.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/624.filtered.scores 2>>/data/var/projects/ignet/data/624.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 624  2>>/data/var/projects/ignet/data/624.error



echo "File ID: 640"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 640 2>/data/var/projects/ignet/data/640.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/640.parses /data/var/projects/ignet/data/640.tags.matched >/data/var/projects/ignet/data/640.paths 2>>/data/var/projects/ignet/data/640.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 640 2>>/data/var/projects/ignet/data/640.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/640.filtered.paths /data/var/projects/ignet/data/640.filtered.paths.svm 2>>/data/var/projects/ignet/data/640.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/640.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/640.filtered.scores 2>>/data/var/projects/ignet/data/640.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 640  2>>/data/var/projects/ignet/data/640.error



echo "File ID: 656"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 656 2>/data/var/projects/ignet/data/656.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/656.parses /data/var/projects/ignet/data/656.tags.matched >/data/var/projects/ignet/data/656.paths 2>>/data/var/projects/ignet/data/656.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 656 2>>/data/var/projects/ignet/data/656.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/656.filtered.paths /data/var/projects/ignet/data/656.filtered.paths.svm 2>>/data/var/projects/ignet/data/656.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/656.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/656.filtered.scores 2>>/data/var/projects/ignet/data/656.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 656  2>>/data/var/projects/ignet/data/656.error



echo "File ID: 672"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 672 2>/data/var/projects/ignet/data/672.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/672.parses /data/var/projects/ignet/data/672.tags.matched >/data/var/projects/ignet/data/672.paths 2>>/data/var/projects/ignet/data/672.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 672 2>>/data/var/projects/ignet/data/672.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/672.filtered.paths /data/var/projects/ignet/data/672.filtered.paths.svm 2>>/data/var/projects/ignet/data/672.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/672.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/672.filtered.scores 2>>/data/var/projects/ignet/data/672.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 672  2>>/data/var/projects/ignet/data/672.error



echo "File ID: 688"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 688 2>/data/var/projects/ignet/data/688.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/688.parses /data/var/projects/ignet/data/688.tags.matched >/data/var/projects/ignet/data/688.paths 2>>/data/var/projects/ignet/data/688.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 688 2>>/data/var/projects/ignet/data/688.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/688.filtered.paths /data/var/projects/ignet/data/688.filtered.paths.svm 2>>/data/var/projects/ignet/data/688.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/688.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/688.filtered.scores 2>>/data/var/projects/ignet/data/688.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 688  2>>/data/var/projects/ignet/data/688.error



echo "File ID: 704"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 704 2>/data/var/projects/ignet/data/704.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/704.parses /data/var/projects/ignet/data/704.tags.matched >/data/var/projects/ignet/data/704.paths 2>>/data/var/projects/ignet/data/704.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 704 2>>/data/var/projects/ignet/data/704.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/704.filtered.paths /data/var/projects/ignet/data/704.filtered.paths.svm 2>>/data/var/projects/ignet/data/704.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/704.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/704.filtered.scores 2>>/data/var/projects/ignet/data/704.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 704  2>>/data/var/projects/ignet/data/704.error



echo "File ID: 720"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 720 2>/data/var/projects/ignet/data/720.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/720.parses /data/var/projects/ignet/data/720.tags.matched >/data/var/projects/ignet/data/720.paths 2>>/data/var/projects/ignet/data/720.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 720 2>>/data/var/projects/ignet/data/720.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/720.filtered.paths /data/var/projects/ignet/data/720.filtered.paths.svm 2>>/data/var/projects/ignet/data/720.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/720.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/720.filtered.scores 2>>/data/var/projects/ignet/data/720.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 720  2>>/data/var/projects/ignet/data/720.error



echo "File ID: 736"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 736 2>/data/var/projects/ignet/data/736.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/736.parses /data/var/projects/ignet/data/736.tags.matched >/data/var/projects/ignet/data/736.paths 2>>/data/var/projects/ignet/data/736.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 736 2>>/data/var/projects/ignet/data/736.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/736.filtered.paths /data/var/projects/ignet/data/736.filtered.paths.svm 2>>/data/var/projects/ignet/data/736.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/736.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/736.filtered.scores 2>>/data/var/projects/ignet/data/736.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 736  2>>/data/var/projects/ignet/data/736.error



echo "File ID: 752"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 752 2>/data/var/projects/ignet/data/752.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/752.parses /data/var/projects/ignet/data/752.tags.matched >/data/var/projects/ignet/data/752.paths 2>>/data/var/projects/ignet/data/752.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 752 2>>/data/var/projects/ignet/data/752.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/752.filtered.paths /data/var/projects/ignet/data/752.filtered.paths.svm 2>>/data/var/projects/ignet/data/752.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/752.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/752.filtered.scores 2>>/data/var/projects/ignet/data/752.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 752  2>>/data/var/projects/ignet/data/752.error



echo "File ID: 768"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 768 2>/data/var/projects/ignet/data/768.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/768.parses /data/var/projects/ignet/data/768.tags.matched >/data/var/projects/ignet/data/768.paths 2>>/data/var/projects/ignet/data/768.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 768 2>>/data/var/projects/ignet/data/768.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/768.filtered.paths /data/var/projects/ignet/data/768.filtered.paths.svm 2>>/data/var/projects/ignet/data/768.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/768.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/768.filtered.scores 2>>/data/var/projects/ignet/data/768.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 768  2>>/data/var/projects/ignet/data/768.error



echo "File ID: 784"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 784 2>/data/var/projects/ignet/data/784.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/784.parses /data/var/projects/ignet/data/784.tags.matched >/data/var/projects/ignet/data/784.paths 2>>/data/var/projects/ignet/data/784.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 784 2>>/data/var/projects/ignet/data/784.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/784.filtered.paths /data/var/projects/ignet/data/784.filtered.paths.svm 2>>/data/var/projects/ignet/data/784.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/784.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/784.filtered.scores 2>>/data/var/projects/ignet/data/784.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 784  2>>/data/var/projects/ignet/data/784.error



echo "File ID: 800"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 800 2>/data/var/projects/ignet/data/800.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/800.parses /data/var/projects/ignet/data/800.tags.matched >/data/var/projects/ignet/data/800.paths 2>>/data/var/projects/ignet/data/800.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 800 2>>/data/var/projects/ignet/data/800.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/800.filtered.paths /data/var/projects/ignet/data/800.filtered.paths.svm 2>>/data/var/projects/ignet/data/800.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/800.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/800.filtered.scores 2>>/data/var/projects/ignet/data/800.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 800  2>>/data/var/projects/ignet/data/800.error



echo "File ID: 816"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 816 2>/data/var/projects/ignet/data/816.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/816.parses /data/var/projects/ignet/data/816.tags.matched >/data/var/projects/ignet/data/816.paths 2>>/data/var/projects/ignet/data/816.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 816 2>>/data/var/projects/ignet/data/816.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/816.filtered.paths /data/var/projects/ignet/data/816.filtered.paths.svm 2>>/data/var/projects/ignet/data/816.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/816.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/816.filtered.scores 2>>/data/var/projects/ignet/data/816.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 816  2>>/data/var/projects/ignet/data/816.error



echo "File ID: 832"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 832 2>/data/var/projects/ignet/data/832.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/832.parses /data/var/projects/ignet/data/832.tags.matched >/data/var/projects/ignet/data/832.paths 2>>/data/var/projects/ignet/data/832.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 832 2>>/data/var/projects/ignet/data/832.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/832.filtered.paths /data/var/projects/ignet/data/832.filtered.paths.svm 2>>/data/var/projects/ignet/data/832.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/832.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/832.filtered.scores 2>>/data/var/projects/ignet/data/832.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 832  2>>/data/var/projects/ignet/data/832.error



echo "File ID: 848"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 848 2>/data/var/projects/ignet/data/848.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/848.parses /data/var/projects/ignet/data/848.tags.matched >/data/var/projects/ignet/data/848.paths 2>>/data/var/projects/ignet/data/848.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 848 2>>/data/var/projects/ignet/data/848.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/848.filtered.paths /data/var/projects/ignet/data/848.filtered.paths.svm 2>>/data/var/projects/ignet/data/848.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/848.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/848.filtered.scores 2>>/data/var/projects/ignet/data/848.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 848  2>>/data/var/projects/ignet/data/848.error



echo "File ID: 864"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 864 2>/data/var/projects/ignet/data/864.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/864.parses /data/var/projects/ignet/data/864.tags.matched >/data/var/projects/ignet/data/864.paths 2>>/data/var/projects/ignet/data/864.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 864 2>>/data/var/projects/ignet/data/864.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/864.filtered.paths /data/var/projects/ignet/data/864.filtered.paths.svm 2>>/data/var/projects/ignet/data/864.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/864.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/864.filtered.scores 2>>/data/var/projects/ignet/data/864.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 864  2>>/data/var/projects/ignet/data/864.error



echo "File ID: 880"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 880 2>/data/var/projects/ignet/data/880.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/880.parses /data/var/projects/ignet/data/880.tags.matched >/data/var/projects/ignet/data/880.paths 2>>/data/var/projects/ignet/data/880.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 880 2>>/data/var/projects/ignet/data/880.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/880.filtered.paths /data/var/projects/ignet/data/880.filtered.paths.svm 2>>/data/var/projects/ignet/data/880.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/880.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/880.filtered.scores 2>>/data/var/projects/ignet/data/880.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 880  2>>/data/var/projects/ignet/data/880.error



echo "File ID: 896"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 896 2>/data/var/projects/ignet/data/896.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/896.parses /data/var/projects/ignet/data/896.tags.matched >/data/var/projects/ignet/data/896.paths 2>>/data/var/projects/ignet/data/896.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 896 2>>/data/var/projects/ignet/data/896.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/896.filtered.paths /data/var/projects/ignet/data/896.filtered.paths.svm 2>>/data/var/projects/ignet/data/896.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/896.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/896.filtered.scores 2>>/data/var/projects/ignet/data/896.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 896  2>>/data/var/projects/ignet/data/896.error



echo "File ID: 912"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 912 2>/data/var/projects/ignet/data/912.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/912.parses /data/var/projects/ignet/data/912.tags.matched >/data/var/projects/ignet/data/912.paths 2>>/data/var/projects/ignet/data/912.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 912 2>>/data/var/projects/ignet/data/912.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/912.filtered.paths /data/var/projects/ignet/data/912.filtered.paths.svm 2>>/data/var/projects/ignet/data/912.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/912.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/912.filtered.scores 2>>/data/var/projects/ignet/data/912.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 912  2>>/data/var/projects/ignet/data/912.error



echo "File ID: 928"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 928 2>/data/var/projects/ignet/data/928.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/928.parses /data/var/projects/ignet/data/928.tags.matched >/data/var/projects/ignet/data/928.paths 2>>/data/var/projects/ignet/data/928.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 928 2>>/data/var/projects/ignet/data/928.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/928.filtered.paths /data/var/projects/ignet/data/928.filtered.paths.svm 2>>/data/var/projects/ignet/data/928.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/928.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/928.filtered.scores 2>>/data/var/projects/ignet/data/928.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 928  2>>/data/var/projects/ignet/data/928.error



echo "File ID: 944"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 944 2>/data/var/projects/ignet/data/944.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/944.parses /data/var/projects/ignet/data/944.tags.matched >/data/var/projects/ignet/data/944.paths 2>>/data/var/projects/ignet/data/944.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 944 2>>/data/var/projects/ignet/data/944.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/944.filtered.paths /data/var/projects/ignet/data/944.filtered.paths.svm 2>>/data/var/projects/ignet/data/944.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/944.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/944.filtered.scores 2>>/data/var/projects/ignet/data/944.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 944  2>>/data/var/projects/ignet/data/944.error



echo "File ID: 960"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 960 2>/data/var/projects/ignet/data/960.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/960.parses /data/var/projects/ignet/data/960.tags.matched >/data/var/projects/ignet/data/960.paths 2>>/data/var/projects/ignet/data/960.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 960 2>>/data/var/projects/ignet/data/960.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/960.filtered.paths /data/var/projects/ignet/data/960.filtered.paths.svm 2>>/data/var/projects/ignet/data/960.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/960.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/960.filtered.scores 2>>/data/var/projects/ignet/data/960.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 960  2>>/data/var/projects/ignet/data/960.error



echo "File ID: 976"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 976 2>/data/var/projects/ignet/data/976.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/976.parses /data/var/projects/ignet/data/976.tags.matched >/data/var/projects/ignet/data/976.paths 2>>/data/var/projects/ignet/data/976.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 976 2>>/data/var/projects/ignet/data/976.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/976.filtered.paths /data/var/projects/ignet/data/976.filtered.paths.svm 2>>/data/var/projects/ignet/data/976.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/976.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/976.filtered.scores 2>>/data/var/projects/ignet/data/976.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 976  2>>/data/var/projects/ignet/data/976.error



echo "File ID: 992"

echo "Step 1: get_data"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 992 2>/data/var/projects/ignet/data/992.error

echo "Step 2: extract_paths_v2"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/992.parses /data/var/projects/ignet/data/992.tags.matched >/data/var/projects/ignet/data/992.paths 2>>/data/var/projects/ignet/data/992.error

echo "Step 3: extract_keywords"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt 992 2>>/data/var/projects/ignet/data/992.error

echo "Step 4: svm_format"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/992.filtered.paths /data/var/projects/ignet/data/992.filtered.paths.svm 2>>/data/var/projects/ignet/data/992.error

echo "Step 5: svm_classify"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/992.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/992.filtered.scores 2>>/data/var/projects/ignet/data/992.error

echo "Step 6: create_db_data"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data 992  2>>/data/var/projects/ignet/data/992.error


