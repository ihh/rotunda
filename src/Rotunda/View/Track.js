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
    
    d3data: function (rot) {
        return rot.g.selectAll("#track_"+this.id)
            .data(this.features)
            .enter()
    },

    featureColor: function (rot) {
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
})

});
