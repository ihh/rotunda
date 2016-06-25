var refSeqNameLen = [
    ["chr1", 249250621],
    ["chr2", 243199373],
    ["chr3", 198022430],
    ["chr4", 191154276],
    ["chr5", 180915260],
    ["chr6", 171115067],
    ["chr7", 159138663],
    ["chr8", 146364022],
    ["chr9", 141213431],
    ["chr10", 135534747],
    ["chr11", 135006516],
    ["chr12", 133851895],
    ["chr13", 115169878],
    ["chr14", 107349540],
    ["chr15", 102531392],
    ["chr16", 90354753],
    ["chr17", 81195210],
    ["chr18", 78077248],
    ["chr20", 63025520],
    ["chr19", 59128983],
    ["chr22", 51304566],
    ["chr21", 48129895],
    ["chrX", 155270560],
    ["chrY", 59373566]
]

var refSeqName = refSeqNameLen.map (function (nl) { return nl[0] })
var refSeqLen = refSeqNameLen.map (function (nl) { return nl[1] })

var refSeqFeatures = refSeqNameLen.map (function (nl) {
    return { seq: nl[0],
             start: 0,
             end: nl[1],
             id: nl[0],
             type: nl[0] }
})

var rotunda
$.get("cytoBand.txt",
      function (cytoBandTxt) {

          var nonempty_regex = /\S/
          
          var cyto = cytoBandTxt
              .split("\n")
              .filter (function (line) { return line.match (nonempty_regex) })
              .map (function (line) { return line.split("\t") })
              .map (function (fields) {
                  return { seq: fields[0],
                           start: fields[1],
                           end: fields[2],
                           id: fields[3],
                           type: fields[4] }
              })

          var refSeqTrack = { id: "ref_seqs",
                              label: "Chromosomes",
                              features: refSeqFeatures }

          var cytoTrack = { id: "cyto_bands",
                            label: "Cytogenetic bands",
                            features: cyto }
          
          rotunda = new Rotunda( { refSeqName: refSeqName,
                                   refSeqLen: refSeqLen,
                                   tracks: [ refSeqTrack,
                                             cytoTrack ] })
      })
