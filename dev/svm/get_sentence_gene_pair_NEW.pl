#!/usr/bin/perl -w

## parse SciMinerOutput*.txt and get sid hugo_geneid1 tab match-string
use strict;

my %hash = ();

my @files = glob '/data/home/juhur/SciMiner_Complete_Data_2011Dec/RawData/SciMinerOutput/*.txt';
foreach my $file (@files) {
        #open FILE, "gunzip -c $file|" or die $!;
	open FILE, $file or die $!;
	while (my $line = <FILE>) {
		chomp($line);
		
		my @tmpSplit	= split (/\t/, $line);
		my $type	= $tmpSplit[0];
		my $pmid	= $tmpSplit[1];		
		my $sid 	= $tmpSplit[2];
		my $sgid	= $tmpSplit[3];
		my $hgid	= $tmpSplit[4];		
		my $hgsym	= $tmpSplit[5];
		my $match1	= $tmpSplit[6];
		my $match2	= $tmpSplit[7];
		my $p	    	= $tmpSplit[8];		
		my $score	= $tmpSplit[9];		
		my $inExclude	= $tmpSplit[15];	
		
		# Process only thte gene/symbol with 
		if (($type eq 'SYMBOL') || ($type eq 'NAME'))
		{	# Check inExclude values
			if ($inExclude == 1)
			{	# this must be included
				my $gene = $hgsym."\t".$match2;
				$hash{$sid}{$gene}++;
				
			}elsif ($inExclude == 2)
			{	# this must be excluded

			}else
			{	# check the score and add if it's positive
				if ($score > 0)
				{	# this must be included
					my $gene = $hgsym."\t".$match2;
					$hash{$sid}{$gene}++;

				}
			}
		}
	}
	close FILE;
}

#print hash to file
foreach my $sid (keys %hash){
	foreach my $gene (keys %{$hash{$sid}}){
		print $sid, "\t", $gene, "\n";
	}
}
