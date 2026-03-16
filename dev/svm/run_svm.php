<?php 
//run the svm pipeline
/*
SELECT distinct ([fileID])
  FROM [pubmed_11n].[dbo].[Document]
  WHERE fileID is not null
  ORDER BY fileID
*/

/*
//get vaccine-gene interaction
get_data_gene2vaccine_v2.3.pl
//get gene-gene interaction
get_data_gene2gene_v2.1.pl

*/


$no_processes=16;

for ($i=0; $i<$no_processes; $i++) {
	$strOutput="#!/bin/bash";

	for ($j=$i+1; $j<=1006; $j+=$no_processes) {
		$file_id = $j;
//		if (!file_exists("/data/var/projects/ignet/data/$file_id.db.data")) {
			$strOutput.="
echo \"File ID: $file_id\"

echo \"Step 1: get_data\"
date
cd /data/var/projects/ignet/code/ 
./get_data_gene2vaccine_v2.3.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt $file_id 2>/data/var/projects/ignet/data/$file_id.error

echo \"Step 2: extract_paths_v2\"
date
cd /data/var/projects/ignet/code/ 
./extract_paths_v2.pl /data/var/projects/ignet/data/$file_id.parses /data/var/projects/ignet/data/$file_id.tags.matched >/data/var/projects/ignet/data/$file_id.paths 2>>/data/var/projects/ignet/data/$file_id.error

echo \"Step 3: extract_keywords\"
date
cd /data/var/projects/ignet/code/ 
./extract_keywords.pl /data/var/projects/ignet/data /data/var/projects/ignet/int_words_v2.txt $file_id 2>>/data/var/projects/ignet/data/$file_id.error

echo \"Step 4: svm_format\"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2
./svm_format.pl /data/var/projects/ignet/data/$file_id.filtered.paths /data/var/projects/ignet/data/$file_id.filtered.paths.svm 2>>/data/var/projects/ignet/data/$file_id.error

echo \"Step 5: svm_classify\"
date
cd /data/var/projects/ignet/code/int_ext_svm_v2/svm_edit 
./svm_classify /data/var/projects/ignet/data/$file_id.filtered.paths.svm /data/var/projects/ignet/code/int_ext_svm_v2/classify/edit_kernel.model /data/var/projects/ignet/data/$file_id.filtered.scores 2>>/data/var/projects/ignet/data/$file_id.error

echo \"Step 6: create_db_data\"
date
cd /data/var/projects/ignet/code/
./create_db_data.pl /data/var/projects/ignet/data $file_id  2>>/data/var/projects/ignet/data/$file_id.error


";
//		}
	}
	
	file_put_contents("run_$i.sh", $strOutput);
	system("dos2unix run_$i.sh");
	chmod("run_$i.sh", 0755);

}

for ($i=0; $i<$no_processes; $i++) {
//	system("nohup ./run_$i.sh >/data/var/projects/ignet/data/$i.out &\n");
	print("nohup ./run_$i.sh >/data/var/projects/ignet/data/$i.out &\n");
}
?>
