function keyValListToObj (keyValList) {
    var obj = {}
    keyValList.forEach (function (keyVal) {
	obj[keyVal[0]] = keyVal[1]
    })
    return obj
}

function componentToHex(c) {
    var hex = c.toString(16)
    return hex.length == 1 ? "0" + hex : hex
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
}
