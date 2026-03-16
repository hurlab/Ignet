#benubansal

import networkx as nx
#package1
import argparse
#package2
import os
from pathlib import Path

from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lex_rank import LexRankSummarizer

from networkx.algorithms import centrality
from networkx.readwrite import write_pajek, write_graphml

import sys
import random

# Variable declarations
delim = r"[ \t]+"
sample_size = 0
sample_type = "randomedge"
fname = ""
out_file = ""
pajek_file = ""
graphml_file = ""
extract = 0
stem = 1
undirected = 0
wcc = 0
scc = 0
components = 0
paths = 0
triangles = 0
assortativity = 0
local_cc = 0
all = 0
output_delim = " "
stats = 1
degree_centrality = 0
closeness_centrality = 0
betweenness_centrality = 0
lexrank_centrality = 0
force = 0
graph_class = ""
filebased = 0
cf = 0
multiedge = 0
verbose = 0

# Initialize the parser
parser = argparse.ArgumentParser(description="Process network statistics options")

# Define the arguments
parser.add_argument("--input", type=str, default="", help="Input filename")
#parser.add_argument("--delim", type=str, default=r"[ \t]+", help="Delimiter for input")
parser.add_argument('--delim', type=str, required=True, help="Delimiter for vertices in input.")
parser.add_argument("--delimout", type=str, default=" ", help="Delimiter for output")
parser.add_argument("--output", type=str, default="", help="Output filename")
parser.add_argument("--pajek", type=str, default="", help="Pajek filename")
parser.add_argument("--graphml", type=str, default="", help="GraphML filename")
parser.add_argument("--sample", type=int, default=0, help="Sample size")
parser.add_argument("--sampletype", type=str, default="randomedge", help="Sample type")
parser.add_argument("--extract", action='store_true', help="Extract flag")
parser.add_argument("--stem", action='store_true', help="Stem flag")
parser.add_argument("--undirected", action='store_true', help="Undirected flag")
parser.add_argument("--components", action='store_true', help="Components flag")
parser.add_argument("--paths", action='store_true', help="Paths flag")
parser.add_argument("--wcc", action='store_true', help="Weakly connected components flag")
parser.add_argument("--scc", action='store_true', help="Strongly connected components flag")
parser.add_argument("--triangles", action='store_true', help="Triangles flag")
parser.add_argument("--verbose", action='store_true', help="Verbose flag")
parser.add_argument("--assortativity", action='store_true', help="Assortativity flag")
parser.add_argument("--localcc", action='store_true', help="Local clustering coefficient flag")
parser.add_argument("--stats", action='store_true', help="Statistics flag")
parser.add_argument("--all", action='store_true', help="All flag")
parser.add_argument("--cf", action='store_true', help="CF flag")
parser.add_argument("--betweenness-centrality", action='store_true', help="Betweenness centrality flag")
parser.add_argument("--degree-centrality", action='store_true', help="Degree centrality flag")
parser.add_argument("--closeness-centrality", action='store_true', help="Closeness centrality flag")
parser.add_argument("--eigenvector-centrality", action='store_true', help="Eigenvector centrality flag") #eigenvector
parser.add_argument("--lexrank-centrality", action='store_true', help="LexRank centrality flag")
parser.add_argument("--force", action='store_true', help="Force flag")
parser.add_argument("--graph-class", type=str, default="", help="Graph class")
parser.add_argument("--filebased", action='store_true', help="Filebased flag")
parser.add_argument("--multiedge", action='store_true', help="Multiedge flag")
#parser.add_argument('-i', '--input', type=str, required=True, help="Input file in edge-edge format.")
parser.add_argument('-i', type=str, dest='input_file', required=True, help="Input file in edge-edge format.")


# Parse the arguments
args = parser.parse_args()

# Parse arguments
args, unknown = parser.parse_known_args()

# Print arguments (or use them in your logic)
#print(f"Delimiter: {args.delim}")
#print(f"Undirected: {args.undirected}")
#print(f"Force: {args.force}")
#print(f"Degree Centrality: {args.degree_centrality}")
#print(f"Betweenness Centrality: {args.betweenness_centrality}")
#print(f"Closeness Centrality: {args.closeness_centrality}")
#print(f"Input file: {args.input_file}")


