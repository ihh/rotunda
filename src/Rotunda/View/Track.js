define(["dojo/_base/lang",
	"Rotunda/util"],
       function(lang,
		util) {
/**
 * @class
 */
function Track (config) {
    lang.mixin (this, config)
}

Track.prototype.d3data = function (rot) {
    return rot.g.selectAll("#track_"+this.id)
        .data(this.features)
        .enter()
}

Track.prototype.featureColor = function (rot) {
    return this.color || function (feature) {
        var rgb = rot.colors[feature.color || feature.type || 'black']
        if( Object.prototype.toString.call(rgb) === '[object Array]' ) {
            if (rgb.length == 3) {
                return util.rgbToHex.apply (rot, rgb)
            }
            return 'black'
        }
        return rgb
    }
}

return Track;
});
