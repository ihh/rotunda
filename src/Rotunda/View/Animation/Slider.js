define(['JBrowse/View/Animation'],
      function(Animation) {

/**
 * @class
 */
function Slider(radians, rotunda, callback, time) {
    Animation.call(this, rotunda, callback, time)
    this.rotunda = rotunda
    this.degrees = (radians - rotunda.rotate) * 180 / Math.PI
}

Slider.prototype = new Animation();

Slider.prototype.step = function(pos) {
    this.rotunda.gTransformRotate (this.degrees * pos)
};

return Slider;
});
