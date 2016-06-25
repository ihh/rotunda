define([
           'dojo/_base/lang'
       ],

       function(
           lang
       ) {

           var Util
           Util = {
               
               keyValListToObj: function (keyValList) {
                   var obj = {}
                   keyValList.forEach (function (keyVal) {
	               obj[keyVal[0]] = keyVal[1]
                   })
                   return obj
               },

               componentToHex: function (c) {
                   var hex = c.toString(16)
                   return hex.length == 1 ? "0" + hex : hex
               },

               rgbToHex: function (r, g, b) {
                   return "#" + Util.componentToHex(r) + Util.componentToHex(g) + Util.componentToHex(b)
               }
           }

           return Util

       })
