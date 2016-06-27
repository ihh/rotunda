define(['Rotunda/View/Track'],
      function(Track) {

/**
 * @class
 */
function Text(config) {
    Track.call(this, config)
}

Text.prototype = new Track()

Text.prototype.draw = function (rot, minRadius, maxRadius) {

    var featureTransform = function (feature) {
        return "translate("
            + rot.xPos ((maxRadius + minRadius) / 2, rot.coordToAngle (feature.seq, feature.pos))
            + ","
            + rot.yPos ((maxRadius + minRadius) / 2, rot.coordToAngle (feature.seq, feature.pos))
            + ")"
    }

    var featureText = function (feature) {
        return feature.label
    }

    this.d3data(rot).append("g")
        .attr("transform", featureTransform)
        .append("text")
        .attr("class", "rotundaLabel")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .text(featureText)
}

return Text
});
