var Rotunda = (function() {
    function Rotunda(config) {

        var rot = this

        this.id = config.id || "rotunda"

        this.tracks = config.tracks

        this.trackRadius = config.trackRadius || 10
        this.innerRadius = config.innerRadius || 100
        
        this.radius = Math.max (config.radius || 300,
                                this.tracks.length * this.trackRadius + this.innerRadius)

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
        this.refSeqStartAngleByName = keyValListToObj (this.refSeqName.map (function (n,i) { return [n, rot.refSeqStartAngle[i]] }))

        this.colors = colors
        
        this.container = d3.select("#"+this.id)
            .append("svg")
            .attr("id", this.id+"_svg")
            .attr("width", this.width)
            .attr("height", this.height)

        this.g = this.container
            .append("g")
            .attr("id", this.id+"_g")

        this.tracks.forEach (function (track, trackNum) {
            rot.drawTrack (track, trackNum)
        })
    }

    Rotunda.prototype.drawCircle = function (radius, stroke) {
        this.g.append("circle")
            .attr("r", radius)
            .style("fill", "none")
            .style("stroke", stroke)
            .attr("cx",this.width/2)
            .attr("cy",this.height/2)
    }

    Rotunda.prototype.minRadius = function (trackNum) {
        return this.radius - (trackNum + 1) * this.trackRadius
    }

    Rotunda.prototype.maxRadius = function (trackNum) {
        return this.radius - trackNum * this.trackRadius - 1
    }
    
    Rotunda.prototype.drawTrack = function (track, trackNum) {
        var rot = this
        var maxRadius = this.maxRadius (trackNum)
        var minRadius = this.minRadius (trackNum)

        var featureArc = d3.svg.arc()
            .innerRadius(minRadius)
            .outerRadius(maxRadius)
            .startAngle (function (feature) {
                return rot.refSeqStartAngleByName[feature.seq] + feature.start * rot.radsPerBase
            }).endAngle (function (feature) {
                return rot.refSeqStartAngleByName[feature.seq] + feature.end * rot.radsPerBase
            })

        var featureColor = function (feature) {
            var rgb = rot.colors[feature.type]
            if (rgb.length == 3) {
                return rgbToHex.apply (rot, rgb)
            }
            return "black"
        }
        
        this.g.selectAll("#track_"+track.id)
            .data(track.features)
            .enter()
            .append("path")
            .attr("d", featureArc)
            .attr("fill", featureColor)
            .attr("stroke", featureColor)
            .attr("transform", "translate(" + this.width/2 + "," + this.height/2 + ")")
    }
    
    return Rotunda
})()
