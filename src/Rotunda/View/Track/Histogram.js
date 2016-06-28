define(['dojo/_base/declare',
        'Rotunda/View/Track',
	'Rotunda/util'],
       function(declare,
                Track,
		util) {

/**
 * @class
 */
return declare (Track,
{
    constructor: function(config) {
    },

    units: "",

    draw: function (rot, minRadius, maxRadius) {

	var track = this
        var featureColor = this.featureColorFunc()

        var values = this.features.map (function (feature) { return feature.value })
        var minValue = this.hasOwnProperty('minValue') ? this.minValue : Math.min.apply (this, values)
        var maxValue = this.hasOwnProperty('maxValue') ? this.maxValue : Math.max.apply (this, values)
        var baselineValue = this.hasOwnProperty('baselineValue') ? this.baselineValue : util.mean (values)
        var val2radius = (maxRadius - minRadius) / (maxValue - minValue)

        var featureArc = d3.svg.arc()
            .innerRadius (function(feature) {
                return ((feature.value > baselineValue ? baselineValue : feature.value) - minValue) * val2radius + minRadius
            }).outerRadius (function(feature) {
                return ((feature.value > baselineValue ? feature.value : baselineValue) - minValue) * val2radius + minRadius
            }).startAngle (function (feature) {
                return rot.coordToAngle (feature.seq, feature.start)
            }).endAngle (function (feature) {
                return rot.coordToAngle (feature.seq, feature.end)
            })

        var path = this.d3data(rot).append("path")
            .attr("d", featureArc)
            .attr("fill", featureColor)
            .attr("stroke", featureColor)

	var featureLabel = function (feature) {
	    return feature.seq + " (" + feature.start + ".." + feature.end + "): " + feature.value + track.units
	}

	this.addMouseover (path,
			   { featureLabel: featureLabel })
    }
})

});