# Access the values
fname = args.input_file
delim = args.delim
output_delim = args.delimout
out_file = args.output
pajek_file = args.pajek
graphml_file = args.graphml
sample_size = args.sample
sample_type = args.sampletype
extract = args.extract
stem = args.stem
undirected = args.undirected
components = args.components
paths = args.paths
wcc = args.wcc
scc = args.scc
triangles = args.triangles
verbose = args.verbose
assortativity = args.assortativity
local_cc = args.localcc
stats = args.stats
all = args.all
cf = args.cf
betweenness_centrality = args.betweenness_centrality
degree_centrality = args.degree_centrality
closeness_centrality = args.closeness_centrality
lexrank_centrality = args.lexrank_centrality
eigenvector_centrality = args.eigenvector_centrality #eigen
force = args.force
graph_class = args.graph_class
filebased = args.filebased
multiedge = args.multiedge

directed = not undirected
#vol, dir, prefix = os.path.split(fname)
#prefix = prefix.replace('.graph', '')

# Split the file name into directory path and base name (filename.ext)
dir_path, file_name = os.path.split(fname)

# Extract the file name without extension
prefix = os.path.splitext(file_name)[0]

if all:
    # Enable all options
    if directed:
        wcc = True
        scc = True
    else:
        components = True
   
    triangles = True
    paths = True
    assortativity = True
    local_cc = True
    betweenness_centrality = True
    degree_centrality = True
    closeness_centrality = True
    lexrank_centrality = True
    eigenvector_centrality = True

#if res is not defined or fname is empty
if fname == "":
    usage()
#setting hyp equals empty list
hyp = []

# make unbuffered
sys.stdout.flush()

if verbose:
    print(f"Reading in {'directed' if directed else 'undirected'} graph file")

#my $reader = Clair::Network::Reader::Edgelist->new();
# Initialize an empty graph

#If you need to create a directed graph, you can use nx.DiGraph()

#G = nx.DiGraph()
#To read an edge list from a file and create the graph, you can use the read_edgelist function:

#G = nx.read_edgelist("path_to_edgelist_file", create_using=nx.Graph(), nodetype=int)

G = nx.Graph()

net = None
graph = None

#old one
#def read_network(fname, delim, directed, filebased, multiedge, edge_property=None):
 #   print("inside read_network")
  #  if multiedge:
   #     graph = nx.MultiDiGraph() if directed else nx.MultiGraph()
    #else:
     #   graph = nx.DiGraph() if directed else nx.Graph()

    # Read the edge list from the file   NOT WORKING
    #graph = nx.read_edgelist(fname, delimiter=delim, create_using=graph, data=(('weight', float),))

    # If you need to handle filebased and edge_property differently, add that logic here

    #return graph
def read_network(fname, delim, directed, multiedge):
    # Check if the file exists
    if not os.path.isfile(fname):
        print(f"File Not Found: The file {fname} does not exist")
    # Print file content
    with open(fname, 'r') as file:
        content = file.read()
    try:
        delim = '\t' # using \t as a delim value for now
        if multiedge:
            G = nx.read_edgelist(fname, delimiter=delim, create_using=nx.MultiDiGraph() if directed else nx.MultiGraph())
            # Check if the graph has been populated
            #if G.number_of_nodes() == 0 and G.number_of_edges() == 0:
                #print("The graph is empty. Please check the file content and format.")
            #else:
                #print(f"Graph nodes: {list(G.nodes())}")
                #print(f"Graph edges: {list(G.edges())}")
        else:
            # Manually parse and print each line to ensure it's read correctly
            edges = []
            with open(fname, 'r') as file:
                for line in file:
                    parts = line.strip().split(delim)
                    if len(parts) == 2:
                        u, v = parts
                        edges.append((u, v))
                        
                    else:
                        print(f"Skipping invalid line: {line.strip()}")

            # Print parsed edges
            #print(f"Parsed edges: {edges}")

            # Create the graph using the parsed edges
            G = nx.DiGraph() if directed else nx.Graph()
            G.add_edges_from(edges)
            #error in the following line
            #G = nx.read_edgelist(fname, delimiter=delim, create_using=nx.DiGraph() if directed else nx.Graph())
            # Check if the graph has been populated
           # if G.number_of_nodes() == 0 and G.number_of_edges() == 0:
            #    print("The graph is empty. Please check the file content and format.")
           # else:
            #    print(f"Graph nodes: {list(G.nodes())}")
             #   print(f"Graph edges: {list(G.edges())}")
        return G
    except FileNotFoundError:
        print(f"File Not Found: The file {fname} does not exist")
    except PermissionError:
        print(f"Permission Denied: Unable to read the file {fname}")
    except Exception as e:
        print(f"An error occurred: {e}")


