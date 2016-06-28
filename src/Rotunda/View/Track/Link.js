define(['dojo/_base/declare',
        'Rotunda/View/Track'],
       function(declare,
                Track) {

/**
 * @class
 */
return declare (Track,
{
    constructor: function(config) {
    },

    radius: 0,

    draw: function (rot, minRadius, maxRadius) {

        var featureColor = this.featureColor (rot)

        var innerRadius = rot.innerRadius()
        var featureChord = d3.svg.chord()
            .source (function (link) {
                var s = { startAngle: rot.coordToAngle (link.seq, link.start),
                          endAngle: rot.coordToAngle (link.seq, link.end),
                          radius: innerRadius }
                return s
            })
            .target (function (link) {
                var t = { startAngle: rot.coordToAngle (link.otherSeq, link.otherStart),
                          endAngle: rot.coordToAngle (link.otherSeq, link.otherEnd),
                          radius: innerRadius }
                return t
            })

        this.d3data(rot).append("path")
            .attr("d", featureChord)
            .attr("fill", featureColor)
            .attr("stroke", featureColor)

    }

})
});
