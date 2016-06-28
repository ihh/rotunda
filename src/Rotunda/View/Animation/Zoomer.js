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
        this.oldOuterTrackSize = rotunda.calculateOuterTrackSize(this.oldScale)
        this.newOuterTrackSize = rotunda.calculateOuterTrackSize(this.newScale)
        this.minScaleOuterTrackSize = this.zoomingIn ? this.oldOuterTrackSize : this.newOuterTrackSize
        this.maxScaleOuterTrackSize = this.zoomingIn ? this.newOuterTrackSize : this.oldOuterTrackSize
        this.deltaOuterTrackSize = this.maxScaleOuterTrackSize - this.minScaleOuterTrackSize
    },

    step: function(pos) {
        var zoomFraction = this.zoomingIn ? pos : 1 - pos
        var z2 = zoomFraction * zoomFraction
        var curScaleFactor = (z2 * this.deltaScale + this.minScale) / this.oldScale
        var nonlinear = this.minScale >= this.rotunda.nonlinearScaleThreshold
        var yShift = 0
        if (!nonlinear) {
	    // inner edge of outer track should move smoothly throughout zoom
	    // During zoom, edge is at oldOuterTrackSize * curScaleFactor
	    // After zoom, edge is at newOuterTrackSize
	    var scaledOldEdge = curScaleFactor * this.oldOuterTrackSize
	    var newEdge = this.newOuterTrackSize
	    var targetEdge = scaledOldEdge + pos * (newEdge - scaledOldEdge)
	    yShift = (targetEdge - scaledOldEdge) / curScaleFactor
        }
        this.rotunda.gTransformScale (curScaleFactor, nonlinear, yShift)
    }
})

       })
