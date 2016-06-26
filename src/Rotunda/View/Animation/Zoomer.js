define(['Rotunda/View/Animation'],
      function(Animation) {

/**
 * @class
 */
function Zoomer(newScale, rotunda, callback, time) {
    Animation.call(this, rotunda, callback, time);
    this.rotunda = rotunda;
    this.oldScale = rotunda.scale;
    this.newScale = newScale;
    this.relativeScale = this.newScale / this.oldScale;
    this.zoomingIn = this.relativeScale > 1;
    this.deltaScale = Math.abs (this.newScale - this.oldScale)
    this.minScale = Math.min (this.oldScale, this.newScale)

};

Zoomer.prototype = new Animation();

Zoomer.prototype.step = function(pos) {
    var zoomFraction = this.zoomingIn ? pos : 1 - pos;
    var curScale = 
        (((zoomFraction * zoomFraction) * this.deltaScale) + this.minScale) / this.oldScale
    this.rotunda.gTransformScale (curScale)
};

return Zoomer;
});