# Usage example
edge_property = "lexrank_transition"

#if graph_class != "":
    # Assuming graph_class is handled elsewhere in Python
 #   print("ifstatement")
  #  print(fname)
   # print(delim)
   # print(directed)
  #  print(filebased)
  #  print(multiedge)
   # graph = read_network(fname, delim, directed, multiedge)
#else:
 #   print("elsestatement")
 #   print(fname)
 #   print(delim)
 #   print(directed)
 #   print(filebased)
 #   print(multiedge)
 #   print(edge_property)
 #   net = read_network(fname, delim, directed, multiedge)

# Read the network
#print("-------------------------------")
#print("_______________________________")
#with open(fname, 'r') as file:
 #   content = file.read()
  #  print(content)

#print("-------------------------------")
#print("_______________________________")

G = read_network(fname, delim, directed, multiedge)

    # Sample network if requested
if sample_size > 0:
    G = sample_network(G, sample_size, sample_type, verbose)


# Define a function to sample edges using random edge algorithm
def sample_random_edge(net, sample_size):
    edges = list(net.edges())
    sampled_edges = random.sample(edges, min(sample_size, len(edges)))
    return net.edge_subgraph(sampled_edges).copy()

# Define a function to sample nodes using Forest Fire algorithm
def sample_forest_fire(net, sample_size):
    sampled_nodes = nx.generators.forest.fire_graph(net, seed=None).nodes()
    return net.subgraph(sampled_nodes).copy()

# Define a function to sample nodes using random node algorithm
def sample_random_node(net, sample_size):
    nodes = list(net.nodes())
    sampled_nodes = random.sample(nodes, min(sample_size, len(nodes)))
    return net.subgraph(sampled_nodes).copy()

#old one
# Function to handle sampling based on sample_type
#def sample_network(net, sample_size, sample_type, verbose=False):
 #   if sample_size > 0:
  #      if sample_type == "randomedge":
   #         if verbose:
    #            print(f"Sampling {sample_size} edges from network using random edge algorithm")
     #       net = sample_random_edge(net, sample_size)
      #  elif sample_type == "forestfire":
       #     if verbose:
        #        print(f"Sampling {sample_size} nodes from network using Forest Fire algorithm")
         #   net = sample_forest_fire(net, sample_size)
        #elif sample_type == "randomnode":
         #   if verbose:
          #      print(f"Sampling {sample_size} nodes from network using random node algorithm")
          #  net = sample_random_node(net, sample_size)
   
   # return net

def sample_network(G, sample_size, sample_type, verbose):
    if sample_type == "randomedge":
        if verbose:
            print("Sampling {} edges from network using random edge algorithm".format(sample_size))
        edges = random.sample(list(G.edges()), sample_size)
        H = G.edge_subgraph(edges).copy()
    elif sample_type == "forestfire":
        if verbose:
            print("Sampling {} nodes from network using Forest Fire algorithm".format(sample_size))
        nodes = random.sample(list(G.nodes()), sample_size)
        H = G.subgraph(nodes).copy()
    elif sample_type == "randomnode":
        if verbose:
            print("Sampling {} nodes from network using random node algorithm".format(sample_size))
        nodes = random.sample(list(G.nodes()), sample_size)
        H = G.subgraph(nodes).copy()
    
    return H

def write_network(G, file, format):
    if format == "pajek":
        write_pajek(G, file)
    elif format == "graphml":
        write_graphml(G, file)


