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

        this.id = config.id || "rotunda"

        this.tracks = config.tracks

        this.trackRadius = this.tracks.map (function (track) {
            return track.radius || config.defaultTrackRadius || 10
        })

        this.innerRadius = config.innerRadius || 100
        var r = 0
        this.trackOutsideRadius = []
        for (var n = 0; n < this.tracks.length; ++n) {
            this.trackOutsideRadius.push (r)
            r += this.trackRadius[n]
        }
        this.radius = Math.max (config.radius || 300,
                                r + this.innerRadius)

        this.width = this.radius * 2
        this.height = this.radius * 2

        this.refSeqLen = config.refSeqLen || [360]
        this.refSeqName = config.refSeqName || config.refSeqLen.map (function(n,i) { return "seq" + (i+1) })

        this.totalSpacerFraction = config.spacer || .1  // total fraction of circle used as spacer
        this.spacerRads = this.totalSpacerFraction * 2 * Math.PI / this.refSeqLen.length

        var totalLen = this.refSeqLen.reduce (function (tot,len) { return tot + len })
        this.radsPerBase = 2 * Math.PI * (1 - this.totalSpacerFraction) / totalLen
        this.refSeqStartAngle = this.refSeqLen.reduce (function (list,len) { return list.concat (list[list.length-1] + rot.spacerRads + rot.radsPerBase*len) }, [0])
        this.refSeqStartAngle.pop()
        this.refSeqStartAngleByName = util.keyValListToObj (this.refSeqName.map (function (n,i) { return [n, rot.refSeqStartAngle[i]] }))
        
        this.colors = colors

        this.scale = 1
        this.trackRadiusScale = 1
        this.rotate = 0
        
        this.maxScale = Math.max (1, 1 / (this.radsPerBase * this.radius))
        this.minScale = 1

        this.maxTrackRadius = 100
        this.trackRadiusScaleExponent = this.maxScale > 1 ? (Math.log(this.maxTrackRadius) / Math.log(this.maxScale)) : 1
        
        this.createNavBox (query("#"+this.id)[0])
        
        this.svg = d3.select("#"+this.id)
            .append("svg")
            .attr("id", this.id+"_svg")
            .attr("width", this.width)
            .attr("height", this.height)

        var drag = d3.behavior.drag()
            .on("dragstart", function(d,i) {
                rot.dragDeltaRadians = 0
            })
            .on("drag", function(d,i) {
                if (!rot.dragging) {
                    var xDragStart = d3.event.x - d3.event.dx
                    var yDragStart = d3.event.y - d3.event.dy
                    rot.dragInitRadians = rot.xyAngle (xDragStart, yDragStart)
                    rot.dragging = true
                }
                rot.dragDeltaRadians = rot.xyAngle (d3.event.x, d3.event.y) - rot.dragInitRadians
                rot.gTransformRotate (rot.dragDeltaRadians * 180 / Math.PI)
            })
            .on("dragend", function(d,i) {
                rot.rotateTo (rot.rotate + rot.dragDeltaRadians)
                rot.dragging = false
            })
        this.svg.call(drag)
        
        this.draw()
        this.redraw()
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
    
    // createNavBox lifted from JBrowse Browser.js
    createNavBox: function( parent ) {
        var align = 'left';
        var navbox = dojo.create( 'div', { id: 'navbox', style: { 'text-align': align } }, parent );

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
        new Zoomer (newScale,
                    rot,
                    function() {
                        rot.scale = newScale
                        rot.trackRadiusScale = Math.pow (this.scale, rot.trackRadiusScaleExponent)
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

    gTransformScale: function (factor) {
        this.g.attr("transform",
                    "scale(" + factor + ") translate(" + (this.width/2) / factor + "," + this.radius * this.scale + ")")
        d3.selectAll(".rotundaLabel")
            .attr("transform", "scale(" + (1/factor) + ")")
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
        this.g.remove()
        this.draw()
    },
    
    draw: function() {
        var rot = this

        this.g = this.svg
            .append("g")
            .attr("id", this.id+"_g")
            .attr("transform", "translate(" + this.width/2 + "," + this.radius * this.scale + ")")

        this.tracks.forEach (function (track, trackNum) {
            rot.drawTrack (track, trackNum)
        })
    },
    
    minRadius: function (trackNum) {
        return this.radius * this.scale - (this.trackOutsideRadius[trackNum] + this.trackRadius[trackNum]) * this.trackRadiusScale + 1
    },

    maxRadius: function (trackNum) {
        return this.radius * this.scale - this.trackOutsideRadius[trackNum] * this.trackRadiusScale
    },

    coordToAngle: function (seqName, pos) {
        return this.refSeqStartAngleByName[seqName] + pos * this.radsPerBase + this.rotate
    },
    
    drawTrack: function (track, trackNum) {
        var rot = this
        var maxRadius = this.maxRadius (trackNum)
        var minRadius = this.minRadius (trackNum)

        var featureColor = track.color || function (feature) {
            var rgb = rot.colors[feature.type]
            if (rgb.length == 3) {
                return util.rgbToHex.apply (rot, rgb)
            }
            return "black"
        }

        var data = this.g.selectAll("#track_"+track.id)
            .data(track.features)
            .enter()

        switch (track.type) {
        case "arc":

            var featureArc = d3.svg.arc()
                .innerRadius(minRadius)
                .outerRadius(maxRadius)
                .startAngle (function (feature) {
                    return rot.coordToAngle (feature.seq, feature.start)
                }).endAngle (function (feature) {
                    return rot.coordToAngle (feature.seq, feature.end)
                })

            data.append("path")
                .attr("d", featureArc)
                .attr("fill", featureColor)
                .attr("stroke", featureColor)
            break;

        case "text":
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

            data.append("g")
                .attr("transform", featureTransform)
                .append("text")
                .attr("class", "rotundaLabel")
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "central")
                .text(featureText)
            break;

        default:
            break;
        }
    }
})

       })
