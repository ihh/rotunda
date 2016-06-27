define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/query',
    'd3/d3',
    'Rotunda/util',
    'Rotunda/colors',
    'Rotunda/View/Animation/Zoomer',
    'Rotunda/View/Animation/Slider'
],
       function(
           declare,
           lang,
           query,
           libd3,
           util,
           colors,
           Zoomer,
           Slider
       ) {

return declare( null, {

    constructor: function(config) {

        var rot = this

	this.config = config
        this.id = config.id || "rotunda"

        this.tracks = config.tracks

	// find dimensions
	this.defaultTrackRadius = config.defaultTrackRadius || 10
	this.minInnerRadius = config.minInnerRadius || 100

	this.calculateTrackSizes(1,1)
        this.radius = Math.max (config.radius || 300,
                                this.totalTrackRadius + this.minInnerRadius)

        this.width = config.width || this.radius * 2
        this.height = config.height || this.width

	// set up coordinate system
        this.refSeqLen = config.refSeqLen || [360]
        this.refSeqName = config.refSeqName || config.refSeqLen.map (function(n,i) { return "seq" + (i+1) })

        this.totalSpacerFraction = config.spacer || .1  // total fraction of circle used as spacer
        this.spacerRads = this.totalSpacerFraction * 2 * Math.PI / this.refSeqLen.length

        var totalLen = this.refSeqLen.reduce (function (tot,len) { return tot + len })
        this.radsPerBase = 2 * Math.PI * (1 - this.totalSpacerFraction) / totalLen
        this.refSeqStartAngle = this.refSeqLen.reduce (function (list,len) { return list.concat (list[list.length-1] + rot.spacerRads + rot.radsPerBase*len) }, [0])
        this.refSeqStartAngle.pop()
        this.refSeqStartAngleByName = util.keyValListToObj (this.refSeqName.map (function (n,i) { return [n, rot.refSeqStartAngle[i]] }))

	// minBasesPerView = width / (pixelsPerBase * scale)
 	var minBasesPerView = 1e6
        this.minScale = Math.min (1, this.width / (2 * this.radius))
        this.maxScale = this.minScale * Math.pow (2, Math.floor (Math.log (Math.max (1, this.width / (this.pixelsPerBaseAtEdge() * minBasesPerView))) / Math.log(2)))

        var maxTrackScale = config.maxTrackScale || (this.maxScale > 1 ? (Math.log(this.maxScale) / Math.log(2)) : 1)

	var verticalCurvatureDropThreshold = .9
	this.nonlinearScaleThreshold = Math.pow (4, Math.ceil (Math.log (this.width / (this.radius * Math.acos (verticalCurvatureDropThreshold))) / Math.log(4)))
        this.trackRadiusScaleExponent = this.maxScale > 1 ? (Math.log(maxTrackScale/this.nonlinearScaleThreshold) / Math.log(this.maxScale/this.nonlinearScaleThreshold)) : 1

	// initialize view coords
        this.scale = this.minScale
        this.rotate = 0
        
        this.colors = colors

        // build view
	d3.select("#"+this.id)
	    .attr("class", "rotunda_container")

        this.createNavBox (query("#"+this.id)[0])

        this.svg_wrapper = d3.select("#"+this.id)
	    .append("div")
            .attr("class", "rotunda_svg_wrapper")
            .attr("style", "height: " + this.height + "px")

        this.dragBehavior = d3.behavior.drag()
            .on("dragstart", function(d,i) {
                rot.dragDeltaRadians = 0
            })
            .on("drag", function(d,i) {
		var x = d3.event.x
		var y = d3.event.y + rot.svg_wrapper[0][0].scrollTop
                if (!rot.dragging) {
                    var xDragStart = x - d3.event.dx
                    var yDragStart = y - d3.event.dy
                    rot.dragInitRadians = rot.xyAngle (xDragStart, yDragStart)
                    rot.dragging = true
                }
                rot.dragDeltaRadians = rot.xyAngle (x, y) - rot.dragInitRadians
                rot.gTransformRotate (rot.dragDeltaRadians * 180 / Math.PI)
            })
            .on("dragend", function(d,i) {
                rot.rotateTo (rot.rotate + rot.dragDeltaRadians)
                rot.dragging = false
            })
        
        this.draw()
    },

    xyAngle: function(x,y) {
        var dx = x - this.width/2
        var dy = y - this.radius * this.scale
        return Math.atan2(-dx,dy)
    },

    xPos: function(r,theta) {
        return Math.sin(theta) * r
    },

    yPos: function(r,theta) {
        return -Math.cos(theta) * r
    },
    
    // createNavBox mostly lifted from JBrowse Browser.js
    createNavBox: function( parent ) {
        var align = 'left';
        var navbox = dojo.create( 'div', { id: parent.id+'_navbox',
					   class: 'rotunda_navbox',
					   style: { 'text-align': align } },
				  parent );

        var four_nbsp = String.fromCharCode(160); four_nbsp = four_nbsp + four_nbsp + four_nbsp + four_nbsp;
        navbox.appendChild(document.createTextNode( four_nbsp ));

        var moveLeft = document.createElement("img");
        //moveLeft.type = "image";
        moveLeft.src = this.resolveUrl( "img/Empty.png" );
        moveLeft.id = "moveLeft";
        moveLeft.className = "icon nav";
        navbox.appendChild(moveLeft);
        dojo.connect( moveLeft, "click", this,
                      function(event) {
                          dojo.stopEvent(event);
                          this.slide(0.9);
                      });

        var moveRight = document.createElement("img");
        //moveRight.type = "image";
        moveRight.src = this.resolveUrl( "img/Empty.png" );
        moveRight.id="moveRight";
        moveRight.className = "icon nav";
        navbox.appendChild(moveRight);
        dojo.connect( moveRight, "click", this,
                      function(event) {
                          dojo.stopEvent(event);
                          this.slide(-0.9);
                      });

        navbox.appendChild(document.createTextNode( four_nbsp ));

        var bigZoomOut = document.createElement("img");
        //bigZoomOut.type = "image";
        bigZoomOut.src = this.resolveUrl( "img/Empty.png" );
        bigZoomOut.id = "bigZoomOut";
        bigZoomOut.className = "icon nav";
        navbox.appendChild(bigZoomOut);
        dojo.connect( bigZoomOut, "click", this,
                      function(event) {
                          dojo.stopEvent(event);
                          this.zoomOut(undefined, undefined, 2);
                      });


        var zoomOut = document.createElement("img");
        //zoomOut.type = "image";
        zoomOut.src = this.resolveUrl("img/Empty.png");
        zoomOut.id = "zoomOut";
        zoomOut.className = "icon nav";
        navbox.appendChild(zoomOut);
        dojo.connect( zoomOut, "click", this,
                      function(event) {
                          dojo.stopEvent(event);
                          this.zoomOut();
                      });

        var zoomIn = document.createElement("img");
        //zoomIn.type = "image";
        zoomIn.src = this.resolveUrl( "img/Empty.png" );
        zoomIn.id = "zoomIn";
        zoomIn.className = "icon nav";
        navbox.appendChild(zoomIn);
        dojo.connect( zoomIn, "click", this,
                      function(event) {
                          dojo.stopEvent(event);
                          this.zoomIn();
                      });

        var bigZoomIn = document.createElement("img");
        //bigZoomIn.type = "image";
        bigZoomIn.src = this.resolveUrl( "img/Empty.png" );
        bigZoomIn.id = "bigZoomIn";
        bigZoomIn.className = "icon nav";
        navbox.appendChild(bigZoomIn);
        dojo.connect( bigZoomIn, "click", this,
                      function(event) {
                          dojo.stopEvent(event);
                          this.zoomIn(undefined, undefined, 2);
                      });

        return navbox
    },

    // resolveUrl is placeholder for JBrowse equivalent
    resolveUrl: function(url) { return url },

    rotateTo: function(newRads) {
        if (newRads > 2*Math.PI)
            newRads -= 2*Math.PI
        else if (newRads < -2*Math.PI)
            newRads += 2*Math.PI
        this.rotate = newRads
        this.redraw()
    },
    
    slide: function(distance) {
        var rotunda = this
        if (this.animation) return;
        var deltaRads = 2 * distance * Math.atan (.5 * this.width / (this.radius * this.scale))
        var newRads = this.rotate + deltaRads
        new Slider (newRads,
                    rotunda,
                    function() { rotunda.rotateTo(newRads) },
                    700)
    },

    zoomIn: function(e, zoomLoc, steps) {
        if (this.animation) return;
        if (steps === undefined) steps = 1;
        var newScale = this.scale
        while (steps-- > 0)
            newScale *= 2
        newScale = Math.min (this.maxScale, newScale)
        this.zoomTo (newScale)
    },

    zoomOut: function(e, zoomLoc, steps) {
        if (this.animation) return;
        if (steps === undefined) steps = 1;
        var newScale = this.scale
        while (steps-- > 0)
            newScale /= 2
        newScale = Math.max (this.minScale, newScale)
        this.zoomTo (newScale)
    },

    zoomTo: function (newScale) {
        var rot = this
	if (newScale != rot.scale)
            new Zoomer (newScale,
			rot,
			function() {
                            rot.scale = newScale
			    rot.calculateTrackSizes()
                        rot.redraw()
			},
			700)
    },

    gTransformRotate: function (degrees) {
        this.g.attr("transform",
                    "translate(" + this.width/2 + "," + this.radius*this.scale + ") rotate(" + degrees + ")")
        d3.selectAll(".rotundaLabel")
            .attr("transform", "rotate(" + (-degrees) + ")")
    },

    gTransformScale: function (factor, nonlinear, yShift) {
	nonlinear = nonlinear || false
	yShift = yShift || 0
	var xfactor = factor, yfactor = factor
	if (nonlinear) {
	    yfactor = Math.pow (factor, this.trackRadiusScaleExponent)
	}
        this.g.attr("transform",
                    "scale(" + xfactor + "," + yfactor + ") translate(" + (this.width/2) / factor + "," + (this.radius * this.scale + yShift) + ")")
        d3.selectAll(".rotundaLabel")
            .attr("transform", "scale(" + (1/xfactor) + "," + (1/yfactor) + ")")
    },

    drawCircle: function (radius, stroke) {
        this.g.append("circle")
            .attr("r", radius)
            .style("fill", "none")
            .style("stroke", stroke)
            .attr("cx",this.width/2)
            .attr("cy",this.height/2)
    },

    redraw: function() {
        this.svg.remove()
        this.draw()
    },
    
    draw: function() {
        var rot = this
        
        this.svg = this.svg_wrapper
            .append("svg")
            .attr("id", this.id+"_svg")
            .attr("class", "rotunda_svg")
            .attr("width", this.width)
            .attr("height", Math.max (this.height, this.totalTrackRadius))

        this.svg.call(this.dragBehavior)

        this.g = this.svg
            .append("g")
            .attr("id", this.id+"_g")
            .attr("transform", "translate(" + this.width/2 + "," + this.radius * this.scale + ")")

        var amin, amax
        if (this.width >= this.scale * this.radius * 2) {
            amin = 0
            amax = 2*Math.PI
        } else {
            var aw = this.angularViewWidth()
            amin = -this.rotate - aw/2
            amax = -this.rotate + aw/2
        }
        
        this.tracks.forEach (function (track, trackNum) {
            rot.drawTrack (track, trackNum, amin, amax)
        })
    },

    drawTrack: function (track, trackNum, minAngle, maxAngle) {
        var rot = this
        var maxRadius = this.maxRadius (trackNum)
        var minRadius = this.minRadius (trackNum)
	track.draw (this, minRadius, maxRadius, minAngle, maxAngle)
    },

    pixelsPerBaseAtEdge: function (scale) {
	return this.radius * this.radsPerBase * (scale || this.scale || 1)
    },

    basesPerViewAtEdge: function (scale) {
	return this.width / this.pixelsPerBaseAtEdge(scale)
    },

    radiansPerViewAtEdge: function (scale) {
	// width / (radius * scale)
	return this.radsPerBase * this.basesPerViewAtEdge()
    },

    trackRadiusScale: function (scale) {
	return (scale <= this.nonlinearScaleThreshold
		? scale
		: this.nonlinearScaleThreshold * Math.pow (scale / this.nonlinearScaleThreshold, this.trackRadiusScaleExponent))
    },

    calculateTrackSize: function (track, scale, trackRadiusScale) {
	scale = scale || this.scale
	trackRadiusScale = trackRadiusScale || this.trackRadiusScale(scale)
	var r = track.radius || this.defaultTrackRadius
        return typeof(r) == 'function' ? r(scale,trackRadiusScale) : r*trackRadiusScale
    },

    calculateTotalTrackSize: function (scale) {
	var rot = this
	return this.tracks.reduce (function (tot, track) {
	    return tot + rot.calculateTrackSize (track, scale)
	}, 0)
    },

    calculateOuterTrackSize: function (scale) {
	return this.tracks.length ? this.calculateTrackSize(this.tracks[0],scale) : 0
    },

    calculateTrackSizes: function (scale, trackRadiusScale) {
	var rot = this
	scale = scale || this.scale
	trackRadiusScale = trackRadiusScale || this.trackRadiusScale(scale)

        this.trackRadius = this.tracks.map (function (track) {
	    return rot.calculateTrackSize (track, scale, trackRadiusScale)
        })

        var r = 0
        this.trackDistanceFromEdge = []
        for (var n = 0; n < this.tracks.length; ++n) {
            this.trackDistanceFromEdge.push (r)
            r += this.trackRadius[n]
        }
        this.totalTrackRadius = r
    },

    minRadius: function (trackNum) {
        return this.radius * this.scale - this.trackDistanceFromEdge[trackNum] - this.trackRadius[trackNum] + 1
    },

    maxRadius: function (trackNum) {
        return this.radius * this.scale - this.trackDistanceFromEdge[trackNum]
    },

    innerRadius: function() {
        return this.minRadius (this.tracks.length-1) - 1
    },
    
    coordToAngle: function (seqName, pos) {
        return this.refSeqStartAngleByName[seqName] + pos * this.radsPerBase + this.rotate
    },

    angularViewWidth: function (scale) {
        scale = scale || this.scale
        return 2*Math.atan2 (this.width / 2, this.radius * this.scale - this.height)
    }
})

       })