def print_network_info(G, components, wcc, scc, paths, triangles, assortativity, localcc, delim, verbose):
    print("Network info:")
    print("  nodes:", G.number_of_nodes())
    print("  edges:", G.number_of_edges())
    if components:
        print("  components:", [len(c) for c in nx.connected_components(G)])
    if wcc:
        print("  weakly connected components:", [len(c) for c in nx.weakly_connected_components(G)])
    if scc:
        print("  strongly connected components:", [len(c) for c in nx.strongly_connected_components(G)])
    if triangles:
        print("  triangles:", nx.triangles(G))
    if assortativity:
        print("  assortativity coefficient:", nx.degree_assortativity_coefficient(G))
    if localcc:
        print("  local clustering coefficient:", nx.clustering(G))

def centrality_measures(G, measure, output_file, output_delim):
    if measure == "degree":
        centrality_values = nx.degree_centrality(G)
        
    elif measure == "closeness":
        centrality_values = nx.closeness_centrality(G)
        
    elif measure == "betweenness":
        centrality_values = nx.betweenness_centrality(G)
    
    elif measure == "eigenvector":
        centrality_values = nx.eigenvector_centrality(G)

    elif measure == "lexrank":
        # LexRank is not directly available in NetworkX, implementing custom if required.
        centrality_values = {}  # Placeholder for LexRank centrality computation

    directory = os.path.dirname(output_file)

    try:
    # Ensure the directory exists
        directory = os.path.dirname(output_file)
        #print("-----current directory-----")
        # Get the directory path of the current script
        script_directory = os.path.dirname(os.path.abspath(__file__))
        #print(script_directory)
        #os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
            #   print(f"The file '{output_file}' does not exist. Creating the file...")
        with open(output_file, "w") as f:
            
            for node, cent in centrality_values.items():
                
                f.write(f"{node}{output_delim}{cent:.8f}\n")
                
                #f.write(f"{node}\t{cent:.8f}\n")
       #print(f"Data successfully written to {output_file}")
    except PermissionError:
        print(f"Permission Denied: Unable to write to {output_file}")
    except FileNotFoundError:
        print(f"File Not Found: The directory or file {output_file} does not exist")
    except Exception as e:
        print(f"An error occurred: {e}")
    #with open(output_file, "w") as f:
     #   for node, cent in centrality_values.items():
      #      f.write(f"{node}{output_delim}{cent:.8f}\n")

# Check network size limits
if ((G.number_of_nodes() > 2000 or G.number_of_edges() > 4000000) and not args.force and not args.filebased):
    error_msg = "Network is too large"
    if G.number_of_nodes() > 2000:
        error_msg += " ({} > 2000 nodes)".format(G.number_of_nodes())
    if G.number_of_edges() > 4000000:
        error_msg += " ({} > 4000000 edges)".format(G.number_of_edges())
    error_msg += ", please use sampling\n"
    sys.exit(error_msg)

    # Write network to files if specified
if args.pajek:
    write_network(G, args.pajek, "pajek")
if args.graphml:
    write_network(G, args.graphml, "graphml")
if args.output:
    nx.write_edgelist(G, args.output, delimiter=args.delimout)

# Extract largest component if requested
if args.extract:
    if verbose:
        print("Extracting largest connected component")
    components = list(nx.connected_components(G))
    largest_component = max(components, key=len)
    G = G.subgraph(largest_component).copy()

if args.all:
    args.stats = True

if args.stats:
    print_network_info(G, args.components, args.wcc, args.scc, args.paths, args.triangles,
                           args.assortativity, args.localcc, args.delimout, verbose)

# Centrality measures
prefix = os.path.splitext(os.path.basename(args.input_file))[0]
try:
    if args.degree_centrality:
        centrality_measures(G, "degree", f"{prefix}.degree-centrality", args.delimout)
    if args.closeness_centrality:
        centrality_measures(G, "closeness", f"{prefix}.closeness-centrality", args.delimout)
    if args.betweenness_centrality:
        centrality_measures(G, "betweenness", f"{prefix}.betweenness-centrality", args.delimout)
    if args.eigenvector_centrality:
        centrality_measures(G, "eigenvector", f"{prefix}.eigenvector-centrality", args.delimout)
    if args.lexrank_centrality:
        centrality_measures(G, "lexrank", f"{prefix}.lexrank-centrality", args.delimout) 
    
