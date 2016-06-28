define(["dojo/_base/declare",
        "dojo/_base/lang",
	"Rotunda/util"],
       function(declare,
                lang,
		util) {
/**
 * @class
 */
return declare (null,
{
    constructor: function(config) {
        lang.mixin (this, config)
    },

    trackListID: function (rot) {
        return rot.id + '-track-label-' + this.id
    },
    
    d3data: function (rot, data) {
        return rot.g.selectAll("#track_"+this.id)
            .data(data || this.features)
            .enter()
    },

    color: function (feature) {
	return feature.color || feature.type || 'black'
    },

    featureColorFunc: function() {
	var track = this
	return function (feature) {
	    return util.colorToRgb (track.color (feature))
	}
    },

    highlightColorFunc: function() {
	if ('highlightColor' in this) {
	    var track = this
	    return function (feature) {
		return util.colorToRgb (track.highlightColor (feature))
	    }
	}
	return undefined
    },

    addTooltip: function() {
	return d3.select("body")
	    .append("div")
	    .attr("class", "rotunda-tooltip")
    },

    addMouseover: function (path, config) {
	config = config || {}

	var highlightColor = config.highlightColor || this.highlightColorFunc()
	var featureColor
	if (highlightColor)
	    featureColor = config.featureColor || this.featureColorFunc()

	var featureLabel = config.featureLabel || function (feature) {
	    return feature.label || feature.id
	}

	var tooltip = this.addTooltip()

	path.on('mouseover',function(feature) {
	    if (highlightColor) {
		var rgb = util.colorToRgb (highlightColor (feature))
		this.setAttribute ('fill', rgb)
		this.setAttribute ('stroke', rgb)
	    } else
		this.setAttribute ('style', 'opacity:.5;')
	    tooltip.style("visibility", "visible")
		.text (featureLabel (feature))
	}).on("mousemove", function(feature) {
	    tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px")
	}).on("mouseout", function(feature) {
	    tooltip.style("visibility", "hidden")
	    if (highlightColor) {
		var rgb = featureColor(feature)
		this.setAttribute ('fill', rgb)
		this.setAttribute ('stroke', rgb)
	    } else
		this.setAttribute ('style', 'opacity:1;')
	})
    }
})

});
