#!/usr/bin/perl -w

use strict;
use DBI;

my $sid = shift;

#my $user   = "zxiang";
#my $passwd = "zx!!ang";

my $user   = "ozgur";
my $passwd = "oz9ur\$dbx";

#my $dbh = DBI->connect("dbi:Sybase:server=NCIBIDB", $user, $passwd, {PrintError => 1});
my $dbh = DBI->connect("dbi:Sybase:server=NCIBIDB", $user, $passwd, {PrintError => 1});

unless ($dbh) {
    die "Unable for connect to server $DBI::errstr";
}

$dbh->do("use pubmed");
#$dbh->do("use pubmed_09n");

my $parse = "";
$parse = get_sent_parse($sid);
	
print $parse, "\n";
	
exit(0);


### function to retrieve the typed dependency collapsed parse from the database for a given sentenceID
sub get_sent_parse{
	
	my ($sent_id) = @_;
	
	my $query = "select governor, governorToken, relation, dependent, dependentToken from TypedDependencyParse where sentenceID=$sent_id and (governor is not NULL)";
	
	my $sth;
	$sth = $dbh->prepare($query);
	$sth->execute();
	
	# BIND TABLE COLUMNS TO VARIABLES
	my ($governor, $governorToken, $relation, $dependent, $dependentToken);
	$sth->bind_columns(undef, \$governor, \$governorToken, \$relation, \$dependent, \$dependentToken);
	
	my $parse = "";
	# LOOP THROUGH RESULTS
	while($sth->fetch()) {
			$parse = $parse.$relation."(".$governor."-".$governorToken.", ".$dependent."-".$dependentToken.")\n";
	} 
	
	return $parse;
}