except Exception as e:
    # Code to execute if any exception is raised
    print("An error occurred:", e)

#if args.degree_centrality:
 #   centrality_measures(G, "degree", f"{prefix}.degree-centrality", args.delimout)
#if args.closeness_centrality:
#   centrality_measures(G, "closeness", f"{prefix}.closeness-centrality", args.delimout)
#if args.betweenness_centrality:
#    centrality_measures(G, "betweenness", f"{prefix}.betweenness-centrality", args.delimout)
#if args.lexrank_centrality:
 #   centrality_measures(G, "lexrank", f"{prefix}.lexrank-centrality", args.delimout)    
    
    
# Example usage
#net = nx.Graph()
#net.add_edges_from([(1, 2), (2, 3), (3, 4)])

#net = sample_network(net, sample_size, sample_type, verbose)

#defining the usage function
#this function runs in case of an error or if parameters are not passed properly
def usage():
    print("usage: test.py [-e] [-d delimiter] -i file [-f dotfile]")
    print("or:    test.py [-f dotfile] < file")
    print("  --input file")
    print("          Input file in edge-edge format")
    print("  --delim delimiter")
    print("          Vertices in input are delimited by delimiter character")
    print("  --delimout output_delimiter")
    print("          Vertices in output are delimited by delimiter (can be printf format string)")
    print("  --force")
    print("          Ignore the 2000 nodes' limit")
    print("  --sample sample_size")
    print("          Calculate statistics for a sample of the network")
    print("          The sample_size parameter is interpreted differently for each")
    print("          sampling algorithm")
    print("  --sampletype sampletype")
    print("          Change the sampling algorithm, one of: randomnode, randomedge,")
    print("          forestfire")
    print("          randomnode: Pick sample_size nodes randomly from the original network")
    print("          randomedge: Pick sample_size edges randomly from the original network")
    print("          forestfire: Pick sample_size nodes randomly from the original network")
    print("                      using ForestFire sampling (see the tutorial for more")
    print("                      information)")
    print("          By default uses random edge sampling")
    print("  --output out_file")
    print("          If the network is modified (sampled, etc.) you can optionally write it")
    print("          out to another file")
    print("  --pajek pajek_file")
    print("          Write output in Pajek compatible format")
    print("  --extract,  -e")
    print("          Extract largest connected component before analyzing.")
    print("  --undirected,  -u")
    print("          Treat graph as an undirected graph, default is directed")
    print("  --scc")
    print("          Print strongly connected components")
    print("  --wcc")
    print("          Print weakly connected components")
    print("  --components")
    print("          Print components (for undirected graph)")
    print("  --paths,  -p")
    print("          Print shortest path matrix for all vertices")
    print("  --triangles,  -t")
    print("          Print all triangles in graph")
    print("  --assortativity,  -a")
    print("          Print the network assortativty coefficient")
    print("  --localcc,  -l")
    print("          Print the local clustering coefficient of each vertex")
    print("  --degree-centrality")
    print("          Print the degree centrality of each vertex")
    print("  --closeness-centrality")
    print("          Print the closeness centrality of each vertex")
    print("  --betweenness-centrality")
    print("          Print the betweenness centrality of each vertex")
    print("  --lexrank-centrality")
    print("          Print the LexRank centrality of each vertex")
    print("  --all")
    print("          Print all statistics for the network")
    print("  --self-loop")
    print("          Count the number of self loops in when calculating the harmonic mean geodesic distance using n*(n+1)/2 as numerator, default is using n*(n-1)/2")
    print()
    print("example: script.py -i test.graph")
    print()
    print("Example with sampling: script.py -i test.graph --sample 100 --sampletype randomnode")
    print()
    sys.exit()

#Test_Example
# Create a graph
#G = nx.Graph()
#G.add_edges_from([(1, 2), (1, 3), (2, 3)])

# Calculate degree centrality
#degree_centrality = nx.degree_centrality(G)
#print("Degree Centrality:", degree_centrality)

# Betweenness Centrality
#betweenness_centrality = nx.betweenness_centrality(G)

# Closeness Centrality
#closeness_centrality = nx.closeness_centrality(G)

