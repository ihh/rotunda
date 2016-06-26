define(['Rotunda/View/Animation'],
      function(Animation) {

/**
 * @class
 */
function Slider(radians, rotunda, callback, time) {
    Animation.call(this, rotunda, callback, time);
    this.rotunda = rotunda
    this.degrees = (radians - rotunda.rotate) * 180 / Math.PI
    this.xTrans = rotunda.width / 2
    this.yTrans = rotunda.radius * rotunda.scale
}

Slider.prototype = new Animation();

Slider.prototype.step = function(pos) {
    var deg = this.degrees * pos
    this.rotunda.g.attr("transform",
                        "translate(" + this.xTrans + "," + this.yTrans + ") rotate(" + deg + ")")
};

return Slider;
});
