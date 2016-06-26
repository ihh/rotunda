
# JavaScript dependencies
dep:
	bower install dojo/dojo dojo/dijit dojo/dojox dojo/util

bower:
	npm install -g bower

# data files
# chromosomal bands
cytoBand.txt.gz:
	curl -O http://hgdownload.cse.ucsc.edu/goldenpath/hg19/database/cytoBand.txt.gz

cytoBand.txt: cytoBand.txt.gz
	gunzip $<

# segmental duplications
GRCh37GenomicSuperDup.tab:
	curl -O http://humanparalogy.gs.washington.edu/build37/data/GRCh37GenomicSuperDup.tab

GRCh37GenomicSuperDup.links: GRCh37GenomicSuperDup.tab
	cat $< | cut -f 1,2,3,7,8,9 | sed '1,1d' >$@
