define(['Rotunda/View/Track',
	'Rotunda/util'],
       function(Track,
		util) {

/**
 * @class
 */
function Histogram(config) {
    Track.call(this, config)
}

Histogram.prototype = new Track()

Histogram.prototype.draw = function (rot, minRadius, maxRadius) {

    var featureColor = this.featureColor (rot)

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

    this.d3data(rot).append("path")
        .attr("d", featureArc)
        .attr("fill", featureColor)
        .attr("stroke", featureColor)
}

return Histogram
});
