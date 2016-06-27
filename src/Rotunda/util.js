define([
           'dojo/_base/lang'
       ],

       function(
           lang
       ) {

           var Util
           Util = {

               mean: function (list) {
                   var sum = 0
                   for (var i = 0; i < list.length; ++i) {
                       sum += list[i]
                   }
                   return sum / list.length
               },
               
               listToCounts: function (list) {
	           var c = {}
	           list.forEach (function(x) {
                       c[x] = (c[x] || 0) + 1
                   })
                   return c
               },

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
