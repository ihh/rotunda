define(['dojo/_base/declare',
        'Rotunda/View/Animation'],
       function(declare,
                Animation) {

/**
 * @class
 */
return declare (Animation,
{
    constructor: function(rotunda, callback, time, newScale) {
        this.rotunda = rotunda
        this.oldScale = rotunda.scale
        this.newScale = newScale
        this.relativeScale = this.newScale / this.oldScale
        this.zoomingIn = this.relativeScale > 1
        this.deltaScale = Math.abs (this.newScale - this.oldScale)
        this.minScale = Math.min (this.oldScale, this.newScale)
    },

    step: function(pos) {
        var zoomFraction = this.zoomingIn ? pos : 1 - pos
        var z2 = zoomFraction * zoomFraction
        var curScaleFactor = (z2 * this.deltaScale + this.minScale) / this.oldScale
        var nonlinear = this.minScale >= this.rotunda.nonlinearScaleThreshold
	var xfactor = curScaleFactor, yfactor = curScaleFactor
	if (nonlinear) {
	    yfactor = Math.pow (xfactor, this.rotunda.trackRadiusScaleExponent)
	}
        this.rotunda.gTransformScale (xfactor, yfactor)
    }
})

       })
