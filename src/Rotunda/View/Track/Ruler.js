define(['dojo/_base/declare',
        'Rotunda/View/Track'],
       function(declare,
                Track) {

/**
 * @class
 */
var tickMagUnits = ['bp', 'kb', 'Mb', 'Gb']

return declare (Track,
{
    constructor: function(config) {
	this.axisLabelScaleThreshold = config.axisLabelScaleThreshold || 4
    },

    radius: function (scale,trackRadiusScale) {
	return scale >= this.axisLabelScaleThreshold ? 28 : 8  // do not scale
    },

    draw: function (rot, minRadius, maxRadius, minAngle, maxAngle) {

	var baseRange = (maxAngle - minAngle) / rot.radsPerBase
	var mag = Math.ceil(Math.log10(baseRange))
	var tickMag = Math.max (0, mag - 2)
	var tickSep = Math.pow (10, tickMag)
	var midTickSep = 5 * tickSep
	var bigTickSep = 10 * tickSep

	var bigTickMag = tickMag + 1
	var unitsMag = Math.min (3*(tickMagUnits.length - 1), bigTickMag - (bigTickMag % 3))
	var unitsSep = Math.pow (10, unitsMag)
	var units = tickMagUnits[unitsMag/3]

	var smallTickMaxRadius = minRadius + 2
	var midTickMaxRadius = minRadius + 4
	var bigTickMaxRadius = minRadius + 8
        
	var refSeqsInView = rot.intervalsInView()
	var ticks = refSeqsInView.reduce (function (list, feature) {
	    var seqTicks = []
	    for (var pos = feature.start - (feature.start % tickSep);
		 pos < feature.end;
		 pos += tickSep)
		seqTicks.push ({ seq: feature.seq,
				 angle: rot.coordToAngle (feature.seq, pos + 1),
				 minRadius: minRadius,
				 maxRadius: ((pos % bigTickSep)
					     ? ((pos % midTickSep) ? smallTickMaxRadius : midTickMaxRadius)
					     : bigTickMaxRadius),
				 text: ((pos == 0 || pos % bigTickSep) ? undefined : ((pos / unitsSep) + units))
			       })
	    return list.concat (seqTicks)
	}, [])

	var featureColor = this.featureColor (rot)
        
        var featureArc = d3.svg.arc()
            .innerRadius (function (feature) {
		return feature.minRadius
	    }).outerRadius (function (feature) {
		return feature.maxRadius
	    }).startAngle (function (feature) {
                return feature.angle
            }).endAngle (function (feature) {
                return feature.angle
            })

        this.d3data(rot,ticks).append("path")
            .attr("d", featureArc)
            .attr("fill", featureColor)
            .attr("stroke", featureColor)

        var featureTransform = function (feature) {
            return "translate("
                + rot.xPos ((maxRadius + bigTickMaxRadius) / 2, feature.angle)
                + ","
                + rot.yPos ((maxRadius + bigTickMaxRadius) / 2, feature.angle)
                + ")"
        }

        var featureText = function (feature) {
            return feature.text
        }

	var labeledTicks = ticks.filter (function (t) { return t.text })
        this.d3data(rot,labeledTicks).append("g")
            .attr("transform", featureTransform)
            .append("text")
            .attr("class", "rotundaLabel")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .text(featureText)
    }
})

});
