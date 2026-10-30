!function(b,a){"object"==typeof exports&&"undefined"!=typeof module?a(exports):"function"==typeof define&&define.amd?define(["exports"],a):a(b.L={})}(this,function(cu){var cK=Object.freeze;function cM(b){var a,c,f,d;for(c=1,f=arguments.length;c<f;c++){for(a in d=arguments[c]){b[a]=d[a]}}return b}Object.freeze=function(a){return a};var cw=Object.create||function(a){return cQ.prototype=a,new cQ};function cQ(){}function cX(b,a){var c=Array.prototype.slice;if(b.bind){return b.bind.apply(b,c.call(arguments,1))}var d=c.call(arguments,2);return function(){return b.apply(a,d.length?d.concat(c.call(arguments)):arguments)}}var cC=0;function cs(a){return a._leaflet_id=a._leaflet_id||++cC,a._leaflet_id}function cB(b,a,f){var h,g,c,d;return d=function(){h=!1,g&&(c.apply(f,g),g=!1)},c=function(){h?g=arguments:(b.apply(f,arguments),setTimeout(d,a),h=!0)}}function cx(b,a,d){var g=a[1],f=a[0],c=g-f;return b===g&&d?b:((b-f)%c+c)%c+f}function cG(){return !1}function cT(b,a){return a=void 0===a?6:a,+(Math.round(b+"e+"+a)+"e-"+a)}function cZ(a){return a.trim?a.trim():a.replace(/^\s+|\s+$/g,"")}function cS(a){return cZ(a).split(/\s+/)}function cz(b,a){for(var c in b.hasOwnProperty("options")||(b.options=b.options?cw(b.options):{}),a){b.options[c]=a[c]}return b.options}function cF(b,a,c){var f=[];for(var d in b){f.push(encodeURIComponent(c?d.toUpperCase():d)+"="+encodeURIComponent(b[d]))}return(a&&-1!==a.indexOf("?")?"&":"?")+f.join("&")}var cO=/\{ *([\w_-]+) *\}/g;function cN(a,b){return a.replace(cO,function(d,c){var f=b[c];if(void 0===f){throw new Error("No value provided for variable "+d)}return"function"==typeof f&&(f=f(b)),f})}var cq=Array.isArray||function(a){return"[object Array]"===Object.prototype.toString.call(a)};function cl(b,a){for(var c=0;c<b.length;c++){if(b[c]===a){return c}}return -1}var co="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";function cp(a){return window["webkit"+a]||window["moz"+a]||window["ms"+a]}var dh=0;function cV(b){var a=+new Date,c=Math.max(0,16-(a-dh));return dh=a+c,window.setTimeout(b,c)}var da=window.requestAnimationFrame||cp("RequestAnimationFrame")||cV,cj=window.cancelAnimationFrame||cp("CancelAnimationFrame")||cp("CancelRequestAnimationFrame")||function(a){window.clearTimeout(a)};function dp(b,a,c){if(!c||da!==cV){return da.call(window,cX(b,a))}b.call(a)}function dH(a){a&&cj.call(window,a)}var db=(Object.freeze||Object)({freeze:cK,extend:cM,create:cw,bind:cX,lastId:cC,stamp:cs,throttle:cB,wrapNum:cx,falseFn:cG,formatNum:cT,trim:cZ,splitWords:cS,setOptions:cz,getParamString:cF,template:cN,isArray:cq,indexOf:cl,emptyImageUrl:co,requestFn:da,cancelFn:cj,requestAnimFrame:dp,cancelAnimFrame:dH});function c1(){}c1.extend=function(b){function a(){this.initialize&&this.initialize.apply(this,arguments),this.callInitHooks()}var c=a.__super__=this.prototype,f=cw(c);for(var d in (f.constructor=a).prototype=f,this){this.hasOwnProperty(d)&&"prototype"!==d&&"__super__"!==d&&(a[d]=this[d])}return b.statics&&(cM(a,b.statics),delete b.statics),b.includes&&(function(g){if("undefined"==typeof L||!L||!L.Mixin){return}g=cq(g)?g:[g];for(var e=0;e<g.length;e++){g[e]===L.Mixin.Events&&console.warn("Deprecated include of L.Mixin.Events: this property will be removed in future releases, please inherit from L.Evented instead.",(new Error).stack)}}(b.includes),cM.apply(null,[f].concat(b.includes)),delete b.includes),f.options&&(b.options=cM(cw(f.options),b.options)),cM(f,b),f._initHooks=[],f.callInitHooks=function(){if(!this._initHooksCalled){c.callInitHooks&&c.callInitHooks.call(this),this._initHooksCalled=!0;for(var g=0,e=f._initHooks.length;g<e;g++){f._initHooks[g].call(this)}}},a},c1.include=function(a){return cM(this.prototype,a),this},c1.mergeOptions=function(a){return cM(this.prototype.options,a),this},c1.addInitHook=function(b){var a=Array.prototype.slice.call(arguments,1),c="function"==typeof b?b:function(){this[b].apply(this,a)};return this.prototype._initHooks=this.prototype._initHooks||[],this.prototype._initHooks.push(c),this};var dC={on:function(b,a,d){if("object"==typeof b){for(var g in b){this._on(g,b[g],a)}}else{for(var f=0,c=(b=cS(b)).length;f<c;f++){this._on(b[f],a,d)}}return this},off:function(b,a,d){if(b){if("object"==typeof b){for(var g in b){this._off(g,b[g],a)}}else{for(var f=0,c=(b=cS(b)).length;f<c;f++){this._off(b[f],a,d)}}}else{delete this._events}return this},_on:function(d,c,h){this._events=this._events||{};var k=this._events[d];k||(k=[],this._events[d]=k),h===this&&(h=void 0);for(var j={fn:c,ctx:h},f=k,g=0,b=f.length;g<b;g++){if(f[g].fn===c&&f[g].ctx===h){return}}f.push(j)},_off:function(b,a,f){var h,g,c;if(this._events&&(h=this._events[b])){if(a){if(f===this&&(f=void 0),h){for(g=0,c=h.length;g<c;g++){var d=h[g];if(d.ctx===f&&d.fn===a){return d.fn=cG,this._firingCount&&(this._events[b]=h=h.slice()),void h.splice(g,1)}}}}else{for(g=0,c=h.length;g<c;g++){h[g].fn=cG}delete this._events[b]}}},fire:function(d,c,h){if(!this.listens(d,h)){return this}var k=cM({},c,{type:d,target:this,sourceTarget:c&&c.sourceTarget||this});if(this._events){var j=this._events[d];if(j){this._firingCount=this._firingCount+1||1;for(var f=0,g=j.length;f<g;f++){var b=j[f];b.fn.call(b.ctx||this,k)}this._firingCount--}}return h&&this._propagateEvent(k),this},listens:function(b,a){var c=this._events&&this._events[b];if(c&&c.length){return !0}if(a){for(var d in this._eventParents){if(this._eventParents[d].listens(b,a)){return !0}}}return !1},once:function(b,a,c){if("object"==typeof b){for(var f in b){this.once(f,b[f],a)}return this}var d=cX(function(){this.off(b,a,c).off(b,d,c)},this);return this.on(b,a,c).on(b,d,c)},addEventParent:function(a){return this._eventParents=this._eventParents||{},this._eventParents[cs(a)]=a,this},removeEventParent:function(a){return this._eventParents&&delete this._eventParents[cs(a)],this},_propagateEvent:function(b){for(var a in this._eventParents){this._eventParents[a].fire(b.type,cM({layer:b.target,propagatedFrom:b.target},b),!0)}}};dC.addEventListener=dC.on,dC.removeEventListener=dC.clearAllEventListeners=dC.off,dC.addOneTimeEventListener=dC.once,dC.fireEvent=dC.fire,dC.hasEventListeners=dC.listens;var cH=c1.extend(dC);function dJ(b,a,c){this.x=c?Math.round(b):b,this.y=c?Math.round(a):a}var dK=Math.trunc||function(a){return 0<a?Math.floor(a):Math.ceil(a)};function dv(b,a,c){return b instanceof dJ?b:cq(b)?new dJ(b[0],b[1]):null==b?b:"object"==typeof b&&"x" in b&&"y" in b?new dJ(b.x,b.y):new dJ(b,a,c)}function dj(b,a){if(b){for(var c=a?[b,a]:b,f=0,d=c.length;f<d;f++){this.extend(c[f])}}}function dd(b,a){return !b||b instanceof dj?b:new dj(b,a)}function dm(b,a){if(b){for(var c=a?[b,a]:b,f=0,d=c.length;f<d;f++){this.extend(c[f])}}}function dE(b,a){return b instanceof dm?b:new dm(b,a)}function cJ(b,a,c){if(isNaN(b)||isNaN(a)){throw new Error("Invalid LatLng object: ("+b+", "+a+")")}this.lat=+b,this.lng=+a,void 0!==c&&(this.alt=+c)}function c5(b,a,c){return b instanceof cJ?b:cq(b)&&"object"!=typeof b[0]?3===b.length?new cJ(b[0],b[1],b[2]):2===b.length?new cJ(b[0],b[1]):null:null==b?b:"object"==typeof b&&"lat" in b?new cJ(b.lat,"lng" in b?b.lng:b.lon,b.alt):void 0===a?null:new cJ(b,a,c)}dJ.prototype={clone:function(){return new dJ(this.x,this.y)},add:function(a){return this.clone()._add(dv(a))},_add:function(a){return this.x+=a.x,this.y+=a.y,this},subtract:function(a){return this.clone()._subtract(dv(a))},_subtract:function(a){return this.x-=a.x,this.y-=a.y,this},divideBy:function(a){return this.clone()._divideBy(a)},_divideBy:function(a){return this.x/=a,this.y/=a,this},multiplyBy:function(a){return this.clone()._multiplyBy(a)},_multiplyBy:function(a){return this.x*=a,this.y*=a,this},scaleBy:function(a){return new dJ(this.x*a.x,this.y*a.y)},unscaleBy:function(a){return new dJ(this.x/a.x,this.y/a.y)},round:function(){return this.clone()._round()},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},floor:function(){return this.clone()._floor()},_floor:function(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this},ceil:function(){return this.clone()._ceil()},_ceil:function(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this},trunc:function(){return this.clone()._trunc()},_trunc:function(){return this.x=dK(this.x),this.y=dK(this.y),this},distanceTo:function(b){var a=(b=dv(b)).x-this.x,c=b.y-this.y;return Math.sqrt(a*a+c*c)},equals:function(a){return(a=dv(a)).x===this.x&&a.y===this.y},contains:function(a){return a=dv(a),Math.abs(a.x)<=Math.abs(this.x)&&Math.abs(a.y)<=Math.abs(this.y)},toString:function(){return"Point("+cT(this.x)+", "+cT(this.y)+")"}},dj.prototype={extend:function(a){return a=dv(a),this.min||this.max?(this.min.x=Math.min(a.x,this.min.x),this.max.x=Math.max(a.x,this.max.x),this.min.y=Math.min(a.y,this.min.y),this.max.y=Math.max(a.y,this.max.y)):(this.min=a.clone(),this.max=a.clone()),this},getCenter:function(a){return new dJ((this.min.x+this.max.x)/2,(this.min.y+this.max.y)/2,a)},getBottomLeft:function(){return new dJ(this.min.x,this.max.y)},getTopRight:function(){return new dJ(this.max.x,this.min.y)},getTopLeft:function(){return this.min},getBottomRight:function(){return this.max},getSize:function(){return this.max.subtract(this.min)},contains:function(b){var a,c;return(b="number"==typeof b[0]||b instanceof dJ?dv(b):dd(b)) instanceof dj?(a=b.min,c=b.max):a=c=b,a.x>=this.min.x&&c.x<=this.max.x&&a.y>=this.min.y&&c.y<=this.max.y},intersects:function(b){b=dd(b);var a=this.min,f=this.max,h=b.min,g=b.max,c=g.x>=a.x&&h.x<=f.x,d=g.y>=a.y&&h.y<=f.y;return c&&d},overlaps:function(b){b=dd(b);var a=this.min,f=this.max,h=b.min,g=b.max,c=g.x>a.x&&h.x<f.x,d=g.y>a.y&&h.y<f.y;return c&&d},isValid:function(){return !(!this.min||!this.max)}},dm.prototype={extend:function(b){var a,c,f=this._southWest,d=this._northEast;if(b instanceof cJ){c=a=b}else{if(!(b instanceof dm)){return b?this.extend(c5(b)||dE(b)):this}if(a=b._southWest,c=b._northEast,!a||!c){return this}}return f||d?(f.lat=Math.min(a.lat,f.lat),f.lng=Math.min(a.lng,f.lng),d.lat=Math.max(c.lat,d.lat),d.lng=Math.max(c.lng,d.lng)):(this._southWest=new cJ(a.lat,a.lng),this._northEast=new cJ(c.lat,c.lng)),this},pad:function(b){var a=this._southWest,c=this._northEast,f=Math.abs(a.lat-c.lat)*b,d=Math.abs(a.lng-c.lng)*b;return new dm(new cJ(a.lat-f,a.lng-d),new cJ(c.lat+f,c.lng+d))},getCenter:function(){return new cJ((this._southWest.lat+this._northEast.lat)/2,(this._southWest.lng+this._northEast.lng)/2)},getSouthWest:function(){return this._southWest},getNorthEast:function(){return this._northEast},getNorthWest:function(){return new cJ(this.getNorth(),this.getWest())},getSouthEast:function(){return new cJ(this.getSouth(),this.getEast())},getWest:function(){return this._southWest.lng},getSouth:function(){return this._southWest.lat},getEast:function(){return this._northEast.lng},getNorth:function(){return this._northEast.lat},contains:function(b){b="number"==typeof b[0]||b instanceof cJ||"lat" in b?c5(b):dE(b);var a,c,f=this._southWest,d=this._northEast;return b instanceof dm?(a=b.getSouthWest(),c=b.getNorthEast()):a=c=b,a.lat>=f.lat&&c.lat<=d.lat&&a.lng>=f.lng&&c.lng<=d.lng},intersects:function(b){b=dE(b);var a=this._southWest,f=this._northEast,h=b.getSouthWest(),g=b.getNorthEast(),c=g.lat>=a.lat&&h.lat<=f.lat,d=g.lng>=a.lng&&h.lng<=f.lng;return c&&d},overlaps:function(b){b=dE(b);var a=this._southWest,f=this._northEast,h=b.getSouthWest(),g=b.getNorthEast(),c=g.lat>a.lat&&h.lat<f.lat,d=g.lng>a.lng&&h.lng<f.lng;return c&&d},toBBoxString:function(){return[this.getWest(),this.getSouth(),this.getEast(),this.getNorth()].join(",")},equals:function(b,a){return !!b&&(b=dE(b),this._southWest.equals(b.getSouthWest(),a)&&this._northEast.equals(b.getNorthEast(),a))},isValid:function(){return !(!this._southWest||!this._northEast)}};var dx,dz={latLngToPoint:function(b,a){var c=this.projection.project(b),d=this.scale(a);return this.transformation._transform(c,d)},pointToLatLng:function(b,a){var c=this.scale(a),d=this.transformation.untransform(b,c);return this.projection.unproject(d)},project:function(a){return this.projection.project(a)},unproject:function(a){return this.projection.unproject(a)},scale:function(a){return 256*Math.pow(2,a)},zoom:function(a){return Math.log(a/256)/Math.LN2},getProjectedBounds:function(b){if(this.infinite){return null}var a=this.projection.bounds,c=this.scale(b);return new dj(this.transformation.transform(a.min,c),this.transformation.transform(a.max,c))},infinite:!(cJ.prototype={equals:function(b,a){return !!b&&(b=c5(b),Math.max(Math.abs(this.lat-b.lat),Math.abs(this.lng-b.lng))<=(void 0===a?1e-9:a))},toString:function(a){return"LatLng("+cT(this.lat,a)+", "+cT(this.lng,a)+")"},distanceTo:function(a){return c8.distance(this,c5(a))},wrap:function(){return c8.wrapLatLng(this)},toBounds:function(b){var a=180*b/40075017,c=a/Math.cos(Math.PI/180*this.lat);return dE([this.lat-a,this.lng-c],[this.lat+a,this.lng+c])},clone:function(){return new cJ(this.lat,this.lng,this.alt)}}),wrapLatLng:function(b){var a=this.wrapLng?cx(b.lng,this.wrapLng,!0):b.lng;return new cJ(this.wrapLat?cx(b.lat,this.wrapLat,!0):b.lat,a,b.alt)},wrapLatLngBounds:function(b){var a=b.getCenter(),f=this.wrapLatLng(a),h=a.lat-f.lat,g=a.lng-f.lng;if(0==h&&0==g){return b}var c=b.getSouthWest(),d=b.getNorthEast();return new dm(new cJ(c.lat-h,c.lng-g),new cJ(d.lat-h,d.lng-g))}},c8=cM({},dz,{wrapLng:[-180,180],R:6371000,distance:function(l,f){var j=Math.PI/180,d=l.lat*j,c=f.lat*j,m=Math.sin((f.lat-l.lat)*j/2),b=Math.sin((f.lng-l.lng)*j/2),k=m*m+Math.cos(d)*Math.cos(c)*b*b,g=2*Math.atan2(Math.sqrt(k),Math.sqrt(1-k));return this.R*g}}),c7=6378137,cy={R:c7,MAX_LATITUDE:85.0511287798,project:function(b){var a=Math.PI/180,c=this.MAX_LATITUDE,f=Math.max(Math.min(c,b.lat),-c),d=Math.sin(f*a);return new dJ(this.R*b.lng*a,this.R*Math.log((1+d)/(1-d))/2)},unproject:function(b){var a=180/Math.PI;return new cJ((2*Math.atan(Math.exp(b.y/this.R))-Math.PI/2)*a,b.x*a/this.R)},bounds:(dx=c7*Math.PI,new dj([-dx,-dx],[dx,dx]))};function dy(b,a,c,d){if(cq(b)){return this._a=b[0],this._b=b[1],this._c=b[2],void (this._d=b[3])}this._a=b,this._b=a,this._c=c,this._d=d}function dr(b,a,c,d){return new dy(b,a,c,d)}dy.prototype={transform:function(b,a){return this._transform(b.clone(),a)},_transform:function(b,a){return a=a||1,b.x=a*(this._a*b.x+this._b),b.y=a*(this._c*b.y+this._d),b},untransform:function(b,a){return a=a||1,new dJ((b.x/a-this._b)/this._a,(b.y/a-this._d)/this._c)}};var c3,c4=cM({},c8,{code:"EPSG:3857",projection:cy,transformation:(c3=0.5/(Math.PI*cy.R),dr(c3,0.5,-c3,0.5))}),ds=cM({},c4,{code:"EPSG:900913"});function d2(a){return document.createElementNS("http://www.w3.org/2000/svg",a)}function df(l,f){var j,d,c,m,b,k,g="";for(j=0,c=l.length;j<c;j++){for(d=0,m=(b=l[j]).length;d<m;d++){g+=(d?"L":"M")+(k=b[d]).x+" "+k.y}g+=f?bu?"z":"x":""}return g||"M0 0"}var a7=document.documentElement.style,aO="ActiveXObject" in window,bQ=aO&&!document.addEventListener,dl="msLaunchUri" in navigator&&!("documentMode" in document),cE=ak("webkit"),bo=ak("android"),bG=ak("android 2")||ak("android 3"),dO=parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1],10),a2=bo&&ak("Google")&&dO<537&&!("AudioNode" in window),aS=!!window.opera,ec=ak("chrome"),cm=ak("gecko")&&!cE&&!aS&&!aO,ab=!ec&&ak("safari"),b4=ak("phantom"),b9="OTransition" in a7,dV=0===navigator.platform.indexOf("Win"),bA=aO&&"transition" in a7,bh="WebKitCSSMatrix" in window&&"m11" in new window.WebKitCSSMatrix&&!bG,aF="MozPerspective" in a7,d1=!window.L_DISABLE_3D&&(bA||bh||aF)&&!b9&&!b4,ej="undefined"!=typeof orientation||ak("mobile"),aq=ej&&cE,aQ=ej&&bh,bT=!window.PointerEvent&&window.MSPointerEvent,c2=!(!window.PointerEvent&&!bT),dZ=!window.L_NO_TOUCH&&(c2||"ontouchstart" in window||window.DocumentTouch&&document instanceof window.DocumentTouch),dG=ej&&aS,bE=ej&&cm,a1=1<(window.devicePixelRatio||window.screen.deviceXDPI/window.screen.logicalXDPI),eg=!!document.createElement("canvas").getContext,bu=!(!document.createElementNS||!d2("svg").createSVGRect),aA=!bu&&function(){try{var b=document.createElement("div");b.innerHTML='<v:shape adj="1"/>';var a=b.firstChild;return a.style.behavior="url(#default#VML)",a&&"object"==typeof a.adj}catch(b){return !1}}();function ak(a){return 0<=navigator.userAgent.toLowerCase().indexOf(a)}var bg=(Object.freeze||Object)({ie:aO,ielt9:bQ,edge:dl,webkit:cE,android:bo,android23:bG,androidStock:a2,opera:aS,chrome:ec,gecko:cm,safari:ab,phantom:b4,opera12:b9,win:dV,ie3d:bA,webkit3d:bh,gecko3d:aF,any3d:d1,mobile:ej,mobileWebkit:aq,mobileWebkit3d:aQ,msPointer:bT,pointer:c2,touch:dZ,mobileOpera:dG,mobileGecko:bE,retina:a1,canvas:eg,svg:bu,vml:aA}),by=bT?"MSPointerDown":"pointerdown",dg=bT?"MSPointerMove":"pointermove",a5=bT?"MSPointerUp":"pointerup",ao=bT?"MSPointerCancel":"pointercancel",bl=["INPUT","SELECT","OPTION"],aN={},aB=!1,cd=0;function dT(b,a,c,d){return"touchstart"===a?function(g,f,h){var j=cX(function(e){if("mouse"!==e.pointerType&&e.MSPOINTER_TYPE_MOUSE&&e.pointerType!==e.MSPOINTER_TYPE_MOUSE){if(!(bl.indexOf(e.target.tagName)<0)){return}aP(e)}bV(e,f)});g["_leaflet_touchstart"+h]=j,g.addEventListener(by,j,!1),aB||(document.documentElement.addEventListener(by,ah,!0),document.documentElement.addEventListener(dg,dB,!0),document.documentElement.addEventListener(a5,cR,!0),document.documentElement.addEventListener(ao,cR,!0),aB=!0)}(b,c,d):"touchmove"===a?function(g,f,h){var j=function(e){(e.pointerType!==e.MSPOINTER_TYPE_MOUSE&&"mouse"!==e.pointerType||0!==e.buttons)&&bV(e,f)};g["_leaflet_touchmove"+h]=j,g.addEventListener(dg,j,!1)}(b,c,d):"touchend"===a&&function(g,f,h){var j=function(e){bV(e,f)};g["_leaflet_touchend"+h]=j,g.addEventListener(a5,j,!1),g.addEventListener(ao,j,!1)}(b,c,d),this}function ah(a){aN[a.pointerId]=a,cd++}function dB(a){aN[a.pointerId]&&(aN[a.pointerId]=a)}function cR(a){delete aN[a.pointerId],cd--}function bV(b,a){for(var c in b.touches=[],aN){b.touches.push(aN[c])}b.changedTouches=[b],a(b)}var eb=bT?"MSPointerDown":c2?"pointerdown":"touchstart",b7=bT?"MSPointerUp":c2?"pointerup":"touchend",bL="_leaflet_";function bZ(d,j,c){var f,g,b=!1;function h(l){var a;if(c2){if(!dl||"mouse"===l.pointerType){return}a=cd}else{a=l.touches.length}if(!(1<a)){var m=Date.now(),o=m-(f||m);g=l.touches?l.touches[0]:l,b=0<o&&o<=250,f=m}}function k(l){if(b&&!g.cancelBubble){if(c2){if(!dl||"mouse"===l.pointerType){return}var a,m,o={};for(m in g){a=g[m],o[m]=a&&a.bind?a.bind(g):a}g=o}g.type="dblclick",g.button=0,j(g),f=null}}return d[bL+eb+c]=h,d[bL+b7+c]=k,d[bL+"dblclick"+c]=j,d.addEventListener(eb,h,!1),d.addEventListener(b7,k,!1),d.addEventListener("dblclick",j,!1),this}function cA(b,a){var c=b[bL+eb+a],f=b[bL+b7+a],d=b[bL+"dblclick"+a];return b.removeEventListener(eb,c,!1),b.removeEventListener(b7,f,!1),dl||b.removeEventListener("dblclick",d,!1),this}var dc,aD,bc,aR,bU,dF=d8(["transform","webkitTransform","OTransform","MozTransform","msTransform"]),cU=d8(["webkitTransition","transition","OTransition","MozTransition","msTransition"]),bv="webkitTransition"===cU||"OTransition"===cU?cU+"End":"transitionend";function bM(a){return"string"==typeof a?document.getElementById(a):a}function dU(b,a){var c=b.style[a]||b.currentStyle&&b.currentStyle[a];if((!c||"auto"===c)&&document.defaultView){var d=document.defaultView.getComputedStyle(b,null);c=d?d[a]:null}return"auto"===c?null:c}function a6(b,a,c){var d=document.createElement(b);return d.className=a||"",c&&c.appendChild(d),d}function aY(b){var a=b.parentNode;a&&a.removeChild(b)}function eh(a){for(;a.firstChild;){a.removeChild(a.firstChild)}}function cD(b){var a=b.parentNode;a&&a.lastChild!==b&&a.appendChild(b)}function aj(b){var a=b.parentNode;a&&a.firstChild!==b&&a.insertBefore(b,a.firstChild)}function b8(b,a){if(void 0!==b.classList){return b.classList.contains(a)}var c=bm(b);return 0<c.length&&new RegExp("(^|\\s)"+a+"(\\s|$)").test(c)}function cf(b,a){if(void 0!==b.classList){for(var d=cS(a),g=0,f=d.length;g<f;g++){b.classList.add(d[g])}}else{if(!b8(b,a)){var c=bm(b);bF(b,(c?c+" ":"")+a)}}}function d0(b,a){void 0!==b.classList?b.classList.remove(a):bF(b,cZ((" "+bm(b)+" ").replace(" "+a+" "," ")))}function bF(b,a){void 0===b.className.baseVal?b.className=a:b.className.baseVal=a}function bm(a){return a.correspondingElement&&(a=a.correspondingElement),void 0===a.className.baseVal?a.className:a.className.baseVal}function aK(b,a){"opacity" in b.style?b.style.opacity=a:"filter" in b.style&&function(d,c){var f=!1,g="DXImageTransform.Microsoft.Alpha";try{f=d.filters.item(g)}catch(d){if(1===c){return}}c=Math.round(100*c),f?(f.Enabled=100!==c,f.Opacity=c):d.style.filter+=" progid:"+g+"(opacity="+c+")"}(b,a)}function d8(b){for(var a=document.documentElement.style,c=0;c<b.length;c++){if(b[c] in a){return b[c]}}return !1}function ac(b,a,c){var d=a||new dJ(0,0);b.style[dF]=(bA?"translate("+d.x+"px,"+d.y+"px)":"translate3d("+d.x+"px,"+d.y+"px,0)")+(c?" scale("+c+")":"")}function ax(b,a){b._leaflet_pos=a,d1?ac(b,a):(b.style.left=a.x+"px",b.style.top=a.y+"px")}function aX(a){return a._leaflet_pos||new dJ(0,0)}if("onselectstart" in document){dc=function(){aC(window,"selectstart",aP)},aD=function(){bk(window,"selectstart",aP)}}else{var bY=d8(["userSelect","WebkitUserSelect","OUserSelect","MozUserSelect","msUserSelect"]);dc=function(){if(bY){var a=document.documentElement.style;bc=a[bY],a[bY]="none"}},aD=function(){bY&&(document.documentElement.style[bY]=bc,bc=void 0)}}function dk(){aC(window,"dragstart",aP)}function d7(){bk(window,"dragstart",aP)}function dP(a){for(;-1===a.tabIndex;){a=a.parentNode}a.style&&(bK(),bU=(aR=a).style.outline,a.style.outline="none",aC(window,"keydown",bK))}function bK(){aR&&(aR.style.outline=bU,bU=aR=void 0,bk(window,"keydown",bK))}function a4(a){for(;!((a=a.parentNode).offsetWidth&&a.offsetHeight||a===document.body);){}return a}function aa(b){var a=b.getBoundingClientRect();return{x:a.width/b.offsetWidth||1,y:a.height/b.offsetHeight||1,boundingClientRect:a}}var bz=(Object.freeze||Object)({TRANSFORM:dF,TRANSITION:cU,TRANSITION_END:bv,get:bM,getStyle:dU,create:a6,remove:aY,empty:eh,toFront:cD,toBack:aj,hasClass:b8,addClass:cf,removeClass:d0,setClass:bF,getClass:bm,setOpacity:aK,testProp:d8,setTransform:ac,setPosition:ax,getPosition:aX,disableTextSelection:dc,enableTextSelection:aD,disableImageDrag:dk,enableImageDrag:d7,preventOutline:dP,restoreOutline:bK,getSizedParentNode:a4,getScale:aa});function aC(b,a,f,h){if("object"==typeof a){for(var g in a){bD(b,g,a[g],f)}}else{for(var c=0,d=(a=cS(a)).length;c<d;c++){bD(b,a[c],f,h)}}return this}var ap="_leaflet_events";function bk(d,c,h,k){if("object"==typeof c){for(var j in c){dA(d,j,c[j],h)}}else{if(c){for(var f=0,g=(c=cS(c)).length;f<g;f++){dA(d,c[f],h,k)}}else{for(var b in d[ap]){dA(d,b,d[ap][b])}delete d[ap]}}return this}function bD(b,a,f,h){var g=a+cs(f)+(h?"_"+cs(h):"");if(b[ap]&&b[ap][g]){return this}var c=function(e){return f.call(h||b,e||window.event)},d=c;c2&&0===a.indexOf("touch")?dT(b,a,c,g):!dZ||"dblclick"!==a||c2&&ec?"addEventListener" in b?"mousewheel"===a?b.addEventListener("onwheel" in b?"wheel":"mousewheel",c,!1):"mouseenter"===a||"mouseleave"===a?(c=function(e){e=e||window.event,cc(b,e)&&d(e)},b.addEventListener("mouseenter"===a?"mouseover":"mouseout",c,!1)):("click"===a&&bo&&(c=function(e){!function(k,j){var l=k.timeStamp||k.originalEvent&&k.originalEvent.timeStamp,m=dN&&l-dN;if(m&&100<m&&m<500||k.target._simulatedClick&&!k._simulated){return aE(k)}dN=l,j(k)}(e,d)}),b.addEventListener(a,c,!1)):"attachEvent" in b&&b.attachEvent("on"+a,c):bZ(b,c,g),b[ap]=b[ap]||{},b[ap][g]=c}function dA(b,a,d,g){var f=a+cs(d)+(g?"_"+cs(g):""),c=b[ap]&&b[ap][f];if(!c){return this}c2&&0===a.indexOf("touch")?function(j,h,k){var l=j["_leaflet_"+h+k];"touchstart"===h?j.removeEventListener(by,l,!1):"touchmove"===h?j.removeEventListener(dg,l,!1):"touchend"===h&&(j.removeEventListener(a5,l,!1),j.removeEventListener(ao,l,!1))}(b,a,f):!dZ||"dblclick"!==a||c2&&ec?"removeEventListener" in b?"mousewheel"===a?b.removeEventListener("onwheel" in b?"wheel":"mousewheel",c,!1):b.removeEventListener("mouseenter"===a?"mouseover":"mouseleave"===a?"mouseout":a,c,!1):"detachEvent" in b&&b.detachEvent("on"+a,c):cA(b,f),b[ap][f]=null}function bb(a){return a.stopPropagation?a.stopPropagation():a.originalEvent?a.originalEvent._stopped=!0:a.cancelBubble=!0,ef(a),this}function aw(a){return bD(a,"mousewheel",bb),this}function bs(a){return aC(a,"mousedown touchstart dblclick",bb),bD(a,"click",b0),this}function aP(a){return a.preventDefault?a.preventDefault():a.returnValue=!1,this}function aE(a){return aP(a),bb(a),this}function ck(b,a){if(!a){return new dJ(b.clientX,b.clientY)}var c=aa(a),d=c.boundingClientRect;return new dJ((b.clientX-d.left)/c.x-a.clientLeft,(b.clientY-d.top)/c.y-a.clientTop)}var dY=dV&&ec?2*window.devicePixelRatio:cm?window.devicePixelRatio:1;function am(a){return dl?a.wheelDeltaY/2:a.deltaY&&0===a.deltaMode?-a.deltaY/dY:a.deltaY&&1===a.deltaMode?20*-a.deltaY:a.deltaY&&2===a.deltaMode?60*-a.deltaY:a.deltaX||a.deltaZ?0:a.wheelDelta?(a.wheelDeltaY||a.wheelDelta)/2:a.detail&&Math.abs(a.detail)<32765?20*-a.detail:a.detail?a.detail/-32765*60:0}var dN,c0={};function b0(a){c0[a.type]=!0}function ef(b){var a=c0[b.type];return c0[b.type]=!1,a}function cc(b,a){var c=a.relatedTarget;if(!c){return !0}try{for(;c&&c!==b;){c=c.parentNode}}catch(b){return !1}return c!==b}var bP=(Object.freeze||Object)({on:aC,off:bk,stopPropagation:bb,disableScrollPropagation:aw,disableClickPropagation:bs,preventDefault:aP,stop:aE,getMousePosition:ck,getWheelDelta:am,fakeStop:b0,skipped:ef,isExternalTarget:cc,addListener:aC,removeListener:bk}),b3=cH.extend({run:function(b,a,c,d){this.stop(),this._el=b,this._inProgress=!0,this._duration=c||0.25,this._easeOutPower=1/Math.max(d||0.5,0.2),this._startPos=aX(b),this._offset=a.subtract(this._startPos),this._startTime=+new Date,this.fire("start"),this._animate()},stop:function(){this._inProgress&&(this._step(!0),this._complete())},_animate:function(){this._animId=dp(this._animate,this),this._step()},_step:function(b){var a=+new Date-this._startTime,c=1000*this._duration;a<c?this._runFrame(this._easeOut(a/c),b):(this._runFrame(1),this._complete())},_runFrame:function(b,a){var c=this._startPos.add(this._offset.multiplyBy(b));a&&c._round(),ax(this._el,c),this.fire("step")},_complete:function(){dH(this._animId),this._inProgress=!1,this.fire("end")},_easeOut:function(a){return 1-Math.pow(1-a,this._easeOutPower)}}),cP=cH.extend({options:{crs:c4,center:void 0,zoom:void 0,minZoom:void 0,maxZoom:void 0,layers:[],maxBounds:void 0,renderer:void 0,zoomAnimation:!0,zoomAnimationThreshold:4,fadeAnimation:!0,markerZoomAnimation:!0,transform3DLimit:8388608,zoomSnap:1,zoomDelta:1,trackResize:!0},initialize:function(b,a){a=cz(this,a),this._handlers=[],this._layers={},this._zoomBoundLayers={},this._sizeChanged=!0,this._initContainer(b),this._initLayout(),this._onResize=cX(this._onResize,this),this._initEvents(),a.maxBounds&&this.setMaxBounds(a.maxBounds),void 0!==a.zoom&&(this._zoom=this._limitZoom(a.zoom)),a.center&&void 0!==a.zoom&&this.setView(c5(a.center),a.zoom,{reset:!0}),this.callInitHooks(),this._zoomAnimated=cU&&d1&&!dG&&this.options.zoomAnimation,this._zoomAnimated&&(this._createAnimProxy(),aC(this._proxy,bv,this._catchTransitionEnd,this)),this._addLayers(this.options.layers)},setView:function(b,a,c){if((a=void 0===a?this._zoom:this._limitZoom(a),b=this._limitCenter(c5(b),a,this.options.maxBounds),c=c||{},this._stop(),this._loaded&&!c.reset&&!0!==c)&&(void 0!==c.animate&&(c.zoom=cM({animate:c.animate},c.zoom),c.pan=cM({animate:c.animate,duration:c.duration},c.pan)),this._zoom!==a?this._tryAnimatedZoom&&this._tryAnimatedZoom(b,a,c.zoom):this._tryAnimatedPan(b,c.pan))){return clearTimeout(this._sizeTimer),this}return this._resetView(b,a),this},setZoom:function(b,a){return this._loaded?this.setView(this.getCenter(),b,{zoom:a}):(this._zoom=b,this)},zoomIn:function(b,a){return b=b||(d1?this.options.zoomDelta:1),this.setZoom(this._zoom+b,a)},zoomOut:function(b,a){return b=b||(d1?this.options.zoomDelta:1),this.setZoom(this._zoom-b,a)},setZoomAround:function(b,a,f){var h=this.getZoomScale(a),g=this.getSize().divideBy(2),c=(b instanceof dJ?b:this.latLngToContainerPoint(b)).subtract(g).multiplyBy(1-1/h),d=this.containerPointToLatLng(g.add(c));return this.setView(d,a,{zoom:f})},_getBoundsCenterZoom:function(d,c){c=c||{},d=d.getBounds?d.getBounds():dE(d);var h=dv(c.paddingTopLeft||c.padding||[0,0]),k=dv(c.paddingBottomRight||c.padding||[0,0]),j=this.getBoundsZoom(d,!1,h.add(k));if((j="number"==typeof c.maxZoom?Math.min(c.maxZoom,j):j)===1/0){return{center:d.getCenter(),zoom:j}}var f=k.subtract(h).divideBy(2),g=this.project(d.getSouthWest(),j),b=this.project(d.getNorthEast(),j);return{center:this.unproject(g.add(b).divideBy(2).add(f),j),zoom:j}},fitBounds:function(b,a){if(!(b=dE(b)).isValid()){throw new Error("Bounds are not valid.")}var c=this._getBoundsCenterZoom(b,a);return this.setView(c.center,c.zoom,a)},fitWorld:function(a){return this.fitBounds([[-90,-180],[90,180]],a)},panTo:function(b,a){return this.setView(b,this._zoom,{pan:a})},panBy:function(b,a){if(a=a||{},!(b=dv(b).round()).x&&!b.y){return this.fire("moveend")}if(!0!==a.animate&&!this.getSize().contains(b)){return this._resetView(this.unproject(this.project(this.getCenter()).add(b)),this.getZoom()),this}if(this._panAnim||(this._panAnim=new b3,this._panAnim.on({step:this._onPanTransitionStep,end:this._onPanTransitionEnd},this)),a.noMoveStart||this.fire("movestart"),!1!==a.animate){cf(this._mapPane,"leaflet-pan-anim");var c=this._getMapPanePos().subtract(b).round();this._panAnim.run(this._mapPane,c,a.duration||0.25,a.easeLinearity)}else{this._rawPanBy(b),this.fire("move").fire("moveend")}return this},flyTo:function(B,A,q){if(!1===(q=q||{}).animate||!d1){return this.setView(B,A,q)}this._stop();var w=this.project(this.getCenter()),x=this.project(B),E=this.getSize(),M=this._zoom;B=c5(B),A=void 0===A?M:A;var F=Math.max(E.x,E.y),k=F*this.getZoomScale(M,A),D=x.distanceTo(w)||1,K=1.42,N=K*K;function I(c){var a=(k*k-F*F+(c?-1:1)*N*N*D*D)/(2*(c?k:F)*N*D),d=Math.sqrt(a*a+1)-a;return d<1e-9?-18:Math.log(d)}function J(a){return(Math.exp(a)-Math.exp(-a))/2}function z(a){return(Math.exp(a)+Math.exp(-a))/2}var C=I(0);function H(a){return F*(z(C)*function(c){return J(c)/z(c)}(C+K*a)-J(C))/N}var G=Date.now(),j=(I(1)-C)/K,b=q.duration?1000*q.duration:1000*j*0.8;return this._moveStart(!0,q.noMoveStart),function q(){var a=(Date.now()-G)/b,c=function(d){return 1-Math.pow(1-d,1.5)}(a)*j;a<=1?(this._flyToFrame=dp(q,this),this._move(this.unproject(w.add(x.subtract(w).multiplyBy(H(c)/D)),M),this.getScaleZoom(F/function(d){return F*(z(C)/z(C+K*d))}(c),M),{flyTo:!0})):this._move(B,A)._moveEnd(!0)}.call(this),this},flyToBounds:function(b,a){var c=this._getBoundsCenterZoom(b,a);return this.flyTo(c.center,c.zoom,a)},setMaxBounds:function(a){return(a=dE(a)).isValid()?(this.options.maxBounds&&this.off("moveend",this._panInsideMaxBounds),this.options.maxBounds=a,this._loaded&&this._panInsideMaxBounds(),this.on("moveend",this._panInsideMaxBounds)):(this.options.maxBounds=null,this.off("moveend",this._panInsideMaxBounds))},setMinZoom:function(b){var a=this.options.minZoom;return this.options.minZoom=b,this._loaded&&a!==b&&(this.fire("zoomlevelschange"),this.getZoom()<this.options.minZoom)?this.setZoom(b):this},setMaxZoom:function(b){var a=this.options.maxZoom;return this.options.maxZoom=b,this._loaded&&a!==b&&(this.fire("zoomlevelschange"),this.getZoom()>this.options.maxZoom)?this.setZoom(b):this},panInsideBounds:function(b,a){this._enforcingBounds=!0;var c=this.getCenter(),d=this._limitCenter(c,this._zoom,dE(b));return c.equals(d)||this.panTo(d,a),this._enforcingBounds=!1,this},panInside:function(w,j){var m=dv((j=j||{}).paddingTopLeft||j.padding||[0,0]),f=dv(j.paddingBottomRight||j.padding||[0,0]),d=this.getCenter(),x=this.project(d),b=this.project(w),q=this.getPixelBounds(),k=q.getSize().divideBy(2),v=dd([q.min.add(m),q.max.subtract(f)]);if(!v.contains(b)){this._enforcingBounds=!0;var g=x.subtract(b),p=dv(b.x+g.x,b.y+g.y);(b.x<v.min.x||b.x>v.max.x)&&(p.x=x.x-g.x,0<g.x?p.x+=k.x-m.x:p.x-=k.x-f.x),(b.y<v.min.y||b.y>v.max.y)&&(p.y=x.y-g.y,0<g.y?p.y+=k.y-m.y:p.y-=k.y-f.y),this.panTo(this.unproject(p),j),this._enforcingBounds=!1}return this},invalidateSize:function(b){if(!this._loaded){return this}b=cM({animate:!1,pan:!0},!0===b?{animate:!0}:b);var a=this.getSize();this._sizeChanged=!0,this._lastCenter=null;var d=this.getSize(),g=a.divideBy(2).round(),f=d.divideBy(2).round(),c=g.subtract(f);return c.x||c.y?(b.animate&&b.pan?this.panBy(c):(b.pan&&this._rawPanBy(c),this.fire("move"),b.debounceMoveend?(clearTimeout(this._sizeTimer),this._sizeTimer=setTimeout(cX(this.fire,this,"moveend"),200)):this.fire("moveend")),this.fire("resize",{oldSize:a,newSize:d})):this},stop:function(){return this.setZoom(this._limitZoom(this._zoom)),this.options.zoomSnap||this.fire("viewreset"),this._stop()},locate:function(b){if(b=this._locateOptions=cM({timeout:10000,watch:!1},b),!("geolocation" in navigator)){return this._handleGeolocationError({code:0,message:"Geolocation not supported."}),this}var a=cX(this._handleGeolocationResponse,this),c=cX(this._handleGeolocationError,this);return b.watch?this._locationWatchId=navigator.geolocation.watchPosition(a,c,b):navigator.geolocation.getCurrentPosition(a,c,b),this},stopLocate:function(){return navigator.geolocation&&navigator.geolocation.clearWatch&&navigator.geolocation.clearWatch(this._locationWatchId),this._locateOptions&&(this._locateOptions.setView=!1),this},_handleGeolocationError:function(b){var a=b.code,c=b.message||(1===a?"permission denied":2===a?"position unavailable":"timeout");this._locateOptions.setView&&!this._loaded&&this.fitWorld(),this.fire("locationerror",{code:a,message:"Geolocation error: "+c+"."})},_handleGeolocationResponse:function(b){var a=new cJ(b.coords.latitude,b.coords.longitude),f=a.toBounds(2*b.coords.accuracy),h=this._locateOptions;if(h.setView){var g=this.getBoundsZoom(f);this.setView(a,h.maxZoom?Math.min(g,h.maxZoom):g)}var c={latlng:a,bounds:f,timestamp:b.timestamp};for(var d in b.coords){"number"==typeof b.coords[d]&&(c[d]=b.coords[d])}this.fire("locationfound",c)},addHandler:function(b,a){if(!a){return this}var c=this[b]=new a(this);return this._handlers.push(c),this.options[b]&&c.enable(),this},remove:function(){if(this._initEvents(!0),this._containerId!==this._container._leaflet_id){throw new Error("Map container is being reused by another instance")}try{delete this._container._leaflet_id,delete this._containerId}catch(a){this._container._leaflet_id=void 0,this._containerId=void 0}var a;for(a in void 0!==this._locationWatchId&&this.stopLocate(),this._stop(),aY(this._mapPane),this._clearControlPos&&this._clearControlPos(),this._resizeRequest&&(dH(this._resizeRequest),this._resizeRequest=null),this._clearHandlers(),this._loaded&&this.fire("unload"),this._layers){this._layers[a].remove()}for(a in this._panes){aY(this._panes[a])}return this._layers=[],this._panes=[],delete this._mapPane,delete this._renderer,this},createPane:function(b,a){var c=a6("div","leaflet-pane"+(b?" leaflet-"+b.replace("Pane","")+"-pane":""),a||this._mapPane);return b&&(this._panes[b]=c),c},getCenter:function(){return this._checkIfLoaded(),this._lastCenter&&!this._moved()?this._lastCenter:this.layerPointToLatLng(this._getCenterLayerPoint())},getZoom:function(){return this._zoom},getBounds:function(){var a=this.getPixelBounds();return new dm(this.unproject(a.getBottomLeft()),this.unproject(a.getTopRight()))},getMinZoom:function(){return void 0===this.options.minZoom?this._layersMinZoom||0:this.options.minZoom},getMaxZoom:function(){return void 0===this.options.maxZoom?void 0===this._layersMaxZoom?1/0:this._layersMaxZoom:this.options.maxZoom},getBoundsZoom:function(z,k,p){z=dE(z),p=dv(p||[0,0]);var g=this.getZoom()||0,f=this.getMinZoom(),A=this.getMaxZoom(),b=z.getNorthWest(),w=z.getSouthEast(),m=this.getSize().subtract(p),y=dd(this.project(w,g),this.project(b,g)).getSize(),j=d1?this.options.zoomSnap:1,v=m.x/y.x,x=m.y/y.y,q=k?Math.max(v,x):Math.min(v,x);return g=this.getScaleZoom(q,g),j&&(g=Math.round(g/(j/100))*(j/100),g=k?Math.ceil(g/j)*j:Math.floor(g/j)*j),Math.max(f,Math.min(A,g))},getSize:function(){return this._size&&!this._sizeChanged||(this._size=new dJ(this._container.clientWidth||0,this._container.clientHeight||0),this._sizeChanged=!1),this._size.clone()},getPixelBounds:function(b,a){var c=this._getTopLeftPoint(b,a);return new dj(c,c.add(this.getSize()))},getPixelOrigin:function(){return this._checkIfLoaded(),this._pixelOrigin},getPixelWorldBounds:function(a){return this.options.crs.getProjectedBounds(void 0===a?this.getZoom():a)},getPane:function(a){return"string"==typeof a?this._panes[a]:a},getPanes:function(){return this._panes},getContainer:function(){return this._container},getZoomScale:function(b,a){var c=this.options.crs;return a=void 0===a?this._zoom:a,c.scale(b)/c.scale(a)},getScaleZoom:function(b,a){var c=this.options.crs;a=void 0===a?this._zoom:a;var d=c.zoom(b*c.scale(a));return isNaN(d)?1/0:d},project:function(b,a){return a=void 0===a?this._zoom:a,this.options.crs.latLngToPoint(c5(b),a)},unproject:function(b,a){return a=void 0===a?this._zoom:a,this.options.crs.pointToLatLng(dv(b),a)},layerPointToLatLng:function(b){var a=dv(b).add(this.getPixelOrigin());return this.unproject(a)},latLngToLayerPoint:function(a){return this.project(c5(a))._round()._subtract(this.getPixelOrigin())},wrapLatLng:function(a){return this.options.crs.wrapLatLng(c5(a))},wrapLatLngBounds:function(a){return this.options.crs.wrapLatLngBounds(dE(a))},distance:function(b,a){return this.options.crs.distance(c5(b),c5(a))},containerPointToLayerPoint:function(a){return dv(a).subtract(this._getMapPanePos())},layerPointToContainerPoint:function(a){return dv(a).add(this._getMapPanePos())},containerPointToLatLng:function(b){var a=this.containerPointToLayerPoint(dv(b));return this.layerPointToLatLng(a)},latLngToContainerPoint:function(a){return this.layerPointToContainerPoint(this.latLngToLayerPoint(c5(a)))},mouseEventToContainerPoint:function(a){return ck(a,this._container)},mouseEventToLayerPoint:function(a){return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(a))},mouseEventToLatLng:function(a){return this.layerPointToLatLng(this.mouseEventToLayerPoint(a))},_initContainer:function(b){var a=this._container=bM(b);if(!a){throw new Error("Map container not found.")}if(a._leaflet_id){throw new Error("Map container is already initialized.")}aC(a,"scroll",this._onScroll,this),this._containerId=cs(a)},_initLayout:function(){var b=this._container;this._fadeAnimated=this.options.fadeAnimation&&d1,cf(b,"leaflet-container"+(dZ?" leaflet-touch":"")+(a1?" leaflet-retina":"")+(bQ?" leaflet-oldie":"")+(ab?" leaflet-safari":"")+(this._fadeAnimated?" leaflet-fade-anim":""));var a=dU(b,"position");"absolute"!==a&&"relative"!==a&&"fixed"!==a&&(b.style.position="relative"),this._initPanes(),this._initControlPos&&this._initControlPos()},_initPanes:function(){var a=this._panes={};this._paneRenderers={},this._mapPane=this.createPane("mapPane",this._container),ax(this._mapPane,new dJ(0,0)),this.createPane("tilePane"),this.createPane("shadowPane"),this.createPane("overlayPane"),this.createPane("markerPane"),this.createPane("tooltipPane"),this.createPane("popupPane"),this.options.markerZoomAnimation||(cf(a.markerPane,"leaflet-zoom-hide"),cf(a.shadowPane,"leaflet-zoom-hide"))},_resetView:function(b,a){ax(this._mapPane,new dJ(0,0));var c=!this._loaded;this._loaded=!0,a=this._limitZoom(a),this.fire("viewprereset");var d=this._zoom!==a;this._moveStart(d,!1)._move(b,a)._moveEnd(d),this.fire("viewreset"),c&&this.fire("load")},_moveStart:function(b,a){return b&&this.fire("zoomstart"),a||this.fire("movestart"),this},_move:function(b,a,c){void 0===a&&(a=this._zoom);var d=this._zoom!==a;return this._zoom=a,this._lastCenter=b,this._pixelOrigin=this._getNewPixelOrigin(b),(d||c&&c.pinch)&&this.fire("zoom",c),this.fire("move",c)},_moveEnd:function(a){return a&&this.fire("zoomend"),this.fire("moveend")},_stop:function(){return dH(this._flyToFrame),this._panAnim&&this._panAnim.stop(),this},_rawPanBy:function(a){ax(this._mapPane,this._getMapPanePos().subtract(a))},_getZoomSpan:function(){return this.getMaxZoom()-this.getMinZoom()},_panInsideMaxBounds:function(){this._enforcingBounds||this.panInsideBounds(this.options.maxBounds)},_checkIfLoaded:function(){if(!this._loaded){throw new Error("Set map center and zoom first.")}},_initEvents:function(b){this._targets={};var a=b?bk:aC;a((this._targets[cs(this._container)]=this)._container,"click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu keypress keydown keyup",this._handleDOMEvent,this),this.options.trackResize&&a(window,"resize",this._onResize,this),d1&&this.options.transform3DLimit&&(b?this.off:this.on).call(this,"moveend",this._onMoveEnd)},_onResize:function(){dH(this._resizeRequest),this._resizeRequest=dp(function(){this.invalidateSize({debounceMoveend:!0})},this)},_onScroll:function(){this._container.scrollTop=0,this._container.scrollLeft=0},_onMoveEnd:function(){var a=this._getMapPanePos();Math.max(Math.abs(a.x),Math.abs(a.y))>=this.options.transform3DLimit&&this._resetView(this.getCenter(),this.getZoom())},_findEventTargets:function(b,a){for(var f,h=[],g="mouseout"===a||"mouseover"===a,c=b.target||b.srcElement,d=!1;c;){if((f=this._targets[cs(c)])&&("click"===a||"preclick"===a)&&!b._simulated&&this._draggableMoved(f)){d=!0;break}if(f&&f.listens(a,!0)){if(g&&!cc(c,b)){break}if(h.push(f),g){break}}if(c===this._container){break}c=c.parentNode}return h.length||d||g||!cc(c,b)||(h=[this]),h},_handleDOMEvent:function(b){if(this._loaded&&!ef(b)){var a=b.type;"mousedown"!==a&&"keypress"!==a&&"keyup"!==a&&"keydown"!==a||dP(b.target||b.srcElement),this._fireDOMEvent(b,a)}},_mouseEvents:["click","dblclick","mouseover","mouseout","contextmenu"],_fireDOMEvent:function(d,c,h){if("click"===d.type){var k=cM({},d);k.type="preclick",this._fireDOMEvent(k,k.type,h)}if(!d._stopped&&(h=(h||[]).concat(this._findEventTargets(d,c))).length){var j=h[0];"contextmenu"===c&&j.listens(c,!0)&&aP(d);var f={originalEvent:d};if("keypress"!==d.type&&"keydown"!==d.type&&"keyup"!==d.type){var g=j.getLatLng&&(!j._radius||j._radius<=10);f.containerPoint=g?this.latLngToContainerPoint(j.getLatLng()):this.mouseEventToContainerPoint(d),f.layerPoint=this.containerPointToLayerPoint(f.containerPoint),f.latlng=g?j.getLatLng():this.layerPointToLatLng(f.layerPoint)}for(var b=0;b<h.length;b++){if(h[b].fire(c,f,!0),f.originalEvent._stopped||!1===h[b].options.bubblingMouseEvents&&-1!==cl(this._mouseEvents,c)){return}}}},_draggableMoved:function(a){return(a=a.dragging&&a.dragging.enabled()?a:this).dragging&&a.dragging.moved()||this.boxZoom&&this.boxZoom.moved()},_clearHandlers:function(){for(var b=0,a=this._handlers.length;b<a;b++){this._handlers[b].disable()}},whenReady:function(b,a){return this._loaded?b.call(a||this,{target:this}):this.on("load",b,a),this},_getMapPanePos:function(){return aX(this._mapPane)||new dJ(0,0)},_moved:function(){var a=this._getMapPanePos();return a&&!a.equals([0,0])},_getTopLeftPoint:function(b,a){return(b&&void 0!==a?this._getNewPixelOrigin(b,a):this.getPixelOrigin()).subtract(this._getMapPanePos())},_getNewPixelOrigin:function(b,a){var c=this.getSize()._divideBy(2);return this.project(b,a)._subtract(c)._add(this._getMapPanePos())._round()},_latLngToNewLayerPoint:function(b,a,c){var d=this._getNewPixelOrigin(c,a);return this.project(b,a)._subtract(d)},_latLngBoundsToNewLayerBounds:function(b,a,c){var d=this._getNewPixelOrigin(c,a);return dd([this.project(b.getSouthWest(),a)._subtract(d),this.project(b.getNorthWest(),a)._subtract(d),this.project(b.getSouthEast(),a)._subtract(d),this.project(b.getNorthEast(),a)._subtract(d)])},_getCenterLayerPoint:function(){return this.containerPointToLayerPoint(this.getSize()._divideBy(2))},_getCenterOffset:function(a){return this.latLngToLayerPoint(a).subtract(this._getCenterLayerPoint())},_limitCenter:function(b,a,f){if(!f){return b}var h=this.project(b,a),g=this.getSize().divideBy(2),c=new dj(h.subtract(g),h.add(g)),d=this._getBoundsOffset(c,f,a);return d.round().equals([0,0])?b:this.unproject(h.add(d),a)},_limitOffset:function(b,a){if(!a){return b}var c=this.getPixelBounds(),d=new dj(c.min.add(b),c.max.add(b));return b.add(this._getBoundsOffset(d,a))},_getBoundsOffset:function(b,a,d){var g=dd(this.project(a.getNorthEast(),d),this.project(a.getSouthWest(),d)),f=g.min.subtract(b.min),c=g.max.subtract(b.max);return new dJ(this._rebound(f.x,-c.x),this._rebound(f.y,-c.y))},_rebound:function(b,a){return 0<b+a?Math.round(b-a)/2:Math.max(0,Math.ceil(b))-Math.max(0,Math.floor(a))},_limitZoom:function(b){var a=this.getMinZoom(),c=this.getMaxZoom(),d=d1?this.options.zoomSnap:1;return d&&(b=Math.round(b/d)*d),Math.max(a,Math.min(c,b))},_onPanTransitionStep:function(){this.fire("move")},_onPanTransitionEnd:function(){d0(this._mapPane,"leaflet-pan-anim"),this.fire("moveend")},_tryAnimatedPan:function(b,a){var c=this._getCenterOffset(b)._trunc();return !(!0!==(a&&a.animate)&&!this.getSize().contains(c))&&(this.panBy(c,a),!0)},_createAnimProxy:function(){var a=this._proxy=a6("div","leaflet-proxy leaflet-zoom-animated");this._panes.mapPane.appendChild(a),this.on("zoomanim",function(c){var b=dF,d=this._proxy.style[b];ac(this._proxy,this.project(c.center,c.zoom),this.getZoomScale(c.zoom,1)),d===this._proxy.style[b]&&this._animatingZoom&&this._onZoomTransitionEnd()},this),this.on("load moveend",function(){var c=this.getCenter(),b=this.getZoom();ac(this._proxy,this.project(c,b),this.getZoomScale(b,1))},this),this._on("unload",this._destroyAnimProxy,this)},_destroyAnimProxy:function(){aY(this._proxy),delete this._proxy},_catchTransitionEnd:function(a){this._animatingZoom&&0<=a.propertyName.indexOf("transform")&&this._onZoomTransitionEnd()},_nothingToAnimate:function(){return !this._container.getElementsByClassName("leaflet-zoom-animated").length},_tryAnimatedZoom:function(b,a,c){if(this._animatingZoom){return !0}if(c=c||{},!this._zoomAnimated||!1===c.animate||this._nothingToAnimate()||Math.abs(a-this._zoom)>this.options.zoomAnimationThreshold){return !1}var f=this.getZoomScale(a),d=this._getCenterOffset(b)._divideBy(1-1/f);return !(!0!==c.animate&&!this.getSize().contains(d))&&(dp(function(){this._moveStart(!0,!1)._animateZoom(b,a,!0)},this),!0)},_animateZoom:function(b,a,c,d){this._mapPane&&(c&&(this._animatingZoom=!0,this._animateToCenter=b,this._animateToZoom=a,cf(this._mapPane,"leaflet-zoom-anim")),this.fire("zoomanim",{center:b,zoom:a,noUpdate:d}),setTimeout(cX(this._onZoomTransitionEnd,this),250))},_onZoomTransitionEnd:function(){this._animatingZoom&&(this._mapPane&&d0(this._mapPane,"leaflet-zoom-anim"),this._animatingZoom=!1,this._move(this._animateToCenter,this._animateToZoom),dp(function(){this._moveEnd(!0)},this))}});function dw(a){return new aJ(a)}var aJ=c1.extend({options:{position:"topright"},initialize:function(a){cz(this,a)},getPosition:function(){return this.options.position},setPosition:function(b){var a=this._map;return a&&a.removeControl(this),this.options.position=b,a&&a.addControl(this),this},getContainer:function(){return this._container},addTo:function(b){this.remove(),this._map=b;var a=this._container=this.onAdd(b),c=this.getPosition(),d=b._controlCorners[c];return cf(a,"leaflet-control"),-1!==c.indexOf("bottom")?d.insertBefore(a,d.firstChild):d.appendChild(a),this._map.on("unload",this.remove,this),this},remove:function(){return this._map&&(aY(this._container),this.onRemove&&this.onRemove(this._map),this._map.off("unload",this.remove,this),this._map=null),this},_refocusOnMap:function(a){this._map&&a&&0<a.screenX&&0<a.screenY&&this._map.getContainer().focus()}});cP.include({addControl:function(a){return a.addTo(this),this},removeControl:function(a){return a.remove(),this},_initControlPos:function(){var d=this._controlCorners={},c="leaflet-",b=this._controlContainer=a6("div",c+"control-container",this._container);function a(g,f){var h=c+g+" "+c+f;d[g+f]=a6("div",h,b)}a("top","left"),a("top","right"),a("bottom","left"),a("bottom","right")},_clearControlPos:function(){for(var a in this._controlCorners){aY(this._controlCorners[a])}aY(this._controlContainer),delete this._controlCorners,delete this._controlContainer}});var bf=aJ.extend({options:{collapsed:!0,position:"topright",autoZIndex:!0,hideSingleBase:!1,sortLayers:!1,sortFunction:function(b,a,c,d){return c<d?-1:d<c?1:0}},initialize:function(b,a,c){for(var d in cz(this,c),this._layerControlInputs=[],this._layers=[],this._lastZIndex=0,this._handlingClick=!1,b){this._addLayer(b[d],d)}for(d in a){this._addLayer(a[d],d,!0)}},onAdd:function(b){this._initLayout(),this._update(),(this._map=b).on("zoomend",this._checkDisabledLayers,this);for(var a=0;a<this._layers.length;a++){this._layers[a].layer.on("add remove",this._onLayerChange,this)}return this._container},addTo:function(a){return aJ.prototype.addTo.call(this,a),this._expandIfNotCollapsed()},onRemove:function(){this._map.off("zoomend",this._checkDisabledLayers,this);for(var a=0;a<this._layers.length;a++){this._layers[a].layer.off("add remove",this._onLayerChange,this)}},addBaseLayer:function(b,a){return this._addLayer(b,a),this._map?this._update():this},addOverlay:function(b,a){return this._addLayer(b,a,!0),this._map?this._update():this},removeLayer:function(b){b.off("add remove",this._onLayerChange,this);var a=this._getLayer(cs(b));return a&&this._layers.splice(this._layers.indexOf(a),1),this._map?this._update():this},expand:function(){cf(this._container,"leaflet-control-layers-expanded"),this._section.style.height=null;var a=this._map.getSize().y-(this._container.offsetTop+50);return a<this._section.clientHeight?(cf(this._section,"leaflet-control-layers-scrollbar"),this._section.style.height=a+"px"):d0(this._section,"leaflet-control-layers-scrollbar"),this._checkDisabledLayers(),this},collapse:function(){return d0(this._container,"leaflet-control-layers-expanded"),this},_initLayout:function(){var b="leaflet-control-layers",a=this._container=a6("div",b),c=this.options.collapsed;a.setAttribute("aria-haspopup",!0),bs(a),aw(a);var f=this._section=a6("section",b+"-list");c&&(this._map.on("click",this.collapse,this),bo||aC(a,{mouseenter:this.expand,mouseleave:this.collapse},this));var d=this._layersLink=a6("a",b+"-toggle",a);d.href="#",d.title="Layers",dZ?(aC(d,"click",aE),aC(d,"click",this.expand,this)):aC(d,"focus",this.expand,this),c||this.expand(),this._baseLayersList=a6("div",b+"-base",f),this._separator=a6("div",b+"-separator",f),this._overlaysList=a6("div",b+"-overlays",f),a.appendChild(f)},_getLayer:function(b){for(var a=0;a<this._layers.length;a++){if(this._layers[a]&&cs(this._layers[a].layer)===b){return this._layers[a]}}},_addLayer:function(b,a,c){this._map&&b.on("add remove",this._onLayerChange,this),this._layers.push({layer:b,name:a,overlay:c}),this.options.sortLayers&&this._layers.sort(cX(function(e,d){return this.options.sortFunction(e.layer,d.layer,e.name,d.name)},this)),this.options.autoZIndex&&b.setZIndex&&(this._lastZIndex++,b.setZIndex(this._lastZIndex)),this._expandIfNotCollapsed()},_update:function(){if(!this._container){return this}eh(this._baseLayersList),eh(this._overlaysList),this._layerControlInputs=[];var b,a,c,f,d=0;for(c=0;c<this._layers.length;c++){f=this._layers[c],this._addItem(f),a=a||f.overlay,b=b||!f.overlay,d+=f.overlay?0:1}return this.options.hideSingleBase&&(b=b&&1<d,this._baseLayersList.style.display=b?"":"none"),this._separator.style.display=a&&b?"":"none",this},_onLayerChange:function(b){this._handlingClick||this._update();var a=this._getLayer(cs(b.target)),c=a.overlay?"add"===b.type?"overlayadd":"overlayremove":"add"===b.type?"baselayerchange":null;c&&this._map.fire(c,a)},_createRadioElement:function(b,a){var c='<input type="radio" class="leaflet-control-layers-selector" name="'+b+'"'+(a?' checked="checked"':"")+"/>",d=document.createElement("div");return d.innerHTML=c,d.firstChild},_addItem:function(b){var a,d=document.createElement("label"),g=this._map.hasLayer(b.layer);b.overlay?((a=document.createElement("input")).type="checkbox",a.className="leaflet-control-layers-selector",a.defaultChecked=g):a=this._createRadioElement("leaflet-base-layers_"+cs(this),g),this._layerControlInputs.push(a),a.layerId=cs(b.layer),aC(a,"click",this._onInputClick,this);var f=document.createElement("span");f.innerHTML=" "+b.name;var c=document.createElement("div");return d.appendChild(c),c.appendChild(a),c.appendChild(f),(b.overlay?this._overlaysList:this._baseLayersList).appendChild(d),this._checkDisabledLayers(),d},_onInputClick:function(){var b,a,d=this._layerControlInputs,g=[],f=[];this._handlingClick=!0;for(var c=d.length-1;0<=c;c--){b=d[c],a=this._getLayer(b.layerId).layer,b.checked?g.push(a):b.checked||f.push(a)}for(c=0;c<f.length;c++){this._map.hasLayer(f[c])&&this._map.removeLayer(f[c])}for(c=0;c<g.length;c++){this._map.hasLayer(g[c])||this._map.addLayer(g[c])}this._handlingClick=!1,this._refocusOnMap()},_checkDisabledLayers:function(){for(var b,a,c=this._layerControlInputs,f=this._map.getZoom(),d=c.length-1;0<=d;d--){b=c[d],a=this._getLayer(b.layerId).layer,b.disabled=void 0!==a.options.minZoom&&f<a.options.minZoom||void 0!==a.options.maxZoom&&f>a.options.maxZoom}},_expandIfNotCollapsed:function(){return this._map&&!this.options.collapsed&&this.expand(),this},_expand:function(){return this.expand()},_collapse:function(){return this.collapse()}}),aV=aJ.extend({options:{position:"topleft",zoomInText:"+",zoomInTitle:"Zoom in",zoomOutText:"&#x2212;",zoomOutTitle:"Zoom out"},onAdd:function(b){var a="leaflet-control-zoom",c=a6("div",a+" leaflet-bar"),d=this.options;return this._zoomInButton=this._createButton(d.zoomInText,d.zoomInTitle,a+"-in",c,this._zoomIn),this._zoomOutButton=this._createButton(d.zoomOutText,d.zoomOutTitle,a+"-out",c,this._zoomOut),this._updateDisabled(),b.on("zoomend zoomlevelschange",this._updateDisabled,this),c},onRemove:function(a){a.off("zoomend zoomlevelschange",this._updateDisabled,this)},disable:function(){return this._disabled=!0,this._updateDisabled(),this},enable:function(){return this._disabled=!1,this._updateDisabled(),this},_zoomIn:function(a){!this._disabled&&this._map._zoom<this._map.getMaxZoom()&&this._map.zoomIn(this._map.options.zoomDelta*(a.shiftKey?3:1))},_zoomOut:function(a){!this._disabled&&this._map._zoom>this._map.getMinZoom()&&this._map.zoomOut(this._map.options.zoomDelta*(a.shiftKey?3:1))},_createButton:function(b,a,d,g,f){var c=a6("a",d,g);return c.innerHTML=b,c.href="#",c.title=a,c.setAttribute("role","button"),c.setAttribute("aria-label",a),bs(c),aC(c,"click",aE),aC(c,"click",f,this),aC(c,"click",this._refocusOnMap,this),c},_updateDisabled:function(){var b=this._map,a="leaflet-disabled";d0(this._zoomInButton,a),d0(this._zoomOutButton,a),!this._disabled&&b._zoom!==b.getMinZoom()||cf(this._zoomOutButton,a),!this._disabled&&b._zoom!==b.getMaxZoom()||cf(this._zoomInButton,a)}});cP.mergeOptions({zoomControl:!0}),cP.addInitHook(function(){this.options.zoomControl&&(this.zoomControl=new aV,this.addControl(this.zoomControl))});var bX=aJ.extend({options:{position:"bottomleft",maxWidth:100,metric:!0,imperial:!0},onAdd:function(b){var a="leaflet-control-scale",c=a6("div",a),d=this.options;return this._addScales(d,a+"-line",c),b.on(d.updateWhenIdle?"moveend":"move",this._update,this),b.whenReady(this._update,this),c},onRemove:function(a){a.off(this.options.updateWhenIdle?"moveend":"move",this._update,this)},_addScales:function(b,a,c){b.metric&&(this._mScale=a6("div",a,c)),b.imperial&&(this._iScale=a6("div",a,c))},_update:function(){var b=this._map,a=b.getSize().y/2,c=b.distance(b.containerPointToLatLng([0,a]),b.containerPointToLatLng([this.options.maxWidth,a]));this._updateScales(c)},_updateScales:function(a){this.options.metric&&a&&this._updateMetric(a),this.options.imperial&&a&&this._updateImperial(a)},_updateMetric:function(b){var a=this._getRoundNum(b),c=a<1000?a+" m":a/1000+" km";this._updateScale(this._mScale,c,a/b)},_updateImperial:function(b){var a,c,f,d=3.2808399*b;5280<d?(a=d/5280,c=this._getRoundNum(a),this._updateScale(this._iScale,c+" mi",c/a)):(f=this._getRoundNum(d),this._updateScale(this._iScale,f+" ft",f/d))},_updateScale:function(b,a,c){b.style.width=Math.round(this.options.maxWidth*c)+"px",b.innerHTML=a},_getRoundNum:function(b){var a=Math.pow(10,(Math.floor(b)+"").length-1),c=b/a;return a*(c=10<=c?10:5<=c?5:3<=c?3:2<=c?2:1)}}),dL=aJ.extend({options:{position:"bottomright",prefix:'<a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'},initialize:function(a){cz(this,a),this._attributions={}},onAdd:function(b){for(var a in (b.attributionControl=this)._container=a6("div","leaflet-control-attribution"),bs(this._container),b._layers){b._layers[a].getAttribution&&this.addAttribution(b._layers[a].getAttribution())}return this._update(),this._container},setPrefix:function(a){return this.options.prefix=a,this._update(),this},addAttribution:function(a){return a&&(this._attributions[a]||(this._attributions[a]=0),this._attributions[a]++,this._update()),this},removeAttribution:function(a){return a&&this._attributions[a]&&(this._attributions[a]--,this._update()),this},_update:function(){if(this._map){var b=[];for(var a in this._attributions){this._attributions[a]&&b.push(a)}var c=[];this.options.prefix&&c.push(this.options.prefix),b.length&&c.push(b.join(", ")),this._container.innerHTML=c.join(" | ")}}});cP.mergeOptions({attributionControl:!0}),cP.addInitHook(function(){this.options.attributionControl&&(new dL).addTo(this)});aJ.Layers=bf,aJ.Zoom=aV,aJ.Scale=bX,aJ.Attribution=dL,dw.layers=function(b,a,c){return new bf(b,a,c)},dw.zoom=function(a){return new aV(a)},dw.scale=function(a){return new bX(a)},dw.attribution=function(a){return new dL(a)};var cY=c1.extend({initialize:function(a){this._map=a},enable:function(){return this._enabled||(this._enabled=!0,this.addHooks()),this},disable:function(){return this._enabled&&(this._enabled=!1,this.removeHooks()),this},enabled:function(){return !!this._enabled}});cY.addTo=function(b,a){return b.addHandler(a,this),this};var bx,bO={Events:dC},dW=dZ?"touchstart mousedown":"mousedown",a9={mousedown:"mouseup",touchstart:"touchend",pointerdown:"touchend",MSPointerDown:"touchend"},a0={mousedown:"mousemove",touchstart:"touchmove",pointerdown:"touchmove",MSPointerDown:"touchmove"},el=cH.extend({options:{clickTolerance:3},initialize:function(b,a,c,d){cz(this,d),this._element=b,this._dragStartTarget=a||b,this._preventOutline=c},enable:function(){this._enabled||(aC(this._dragStartTarget,dW,this._onDown,this),this._enabled=!0)},disable:function(){this._enabled&&(el._dragging===this&&this.finishDrag(),bk(this._dragStartTarget,dW,this._onDown,this),this._enabled=!1,this._moved=!1)},_onDown:function(b){if(!b._simulated&&this._enabled&&(this._moved=!1,!b8(this._element,"leaflet-zoom-anim")&&!(el._dragging||b.shiftKey||1!==b.which&&1!==b.button&&!b.touches||((el._dragging=this)._preventOutline&&dP(this._element),dk(),dc(),this._moving)))){this.fire("down");var a=b.touches?b.touches[0]:b,c=a4(this._element);this._startPoint=new dJ(a.clientX,a.clientY),this._parentScale=aa(c),aC(document,a0[b.type],this._onMove,this),aC(document,a9[b.type],this._onUp,this)}},_onMove:function(b){if(!b._simulated&&this._enabled){if(b.touches&&1<b.touches.length){this._moved=!0}else{var a=b.touches&&1===b.touches.length?b.touches[0]:b,c=new dJ(a.clientX,a.clientY)._subtract(this._startPoint);(c.x||c.y)&&(Math.abs(c.x)+Math.abs(c.y)<this.options.clickTolerance||(c.x/=this._parentScale.x,c.y/=this._parentScale.y,aP(b),this._moved||(this.fire("dragstart"),this._moved=!0,this._startPos=aX(this._element).subtract(c),cf(document.body,"leaflet-dragging"),this._lastTarget=b.target||b.srcElement,window.SVGElementInstance&&this._lastTarget instanceof SVGElementInstance&&(this._lastTarget=this._lastTarget.correspondingUseElement),cf(this._lastTarget,"leaflet-drag-target")),this._newPos=this._startPos.add(c),this._moving=!0,dH(this._animRequest),this._lastEvent=b,this._animRequest=dp(this._updatePosition,this,!0)))}}},_updatePosition:function(){var a={originalEvent:this._lastEvent};this.fire("predrag",a),ax(this._element,this._newPos),this.fire("drag",a)},_onUp:function(a){!a._simulated&&this._enabled&&this.finishDrag()},finishDrag:function(){for(var a in d0(document.body,"leaflet-dragging"),this._lastTarget&&(d0(this._lastTarget,"leaflet-drag-target"),this._lastTarget=null),a0){bk(document,a0[a],this._onMove,this),bk(document,a9[a],this._onUp,this)}d7(),aD(),this._moved&&this._moving&&(dH(this._animRequest),this.fire("dragend",{distance:this._newPos.distanceTo(this._startPos)})),this._moving=!1,el._dragging=!1}});function cI(b,a){if(!a||!b.length){return b.slice()}var c=a*a;return b=function(f,d){var h=f.length,k=new (typeof Uint8Array!=void 0+""?Uint8Array:Array)(h);k[0]=k[h-1]=1,function f(q,v,p,m,y){var l,w,t,x=0;for(w=m+1;w<=y-1;w++){t=bI(q[w],q[m],q[y],!0),x<t&&(l=w,x=t)}p<x&&(v[l]=1,f(q,v,p,m,l),f(q,v,p,l,y))}(f,k,d,0,h-1);var j,g=[];for(j=0;j<h;j++){k[j]&&g.push(f[j])}return g}(b=function(q,j){for(var l=[q[0]],g=1,f=0,v=q.length;g<v;g++){d=q[g],m=q[f],void 0,k=m.x-d.x,p=m.y-d.y,j<k*k+p*p&&(l.push(q[g]),f=g)}var d,m,k,p;f<v-1&&l.push(q[v-1]);return l}(b,c),c)}function al(b,a,c){return Math.sqrt(bI(b,a,c,!0))}function ca(m,f,j,d,c){var p,b,k,g=d?bx:d5(m,j),l=d5(f,j);for(bx=l;;){if(!(g|l)){return[m,f]}if(g&l){return !1}k=d5(b=ch(m,f,p=g||l,j,c),j),p===g?(m=b,g=k):(f=b,l=k)}}function ch(q,g,k,d,c){var v,b,m=g.x-q.x,j=g.y-q.y,p=d.min,f=d.max;return 8&k?(v=q.x+m*(f.y-q.y)/j,b=f.y):4&k?(v=q.x+m*(p.y-q.y)/j,b=p.y):2&k?(v=f.x,b=q.y+j*(f.x-q.x)/m):1&k&&(v=p.x,b=q.y+j*(p.x-q.x)/m),new dJ(v,b,c)}function d5(b,a){var c=0;return b.x<a.min.x?c|=1:b.x>a.max.x&&(c|=2),b.y<a.min.y?c|=4:b.y>a.max.y&&(c|=8),c}function bI(m,f,j,d){var c,p=f.x,b=f.y,k=j.x-p,g=j.y-b,l=k*k+g*g;return 0<l&&(1<(c=((m.x-p)*k+(m.y-b)*g)/l)?(p=j.x,b=j.y):0<c&&(p+=k*c,b+=g*c)),k=m.x-p,g=m.y-b,d?k*k+g*g:new dJ(p,b)}function bq(a){return !cq(a[0])||"object"!=typeof a[0][0]&&void 0!==a[0][0]}function aM(a){return console.warn("Deprecated use of _flat, please use L.LineUtil.isFlat instead."),bq(a)}var ea=(Object.freeze||Object)({simplify:cI,pointToSegmentDistance:al,closestPointOnSegment:function(b,a,c){return bI(b,a,c)},clipSegment:ca,_getEdgeIntersection:ch,_getBitCode:d5,_sqClosestPointOnSegment:bI,isFlat:bq,_flat:aM});function ag(x,j,m){var f,d,y,b,q,k,w,g,p,v=[1,4,2,8];for(d=0,w=x.length;d<w;d++){x[d]._code=d5(x[d],j)}for(b=0;b<4;b++){for(g=v[b],f=[],d=0,y=(w=x.length)-1;d<w;y=d++){q=x[d],k=x[y],q._code&g?k._code&g||((p=ch(k,q,g,j,m))._code=d5(p,j),f.push(p)):(k._code&g&&((p=ch(k,q,g,j,m))._code=d5(p,j),f.push(p)),f.push(q))}x=f}return x}var az,aZ=(Object.freeze||Object)({clipPolygon:ag}),b1={project:function(a){return new dJ(a.lng,a.lat)},unproject:function(a){return new cJ(a.y,a.x)},bounds:new dj([-180,-90],[180,90])},dq={R:6378137,R_MINOR:6356752.314245179,bounds:new dj([-20037508.34279,-15496570.73972],[20037508.34279,18764656.23138]),project:function(d){var c=Math.PI/180,h=this.R,k=d.lat*c,j=this.R_MINOR/h,f=Math.sqrt(1-j*j),g=f*Math.sin(k),b=Math.tan(Math.PI/4-k/2)/Math.pow((1-g)/(1+g),f/2);return k=-h*Math.log(Math.max(b,1e-10)),new dJ(d.lng*c*h,k)},unproject:function(m){for(var f,j=180/Math.PI,d=this.R,c=this.R_MINOR/d,p=Math.sqrt(1-c*c),b=Math.exp(-m.y/d),k=Math.PI/2-2*Math.atan(b),g=0,l=0.1;g<15&&1e-7<Math.abs(l);g++){f=p*Math.sin(k),f=Math.pow((1-f)/(1+f),p/2),k+=l=Math.PI/2-2*Math.atan(b*f)-k}return new cJ(k*j,m.x*j/d)}},d9=(Object.freeze||Object)({LonLat:b1,Mercator:dq,SphericalMercator:cy}),dS=cM({},c8,{code:"EPSG:3395",projection:dq,transformation:(az=0.5/(Math.PI*dq.R),dr(az,0.5,-az,0.5))}),bN=cM({},c8,{code:"EPSG:4326",projection:b1,transformation:dr(1/180,1,-1/180,0.5)}),a8=cM({},dz,{projection:b1,transformation:dr(1,0,-1,0),scale:function(a){return Math.pow(2,a)},zoom:function(a){return Math.log(a)/Math.LN2},distance:function(b,a){var c=a.lng-b.lng,d=a.lat-b.lat;return Math.sqrt(c*c+d*d)},infinite:!0});dz.Earth=c8,dz.EPSG3395=dS,dz.EPSG3857=c4,dz.EPSG900913=ds,dz.EPSG4326=bN,dz.Simple=a8;var ad=cH.extend({options:{pane:"overlayPane",attribution:null,bubblingMouseEvents:!0},addTo:function(a){return a.addLayer(this),this},remove:function(){return this.removeFrom(this._map||this._mapToAdd)},removeFrom:function(a){return a&&a.removeLayer(this),this},getPane:function(a){return this._map.getPane(a?this.options[a]||a:this.options.pane)},addInteractiveTarget:function(a){return this._map._targets[cs(a)]=this},removeInteractiveTarget:function(a){return delete this._map._targets[cs(a)],this},getAttribution:function(){return this.options.attribution},_layerAdd:function(b){var a=b.target;if(a.hasLayer(this)){if(this._map=a,this._zoomAnimated=a._zoomAnimated,this.getEvents){var c=this.getEvents();a.on(c,this),this.once("remove",function(){a.off(c,this)},this)}this.onAdd(a),this.getAttribution&&a.attributionControl&&a.attributionControl.addAttribution(this.getAttribution()),this.fire("add"),a.fire("layeradd",{layer:this})}}});cP.include({addLayer:function(b){if(!b._layerAdd){throw new Error("The provided object is not a Layer.")}var a=cs(b);return this._layers[a]||((this._layers[a]=b)._mapToAdd=this,b.beforeAdd&&b.beforeAdd(this),this.whenReady(b._layerAdd,b)),this},removeLayer:function(b){var a=cs(b);return this._layers[a]&&(this._loaded&&b.onRemove(this),b.getAttribution&&this.attributionControl&&this.attributionControl.removeAttribution(b.getAttribution()),delete this._layers[a],this._loaded&&(this.fire("layerremove",{layer:b}),b.fire("remove")),b._map=b._mapToAdd=null),this},hasLayer:function(a){return !!a&&cs(a) in this._layers},eachLayer:function(b,a){for(var c in this._layers){b.call(a,this._layers[c])}return this},_addLayers:function(b){for(var a=0,c=(b=b?cq(b)?b:[b]:[]).length;a<c;a++){this.addLayer(b[a])}},_addZoomLimit:function(a){!isNaN(a.options.maxZoom)&&isNaN(a.options.minZoom)||(this._zoomBoundLayers[cs(a)]=a,this._updateZoomLevels())},_removeZoomLimit:function(b){var a=cs(b);this._zoomBoundLayers[a]&&(delete this._zoomBoundLayers[a],this._updateZoomLevels())},_updateZoomLevels:function(){var b=1/0,a=-1/0,c=this._getZoomSpan();for(var f in this._zoomBoundLayers){var d=this._zoomBoundLayers[f].options;b=void 0===d.minZoom?b:Math.min(b,d.minZoom),a=void 0===d.maxZoom?a:Math.max(a,d.maxZoom)}this._layersMaxZoom=a===-1/0?void 0:a,this._layersMinZoom=b===1/0?void 0:b,c!==this._getZoomSpan()&&this.fire("zoomlevelschange"),void 0===this.options.maxZoom&&this._layersMaxZoom&&this.getZoom()>this._layersMaxZoom&&this.setZoom(this._layersMaxZoom),void 0===this.options.minZoom&&this._layersMinZoom&&this.getZoom()<this._layersMinZoom&&this.setZoom(this._layersMinZoom)}});var bB=ad.extend({initialize:function(b,a){var c,d;if(cz(this,a),this._layers={},b){for(c=0,d=b.length;c<d;c++){this.addLayer(b[c])}}},addLayer:function(b){var a=this.getLayerId(b);return this._layers[a]=b,this._map&&this._map.addLayer(b),this},removeLayer:function(b){var a=b in this._layers?b:this.getLayerId(b);return this._map&&this._layers[a]&&this._map.removeLayer(this._layers[a]),delete this._layers[a],this},hasLayer:function(a){return !!a&&(a in this._layers||this.getLayerId(a) in this._layers)},clearLayers:function(){return this.eachLayer(this.removeLayer,this)},invoke:function(b){var a,c,d=Array.prototype.slice.call(arguments,1);for(a in this._layers){(c=this._layers[a])[b]&&c[b].apply(c,d)}return this},onAdd:function(a){this.eachLayer(a.addLayer,a)},onRemove:function(a){this.eachLayer(a.removeLayer,a)},eachLayer:function(b,a){for(var c in this._layers){b.call(a,this._layers[c])}return this},getLayer:function(a){return this._layers[a]},getLayers:function(){var a=[];return this.eachLayer(a.push,a),a},setZIndex:function(a){return this.invoke("setZIndex",a)},getLayerId:function(a){return cs(a)}}),aG=bB.extend({addLayer:function(a){return this.hasLayer(a)?this:(a.addEventParent(this),bB.prototype.addLayer.call(this,a),this.fire("layeradd",{layer:a}))},removeLayer:function(a){return this.hasLayer(a)?(a in this._layers&&(a=this._layers[a]),a.removeEventParent(this),bB.prototype.removeLayer.call(this,a),this.fire("layerremove",{layer:a})):this},setStyle:function(a){return this.invoke("setStyle",a)},bringToFront:function(){return this.invoke("bringToFront")},bringToBack:function(){return this.invoke("bringToBack")},getBounds:function(){var b=new dm;for(var a in this._layers){var c=this._layers[a];b.extend(c.getBounds?c.getBounds():c.getLatLng())}return b}}),au=c1.extend({options:{popupAnchor:[0,0],tooltipAnchor:[0,0]},initialize:function(a){cz(this,a)},createIcon:function(a){return this._createIcon("icon",a)},createShadow:function(a){return this._createIcon("shadow",a)},_createIcon:function(b,a){var c=this._getIconUrl(b);if(!c){if("icon"===b){throw new Error("iconUrl not set in Icon options (see the docs).")}return null}var d=this._createImg(c,a&&"IMG"===a.tagName?a:null);return this._setIconStyles(d,b),d},_setIconStyles:function(b,a){var d=this.options,g=d[a+"Size"];"number"==typeof g&&(g=[g,g]);var f=dv(g),c=dv("shadow"===a&&d.shadowAnchor||d.iconAnchor||f&&f.divideBy(2,!0));b.className="leaflet-marker-"+a+" "+(d.className||""),c&&(b.style.marginLeft=-c.x+"px",b.style.marginTop=-c.y+"px"),f&&(b.style.width=f.x+"px",b.style.height=f.y+"px")},_createImg:function(b,a){return(a=a||document.createElement("img")).src=b,a},_getIconUrl:function(a){return a1&&this.options[a+"RetinaUrl"]||this.options[a+"Url"]}});var bp=au.extend({options:{iconUrl:"marker-icon.png",iconRetinaUrl:"marker-icon-2x.png",shadowUrl:"marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],tooltipAnchor:[16,-28],shadowSize:[41,41]},_getIconUrl:function(a){return bp.imagePath||(bp.imagePath=this._detectIconPath()),(this.options.imagePath||bp.imagePath)+au.prototype._getIconUrl.call(this,a)},_detectIconPath:function(){var b=a6("div","leaflet-default-icon-path",document.body),a=dU(b,"background-image")||dU(b,"backgroundImage");return document.body.removeChild(b),a=null===a||0!==a.indexOf("url")?"":a.replace(/^url\(["']?/,"").replace(/marker-icon\.png["']?\)$/,"")}}),bH=cY.extend({initialize:function(a){this._marker=a},addHooks:function(){var a=this._marker._icon;this._draggable||(this._draggable=new el(a,a,!0)),this._draggable.on({dragstart:this._onDragStart,predrag:this._onPreDrag,drag:this._onDrag,dragend:this._onDragEnd},this).enable(),cf(a,"leaflet-marker-draggable")},removeHooks:function(){this._draggable.off({dragstart:this._onDragStart,predrag:this._onPreDrag,drag:this._onDrag,dragend:this._onDragEnd},this).disable(),this._marker._icon&&d0(this._marker._icon,"leaflet-marker-draggable")},moved:function(){return this._draggable&&this._draggable._moved},_adjustPan:function(m){var f=this._marker,j=f._map,d=this._marker.options.autoPanSpeed,c=this._marker.options.autoPanPadding,p=aX(f._icon),b=j.getPixelBounds(),k=j.getPixelOrigin(),g=dd(b.min._subtract(k).add(c),b.max._subtract(k).subtract(c));if(!g.contains(p)){var l=dv((Math.max(g.max.x,p.x)-g.max.x)/(b.max.x-g.max.x)-(Math.min(g.min.x,p.x)-g.min.x)/(b.min.x-g.min.x),(Math.max(g.max.y,p.y)-g.max.y)/(b.max.y-g.max.y)-(Math.min(g.min.y,p.y)-g.min.y)/(b.min.y-g.min.y)).multiplyBy(d);j.panBy(l,{animate:!1}),this._draggable._newPos._add(l),this._draggable._startPos._add(l),ax(f._icon,this._draggable._newPos),this._onDrag(m),this._panRequest=dp(this._adjustPan.bind(this,m))}},_onDragStart:function(){this._oldLatLng=this._marker.getLatLng(),this._marker.closePopup().fire("movestart").fire("dragstart")},_onPreDrag:function(a){this._marker.options.autoPan&&(dH(this._panRequest),this._panRequest=dp(this._adjustPan.bind(this,a)))},_onDrag:function(b){var a=this._marker,c=a._shadow,f=aX(a._icon),d=a._map.layerPointToLatLng(f);c&&ax(c,f),a._latlng=d,b.latlng=d,b.oldLatLng=this._oldLatLng,a.fire("move",b).fire("drag",b)},_onDragEnd:function(a){dH(this._panRequest),delete this._oldLatLng,this._marker.fire("moveend").fire("dragend",a)}}),dI=ad.extend({options:{icon:new bp,interactive:!0,keyboard:!0,title:"",alt:"",zIndexOffset:0,opacity:1,riseOnHover:!1,riseOffset:250,pane:"markerPane",shadowPane:"shadowPane",bubblingMouseEvents:!1,draggable:!1,autoPan:!1,autoPanPadding:[50,50],autoPanSpeed:10},initialize:function(b,a){cz(this,a),this._latlng=c5(b)},onAdd:function(a){this._zoomAnimated=this._zoomAnimated&&a.options.markerZoomAnimation,this._zoomAnimated&&a.on("zoomanim",this._animateZoom,this),this._initIcon(),this.update()},onRemove:function(a){this.dragging&&this.dragging.enabled()&&(this.options.draggable=!0,this.dragging.removeHooks()),delete this.dragging,this._zoomAnimated&&a.off("zoomanim",this._animateZoom,this),this._removeIcon(),this._removeShadow()},getEvents:function(){return{zoom:this.update,viewreset:this.update}},getLatLng:function(){return this._latlng},setLatLng:function(b){var a=this._latlng;return this._latlng=c5(b),this.update(),this.fire("move",{oldLatLng:a,latlng:this._latlng})},setZIndexOffset:function(a){return this.options.zIndexOffset=a,this.update()},getIcon:function(){return this.options.icon},setIcon:function(a){return this.options.icon=a,this._map&&(this._initIcon(),this.update()),this._popup&&this.bindPopup(this._popup,this._popup.options),this},getElement:function(){return this._icon},update:function(){if(this._icon&&this._map){var a=this._map.latLngToLayerPoint(this._latlng).round();this._setPos(a)}return this},_initIcon:function(){var b=this.options,a="leaflet-zoom-"+(this._zoomAnimated?"animated":"hide"),d=b.icon.createIcon(this._icon),g=!1;d!==this._icon&&(this._icon&&this._removeIcon(),g=!0,b.title&&(d.title=b.title),"IMG"===d.tagName&&(d.alt=b.alt||"")),cf(d,a),b.keyboard&&(d.tabIndex="0"),this._icon=d,b.riseOnHover&&this.on({mouseover:this._bringToFront,mouseout:this._resetZIndex});var f=b.icon.createShadow(this._shadow),c=!1;f!==this._shadow&&(this._removeShadow(),c=!0),f&&(cf(f,a),f.alt=""),this._shadow=f,b.opacity<1&&this._updateOpacity(),g&&this.getPane().appendChild(this._icon),this._initInteraction(),f&&c&&this.getPane(b.shadowPane).appendChild(this._shadow)},_removeIcon:function(){this.options.riseOnHover&&this.off({mouseover:this._bringToFront,mouseout:this._resetZIndex}),aY(this._icon),this.removeInteractiveTarget(this._icon),this._icon=null},_removeShadow:function(){this._shadow&&aY(this._shadow),this._shadow=null},_setPos:function(a){ax(this._icon,a),this._shadow&&ax(this._shadow,a),this._zIndex=a.y+this.options.zIndexOffset,this._resetZIndex()},_updateZIndex:function(a){this._icon.style.zIndex=this._zIndex+a},_animateZoom:function(b){var a=this._map._latLngToNewLayerPoint(this._latlng,b.zoom,b.center).round();this._setPos(a)},_initInteraction:function(){if(this.options.interactive&&(cf(this._icon,"leaflet-interactive"),this.addInteractiveTarget(this._icon),bH)){var a=this.options.draggable;this.dragging&&(a=this.dragging.enabled(),this.dragging.disable()),this.dragging=new bH(this),a&&this.dragging.enable()}},setOpacity:function(a){return this.options.opacity=a,this._map&&this._updateOpacity(),this},_updateOpacity:function(){var a=this.options.opacity;this._icon&&aK(this._icon,a),this._shadow&&aK(this._shadow,a)},_bringToFront:function(){this._updateZIndex(this.options.riseOffset)},_resetZIndex:function(){this._updateZIndex(0)},_getPopupAnchor:function(){return this.options.icon.options.popupAnchor},_getTooltipAnchor:function(){return this.options.icon.options.tooltipAnchor}});var bd=ad.extend({options:{stroke:!0,color:"#3388ff",weight:3,opacity:1,lineCap:"round",lineJoin:"round",dashArray:null,dashOffset:null,fill:!1,fillColor:null,fillOpacity:0.2,fillRule:"evenodd",interactive:!0,bubblingMouseEvents:!0},beforeAdd:function(a){this._renderer=a.getRenderer(this)},onAdd:function(){this._renderer._initPath(this),this._reset(),this._renderer._addPath(this)},onRemove:function(){this._renderer._removePath(this)},redraw:function(){return this._map&&this._renderer._updatePath(this),this},setStyle:function(a){return cz(this,a),this._renderer&&(this._renderer._updateStyle(this),this.options.stroke&&a.hasOwnProperty("weight")&&this._updateBounds()),this},bringToFront:function(){return this._renderer&&this._renderer._bringToFront(this),this},bringToBack:function(){return this._renderer&&this._renderer._bringToBack(this),this},getElement:function(){return this._path},_reset:function(){this._project(),this._update()},_clickTolerance:function(){return(this.options.stroke?this.options.weight/2:0)+this._renderer.options.tolerance}}),ay=bd.extend({options:{fill:!0,radius:10},initialize:function(b,a){cz(this,a),this._latlng=c5(b),this._radius=this.options.radius},setLatLng:function(a){return this._latlng=c5(a),this.redraw(),this.fire("move",{latlng:this._latlng})},getLatLng:function(){return this._latlng},setRadius:function(a){return this.options.radius=this._radius=a,this.redraw()},getRadius:function(){return this._radius},setStyle:function(b){var a=b&&b.radius||this._radius;return bd.prototype.setStyle.call(this,b),this.setRadius(a),this},_project:function(){this._point=this._map.latLngToLayerPoint(this._latlng),this._updateBounds()},_updateBounds:function(){var b=this._radius,a=this._radiusY||b,c=this._clickTolerance(),d=[b+c,a+c];this._pxBounds=new dj(this._point.subtract(d),this._point.add(d))},_update:function(){this._map&&this._updatePath()},_updatePath:function(){this._renderer._updateCircle(this)},_empty:function(){return this._radius&&!this._renderer._bounds.intersects(this._pxBounds)},_containsPoint:function(a){return a.distanceTo(this._point)<=this._radius+this._clickTolerance()}});var bw=ay.extend({initialize:function(b,a,c){if("number"==typeof a&&(a=cM({},c,{radius:a})),cz(this,a),this._latlng=c5(b),isNaN(this.options.radius)){throw new Error("Circle radius cannot be NaN")}this._mRadius=this.options.radius},setRadius:function(a){return this._mRadius=a,this.redraw()},getRadius:function(){return this._mRadius},getBounds:function(){var a=[this._radius,this._radiusY||this._radius];return new dm(this._map.layerPointToLatLng(this._point.subtract(a)),this._map.layerPointToLatLng(this._point.add(a)))},setStyle:bd.prototype.setStyle,_project:function(){var w=this._latlng.lng,j=this._latlng.lat,m=this._map,f=m.options.crs;if(f.distance===c8.distance){var d=Math.PI/180,x=this._mRadius/c8.R/d,b=m.project([j+x,w]),q=m.project([j-x,w]),k=b.add(q).divideBy(2),v=m.unproject(k).lat,g=Math.acos((Math.cos(x*d)-Math.sin(j*d)*Math.sin(v*d))/(Math.cos(j*d)*Math.cos(v*d)))/d;!isNaN(g)&&0!==g||(g=x/Math.cos(Math.PI/180*j)),this._point=k.subtract(m.getPixelOrigin()),this._radius=isNaN(g)?0:k.x-m.project([v,w-g]).x,this._radiusY=k.y-b.y}else{var p=f.unproject(f.project(this._latlng).subtract([this._mRadius,0]));this._point=m.latLngToLayerPoint(this._latlng),this._radius=this._point.x-m.latLngToLayerPoint(p).x}this._updateBounds()}});var aT=bd.extend({options:{smoothFactor:1,noClip:!1},initialize:function(b,a){cz(this,a),this._setLatLngs(b)},getLatLngs:function(){return this._latlngs},setLatLngs:function(a){return this._setLatLngs(a),this.redraw()},isEmpty:function(){return !this._latlngs.length},closestLayerPoint:function(w){for(var j,m,f=1/0,d=null,x=bI,b=0,q=this._parts.length;b<q;b++){for(var k=this._parts[b],v=1,g=k.length;v<g;v++){var p=x(w,j=k[v-1],m=k[v],!0);p<f&&(f=p,d=x(w,j,m))}}return d&&(d.distance=Math.sqrt(f)),d},getCenter:function(){if(!this._map){throw new Error("Must add layer to map before using getCenter()")}var l,f,j,d,c,m,b,k=this._rings[0],g=k.length;if(!g){return null}for(f=l=0;l<g-1;l++){f+=k[l].distanceTo(k[l+1])/2}if(0===f){return this._map.layerPointToLatLng(k[0])}for(d=l=0;l<g-1;l++){if(c=k[l],m=k[l+1],f<(d+=j=c.distanceTo(m))){return b=(d-f)/j,this._map.layerPointToLatLng([m.x-b*(m.x-c.x),m.y-b*(m.y-c.y)])}}},getBounds:function(){return this._bounds},addLatLng:function(b,a){return a=a||this._defaultShape(),b=c5(b),a.push(b),this._bounds.extend(b),this.redraw()},_setLatLngs:function(a){this._bounds=new dm,this._latlngs=this._convertLatLngs(a)},_defaultShape:function(){return bq(this._latlngs)?this._latlngs:this._latlngs[0]},_convertLatLngs:function(b){for(var a=[],c=bq(b),f=0,d=b.length;f<d;f++){c?(a[f]=c5(b[f]),this._bounds.extend(a[f])):a[f]=this._convertLatLngs(b[f])}return a},_project:function(){var a=new dj;this._rings=[],this._projectLatlngs(this._latlngs,this._rings,a),this._bounds.isValid()&&a.isValid()&&(this._rawPxBounds=a,this._updateBounds())},_updateBounds:function(){var b=this._clickTolerance(),a=new dJ(b,b);this._pxBounds=new dj([this._rawPxBounds.min.subtract(a),this._rawPxBounds.max.add(a)])},_projectLatlngs:function(b,a,f){var h,g,c=b[0] instanceof cJ,d=b.length;if(c){for(g=[],h=0;h<d;h++){g[h]=this._map.latLngToLayerPoint(b[h]),f.extend(g[h])}a.push(g)}else{for(h=0;h<d;h++){this._projectLatlngs(b[h],a,f)}}},_clipPoints:function(){var l=this._renderer._bounds;if(this._parts=[],this._pxBounds&&this._pxBounds.intersects(l)){if(this.options.noClip){this._parts=this._rings}else{var f,j,d,c,m,b,k,g=this._parts;for(d=f=0,c=this._rings.length;f<c;f++){for(j=0,m=(k=this._rings[f]).length;j<m-1;j++){(b=ca(k[j],k[j+1],l,j,!0))&&(g[d]=g[d]||[],g[d].push(b[0]),b[1]===k[j+1]&&j!==m-2||(g[d].push(b[1]),d++))}}}}},_simplifyPoints:function(){for(var b=this._parts,a=this.options.smoothFactor,c=0,d=b.length;c<d;c++){b[c]=cI(b[c],a)}},_update:function(){this._map&&(this._clipPoints(),this._simplifyPoints(),this._updatePath())},_updatePath:function(){this._renderer._updatePoly(this)},_containsPoint:function(l,f){var j,d,c,m,b,k,g=this._clickTolerance();if(!this._pxBounds||!this._pxBounds.contains(l)){return !1}for(j=0,m=this._parts.length;j<m;j++){for(d=0,c=(b=(k=this._parts[j]).length)-1;d<b;c=d++){if((f||0!==d)&&al(l,k[c],k[d])<=g){return !0}}}return !1}});aT._flat=aM;var aH=aT.extend({options:{fill:!0},isEmpty:function(){return !this._latlngs.length||!this._latlngs[0].length},getCenter:function(){if(!this._map){throw new Error("Must add layer to map before using getCenter()")}var q,g,k,d,c,v,b,m,j,p=this._rings[0],f=p.length;if(!f){return null}for(v=b=m=0,q=0,g=f-1;q<f;g=q++){k=p[q],d=p[g],c=k.y*d.x-d.y*k.x,b+=(k.x+d.x)*c,m+=(k.y+d.y)*c,v+=3*c}return j=0===v?p[0]:[b/v,m/v],this._map.layerPointToLatLng(j)},_convertLatLngs:function(b){var a=aT.prototype._convertLatLngs.call(this,b),c=a.length;return 2<=c&&a[0] instanceof cJ&&a[0].equals(a[c-1])&&a.pop(),a},_setLatLngs:function(a){aT.prototype._setLatLngs.call(this,a),bq(this._latlngs)&&(this._latlngs=[this._latlngs])},_defaultShape:function(){return bq(this._latlngs[0])?this._latlngs[0]:this._latlngs[0][0]},_clipPoints:function(){var b=this._renderer._bounds,a=this.options.weight,d=new dJ(a,a);if(b=new dj(b.min.subtract(d),b.max.add(d)),this._parts=[],this._pxBounds&&this._pxBounds.intersects(b)){if(this.options.noClip){this._parts=this._rings}else{for(var g,f=0,c=this._rings.length;f<c;f++){(g=ag(this._rings[f],b,!0)).length&&this._parts.push(g)}}}},_updatePath:function(){this._renderer._updatePoly(this,!0)},_containsPoint:function(m){var f,j,d,c,p,b,k,g,l=!1;if(!this._pxBounds||!this._pxBounds.contains(m)){return !1}for(c=0,k=this._parts.length;c<k;c++){for(p=0,b=(g=(f=this._parts[c]).length)-1;p<g;b=p++){j=f[p],d=f[b],j.y>m.y!=d.y>m.y&&m.x<(d.x-j.x)*(m.y-j.y)/(d.y-j.y)+j.x&&(l=!l)}}return l||aT.prototype._containsPoint.call(this,m,!0)}});var cr=aG.extend({initialize:function(b,a){cz(this,a),this._layers={},b&&this.addData(b)},addData:function(b){var a,f,h,g=cq(b)?b:b.features;if(g){for(a=0,f=g.length;a<f;a++){((h=g[a]).geometries||h.geometry||h.features||h.coordinates)&&this.addData(h)}return this}var c=this.options;if(c.filter&&!c.filter(b)){return this}var d=d3(b,c);return d?(d.feature=cg(b),d.defaultOptions=d.options,this.resetStyle(d),c.onEachFeature&&c.onEachFeature(b,d),this.addLayer(d)):this},resetStyle:function(a){return a.options=cM({},a.defaultOptions),this._setLayerStyle(a,this.options.style),this},setStyle:function(a){return this.eachLayer(function(b){this._setLayerStyle(b,a)},this)},_setLayerStyle:function(b,a){b.setStyle&&("function"==typeof a&&(a=a(b.feature)),b.setStyle(a))}});function d3(w,j){var m,f,d,x,b="Feature"===w.type?w.geometry:w,q=b?b.coordinates:null,k=[],v=j&&j.pointToLayer,g=j&&j.coordsToLatLng||ar;if(!q&&!b){return null}switch(b.type){case"Point":return m=g(q),v?v(w,m):new dI(m);case"MultiPoint":for(d=0,x=q.length;d<x;d++){m=g(q[d]),k.push(v?v(w,m):new dI(m))}return new aG(k);case"LineString":case"MultiLineString":return f=dQ(q,"LineString"===b.type?0:1,g),new aT(f,j);case"Polygon":case"MultiPolygon":return f=dQ(q,"Polygon"===b.type?1:2,g),new aH(f,j);case"GeometryCollection":for(d=0,x=b.geometries.length;d<x;d++){var p=d3({geometry:b.geometries[d],type:"Feature",properties:w.properties},j);p&&k.push(p)}return new aG(k);default:throw new Error("Invalid GeoJSON object.")}}function ar(a){return new cJ(a[1],a[0],a[2])}function dQ(b,a,f){for(var h,g=[],c=0,d=b.length;c<d;c++){h=a?dQ(b[c],a-1,f):(f||ar)(b[c]),g.push(h)}return g}function c6(b,a){return a="number"==typeof a?a:6,void 0!==b.alt?[cT(b.lng,a),cT(b.lat,a),cT(b.alt,a)]:[cT(b.lng,a),cT(b.lat,a)]}function b2(b,a,f,h){for(var g=[],c=0,d=b.length;c<d;c++){g.push(a?b2(b[c],a-1,f,h):c6(b[c],h))}return !a&&f&&g.push(g[0]),g}function ek(b,a){return b.feature?cM({},b.feature,{geometry:a}):cg(a)}function cg(a){return"Feature"===a.type||"FeatureCollection"===a.type?a:{type:"Feature",properties:{},geometry:a}}var bR={toGeoJSON:function(a){return ek(this,{type:"Point",coordinates:c6(this.getLatLng(),a)})}};function b5(b,a){return new cr(b,a)}dI.include(bR),bw.include(bR),ay.include(bR),aT.include({toGeoJSON:function(b){var a=!bq(this._latlngs);return ek(this,{type:(a?"Multi":"")+"LineString",coordinates:b2(this._latlngs,a?1:0,!1,b)})}}),aH.include({toGeoJSON:function(b){var a=!bq(this._latlngs),c=a&&!bq(this._latlngs[0]),d=b2(this._latlngs,c?2:a?1:0,!0,b);return a||(d=[d]),ek(this,{type:(c?"Multi":"")+"Polygon",coordinates:d})}}),bB.include({toMultiPoint:function(a){var b=[];return this.eachLayer(function(c){b.push(c.toGeoJSON(a).geometry.coordinates)}),ek(this,{type:"MultiPoint",coordinates:b})},toGeoJSON:function(d){var a=this.feature&&this.feature.geometry&&this.feature.geometry.type;if("MultiPoint"===a){return this.toMultiPoint(d)}var c="GeometryCollection"===a,b=[];return this.eachLayer(function(g){if(g.toGeoJSON){var f=g.toGeoJSON(d);if(c){b.push(f.geometry)}else{var h=cg(f);"FeatureCollection"===h.type?b.push.apply(b,h.features):b.push(h)}}}),c?ek(this,{geometries:b,type:"GeometryCollection"}):{type:"FeatureCollection",features:b}}});var cW=b5,dD=ad.extend({options:{opacity:1,alt:"",interactive:!1,crossOrigin:!1,errorOverlayUrl:"",zIndex:1,className:""},initialize:function(b,a,c){this._url=b,this._bounds=dE(a),cz(this,c)},onAdd:function(){this._image||(this._initImage(),this.options.opacity<1&&this._updateOpacity()),this.options.interactive&&(cf(this._image,"leaflet-interactive"),this.addInteractiveTarget(this._image)),this.getPane().appendChild(this._image),this._reset()},onRemove:function(){aY(this._image),this.options.interactive&&this.removeInteractiveTarget(this._image)},setOpacity:function(a){return this.options.opacity=a,this._image&&this._updateOpacity(),this},setStyle:function(a){return a.opacity&&this.setOpacity(a.opacity),this},bringToFront:function(){return this._map&&cD(this._image),this},bringToBack:function(){return this._map&&aj(this._image),this},setUrl:function(a){return this._url=a,this._image&&(this._image.src=a),this},setBounds:function(a){return this._bounds=dE(a),this._map&&this._reset(),this},getEvents:function(){var a={zoom:this._reset,viewreset:this._reset};return this._zoomAnimated&&(a.zoomanim=this._animateZoom),a},setZIndex:function(a){return this.options.zIndex=a,this._updateZIndex(),this},getBounds:function(){return this._bounds},getElement:function(){return this._image},_initImage:function(){var b="IMG"===this._url.tagName,a=this._image=b?this._url:a6("img");cf(a,"leaflet-image-layer"),this._zoomAnimated&&cf(a,"leaflet-zoom-animated"),this.options.className&&cf(a,this.options.className),a.onselectstart=cG,a.onmousemove=cG,a.onload=cX(this.fire,this,"load"),a.onerror=cX(this._overlayOnError,this,"error"),!this.options.crossOrigin&&""!==this.options.crossOrigin||(a.crossOrigin=!0===this.options.crossOrigin?"":this.options.crossOrigin),this.options.zIndex&&this._updateZIndex(),b?this._url=a.src:(a.src=this._url,a.alt=this.options.alt)},_animateZoom:function(b){var a=this._map.getZoomScale(b.zoom),c=this._map._latLngBoundsToNewLayerBounds(this._bounds,b.zoom,b.center).min;ac(this._image,c,a)},_reset:function(){var b=this._image,a=new dj(this._map.latLngToLayerPoint(this._bounds.getNorthWest()),this._map.latLngToLayerPoint(this._bounds.getSouthEast())),c=a.getSize();ax(b,a.min),b.style.width=c.x+"px",b.style.height=c.y+"px"},_updateOpacity:function(){aK(this._image,this.options.opacity)},_updateZIndex:function(){this._image&&void 0!==this.options.zIndex&&null!==this.options.zIndex&&(this._image.style.zIndex=this.options.zIndex)},_overlayOnError:function(){this.fire("error");var a=this.options.errorOverlayUrl;a&&this._url!==a&&(this._url=a,this._image.src=a)}}),aL=dD.extend({options:{autoplay:!0,loop:!0,keepAspectRatio:!0},_initImage:function(){var b="VIDEO"===this._url.tagName,a=this._image=b?this._url:a6("video");if(cf(a,"leaflet-image-layer"),this._zoomAnimated&&cf(a,"leaflet-zoom-animated"),a.onselectstart=cG,a.onmousemove=cG,a.onloadeddata=cX(this.fire,this,"load"),b){for(var f=a.getElementsByTagName("source"),h=[],g=0;g<f.length;g++){h.push(f[g].src)}this._url=0<f.length?h:[a.src]}else{cq(this._url)||(this._url=[this._url]),!this.options.keepAspectRatio&&a.style.hasOwnProperty("objectFit")&&(a.style.objectFit="fill"),a.autoplay=!!this.options.autoplay,a.loop=!!this.options.loop;for(var c=0;c<this._url.length;c++){var d=a6("source");d.src=this._url[c],a.appendChild(d)}}}});var ba=dD.extend({_initImage:function(){var a=this._image=this._url;cf(a,"leaflet-image-layer"),this._zoomAnimated&&cf(a,"leaflet-zoom-animated"),a.onselectstart=cG,a.onmousemove=cG}});var bS=ad.extend({options:{offset:[0,7],className:"",pane:"popupPane"},initialize:function(b,a){cz(this,b),this._source=a},onAdd:function(a){this._zoomAnimated=a._zoomAnimated,this._container||this._initLayout(),a._fadeAnimated&&aK(this._container,0),clearTimeout(this._removeTimeout),this.getPane().appendChild(this._container),this.update(),a._fadeAnimated&&aK(this._container,1),this.bringToFront()},onRemove:function(a){a._fadeAnimated?(aK(this._container,0),this._removeTimeout=setTimeout(cX(aY,void 0,this._container),200)):aY(this._container)},getLatLng:function(){return this._latlng},setLatLng:function(a){return this._latlng=c5(a),this._map&&(this._updatePosition(),this._adjustPan()),this},getContent:function(){return this._content},setContent:function(a){return this._content=a,this.update(),this},getElement:function(){return this._container},update:function(){this._map&&(this._container.style.visibility="hidden",this._updateContent(),this._updateLayout(),this._updatePosition(),this._container.style.visibility="",this._adjustPan())},getEvents:function(){var a={zoom:this._updatePosition,viewreset:this._updatePosition};return this._zoomAnimated&&(a.zoomanim=this._animateZoom),a},isOpen:function(){return !!this._map&&this._map.hasLayer(this)},bringToFront:function(){return this._map&&cD(this._container),this},bringToBack:function(){return this._map&&aj(this._container),this},_prepareOpen:function(b,a,c){if(a instanceof ad||(c=a,a=b),a instanceof aG){for(var d in b._layers){a=b._layers[d];break}}if(!c){if(a.getCenter){c=a.getCenter()}else{if(!a.getLatLng){throw new Error("Unable to get source layer LatLng.")}c=a.getLatLng()}}return this._source=a,this.update(),c},_updateContent:function(){if(this._content){var b=this._contentNode,a="function"==typeof this._content?this._content(this._source||this):this._content;if("string"==typeof a){b.innerHTML=a}else{for(;b.hasChildNodes();){b.removeChild(b.firstChild)}b.appendChild(a)}this.fire("contentupdate")}},_updatePosition:function(){if(this._map){var b=this._map.latLngToLayerPoint(this._latlng),a=dv(this.options.offset),c=this._getAnchor();this._zoomAnimated?ax(this._container,b.add(c)):a=a.add(b).add(c);var f=this._containerBottom=-a.y,d=this._containerLeft=-Math.round(this._containerWidth/2)+a.x;this._container.style.bottom=f+"px",this._container.style.left=d+"px"}},_getAnchor:function(){return[0,0]}}),du=bS.extend({options:{maxWidth:300,minWidth:50,maxHeight:null,autoPan:!0,autoPanPaddingTopLeft:null,autoPanPaddingBottomRight:null,autoPanPadding:[5,5],keepInView:!1,closeButton:!0,autoClose:!0,closeOnEscapeKey:!0,className:""},openOn:function(a){return a.openPopup(this),this},onAdd:function(a){bS.prototype.onAdd.call(this,a),a.fire("popupopen",{popup:this}),this._source&&(this._source.fire("popupopen",{popup:this},!0),this._source instanceof bd||this._source.on("preclick",bb))},onRemove:function(a){bS.prototype.onRemove.call(this,a),a.fire("popupclose",{popup:this}),this._source&&(this._source.fire("popupclose",{popup:this},!0),this._source instanceof bd||this._source.off("preclick",bb))},getEvents:function(){var a=bS.prototype.getEvents.call(this);return(void 0!==this.options.closeOnClick?this.options.closeOnClick:this._map.options.closePopupOnClick)&&(a.preclick=this._close),this.options.keepInView&&(a.moveend=this._adjustPan),a},_close:function(){this._map&&this._map.closePopup(this)},_initLayout:function(){var b="leaflet-popup",a=this._container=a6("div",b+" "+(this.options.className||"")+" leaflet-zoom-animated"),c=this._wrapper=a6("div",b+"-content-wrapper",a);if(this._contentNode=a6("div",b+"-content",c),bs(c),aw(this._contentNode),aC(c,"contextmenu",bb),this._tipContainer=a6("div",b+"-tip-container",a),this._tip=a6("div",b+"-tip",this._tipContainer),this.options.closeButton){var d=this._closeButton=a6("a",b+"-close-button",a);d.href="#close",d.innerHTML="&#215;",aC(d,"click",this._onCloseButtonClick,this)}},_updateLayout:function(){var b=this._contentNode,a=b.style;a.width="",a.whiteSpace="nowrap";var d=b.offsetWidth;d=Math.min(d,this.options.maxWidth),d=Math.max(d,this.options.minWidth),a.width=d+1+"px",a.whiteSpace="",a.height="";var g=b.offsetHeight,f=this.options.maxHeight,c="leaflet-popup-scrolled";f&&f<g?(a.height=f+"px",cf(b,c)):d0(b,c),this._containerWidth=this._container.offsetWidth},_animateZoom:function(b){var a=this._map._latLngToNewLayerPoint(this._latlng,b.zoom,b.center),c=this._getAnchor();ax(this._container,a.add(c))},_adjustPan:function(){if(this.options.autoPan){this._map._panAnim&&this._map._panAnim.stop();var w=this._map,j=parseInt(dU(this._container,"marginBottom"),10)||0,m=this._container.offsetHeight+j,f=this._containerWidth,d=new dJ(this._containerLeft,-m-this._containerBottom);d._add(aX(this._container));var x=w.layerPointToContainerPoint(d),b=dv(this.options.autoPanPadding),q=dv(this.options.autoPanPaddingTopLeft||b),k=dv(this.options.autoPanPaddingBottomRight||b),v=w.getSize(),g=0,p=0;x.x+f+k.x>v.x&&(g=x.x+f-v.x+k.x),x.x-g-q.x<0&&(g=x.x-q.x),x.y+m+k.y>v.y&&(p=x.y+m-v.y+k.y),x.y-p-q.y<0&&(p=x.y-q.y),(g||p)&&w.fire("autopanstart").panBy([g,p])}},_onCloseButtonClick:function(a){this._close(),aE(a)},_getAnchor:function(){return dv(this._source&&this._source._getPopupAnchor?this._source._getPopupAnchor():[0,0])}});cP.mergeOptions({closePopupOnClick:!0}),cP.include({openPopup:function(b,a,c){return b instanceof du||(b=new du(c).setContent(b)),a&&b.setLatLng(a),this.hasLayer(b)?this:(this._popup&&this._popup.options.autoClose&&this.closePopup(),this._popup=b,this.addLayer(b))},closePopup:function(a){return a&&a!==this._popup||(a=this._popup,this._popup=null),a&&this.removeLayer(a),this}}),ad.include({bindPopup:function(b,a){return b instanceof du?(cz(b,a),(this._popup=b)._source=this):(this._popup&&!a||(this._popup=new du(a,this)),this._popup.setContent(b)),this._popupHandlersAdded||(this.on({click:this._openPopup,keypress:this._onKeyPress,remove:this.closePopup,move:this._movePopup}),this._popupHandlersAdded=!0),this},unbindPopup:function(){return this._popup&&(this.off({click:this._openPopup,keypress:this._onKeyPress,remove:this.closePopup,move:this._movePopup}),this._popupHandlersAdded=!1,this._popup=null),this},openPopup:function(b,a){return this._popup&&this._map&&(a=this._popup._prepareOpen(this,b,a),this._map.openPopup(this._popup,a)),this},closePopup:function(){return this._popup&&this._popup._close(),this},togglePopup:function(a){return this._popup&&(this._popup._map?this.closePopup():this.openPopup(a)),this},isPopupOpen:function(){return !!this._popup&&this._popup.isOpen()},setPopupContent:function(a){return this._popup&&this._popup.setContent(a),this},getPopup:function(){return this._popup},_openPopup:function(b){var a=b.layer||b.target;this._popup&&this._map&&(aE(b),a instanceof bd?this.openPopup(b.layer||b.target,b.latlng):this._map.hasLayer(this._popup)&&this._popup._source===a?this.closePopup():this.openPopup(a,b.latlng))},_movePopup:function(a){this._popup.setLatLng(a.latlng)},_onKeyPress:function(a){13===a.originalEvent.keyCode&&this._openPopup(a)}});var cL=bS.extend({options:{pane:"tooltipPane",offset:[0,0],direction:"auto",permanent:!1,sticky:!1,interactive:!1,opacity:0.9},onAdd:function(a){bS.prototype.onAdd.call(this,a),this.setOpacity(this.options.opacity),a.fire("tooltipopen",{tooltip:this}),this._source&&this._source.fire("tooltipopen",{tooltip:this},!0)},onRemove:function(a){bS.prototype.onRemove.call(this,a),a.fire("tooltipclose",{tooltip:this}),this._source&&this._source.fire("tooltipclose",{tooltip:this},!0)},getEvents:function(){var a=bS.prototype.getEvents.call(this);return dZ&&!this.options.permanent&&(a.preclick=this._close),a},_close:function(){this._map&&this._map.closeTooltip(this)},_initLayout:function(){var a="leaflet-tooltip "+(this.options.className||"")+" leaflet-zoom-"+(this._zoomAnimated?"animated":"hide");this._contentNode=this._container=a6("div",a)},_updateLayout:function(){},_adjustPan:function(){},_setPosition:function(m){var f=this._map,j=this._container,d=f.latLngToContainerPoint(f.getCenter()),c=f.layerPointToContainerPoint(m),p=this.options.direction,b=j.offsetWidth,k=j.offsetHeight,g=dv(this.options.offset),l=this._getAnchor();m="top"===p?m.add(dv(-b/2+g.x,-k+g.y+l.y,!0)):"bottom"===p?m.subtract(dv(b/2-g.x,-g.y,!0)):"center"===p?m.subtract(dv(b/2+g.x,k/2-l.y+g.y,!0)):"right"===p||"auto"===p&&c.x<d.x?(p="right",m.add(dv(g.x+l.x,l.y-k/2+g.y,!0))):(p="left",m.subtract(dv(b+l.x-g.x,k/2-l.y-g.y,!0))),d0(j,"leaflet-tooltip-right"),d0(j,"leaflet-tooltip-left"),d0(j,"leaflet-tooltip-top"),d0(j,"leaflet-tooltip-bottom"),cf(j,"leaflet-tooltip-"+p),ax(j,m)},_updatePosition:function(){var a=this._map.latLngToLayerPoint(this._latlng);this._setPosition(a)},setOpacity:function(a){this.options.opacity=a,this._container&&aK(this._container,a)},_animateZoom:function(b){var a=this._map._latLngToNewLayerPoint(this._latlng,b.zoom,b.center);this._setPosition(a)},_getAnchor:function(){return dv(this._source&&this._source._getTooltipAnchor&&!this.options.sticky?this._source._getTooltipAnchor():[0,0])}});cP.include({openTooltip:function(b,a,c){return b instanceof cL||(b=new cL(c).setContent(b)),a&&b.setLatLng(a),this.hasLayer(b)?this:this.addLayer(b)},closeTooltip:function(a){return a&&this.removeLayer(a),this}}),ad.include({bindTooltip:function(b,a){return b instanceof cL?(cz(b,a),(this._tooltip=b)._source=this):(this._tooltip&&!a||(this._tooltip=new cL(a,this)),this._tooltip.setContent(b)),this._initTooltipInteractions(),this._tooltip.options.permanent&&this._map&&this._map.hasLayer(this)&&this.openTooltip(),this},unbindTooltip:function(){return this._tooltip&&(this._initTooltipInteractions(!0),this.closeTooltip(),this._tooltip=null),this},_initTooltipInteractions:function(b){if(b||!this._tooltipHandlersAdded){var a=b?"off":"on",c={remove:this.closeTooltip,move:this._moveTooltip};this._tooltip.options.permanent?c.add=this._openTooltip:(c.mouseover=this._openTooltip,c.mouseout=this.closeTooltip,this._tooltip.options.sticky&&(c.mousemove=this._moveTooltip),dZ&&(c.click=this._openTooltip)),this[a](c),this._tooltipHandlersAdded=!b}},openTooltip:function(b,a){return this._tooltip&&this._map&&(a=this._tooltip._prepareOpen(this,b,a),this._map.openTooltip(this._tooltip,a),this._tooltip.options.interactive&&this._tooltip._container&&(cf(this._tooltip._container,"leaflet-clickable"),this.addInteractiveTarget(this._tooltip._container))),this},closeTooltip:function(){return this._tooltip&&(this._tooltip._close(),this._tooltip.options.interactive&&this._tooltip._container&&(d0(this._tooltip._container,"leaflet-clickable"),this.removeInteractiveTarget(this._tooltip._container))),this},toggleTooltip:function(a){return this._tooltip&&(this._tooltip._map?this.closeTooltip():this.openTooltip(a)),this},isTooltipOpen:function(){return this._tooltip.isOpen()},setTooltipContent:function(a){return this._tooltip&&this._tooltip.setContent(a),this},getTooltip:function(){return this._tooltip},_openTooltip:function(b){var a=b.layer||b.target;this._tooltip&&this._map&&this.openTooltip(a,this._tooltip.options.sticky?b.latlng:void 0)},_moveTooltip:function(b){var a,c,d=b.latlng;this._tooltip.options.sticky&&b.originalEvent&&(a=this._map.mouseEventToContainerPoint(b.originalEvent),c=this._map.containerPointToLayerPoint(a),d=this._map.layerPointToLatLng(c)),this._tooltip.setLatLng(d)}});var br=au.extend({options:{iconSize:[12,12],html:!1,bgPos:null,className:"leaflet-div-icon"},createIcon:function(b){var a=b&&"DIV"===b.tagName?b:document.createElement("div"),c=this.options;if(c.html instanceof Element?(eh(a),a.appendChild(c.html)):a.innerHTML=!1!==c.html?c.html:"",c.bgPos){var d=dv(c.bgPos);a.style.backgroundPosition=-d.x+"px "+-d.y+"px"}return this._setIconStyles(a,"icon"),a},createShadow:function(){return null}});au.Default=bp;var bJ=ad.extend({options:{tileSize:256,opacity:1,updateWhenIdle:ej,updateWhenZooming:!0,updateInterval:200,zIndex:1,bounds:null,minZoom:0,maxZoom:void 0,maxNativeZoom:void 0,minNativeZoom:void 0,noWrap:!1,pane:"tilePane",className:"",keepBuffer:2},initialize:function(a){cz(this,a)},onAdd:function(){this._initContainer(),this._levels={},this._tiles={},this._resetView(),this._update()},beforeAdd:function(a){a._addZoomLimit(this)},onRemove:function(a){this._removeAllTiles(),aY(this._container),a._removeZoomLimit(this),this._container=null,this._tileZoom=void 0},bringToFront:function(){return this._map&&(cD(this._container),this._setAutoZIndex(Math.max)),this},bringToBack:function(){return this._map&&(aj(this._container),this._setAutoZIndex(Math.min)),this},getContainer:function(){return this._container},setOpacity:function(a){return this.options.opacity=a,this._updateOpacity(),this},setZIndex:function(a){return this.options.zIndex=a,this._updateZIndex(),this},isLoading:function(){return this._loading},redraw:function(){return this._map&&(this._removeAllTiles(),this._update()),this},getEvents:function(){var a={viewprereset:this._invalidateAll,viewreset:this._resetView,zoom:this._resetView,moveend:this._onMoveEnd};return this.options.updateWhenIdle||(this._onMove||(this._onMove=cB(this._onMoveEnd,this.options.updateInterval,this)),a.move=this._onMove),this._zoomAnimated&&(a.zoomanim=this._animateZoom),a},createTile:function(){return document.createElement("div")},getTileSize:function(){var a=this.options.tileSize;return a instanceof dJ?a:new dJ(a,a)},_updateZIndex:function(){this._container&&void 0!==this.options.zIndex&&null!==this.options.zIndex&&(this._container.style.zIndex=this.options.zIndex)},_setAutoZIndex:function(b){for(var a,d=this.getPane().children,g=-b(-1/0,1/0),f=0,c=d.length;f<c;f++){a=d[f].style.zIndex,d[f]!==this._container&&a&&(g=b(g,+a))}isFinite(g)&&(this.options.zIndex=g+b(-1,1),this._updateZIndex())},_updateOpacity:function(){if(this._map&&!bQ){aK(this._container,this.options.opacity);var b=+new Date,a=!1,d=!1;for(var g in this._tiles){var f=this._tiles[g];if(f.current&&f.loaded){var c=Math.min(1,(b-f.loaded)/200);aK(f.el,c),c<1?a=!0:(f.active?d=!0:this._onOpaqueTile(f),f.active=!0)}}d&&!this._noPrune&&this._pruneTiles(),a&&(dH(this._fadeFrame),this._fadeFrame=dp(this._updateOpacity,this))}},_onOpaqueTile:cG,_initContainer:function(){this._container||(this._container=a6("div","leaflet-layer "+(this.options.className||"")),this._updateZIndex(),this.options.opacity<1&&this._updateOpacity(),this.getPane().appendChild(this._container))},_updateLevels:function(){var b=this._tileZoom,a=this.options.maxZoom;if(void 0!==b){for(var c in this._levels){this._levels[c].el.children.length||c===b?(this._levels[c].el.style.zIndex=a-Math.abs(b-c),this._onUpdateLevel(c)):(aY(this._levels[c].el),this._removeTilesAtZoom(c),this._onRemoveLevel(c),delete this._levels[c])}var f=this._levels[b],d=this._map;return f||((f=this._levels[b]={}).el=a6("div","leaflet-tile-container leaflet-zoom-animated",this._container),f.el.style.zIndex=a,f.origin=d.project(d.unproject(d.getPixelOrigin()),b).round(),f.zoom=b,this._setZoomTransform(f,d.getCenter(),d.getZoom()),f.el.offsetWidth,this._onCreateLevel(f)),this._level=f}},_onUpdateLevel:cG,_onRemoveLevel:cG,_onCreateLevel:cG,_pruneTiles:function(){if(this._map){var b,a,c=this._map.getZoom();if(c>this.options.maxZoom||c<this.options.minZoom){this._removeAllTiles()}else{for(b in this._tiles){(a=this._tiles[b]).retain=a.current}for(b in this._tiles){if((a=this._tiles[b]).current&&!a.active){var d=a.coords;this._retainParent(d.x,d.y,d.z,d.z-5)||this._retainChildren(d.x,d.y,d.z,d.z+2)}}for(b in this._tiles){this._tiles[b].retain||this._removeTile(b)}}}},_removeTilesAtZoom:function(b){for(var a in this._tiles){this._tiles[a].coords.z===b&&this._removeTile(a)}},_removeAllTiles:function(){for(var a in this._tiles){this._removeTile(a)}},_invalidateAll:function(){for(var a in this._levels){aY(this._levels[a].el),this._onRemoveLevel(a),delete this._levels[a]}this._removeAllTiles(),this._tileZoom=void 0},_retainParent:function(m,f,j,d){var c=Math.floor(m/2),p=Math.floor(f/2),b=j-1,k=new dJ(+c,+p);k.z=+b;var g=this._tileCoordsToKey(k),l=this._tiles[g];return l&&l.active?l.retain=!0:(l&&l.loaded&&(l.retain=!0),d<b&&this._retainParent(c,p,b,d))},_retainChildren:function(l,f,j,d){for(var c=2*l;c<2*l+2;c++){for(var m=2*f;m<2*f+2;m++){var b=new dJ(c,m);b.z=j+1;var k=this._tileCoordsToKey(b),g=this._tiles[k];g&&g.active?g.retain=!0:(g&&g.loaded&&(g.retain=!0),j+1<d&&this._retainChildren(c,m,j+1,d))}}},_resetView:function(b){var a=b&&(b.pinch||b.flyTo);this._setView(this._map.getCenter(),this._map.getZoom(),a,a)},_animateZoom:function(a){this._setView(a.center,a.zoom,!0,a.noUpdate)},_clampZoom:function(b){var a=this.options;return void 0!==a.minNativeZoom&&b<a.minNativeZoom?a.minNativeZoom:void 0!==a.maxNativeZoom&&a.maxNativeZoom<b?a.maxNativeZoom:b},_setView:function(b,a,d,g){var f=this._clampZoom(Math.round(a));(void 0!==this.options.maxZoom&&f>this.options.maxZoom||void 0!==this.options.minZoom&&f<this.options.minZoom)&&(f=void 0);var c=this.options.updateWhenZooming&&f!==this._tileZoom;g&&!c||(this._tileZoom=f,this._abortLoading&&this._abortLoading(),this._updateLevels(),this._resetGrid(),void 0!==f&&this._update(b),d||this._pruneTiles(),this._noPrune=!!d),this._setZoomTransforms(b,a)},_setZoomTransforms:function(b,a){for(var c in this._levels){this._setZoomTransform(this._levels[c],b,a)}},_setZoomTransform:function(b,a,c){var f=this._map.getZoomScale(c,b.zoom),d=b.origin.multiplyBy(f).subtract(this._map._getNewPixelOrigin(a,c)).round();d1?ac(b.el,d,f):ax(b.el,d)},_resetGrid:function(){var b=this._map,a=b.options.crs,c=this._tileSize=this.getTileSize(),f=this._tileZoom,d=this._map.getPixelWorldBounds(this._tileZoom);d&&(this._globalTileRange=this._pxBoundsToTileRange(d)),this._wrapX=a.wrapLng&&!this.options.noWrap&&[Math.floor(b.project([0,a.wrapLng[0]],f).x/c.x),Math.ceil(b.project([0,a.wrapLng[1]],f).x/c.y)],this._wrapY=a.wrapLat&&!this.options.noWrap&&[Math.floor(b.project([a.wrapLat[0],0],f).y/c.x),Math.ceil(b.project([a.wrapLat[1],0],f).y/c.y)]},_onMoveEnd:function(){this._map&&!this._map._animatingZoom&&this._update()},_getTiledPixelBounds:function(b){var a=this._map,d=a._animatingZoom?Math.max(a._animateToZoom,a.getZoom()):a.getZoom(),g=a.getZoomScale(d,this._tileZoom),f=a.project(b,this._tileZoom).floor(),c=a.getSize().divideBy(2*g);return new dj(f.subtract(c),f.add(c))},_update:function(D){var v=this._map;if(v){var x=this._clampZoom(v.getZoom());if(void 0===D&&(D=v.getCenter()),void 0!==this._tileZoom){var j=this._getTiledPixelBounds(D),g=this._pxBoundsToTileRange(j),E=g.getCenter(),b=[],A=this.options.keepBuffer,w=new dj(g.getBottomLeft().subtract([A,-A]),g.getTopRight().add([A,-A]));if(!(isFinite(g.min.x)&&isFinite(g.min.y)&&isFinite(g.max.x)&&isFinite(g.max.y))){throw new Error("Attempted to load an infinite number of tiles")}for(var C in this._tiles){var q=this._tiles[C].coords;q.z===this._tileZoom&&w.contains(new dJ(q.x,q.y))||(this._tiles[C].current=!1)}if(1<Math.abs(x-this._tileZoom)){this._setView(D,x)}else{for(var z=g.min.y;z<=g.max.y;z++){for(var B=g.min.x;B<=g.max.x;B++){var y=new dJ(B,z);if(y.z=this._tileZoom,this._isValidTile(y)){var f=this._tiles[this._tileCoordsToKey(y)];f?f.current=!0:b.push(y)}}}if(b.sort(function(c,a){return c.distanceTo(E)-a.distanceTo(E)}),0!==b.length){this._loading||(this._loading=!0,this.fire("loading"));var k=document.createDocumentFragment();for(B=0;B<b.length;B++){this._addTile(b[B],k)}this._level.el.appendChild(k)}}}}},_isValidTile:function(b){var a=this._map.options.crs;if(!a.infinite){var c=this._globalTileRange;if(!a.wrapLng&&(b.x<c.min.x||b.x>c.max.x)||!a.wrapLat&&(b.y<c.min.y||b.y>c.max.y)){return !1}}if(!this.options.bounds){return !0}var d=this._tileCoordsToBounds(b);return dE(this.options.bounds).overlaps(d)},_keyToBounds:function(a){return this._tileCoordsToBounds(this._keyToTileCoords(a))},_tileCoordsToNwSe:function(b){var a=this._map,c=this.getTileSize(),f=b.scaleBy(c),d=f.add(c);return[a.unproject(f,b.z),a.unproject(d,b.z)]},_tileCoordsToBounds:function(b){var a=this._tileCoordsToNwSe(b),c=new dm(a[0],a[1]);return this.options.noWrap||(c=this._map.wrapLatLngBounds(c)),c},_tileCoordsToKey:function(a){return a.x+":"+a.y+":"+a.z},_keyToTileCoords:function(b){var a=b.split(":"),c=new dJ(+a[0],+a[1]);return c.z=+a[2],c},_removeTile:function(b){var a=this._tiles[b];a&&(aY(a.el),delete this._tiles[b],this.fire("tileunload",{tile:a.el,coords:this._keyToTileCoords(b)}))},_initTile:function(b){cf(b,"leaflet-tile");var a=this.getTileSize();b.style.width=a.x+"px",b.style.height=a.y+"px",b.onselectstart=cG,b.onmousemove=cG,bQ&&this.options.opacity<1&&aK(b,this.options.opacity),bo&&!bG&&(b.style.WebkitBackfaceVisibility="hidden")},_addTile:function(b,a){var c=this._getTilePos(b),f=this._tileCoordsToKey(b),d=this.createTile(this._wrapCoords(b),cX(this._tileReady,this,b));this._initTile(d),this.createTile.length<2&&dp(cX(this._tileReady,this,b,null,d)),ax(d,c),this._tiles[f]={el:d,coords:b,current:!0},a.appendChild(d),this.fire("tileloadstart",{tile:d,coords:b})},_tileReady:function(b,a,c){a&&this.fire("tileerror",{error:a,tile:c,coords:b});var d=this._tileCoordsToKey(b);(c=this._tiles[d])&&(c.loaded=+new Date,this._map._fadeAnimated?(aK(c.el,0),dH(this._fadeFrame),this._fadeFrame=dp(this._updateOpacity,this)):(c.active=!0,this._pruneTiles()),a||(cf(c.el,"leaflet-tile-loaded"),this.fire("tileload",{tile:c.el,coords:b})),this._noTilesToLoad()&&(this._loading=!1,this.fire("load"),bQ||!this._map._fadeAnimated?dp(this._pruneTiles,this):setTimeout(cX(this._pruneTiles,this),250)))},_getTilePos:function(a){return a.scaleBy(this.getTileSize()).subtract(this._level.origin)},_wrapCoords:function(b){var a=new dJ(this._wrapX?cx(b.x,this._wrapX):b.x,this._wrapY?cx(b.y,this._wrapY):b.y);return a.z=b.z,a},_pxBoundsToTileRange:function(b){var a=this.getTileSize();return new dj(b.min.unscaleBy(a).floor(),b.max.unscaleBy(a).ceil().subtract([1,1]))},_noTilesToLoad:function(){for(var a in this._tiles){if(!this._tiles[a].loaded){return !1}}return !0}});var dR=bJ.extend({options:{minZoom:0,maxZoom:18,subdomains:"abc",errorTileUrl:"",zoomOffset:0,tms:!1,zoomReverse:!1,detectRetina:!1,crossOrigin:!1},initialize:function(b,a){this._url=b,(a=cz(this,a)).detectRetina&&a1&&0<a.maxZoom&&(a.tileSize=Math.floor(a.tileSize/2),a.zoomReverse?(a.zoomOffset--,a.minZoom++):(a.zoomOffset++,a.maxZoom--),a.minZoom=Math.max(0,a.minZoom)),"string"==typeof a.subdomains&&(a.subdomains=a.subdomains.split("")),bo||this.on("tileunload",this._onTileRemove)},setUrl:function(b,a){return this._url===b&&void 0===a&&(a=!0),this._url=b,a||this.redraw(),this},createTile:function(b,a){var c=document.createElement("img");return aC(c,"load",cX(this._tileOnLoad,this,a,c)),aC(c,"error",cX(this._tileOnError,this,a,c)),!this.options.crossOrigin&&""!==this.options.crossOrigin||(c.crossOrigin=!0===this.options.crossOrigin?"":this.options.crossOrigin),c.alt="",c.setAttribute("role","presentation"),c.src=this.getTileUrl(b),c},getTileUrl:function(b){var a={r:a1?"@2x":"",s:this._getSubdomain(b),x:b.x,y:b.y,z:this._getZoomForUrl()};if(this._map&&!this._map.options.crs.infinite){var c=this._globalTileRange.max.y-b.y;this.options.tms&&(a.y=c),a["-y"]=c}return cN(this._url,cM(a,this.options))},_tileOnLoad:function(b,a){bQ?setTimeout(cX(b,this,null,a),0):b(null,a)},_tileOnError:function(b,a,c){var d=this.options.errorTileUrl;d&&a.getAttribute("src")!==d&&(a.src=d),b(c,a)},_onTileRemove:function(a){a.tile.onload=null},_getZoomForUrl:function(){var b=this._tileZoom,a=this.options.maxZoom;return this.options.zoomReverse&&(b=a-b),b+this.options.zoomOffset},_getSubdomain:function(b){var a=Math.abs(b.x+b.y)%this.options.subdomains.length;return this.options.subdomains[a]},_abortLoading:function(){var b,a;for(b in this._tiles){this._tiles[b].coords.z!==this._tileZoom&&((a=this._tiles[b].el).onload=cG,a.onerror=cG,a.complete||(a.src=co,aY(a),delete this._tiles[b]))}},_removeTile:function(b){var a=this._tiles[b];if(a){return a2||a.el.setAttribute("src",co),bJ.prototype._removeTile.call(this,b)}},_tileReady:function(b,a,c){if(this._map&&(!c||c.getAttribute("src")!==co)){return bJ.prototype._tileReady.call(this,b,a,c)}}});function a3(b,a){return new dR(b,a)}var aW=dR.extend({defaultWmsParams:{service:"WMS",request:"GetMap",layers:"",styles:"",format:"image/jpeg",transparent:!1,version:"1.1.1"},options:{crs:null,uppercase:!1},initialize:function(b,a){this._url=b;var d=cM({},this.defaultWmsParams);for(var g in a){g in this.options||(d[g]=a[g])}var f=(a=cz(this,a)).detectRetina&&a1?2:1,c=this.getTileSize();d.width=c.x*f,d.height=c.y*f,this.wmsParams=d},onAdd:function(b){this._crs=this.options.crs||b.options.crs,this._wmsVersion=parseFloat(this.wmsParams.version);var a=1.3<=this._wmsVersion?"crs":"srs";this.wmsParams[a]=this._crs.code,dR.prototype.onAdd.call(this,b)},getTileUrl:function(d){var c=this._tileCoordsToNwSe(d),h=this._crs,k=dd(h.project(c[0]),h.project(c[1])),j=k.min,f=k.max,g=(1.3<=this._wmsVersion&&this._crs===bN?[j.y,j.x,f.y,f.x]:[j.x,j.y,f.x,f.y]).join(","),b=dR.prototype.getTileUrl.call(this,d);return b+cF(this.wmsParams,b,this.options.uppercase)+(this.options.uppercase?"&BBOX=":"&bbox=")+g},setParams:function(b,a){return cM(this.wmsParams,b),a||this.redraw(),this}});dR.WMS=aW,a3.wms=function(b,a){return new aW(b,a)};var ed=ad.extend({options:{padding:0.1,tolerance:0},initialize:function(a){cz(this,a),cs(this),this._layers=this._layers||{}},onAdd:function(){this._container||(this._initContainer(),this._zoomAnimated&&cf(this._container,"leaflet-zoom-animated")),this.getPane().appendChild(this._container),this._update(),this.on("update",this._updatePaths,this)},onRemove:function(){this.off("update",this._updatePaths,this),this._destroyContainer()},getEvents:function(){var a={viewreset:this._reset,zoom:this._onZoom,moveend:this._update,zoomend:this._onZoomEnd};return this._zoomAnimated&&(a.zoomanim=this._onAnimZoom),a},_onAnimZoom:function(a){this._updateTransform(a.center,a.zoom)},_onZoom:function(){this._updateTransform(this._map.getCenter(),this._map.getZoom())},_updateTransform:function(d,c){var h=this._map.getZoomScale(c,this._zoom),k=aX(this._container),j=this._map.getSize().multiplyBy(0.5+this.options.padding),f=this._map.project(this._center,c),g=this._map.project(d,c).subtract(f),b=j.multiplyBy(-h).add(k).add(j).subtract(g);d1?ac(this._container,b,h):ax(this._container,b)},_reset:function(){for(var a in this._update(),this._updateTransform(this._center,this._zoom),this._layers){this._layers[a]._reset()}},_onZoomEnd:function(){for(var a in this._layers){this._layers[a]._project()}},_updatePaths:function(){for(var a in this._layers){this._layers[a]._update()}},_update:function(){var b=this.options.padding,a=this._map.getSize(),c=this._map.containerPointToLayerPoint(a.multiplyBy(-b)).round();this._bounds=new dj(c,c.add(a.multiplyBy(1+2*b)).round()),this._center=this._map.getCenter(),this._zoom=this._map.getZoom()}}),cv=ed.extend({getEvents:function(){var a=ed.prototype.getEvents.call(this);return a.viewprereset=this._onViewPreReset,a},_onViewPreReset:function(){this._postponeUpdatePaths=!0},onAdd:function(){ed.prototype.onAdd.call(this),this._draw()},_initContainer:function(){var a=this._container=document.createElement("canvas");aC(a,"mousemove",cB(this._onMouseMove,32,this),this),aC(a,"click dblclick mousedown mouseup contextmenu",this._onClick,this),aC(a,"mouseout",this._handleMouseOut,this),this._ctx=a.getContext("2d")},_destroyContainer:function(){dH(this._redrawRequest),delete this._ctx,aY(this._container),bk(this._container),delete this._container},_updatePaths:function(){if(!this._postponeUpdatePaths){for(var a in this._redrawBounds=null,this._layers){this._layers[a]._update()}this._redraw()}},_update:function(){if(!this._map._animatingZoom||!this._bounds){ed.prototype._update.call(this);var b=this._bounds,a=this._container,c=b.getSize(),d=a1?2:1;ax(a,b.min),a.width=d*c.x,a.height=d*c.y,a.style.width=c.x+"px",a.style.height=c.y+"px",a1&&this._ctx.scale(2,2),this._ctx.translate(-b.min.x,-b.min.y),this.fire("update")}},_reset:function(){ed.prototype._reset.call(this),this._postponeUpdatePaths&&(this._postponeUpdatePaths=!1,this._updatePaths())},_initPath:function(b){this._updateDashArray(b);var a=(this._layers[cs(b)]=b)._order={layer:b,prev:this._drawLast,next:null};this._drawLast&&(this._drawLast.next=a),this._drawLast=a,this._drawFirst=this._drawFirst||this._drawLast},_addPath:function(a){this._requestRedraw(a)},_removePath:function(b){var a=b._order,c=a.next,d=a.prev;c?c.prev=d:this._drawLast=d,d?d.next=c:this._drawFirst=c,delete b._order,delete this._layers[cs(b)],this._requestRedraw(b)},_updatePath:function(a){this._extendRedrawBounds(a),a._project(),a._update(),this._requestRedraw(a)},_updateStyle:function(a){this._updateDashArray(a),this._requestRedraw(a)},_updateDashArray:function(b){if("string"==typeof b.options.dashArray){var a,c,f=b.options.dashArray.split(/[, ]+/),d=[];for(c=0;c<f.length;c++){if(a=Number(f[c]),isNaN(a)){return}d.push(a)}b.options._dashArray=d}else{b.options._dashArray=b.options.dashArray}},_requestRedraw:function(a){this._map&&(this._extendRedrawBounds(a),this._redrawRequest=this._redrawRequest||dp(this._redraw,this))},_extendRedrawBounds:function(b){if(b._pxBounds){var a=(b.options.weight||0)+1;this._redrawBounds=this._redrawBounds||new dj,this._redrawBounds.extend(b._pxBounds.min.subtract([a,a])),this._redrawBounds.extend(b._pxBounds.max.add([a,a]))}},_redraw:function(){this._redrawRequest=null,this._redrawBounds&&(this._redrawBounds.min._floor(),this._redrawBounds.max._ceil()),this._clear(),this._draw(),this._redrawBounds=null},_clear:function(){var b=this._redrawBounds;if(b){var a=b.getSize();this._ctx.clearRect(b.min.x,b.min.y,a.x,a.y)}else{this._ctx.clearRect(0,0,this._container.width,this._container.height)}},_draw:function(){var b,a=this._redrawBounds;if(this._ctx.save(),a){var c=a.getSize();this._ctx.beginPath(),this._ctx.rect(a.min.x,a.min.y,c.x,c.y),this._ctx.clip()}this._drawing=!0;for(var d=this._drawFirst;d;d=d.next){b=d.layer,(!a||b._pxBounds&&b._pxBounds.intersects(a))&&b._updatePath()}this._drawing=!1,this._ctx.restore()},_updatePoly:function(l,f){if(this._drawing){var j,d,c,m,b=l._parts,k=b.length,g=this._ctx;if(k){for(g.beginPath(),j=0;j<k;j++){for(d=0,c=b[j].length;d<c;d++){m=b[j][d],g[d?"lineTo":"moveTo"](m.x,m.y)}f&&g.closePath()}this._fillStroke(g,l)}}},_updateCircle:function(b){if(this._drawing&&!b._empty()){var a=b._point,c=this._ctx,f=Math.max(Math.round(b._radius),1),d=(Math.max(Math.round(b._radiusY),1)||f)/f;1!=d&&(c.save(),c.scale(1,d)),c.beginPath(),c.arc(a.x,a.y/d,f,0,2*Math.PI,!1),1!=d&&c.restore(),this._fillStroke(c,b)}},_fillStroke:function(b,a){var c=a.options;c.fill&&(b.globalAlpha=c.fillOpacity,b.fillStyle=c.fillColor||c.color,b.fill(c.fillRule||"evenodd")),c.stroke&&0!==c.weight&&(b.setLineDash&&b.setLineDash(a.options&&a.options._dashArray||[]),b.globalAlpha=c.opacity,b.lineWidth=c.weight,b.strokeStyle=c.color,b.lineCap=c.lineCap,b.lineJoin=c.lineJoin,b.stroke())},_onClick:function(b){for(var a,c,f=this._map.mouseEventToLayerPoint(b),d=this._drawFirst;d;d=d.next){(a=d.layer).options.interactive&&a._containsPoint(f)&&!this._map._draggableMoved(a)&&(c=a)}c&&(b0(b),this._fireEvent([c],b))},_onMouseMove:function(b){if(this._map&&!this._map.dragging.moving()&&!this._map._animatingZoom){var a=this._map.mouseEventToLayerPoint(b);this._handleMouseHover(b,a)}},_handleMouseOut:function(b){var a=this._hoveredLayer;a&&(d0(this._container,"leaflet-interactive"),this._fireEvent([a],b,"mouseout"),this._hoveredLayer=null)},_handleMouseHover:function(b,a){for(var c,f,d=this._drawFirst;d;d=d.next){(c=d.layer).options.interactive&&c._containsPoint(a)&&(f=c)}f!==this._hoveredLayer&&(this._handleMouseOut(b),f&&(cf(this._container,"leaflet-interactive"),this._fireEvent([f],b,"mouseover"),this._hoveredLayer=f)),this._hoveredLayer&&this._fireEvent([this._hoveredLayer],b)},_fireEvent:function(b,a,c){this._map._fireDOMEvent(a,c||a.type,b)},_bringToFront:function(b){var a=b._order;if(a){var c=a.next,d=a.prev;c&&((c.prev=d)?d.next=c:c&&(this._drawFirst=c),a.prev=this._drawLast,(this._drawLast.next=a).next=null,this._drawLast=a,this._requestRedraw(b))}},_bringToBack:function(b){var a=b._order;if(a){var c=a.next,d=a.prev;d&&((d.next=c)?c.prev=d:d&&(this._drawLast=d),a.prev=null,a.next=this._drawFirst,this._drawFirst.prev=a,this._drawFirst=a,this._requestRedraw(b))}}});function af(a){return eg?new cv(a):null}var b6=function(){try{return document.namespaces.add("lvml","urn:schemas-microsoft-com:vml"),function(b){return document.createElement("<lvml:"+b+' class="lvml">')}}catch(a){return function(b){return document.createElement("<"+b+' xmlns="urn:schemas-microsoft.com:vml" class="lvml">')}}}(),cb={_initContainer:function(){this._container=a6("div","leaflet-vml-container")},_update:function(){this._map._animatingZoom||(ed.prototype._update.call(this),this.fire("update"))},_initPath:function(b){var a=b._container=b6("shape");cf(a,"leaflet-vml-shape "+(this.options.className||"")),a.coordsize="1 1",b._path=b6("path"),a.appendChild(b._path),this._updateStyle(b),this._layers[cs(b)]=b},_addPath:function(b){var a=b._container;this._container.appendChild(a),b.options.interactive&&b.addInteractiveTarget(a)},_removePath:function(b){var a=b._container;aY(a),b.removeInteractiveTarget(a),delete this._layers[cs(b)]},_updateStyle:function(b){var a=b._stroke,c=b._fill,f=b.options,d=b._container;d.stroked=!!f.stroke,d.filled=!!f.fill,f.stroke?(a||(a=b._stroke=b6("stroke")),d.appendChild(a),a.weight=f.weight+"px",a.color=f.color,a.opacity=f.opacity,f.dashArray?a.dashStyle=cq(f.dashArray)?f.dashArray.join(" "):f.dashArray.replace(/( *, *)/g," "):a.dashStyle="",a.endcap=f.lineCap.replace("butt","flat"),a.joinstyle=f.lineJoin):a&&(d.removeChild(a),b._stroke=null),f.fill?(c||(c=b._fill=b6("fill")),d.appendChild(c),c.color=f.fillColor||f.color,c.opacity=f.fillOpacity):c&&(d.removeChild(c),b._fill=null)},_updateCircle:function(b){var a=b._point.round(),c=Math.round(b._radius),d=Math.round(b._radiusY||c);this._setPath(b,b._empty()?"M0 0":"AL "+a.x+","+a.y+" "+c+","+d+" 0,23592600")},_setPath:function(b,a){b._path.v=a},_bringToFront:function(a){cD(a._container)},_bringToBack:function(a){aj(a._container)}},dX=aA?b6:d2,bC=ed.extend({getEvents:function(){var a=ed.prototype.getEvents.call(this);return a.zoomstart=this._onZoomStart,a},_initContainer:function(){this._container=dX("svg"),this._container.setAttribute("pointer-events","none"),this._rootGroup=dX("g"),this._container.appendChild(this._rootGroup)},_destroyContainer:function(){aY(this._container),bk(this._container),delete this._container,delete this._rootGroup,delete this._svgSize},_onZoomStart:function(){this._update()},_update:function(){if(!this._map._animatingZoom||!this._bounds){ed.prototype._update.call(this);var b=this._bounds,a=b.getSize(),c=this._container;this._svgSize&&this._svgSize.equals(a)||(this._svgSize=a,c.setAttribute("width",a.x),c.setAttribute("height",a.y)),ax(c,b.min),c.setAttribute("viewBox",[b.min.x,b.min.y,a.x,a.y].join(" ")),this.fire("update")}},_initPath:function(b){var a=b._path=dX("path");b.options.className&&cf(a,b.options.className),b.options.interactive&&cf(a,"leaflet-interactive"),this._updateStyle(b),this._layers[cs(b)]=b},_addPath:function(a){this._rootGroup||this._initContainer(),this._rootGroup.appendChild(a._path),a.addInteractiveTarget(a._path)},_removePath:function(a){aY(a._path),a.removeInteractiveTarget(a._path),delete this._layers[cs(a)]},_updatePath:function(a){a._project(),a._update()},_updateStyle:function(b){var a=b._path,c=b.options;a&&(c.stroke?(a.setAttribute("stroke",c.color),a.setAttribute("stroke-opacity",c.opacity),a.setAttribute("stroke-width",c.weight),a.setAttribute("stroke-linecap",c.lineCap),a.setAttribute("stroke-linejoin",c.lineJoin),c.dashArray?a.setAttribute("stroke-dasharray",c.dashArray):a.removeAttribute("stroke-dasharray"),c.dashOffset?a.setAttribute("stroke-dashoffset",c.dashOffset):a.removeAttribute("stroke-dashoffset")):a.setAttribute("stroke","none"),c.fill?(a.setAttribute("fill",c.fillColor||c.color),a.setAttribute("fill-opacity",c.fillOpacity),a.setAttribute("fill-rule",c.fillRule||"evenodd")):a.setAttribute("fill","none"))},_updatePoly:function(b,a){this._setPath(b,df(b._parts,a))},_updateCircle:function(b){var a=b._point,c=Math.max(Math.round(b._radius),1),f="a"+c+","+(Math.max(Math.round(b._radiusY),1)||c)+" 0 1,0 ",d=b._empty()?"M0 0":"M"+(a.x-c)+","+a.y+f+2*c+",0 "+f+2*-c+",0 ";this._setPath(b,d)},_setPath:function(b,a){b._path.setAttribute("d",a)},_bringToFront:function(a){cD(a._path)},_bringToBack:function(a){aj(a._path)}});function bj(a){return bu||aA?new bC(a):null}aA&&bC.include(cb),cP.include({getRenderer:function(b){var a=b.options.renderer||this._getPaneRenderer(b.options.pane)||this.options.renderer||this._renderer;return a||(a=this._renderer=this._createRenderer()),this.hasLayer(a)||this.addLayer(a),a},_getPaneRenderer:function(b){if("overlayPane"===b||void 0===b){return !1}var a=this._paneRenderers[b];return void 0===a&&(a=this._createRenderer({pane:b}),this._paneRenderers[b]=a),a},_createRenderer:function(a){return this.options.preferCanvas&&af(a)||bj(a)}});var aI=aH.extend({initialize:function(b,a){aH.prototype.initialize.call(this,this._boundsToLatLngs(b),a)},setBounds:function(a){return this.setLatLngs(this._boundsToLatLngs(a))},_boundsToLatLngs:function(a){return[(a=dE(a)).getSouthWest(),a.getNorthWest(),a.getNorthEast(),a.getSouthEast()]}});bC.create=dX,bC.pointsToPath=df,cr.geometryToLayer=d3,cr.coordsToLatLng=ar,cr.coordsToLatLngs=dQ,cr.latLngToCoords=c6,cr.latLngsToCoords=b2,cr.getFeature=ek,cr.asFeature=cg,cP.mergeOptions({boxZoom:!0});var d6=cY.extend({initialize:function(a){this._map=a,this._container=a._container,this._pane=a._panes.overlayPane,this._resetStateTimeout=0,a.on("unload",this._destroy,this)},addHooks:function(){aC(this._container,"mousedown",this._onMouseDown,this)},removeHooks:function(){bk(this._container,"mousedown",this._onMouseDown,this)},moved:function(){return this._moved},_destroy:function(){aY(this._pane),delete this._pane},_resetState:function(){this._resetStateTimeout=0,this._moved=!1},_clearDeferredResetState:function(){0!==this._resetStateTimeout&&(clearTimeout(this._resetStateTimeout),this._resetStateTimeout=0)},_onMouseDown:function(a){if(!a.shiftKey||1!==a.which&&1!==a.button){return !1}this._clearDeferredResetState(),this._resetState(),dc(),dk(),this._startPoint=this._map.mouseEventToContainerPoint(a),aC(document,{contextmenu:aE,mousemove:this._onMouseMove,mouseup:this._onMouseUp,keydown:this._onKeyDown},this)},_onMouseMove:function(b){this._moved||(this._moved=!0,this._box=a6("div","leaflet-zoom-box",this._container),cf(this._container,"leaflet-crosshair"),this._map.fire("boxzoomstart")),this._point=this._map.mouseEventToContainerPoint(b);var a=new dj(this._point,this._startPoint),c=a.getSize();ax(this._box,a.min),this._box.style.width=c.x+"px",this._box.style.height=c.y+"px"},_finish:function(){this._moved&&(aY(this._box),d0(this._container,"leaflet-crosshair")),aD(),d7(),bk(document,{contextmenu:aE,mousemove:this._onMouseMove,mouseup:this._onMouseUp,keydown:this._onKeyDown},this)},_onMouseUp:function(b){if((1===b.which||1===b.button)&&(this._finish(),this._moved)){this._clearDeferredResetState(),this._resetStateTimeout=setTimeout(cX(this._resetState,this),0);var a=new dm(this._map.containerPointToLatLng(this._startPoint),this._map.containerPointToLatLng(this._point));this._map.fitBounds(a).fire("boxzoomend",{boxZoomBounds:a})}},_onKeyDown:function(a){27===a.keyCode&&this._finish()}});cP.addInitHook("addHandler","boxZoom",d6),cP.mergeOptions({doubleClickZoom:!0});var em=cY.extend({addHooks:function(){this._map.on("dblclick",this._onDoubleClick,this)},removeHooks:function(){this._map.off("dblclick",this._onDoubleClick,this)},_onDoubleClick:function(b){var a=this._map,c=a.getZoom(),f=a.options.zoomDelta,d=b.originalEvent.shiftKey?c-f:c+f;"center"===a.options.doubleClickZoom?a.setZoom(d):a.setZoomAround(b.containerPoint,d)}});cP.addInitHook("addHandler","doubleClickZoom",em),cP.mergeOptions({dragging:!0,inertia:!bG,inertiaDeceleration:3400,inertiaMaxSpeed:1/0,easeLinearity:0.2,worldCopyJump:!1,maxBoundsViscosity:0});var av=cY.extend({addHooks:function(){if(!this._draggable){var a=this._map;this._draggable=new el(a._mapPane,a._container),this._draggable.on({dragstart:this._onDragStart,drag:this._onDrag,dragend:this._onDragEnd},this),this._draggable.on("predrag",this._onPreDragLimit,this),a.options.worldCopyJump&&(this._draggable.on("predrag",this._onPreDragWrap,this),a.on("zoomend",this._onZoomEnd,this),a.whenReady(this._onZoomEnd,this))}cf(this._map._container,"leaflet-grab leaflet-touch-drag"),this._draggable.enable(),this._positions=[],this._times=[]},removeHooks:function(){d0(this._map._container,"leaflet-grab"),d0(this._map._container,"leaflet-touch-drag"),this._draggable.disable()},moved:function(){return this._draggable&&this._draggable._moved},moving:function(){return this._draggable&&this._draggable._moving},_onDragStart:function(){var b=this._map;if(b._stop(),this._map.options.maxBounds&&this._map.options.maxBoundsViscosity){var a=dE(this._map.options.maxBounds);this._offsetLimit=dd(this._map.latLngToContainerPoint(a.getNorthWest()).multiplyBy(-1),this._map.latLngToContainerPoint(a.getSouthEast()).multiplyBy(-1).add(this._map.getSize())),this._viscosity=Math.min(1,Math.max(0,this._map.options.maxBoundsViscosity))}else{this._offsetLimit=null}b.fire("movestart").fire("dragstart"),b.options.inertia&&(this._positions=[],this._times=[])},_onDrag:function(b){if(this._map.options.inertia){var a=this._lastTime=+new Date,c=this._lastPos=this._draggable._absPos||this._draggable._newPos;this._positions.push(c),this._times.push(a),this._prunePositions(a)}this._map.fire("move",b).fire("drag",b)},_prunePositions:function(a){for(;1<this._positions.length&&50<a-this._times[0];){this._positions.shift(),this._times.shift()}},_onZoomEnd:function(){var b=this._map.getSize().divideBy(2),a=this._map.latLngToLayerPoint([0,0]);this._initialWorldOffset=a.subtract(b).x,this._worldWidth=this._map.getPixelWorldBounds().getSize().x},_viscousLimit:function(b,a){return b-(b-a)*this._viscosity},_onPreDragLimit:function(){if(this._viscosity&&this._offsetLimit){var b=this._draggable._newPos.subtract(this._draggable._startPos),a=this._offsetLimit;b.x<a.min.x&&(b.x=this._viscousLimit(b.x,a.min.x)),b.y<a.min.y&&(b.y=this._viscousLimit(b.y,a.min.y)),b.x>a.max.x&&(b.x=this._viscousLimit(b.x,a.max.x)),b.y>a.max.y&&(b.y=this._viscousLimit(b.y,a.max.y)),this._draggable._newPos=this._draggable._startPos.add(b)}},_onPreDragWrap:function(){var b=this._worldWidth,a=Math.round(b/2),f=this._initialWorldOffset,h=this._draggable._newPos.x,g=(h-a+f)%b+a-f,c=(h+a+f)%b-a-f,d=Math.abs(g+f)<Math.abs(c+f)?g:c;this._draggable._absPos=this._draggable._newPos.clone(),this._draggable._newPos.x=d},_onDragEnd:function(x){var j=this._map,m=j.options,f=!m.inertia||this._times.length<2;if(j.fire("dragend",x),f){j.fire("moveend")}else{this._prunePositions(+new Date);var d=this._lastPos.subtract(this._positions[0]),y=(this._lastTime-this._times[0])/1000,b=m.easeLinearity,q=d.multiplyBy(b/y),k=q.distanceTo([0,0]),w=Math.min(m.inertiaMaxSpeed,k),g=q.multiplyBy(w/k),p=w/(m.inertiaDeceleration*b),v=g.multiplyBy(-p/2).round();v.x||v.y?(v=j._limitOffset(v,j.options.maxBounds),dp(function(){j.panBy(v,{duration:p,easeLinearity:b,noMoveStart:!0,animate:!0})})):j.fire("moveend")}}});cP.addInitHook("addHandler","dragging",av),cP.mergeOptions({keyboard:!0,keyboardPanDelta:80});var aU=cY.extend({keyCodes:{left:[37],right:[39],down:[40],up:[38],zoomIn:[187,107,61,171],zoomOut:[189,109,54,173]},initialize:function(a){this._map=a,this._setPanDelta(a.options.keyboardPanDelta),this._setZoomDelta(a.options.zoomDelta)},addHooks:function(){var a=this._map._container;a.tabIndex<=0&&(a.tabIndex="0"),aC(a,{focus:this._onFocus,blur:this._onBlur,mousedown:this._onMouseDown},this),this._map.on({focus:this._addHooks,blur:this._removeHooks},this)},removeHooks:function(){this._removeHooks(),bk(this._map._container,{focus:this._onFocus,blur:this._onBlur,mousedown:this._onMouseDown},this),this._map.off({focus:this._addHooks,blur:this._removeHooks},this)},_onMouseDown:function(){if(!this._focused){var b=document.body,a=document.documentElement,c=b.scrollTop||a.scrollTop,d=b.scrollLeft||a.scrollLeft;this._map._container.focus(),window.scrollTo(d,c)}},_onFocus:function(){this._focused=!0,this._map.fire("focus")},_onBlur:function(){this._focused=!1,this._map.fire("blur")},_setPanDelta:function(b){var a,c,f=this._panKeys={},d=this.keyCodes;for(a=0,c=d.left.length;a<c;a++){f[d.left[a]]=[-1*b,0]}for(a=0,c=d.right.length;a<c;a++){f[d.right[a]]=[b,0]}for(a=0,c=d.down.length;a<c;a++){f[d.down[a]]=[0,b]}for(a=0,c=d.up.length;a<c;a++){f[d.up[a]]=[0,-1*b]}},_setZoomDelta:function(b){var a,c,f=this._zoomKeys={},d=this.keyCodes;for(a=0,c=d.zoomIn.length;a<c;a++){f[d.zoomIn[a]]=b}for(a=0,c=d.zoomOut.length;a<c;a++){f[d.zoomOut[a]]=-b}},_addHooks:function(){aC(document,"keydown",this._onKeyDown,this)},_removeHooks:function(){bk(document,"keydown",this._onKeyDown,this)},_onKeyDown:function(b){if(!(b.altKey||b.ctrlKey||b.metaKey)){var a,c=b.keyCode,d=this._map;if(c in this._panKeys){d._panAnim&&d._panAnim._inProgress||(a=this._panKeys[c],b.shiftKey&&(a=dv(a).multiplyBy(3)),d.panBy(a),d.options.maxBounds&&d.panInsideBounds(d.options.maxBounds))}else{if(c in this._zoomKeys){d.setZoom(d.getZoom()+(b.shiftKey?3:1)*this._zoomKeys[c])}else{if(27!==c||!d._popup||!d._popup.options.closeOnEscapeKey){return}d.closePopup()}}aE(b)}}});cP.addInitHook("addHandler","keyboard",aU),cP.mergeOptions({scrollWheelZoom:!0,wheelDebounceTime:40,wheelPxPerZoomLevel:60});var bW=cY.extend({addHooks:function(){aC(this._map._container,"mousewheel",this._onWheelScroll,this),this._delta=0},removeHooks:function(){bk(this._map._container,"mousewheel",this._onWheelScroll,this)},_onWheelScroll:function(b){var a=am(b),c=this._map.options.wheelDebounceTime;this._delta+=a,this._lastMousePos=this._map.mouseEventToContainerPoint(b),this._startTime||(this._startTime=+new Date);var d=Math.max(c-(+new Date-this._startTime),0);clearTimeout(this._timer),this._timer=setTimeout(cX(this._performZoom,this),d),aE(b)},_performZoom:function(){var b=this._map,a=b.getZoom(),f=this._map.options.zoomSnap||0;b._stop();var h=this._delta/(4*this._map.options.wheelPxPerZoomLevel),g=4*Math.log(2/(1+Math.exp(-Math.abs(h))))/Math.LN2,c=f?Math.ceil(g/f)*f:g,d=b._limitZoom(a+(0<this._delta?c:-c))-a;this._delta=0,this._startTime=null,d&&("center"===b.options.scrollWheelZoom?b.setZoom(a+d):b.setZoomAround(this._lastMousePos,a+d))}});cP.addInitHook("addHandler","scrollWheelZoom",bW),cP.mergeOptions({tap:!0,tapTolerance:15});var c9=cY.extend({addHooks:function(){aC(this._map._container,"touchstart",this._onDown,this)},removeHooks:function(){bk(this._map._container,"touchstart",this._onDown,this)},_onDown:function(b){if(b.touches){if(aP(b),this._fireClick=!0,1<b.touches.length){return this._fireClick=!1,void clearTimeout(this._holdTimeout)}var a=b.touches[0],c=a.target;this._startPos=this._newPos=new dJ(a.clientX,a.clientY),c.tagName&&"a"===c.tagName.toLowerCase()&&cf(c,"leaflet-active"),this._holdTimeout=setTimeout(cX(function(){this._isTapValid()&&(this._fireClick=!1,this._onUp(),this._simulateEvent("contextmenu",a))},this),1000),this._simulateEvent("mousedown",a),aC(document,{touchmove:this._onMove,touchend:this._onUp},this)}},_onUp:function(b){if(clearTimeout(this._holdTimeout),bk(document,{touchmove:this._onMove,touchend:this._onUp},this),this._fireClick&&b&&b.changedTouches){var a=b.changedTouches[0],c=a.target;c&&c.tagName&&"a"===c.tagName.toLowerCase()&&d0(c,"leaflet-active"),this._simulateEvent("mouseup",a),this._isTapValid()&&this._simulateEvent("click",a)}},_isTapValid:function(){return this._newPos.distanceTo(this._startPos)<=this._map.options.tapTolerance},_onMove:function(b){var a=b.touches[0];this._newPos=new dJ(a.clientX,a.clientY),this._simulateEvent("mousemove",a)},_simulateEvent:function(b,a){var c=document.createEvent("MouseEvents");c._simulated=!0,a.target._simulatedClick=!0,c.initMouseEvent(b,!0,!0,window,1,a.screenX,a.screenY,a.clientX,a.clientY,!1,!1,!1,!1,0,null),a.target.dispatchEvent(c)}});dZ&&!c2&&cP.addInitHook("addHandler","tap",c9),cP.mergeOptions({touchZoom:dZ&&!bG,bounceAtZoomLimits:!0});var d4=cY.extend({addHooks:function(){cf(this._map._container,"leaflet-touch-zoom"),aC(this._map._container,"touchstart",this._onTouchStart,this)},removeHooks:function(){d0(this._map._container,"leaflet-touch-zoom"),bk(this._map._container,"touchstart",this._onTouchStart,this)},_onTouchStart:function(b){var a=this._map;if(b.touches&&2===b.touches.length&&!a._animatingZoom&&!this._zooming){var c=a.mouseEventToContainerPoint(b.touches[0]),d=a.mouseEventToContainerPoint(b.touches[1]);this._centerPoint=a.getSize()._divideBy(2),this._startLatLng=a.containerPointToLatLng(this._centerPoint),"center"!==a.options.touchZoom&&(this._pinchStartLatLng=a.containerPointToLatLng(c.add(d)._divideBy(2))),this._startDist=c.distanceTo(d),this._startZoom=a.getZoom(),this._moved=!1,this._zooming=!0,a._stop(),aC(document,"touchmove",this._onTouchMove,this),aC(document,"touchend",this._onTouchEnd,this),aP(b)}},_onTouchMove:function(b){if(b.touches&&2===b.touches.length&&this._zooming){var a=this._map,f=a.mouseEventToContainerPoint(b.touches[0]),h=a.mouseEventToContainerPoint(b.touches[1]),g=f.distanceTo(h)/this._startDist;if(this._zoom=a.getScaleZoom(g,this._startZoom),!a.options.bounceAtZoomLimits&&(this._zoom<a.getMinZoom()&&g<1||this._zoom>a.getMaxZoom()&&1<g)&&(this._zoom=a._limitZoom(this._zoom)),"center"===a.options.touchZoom){if(this._center=this._startLatLng,1==g){return}}else{var c=f._add(h)._divideBy(2)._subtract(this._centerPoint);if(1==g&&0===c.x&&0===c.y){return}this._center=a.unproject(a.project(this._pinchStartLatLng,this._zoom).subtract(c),this._zoom)}this._moved||(a._moveStart(!0,!1),this._moved=!0),dH(this._animRequest);var d=cX(a._move,a,this._center,this._zoom,{pinch:!0,round:!1});this._animRequest=dp(d,this,!0),aP(b)}},_onTouchEnd:function(){this._moved&&this._zooming?(this._zooming=!1,dH(this._animRequest),bk(document,"touchmove",this._onTouchMove),bk(document,"touchend",this._onTouchEnd),this._map.options.zoomAnimation?this._map._animateZoom(this._center,this._map._limitZoom(this._zoom),!0,this._map.options.zoomSnap):this._map._resetView(this._center,this._map._limitZoom(this._zoom))):this._zooming=!1}});cP.addInitHook("addHandler","touchZoom",d4),cP.BoxZoom=d6,cP.DoubleClickZoom=em,cP.Drag=av,cP.Keyboard=aU,cP.ScrollWheelZoom=bW,cP.Tap=c9,cP.TouchZoom=d4,Object.freeze=cK,cu.version="1.5.1+HEAD.2e3e0ff",cu.Control=aJ,cu.control=dw,cu.Browser=bg,cu.Evented=cH,cu.Mixin=bO,cu.Util=db,cu.Class=c1,cu.Handler=cY,cu.extend=cM,cu.bind=cX,cu.stamp=cs,cu.setOptions=cz,cu.DomEvent=bP,cu.DomUtil=bz,cu.PosAnimation=b3,cu.Draggable=el,cu.LineUtil=ea,cu.PolyUtil=aZ,cu.Point=dJ,cu.point=dv,cu.Bounds=dj,cu.bounds=dd,cu.Transformation=dy,cu.transformation=dr,cu.Projection=d9,cu.LatLng=cJ,cu.latLng=c5,cu.LatLngBounds=dm,cu.latLngBounds=dE,cu.CRS=dz,cu.GeoJSON=cr,cu.geoJSON=b5,cu.geoJson=cW,cu.Layer=ad,cu.LayerGroup=bB,cu.layerGroup=function(b,a){return new bB(b,a)},cu.FeatureGroup=aG,cu.featureGroup=function(a){return new aG(a)},cu.ImageOverlay=dD,cu.imageOverlay=function(b,a,c){return new dD(b,a,c)},cu.VideoOverlay=aL,cu.videoOverlay=function(b,a,c){return new aL(b,a,c)},cu.SVGOverlay=ba,cu.svgOverlay=function(b,a,c){return new ba(b,a,c)},cu.DivOverlay=bS,cu.Popup=du,cu.popup=function(b,a){return new du(b,a)},cu.Tooltip=cL,cu.tooltip=function(b,a){return new cL(b,a)},cu.Icon=au,cu.icon=function(a){return new au(a)},cu.DivIcon=br,cu.divIcon=function(a){return new br(a)},cu.Marker=dI,cu.marker=function(b,a){return new dI(b,a)},cu.TileLayer=dR,cu.tileLayer=a3,cu.GridLayer=bJ,cu.gridLayer=function(a){return new bJ(a)},cu.SVG=bC,cu.svg=bj,cu.Renderer=ed,cu.Canvas=cv,cu.canvas=af,cu.Path=bd,cu.CircleMarker=ay,cu.circleMarker=function(b,a){return new ay(b,a)},cu.Circle=bw,cu.circle=function(b,a,c){return new bw(b,a,c)},cu.Polyline=aT,cu.polyline=function(b,a){return new aT(b,a)},cu.Polygon=aH,cu.polygon=function(b,a){return new aH(b,a)},cu.Rectangle=aI,cu.rectangle=function(b,a){return new aI(b,a)},cu.Map=cP,cu.map=function(b,a){return new cP(b,a)};var dM=window.L;cu.noConflict=function(){return window.L=dM,this},window.L=cu});
var Waymark_L = L.noConflict();
/* @preserve
 * Leaflet Control Geocoder 1.10.0
 * https://github.com/perliedman/leaflet-control-geocoder
 *
 * Copyright (c) 2012 sa3m (https://github.com/sa3m)
 * Copyright (c) 2018 Per Liedman
 * All rights reserved.
 */

this.L = this.L || {};
this.Waymark_L.Control = this.Waymark_L.Control || {};
this.Waymark_L.Control.Geocoder = (function (L) {
  'use strict';

  L = L && Waymark_L.hasOwnProperty('default') ? L['default'] : L;

  var lastCallbackId = 0;

  // Adapted from handlebars.js
  // https://github.com/wycats/handlebars.js/
  var badChars = /[&<>"'`]/g;
  var possible = /[&<>"'`]/;
  var escape = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };

  function escapeChar(chr) {
    return escape[chr];
  }

  function htmlEscape(string) {
    if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;

    if (!possible.test(string)) {
      return string;
    }
    return string.replace(badChars, escapeChar);
  }

  function jsonp(url, params, callback, context, jsonpParam) {
    var callbackId = '_l_geocoder_' + lastCallbackId++;
    params[jsonpParam || 'callback'] = callbackId;
    window[callbackId] = Waymark_L.Util.bind(callback, context);
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url + getParamString(params);
    script.id = callbackId;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  function getJSON(url, params, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState !== 4) {
        return;
      }
      var message;
      if (xmlHttp.status !== 200 && xmlHttp.status !== 304) {
        message = '';
      } else if (typeof xmlHttp.response === 'string') {
        // IE doesn't parse JSON responses even with responseType: 'json'.
        try {
          message = JSON.parse(xmlHttp.response);
        } catch (e) {
          // Not a JSON response
          message = xmlHttp.response;
        }
      } else {
        message = xmlHttp.response;
      }
      callback(message);
    };
    xmlHttp.open('GET', url + getParamString(params), true);
    xmlHttp.responseType = 'json';
    xmlHttp.setRequestHeader('Accept', 'application/json');
    xmlHttp.send(null);
  }

  function template(str, data) {
    return str.replace(/\{ *([\w_]+) *\}/g, function(str, key) {
      var value = data[key];
      if (value === undefined) {
        value = '';
      } else if (typeof value === 'function') {
        value = value(data);
      }
      return htmlEscape(value);
    });
  }

  function getParamString(obj, existingUrl, uppercase) {
    var params = [];
    for (var i in obj) {
      var key = encodeURIComponent(uppercase ? i.toUpperCase() : i);
      var value = obj[i];
      if (!Waymark_L.Util.isArray(value)) {
        params.push(key + '=' + encodeURIComponent(value));
      } else {
        for (var j = 0; j < value.length; j++) {
          params.push(key + '=' + encodeURIComponent(value[j]));
        }
      }
    }
    return (!existingUrl || existingUrl.indexOf('?') === -1 ? '?' : '&') + params.join('&');
  }

  var ArcGis = Waymark_L.Class.extend({
    options: {
      service_url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'
    },

    initialize: function(accessToken, options) {
      Waymark_L.setOptions(this, options);
      this._accessToken = accessToken;
    },

    geocode: function(query, cb, context) {
      var params = {
        SingleLine: query,
        outFields: 'Addr_Type',
        forStorage: false,
        maxLocations: 10,
        f: 'json'
      };

      if (this._key && this._key.length) {
        params.token = this._key;
      }

      getJSON(
        this.options.service_url + '/findAddressCandidates',
        Waymark_L.extend(params, this.options.geocodingQueryParams),
        function(data) {
          var results = [],
            loc,
            latLng,
            latLngBounds;

          if (data.candidates && data.candidates.length) {
            for (var i = 0; i <= data.candidates.length - 1; i++) {
              loc = data.candidates[i];
              latLng = Waymark_L.latLng(loc.location.y, loc.location.x);
              latLngBounds = Waymark_L.latLngBounds(
                Waymark_L.latLng(loc.extent.ymax, loc.extent.xmax),
                Waymark_L.latLng(loc.extent.ymin, loc.extent.xmin)
              );
              results[i] = {
                name: loc.address,
                bbox: latLngBounds,
                center: latLng
              };
            }
          }

          cb.call(context, results);
        }
      );
    },

    suggest: function(query, cb, context) {
      return this.geocode(query, cb, context);
    },

    reverse: function(location, scale, cb, context) {
      var params = {
        location: encodeURIComponent(location.lng) + ',' + encodeURIComponent(location.lat),
        distance: 100,
        f: 'json'
      };

      getJSON(this.options.service_url + '/reverseGeocode', params, function(data) {
        var result = [],
          loc;

        if (data && !data.error) {
          loc = Waymark_L.latLng(data.location.y, data.location.x);
          result.push({
            name: data.address.Match_addr,
            center: loc,
            bounds: Waymark_L.latLngBounds(loc, loc)
          });
        }

        cb.call(context, result);
      });
    }
  });

  function arcgis(accessToken, options) {
    return new ArcGis(accessToken, options);
  }

  var Bing = Waymark_L.Class.extend({
    initialize: function(key) {
      this.key = key;
    },

    geocode: function(query, cb, context) {
      jsonp(
        'https://dev.virtualearth.net/REST/v1/Locations',
        {
          query: query,
          key: this.key
        },
        function(data) {
          var results = [];
          if (data.resourceSets.length > 0) {
            for (var i = data.resourceSets[0].resources.length - 1; i >= 0; i--) {
              var resource = data.resourceSets[0].resources[i],
                bbox = resource.bbox;
              results[i] = {
                name: resource.name,
                bbox: Waymark_L.latLngBounds([bbox[0], bbox[1]], [bbox[2], bbox[3]]),
                center: Waymark_L.latLng(resource.point.coordinates)
              };
            }
          }
          cb.call(context, results);
        },
        this,
        'jsonp'
      );
    },

    reverse: function(location, scale, cb, context) {
      jsonp(
        '//dev.virtualearth.net/REST/v1/Locations/' + location.lat + ',' + location.lng,
        {
          key: this.key
        },
        function(data) {
          var results = [];
          for (var i = data.resourceSets[0].resources.length - 1; i >= 0; i--) {
            var resource = data.resourceSets[0].resources[i],
              bbox = resource.bbox;
            results[i] = {
              name: resource.name,
              bbox: Waymark_L.latLngBounds([bbox[0], bbox[1]], [bbox[2], bbox[3]]),
              center: Waymark_L.latLng(resource.point.coordinates)
            };
          }
          cb.call(context, results);
        },
        this,
        'jsonp'
      );
    }
  });

  function bing(key) {
    return new Bing(key);
  }

  var Google = Waymark_L.Class.extend({
    options: {
      serviceUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
      geocodingQueryParams: {},
      reverseQueryParams: {}
    },

    initialize: function(key, options) {
      this._key = key;
      Waymark_L.setOptions(this, options);
      // Backwards compatibility
      this.options.serviceUrl = this.options.service_url || this.options.serviceUrl;
    },

    geocode: function(query, cb, context) {
      var params = {
        address: query
      };

      if (this._key && this._key.length) {
        params.key = this._key;
      }

      params = Waymark_L.Util.extend(params, this.options.geocodingQueryParams);

      getJSON(this.options.serviceUrl, params, function(data) {
        var results = [],
          loc,
          latLng,
          latLngBounds;
        if (data.results && data.results.length) {
          for (var i = 0; i <= data.results.length - 1; i++) {
            loc = data.results[i];
            latLng = Waymark_L.latLng(loc.geometry.location);
            latLngBounds = Waymark_L.latLngBounds(
              Waymark_L.latLng(loc.geometry.viewport.northeast),
              Waymark_L.latLng(loc.geometry.viewport.southwest)
            );
            results[i] = {
              name: loc.formatted_address,
              bbox: latLngBounds,
              center: latLng,
              properties: loc.address_components
            };
          }
        }

        cb.call(context, results);
      });
    },

    reverse: function(location, scale, cb, context) {
      var params = {
        latlng: encodeURIComponent(location.lat) + ',' + encodeURIComponent(location.lng)
      };
      params = Waymark_L.Util.extend(params, this.options.reverseQueryParams);
      if (this._key && this._key.length) {
        params.key = this._key;
      }

      getJSON(this.options.serviceUrl, params, function(data) {
        var results = [],
          loc,
          latLng,
          latLngBounds;
        if (data.results && data.results.length) {
          for (var i = 0; i <= data.results.length - 1; i++) {
            loc = data.results[i];
            latLng = Waymark_L.latLng(loc.geometry.location);
            latLngBounds = Waymark_L.latLngBounds(
              Waymark_L.latLng(loc.geometry.viewport.northeast),
              Waymark_L.latLng(loc.geometry.viewport.southwest)
            );
            results[i] = {
              name: loc.formatted_address,
              bbox: latLngBounds,
              center: latLng,
              properties: loc.address_components
            };
          }
        }

        cb.call(context, results);
      });
    }
  });

  function google(key, options) {
    return new Google(key, options);
  }

  var HERE = Waymark_L.Class.extend({
    options: {
      geocodeUrl: 'https://geocoder.api.here.com/6.2/geocode.json',
      reverseGeocodeUrl: 'https://reverse.geocoder.api.here.com/6.2/reversegeocode.json',
      app_id: '<insert your app_id here>',
      app_code: '<insert your app_code here>',
      geocodingQueryParams: {},
      reverseQueryParams: {},
      reverseGeocodeProxRadius: null
    },
    initialize: function(options) {
      Waymark_L.setOptions(this, options);
    },
    geocode: function(query, cb, context) {
      var params = {
        searchtext: query,
        gen: 9,
        app_id: this.options.app_id,
        app_code: this.options.app_code,
        jsonattributes: 1
      };
      params = Waymark_L.Util.extend(params, this.options.geocodingQueryParams);
      this.getJSON(this.options.geocodeUrl, params, cb, context);
    },
    reverse: function(location, scale, cb, context) {
      var _proxRadius = this.options.reverseGeocodeProxRadius
        ? this.options.reverseGeocodeProxRadius
        : null;
      var proxRadius = _proxRadius ? ',' + encodeURIComponent(_proxRadius) : '';
      var params = {
        prox: encodeURIComponent(location.lat) + ',' + encodeURIComponent(location.lng) + proxRadius,
        mode: 'retrieveAddresses',
        app_id: this.options.app_id,
        app_code: this.options.app_code,
        gen: 9,
        jsonattributes: 1
      };
      params = Waymark_L.Util.extend(params, this.options.reverseQueryParams);
      this.getJSON(this.options.reverseGeocodeUrl, params, cb, context);
    },
    getJSON: function(url, params, cb, context) {
      getJSON(url, params, function(data) {
        var results = [],
          loc,
          latLng,
          latLngBounds;
        if (data.response.view && data.response.view.length) {
          for (var i = 0; i <= data.response.view[0].result.length - 1; i++) {
            loc = data.response.view[0].result[i].location;
            latLng = Waymark_L.latLng(loc.displayPosition.latitude, loc.displayPosition.longitude);
            latLngBounds = Waymark_L.latLngBounds(
              Waymark_L.latLng(loc.mapView.topLeft.latitude, loc.mapView.topLeft.longitude),
              Waymark_L.latLng(loc.mapView.bottomRight.latitude, loc.mapView.bottomRight.longitude)
            );
            results[i] = {
              name: loc.address.label,
              bbox: latLngBounds,
              center: latLng
            };
          }
        }
        cb.call(context, results);
      });
    }
  });
  function here(options) {
    return new HERE(options);
  }

  var LatLng = Waymark_L.Class.extend({
    options: {
      // the next geocoder to use
      next: undefined,
      sizeInMeters: 10000
    },

    initialize: function(options) {
      Waymark_L.Util.setOptions(this, options);
    },

    geocode: function(query, cb, context) {
      var match;
      var center;
      // regex from https://github.com/openstreetmap/openstreetmap-website/blob/master/app/controllers/geocoder_controller.rb
      if ((match = query.match(/^([NS])\s*(\d{1,3}(?:\.\d*)?)\W*([EW])\s*(\d{1,3}(?:\.\d*)?)$/))) {
        // [NSEW] decimal degrees
        center = Waymark_L.latLng(
          (/N/i.test(match[1]) ? 1 : -1) * parseFloat(match[2]),
          (/E/i.test(match[3]) ? 1 : -1) * parseFloat(match[4])
        );
      } else if (
        (match = query.match(/^(\d{1,3}(?:\.\d*)?)\s*([NS])\W*(\d{1,3}(?:\.\d*)?)\s*([EW])$/))
      ) {
        // decimal degrees [NSEW]
        center = Waymark_L.latLng(
          (/N/i.test(match[2]) ? 1 : -1) * parseFloat(match[1]),
          (/E/i.test(match[4]) ? 1 : -1) * parseFloat(match[3])
        );
      } else if (
        (match = query.match(
          /^([NS])\s*(\d{1,3})°?\s*(\d{1,3}(?:\.\d*)?)?['′]?\W*([EW])\s*(\d{1,3})°?\s*(\d{1,3}(?:\.\d*)?)?['′]?$/
        ))
      ) {
        // [NSEW] degrees, decimal minutes
        center = Waymark_L.latLng(
          (/N/i.test(match[1]) ? 1 : -1) * (parseFloat(match[2]) + parseFloat(match[3] / 60)),
          (/E/i.test(match[4]) ? 1 : -1) * (parseFloat(match[5]) + parseFloat(match[6] / 60))
        );
      } else if (
        (match = query.match(
          /^(\d{1,3})°?\s*(\d{1,3}(?:\.\d*)?)?['′]?\s*([NS])\W*(\d{1,3})°?\s*(\d{1,3}(?:\.\d*)?)?['′]?\s*([EW])$/
        ))
      ) {
        // degrees, decimal minutes [NSEW]
        center = Waymark_L.latLng(
          (/N/i.test(match[3]) ? 1 : -1) * (parseFloat(match[1]) + parseFloat(match[2] / 60)),
          (/E/i.test(match[6]) ? 1 : -1) * (parseFloat(match[4]) + parseFloat(match[5] / 60))
        );
      } else if (
        (match = query.match(
          /^([NS])\s*(\d{1,3})°?\s*(\d{1,2})['′]?\s*(\d{1,3}(?:\.\d*)?)?["″]?\W*([EW])\s*(\d{1,3})°?\s*(\d{1,2})['′]?\s*(\d{1,3}(?:\.\d*)?)?["″]?$/
        ))
      ) {
        // [NSEW] degrees, minutes, decimal seconds
        center = Waymark_L.latLng(
          (/N/i.test(match[1]) ? 1 : -1) *
            (parseFloat(match[2]) + parseFloat(match[3] / 60 + parseFloat(match[4] / 3600))),
          (/E/i.test(match[5]) ? 1 : -1) *
            (parseFloat(match[6]) + parseFloat(match[7] / 60) + parseFloat(match[8] / 3600))
        );
      } else if (
        (match = query.match(
          /^(\d{1,3})°?\s*(\d{1,2})['′]?\s*(\d{1,3}(?:\.\d*)?)?["″]\s*([NS])\W*(\d{1,3})°?\s*(\d{1,2})['′]?\s*(\d{1,3}(?:\.\d*)?)?["″]?\s*([EW])$/
        ))
      ) {
        // degrees, minutes, decimal seconds [NSEW]
        center = Waymark_L.latLng(
          (/N/i.test(match[4]) ? 1 : -1) *
            (parseFloat(match[1]) + parseFloat(match[2] / 60 + parseFloat(match[3] / 3600))),
          (/E/i.test(match[8]) ? 1 : -1) *
            (parseFloat(match[5]) + parseFloat(match[6] / 60) + parseFloat(match[7] / 3600))
        );
      } else if (
        (match = query.match(/^\s*([+-]?\d+(?:\.\d*)?)\s*[\s,]\s*([+-]?\d+(?:\.\d*)?)\s*$/))
      ) {
        center = Waymark_L.latLng(parseFloat(match[1]), parseFloat(match[2]));
      }
      if (center) {
        var results = [
          {
            name: query,
            center: center,
            bbox: center.toBounds(this.options.sizeInMeters)
          }
        ];
        cb.call(context, results);
      } else if (this.options.next) {
        this.options.next.geocode(query, cb, context);
      }
    }
  });

  function latLng(options) {
    return new LatLng(options);
  }

  var Mapbox = Waymark_L.Class.extend({
    options: {
      serviceUrl: 'https://api.mapbox.com/geocoding/v5/mapbox.places/',
      geocodingQueryParams: {},
      reverseQueryParams: {}
    },

    initialize: function(accessToken, options) {
      Waymark_L.setOptions(this, options);
      this.options.geocodingQueryParams.access_token = accessToken;
      this.options.reverseQueryParams.access_token = accessToken;
    },

    geocode: function(query, cb, context) {
      var params = this.options.geocodingQueryParams;
      if (
        params.proximity !== undefined &&
        params.proximity.lat !== undefined &&
        params.proximity.lng !== undefined
      ) {
        params.proximity = params.proximity.lng + ',' + params.proximity.lat;
      }
      getJSON(this.options.serviceUrl + encodeURIComponent(query) + '.json', params, function(data) {
        var results = [],
          loc,
          latLng,
          latLngBounds;
        if (data.features && data.features.length) {
          for (var i = 0; i <= data.features.length - 1; i++) {
            loc = data.features[i];
            latLng = Waymark_L.latLng(loc.center.reverse());
            if (loc.bbox) {
              latLngBounds = Waymark_L.latLngBounds(
                Waymark_L.latLng(loc.bbox.slice(0, 2).reverse()),
                Waymark_L.latLng(loc.bbox.slice(2, 4).reverse())
              );
            } else {
              latLngBounds = Waymark_L.latLngBounds(latLng, latLng);
            }

            var properties = {
              text: loc.text,
              address: loc.address
            };

            for (var j = 0; j < (loc.context || []).length; j++) {
              var id = loc.context[j].id.split('.')[0];
              properties[id] = loc.context[j].text;
            }

            results[i] = {
              name: loc.place_name,
              bbox: latLngBounds,
              center: latLng,
              properties: properties
            };
          }
        }

        cb.call(context, results);
      });
    },

    suggest: function(query, cb, context) {
      return this.geocode(query, cb, context);
    },

    reverse: function(location, scale, cb, context) {
      getJSON(
        this.options.serviceUrl +
          encodeURIComponent(location.lng) +
          ',' +
          encodeURIComponent(location.lat) +
          '.json',
        this.options.reverseQueryParams,
        function(data) {
          var results = [],
            loc,
            latLng,
            latLngBounds;
          if (data.features && data.features.length) {
            for (var i = 0; i <= data.features.length - 1; i++) {
              loc = data.features[i];
              latLng = Waymark_L.latLng(loc.center.reverse());
              if (loc.bbox) {
                latLngBounds = Waymark_L.latLngBounds(
                  Waymark_L.latLng(loc.bbox.slice(0, 2).reverse()),
                  Waymark_L.latLng(loc.bbox.slice(2, 4).reverse())
                );
              } else {
                latLngBounds = Waymark_L.latLngBounds(latLng, latLng);
              }
              results[i] = {
                name: loc.place_name,
                bbox: latLngBounds,
                center: latLng
              };
            }
          }

          cb.call(context, results);
        }
      );
    }
  });

  function mapbox(accessToken, options) {
    return new Mapbox(accessToken, options);
  }

  var MapQuest = Waymark_L.Class.extend({
    options: {
      serviceUrl: 'https://www.mapquestapi.com/geocoding/v1'
    },

    initialize: function(key, options) {
      // MapQuest seems to provide URI encoded API keys,
      // so to avoid encoding them twice, we decode them here
      this._key = decodeURIComponent(key);

      Waymark_L.Util.setOptions(this, options);
    },

    _formatName: function() {
      var r = [],
        i;
      for (i = 0; i < arguments.length; i++) {
        if (arguments[i]) {
          r.push(arguments[i]);
        }
      }

      return r.join(', ');
    },

    geocode: function(query, cb, context) {
      getJSON(
        this.options.serviceUrl + '/address',
        {
          key: this._key,
          location: query,
          limit: 5,
          outFormat: 'json'
        },
        Waymark_L.bind(function(data) {
          var results = [],
            loc,
            latLng;
          if (data.results && data.results[0].locations) {
            for (var i = data.results[0].locations.length - 1; i >= 0; i--) {
              loc = data.results[0].locations[i];
              latLng = Waymark_L.latLng(loc.latLng);
              results[i] = {
                name: this._formatName(loc.street, loc.adminArea4, loc.adminArea3, loc.adminArea1),
                bbox: Waymark_L.latLngBounds(latLng, latLng),
                center: latLng
              };
            }
          }

          cb.call(context, results);
        }, this)
      );
    },

    reverse: function(location, scale, cb, context) {
      getJSON(
        this.options.serviceUrl + '/reverse',
        {
          key: this._key,
          location: location.lat + ',' + location.lng,
          outputFormat: 'json'
        },
        Waymark_L.bind(function(data) {
          var results = [],
            loc,
            latLng;
          if (data.results && data.results[0].locations) {
            for (var i = data.results[0].locations.length - 1; i >= 0; i--) {
              loc = data.results[0].locations[i];
              latLng = Waymark_L.latLng(loc.latLng);
              results[i] = {
                name: this._formatName(loc.street, loc.adminArea4, loc.adminArea3, loc.adminArea1),
                bbox: Waymark_L.latLngBounds(latLng, latLng),
                center: latLng
              };
            }
          }

          cb.call(context, results);
        }, this)
      );
    }
  });

  function mapQuest(key, options) {
    return new MapQuest(key, options);
  }

  var Neutrino = Waymark_L.Class.extend({
    options: {
      userId: '<insert your userId here>',
      apiKey: '<insert your apiKey here>',
      serviceUrl: 'https://neutrinoapi.com/'
    },

    initialize: function(options) {
      Waymark_L.Util.setOptions(this, options);
    },

    // https://www.neutrinoapi.com/api/geocode-address/
    geocode: function(query, cb, context) {
      getJSON(
        this.options.serviceUrl + 'geocode-address',
        {
          apiKey: this.options.apiKey,
          userId: this.options.userId,
          //get three words and make a dot based string
          address: query.split(/\s+/).join('.')
        },
        function(data) {
          var results = [],
            latLng,
            latLngBounds;
          if (data.locations) {
            data.geometry = data.locations[0];
            latLng = Waymark_L.latLng(data.geometry['latitude'], data.geometry['longitude']);
            latLngBounds = Waymark_L.latLngBounds(latLng, latLng);
            results[0] = {
              name: data.geometry.address,
              bbox: latLngBounds,
              center: latLng
            };
          }

          cb.call(context, results);
        }
      );
    },

    suggest: function(query, cb, context) {
      return this.geocode(query, cb, context);
    },

    // https://www.neutrinoapi.com/api/geocode-reverse/
    reverse: function(location, scale, cb, context) {
      getJSON(
        this.options.serviceUrl + 'geocode-reverse',
        {
          apiKey: this.options.apiKey,
          userId: this.options.userId,
          latitude: location.lat,
          longitude: location.lng
        },
        function(data) {
          var results = [],
            latLng,
            latLngBounds;
          if (data.status.status == 200 && data.found) {
            latLng = Waymark_L.latLng(location.lat, location.lng);
            latLngBounds = Waymark_L.latLngBounds(latLng, latLng);
            results[0] = {
              name: data.address,
              bbox: latLngBounds,
              center: latLng
            };
          }
          cb.call(context, results);
        }
      );
    }
  });

  function neutrino(accessToken) {
    return new Neutrino(accessToken);
  }

  var Nominatim = Waymark_L.Class.extend({
    options: {
      serviceUrl: 'https://nominatim.openstreetmap.org/',
      geocodingQueryParams: {},
      reverseQueryParams: {},
      htmlTemplate: function(r) {
        var a = r.address,
          parts = [];
        if (a.road || a.building) {
          parts.push('{building} {road} {house_number}');
        }

        if (a.city || a.town || a.village || a.hamlet) {
          parts.push(
            '<span class="' +
              (parts.length > 0 ? 'leaflet-control-geocoder-address-detail' : '') +
              '">{postcode} {city} {town} {village} {hamlet}</span>'
          );
        }

        if (a.state || a.country) {
          parts.push(
            '<span class="' +
              (parts.length > 0 ? 'leaflet-control-geocoder-address-context' : '') +
              '">{state} {country}</span>'
          );
        }

        return template(parts.join('<br/>'), a, true);
      }
    },

    initialize: function(options) {
      Waymark_L.Util.setOptions(this, options);
    },

    geocode: function(query, cb, context) {
      getJSON(
        this.options.serviceUrl + 'search',
        Waymark_L.extend(
          {
            q: query,
            limit: 5,
            format: 'json',
            addressdetails: 1
          },
          this.options.geocodingQueryParams
        ),
        Waymark_L.bind(function(data) {
          var results = [];
          for (var i = data.length - 1; i >= 0; i--) {
            var bbox = data[i].boundingbox;
            for (var j = 0; j < 4; j++) bbox[j] = parseFloat(bbox[j]);
            results[i] = {
              icon: data[i].icon,
              name: data[i].display_name,
              html: this.options.htmlTemplate ? this.options.htmlTemplate(data[i]) : undefined,
              bbox: Waymark_L.latLngBounds([bbox[0], bbox[2]], [bbox[1], bbox[3]]),
              center: Waymark_L.latLng(data[i].lat, data[i].lon),
              properties: data[i]
            };
          }
          cb.call(context, results);
        }, this)
      );
    },

    reverse: function(location, scale, cb, context) {
      getJSON(
        this.options.serviceUrl + 'reverse',
        Waymark_L.extend(
          {
            lat: location.lat,
            lon: location.lng,
            zoom: Math.round(Math.log(scale / 256) / Math.log(2)),
            addressdetails: 1,
            format: 'json'
          },
          this.options.reverseQueryParams
        ),
        Waymark_L.bind(function(data) {
          var result = [],
            loc;

          if (data && data.lat && data.lon) {
            loc = Waymark_L.latLng(data.lat, data.lon);
            result.push({
              name: data.display_name,
              html: this.options.htmlTemplate ? this.options.htmlTemplate(data) : undefined,
              center: loc,
              bounds: Waymark_L.latLngBounds(loc, loc),
              properties: data
            });
          }

          cb.call(context, result);
        }, this)
      );
    }
  });

  function nominatim(options) {
    return new Nominatim(options);
  }

  var OpenLocationCode = Waymark_L.Class.extend({
    options: {
      OpenLocationCode: undefined,
      codeLength: undefined
    },

    initialize: function(options) {
      Waymark_L.setOptions(this, options);
    },

    geocode: function(query, cb, context) {
      try {
        var decoded = this.options.OpenLocationCode.decode(query);
        var result = {
          name: query,
          center: Waymark_L.latLng(decoded.latitudeCenter, decoded.longitudeCenter),
          bbox: Waymark_L.latLngBounds(
            Waymark_L.latLng(decoded.latitudeLo, decoded.longitudeLo),
            Waymark_L.latLng(decoded.latitudeHi, decoded.longitudeHi)
          )
        };
        cb.call(context, [result]);
      } catch (e) {
        console.warn(e); // eslint-disable-line no-console
        cb.call(context, []);
      }
    },
    reverse: function(location, scale, cb, context) {
      try {
        var code = this.options.OpenLocationCode.encode(
          location.lat,
          location.lng,
          this.options.codeLength
        );
        var result = {
          name: code,
          center: Waymark_L.latLng(location.lat, location.lng),
          bbox: Waymark_L.latLngBounds(
            Waymark_L.latLng(location.lat, location.lng),
            Waymark_L.latLng(location.lat, location.lng)
          )
        };
        cb.call(context, [result]);
      } catch (e) {
        console.warn(e); // eslint-disable-line no-console
        cb.call(context, []);
      }
    }
  });

  function openLocationCode(options) {
    return new OpenLocationCode(options);
  }

  var OpenCage = Waymark_L.Class.extend({
    options: {
      serviceUrl: 'https://api.opencagedata.com/geocode/v1/json'
    },

    initialize: function(apiKey) {
      this._accessToken = apiKey;
    },

    geocode: function(query, cb, context) {
      getJSON(
        this.options.serviceUrl,
        {
          key: this._accessToken,
          q: query
        },
        function(data) {
          var results = [],
            latLng,
            latLngBounds,
            loc;
          if (data.results && data.results.length) {
            for (var i = 0; i < data.results.length; i++) {
              loc = data.results[i];
              latLng = Waymark_L.latLng(loc.geometry);
              if (loc.annotations && loc.annotations.bounds) {
                latLngBounds = Waymark_L.latLngBounds(
                  Waymark_L.latLng(loc.annotations.bounds.northeast),
                  Waymark_L.latLng(loc.annotations.bounds.southwest)
                );
              } else {
                latLngBounds = Waymark_L.latLngBounds(latLng, latLng);
              }
              results.push({
                name: loc.formatted,
                bbox: latLngBounds,
                center: latLng
              });
            }
          }
          cb.call(context, results);
        }
      );
    },

    suggest: function(query, cb, context) {
      return this.geocode(query, cb, context);
    },

    reverse: function(location, scale, cb, context) {
      getJSON(
        this.options.serviceUrl,
        {
          key: this._accessToken,
          q: [location.lat, location.lng].join(',')
        },
        function(data) {
          var results = [],
            latLng,
            latLngBounds,
            loc;
          if (data.results && data.results.length) {
            for (var i = 0; i < data.results.length; i++) {
              loc = data.results[i];
              latLng = Waymark_L.latLng(loc.geometry);
              if (loc.annotations && loc.annotations.bounds) {
                latLngBounds = Waymark_L.latLngBounds(
                  Waymark_L.latLng(loc.annotations.bounds.northeast),
                  Waymark_L.latLng(loc.annotations.bounds.southwest)
                );
              } else {
                latLngBounds = Waymark_L.latLngBounds(latLng, latLng);
              }
              results.push({
                name: loc.formatted,
                bbox: latLngBounds,
                center: latLng
              });
            }
          }
          cb.call(context, results);
        }
      );
    }
  });

  function opencage(apiKey) {
    return new OpenCage(apiKey);
  }

  var Pelias = Waymark_L.Class.extend({
    options: {
      serviceUrl: 'https://api.geocode.earth/v1',
      geocodingQueryParams: {},
      reverseQueryParams: {}
    },

    initialize: function(apiKey, options) {
      Waymark_L.Util.setOptions(this, options);
      this._apiKey = apiKey;
      this._lastSuggest = 0;
    },

    geocode: function(query, cb, context) {
      var _this = this;
      getJSON(
        this.options.serviceUrl + '/search',
        Waymark_L.extend(
          {
            api_key: this._apiKey,
            text: query
          },
          this.options.geocodingQueryParams
        ),
        function(data) {
          cb.call(context, _this._parseResults(data, 'bbox'));
        }
      );
    },

    suggest: function(query, cb, context) {
      var _this = this;
      getJSON(
        this.options.serviceUrl + '/autocomplete',
        Waymark_L.extend(
          {
            api_key: this._apiKey,
            text: query
          },
          this.options.geocodingQueryParams
        ),
        Waymark_L.bind(function(data) {
          if (data.geocoding.timestamp > this._lastSuggest) {
            this._lastSuggest = data.geocoding.timestamp;
            cb.call(context, _this._parseResults(data, 'bbox'));
          }
        }, this)
      );
    },

    reverse: function(location, scale, cb, context) {
      var _this = this;
      getJSON(
        this.options.serviceUrl + '/reverse',
        Waymark_L.extend(
          {
            api_key: this._apiKey,
            'point.lat': location.lat,
            'point.lon': location.lng
          },
          this.options.reverseQueryParams
        ),
        function(data) {
          cb.call(context, _this._parseResults(data, 'bounds'));
        }
      );
    },

    _parseResults: function(data, bboxname) {
      var results = [];
      Waymark_L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
          return Waymark_L.circleMarker(latlng);
        },
        onEachFeature: function(feature, layer) {
          var result = {},
            bbox,
            center;

          if (layer.getBounds) {
            bbox = layer.getBounds();
            center = bbox.getCenter();
          } else if (layer.feature.bbox) {
            center = layer.getLatLng();
            bbox = Waymark_L.latLngBounds(
              Waymark_L.GeoJSON.coordsToLatLng(layer.feature.bbox.slice(0, 2)),
              Waymark_L.GeoJSON.coordsToLatLng(layer.feature.bbox.slice(2, 4))
            );
          } else {
            center = layer.getLatLng();
            bbox = Waymark_L.latLngBounds(center, center);
          }

          result.name = layer.feature.properties.label;
          result.center = center;
          result[bboxname] = bbox;
          result.properties = layer.feature.properties;
          results.push(result);
        }
      });
      return results;
    }
  });

  function pelias(apiKey, options) {
    return new Pelias(apiKey, options);
  }
  var GeocodeEarth = Pelias;
  var geocodeEarth = pelias;

  var Mapzen = Pelias; // r.i.p.
  var mapzen = pelias;

  var Openrouteservice = Mapzen.extend({
    options: {
      serviceUrl: 'https://api.openrouteservice.org/geocode'
    }
  });
  function openrouteservice(apiKey, options) {
    return new Openrouteservice(apiKey, options);
  }

  var Photon = Waymark_L.Class.extend({
    options: {
      serviceUrl: 'https://photon.komoot.de/api/',
      reverseUrl: 'https://photon.komoot.de/reverse/',
      nameProperties: ['name', 'street', 'suburb', 'hamlet', 'town', 'city', 'state', 'country']
    },

    initialize: function(options) {
      Waymark_L.setOptions(this, options);
    },

    geocode: function(query, cb, context) {
      var params = Waymark_L.extend(
        {
          q: query
        },
        this.options.geocodingQueryParams
      );

      getJSON(
        this.options.serviceUrl,
        params,
        Waymark_L.bind(function(data) {
          cb.call(context, this._decodeFeatures(data));
        }, this)
      );
    },

    suggest: function(query, cb, context) {
      return this.geocode(query, cb, context);
    },

    reverse: function(latLng, scale, cb, context) {
      var params = Waymark_L.extend(
        {
          lat: latLng.lat,
          lon: latLng.lng
        },
        this.options.reverseQueryParams
      );

      getJSON(
        this.options.reverseUrl,
        params,
        Waymark_L.bind(function(data) {
          cb.call(context, this._decodeFeatures(data));
        }, this)
      );
    },

    _decodeFeatures: function(data) {
      var results = [],
        i,
        f,
        c,
        latLng,
        extent,
        bbox;

      if (data && data.features) {
        for (i = 0; i < data.features.length; i++) {
          f = data.features[i];
          c = f.geometry.coordinates;
          latLng = Waymark_L.latLng(c[1], c[0]);
          extent = f.properties.extent;

          if (extent) {
            bbox = Waymark_L.latLngBounds([extent[1], extent[0]], [extent[3], extent[2]]);
          } else {
            bbox = Waymark_L.latLngBounds(latLng, latLng);
          }

          results.push({
            name: this._decodeFeatureName(f),
            html: this.options.htmlTemplate ? this.options.htmlTemplate(f) : undefined,
            center: latLng,
            bbox: bbox,
            properties: f.properties
          });
        }
      }

      return results;
    },

    _decodeFeatureName: function(f) {
      return (this.options.nameProperties || [])
        .map(function(p) {
          return f.properties[p];
        })
        .filter(function(v) {
          return !!v;
        })
        .join(', ');
    }
  });

  function photon(options) {
    return new Photon(options);
  }

  var What3Words = Waymark_L.Class.extend({
    options: {
      serviceUrl: 'https://api.what3words.com/v2/'
    },

    initialize: function(accessToken) {
      this._accessToken = accessToken;
    },

    geocode: function(query, cb, context) {
      //get three words and make a dot based string
      getJSON(
        this.options.serviceUrl + 'forward',
        {
          key: this._accessToken,
          addr: query.split(/\s+/).join('.')
        },
        function(data) {
          var results = [],
            latLng,
            latLngBounds;
          if (data.geometry) {
            latLng = Waymark_L.latLng(data.geometry['lat'], data.geometry['lng']);
            latLngBounds = Waymark_L.latLngBounds(latLng, latLng);
            results[0] = {
              name: data.words,
              bbox: latLngBounds,
              center: latLng
            };
          }

          cb.call(context, results);
        }
      );
    },

    suggest: function(query, cb, context) {
      return this.geocode(query, cb, context);
    },

    reverse: function(location, scale, cb, context) {
      getJSON(
        this.options.serviceUrl + 'reverse',
        {
          key: this._accessToken,
          coords: [location.lat, location.lng].join(',')
        },
        function(data) {
          var results = [],
            latLng,
            latLngBounds;
          if (data.status.status == 200) {
            latLng = Waymark_L.latLng(data.geometry['lat'], data.geometry['lng']);
            latLngBounds = Waymark_L.latLngBounds(latLng, latLng);
            results[0] = {
              name: data.words,
              bbox: latLngBounds,
              center: latLng
            };
          }
          cb.call(context, results);
        }
      );
    }
  });

  function what3words(accessToken) {
    return new What3Words(accessToken);
  }



  var geocoders = /*#__PURE__*/Object.freeze({
    ArcGis: ArcGis,
    arcgis: arcgis,
    Bing: Bing,
    bing: bing,
    Google: Google,
    google: google,
    HERE: HERE,
    here: here,
    LatLng: LatLng,
    latLng: latLng,
    Mapbox: Mapbox,
    mapbox: mapbox,
    MapQuest: MapQuest,
    mapQuest: mapQuest,
    Neutrino: Neutrino,
    neutrino: neutrino,
    Nominatim: Nominatim,
    nominatim: nominatim,
    OpenLocationCode: OpenLocationCode,
    openLocationCode: openLocationCode,
    OpenCage: OpenCage,
    opencage: opencage,
    Pelias: Pelias,
    pelias: pelias,
    GeocodeEarth: GeocodeEarth,
    geocodeEarth: geocodeEarth,
    Mapzen: Mapzen,
    mapzen: mapzen,
    Openrouteservice: Openrouteservice,
    openrouteservice: openrouteservice,
    Photon: Photon,
    photon: photon,
    What3Words: What3Words,
    what3words: what3words
  });

  var Geocoder = Waymark_L.Control.extend({
    options: {
      showUniqueResult: true,
      showResultIcons: false,
      collapsed: true,
      expand: 'touch', // options: touch, click, anythingelse
      position: 'topright',
      placeholder: 'Search...',
      errorMessage: 'Nothing found.',
      queryMinLength: 1,
      suggestMinLength: 3,
      suggestTimeout: 250,
      defaultMarkGeocode: true
    },

    includes: Waymark_L.Evented.prototype || Waymark_L.Mixin.Events,

    initialize: function(options) {
      Waymark_L.Util.setOptions(this, options);
      if (!this.options.geocoder) {
        this.options.geocoder = new Nominatim();
      }

      this._requestCount = 0;
    },

    addThrobberClass: function() {
      Waymark_L.DomUtil.addClass(this._container, 'leaflet-control-geocoder-throbber');
    },

    removeThrobberClass: function() {
      Waymark_L.DomUtil.removeClass(this._container, 'leaflet-control-geocoder-throbber');
    },

    onAdd: function(map) {
      var className = 'leaflet-control-geocoder',
        container = Waymark_L.DomUtil.create('div', className + ' leaflet-bar'),
        icon = Waymark_L.DomUtil.create('button', className + '-icon', container),
        form = (this._form = Waymark_L.DomUtil.create('div', className + '-form', container)),
        input;

      this._map = map;
      this._container = container;

      icon.innerHTML = '&nbsp;';
      icon.type = 'button';

      input = this._input = Waymark_L.DomUtil.create('input', '', form);
      input.type = 'text';
      input.placeholder = this.options.placeholder;
      Waymark_L.DomEvent.disableClickPropagation(input);

      this._errorElement = Waymark_L.DomUtil.create('div', className + '-form-no-error', container);
      this._errorElement.innerHTML = this.options.errorMessage;

      this._alts = Waymark_L.DomUtil.create(
        'ul',
        className + '-alternatives leaflet-control-geocoder-alternatives-minimized',
        container
      );
      Waymark_L.DomEvent.disableClickPropagation(this._alts);

      Waymark_L.DomEvent.addListener(input, 'keydown', this._keydown, this);
      if (this.options.geocoder.suggest) {
        Waymark_L.DomEvent.addListener(input, 'input', this._change, this);
      }
      Waymark_L.DomEvent.addListener(
        input,
        'blur',
        function() {
          if (this.options.collapsed && !this._preventBlurCollapse) {
            this._collapse();
          }
          this._preventBlurCollapse = false;
        },
        this
      );

      if (this.options.collapsed) {
        if (this.options.expand === 'click') {
          Waymark_L.DomEvent.addListener(
            container,
            'click',
            function(e) {
              if (e.button === 0 && e.detail !== 2) {
                this._toggle();
              }
            },
            this
          );
        } else if (Waymark_L.Browser.touch && this.options.expand === 'touch') {
          Waymark_L.DomEvent.addListener(
            container,
            'touchstart mousedown',
            function(e) {
              this._toggle();
              e.preventDefault(); // mobile: clicking focuses the icon, so UI expands and immediately collapses
              e.stopPropagation();
            },
            this
          );
        } else {
          Waymark_L.DomEvent.addListener(container, 'mouseover', this._expand, this);
          Waymark_L.DomEvent.addListener(container, 'mouseout', this._collapse, this);
          this._map.on('movestart', this._collapse, this);
        }
      } else {
        this._expand();
        if (Waymark_L.Browser.touch) {
          Waymark_L.DomEvent.addListener(
            container,
            'touchstart',
            function() {
              this._geocode();
            },
            this
          );
        } else {
          Waymark_L.DomEvent.addListener(
            container,
            'click',
            function() {
              this._geocode();
            },
            this
          );
        }
      }

      if (this.options.defaultMarkGeocode) {
        this.on('markgeocode', this.markGeocode, this);
      }

      this.on('startgeocode', this.addThrobberClass, this);
      this.on('finishgeocode', this.removeThrobberClass, this);
      this.on('startsuggest', this.addThrobberClass, this);
      this.on('finishsuggest', this.removeThrobberClass, this);

      Waymark_L.DomEvent.disableClickPropagation(container);

      return container;
    },

    _geocodeResult: function(results, suggest) {
      if (!suggest && this.options.showUniqueResult && results.length === 1) {
        this._geocodeResultSelected(results[0]);
      } else if (results.length > 0) {
        this._alts.innerHTML = '';
        this._results = results;
        Waymark_L.DomUtil.removeClass(this._alts, 'leaflet-control-geocoder-alternatives-minimized');
        Waymark_L.DomUtil.addClass(this._container, 'leaflet-control-geocoder-options-open');
        for (var i = 0; i < results.length; i++) {
          this._alts.appendChild(this._createAlt(results[i], i));
        }
      } else {
        Waymark_L.DomUtil.addClass(this._container, 'leaflet-control-geocoder-options-error');
        Waymark_L.DomUtil.addClass(this._errorElement, 'leaflet-control-geocoder-error');
      }
    },

    markGeocode: function(result) {
      result = result.geocode || result;

      this._map.fitBounds(result.bbox);

      if (this._geocodeMarker) {
        this._map.removeLayer(this._geocodeMarker);
      }

      this._geocodeMarker = new Waymark_L.Marker(result.center)
        .bindPopup(result.html || result.name)
        .addTo(this._map)
        .openPopup();

      return this;
    },

    _geocode: function(suggest) {
      var value = this._input.value;
      if (!suggest && value.length < this.options.queryMinLength) {
        return;
      }

      var requestCount = ++this._requestCount,
        mode = suggest ? 'suggest' : 'geocode',
        eventData = { input: value };

      this._lastGeocode = value;
      if (!suggest) {
        this._clearResults();
      }

      this.fire('start' + mode, eventData);
      this.options.geocoder[mode](
        value,
        function(results) {
          if (requestCount === this._requestCount) {
            eventData.results = results;
            this.fire('finish' + mode, eventData);
            this._geocodeResult(results, suggest);
          }
        },
        this
      );
    },

    _geocodeResultSelected: function(result) {
      this.fire('markgeocode', { geocode: result });
    },

    _toggle: function() {
      if (Waymark_L.DomUtil.hasClass(this._container, 'leaflet-control-geocoder-expanded')) {
        this._collapse();
      } else {
        this._expand();
      }
    },

    _expand: function() {
      Waymark_L.DomUtil.addClass(this._container, 'leaflet-control-geocoder-expanded');
      this._input.select();
      this.fire('expand');
    },

    _collapse: function() {
      Waymark_L.DomUtil.removeClass(this._container, 'leaflet-control-geocoder-expanded');
      Waymark_L.DomUtil.addClass(this._alts, 'leaflet-control-geocoder-alternatives-minimized');
      Waymark_L.DomUtil.removeClass(this._errorElement, 'leaflet-control-geocoder-error');
      Waymark_L.DomUtil.removeClass(this._container, 'leaflet-control-geocoder-options-open');
      Waymark_L.DomUtil.removeClass(this._container, 'leaflet-control-geocoder-options-error');
      this._input.blur(); // mobile: keyboard shouldn't stay expanded
      this.fire('collapse');
    },

    _clearResults: function() {
      Waymark_L.DomUtil.addClass(this._alts, 'leaflet-control-geocoder-alternatives-minimized');
      this._selection = null;
      Waymark_L.DomUtil.removeClass(this._errorElement, 'leaflet-control-geocoder-error');
      Waymark_L.DomUtil.removeClass(this._container, 'leaflet-control-geocoder-options-open');
      Waymark_L.DomUtil.removeClass(this._container, 'leaflet-control-geocoder-options-error');
    },

    _createAlt: function(result, index) {
      var li = Waymark_L.DomUtil.create('li', ''),
        a = Waymark_L.DomUtil.create('a', '', li),
        icon = this.options.showResultIcons && result.icon ? Waymark_L.DomUtil.create('img', '', a) : null,
        text = result.html ? undefined : document.createTextNode(result.name),
        mouseDownHandler = function mouseDownHandler(e) {
          // In some browsers, a click will fire on the map if the control is
          // collapsed directly after mousedown. To work around this, we
          // wait until the click is completed, and _then_ collapse the
          // control. Messy, but this is the workaround I could come up with
          // for #142.
          this._preventBlurCollapse = true;
          Waymark_L.DomEvent.stop(e);
          this._geocodeResultSelected(result);
          Waymark_L.DomEvent.on(
            li,
            'click',
            function() {
              if (this.options.collapsed) {
                this._collapse();
              } else {
                this._clearResults();
              }
            },
            this
          );
        };

      if (icon) {
        icon.src = result.icon;
      }

      li.setAttribute('data-result-index', index);

      if (result.html) {
        a.innerHTML = a.innerHTML + result.html;
      } else {
        a.appendChild(text);
      }

      // Use mousedown and not click, since click will fire _after_ blur,
      // causing the control to have collapsed and removed the items
      // before the click can fire.
      Waymark_L.DomEvent.addListener(li, 'mousedown touchstart', mouseDownHandler, this);

      return li;
    },

    _keydown: function(e) {
      var _this = this,
        select = function select(dir) {
          if (_this._selection) {
            Waymark_L.DomUtil.removeClass(_this._selection, 'leaflet-control-geocoder-selected');
            _this._selection = _this._selection[dir > 0 ? 'nextSibling' : 'previousSibling'];
          }
          if (!_this._selection) {
            _this._selection = _this._alts[dir > 0 ? 'firstChild' : 'lastChild'];
          }

          if (_this._selection) {
            Waymark_L.DomUtil.addClass(_this._selection, 'leaflet-control-geocoder-selected');
          }
        };

      switch (e.keyCode) {
        // Escape
        case 27:
          if (this.options.collapsed) {
            this._collapse();
          } else {
            this._clearResults();
          }
          break;
        // Up
        case 38:
          select(-1);
          break;
        // Up
        case 40:
          select(1);
          break;
        // Enter
        case 13:
          if (this._selection) {
            var index = parseInt(this._selection.getAttribute('data-result-index'), 10);
            this._geocodeResultSelected(this._results[index]);
            this._clearResults();
          } else {
            this._geocode();
          }
          break;
        default:
          return;
      }

      Waymark_L.DomEvent.preventDefault(e);
    },
    _change: function() {
      var v = this._input.value;
      if (v !== this._lastGeocode) {
        clearTimeout(this._suggestTimeout);
        if (v.length >= this.options.suggestMinLength) {
          this._suggestTimeout = setTimeout(
            Waymark_L.bind(function() {
              this._geocode(true);
            }, this),
            this.options.suggestTimeout
          );
        } else {
          this._clearResults();
        }
      }
    }
  });

  function geocoder(options) {
    return new Geocoder(options);
  }

  Waymark_L.Util.extend(Geocoder, geocoders);

  Waymark_L.Util.extend(Waymark_L.Control, {
    Geocoder: Geocoder,
    geocoder: geocoder
  });

  return Geocoder;

}(L));

/*! @license DOMPurify 3.4.13 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.13/LICENSE */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).DOMPurify=t()}(this,function(){"use strict";function e(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,o=Array(t);n<t;n++)o[n]=e[n];return o}function t(t,n){return function(e){if(Array.isArray(e))return e}(t)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var o,r,i,a,l=[],c=!0,s=!1;try{if(i=(n=n.call(e)).next,0===t);else for(;!(c=(o=i.call(n)).done)&&(l.push(o.value),l.length!==t);c=!0);}catch(e){s=!0,r=e}finally{try{if(!c&&null!=n.return&&(a=n.return(),Object(a)!==a))return}finally{if(s)throw r}}return l}}(t,n)||function(t,n){if(t){if("string"==typeof t)return e(t,n);var o={}.toString.call(t).slice(8,-1);return"Object"===o&&t.constructor&&(o=t.constructor.name),"Map"===o||"Set"===o?Array.from(t):"Arguments"===o||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)?e(t,n):void 0}}(t,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}const n=Object.entries,o=Object.setPrototypeOf,r=Object.isFrozen,i=Object.getPrototypeOf,a=Object.getOwnPropertyDescriptor;let l=Object.freeze,c=Object.seal,s=Object.create,u="undefined"!=typeof Reflect&&Reflect,f=u.apply,p=u.construct;l||(l=function(e){return e}),c||(c=function(e){return e}),f||(f=function(e,t){for(var n=arguments.length,o=new Array(n>2?n-2:0),r=2;r<n;r++)o[r-2]=arguments[r];return e.apply(t,o)}),p||(p=function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),o=1;o<t;o++)n[o-1]=arguments[o];return new e(...n)});const m=L(Array.prototype.forEach),d=L(Array.prototype.lastIndexOf),h=L(Array.prototype.pop),g=L(Array.prototype.push),y=L(Array.prototype.splice),b=Array.isArray,T=L(String.prototype.toLowerCase),S=L(String.prototype.toString),E=L(String.prototype.match),A=L(String.prototype.replace),N=L(String.prototype.indexOf),_=L(String.prototype.trim),w=L(Number.prototype.toString),O=L(Boolean.prototype.toString),v="undefined"==typeof BigInt?null:L(BigInt.prototype.toString),D="undefined"==typeof Symbol?null:L(Symbol.prototype.toString),R=L(Object.prototype.hasOwnProperty),C=L(Object.prototype.toString),I=L(RegExp.prototype.test),x=(k=TypeError,function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return p(k,t)});var k;function L(e){return function(t){t instanceof RegExp&&(t.lastIndex=0);for(var n=arguments.length,o=new Array(n>1?n-1:0),r=1;r<n;r++)o[r-1]=arguments[r];return f(e,t,o)}}function M(e,t){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:T;if(o&&o(e,null),!b(t))return e;let i=t.length;for(;i--;){let o=t[i];if("string"==typeof o){const e=n(o);e!==o&&(r(t)||(t[i]=e),o=e)}e[o]=!0}return e}function z(e){for(let t=0;t<e.length;t++){R(e,t)||(e[t]=null)}return e}function P(e){const o=s(null);for(const i of n(e)){var r=t(i,2);const n=r[0],a=r[1];R(e,n)&&(b(a)?o[n]=z(a):a&&"object"==typeof a&&a.constructor===Object?o[n]=P(a):o[n]=a)}return o}function U(e,t){for(;null!==e;){const n=a(e,t);if(n){if(n.get)return L(n.get);if("function"==typeof n.value)return L(n.value)}e=i(e)}return function(){return null}}const F=l(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),H=l(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),j=l(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),B=l(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),G=l(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),W=l(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),Y=l(["#text"]),q=l(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),X=l(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dominant-baseline","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-orientation","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),$=l(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),K=l(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),V=c(/{{[\w\W]*|^[\w\W]*}}/g),Z=c(/<%[\w\W]*|^[\w\W]*%>/g),J=c(/\${[\w\W]*/g),Q=c(/^data-[\-\w.\u00B7-\uFFFF]+$/),ee=c(/^aria-[\-\w]+$/),te=c(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),ne=c(/^(?:\w+script|data):/i),oe=c(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),re=c(/^html$/i),ie=c(/^[a-z][.\w]*(-[.\w]+)+$/i),ae=c(/<[/\w!]/g),le=c(/<[/\w]/g),ce=c(/<\/no(script|embed|frames)/i),se=c(/\/>/i),ue=1,fe=3,pe=7,me=8,de=9,he=11,ge=function(){return"undefined"==typeof window?null:window},ye=function(e,t,n,o){return R(e,t)&&b(e[t])?M(o.base?P(o.base):{},e[t],o.transform):n};var be=function e(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:ge();const o=t=>e(t);if(o.version="3.4.13",o.removed=[],!t||!t.document||t.document.nodeType!==de||!t.Element)return o.isSupported=!1,o;let r=t.document;const i=r,a=i.currentScript;t.DocumentFragment;const u=t.HTMLTemplateElement,f=t.Node,p=t.Element,k=t.NodeFilter,L=t.NamedNodeMap;void 0===L&&(t.NamedNodeMap||t.MozNamedAttrMap),t.HTMLFormElement;const z=t.DOMParser,be=t.trustedTypes,Te=p.prototype,Se=U(Te,"cloneNode"),Ee=U(Te,"remove"),Ae=U(Te,"nextSibling"),Ne=U(Te,"childNodes"),_e=U(Te,"parentNode"),we=U(Te,"shadowRoot"),Oe=U(Te,"attributes"),ve=f&&f.prototype?U(f.prototype,"nodeType"):null,De=f&&f.prototype?U(f.prototype,"nodeName"):null,Re=f&&f.prototype?U(f.prototype,"ownerDocument"):null;if("function"==typeof u){const e=r.createElement("template");e.content&&e.content.ownerDocument&&(r=e.content.ownerDocument)}let Ce,Ie,xe="",ke=!1,Le=0;const Me=function(){if(Le>0)throw x('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')},ze=function(e){Me(),Le++;try{return Ce.createHTML(e)}finally{Le--}},Pe=function(){return ke||(Ie=function(e,t){if("object"!=typeof e||"function"!=typeof e.createPolicy)return null;let n=null;const o="data-tt-policy-suffix";t&&t.hasAttribute(o)&&(n=t.getAttribute(o));const r="dompurify"+(n?"#"+n:"");try{return e.createPolicy(r,{createHTML:e=>e,createScriptURL:e=>e})}catch(e){return console.warn("TrustedTypes policy "+r+" could not be created."),null}}(be,a),ke=!0),Ie},Ue=r,Fe=Ue.implementation,He=Ue.createNodeIterator,je=Ue.createDocumentFragment,Be=Ue.getElementsByTagName,Ge=i.importNode;let We={afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]};o.isSupported="function"==typeof n&&"function"==typeof _e&&Fe&&void 0!==Fe.createHTMLDocument;const Ye=V,qe=Z,Xe=J,$e=Q,Ke=ee,Ve=ne,Ze=oe,Je=ie;let Qe=te,et=null;const tt=M({},[...F,...H,...j,...G,...Y]);let nt=null;const ot=M({},[...q,...X,...$,...K]);let rt=Object.seal(s(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),it=null,at=null;const lt=Object.seal(s(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let ct=!0,st=!0,ut=!1,ft=!0,pt=!1,mt=!0,dt=!1,ht=!1,gt=null,yt=null,bt=!1,Tt=!1,St=!1,Et=!1,At=!0,Nt=!1;const _t="user-content-";let wt=!0,Ot=!1,vt={},Dt=null;const Rt=M({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","selectedcontent","style","svg","template","thead","title","video","xmp"]);let Ct=null;const It=M({},["audio","video","img","source","image","track"]);let xt=null;const kt=M({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Lt="http://www.w3.org/1998/Math/MathML",Mt="http://www.w3.org/2000/svg",zt="http://www.w3.org/1999/xhtml";let Pt=zt,Ut=!1,Ft=null;const Ht=M({},[Lt,Mt,zt],S),jt=l(["mi","mo","mn","ms","mtext"]);let Bt=M({},jt);const Gt=l(["annotation-xml"]);let Wt=M({},Gt);const Yt=M({},["title","style","font","a","script"]);let qt=null;const Xt=["application/xhtml+xml","text/html"];let $t=null,Kt=null;const Vt=r.createElement("form"),Zt=function(e){return e instanceof RegExp||e instanceof Function},Jt=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(Kt&&Kt===e)return;e&&"object"==typeof e||(e={}),e=P(e),qt=-1===Xt.indexOf(e.PARSER_MEDIA_TYPE)?"text/html":e.PARSER_MEDIA_TYPE,$t="application/xhtml+xml"===qt?S:T,et=ye(e,"ALLOWED_TAGS",tt,{transform:$t}),nt=ye(e,"ALLOWED_ATTR",ot,{transform:$t}),Ft=ye(e,"ALLOWED_NAMESPACES",Ht,{transform:S}),xt=ye(e,"ADD_URI_SAFE_ATTR",kt,{transform:$t,base:kt}),Ct=ye(e,"ADD_DATA_URI_TAGS",It,{transform:$t,base:It}),Dt=ye(e,"FORBID_CONTENTS",Rt,{transform:$t}),it=ye(e,"FORBID_TAGS",P({}),{transform:$t}),at=ye(e,"FORBID_ATTR",P({}),{transform:$t}),vt=!!R(e,"USE_PROFILES")&&(e.USE_PROFILES&&"object"==typeof e.USE_PROFILES?P(e.USE_PROFILES):e.USE_PROFILES),ct=!1!==e.ALLOW_ARIA_ATTR,st=!1!==e.ALLOW_DATA_ATTR,ut=e.ALLOW_UNKNOWN_PROTOCOLS||!1,ft=!1!==e.ALLOW_SELF_CLOSE_IN_ATTR,pt=e.SAFE_FOR_TEMPLATES||!1,mt=!1!==e.SAFE_FOR_XML,dt=e.WHOLE_DOCUMENT||!1,Tt=e.RETURN_DOM||!1,St=e.RETURN_DOM_FRAGMENT||!1,Et=e.RETURN_TRUSTED_TYPE||!1,bt=e.FORCE_BODY||!1,At=!1!==e.SANITIZE_DOM,Nt=e.SANITIZE_NAMED_PROPS||!1,wt=!1!==e.KEEP_CONTENT,Ot=e.IN_PLACE||!1,Qe=function(e){try{return I(e,""),!0}catch(e){return!1}}(e.ALLOWED_URI_REGEXP)?e.ALLOWED_URI_REGEXP:te,Pt="string"==typeof e.NAMESPACE?e.NAMESPACE:zt,Bt=R(e,"MATHML_TEXT_INTEGRATION_POINTS")&&e.MATHML_TEXT_INTEGRATION_POINTS&&"object"==typeof e.MATHML_TEXT_INTEGRATION_POINTS?P(e.MATHML_TEXT_INTEGRATION_POINTS):M({},jt),Wt=R(e,"HTML_INTEGRATION_POINTS")&&e.HTML_INTEGRATION_POINTS&&"object"==typeof e.HTML_INTEGRATION_POINTS?P(e.HTML_INTEGRATION_POINTS):M({},Gt);const t=R(e,"CUSTOM_ELEMENT_HANDLING")&&e.CUSTOM_ELEMENT_HANDLING&&"object"==typeof e.CUSTOM_ELEMENT_HANDLING?P(e.CUSTOM_ELEMENT_HANDLING):s(null);if(rt=s(null),R(t,"tagNameCheck")&&Zt(t.tagNameCheck)&&(rt.tagNameCheck=t.tagNameCheck),R(t,"attributeNameCheck")&&Zt(t.attributeNameCheck)&&(rt.attributeNameCheck=t.attributeNameCheck),R(t,"allowCustomizedBuiltInElements")&&"boolean"==typeof t.allowCustomizedBuiltInElements&&(rt.allowCustomizedBuiltInElements=t.allowCustomizedBuiltInElements),c(rt),pt&&(st=!1),St&&(Tt=!0),vt&&(et=M({},Y),nt=s(null),!0===vt.html&&(M(et,F),M(nt,q)),!0===vt.svg&&(M(et,H),M(nt,X),M(nt,K)),!0===vt.svgFilters&&(M(et,j),M(nt,X),M(nt,K)),!0===vt.mathMl&&(M(et,G),M(nt,$),M(nt,K))),lt.tagCheck=null,lt.attributeCheck=null,R(e,"ADD_TAGS")&&("function"==typeof e.ADD_TAGS?lt.tagCheck=e.ADD_TAGS:b(e.ADD_TAGS)&&(et===tt&&(et=P(et)),M(et,e.ADD_TAGS,$t))),R(e,"ADD_ATTR")&&("function"==typeof e.ADD_ATTR?lt.attributeCheck=e.ADD_ATTR:b(e.ADD_ATTR)&&(nt===ot&&(nt=P(nt)),M(nt,e.ADD_ATTR,$t))),R(e,"ADD_URI_SAFE_ATTR")&&b(e.ADD_URI_SAFE_ATTR)&&M(xt,e.ADD_URI_SAFE_ATTR,$t),R(e,"FORBID_CONTENTS")&&b(e.FORBID_CONTENTS)&&(Dt===Rt&&(Dt=P(Dt)),M(Dt,e.FORBID_CONTENTS,$t)),R(e,"ADD_FORBID_CONTENTS")&&b(e.ADD_FORBID_CONTENTS)&&(Dt===Rt&&(Dt=P(Dt)),M(Dt,e.ADD_FORBID_CONTENTS,$t)),wt&&(et["#text"]=!0),dt&&M(et,["html","head","body"]),et.table&&(M(et,["tbody"]),delete it.tbody),e.TRUSTED_TYPES_POLICY){if("function"!=typeof e.TRUSTED_TYPES_POLICY.createHTML)throw x('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if("function"!=typeof e.TRUSTED_TYPES_POLICY.createScriptURL)throw x('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');const t=Ce;Ce=e.TRUSTED_TYPES_POLICY;try{xe=ze("")}catch(e){throw Ce=t,e}}else null===e.TRUSTED_TYPES_POLICY?(Ce=void 0,xe=""):(void 0===Ce&&(Ce=Pe()),Ce&&"string"==typeof xe&&(xe=ze("")));l&&l(e),Kt=e},Qt=M({},[...H,...j,...B]),en=M({},[...G,...W]),tn=function(e){let t=_e(e);t&&t.tagName||(t={namespaceURI:Pt,tagName:"template"});const n=T(e.tagName),o=T(t.tagName);return!!Ft[e.namespaceURI]&&(e.namespaceURI===Mt?function(e,t,n){return t.namespaceURI===zt?"svg"===e:t.namespaceURI===Lt?"svg"===e&&("annotation-xml"===n||Bt[n]):Boolean(Qt[e])}(n,t,o):e.namespaceURI===Lt?function(e,t,n){return t.namespaceURI===zt?"math"===e:t.namespaceURI===Mt?"math"===e&&Wt[n]:Boolean(en[e])}(n,t,o):e.namespaceURI===zt?function(e,t,n){return!(t.namespaceURI===Mt&&!Wt[n])&&!(t.namespaceURI===Lt&&!Bt[n])&&!en[e]&&(Yt[e]||!Qt[e])}(n,t,o):!("application/xhtml+xml"!==qt||!Ft[e.namespaceURI]))},nn=function(e){g(o.removed,{element:e});try{_e(e).removeChild(e)}catch(t){if(Ee(e),!_e(e))throw x("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")}},on=function(e){ln(e);const t=Ne(e);if(t){const e=[];m(t,t=>{g(e,t)}),m(e,e=>{try{Ee(e)}catch(e){}})}const n=Oe(e);if(n)for(let t=n.length-1;t>=0;--t){const o=n[t],r=o&&o.name;if("string"==typeof r)try{e.removeAttribute(r)}catch(e){}}},rn=function(e,t){try{g(o.removed,{attribute:t.getAttributeNode(e),from:t})}catch(e){g(o.removed,{attribute:null,from:t})}if(t.removeAttribute(e),"is"===e)if(Tt||St)try{nn(t)}catch(e){}else try{t.setAttribute(e,"")}catch(e){}},an=function(e){const t=Oe(e);if(t)for(let n=t.length-1;n>=0;--n){const o=t[n],r=o&&o.name;if("string"==typeof r&&!nt[$t(r)])try{e.removeAttribute(r)}catch(e){}}},ln=function(e){const t=[e];for(;t.length>0;){const e=t.pop();(ve?ve(e):e.nodeType)===ue&&an(e);const n=Ne(e);if(n)for(let e=n.length-1;e>=0;--e)t.push(n[e])}},cn=function(e){let t=null,n=null;if(bt)e="<remove></remove>"+e;else{const t=E(e,/^[\r\n\t ]+/);n=t&&t[0]}"application/xhtml+xml"===qt&&Pt===zt&&(e='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+e+"</body></html>");const o=Ce?ze(e):e;if(Pt===zt)try{t=(new z).parseFromString(o,qt)}catch(e){}if(!t||!t.documentElement){t=Fe.createDocument(Pt,"template",null);try{t.documentElement.innerHTML=Ut?xe:o}catch(e){}}const i=t.body||t.documentElement;return e&&n&&i.insertBefore(r.createTextNode(n),i.childNodes[0]||null),Pt===zt?Be.call(t,dt?"html":"body")[0]:dt?t.documentElement:i},sn=function(e){const t=Re?Re(e):e.ownerDocument;return He.call(t||e,e,k.SHOW_ELEMENT|k.SHOW_COMMENT|k.SHOW_TEXT|k.SHOW_PROCESSING_INSTRUCTION|k.SHOW_CDATA_SECTION,null)},un=function(e){return e=A(e,Ye," "),e=A(e,qe," "),e=A(e,Xe," ")},fn=function(e){var t;e.normalize();const n=Re?Re(e):e.ownerDocument,o=He.call(n||e,e,k.SHOW_TEXT|k.SHOW_COMMENT|k.SHOW_CDATA_SECTION|k.SHOW_PROCESSING_INSTRUCTION,null);let r=o.nextNode();for(;r;)r.data=un(r.data),r=o.nextNode();const i=null===(t=e.querySelectorAll)||void 0===t?void 0:t.call(e,"template");i&&m(i,e=>{mn(e.content)&&fn(e.content)})},pn=function(e){const t=De?De(e):null;return"string"==typeof t&&("form"===$t(t)&&("string"!=typeof e.nodeName||"string"!=typeof e.textContent||"function"!=typeof e.removeChild||e.attributes!==Oe(e)||"function"!=typeof e.removeAttribute||"function"!=typeof e.setAttribute||"string"!=typeof e.namespaceURI||"function"!=typeof e.insertBefore||"function"!=typeof e.hasChildNodes||e.nodeType!==ve(e)||e.childNodes!==Ne(e)))},mn=function(e){if(!ve||"object"!=typeof e||null===e)return!1;try{return ve(e)===he}catch(e){return!1}},dn=function(e){if(!ve||"object"!=typeof e||null===e)return!1;try{return"number"==typeof ve(e)}catch(e){return!1}};function hn(e,t,n){0!==e.length&&m(e,e=>{e.call(o,t,n,Kt)})}const gn=function(e,t,n,o){return 0===e.length?t:t===n||t===o?P(t):t},yn=function(e,t){if(hn(We.beforeSanitizeElements,e,null),e!==t&&null===_e(e))return Ot&&ln(e),!0;if(pn(e))return nn(e),!0;const n=$t(De?De(e):e.nodeName);if(et=gn(We.uponSanitizeElement,et,tt,gt),hn(We.uponSanitizeElement,e,{tagName:n,allowedTags:et}),e!==t&&null===_e(e))return Ot&&ln(e),!0;if(function(e,t){return!!(mt&&e.hasChildNodes()&&!dn(e.firstElementChild)&&I(ae,e.textContent)&&I(ae,e.innerHTML))||!(!mt||e.namespaceURI!==zt||"style"!==t||!dn(e.firstElementChild))||e.nodeType===pe||!(!mt||e.nodeType!==me||!I(le,e.data))}(e,n))return nn(e),!0;if(it[n]||!(lt.tagCheck instanceof Function&&lt.tagCheck(n))&&!et[n]){const o=function(e,t,n){if(!it[t]&&Sn(t)){if(rt.tagNameCheck instanceof RegExp&&I(rt.tagNameCheck,t))return!1;if(rt.tagNameCheck instanceof Function&&rt.tagNameCheck(t))return!1}if(wt&&!Dt[t]){const t=_e(e),o=Ne(e);if(o&&t)for(let r=o.length-1;r>=0;--r){const i=e===n?Se(o[r],!0):o[r];t.insertBefore(i,Ae(e))}}return nn(e),!0}(e,n,t);return!1===o&&hn(We.afterSanitizeElements,e,null),o}if((ve?ve(e):e.nodeType)===ue&&!tn(e))return nn(e),!0;if(("noscript"===n||"noembed"===n||"noframes"===n)&&I(ce,e.innerHTML))return nn(e),!0;if(pt&&e.nodeType===fe){const t=un(e.textContent);e.textContent!==t&&(g(o.removed,{element:e.cloneNode()}),e.textContent=t)}return hn(We.afterSanitizeElements,e,null),!1},bn=function(e,t,n){if(at[t])return!1;if(mt&&"patchsrc"===t)return!1;if(mt&&"for"===t&&"label"!==e&&"output"!==e)return!1;if(At&&("id"===t||"name"===t)&&(n in r||n in Vt))return!1;const o=nt[t]||lt.attributeCheck instanceof Function&&lt.attributeCheck(t,e);if(st&&I($e,t));else if(ct&&I(Ke,t));else if(o)if(xt[t]);else if(I(Qe,A(n,Ze,"")));else if("src"!==t&&"xlink:href"!==t&&"href"!==t||"script"===e||0!==N(n,"data:")||!Ct[e]){if(ut&&!I(Ve,A(n,Ze,"")));else if(n)return!1}else;else if(!(Sn(e)&&(rt.tagNameCheck instanceof RegExp&&I(rt.tagNameCheck,e)||rt.tagNameCheck instanceof Function&&rt.tagNameCheck(e))&&(rt.attributeNameCheck instanceof RegExp&&I(rt.attributeNameCheck,t)||rt.attributeNameCheck instanceof Function&&rt.attributeNameCheck(t,e))||"is"===t&&rt.allowCustomizedBuiltInElements&&(rt.tagNameCheck instanceof RegExp&&I(rt.tagNameCheck,n)||rt.tagNameCheck instanceof Function&&rt.tagNameCheck(n))))return!1;return!0},Tn=M({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),Sn=function(e){return!Tn[T(e)]&&I(Je,e)},En=function(e,t,n,o){if(Ce&&"object"==typeof be&&"function"==typeof be.getAttributeType&&!n)switch(be.getAttributeType(e,t)){case"TrustedHTML":return ze(o);case"TrustedScriptURL":return function(e){Me(),Le++;try{return Ce.createScriptURL(e)}finally{Le--}}(o)}return o},An=function(e,t,n,r){try{n?e.setAttributeNS(n,t,r):e.setAttribute(t,r),pn(e)?nn(e):h(o.removed)}catch(n){rn(t,e)}},Nn=function(e){hn(We.beforeSanitizeAttributes,e,null);const t=e.attributes;if(!t||pn(e))return;nt=gn(We.uponSanitizeAttribute,nt,ot,yt);const n={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:nt,forceKeepAttr:void 0};let o=t.length;const r=$t(e.nodeName);for(;o--;){const i=t[o],a=i.name,l=i.namespaceURI,c=i.value,s=$t(a),u=c;let f="value"===a?u:_(u);n.attrName=s,n.attrValue=f,n.keepAttr=!0,n.forceKeepAttr=void 0,hn(We.uponSanitizeAttribute,e,n),f=n.attrValue,!Nt||"id"!==s&&"name"!==s||0===N(f,_t)||(rn(a,e),f=_t+f),mt&&I(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,f)?rn(a,e):"attributename"===s&&E(f,"href")?rn(a,e):n.forceKeepAttr||(n.keepAttr&&(ft||!I(se,f))?(pt&&(f=un(f)),bn(r,s,f)?(f=En(r,s,l,f),f!==u&&An(e,a,l,f)):rn(a,e)):rn(a,e))}hn(We.afterSanitizeAttributes,e,null)},_n=function(e){let t=null;const n=sn(e);for(hn(We.beforeSanitizeShadowDOM,e,null);t=n.nextNode();){hn(We.uponSanitizeShadowNode,t,null),yn(t,e),Nn(t),mn(t.content)&&_n(t.content);if((ve?ve(t):t.nodeType)===ue){const e=we(t);mn(e)&&(wn(e),_n(e))}}hn(We.afterSanitizeShadowDOM,e,null)},wn=function(e){const t=[{node:e,shadow:null}];for(;t.length>0;){const e=t.pop();if(e.shadow){_n(e.shadow);continue}const n=e.node,o=(ve?ve(n):n.nodeType)===ue,r=Ne(n);if(r)for(let e=r.length-1;e>=0;--e)t.push({node:r[e],shadow:null});if(o){const e=De?De(n):null;if("string"==typeof e&&"template"===$t(e)){const e=n.content;mn(e)&&t.push({node:e,shadow:null})}}if(o){const e=we(n);mn(e)&&t.push({node:null,shadow:e},{node:e,shadow:null})}}};return o.sanitize=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=null,r=null,a=null,l=null;if(Ut=!e,Ut&&(e="\x3c!--\x3e"),"string"!=typeof e&&!dn(e)&&"string"!=typeof(e=function(e){switch(typeof e){case"string":return e;case"number":return w(e);case"boolean":return O(e);case"bigint":return v?v(e):"0";case"symbol":return D?D(e):"Symbol()";case"undefined":default:return C(e);case"function":case"object":{if(null===e)return C(e);const t=e,n=U(t,"toString");if("function"==typeof n){const e=n(t);return"string"==typeof e?e:C(e)}return C(e)}}}(e)))throw x("dirty is not a string, aborting");if(!o.isSupported)return e;ht?(et=gt,nt=yt):Jt(t),(We.uponSanitizeElement.length>0||We.uponSanitizeAttribute.length>0)&&(et=P(et)),We.uponSanitizeAttribute.length>0&&(nt=P(nt)),o.removed=[];const c=Ot&&"string"!=typeof e&&dn(e);if(c){!function(e){if(!mt)return;const t=[e];for(;t.length>0;){const e=t.pop(),n=ve?ve(e):e.nodeType;if(n===pe||n===me&&I(le,e.data)){try{Ee(e)}catch(e){}continue}if(n===ue){const t=e,n=$t(De?De(e):e.nodeName);try{t.hasAttribute&&t.hasAttribute("patchsrc")&&t.removeAttribute("patchsrc"),t.hasAttribute&&t.hasAttribute("for")&&"label"!==n&&"output"!==n&&t.removeAttribute("for")}catch(e){}}const o=Ne(e);if(o)for(let e=o.length-1;e>=0;--e)t.push(o[e])}}(e);const t=De?De(e):e.nodeName;if("string"==typeof t){const n=$t(t);if(!et[n]||it[n])throw on(e),x("root node is forbidden and cannot be sanitized in-place")}if(pn(e))throw on(e),x("root node is clobbered and cannot be sanitized in-place");try{wn(e)}catch(t){throw on(e),t}}else if(dn(e))n=cn("\x3c!----\x3e"),r=n.ownerDocument.importNode(e,!0),r.nodeType===ue&&"BODY"===r.nodeName||"HTML"===r.nodeName?n=r:n.appendChild(r),wn(r);else{if(!Tt&&!pt&&!dt&&-1===e.indexOf("<"))return Ce&&Et?ze(e):e;if(n=cn(e),!n)return Tt?null:Et?xe:""}n&&bt&&nn(n.firstChild);const s=c?e:n;try{const e=sn(s);for(;a=e.nextNode();)yn(a,s),Nn(a),mn(a.content)&&_n(a.content)}catch(t){throw c&&(on(e),m(o.removed,e=>{e.element&&ln(e.element)})),t}if(c)return m(o.removed,e=>{e.element&&ln(e.element)}),pt&&fn(e),e;if(Tt){if(pt&&fn(n),St)for(l=je.call(n.ownerDocument);n.firstChild;)l.appendChild(n.firstChild);else l=n;return(nt.shadowroot||nt.shadowrootmode)&&(l=Ge.call(i,l,!0)),l}let u=dt?n.outerHTML:n.innerHTML;return dt&&et["!doctype"]&&n.ownerDocument&&n.ownerDocument.doctype&&n.ownerDocument.doctype.name&&I(re,n.ownerDocument.doctype.name)&&(u="<!DOCTYPE "+n.ownerDocument.doctype.name+">\n"+u),pt&&(u=un(u)),Ce&&Et?ze(u):u},o.setConfig=function(){Jt(arguments.length>0&&void 0!==arguments[0]?arguments[0]:{}),ht=!0,gt=et,yt=nt},o.clearConfig=function(){Kt=null,ht=!1,gt=null,yt=null,Ce=Ie,xe=""},o.isValidAttribute=function(e,t,n){Kt||Jt({});const o=$t(e),r=$t(t);return bn(o,r,n)},o.addHook=function(e,t){"function"==typeof t&&R(We,e)&&g(We[e],t)},o.removeHook=function(e,t){if(R(We,e)){if(void 0!==t){const n=d(We[e],t);return-1===n?void 0:y(We[e],n,1)[0]}return h(We[e])}},o.removeHooks=function(e){R(We,e)&&(We[e]=[])},o.removeAllHooks=function(){We={afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}},o}();return be});
//# sourceMappingURL=purify.min.js.map

/*! Version: 0.67.0
Copyright (c) 2016 Dominik Moritz */

!function(t,i){"function"==typeof define&&define.amd?define(["leaflet"],t):"object"==typeof exports&&(void 0!==i&&i.L?module.exports=t(L):module.exports=t(require("leaflet"))),void 0!==i&&i.L&&(i.Waymark_L.Control.Locate=t(L))}(function(h){var o=function(i,o,t){(t=t.split(" ")).forEach(function(t){h.DomUtil[i].call(this,o,t)})},i=function(t,i){o("addClass",t,i)},s=function(t,i){o("removeClass",t,i)},t=h.Marker.extend({initialize:function(t,i){h.Util.setOptions(this,i),this._latlng=t,this.createIcon()},createIcon:function(){var t=this.options,i="";void 0!==t.color&&(i+="stroke:"+t.color+";"),void 0!==t.weight&&(i+="stroke-width:"+t.weight+";"),void 0!==t.fillColor&&(i+="fill:"+t.fillColor+";"),void 0!==t.fillOpacity&&(i+="fill-opacity:"+t.fillOpacity+";"),void 0!==t.opacity&&(i+="opacity:"+t.opacity+";");var o=this._getIconSVG(t,i);this._locationIcon=h.divIcon({className:o.className,html:o.svg,iconSize:[o.w,o.h]}),this.setIcon(this._locationIcon)},_getIconSVG:function(t,i){var o=t.radius,s=o+t.weight,e=2*s;return{className:"leaflet-control-locate-location",svg:'<svg xmlns="http://www.w3.org/2000/svg" width="'+e+'" height="'+e+'" version="1.1" viewBox="-'+s+" -"+s+" "+e+" "+e+'"><circle r="'+o+'" style="'+i+'" /></svg>',w:e,h:e}},setStyle:function(t){h.Util.setOptions(this,t),this.createIcon()}}),e=t.extend({initialize:function(t,i,o){h.Util.setOptions(this,o),this._latlng=t,this._heading=i,this.createIcon()},setHeading:function(t){this._heading=t},_getIconSVG:function(t,i){var o=t.radius,s=t.width+t.weight,e=2*(o+t.depth+t.weight),n="M0,0 l"+t.width/2+","+t.depth+" l-"+s+",0 z";return{className:"leaflet-control-locate-heading",svg:'<svg xmlns="http://www.w3.org/2000/svg" width="'+s+'" height="'+e+'" version="1.1" viewBox="-'+s/2+" 0 "+s+" "+e+'" style="'+("transform: rotate("+this._heading+"deg)")+'"><path d="'+n+'" style="'+i+'" /></svg>',w:s,h:e}}}),n=h.Control.extend({options:{position:"topleft",layer:void 0,setView:"untilPanOrZoom",keepCurrentZoomLevel:!1,getLocationBounds:function(t){return t.bounds},flyTo:!1,clickBehavior:{inView:"stop",outOfView:"setView",inViewNotFollowing:"inView"},returnToPrevBounds:!1,cacheLocation:!0,drawCircle:!0,drawMarker:!0,showCompass:!0,markerClass:t,compassClass:e,circleStyle:{className:"leaflet-control-locate-circle",color:"#136AEC",fillColor:"#136AEC",fillOpacity:.15,weight:0},markerStyle:{className:"leaflet-control-locate-marker",color:"#fff",fillColor:"#2A93EE",fillOpacity:1,weight:3,opacity:1,radius:9},compassStyle:{fillColor:"#2A93EE",fillOpacity:1,weight:0,color:"#fff",opacity:1,radius:9,width:9,depth:6},followCircleStyle:{},followMarkerStyle:{},followCompassStyle:{},icon:"fa fa-map-marker",iconLoading:"fa fa-spinner fa-spin",iconElementTag:"span",circlePadding:[0,0],metric:!0,createButtonCallback:function(t,i){var o=h.DomUtil.create("a","leaflet-bar-part leaflet-bar-part-single",t);return o.title=i.strings.title,{link:o,icon:h.DomUtil.create(i.iconElementTag,i.icon,o)}},onLocationError:function(t,i){alert(t.message)},onLocationOutsideMapBounds:function(t){t.stop(),alert(t.options.strings.outsideMapBoundsMsg)},showPopup:!0,strings:{title:"Show me where I am",metersUnit:"meters",feetUnit:"feet",popup:"You are within {distance} {unit} from this point",outsideMapBoundsMsg:"You seem located outside the boundaries of the map"},locateOptions:{maxZoom:1/0,watch:!0,setView:!1}},initialize:function(t){for(var i in t)"object"==typeof this.options[i]?h.extend(this.options[i],t[i]):this.options[i]=t[i];this.options.followMarkerStyle=h.extend({},this.options.markerStyle,this.options.followMarkerStyle),this.options.followCircleStyle=h.extend({},this.options.circleStyle,this.options.followCircleStyle),this.options.followCompassStyle=h.extend({},this.options.compassStyle,this.options.followCompassStyle)},onAdd:function(t){var i=h.DomUtil.create("div","leaflet-control-locate leaflet-bar leaflet-control");this._layer=this.options.layer||new h.LayerGroup,this._layer.addTo(t),this._event=void 0,this._compassHeading=null,this._prevBounds=null;var o=this.options.createButtonCallback(i,this.options);return this._link=o.link,this._icon=o.icon,h.DomEvent.on(this._link,"click",h.DomEvent.stopPropagation).on(this._link,"click",h.DomEvent.preventDefault).on(this._link,"click",this._onClick,this).on(this._link,"dblclick",h.DomEvent.stopPropagation),this._resetVariables(),this._map.on("unload",this._unload,this),i},_onClick:function(){this._justClicked=!0;var t=this._isFollowing();if(this._userPanned=!1,this._userZoomed=!1,this._active&&!this._event)this.stop();else if(this._active&&void 0!==this._event){var i=this.options.clickBehavior,o=i.outOfView;switch(this._map.getBounds().contains(this._event.latlng)&&(o=t?i.inView:i.inViewNotFollowing),i[o]&&(o=i[o]),o){case"setView":this.setView();break;case"stop":if(this.stop(),this.options.returnToPrevBounds)(this.options.flyTo?this._map.flyToBounds:this._map.fitBounds).bind(this._map)(this._prevBounds)}}else this.options.returnToPrevBounds&&(this._prevBounds=this._map.getBounds()),this.start();this._updateContainerStyle()},start:function(){this._activate(),this._event&&(this._drawMarker(this._map),this.options.setView&&this.setView()),this._updateContainerStyle()},stop:function(){this._deactivate(),this._cleanClasses(),this._resetVariables(),this._removeMarker()},stopFollowing:function(){this._userPanned=!0,this._updateContainerStyle(),this._drawMarker()},_activate:function(){this._active||(this._map.locate(this.options.locateOptions),this._active=!0,this._map.on("locationfound",this._onLocationFound,this),this._map.on("locationerror",this._onLocationError,this),this._map.on("dragstart",this._onDrag,this),this._map.on("zoomstart",this._onZoom,this),this._map.on("zoomend",this._onZoomEnd,this),this.options.showCompass&&("ondeviceorientationabsolute"in window?h.DomEvent.on(window,"deviceorientationabsolute",this._onDeviceOrientation,this):"ondeviceorientation"in window&&h.DomEvent.on(window,"deviceorientation",this._onDeviceOrientation,this)))},_deactivate:function(){this._map.stopLocate(),this._active=!1,this.options.cacheLocation||(this._event=void 0),this._map.off("locationfound",this._onLocationFound,this),this._map.off("locationerror",this._onLocationError,this),this._map.off("dragstart",this._onDrag,this),this._map.off("zoomstart",this._onZoom,this),this._map.off("zoomend",this._onZoomEnd,this),this.options.showCompass&&(this._compassHeading=null,"ondeviceorientationabsolute"in window?h.DomEvent.off(window,"deviceorientationabsolute",this._onDeviceOrientation,this):"ondeviceorientation"in window&&h.DomEvent.off(window,"deviceorientation",this._onDeviceOrientation,this))},setView:function(){if(this._drawMarker(),this._isOutsideMapBounds())this._event=void 0,this.options.onLocationOutsideMapBounds(this);else if(this.options.keepCurrentZoomLevel){(t=this.options.flyTo?this._map.flyTo:this._map.panTo).bind(this._map)([this._event.latitude,this._event.longitude])}else{var t=this.options.flyTo?this._map.flyToBounds:this._map.fitBounds;this._ignoreEvent=!0,t.bind(this._map)(this.options.getLocationBounds(this._event),{padding:this.options.circlePadding,maxZoom:this.options.locateOptions.maxZoom}),h.Util.requestAnimFrame(function(){this._ignoreEvent=!1},this)}},_drawCompass:function(){if(this._event){var t=this._event.latlng;if(this.options.showCompass&&t&&null!==this._compassHeading){var i=this._isFollowing()?this.options.followCompassStyle:this.options.compassStyle;this._compass?(this._compass.setLatLng(t),this._compass.setHeading(this._compassHeading),this._compass.setStyle&&this._compass.setStyle(i)):this._compass=new this.options.compassClass(t,this._compassHeading,i).addTo(this._layer)}!this._compass||this.options.showCompass&&null!==this._compassHeading||(this._compass.removeFrom(this._layer),this._compass=null)}},_drawMarker:function(){void 0===this._event.accuracy&&(this._event.accuracy=0);var t,i,o=this._event.accuracy,s=this._event.latlng;if(this.options.drawCircle){var e=this._isFollowing()?this.options.followCircleStyle:this.options.circleStyle;this._circle?this._circle.setLatLng(s).setRadius(o).setStyle(e):this._circle=h.circle(s,o,e).addTo(this._layer)}if(i=this.options.metric?(t=o.toFixed(0),this.options.strings.metersUnit):(t=(3.2808399*o).toFixed(0),this.options.strings.feetUnit),this.options.drawMarker){var n=this._isFollowing()?this.options.followMarkerStyle:this.options.markerStyle;this._marker?(this._marker.setLatLng(s),this._marker.setStyle&&this._marker.setStyle(n)):this._marker=new this.options.markerClass(s,n).addTo(this._layer)}this._drawCompass();var a=this.options.strings.popup;this.options.showPopup&&a&&this._marker&&this._marker.bindPopup(h.Util.template(a,{distance:t,unit:i}))._popup.setLatLng(s),this.options.showPopup&&a&&this._compass&&this._compass.bindPopup(h.Util.template(a,{distance:t,unit:i}))._popup.setLatLng(s)},_removeMarker:function(){this._layer.clearLayers(),this._marker=void 0,this._circle=void 0},_unload:function(){this.stop(),this._map.off("unload",this._unload,this)},_setCompassHeading:function(t){!isNaN(parseFloat(t))&&isFinite(t)?(t=Math.round(t),this._compassHeading=t,h.Util.requestAnimFrame(this._drawCompass,this)):this._compassHeading=null},_onCompassNeedsCalibration:function(){this._setCompassHeading()},_onDeviceOrientation:function(t){this._active&&(t.webkitCompassHeading?this._setCompassHeading(t.webkitCompassHeading):t.absolute&&t.alpha&&this._setCompassHeading(360-t.alpha))},_onLocationError:function(t){3==t.code&&this.options.locateOptions.watch||(this.stop(),this.options.onLocationError(t,this))},_onLocationFound:function(t){if((!this._event||this._event.latlng.lat!==t.latlng.lat||this._event.latlng.lng!==t.latlng.lng||this._event.accuracy!==t.accuracy)&&this._active){switch(this._event=t,this._drawMarker(),this._updateContainerStyle(),this.options.setView){case"once":this._justClicked&&this.setView();break;case"untilPan":this._userPanned||this.setView();break;case"untilPanOrZoom":this._userPanned||this._userZoomed||this.setView();break;case"always":this.setView()}this._justClicked=!1}},_onDrag:function(){this._event&&!this._ignoreEvent&&(this._userPanned=!0,this._updateContainerStyle(),this._drawMarker())},_onZoom:function(){this._event&&!this._ignoreEvent&&(this._userZoomed=!0,this._updateContainerStyle(),this._drawMarker())},_onZoomEnd:function(){this._event&&this._drawCompass(),this._event&&!this._ignoreEvent&&this._marker&&!this._map.getBounds().pad(-.3).contains(this._marker.getLatLng())&&(this._userPanned=!0,this._updateContainerStyle(),this._drawMarker())},_isFollowing:function(){return!!this._active&&("always"===this.options.setView||("untilPan"===this.options.setView?!this._userPanned:"untilPanOrZoom"===this.options.setView?!this._userPanned&&!this._userZoomed:void 0))},_isOutsideMapBounds:function(){return void 0!==this._event&&(this._map.options.maxBounds&&!this._map.options.maxBounds.contains(this._event.latlng))},_updateContainerStyle:function(){this._container&&(this._active&&!this._event?this._setClasses("requesting"):this._isFollowing()?this._setClasses("following"):this._active?this._setClasses("active"):this._cleanClasses())},_setClasses:function(t){"requesting"==t?(s(this._container,"active following"),i(this._container,"requesting"),s(this._icon,this.options.icon),i(this._icon,this.options.iconLoading)):"active"==t?(s(this._container,"requesting following"),i(this._container,"active"),s(this._icon,this.options.iconLoading),i(this._icon,this.options.icon)):"following"==t&&(s(this._container,"requesting"),i(this._container,"active following"),s(this._icon,this.options.iconLoading),i(this._icon,this.options.icon))},_cleanClasses:function(){h.DomUtil.removeClass(this._container,"requesting"),h.DomUtil.removeClass(this._container,"active"),h.DomUtil.removeClass(this._container,"following"),s(this._icon,this.options.iconLoading),i(this._icon,this.options.icon)},_resetVariables:function(){this._active=!1,this._justClicked=!1,this._userPanned=!1,this._userZoomed=!1}});return h.control.locate=function(t){return new h.Control.Locate(t)},n},window);

(function (factory) {
  typeof define === "function" && define.amd ? define(factory) : factory();
})(function () {
  "use strict";

  // Following https://github.com/Leaflet/Leaflet/blob/master/PLUGIN-GUIDE.md
  (function (factory, window) {
    // define an AMD module that relies on 'leaflet'
    if (typeof define === "function" && define.amd) {
      define(["leaflet"], factory);

      // define a Common JS module that relies on 'leaflet'
    } else if (typeof exports === "object") {
      module.exports = factory(require("leaflet"));
    }

    // attach your plugin to the global 'L' variable
    if (typeof window !== "undefined" && window.L) {
      factory(window.L);
    }
  })(function (L) {
    Waymark_L.locales = {};
    Waymark_L.locale = null;
    Waymark_L.registerLocale = function registerLocale(code, locale) {
      Waymark_L.locales[code] = Waymark_L.Util.extend(
        {},
        Waymark_L.locales[code],
        locale,
      );
    };
    Waymark_L.setLocale = function setLocale(code) {
      Waymark_L.locale = code;
    };
    Waymark_L.numberLocale = null;
    Waymark_L.formatNumber = function formatNumber(value, decimals) {
      try {
        return new Intl.NumberFormat(Waymark_L.numberLocale || undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
      } catch (err) {
        return Number(value).toFixed(decimals);
      }
    };
    return (Waymark_L.i18n = Waymark_L._ =
      function translate(string, data) {
        if (
          Waymark_L.locale &&
          Waymark_L.locales[Waymark_L.locale] &&
          Waymark_L.locales[Waymark_L.locale][string]
        ) {
          string = Waymark_L.locales[Waymark_L.locale][string];
        }
        try {
          // Do not fail if some data is missing
          // a bad translation should not break the app
          string = Waymark_L.Util.template(string, data);
        } catch (err) {
          /*pass*/
        }

        return string;
      });
  }, window);

  /*
   * Copyright (c) 2019, GPL-3.0+ Project, Raruto
   *
   *  This file is free software: you may copy, redistribute and/or modify it
   *  under the terms of the GNU General Public License as published by the
   *  Free Software Foundation, either version 2 of the License, or (at your
   *  option) any later version.
   *
   *  This file is distributed in the hope that it will be useful, but
   *  WITHOUT ANY WARRANTY; without even the implied warranty of
   *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
   *  General Public License for more details.
   *
   *  You should have received a copy of the GNU General Public License
   *  along with this program.  If not, see .
   *
   * This file incorporates work covered by the following copyright and
   * permission notice:
   *
   *     Copyright (c) 2013-2016, MIT License, Felix “MrMufflon” Bache
   *
   *     Permission to use, copy, modify, and/or distribute this software
   *     for any purpose with or without fee is hereby granted, provided
   *     that the above copyright notice and this permission notice appear
   *     in all copies.
   *
   *     THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL
   *     WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED
   *     WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE
   *     AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR
   *     CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
   *     OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT,
   *     NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
   *     CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   */

  Waymark_L.Control.Elevation = Waymark_L.Control.extend({
    includes: Waymark_L.Evented
      ? Waymark_L.Evented.prototype
      : Waymark_L.Mixin.Events,

    options: {
      autohide: !Waymark_L.Browser.mobile,
      autohideMarker: true,
      collapsed: false,
      controlButton: {
        iconCssClass: "elevation-toggle-icon",
        title: "Elevation",
      },
      detached: true,
      distanceFactor: 1,
      dragging: !Waymark_L.Browser.mobile,
      downloadLink: "link",
      elevationDiv: "#elevation-div",
      followMarker: true,
      forceAxisBounds: false,
      gpxOptions: {
        async: true,
        marker_options: {
          startIconUrl: null,
          endIconUrl: null,
          shadowUrl: null,
          wptIcons: {
            "": Waymark_L.divIcon({
              className: "elevation-waypoint-marker",
              html: '<i class="elevation-waypoint-icon"></i>',
              iconSize: [30, 30],
              iconAnchor: [8, 30],
            }),
          },
        },
      },
      height: 200,
      heightFactor: 1,
      hoverNumber: {
        decimalsX: 2,
        decimalsY: 0,
        formatter: undefined,
      },
      imperial: false,
      interpolation: "curveLinear",
      lazyLoadJS: true,
      legend: true,
      loadData: {
        defer: false,
        lazy: false,
      },
      marker: "elevation-line",
      markerIcon: Waymark_L.divIcon({
        className: "elevation-position-marker",
        html: '<i class="elevation-position-icon"></i>',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
      placeholder: false,
      position: "topright",
      polyline: {
        className: "elevation-polyline",
        color: "#000",
        opacity: 0.75,
        weight: 5,
        lineCap: "round",
      },
      reverseCoords: false,
      skipNullZCoords: false,
      theme: "lightblue-theme",
      margins: {
        top: 10,
        right: 20,
        bottom: 30,
        left: 50,
      },
      responsive: true,
      summary: "inline",
      width: 600,
      xLabel: "km",
      xTicks: undefined,
      yAxisMax: undefined,
      yAxisMin: undefined,
      yLabel: "m",
      yTicks: undefined,
      zFollow: 13,
    },
    __mileFactor: 0.621371,
    __footFactor: 3.28084,

    /*
     * Add data to the diagram either from GPX or GeoJSON and update the axis domain and data
     */
    addData: function (d, layer) {
      Waymark_L.Control.Elevation._d3LazyLoader = this._lazyLoadJS(
        "https://unpkg.com/d3@5.15.0/dist/d3.min.js",
        typeof d3 !== "object",
        Waymark_L.Control.Elevation._d3LazyLoader,
      ).then(
        function (d, layer) {
          this._addData(d);

          if (this._container) {
            this._applyData();
          }
          if ((typeof layer === "undefined" || layer === null) && d.on) {
            layer = d;
          }
          if (layer) {
            if (layer._path) {
              Waymark_L.DomUtil.addClass(
                layer._path,
                this.options.polyline.className + " " + this.options.theme,
              );
            }
            layer
              .on("mousemove", this._mousemoveLayerHandler, this)
              .on("mouseout", this._mouseoutHandler, this);
          }

          this.track_info = Waymark_L.extend({}, this.track_info, {
            distance: this._distance,
            elevation_max: this._maxElevation,
            elevation_min: this._minElevation,
            ascent: this._ascent,
            descent: this._descent,
          });

          this._layers = this._layers || {};
          this._layers[Waymark_L.Util.stamp(layer)] = layer;

          this._fireEvt(
            "eledata_added",
            { data: d, layer: layer, track_info: this.track_info },
            true,
          );
        }.bind(this, d, layer),
      );
    },

    /**
     * Adds the control to the given map.
     */
    addTo: function (map) {
      if (this.options.detached) {
        this._appendElevationDiv(map._container).appendChild(this.onAdd(map));
      } else {
        Waymark_L.Control.prototype.addTo.call(this, map);
      }
      return this;
    },

    /*
     * Reset data and display
     */
    clear: function () {
      this._clearPath();
      this._clearChart();
      this._clearData();

      this._fireEvt("eledata_clear");
    },

    /**
     * Disable dragging chart on touch events.
     */
    disableDragging: function () {
      this._draggingEnabled = false;
      this._resetDrag();
    },

    /**
     * Enable dragging chart on touch events.
     */
    enableDragging: function () {
      this._draggingEnabled = true;
    },

    /**
     * Sets a map view that contains the given geographical bounds.
     */
    fitBounds: function (bounds) {
      bounds = bounds || this._fullExtent;
      if (this._map && bounds) this._map.fitBounds(bounds);
    },

    /**
     * Get default zoom level when "followMarker" is true.
     */
    getZFollow: function () {
      return this._zFollow;
    },

    /**
     * Hide current elevation chart profile.
     */
    hide: function () {
      this._container.style.display = "none";
    },

    /**
     * Initialize chart control "options" and "container".
     */
    initialize: function (options) {
      this.options = this._deepMerge({}, this.options, options);

      if (this.options.imperial) {
        this._distanceFactor = this.__mileFactor;
        this._heightFactor = this.__footFactor;
        this._xLabel = this.options.xLabel || "mi";
        this._yLabel = this.options.yLabel || "ft";
      } else {
        this._distanceFactor = this.options.distanceFactor;
        this._heightFactor = this.options.heightFactor;
        this._xLabel = this.options.xLabel;
        this._yLabel = this.options.yLabel;
      }

      this._chartEnabled = true;
      this._draggingEnabled = this.options.dragging;
      this._zFollow = this.options.zFollow;

      if (this.options.followMarker)
        this._setMapView = Waymark_L.Util.throttle(this._setMapView, 300, this);
      if (this.options.placeholder)
        this.options.loadData.lazy = this.options.loadData.defer = true;

      this.on("waypoint_added", function (e) {
        if (e.point._popup) {
          e.point._popup.options.className = "elevation-popup";
          e.point._popup._content = decodeURI(e.point._popup._content);
        }
        if (e.point._popup && e.point._popup._content) {
          e.point
            .bindTooltip(e.point._popup._content, {
              direction: "top",
              sticky: true,
              opacity: 1,
              className: "elevation-tooltip",
            })
            .openTooltip();
        }
      });
    },

    /**
     * Alias for loadData
     */
    load: function (data, opts) {
      this.loadData(data, opts);
    },

    /**
     * Alias for addTo
     */
    loadChart: function (map) {
      this.addTo(map);
    },

    /**
     * Load elevation data (GPX or GeoJSON).
     */
    loadData: function (data, opts) {
      opts = Waymark_L.extend({}, this.options.loadData, opts);
      if (opts.defer) {
        this.loadDefer(data, opts);
      } else if (opts.lazy) {
        this.loadLazy(data, opts);
      } else if (this._isXMLDoc(data)) {
        this.loadGPX(data);
      } else if (this._isJSONDoc(data)) {
        this.loadGeoJSON(data);
      } else {
        this.loadFile(data);
      }
    },

    /**
     * Wait for document load before download data.
     */
    loadDefer: function (data, opts) {
      opts = Waymark_L.extend({}, this.options.loadData, opts);
      opts.defer = false;
      if (document.readyState !== "complete")
        window.addEventListener(
          "load",
          Waymark_L.bind(this.loadData, this, data, opts),
          { once: true },
        );
      else this.loadData(data, opts);
    },

    /**
     * Load data from a remote url.
     */
    loadFile: function (url) {
      this._downloadURL = url; // TODO: handle multiple urls?
      try {
        let xhr = new XMLHttpRequest();
        xhr.responseType = "text";
        xhr.open("GET", url);
        xhr.onload = function () {
          if (xhr.status !== 200) {
            throw "Error " + xhr.status + " while fetching remote file: " + url;
          } else {
            this.loadData(xhr.response, {
              lazy: false,
              defer: false,
            });
          }
        }.bind(this);
        xhr.send();
      } catch (e) {
        console.warn(e);
      }
    },

    /**
     * Load raw GeoJSON data.
     */
    loadGeoJSON: function (data) {
      if (typeof data === "string") {
        data = JSON.parse(data);
      }

      this.layer = this.geojson = Waymark_L.geoJson(data, {
        style: function (feature) {
          let style = Waymark_L.extend({}, this.options.polyline);
          if (this.options.theme) {
            style.className += " " + this.options.theme;
          }
          return style;
        }.bind(this),
        pointToLayer: function (feature, latlng) {
          let marker = Waymark_L.marker(latlng, {
            icon: this.options.gpxOptions.marker_options.wptIcons[""],
          });
          let desc = feature.properties.desc ? feature.properties.desc : "";
          let name = feature.properties.name ? feature.properties.name : "";
          if (name || desc) {
            marker
              .bindPopup(
                "<b>" + name + "</b>" + (desc.length > 0 ? "<br>" + desc : ""),
              )
              .openPopup();
          }
          this.fire("waypoint_added", {
            point: marker,
            point_type: "waypoint",
            element: latlng,
          });
          return marker;
        }.bind(this),
        onEachFeature: function (feature, layer) {
          if (feature.geometry.type == "Point") return;

          this.addData(feature, layer);

          this.track_info = Waymark_L.extend({}, this.track_info, {
            type: "geojson",
            name: data.name,
          });
        }.bind(this),
      });
      if (this._map) {
        this._map.once(
          "layeradd",
          function (e) {
            // Joe
            // Stop elevation plugin from adjusting map bounds
            // https://wordpress.org/support/topic/map_centre-and-map_zoom-shortcodes-cannot-be-used-at-the-same-time/

            // this.fitBounds(this.layer.getBounds());

            this._fireEvt(
              "eledata_loaded",
              {
                data: data,
                layer: this.layer,
                name: this.track_info.name,
                track_info: this.track_info,
              },
              true,
            );
          },
          this,
        );

        this.layer.addTo(this._map);
      } else {
        console.warn("Undefined elevation map object");
      }
    },

    /**
     * Load raw GPX data.
     */
    loadGPX: function (data) {
      Waymark_L.Control.Elevation._gpxLazyLoader = this._lazyLoadJS(
        "https://unpkg.com/leaflet-gpx@1.5.0/gpx.js",
        typeof Waymark_L.GPX !== "function",
        Waymark_L.Control.Elevation._gpxLazyLoader,
      ).then(
        function (data) {
          this.options.gpxOptions.polyline_options = Waymark_L.extend(
            {},
            this.options.polyline,
            this.options.gpxOptions.polyline_options,
          );

          if (this.options.theme) {
            this.options.gpxOptions.polyline_options.className +=
              " " + this.options.theme;
          }

          this.layer = this.gpx = new Waymark_L.GPX(
            data,
            this.options.gpxOptions,
          );

          this.layer.on(
            "loaded",
            function (e) {
              this.fitBounds(e.target.getBounds());
            },
            this,
          );
          this.layer.on(
            "addpoint",
            function (e) {
              this.fire("waypoint_added", e, true);
            },
            this,
          );
          this.layer.once(
            "addline",
            function (e) {
              this.addData(e.line /*, this.layer*/);

              this.track_info = Waymark_L.extend({}, this.track_info, {
                type: "gpx",
                name: this.layer.get_name(),
              });

              this._fireEvt(
                "eledata_loaded",
                {
                  data: data,
                  layer: this.layer,
                  name: this.track_info.name,
                  track_info: this.track_info,
                },
                true,
              );
            },
            this,
          );

          if (this._map) {
            this.layer.addTo(this._map);
          } else {
            console.warn("Undefined elevation map object");
          }
        }.bind(this, data),
      );
    },

    /**
     * Wait for chart container visible before download data.
     */
    loadLazy: function (data, opts) {
      opts = Waymark_L.extend({}, this.options.loadData, opts);
      opts.lazy = false;
      let ticking = false;
      let scrollFn = Waymark_L.bind(
        function (data) {
          if (!ticking) {
            Waymark_L.Util.requestAnimFrame(function () {
              if (this._isVisible(this.placeholder)) {
                window.removeEventListener("scroll", scrollFn);
                this.loadData(data, opts);
                this.once(
                  "eledata_loaded",
                  function () {
                    if (this.placeholder && this.placeholder.parentNode) {
                      this.placeholder.parentNode.removeChild(this.placeholder);
                    }
                  },
                  this,
                );
              }
              ticking = false;
            }, this);
            ticking = true;
          }
        },
        this,
        data,
      );
      window.addEventListener("scroll", scrollFn);
      if (this.placeholder)
        this.placeholder.addEventListener("mouseenter", scrollFn, {
          once: true,
        });
      scrollFn();
    },

    /**
     * Create container DOM element and related event listeners.
     * Called on control.addTo(map).
     */
    onAdd: function (map) {
      this._map = map;

      let container = (this._container = Waymark_L.DomUtil.create(
        "div",
        "elevation-control elevation",
      ));

      if (!this.options.detached) {
        Waymark_L.DomUtil.addClass(container, "leaflet-control");
      }

      if (this.options.theme) {
        Waymark_L.DomUtil.addClass(container, this.options.theme); // append theme to control
      }

      if (this.options.placeholder && !this._data) {
        this.placeholder = Waymark_L.DomUtil.create(
          "img",
          "elevation-placeholder",
        );
        if (typeof this.options.placeholder === "string") {
          this.placeholder.src = this.options.placeholder;
          this.placeholder.alt = "";
        } else {
          for (let i in this.options.placeholder) {
            this.placeholder.setAttribute(i, this.options.placeholder[i]);
          }
        }
        container.insertBefore(this.placeholder, container.firstChild);
      }

      Waymark_L.Control.Elevation._d3LazyLoader = this._lazyLoadJS(
        "https://unpkg.com/d3@5.15.0/dist/d3.min.js",
        typeof d3 !== "object",
        Waymark_L.Control.Elevation._d3LazyLoader,
      ).then(
        function (map, container) {
          this._initToggle(container);
          this._initChart(container);

          this._applyData();

          this._map.on(
            "zoom viewreset zoomanim",
            this._hidePositionMarker,
            this,
          );
          this._map.on("resize", this._resetView, this);
          this._map.on("resize", this._resizeChart, this);
          this._map.on("mousedown", this._resetDrag, this);

          this._map.on("eledata_added", this._updateSummary, this);

          Waymark_L.DomEvent.on(
            this._map._container,
            "mousewheel",
            this._resetDrag,
            this,
          );
          Waymark_L.DomEvent.on(
            this._map._container,
            "touchstart",
            this._resetDrag,
            this,
          );
        }.bind(this, map, container),
      );

      return container;
    },

    /**
     * Clean up control code and related event listeners.
     * Called on control.remove().
     */
    onRemove: function (map) {
      this._container = null;
    },

    /**
     * Redraws the chart control. Sometimes useful after screen resize.
     */
    redraw: function () {
      this._resizeChart();
    },

    /**
     * Set default zoom level when "followMarker" is true.
     */
    setZFollow: function (zoom) {
      this._zFollow = zoom;
    },

    /**
     * Hide current elevation chart profile.
     */
    show: function () {
      this._container.style.display = "block";
    },

    /*
     * Parsing data either from GPX or GeoJSON and update the diagram data
     */
    _addData: function (d) {
      let geom = d && d.geometry;
      let feat = d && d.type === "FeatureCollection";
      let gpx = d && d._latlngs;

      if (geom) {
        switch (geom.type) {
          case "LineString":
            this._addGeoJSONData(geom.coordinates);
            break;

          case "MultiLineString":
            geom.coordinates.forEach((coords) => this._addGeoJSONData(coords));
            break;

          default:
            console.warn(
              "Unsopperted GeoJSON feature geometry type:" + geom.type,
            );
        }
      }

      if (feat) {
        d.features.forEach((feature) => this._addData(feature));
      }

      if (gpx) {
        this._addGPXdata(d._latlngs);
      }
    },

    /*
     * Parsing of GeoJSON data lines and their elevation in z-coordinate
     */
    _addGeoJSONData: function (coords) {
      if (coords) {
        coords.forEach((point) => this._addPoint(point[1], point[0], point[2]));
      }
    },

    /*
     * Parsing function for GPX data and their elevation in z-coordinate
     */
    _addGPXdata: function (coords) {
      if (coords) {
        coords.forEach((point) =>
          this._addPoint(point.lat, point.lng, point.meta.ele),
        );
      }
    },

    /*
     * Parse and push a single (x, y, z) point to current elevation profile.
     */
    _addPoint: function (x, y, z) {
      if (this.options.reverseCoords) {
        [x, y] = [y, x];
      }

      let data = this._data || [];
      let eleMax = this._maxElevation || -Infinity;
      let eleMin = this._minElevation || +Infinity;
      let dist = this._distance || 0;

      let curr = new Waymark_L.LatLng(x, y);
      let prev = data.length ? data[data.length - 1].latlng : curr;

      let delta = curr.distanceTo(prev) * this._distanceFactor;

      dist = dist + Math.round((delta / 1000) * 100000) / 100000;

      // check and fix missing elevation data on last added point
      if (!this.options.skipNullZCoords && data.length > 0) {
        let prevZ = data[data.length - 1].z;
        if (isNaN(prevZ)) {
          let lastZ = this._lastValidZ;
          let currZ = z * this._heightFactor;
          if (!isNaN(lastZ) && !isNaN(currZ)) {
            prevZ = (lastZ + currZ) / 2;
          } else if (!isNaN(lastZ)) {
            prevZ = lastZ;
          } else if (!isNaN(currZ)) {
            prevZ = currZ;
          }
          if (!isNaN(prevZ)) data[data.length - 1].z = prevZ;
          else data.splice(data.length - 1, 1);
        }
      }

      z = z * this._heightFactor;

      // skip point if it has not elevation
      if (!isNaN(z)) {
        eleMax = eleMax < z ? z : eleMax;
        eleMin = eleMin > z ? z : eleMin;

        // calculate new ascent or descent
        let dz = z - this._lastValidZ;
        if (dz > 0) {
          this.track_info.ascent = (this.track_info.ascent || 0) + dz; // Total Ascent
          this._ascent = this.track_info.ascent;
        } else if (dz < 0) {
          this.track_info.descent = (this.track_info.descent || 0) - dz; // Total Descent
          this._descent = this.track_info.descent;
        }

        // set up last valid z value
        this._lastValidZ = z;
      }

      data.push({
        dist: dist,
        x: x,
        y: y,
        z: z,
        latlng: curr,
      });

      this._data = data;
      this._distance = dist;
      this._maxElevation = eleMax;
      this._minElevation = eleMin;
    },

    /**
     * Generate "svg" chart container.
     */
    _appendChart: function (svg) {
      let g = svg
        .append("g")
        .attr(
          "transform",
          "translate(" +
            this.options.margins.left +
            "," +
            this.options.margins.top +
            ")",
        );

      this._appendGrid(g);
      this._appendAreaPath(g);
      this._appendAxis(g);
      this._appendFocusRect(g);
      this._appendMouseFocusG(g);
      this._appendLegend(g);
    },

    /**
     * Adds the control to the given "detached" div.
     */
    _appendElevationDiv: function (container) {
      let eleDiv = document.querySelector(this.options.elevationDiv);
      if (!eleDiv) {
        eleDiv = Waymark_L.DomUtil.create(
          "div",
          "leaflet-control elevation elevation-div",
        );
        this.options.elevationDiv =
          "#elevation-div_" + Math.random().toString(36).substr(2, 9);
        eleDiv.id = this.options.elevationDiv.substr(1);
        container.parentNode.insertBefore(eleDiv, container.nextSibling); // insert after end of container.
      }
      if (this.options.detached) {
        Waymark_L.DomUtil.addClass(eleDiv, "elevation-detached");
        Waymark_L.DomUtil.removeClass(eleDiv, "leaflet-control");
      }
      this.eleDiv = eleDiv;
      return this.eleDiv;
    },

    /**
     * Generate "x-axis".
     */
    _appendXaxis: function (axis) {
      axis
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this._height() + ")")
        .call(d3.axisBottom().scale(this._x).ticks(this.options.xTicks))
        .append("text")
        .attr("x", this._width() + 6)
        .attr("y", 30)
        .text(this._xLabel);
    },

    /**
     * Generate "x-grid".
     */
    _appendXGrid: function (grid) {
      grid
        .append("g")
        .attr("class", "x grid")
        .attr("transform", "translate(0," + this._height() + ")")
        .call(
          d3
            .axisBottom()
            .scale(this._x)
            .ticks(this.options.xTicks)
            .tickSize(-this._height())
            .tickFormat(""),
        );
    },

    /**
     * Generate "y-axis".
     */
    _appendYaxis: function (axis) {
      axis
        .append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft().scale(this._y).ticks(this.options.yTicks))
        .append("text")
        .attr("x", -30)
        .attr("y", 3)
        .text(this._yLabel);
    },

    /**
     * Generate "y-grid".
     */
    _appendYGrid: function (grid) {
      grid
        .append("g")
        .attr("class", "y grid")
        .call(
          d3
            .axisLeft()
            .scale(this._y)
            .ticks(this.options.yTicks)
            .tickSize(-this._width())
            .tickFormat(""),
        );
    },

    /**
     * Generate "path".
     */
    _appendAreaPath: function (g) {
      this._areapath = g.append("path").attr("class", "area");
    },

    /**
     * Generate "axis".
     */
    _appendAxis: function (g) {
      this._axis = g.append("g").attr("class", "axis");
      this._appendXaxis(this._axis);
      this._appendYaxis(this._axis);
    },

    /**
     * Generate "mouse-focus" and "drag-rect".
     */
    _appendFocusRect: function (g) {
      let focusRect = (this._focusRect = g
        .append("rect")
        .attr("width", this._width())
        .attr("height", this._height())
        .style("fill", "none")
        .style("stroke", "none")
        .style("pointer-events", "all"));

      if (Waymark_L.Browser.mobile) {
        focusRect
          .on("touchmove.drag", this._dragHandler.bind(this))
          .on("touchstart.drag", this._dragStartHandler.bind(this))
          .on("touchstart.focus", this._mousemoveHandler.bind(this))
          .on("touchmove.focus", this._mousemoveHandler.bind(this));
        Waymark_L.DomEvent.on(
          this._container,
          "touchend",
          this._dragEndHandler,
          this,
        );
      }

      focusRect
        .on("mousemove.drag", this._dragHandler.bind(this))
        .on("mousedown.drag", this._dragStartHandler.bind(this))
        .on("mouseenter.focus", this._mouseenterHandler.bind(this))
        .on("mousemove.focus", this._mousemoveHandler.bind(this))
        .on("mouseout.focus", this._mouseoutHandler.bind(this));
      Waymark_L.DomEvent.on(
        this._container,
        "mouseup",
        this._dragEndHandler,
        this,
      );
    },

    /**
     * Generate "grid".
     */
    _appendGrid: function (g) {
      this._grid = g.append("g").attr("class", "grid");
      this._appendXGrid(this._grid);
      this._appendYGrid(this._grid);
    },

    /**
     * Generate "mouse-focus".
     */
    _appendMouseFocusG: function (g) {
      let focusG = (this._focusG = g
        .append("g")
        .attr("class", "mouse-focus-group"));

      this._mousefocus = focusG
        .append("svg:line")
        .attr("class", "mouse-focus-line")
        .attr("x2", "0")
        .attr("y2", "0")
        .attr("x1", "0")
        .attr("y1", "0");

      this._focuslabelrect = focusG
        .append("rect")
        .attr("class", "mouse-focus-label")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 0)
        .attr("height", 0)
        .attr("rx", 3)
        .attr("ry", 3);

      this._focuslabeltext = focusG
        .append("svg:text")
        .attr("class", "mouse-focus-label-text");
      this._focuslabelY = this._focuslabeltext
        .append("svg:tspan")
        .attr("class", "mouse-focus-label-y")
        .attr("dy", "-1em");
      this._focuslabelX = this._focuslabeltext
        .append("svg:tspan")
        .attr("class", "mouse-focus-label-x")
        .attr("dy", "2em");
    },

    /**
     * Generate "legend".
     */
    _appendLegend: function (g) {
      if (!this.options.legend) return;

      let legend = (this._legend = g.append("g").attr("class", "legend"));

      let altitude = (this._altitudeLegend = this._legend
        .append("g")
        .attr("class", "legend-altitude"));

      altitude
        .append("rect")
        .attr("class", "area")
        .attr("x", this._width() / 2 - 50)
        .attr("y", this._height() + this.options.margins.bottom - 17)
        .attr("width", 50)
        .attr("height", 5)
        .attr("opacity", 0.75);

      altitude
        .append("text")
        .text(Waymark_L._("Altitude"))
        .attr("x", this._width() / 2 + 5)
        .attr("font-size", 10)
        .style("text-decoration-thickness", "2px")
        .style("font-weight", "700")
        .attr("y", this._height() + this.options.margins.bottom - 11);

      // autotoggle chart data on single click
      legend.on(
        "click",
        function () {
          if (this._chartEnabled) {
            this._clearChart();
            this._clearPath();
            this._chartEnabled = false;
          } else {
            this._resizeChart();
            for (let id in this._layers) {
              Waymark_L.DomUtil.addClass(
                this._layers[id]._path,
                this.options.polyline.className + " " + this.options.theme,
              );
            }
            this._chartEnabled = true;
          }
        }.bind(this),
      );
    },

    /**
     * Generate "svg:line".
     */
    _appendPositionMarker: function (pane) {
      let theme = this.options.theme;
      let heightG = pane.select("g");

      this._mouseHeightFocus = heightG
        .append("svg:line")
        .attr("class", theme + " height-focus line")
        .attr("x2", 0)
        .attr("y2", 0)
        .attr("x1", 0)
        .attr("y1", 0);

      this._pointG = heightG.append("g");
      this._pointG
        .append("svg:circle")
        .attr("class", theme + " height-focus circle-lower")
        .attr("r", 6)
        .attr("cx", 0)
        .attr("cy", 0);

      this._mouseHeightFocusLabel = heightG
        .append("svg:text")
        .attr("class", theme + " height-focus-label")
        .style("pointer-events", "none");
    },

    /**
     * Calculates [x, y] domain and then update chart.
     */
    _applyData: function () {
      if (!this._data) return;

      let xdomain = d3.extent(this._data, (d) => d.dist);
      let ydomain = d3.extent(this._data, (d) => d.z);
      let opts = this.options;

      if (
        opts.yAxisMin !== undefined &&
        (opts.yAxisMin < ydomain[0] || opts.forceAxisBounds)
      ) {
        ydomain[0] = opts.yAxisMin;
      }
      if (
        opts.yAxisMax !== undefined &&
        (opts.yAxisMax > ydomain[1] || opts.forceAxisBounds)
      ) {
        ydomain[1] = opts.yAxisMax;
      }

      this._x.domain(xdomain);
      this._y.domain(ydomain);
      this._areapath.datum(this._data).attr("d", this._area);
      this._updateAxis();

      this._fullExtent = this._calculateFullExtent(this._data);
    },

    /*
     * Calculates the full extent of the data array
     */
    _calculateFullExtent: function (data) {
      if (!data || data.length < 1) {
        throw new Error("no data in parameters");
      }

      let ext = new Waymark_L.latLngBounds(data[0].latlng, data[0].latlng);

      data.forEach((item) => ext.extend(item.latlng));

      return ext;
    },

    /*
     * Reset chart.
     */
    _clearChart: function () {
      this._resetDrag();
      if (this._areapath) {
        // workaround for 'Error: Problem parsing d=""' in Webkit when empty data
        // https://groups.google.com/d/msg/d3-js/7rFxpXKXFhI/HzIO_NPeDuMJ
        //this._areapath.datum(this._data).attr("d", this._area);
        this._areapath.attr("d", "M0 0");

        this._x.domain([0, 1]);
        this._y.domain([0, 1]);
        this._updateAxis();
      }
      if (this._altitudeLegend) {
        this._altitudeLegend
          .select("text")
          .style("text-decoration-line", "line-through");
      }
    },

    /*
     * Reset data.
     */
    _clearData: function () {
      this._data = null;
      this._distance = null;
      this._maxElevation = null;
      this._minElevation = null;
      this.track_info = null;
      this._layers = null;
      // if (this.layer) {
      //  this.layer.removeFrom(this._map);
      // }
    },

    /*
     * Reset path.
     */
    _clearPath: function () {
      this._hidePositionMarker();
      for (let id in this._layers) {
        Waymark_L.DomUtil.removeClass(
          this._layers[id]._path,
          this.options.polyline.className,
        );
        Waymark_L.DomUtil.removeClass(
          this._layers[id]._path,
          this.options.theme,
        );
      }
    },

    /*
     * Collapse current chart control.
     */
    _collapse: function () {
      if (this._container) {
        Waymark_L.DomUtil.removeClass(this._container, "elevation-expanded");
        Waymark_L.DomUtil.addClass(this._container, "elevation-collapsed");
      }
    },

    /**
     * Recursive deep merge objects.
     * Alternative to Waymark_L.Util.setOptions(this, options).
     */
    _deepMerge: function (target, ...sources) {
      if (!sources.length) return target;
      const source = sources.shift();
      if (this._isObject(target) && this._isObject(source)) {
        for (const key in source) {
          if (this._isObject(source[key])) {
            if (!target[key])
              Object.assign(target, {
                [key]: {},
              });
            this._deepMerge(target[key], source[key]);
          } else {
            Object.assign(target, {
              [key]: source[key],
            });
          }
        }
      }
      return this._deepMerge(target, ...sources);
    },

    /*
     * Handle drag operations.
     */
    _dragHandler: function () {
      //we don't want map events to occur here
      d3.event.preventDefault();
      d3.event.stopPropagation();

      this._gotDragged = true;
      this._drawDragRectangle();
    },

    /*
     * Handles end of drag operations. Zooms the map to the selected items extent.
     */
    _dragEndHandler: function () {
      if (
        !this._dragStartCoords ||
        !this._dragCurrentCoords ||
        !this._gotDragged
      ) {
        this._dragStartCoords = null;
        this._gotDragged = false;
        if (this._draggingEnabled) this._resetDrag();
        return;
      }

      let item1 = this._findItemForX(this._dragStartCoords[0]);
      let item2 = this._findItemForX(this._dragCurrentCoords[0]);

      if (item1 == item2) return;

      this._hidePositionMarker();

      this._fitSection(item1, item2);

      this._dragStartCoords = null;
      this._gotDragged = false;

      this._fireEvt(
        "elechart_dragged",
        {
          data: {
            dragstart: this._data[item1],
            dragend: this._data[item2],
          },
        },
        true,
      );
    },

    /*
     * Handles start of drag operations.
     */
    _dragStartHandler: function () {
      d3.event.preventDefault();
      d3.event.stopPropagation();

      this._gotDragged = false;
      this._dragStartCoords = d3.mouse(this._focusRect.node());
    },

    /*
     * Draws the currently dragged rectangle over the chart.
     */
    _drawDragRectangle: function () {
      if (!this._dragStartCoords || !this._draggingEnabled) {
        return;
      }

      let dragEndCoords = (this._dragCurrentCoords = d3.mouse(
        this._focusRect.node(),
      ));

      let x1 = Math.min(this._dragStartCoords[0], dragEndCoords[0]);
      let x2 = Math.max(this._dragStartCoords[0], dragEndCoords[0]);

      if (!this._dragRectangle && !this._dragRectangleG) {
        let g = d3.select(this._container).select("svg").select("g");

        this._dragRectangleG = g.insert("g", ".mouse-focus-group");

        this._dragRectangle = this._dragRectangleG
          .append("rect")
          .attr("width", x2 - x1)
          .attr("height", this._height())
          .attr("x", x1)
          .attr("class", "mouse-drag")
          .style("pointer-events", "none");
      } else {
        this._dragRectangle.attr("width", x2 - x1).attr("x", x1);
      }
    },

    /*
     * Expand current chart control.
     */
    _expand: function () {
      if (this._container) {
        Waymark_L.DomUtil.removeClass(this._container, "elevation-collapsed");
        Waymark_L.DomUtil.addClass(this._container, "elevation-expanded");
      }
    },

    /*
     * Finds an item with the smallest delta in distance to the given latlng coords
     */
    _findItemForLatLng: function (latlng) {
      let result = null;
      let d = Infinity;
      this._data.forEach((item) => {
        let dist = latlng.distanceTo(item.latlng);
        if (dist < d) {
          d = dist;
          result = item;
        }
      });
      return result;
    },

    /*
     * Finds a data entry for a given x-coordinate of the diagram
     */
    _findItemForX: function (x) {
      let data = this._data ? this._data : [0, 1];
      let bisect = d3.bisector((d) => d.dist).left;
      let xinvert = this._x.invert(x);
      return bisect(data, xinvert);
    },

    /**
     * Fires an event of the specified type.
     */
    _fireEvt: function (type, data, propagate) {
      if (this.fire) {
        this.fire(type, data, propagate);
      }
      if (this._map) {
        this._map.fire(type, data, propagate);
      }
    },

    /**
     * Make the map fit the route section between given indexes.
     */
    _fitSection: function (index1, index2) {
      let start = Math.min(index1, index2);
      let end = Math.max(index1, index2);
      let ext = this._calculateFullExtent(this._data.slice(start, end));
      this.fitBounds(ext);
    },

    /*
     * Fromatting funciton using the given decimals and seperator
     */
    _formatter: function (num, dec, sep) {
      return Waymark_L.formatNumber(num, dec);
    },

    /**
     * Calculates chart height.
     */
    _height: function () {
      let opts = this.options;
      return opts.height - opts.margins.top - opts.margins.bottom;
    },

    /*
     * Hides the position/height indicator marker drawn onto the map
     */
    _hidePositionMarker: function () {
      if (!this.options.autohideMarker) {
        return;
      }

      this._selectedItem = null;

      if (this._marker) {
        if (this._map) this._map.removeLayer(this._marker);
        this._marker = null;
      }
      if (this._mouseHeightFocus) {
        this._mouseHeightFocus.style("visibility", "hidden");
        this._mouseHeightFocusLabel.style("visibility", "hidden");
      }
      if (this._pointG) {
        this._pointG.style("visibility", "hidden");
      }
      if (this._focusG) {
        this._focusG.style("visibility", "hidden");
      }
    },

    /**
     * Generate "svg" chart DOM element.
     */
    _initChart: function () {
      let opts = this.options;
      opts.xTicks = opts.xTicks || Math.round(this._width() / 75);
      opts.yTicks = opts.yTicks || Math.round(this._height() / 30);
      opts.hoverNumber.formatter =
        opts.hoverNumber.formatter || this._formatter;

      if (opts.responsive) {
        if (opts.detached) {
          let offWi = this.eleDiv.offsetWidth;
          let offHe = this.eleDiv.offsetHeight;
          opts.width = offWi > 0 ? offWi : opts.width;
          opts.height = offHe - 20 > 0 ? offHe - 20 : opts.height; // 20 = horizontal scrollbar size.
        } else {
          opts._maxWidth =
            opts._maxWidth > opts.width ? opts._maxWidth : opts.width;
          let containerWidth = this._map._container.clientWidth;
          opts.width =
            opts._maxWidth > containerWidth ? containerWidth - 30 : opts.width;
        }
      }

      let x = (this._x = d3.scaleLinear().range([0, this._width()]));
      let y = (this._y = d3.scaleLinear().range([this._height(), 0]));

      let interpolation =
        typeof opts.interpolation === "function"
          ? opts.interpolation
          : d3[opts.interpolation];

      let area = (this._area = d3
        .area()
        .curve(interpolation)
        .x((d) => (d.xDiagCoord = x(d.dist)))
        .y0(this._height())
        .y1((d) => y(d.z)));
      let line = (this._line = d3
        .line()
        .x((d) => d3.mouse(svg.select("g"))[0])
        .y((d) => this._height()));

      let container = d3.select(this._container);

      let svg = container
        .append("svg")
        .attr("class", "background")
        .attr("width", opts.width)
        .attr("height", opts.height);

      let summary = (this.summaryDiv = container
        .append("div")
        .attr(
          "class",
          "elevation-summary " +
            (this.options.summary ? this.options.summary + "-summary" : ""),
        )
        .node());

      this._appendChart(svg);
      this._updateSummary();
    },

    /**
     * Inspired by Waymark_L.Control.Layers
     */
    _initToggle: function (container) {
      //Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
      container.setAttribute("aria-haspopup", true);

      if (!this.options.detached) {
        Waymark_L.DomEvent.disableClickPropagation(container);
        //.disableScrollPropagation(container);
      }

      if (Waymark_L.Browser.mobile) {
        Waymark_L.DomEvent.on(
          container,
          "click",
          Waymark_L.DomEvent.stopPropagation,
        );
      }

      //Joe - Scroll Wheel quirk
      //Waymark_L.DomEvent.on(container, 'mousewheel', this._mousewheelHandler, this);

      if (!this.options.detached) {
        let iconCssClass =
          "elevation-toggle " +
          this.options.controlButton.iconCssClass +
          (this.options.autohide ? "" : " close-button");
        let link = (this._button = Waymark_L.DomUtil.create(
          "a",
          iconCssClass,
          container,
        ));
        link.href = "#";
        link.title = this.options.controlButton.title;

        if (this.options.collapsed) {
          this._collapse();
          if (this.options.autohide) {
            Waymark_L.DomEvent.on(
              container,
              "mouseover",
              this._expand,
              this,
            ).on(container, "mouseout", this._collapse, this);
          } else {
            Waymark_L.DomEvent.on(link, "click", Waymark_L.DomEvent.stop).on(
              link,
              "click",
              this._toggle,
              this,
            );
          }

          Waymark_L.DomEvent.on(link, "focus", this._toggle, this);

          this._map.on("click", this._collapse, this);
          // TODO: keyboard accessibility
        }
      }
    },

    /**
     * Check object type.
     */
    _isObject: function (item) {
      return item && typeof item === "object" && !Array.isArray(item);
    },

    /**
     * Check JSON object type.
     */
    _isJSONDoc: function (doc, lazy) {
      lazy = typeof lazy === "undefined" ? true : lazy;
      if (typeof doc === "string" && lazy) {
        doc = doc.trim();
        return doc.indexOf("{") == 0 || doc.indexOf("[") == 0;
      } else {
        try {
          JSON.parse(doc.toString());
        } catch (e) {
          if (typeof doc === "object" && lazy) return true;
          console.warn(e);
          return false;
        }
        return true;
      }
    },

    /**
     * Check XML object type.
     */
    _isXMLDoc: function (doc, lazy) {
      lazy = typeof lazy === "undefined" ? true : lazy;
      if (typeof doc === "string" && lazy) {
        doc = doc.trim();
        return doc.indexOf("<") == 0;
      } else {
        let documentElement = (doc ? doc.ownerDocument || doc : 0)
          .documentElement;
        return documentElement ? documentElement.nodeName !== "HTML" : false;
      }
    },

    /**
     * Check DOM element visibility.
     */
    _isDomVisible: function (elem) {
      return !!(
        elem.offsetWidth ||
        elem.offsetHeight ||
        elem.getClientRects().length
      );
    },

    /**
     * Check DOM element viewport visibility.
     */
    _isVisible: function (elem) {
      if (!elem) return false;

      let styles = window.getComputedStyle(elem);

      function isVisibleByStyles(elem, styles) {
        return styles.visibility !== "hidden" && styles.display !== "none";
      }

      function isAboveOtherElements(elem, styles) {
        let boundingRect = elem.getBoundingClientRect();
        let left = boundingRect.left + 1;
        let right = boundingRect.right - 1;
        let top = boundingRect.top + 1;
        let bottom = boundingRect.bottom - 1;
        let above = true;

        let pointerEvents = elem.style.pointerEvents;

        if (styles["pointer-events"] == "none")
          elem.style.pointerEvents = "auto";

        if (document.elementFromPoint(left, top) !== elem) above = false;
        if (document.elementFromPoint(right, top) !== elem) above = false;

        // Only for completely visible elements
        // if (document.elementFromPoint(left, bottom) !== elem) above = false;
        // if (document.elementFromPoint(right, bottom) !== elem) above = false;

        elem.style.pointerEvents = pointerEvents;

        return above;
      }

      if (!isVisibleByStyles(elem, styles)) return false;
      if (!isAboveOtherElements(elem, styles)) return false;
      return true;
    },

    /**
     * Async JS script download.
     */
    _lazyLoadJS: function (url, skip, loader) {
      if (skip === false || !this.options.lazyLoadJS) {
        return Promise.resolve();
      }
      if (loader instanceof Promise) {
        return loader;
      }
      return new Promise((resolve, reject) => {
        let tag = document.createElement("script");
        tag.addEventListener("load", resolve, { once: true });
        tag.src = url;
        document.head.appendChild(tag);
      });
    },

    /*
     * Handles the moueseenter over the chart.
     */
    _mouseenterHandler: function () {
      this._fireEvt("elechart_enter", null, true);
    },

    /*
     * Handles the moueseover the chart and displays distance and altitude level.
     */
    _mousemoveHandler: function (d, i, ctx) {
      if (!this._data || this._data.length === 0 || !this._chartEnabled) {
        return;
      }
      let coords = d3.mouse(this._focusRect.node());
      let xCoord = coords[0];
      let item = this._data[this._findItemForX(xCoord)];

      this._hidePositionMarker();
      this._showDiagramIndicator(item, xCoord);
      this._showPositionMarker(item);
      this._setMapView(item);

      if (this._map && this._map._container) {
        Waymark_L.DomUtil.addClass(this._map._container, "elechart-hover");
      }

      this._fireEvt("elechart_change", { data: item }, true);
      this._fireEvt("elechart_hover", { data: item }, true);
    },

    /*
     * Handles mouseover events of the data layers on the map.
     */
    _mousemoveLayerHandler: function (e) {
      if (!this._data || this._data.length === 0) {
        return;
      }
      let latlng = e.latlng;
      let item = this._findItemForLatLng(latlng);
      if (item) {
        let xCoord = item.xDiagCoord;

        this._hidePositionMarker();
        this._showDiagramIndicator(item, xCoord);
        this._showPositionMarker(item);
      }
    },

    /*
     * Handles the moueseout over the chart.
     */
    _mouseoutHandler: function () {
      if (!this.options.detached) {
        this._hidePositionMarker();
      }

      if (this._map && this._map._container) {
        Waymark_L.DomUtil.removeClass(this._map._container, "elechart-hover");
      }

      this._fireEvt("elechart_leave", null, true);
    },

    /*
     * Handles the mouesewheel over the chart.
     */
    _mousewheelHandler: function (e) {
      if (this._map.gestureHandling && this._map.gestureHandling._enabled)
        return;
      let ll = this._selectedItem
        ? this._selectedItem.latlng
        : this._map.getCenter();
      let z = e.deltaY > 0 ? this._map.getZoom() - 1 : this._map.getZoom() + 1;
      this._resetDrag();
      this._map.flyTo(ll, z);
    },

    /*
     * Removes the drag rectangle and zoms back to the total extent of the data.
     */
    _resetDrag: function () {
      if (this._dragRectangleG) {
        this._dragRectangleG.remove();
        this._dragRectangleG = null;
        this._dragRectangle = null;
        this._hidePositionMarker();
      }
    },

    /**
     * Resets drag, marker and bounds.
     */
    _resetView: function () {
      if (this._map && this._map._isFullscreen) return;
      this._resetDrag();
      this._hidePositionMarker();
      this.fitBounds(this._fullExtent);
    },

    /**
     * Hacky way for handling chart resize. Deletes it and redraw chart.
     */
    _resizeChart: function () {
      if (this.options.responsive) {
        if (this.options.detached) {
          let newWidth = this.eleDiv.offsetWidth; // - 20;

          if (newWidth <= 0) return;

          this.options.width = newWidth;
          this.eleDiv.innerHTML = "";
          this.eleDiv.appendChild(this.onAdd(this._map));
        } else {
          this._map.removeControl(this._container);
          this.addTo(this._map);
        }
      }
    },

    /**
     * Generate GPX / GeoJSON download event.
     */
    _saveFile: function (fileUrl) {
      let d = document,
        a = d.createElement("a"),
        b = d.body;
      a.href = fileUrl;
      a.target = "_new";
      a.download = ""; // fileName
      a.style.display = "none";
      b.appendChild(a);
      a.click();
      b.removeChild(a);
    },

    /**
     * Display distance and altitude level ("focus-rect").
     */
    _showDiagramIndicator: function (item, xCoordinate) {
      if (!this._chartEnabled) return;

      let opts = this.options;
      this._focusG.style("visibility", "visible");

      this._mousefocus
        .attr("x1", xCoordinate)
        .attr("y1", 0)
        .attr("x2", xCoordinate)
        .attr("y2", this._height())
        .classed("hidden", false);

      let alt = item.z,
        dist = item.dist,
        ll = item.latlng,
        numY = opts.hoverNumber.formatter(alt, opts.hoverNumber.decimalsY),
        numX = opts.hoverNumber.formatter(dist, opts.hoverNumber.decimalsX);

      this._focuslabeltext
        // .attr("x", xCoordinate)
        .attr("y", this._y(item.z))
        .style("font-weight", "700");

      this._focuslabelX
        .text(numX + " " + this._xLabel)
        .attr("x", xCoordinate + 10);

      this._focuslabelY
        .text(numY + " " + this._yLabel)
        .attr("x", xCoordinate + 10);

      let focuslabeltext = this._focuslabeltext.node();
      if (this._isDomVisible(focuslabeltext)) {
        let bbox = focuslabeltext.getBBox();
        let padding = 2;

        this._focuslabelrect
          .attr("x", bbox.x - padding)
          .attr("y", bbox.y - padding)
          .attr("width", bbox.width + padding * 2)
          .attr("height", bbox.height + padding * 2);

        // move focus label to left
        if (xCoordinate >= this._width() / 2) {
          this._focuslabelrect.attr(
            "x",
            this._focuslabelrect.attr("x") -
              this._focuslabelrect.attr("width") -
              padding * 2 -
              10,
          );
          this._focuslabelX.attr(
            "x",
            this._focuslabelX.attr("x") -
              this._focuslabelrect.attr("width") -
              padding * 2 -
              10,
          );
          this._focuslabelY.attr(
            "x",
            this._focuslabelY.attr("x") -
              this._focuslabelrect.attr("width") -
              padding * 2 -
              10,
          );
        }
      }
    },

    /**
     * Collapse or Expand current chart control.
     */
    _toggle: function () {
      if (Waymark_L.DomUtil.hasClass(this._container, "elevation-expanded"))
        this._collapse();
      else this._expand();
    },

    /**
     * Sets the view of the map (center and zoom). Useful when "followMarker" is true.
     */
    _setMapView: function (item) {
      if (!this.options.followMarker || !this._map) return;
      let zoom = this._map.getZoom();
      zoom = zoom < this._zFollow ? this._zFollow : zoom;
      this._map.setView(item.latlng, zoom, {
        animate: true,
        duration: 0.25,
      });
    },

    /*
     * Shows the position/height indicator marker drawn onto the map
     */
    _showPositionMarker: function (item) {
      this._selectedItem = item;

      if (this._map && !this._map.getPane("elevationPane")) {
        this._map.createPane("elevationPane");
        this._map.getPane("elevationPane").style.zIndex = 625; // This pane is above markers but below popups.
        this._map.getPane("elevationPane").style.pointerEvents = "none";
      }

      if (this.options.marker == "elevation-line") {
        this._updatePositionMarker(item);
      } else if (this.options.marker == "position-marker") {
        this._updateLeafletMarker(item);
      }
    },

    /**
     * Update chart axis.
     */
    _updateAxis: function () {
      this._grid.selectAll("g").remove();
      this._axis.selectAll("g").remove();
      this._appendXGrid(this._grid);
      this._appendYGrid(this._grid);
      this._appendXaxis(this._axis);
      this._appendYaxis(this._axis);
    },

    /**
     * Update distance and altitude level ("leaflet-marker").
     */
    _updateHeightIndicator: function (item) {
      let opts = this.options;

      let numY = opts.hoverNumber.formatter(item.z, opts.hoverNumber.decimalsY);
      let numX = opts.hoverNumber.formatter(
        item.dist,
        opts.hoverNumber.decimalsX,
      );

      let normalizedAlt = (this._height() / this._maxElevation) * item.z;
      let normalizedY = item.y - normalizedAlt;

      this._mouseHeightFocus
        .attr("x1", item.x)
        .attr("x2", item.x)
        .attr("y1", item.y)
        .attr("y2", normalizedY)
        .style("visibility", "visible");

      this._mouseHeightFocusLabel
        .attr("x", item.x)
        .attr("y", normalizedY)
        .text(numY + " " + this._yLabel)
        .style("visibility", "visible");
    },

    /**
     * Update position marker ("leaflet-marker").
     */
    _updateLeafletMarker: function (item) {
      let ll = item.latlng;

      if (!this._marker) {
        this._marker = new Waymark_L.Marker(ll, {
          icon: this.options.markerIcon,
          zIndexOffset: 1000000,
        });
        this._marker.addTo(this._map, {
          pane: "elevationPane",
        });
      } else {
        this._marker.setLatLng(ll);
      }
    },

    /**
     * Update focus point ("leaflet-marker").
     */
    _updatePointG: function (item) {
      this._pointG
        .attr("transform", "translate(" + item.x + "," + item.y + ")")
        .style("visibility", "visible");
    },

    /**
     * Update position marker ("leaflet-marker").
     */
    _updatePositionMarker: function (item) {
      let point = this._map.latLngToLayerPoint(item.latlng);
      let layerpoint = {
        dist: item.dist,
        x: point.x,
        y: point.y,
        z: item.z,
      };

      if (!this._mouseHeightFocus) {
        Waymark_L.svg({ pane: "elevationPane" }).addTo(this._map); // default leaflet svg renderer
        let layerpane = d3
          .select(this._map.getContainer())
          .select(".leaflet-elevation-pane svg");
        this._appendPositionMarker(layerpane);
      }

      this._updatePointG(layerpoint);
      this._updateHeightIndicator(layerpoint);
    },

    /**
     * Update chart summary.
     */
    _updateSummary: function () {
      this.summaryDiv.innerHTML = "";
      this.track_info = this.track_info || {};
      this.track_info.distance = this._distance || 0;
      this.track_info.elevation_max = this._maxElevation || 0;
      this.track_info.elevation_min = this._minElevation || 0;
      this.track_info.ascent = this._ascent || 0;
      this.track_info.descent = this._descent || 0;

      if (this.options.summary) {
        this.summaryDiv.innerHTML +=
          '<span class="totlen"><span class="summarylabel">' +
          Waymark_L._("Total Length: ") +
          '</span><span class="summaryvalue">' +
          Waymark_L.formatNumber(this.track_info.distance, 2) +
          " " +
          this._xLabel +
          '</span></span><span class="maxele"><span class="summarylabel">' +
          Waymark_L._("Max Elevation: ") +
          '</span><span class="summaryvalue">' +
          Waymark_L.formatNumber(this.track_info.elevation_max, 2) +
          " " +
          this._yLabel +
          '</span></span><span class="minele"><span class="summarylabel">' +
          Waymark_L._("Min Elevation: ") +
          '</span><span class="summaryvalue">' +
          Waymark_L.formatNumber(this.track_info.elevation_min, 2) +
          " " +
          this._yLabel +
          '</span></span><span class="totasc"><span class="summarylabel">' +
          Waymark_L._("Total Ascent: ") +
          '</span><span class="summaryvalue">' +
          Waymark_L.formatNumber(this.track_info.ascent, 0) +
          " " +
          this._yLabel +
          '</span></span><span class="totdesc"><span class="summarylabel">' +
          Waymark_L._("Total Descent: ") +
          '</span><span class="summaryvalue">' +
          Waymark_L.formatNumber(this.track_info.descent, 0) +
          " " +
          this._yLabel +
          "</span></span>";
      }
      if (this.options.downloadLink && this._downloadURL) {
        // TODO: generate dynamically file content instead of using static file urls.
        this.summaryDiv.innerHTML +=
          '<span class="download"><a href="#">' +
          Waymark_L._("Download") +
          "</a></span>";
        this.summaryDiv.querySelector(".download a").onclick = function (e) {
          e.preventDefault();
          let evt = {
            confirm: this._saveFile.bind(this, this._downloadURL),
          };
          let type = this.options.downloadLink;
          if (type == "modal") {
            if (typeof CustomEvent === "function")
              document.dispatchEvent(
                new CustomEvent("eletrack_download", {
                  detail: evt,
                }),
              );
            this._fireEvt("eletrack_download", evt);
          } else if (type == "link" || type === true) {
            evt.confirm();
          }
        }.bind(this);
      }
    },

    /**
     * Calculates chart width.
     */
    _width: function () {
      let opts = this.options;
      return opts.width - opts.margins.left - opts.margins.right;
    },
  });

  Waymark_L.control.elevation = function (options) {
    return new Waymark_L.Control.Elevation(options);
  };
});

'use strict';
(function (factory, window) {
    /*globals define, module, require*/

    // define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);


    // define a Common JS module that relies on 'leaflet'
    } else if (typeof exports === 'object') {
        module.exports = factory(require('leaflet'));
    }

    // attach your plugin to the global 'L' variable
    if(typeof window !== 'undefined' && window.L){
        factory(window.L);
    }

}(function (L) {
    // 🍂miniclass CancelableEvent (Event objects)
    // 🍂method cancel()
    // Cancel any subsequent action.

    // 🍂miniclass VertexEvent (Event objects)
    // 🍂property vertex: VertexMarker
    // The vertex that fires the event.

    // 🍂miniclass ShapeEvent (Event objects)
    // 🍂property shape: Array
    // The shape (LatLngs array) subject of the action.

    // 🍂miniclass CancelableVertexEvent (Event objects)
    // 🍂inherits VertexEvent
    // 🍂inherits CancelableEvent

    // 🍂miniclass CancelableShapeEvent (Event objects)
    // 🍂inherits ShapeEvent
    // 🍂inherits CancelableEvent

    // 🍂miniclass LayerEvent (Event objects)
    // 🍂property layer: object
    // The Layer (Marker, Polyline…) subject of the action.

    // 🍂namespace Editable; 🍂class Editable; 🍂aka Waymark_L.Editable
    // Main edition handler. By default, it is attached to the map
    // as `map.editTools` property.
    // Leaflet.Editable is made to be fully extendable. You have three ways to customize
    // the behaviour: using options, listening to events, or extending.
    Waymark_L.Editable = Waymark_L.Evented.extend({

        statics: {
            FORWARD: 1,
            BACKWARD: -1
        },

        options: {

            // You can pass them when creating a map using the `editOptions` key.
            // 🍂option zIndex: int = 1000
            // The default zIndex of the editing tools.
            zIndex: 1000,

            // 🍂option polygonClass: class = Waymark_L.Polygon
            // Class to be used when creating a new Polygon.
            polygonClass: Waymark_L.Polygon,

            // 🍂option polylineClass: class = Waymark_L.Polyline
            // Class to be used when creating a new Polyline.
            polylineClass: Waymark_L.Polyline,

            // 🍂option markerClass: class = Waymark_L.Marker
            // Class to be used when creating a new Marker.
            markerClass: Waymark_L.Marker,

            // 🍂option rectangleClass: class = Waymark_L.Rectangle
            // Class to be used when creating a new Rectangle.
            rectangleClass: Waymark_L.Rectangle,

            // 🍂option circleClass: class = Waymark_L.Circle
            // Class to be used when creating a new Circle.
            circleClass: Waymark_L.Circle,

            // 🍂option drawingCSSClass: string = 'leaflet-editable-drawing'
            // CSS class to be added to the map container while drawing.
            drawingCSSClass: 'leaflet-editable-drawing',

            // 🍂option drawingCursor: const = 'crosshair'
            // Cursor mode set to the map while drawing.
            drawingCursor: 'crosshair',

            // 🍂option editLayer: Layer = new Waymark_L.LayerGroup()
            // Layer used to store edit tools (vertex, line guide…).
            editLayer: undefined,

            // 🍂option featuresLayer: Layer = new Waymark_L.LayerGroup()
            // Default layer used to store drawn features (Marker, Polyline…).
            featuresLayer: undefined,

            // 🍂option polylineEditorClass: class = PolylineEditor
            // Class to be used as Polyline editor.
            polylineEditorClass: undefined,

            // 🍂option polygonEditorClass: class = PolygonEditor
            // Class to be used as Polygon editor.
            polygonEditorClass: undefined,

            // 🍂option markerEditorClass: class = MarkerEditor
            // Class to be used as Marker editor.
            markerEditorClass: undefined,

            // 🍂option rectangleEditorClass: class = RectangleEditor
            // Class to be used as Rectangle editor.
            rectangleEditorClass: undefined,

            // 🍂option circleEditorClass: class = CircleEditor
            // Class to be used as Circle editor.
            circleEditorClass: undefined,

            // 🍂option lineGuideOptions: hash = {}
            // Options to be passed to the line guides.
            lineGuideOptions: {},

            // 🍂option skipMiddleMarkers: boolean = false
            // Set this to true if you don't want middle markers.
            skipMiddleMarkers: false

        },

        initialize: function (map, options) {
            Waymark_L.setOptions(this, options);
            this._lastZIndex = this.options.zIndex;
            this.map = map;
            this.editLayer = this.createEditLayer();
            this.featuresLayer = this.createFeaturesLayer();
            this.forwardLineGuide = this.createLineGuide();
            this.backwardLineGuide = this.createLineGuide();
        },

        fireAndForward: function (type, e) {
            e = e || {};
            e.editTools = this;
            this.fire(type, e);
            this.map.fire(type, e);
        },

        createLineGuide: function () {
            var options = Waymark_L.extend({dashArray: '5,10', weight: 1, interactive: false}, this.options.lineGuideOptions);
            return Waymark_L.polyline([], options);
        },

        createVertexIcon: function (options) {
            return Waymark_L.Browser.mobile && Waymark_L.Browser.touch ? new Waymark_L.Editable.TouchVertexIcon(options) : new Waymark_L.Editable.VertexIcon(options);
        },

        createEditLayer: function () {
            return this.options.editLayer || new Waymark_L.LayerGroup().addTo(this.map);
        },

        createFeaturesLayer: function () {
            return this.options.featuresLayer || new Waymark_L.LayerGroup().addTo(this.map);
        },

        moveForwardLineGuide: function (latlng) {
            if (this.forwardLineGuide._latlngs.length) {
                this.forwardLineGuide._latlngs[1] = latlng;
                this.forwardLineGuide._bounds.extend(latlng);
                this.forwardLineGuide.redraw();
            }
        },

        moveBackwardLineGuide: function (latlng) {
            if (this.backwardLineGuide._latlngs.length) {
                this.backwardLineGuide._latlngs[1] = latlng;
                this.backwardLineGuide._bounds.extend(latlng);
                this.backwardLineGuide.redraw();
            }
        },

        anchorForwardLineGuide: function (latlng) {
            this.forwardLineGuide._latlngs[0] = latlng;
            this.forwardLineGuide._bounds.extend(latlng);
            this.forwardLineGuide.redraw();
        },

        anchorBackwardLineGuide: function (latlng) {
            this.backwardLineGuide._latlngs[0] = latlng;
            this.backwardLineGuide._bounds.extend(latlng);
            this.backwardLineGuide.redraw();
        },

        attachForwardLineGuide: function () {
            this.editLayer.addLayer(this.forwardLineGuide);
        },

        attachBackwardLineGuide: function () {
            this.editLayer.addLayer(this.backwardLineGuide);
        },

        detachForwardLineGuide: function () {
            this.forwardLineGuide.setLatLngs([]);
            this.editLayer.removeLayer(this.forwardLineGuide);
        },

        detachBackwardLineGuide: function () {
            this.backwardLineGuide.setLatLngs([]);
            this.editLayer.removeLayer(this.backwardLineGuide);
        },

        blockEvents: function () {
            // Hack: force map not to listen to other layers events while drawing.
            if (!this._oldTargets) {
                this._oldTargets = this.map._targets;
                this.map._targets = {};
            }
        },

        unblockEvents: function () {
            if (this._oldTargets) {
                // Reset, but keep targets created while drawing.
                this.map._targets = Waymark_L.extend(this.map._targets, this._oldTargets);
                delete this._oldTargets;
            }
        },

        registerForDrawing: function (editor) {
            if (this._drawingEditor) this.unregisterForDrawing(this._drawingEditor);
            this.blockEvents();
            editor.reset();  // Make sure editor tools still receive events.
            this._drawingEditor = editor;
            this.map.on('mousemove touchmove', editor.onDrawingMouseMove, editor);
            this.map.on('mousedown', this.onMousedown, this);
            this.map.on('mouseup', this.onMouseup, this);
            Waymark_L.DomUtil.addClass(this.map._container, this.options.drawingCSSClass);
            this.defaultMapCursor = this.map._container.style.cursor;
            this.map._container.style.cursor = this.options.drawingCursor;
        },

        unregisterForDrawing: function (editor) {
            this.unblockEvents();
            Waymark_L.DomUtil.removeClass(this.map._container, this.options.drawingCSSClass);
            this.map._container.style.cursor = this.defaultMapCursor;
            editor = editor || this._drawingEditor;
            if (!editor) return;
            this.map.off('mousemove touchmove', editor.onDrawingMouseMove, editor);
            this.map.off('mousedown', this.onMousedown, this);
            this.map.off('mouseup', this.onMouseup, this);
            if (editor !== this._drawingEditor) return;
            delete this._drawingEditor;
            if (editor._drawing) editor.cancelDrawing();
        },

        onMousedown: function (e) {
            if (e.originalEvent.which != 1) return;
            this._mouseDown = e;
            this._drawingEditor.onDrawingMouseDown(e);
        },

        onMouseup: function (e) {
            if (this._mouseDown) {
                var editor = this._drawingEditor,
                    mouseDown = this._mouseDown;
                this._mouseDown = null;
                editor.onDrawingMouseUp(e);
                if (this._drawingEditor !== editor) return;  // onDrawingMouseUp may call unregisterFromDrawing.
                var origin = Waymark_L.point(mouseDown.originalEvent.clientX, mouseDown.originalEvent.clientY);
                var distance = Waymark_L.point(e.originalEvent.clientX, e.originalEvent.clientY).distanceTo(origin);
                if (Math.abs(distance) < 9 * (window.devicePixelRatio || 1)) this._drawingEditor.onDrawingClick(e);
            }
        },

        // 🍂section Public methods
        // You will generally access them by the `map.editTools`
        // instance:
        //
        // `map.editTools.startPolyline();`

        // 🍂method drawing(): boolean
        // Return true if any drawing action is ongoing.
        drawing: function () {
            return this._drawingEditor && this._drawingEditor.drawing();
        },

        // 🍂method stopDrawing()
        // When you need to stop any ongoing drawing, without needing to know which editor is active.
        stopDrawing: function () {
            this.unregisterForDrawing();
        },

        // 🍂method commitDrawing()
        // When you need to commit any ongoing drawing, without needing to know which editor is active.
        commitDrawing: function (e) {
            if (!this._drawingEditor) return;
            this._drawingEditor.commitDrawing(e);
        },

        connectCreatedToMap: function (layer) {
            return this.featuresLayer.addLayer(layer);
        },

        // 🍂method startPolyline(latlng: Waymark_L.LatLng, options: hash): Waymark_L.Polyline
        // Start drawing a Polyline. If `latlng` is given, a first point will be added. In any case, continuing on user click.
        // If `options` is given, it will be passed to the Polyline class constructor.
        startPolyline: function (latlng, options) {
            var line = this.createPolyline([], options);
            line.enableEdit(this.map).newShape(latlng);
            return line;
        },

        // 🍂method startPolygon(latlng: Waymark_L.LatLng, options: hash): Waymark_L.Polygon
        // Start drawing a Polygon. If `latlng` is given, a first point will be added. In any case, continuing on user click.
        // If `options` is given, it will be passed to the Polygon class constructor.
        startPolygon: function (latlng, options) {
            var polygon = this.createPolygon([], options);
            polygon.enableEdit(this.map).newShape(latlng);
            return polygon;
        },

        // 🍂method startMarker(latlng: Waymark_L.LatLng, options: hash): Waymark_L.Marker
        // Start adding a Marker. If `latlng` is given, the Marker will be shown first at this point.
        // In any case, it will follow the user mouse, and will have a final `latlng` on next click (or touch).
        // If `options` is given, it will be passed to the Marker class constructor.
        startMarker: function (latlng, options) {
            latlng = latlng || this.map.getCenter().clone();
            var marker = this.createMarker(latlng, options);
            marker.enableEdit(this.map).startDrawing();
            return marker;
        },

        // 🍂method startRectangle(latlng: Waymark_L.LatLng, options: hash): Waymark_L.Rectangle
        // Start drawing a Rectangle. If `latlng` is given, the Rectangle anchor will be added. In any case, continuing on user drag.
        // If `options` is given, it will be passed to the Rectangle class constructor.
        startRectangle: function(latlng, options) {
            var corner = latlng || Waymark_L.latLng([0, 0]);
            var bounds = new Waymark_L.LatLngBounds(corner, corner);
            var rectangle = this.createRectangle(bounds, options);
            rectangle.enableEdit(this.map).startDrawing();
            return rectangle;
        },

        // 🍂method startCircle(latlng: Waymark_L.LatLng, options: hash): Waymark_L.Circle
        // Start drawing a Circle. If `latlng` is given, the Circle anchor will be added. In any case, continuing on user drag.
        // If `options` is given, it will be passed to the Circle class constructor.
        startCircle: function (latlng, options) {
            latlng = latlng || this.map.getCenter().clone();
            var circle = this.createCircle(latlng, options);
            circle.enableEdit(this.map).startDrawing();
            return circle;
        },

        startHole: function (editor, latlng) {
            editor.newHole(latlng);
        },

        createLayer: function (klass, latlngs, options) {
            options = Waymark_L.Util.extend({editOptions: {editTools: this}}, options);
            var layer = new klass(latlngs, options);
            // 🍂namespace Editable
            // 🍂event editable:created: LayerEvent
            // Fired when a new feature (Marker, Polyline…) is created.
            this.fireAndForward('editable:created', {layer: layer});
            return layer;
        },

        createPolyline: function (latlngs, options) {
            return this.createLayer(options && options.polylineClass || this.options.polylineClass, latlngs, options);
        },

        createPolygon: function (latlngs, options) {
            return this.createLayer(options && options.polygonClass || this.options.polygonClass, latlngs, options);
        },

        createMarker: function (latlng, options) {
            return this.createLayer(options && options.markerClass || this.options.markerClass, latlng, options);
        },

        createRectangle: function (bounds, options) {
            return this.createLayer(options && options.rectangleClass || this.options.rectangleClass, bounds, options);
        },

        createCircle: function (latlng, options) {
            return this.createLayer(options && options.circleClass || this.options.circleClass, latlng, options);
        }

    });

    Waymark_L.extend(Waymark_L.Editable, {

        makeCancellable: function (e) {
            e.cancel = function () {
                e._cancelled = true;
            };
        }

    });

    // 🍂namespace Map; 🍂class Map
    // Leaflet.Editable add options and events to the `Waymark_L.Map` object.
    // See `Editable` events for the list of events fired on the Map.
    // 🍂example
    //
    // ```js
    // var map = Waymark_L.map('map', {
    //  editable: true,
    //  editOptions: {
    //    …
    // }
    // });
    // ```
    // 🍂section Editable Map Options
    Waymark_L.Map.mergeOptions({

        // 🍂namespace Map
        // 🍂section Map Options
        // 🍂option editToolsClass: class = Waymark_L.Editable
        // Class to be used as vertex, for path editing.
        editToolsClass: Waymark_L.Editable,

        // 🍂option editable: boolean = false
        // Whether to create a Waymark_L.Editable instance at map init.
        editable: false,

        // 🍂option editOptions: hash = {}
        // Options to pass to Waymark_L.Editable when instantiating.
        editOptions: {}

    });

    Waymark_L.Map.addInitHook(function () {

        this.whenReady(function () {
            if (this.options.editable) {
                this.editTools = new this.options.editToolsClass(this, this.options.editOptions);
            }
        });

    });

    Waymark_L.Editable.VertexIcon = Waymark_L.DivIcon.extend({

        options: {
            iconSize: new Waymark_L.Point(8, 8)
        }

    });

    Waymark_L.Editable.TouchVertexIcon = Waymark_L.Editable.VertexIcon.extend({

        options: {
            iconSize: new Waymark_L.Point(20, 20)
        }

    });


    // 🍂namespace Editable; 🍂class VertexMarker; Handler for dragging path vertices.
    Waymark_L.Editable.VertexMarker = Waymark_L.Marker.extend({

        options: {
            draggable: true,
            className: 'leaflet-div-icon leaflet-vertex-icon'
        },


        // 🍂section Public methods
        // The marker used to handle path vertex. You will usually interact with a `VertexMarker`
        // instance when listening for events like `editable:vertex:ctrlclick`.

        initialize: function (latlng, latlngs, editor, options) {
            // We don't use this._latlng, because on drag Leaflet replace it while
            // we want to keep reference.
            this.latlng = latlng;
            this.latlngs = latlngs;
            this.editor = editor;
            Waymark_L.Marker.prototype.initialize.call(this, latlng, options);
            this.options.icon = this.editor.tools.createVertexIcon({className: this.options.className});
            this.latlng.__vertex = this;
            this.editor.editLayer.addLayer(this);
            this.setZIndexOffset(editor.tools._lastZIndex + 1);
        },

        onAdd: function (map) {
            Waymark_L.Marker.prototype.onAdd.call(this, map);
            this.on('drag', this.onDrag);
            this.on('dragstart', this.onDragStart);
            this.on('dragend', this.onDragEnd);
            this.on('mouseup', this.onMouseup);
            this.on('click', this.onClick);
            this.on('contextmenu', this.onContextMenu);
            this.on('mousedown touchstart', this.onMouseDown);
            this.on('mouseover', this.onMouseOver);
            this.on('mouseout', this.onMouseOut);
            this.addMiddleMarkers();
        },

        onRemove: function (map) {
            if (this.middleMarker) this.middleMarker.delete();
            delete this.latlng.__vertex;
            this.off('drag', this.onDrag);
            this.off('dragstart', this.onDragStart);
            this.off('dragend', this.onDragEnd);
            this.off('mouseup', this.onMouseup);
            this.off('click', this.onClick);
            this.off('contextmenu', this.onContextMenu);
            this.off('mousedown touchstart', this.onMouseDown);
            this.off('mouseover', this.onMouseOver);
            this.off('mouseout', this.onMouseOut);
            Waymark_L.Marker.prototype.onRemove.call(this, map);
        },

        onDrag: function (e) {
            e.vertex = this;
            this.editor.onVertexMarkerDrag(e);
            var iconPos = Waymark_L.DomUtil.getPosition(this._icon),
                latlng = this._map.layerPointToLatLng(iconPos);
            this.latlng.update(latlng);
            this._latlng = this.latlng;  // Push back to Leaflet our reference.
            this.editor.refresh();
            if (this.middleMarker) this.middleMarker.updateLatLng();
            var next = this.getNext();
            if (next && next.middleMarker) next.middleMarker.updateLatLng();
        },

        onDragStart: function (e) {
            e.vertex = this;
            this.editor.onVertexMarkerDragStart(e);
        },

        onDragEnd: function (e) {
            e.vertex = this;
            this.editor.onVertexMarkerDragEnd(e);
        },

        onClick: function (e) {
            e.vertex = this;
            this.editor.onVertexMarkerClick(e);
        },

        onMouseup: function (e) {
            Waymark_L.DomEvent.stop(e);
            e.vertex = this;
            this.editor.map.fire('mouseup', e);
        },

        onContextMenu: function (e) {
            e.vertex = this;
            this.editor.onVertexMarkerContextMenu(e);
        },

        onMouseDown: function (e) {
            e.vertex = this;
            this.editor.onVertexMarkerMouseDown(e);
        },

        onMouseOver: function (e) {
            e.vertex = this;
            this.editor.onVertexMarkerMouseOver(e);
        },

        onMouseOut: function (e) {
            e.vertex = this;
            this.editor.onVertexMarkerMouseOut(e);
        },

        // 🍂method delete()
        // Delete a vertex and the related LatLng.
        delete: function () {
            var next = this.getNext();  // Compute before changing latlng
            this.latlngs.splice(this.getIndex(), 1);
            this.editor.editLayer.removeLayer(this);
            this.editor.onVertexDeleted({latlng: this.latlng, vertex: this});
            if (!this.latlngs.length) this.editor.deleteShape(this.latlngs);
            if (next) next.resetMiddleMarker();
            this.editor.refresh();
        },

        // 🍂method getIndex(): int
        // Get the index of the current vertex among others of the same LatLngs group.
        getIndex: function () {
            return this.latlngs.indexOf(this.latlng);
        },

        // 🍂method getLastIndex(): int
        // Get last vertex index of the LatLngs group of the current vertex.
        getLastIndex: function () {
            return this.latlngs.length - 1;
        },

        // 🍂method getPrevious(): VertexMarker
        // Get the previous VertexMarker in the same LatLngs group.
        getPrevious: function () {
            if (this.latlngs.length < 2) return;
            var index = this.getIndex(),
                previousIndex = index - 1;
            if (index === 0 && this.editor.CLOSED) previousIndex = this.getLastIndex();
            var previous = this.latlngs[previousIndex];
            if (previous) return previous.__vertex;
        },

        // 🍂method getNext(): VertexMarker
        // Get the next VertexMarker in the same LatLngs group.
        getNext: function () {
            if (this.latlngs.length < 2) return;
            var index = this.getIndex(),
                nextIndex = index + 1;
            if (index === this.getLastIndex() && this.editor.CLOSED) nextIndex = 0;
            var next = this.latlngs[nextIndex];
            if (next) return next.__vertex;
        },

        addMiddleMarker: function (previous) {
            if (!this.editor.hasMiddleMarkers()) return;
            previous = previous || this.getPrevious();
            if (previous && !this.middleMarker) this.middleMarker = this.editor.addMiddleMarker(previous, this, this.latlngs, this.editor);
        },

        addMiddleMarkers: function () {
            if (!this.editor.hasMiddleMarkers()) return;
            var previous = this.getPrevious();
            if (previous) this.addMiddleMarker(previous);
            var next = this.getNext();
            if (next) next.resetMiddleMarker();
        },

        resetMiddleMarker: function () {
            if (this.middleMarker) this.middleMarker.delete();
            this.addMiddleMarker();
        },

        // 🍂method split()
        // Split the vertex LatLngs group at its index, if possible.
        split: function () {
            if (!this.editor.splitShape) return;  // Only for PolylineEditor
            this.editor.splitShape(this.latlngs, this.getIndex());
        },

        // 🍂method continue()
        // Continue the vertex LatLngs from this vertex. Only active for first and last vertices of a Polyline.
        continue: function () {
            if (!this.editor.continueBackward) return;  // Only for PolylineEditor
            var index = this.getIndex();
            if (index === 0) this.editor.continueBackward(this.latlngs);
            else if (index === this.getLastIndex()) this.editor.continueForward(this.latlngs);
        }

    });

    Waymark_L.Editable.mergeOptions({

        // 🍂namespace Editable
        // 🍂option vertexMarkerClass: class = VertexMarker
        // Class to be used as vertex, for path editing.
        vertexMarkerClass: Waymark_L.Editable.VertexMarker

    });

    Waymark_L.Editable.MiddleMarker = Waymark_L.Marker.extend({

        options: {
            opacity: 0.5,
            className: 'leaflet-div-icon leaflet-middle-icon',
            draggable: true
        },

        initialize: function (left, right, latlngs, editor, options) {
            this.left = left;
            this.right = right;
            this.editor = editor;
            this.latlngs = latlngs;
            Waymark_L.Marker.prototype.initialize.call(this, this.computeLatLng(), options);
            this._opacity = this.options.opacity;
            this.options.icon = this.editor.tools.createVertexIcon({className: this.options.className});
            this.editor.editLayer.addLayer(this);
            this.setVisibility();
        },

        setVisibility: function () {
            var leftPoint = this._map.latLngToContainerPoint(this.left.latlng),
                rightPoint = this._map.latLngToContainerPoint(this.right.latlng),
                size = Waymark_L.point(this.options.icon.options.iconSize);
            if (leftPoint.distanceTo(rightPoint) < size.x * 3) this.hide();
            else this.show();
        },

        show: function () {
            this.setOpacity(this._opacity);
        },

        hide: function () {
            this.setOpacity(0);
        },

        updateLatLng: function () {
            this.setLatLng(this.computeLatLng());
            this.setVisibility();
        },

        computeLatLng: function () {
            var leftPoint = this.editor.map.latLngToContainerPoint(this.left.latlng),
                rightPoint = this.editor.map.latLngToContainerPoint(this.right.latlng),
                y = (leftPoint.y + rightPoint.y) / 2,
                x = (leftPoint.x + rightPoint.x) / 2;
            return this.editor.map.containerPointToLatLng([x, y]);
        },

        onAdd: function (map) {
            Waymark_L.Marker.prototype.onAdd.call(this, map);
            Waymark_L.DomEvent.on(this._icon, 'mousedown touchstart', this.onMouseDown, this);
            map.on('zoomend', this.setVisibility, this);
        },

        onRemove: function (map) {
            delete this.right.middleMarker;
            Waymark_L.DomEvent.off(this._icon, 'mousedown touchstart', this.onMouseDown, this);
            map.off('zoomend', this.setVisibility, this);
            Waymark_L.Marker.prototype.onRemove.call(this, map);
        },

        onMouseDown: function (e) {
            var iconPos = Waymark_L.DomUtil.getPosition(this._icon),
                latlng = this.editor.map.layerPointToLatLng(iconPos);
            e = {
                originalEvent: e,
                latlng: latlng
            };
            if (this.options.opacity === 0) return;
            Waymark_L.Editable.makeCancellable(e);
            this.editor.onMiddleMarkerMouseDown(e);
            if (e._cancelled) return;
            this.latlngs.splice(this.index(), 0, e.latlng);
            this.editor.refresh();
            var icon = this._icon;
            var marker = this.editor.addVertexMarker(e.latlng, this.latlngs);
            this.editor.onNewVertex(marker);
            /* Hack to workaround browser not firing touchend when element is no more on DOM */
            var parent = marker._icon.parentNode;
            parent.removeChild(marker._icon);
            marker._icon = icon;
            parent.appendChild(marker._icon);
            marker._initIcon();
            marker._initInteraction();
            marker.setOpacity(1);
            /* End hack */
            // Transfer ongoing dragging to real marker
            Waymark_L.Draggable._dragging = false;
            marker.dragging._draggable._onDown(e.originalEvent);
            this.delete();
        },

        delete: function () {
            this.editor.editLayer.removeLayer(this);
        },

        index: function () {
            return this.latlngs.indexOf(this.right.latlng);
        }

    });

    Waymark_L.Editable.mergeOptions({

        // 🍂namespace Editable
        // 🍂option middleMarkerClass: class = VertexMarker
        // Class to be used as middle vertex, pulled by the user to create a new point in the middle of a path.
        middleMarkerClass: Waymark_L.Editable.MiddleMarker

    });

    // 🍂namespace Editable; 🍂class BaseEditor; 🍂aka Waymark_L.Editable.BaseEditor
    // When editing a feature (Marker, Polyline…), an editor is attached to it. This
    // editor basically knows how to handle the edition.
    Waymark_L.Editable.BaseEditor = Waymark_L.Handler.extend({

        initialize: function (map, feature, options) {
            Waymark_L.setOptions(this, options);
            this.map = map;
            this.feature = feature;
            this.feature.editor = this;
            this.editLayer = new Waymark_L.LayerGroup();
            this.tools = this.options.editTools || map.editTools;
        },

        // 🍂method enable(): this
        // Set up the drawing tools for the feature to be editable.
        addHooks: function () {
            if (this.isConnected()) this.onFeatureAdd();
            else this.feature.once('add', this.onFeatureAdd, this);
            this.onEnable();
            this.feature.on(this._getEvents(), this);
        },

        // 🍂method disable(): this
        // Remove the drawing tools for the feature.
        removeHooks: function () {
            this.feature.off(this._getEvents(), this);
            if (this.feature.dragging) this.feature.dragging.disable();
            this.editLayer.clearLayers();
            this.tools.editLayer.removeLayer(this.editLayer);
            this.onDisable();
            if (this._drawing) this.cancelDrawing();
        },

        // 🍂method drawing(): boolean
        // Return true if any drawing action is ongoing with this editor.
        drawing: function () {
            return !!this._drawing;
        },

        reset: function () {},

        onFeatureAdd: function () {
            this.tools.editLayer.addLayer(this.editLayer);
            if (this.feature.dragging) this.feature.dragging.enable();
        },

        hasMiddleMarkers: function () {
            return !this.options.skipMiddleMarkers && !this.tools.options.skipMiddleMarkers;
        },

        fireAndForward: function (type, e) {
            e = e || {};
            e.layer = this.feature;
            this.feature.fire(type, e);
            this.tools.fireAndForward(type, e);
        },

        onEnable: function () {
            // 🍂namespace Editable
            // 🍂event editable:enable: Event
            // Fired when an existing feature is ready to be edited.
            this.fireAndForward('editable:enable');
        },

        onDisable: function () {
            // 🍂namespace Editable
            // 🍂event editable:disable: Event
            // Fired when an existing feature is not ready anymore to be edited.
            this.fireAndForward('editable:disable');
        },

        onEditing: function () {
            // 🍂namespace Editable
            // 🍂event editable:editing: Event
            // Fired as soon as any change is made to the feature geometry.
            this.fireAndForward('editable:editing');
        },

        onStartDrawing: function () {
            // 🍂namespace Editable
            // 🍂section Drawing events
            // 🍂event editable:drawing:start: Event
            // Fired when a feature is to be drawn.
            this.fireAndForward('editable:drawing:start');
        },

        onEndDrawing: function () {
            // 🍂namespace Editable
            // 🍂section Drawing events
            // 🍂event editable:drawing:end: Event
            // Fired when a feature is not drawn anymore.
            this.fireAndForward('editable:drawing:end');
        },

        onCancelDrawing: function () {
            // 🍂namespace Editable
            // 🍂section Drawing events
            // 🍂event editable:drawing:cancel: Event
            // Fired when user cancel drawing while a feature is being drawn.
            this.fireAndForward('editable:drawing:cancel');
        },

        onCommitDrawing: function (e) {
            // 🍂namespace Editable
            // 🍂section Drawing events
            // 🍂event editable:drawing:commit: Event
            // Fired when user finish drawing a feature.
            this.fireAndForward('editable:drawing:commit', e);
        },

        onDrawingMouseDown: function (e) {
            // 🍂namespace Editable
            // 🍂section Drawing events
            // 🍂event editable:drawing:mousedown: Event
            // Fired when user `mousedown` while drawing.
            this.fireAndForward('editable:drawing:mousedown', e);
        },

        onDrawingMouseUp: function (e) {
            // 🍂namespace Editable
            // 🍂section Drawing events
            // 🍂event editable:drawing:mouseup: Event
            // Fired when user `mouseup` while drawing.
            this.fireAndForward('editable:drawing:mouseup', e);
        },

        startDrawing: function () {
            if (!this._drawing) this._drawing = Waymark_L.Editable.FORWARD;
            this.tools.registerForDrawing(this);
            this.onStartDrawing();
        },

        commitDrawing: function (e) {
            this.onCommitDrawing(e);
            this.endDrawing();
        },

        cancelDrawing: function () {
            // If called during a vertex drag, the vertex will be removed before
            // the mouseup fires on it. This is a workaround. Maybe better fix is
            // To have Waymark_L.Draggable reset it's status on disable (Leaflet side).
            Waymark_L.Draggable._dragging = false;
            this.onCancelDrawing();
            this.endDrawing();
        },

        endDrawing: function () {
            this._drawing = false;
            this.tools.unregisterForDrawing(this);
            this.onEndDrawing();
        },

        onDrawingClick: function (e) {
            if (!this.drawing()) return;
            Waymark_L.Editable.makeCancellable(e);
            // 🍂namespace Editable
            // 🍂section Drawing events
            // 🍂event editable:drawing:click: CancelableEvent
            // Fired when user `click` while drawing, before any internal action is being processed.
            this.fireAndForward('editable:drawing:click', e);
            if (e._cancelled) return;
            if (!this.isConnected()) this.connect(e);
            this.processDrawingClick(e);
        },

        isConnected: function () {
            return this.map.hasLayer(this.feature);
        },

        connect: function () {
            this.tools.connectCreatedToMap(this.feature);
            this.tools.editLayer.addLayer(this.editLayer);
        },

        onMove: function (e) {
            // 🍂namespace Editable
            // 🍂section Drawing events
            // 🍂event editable:drawing:move: Event
            // Fired when `move` mouse while drawing, while dragging a marker, and while dragging a vertex.
            this.fireAndForward('editable:drawing:move', e);
        },

        onDrawingMouseMove: function (e) {
            this.onMove(e);
        },

        _getEvents: function () {
            return {
                dragstart: this.onDragStart,
                drag: this.onDrag,
                dragend: this.onDragEnd,
                remove: this.disable
            };
        },

        onDragStart: function (e) {
            this.onEditing();
            // 🍂namespace Editable
            // 🍂event editable:dragstart: Event
            // Fired before a path feature is dragged.
            this.fireAndForward('editable:dragstart', e);
        },

        onDrag: function (e) {
            this.onMove(e);
            // 🍂namespace Editable
            // 🍂event editable:drag: Event
            // Fired when a path feature is being dragged.
            this.fireAndForward('editable:drag', e);
        },

        onDragEnd: function (e) {
            // 🍂namespace Editable
            // 🍂event editable:dragend: Event
            // Fired after a path feature has been dragged.
            this.fireAndForward('editable:dragend', e);
        }

    });

    // 🍂namespace Editable; 🍂class MarkerEditor; 🍂aka Waymark_L.Editable.MarkerEditor
    // 🍂inherits BaseEditor
    // Editor for Marker.
    Waymark_L.Editable.MarkerEditor = Waymark_L.Editable.BaseEditor.extend({

        onDrawingMouseMove: function (e) {
            Waymark_L.Editable.BaseEditor.prototype.onDrawingMouseMove.call(this, e);
            if (this._drawing) this.feature.setLatLng(e.latlng);
        },

        processDrawingClick: function (e) {
            // 🍂namespace Editable
            // 🍂section Drawing events
            // 🍂event editable:drawing:clicked: Event
            // Fired when user `click` while drawing, after all internal actions.
            this.fireAndForward('editable:drawing:clicked', e);
            this.commitDrawing(e);
        },

        connect: function (e) {
            // On touch, the latlng has not been updated because there is
            // no mousemove.
            if (e) this.feature._latlng = e.latlng;
            Waymark_L.Editable.BaseEditor.prototype.connect.call(this, e);
        }

    });

    // 🍂namespace Editable; 🍂class PathEditor; 🍂aka Waymark_L.Editable.PathEditor
    // 🍂inherits BaseEditor
    // Base class for all path editors.
    Waymark_L.Editable.PathEditor = Waymark_L.Editable.BaseEditor.extend({

        CLOSED: false,
        MIN_VERTEX: 2,

        addHooks: function () {
            Waymark_L.Editable.BaseEditor.prototype.addHooks.call(this);
            if (this.feature) this.initVertexMarkers();
            return this;
        },

        initVertexMarkers: function (latlngs) {
            if (!this.enabled()) return;
            latlngs = latlngs || this.getLatLngs();
            if (isFlat(latlngs)) this.addVertexMarkers(latlngs);
            else for (var i = 0; i < latlngs.length; i++) this.initVertexMarkers(latlngs[i]);
        },

        getLatLngs: function () {
            return this.feature.getLatLngs();
        },

        // 🍂method reset()
        // Rebuild edit elements (Vertex, MiddleMarker, etc.).
        reset: function () {
            this.editLayer.clearLayers();
            this.initVertexMarkers();
        },

        addVertexMarker: function (latlng, latlngs) {
            return new this.tools.options.vertexMarkerClass(latlng, latlngs, this);
        },

        onNewVertex: function (vertex) {
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:new: VertexEvent
            // Fired when a new vertex is created.
            this.fireAndForward('editable:vertex:new', {latlng: vertex.latlng, vertex: vertex});
        },

        addVertexMarkers: function (latlngs) {
            for (var i = 0; i < latlngs.length; i++) {
                this.addVertexMarker(latlngs[i], latlngs);
            }
        },

        refreshVertexMarkers: function (latlngs) {
            latlngs = latlngs || this.getDefaultLatLngs();
            for (var i = 0; i < latlngs.length; i++) {
                latlngs[i].__vertex.update();
            }
        },

        addMiddleMarker: function (left, right, latlngs) {
            return new this.tools.options.middleMarkerClass(left, right, latlngs, this);
        },

        onVertexMarkerClick: function (e) {
            Waymark_L.Editable.makeCancellable(e);
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:click: CancelableVertexEvent
            // Fired when a `click` is issued on a vertex, before any internal action is being processed.
            this.fireAndForward('editable:vertex:click', e);
            if (e._cancelled) return;
            if (this.tools.drawing() && this.tools._drawingEditor !== this) return;
            var index = e.vertex.getIndex(), commit;
            if (e.originalEvent.ctrlKey) {
                this.onVertexMarkerCtrlClick(e);
            } else if (e.originalEvent.altKey) {
                this.onVertexMarkerAltClick(e);
            } else if (e.originalEvent.shiftKey) {
                this.onVertexMarkerShiftClick(e);
            } else if (e.originalEvent.metaKey) {
                this.onVertexMarkerMetaKeyClick(e);
            } else if (index === e.vertex.getLastIndex() && this._drawing === Waymark_L.Editable.FORWARD) {
                if (index >= this.MIN_VERTEX - 1) commit = true;
            } else if (index === 0 && this._drawing === Waymark_L.Editable.BACKWARD && this._drawnLatLngs.length >= this.MIN_VERTEX) {
                commit = true;
            } else if (index === 0 && this._drawing === Waymark_L.Editable.FORWARD && this._drawnLatLngs.length >= this.MIN_VERTEX && this.CLOSED) {
                commit = true;  // Allow to close on first point also for polygons
            } else {
                this.onVertexRawMarkerClick(e);
            }
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:clicked: VertexEvent
            // Fired when a `click` is issued on a vertex, after all internal actions.
            this.fireAndForward('editable:vertex:clicked', e);
            if (commit) this.commitDrawing(e);
        },

        onVertexRawMarkerClick: function (e) {
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:rawclick: CancelableVertexEvent
            // Fired when a `click` is issued on a vertex without any special key and without being in drawing mode.
            this.fireAndForward('editable:vertex:rawclick', e);
            if (e._cancelled) return;
            if (!this.vertexCanBeDeleted(e.vertex)) return;
            e.vertex.delete();
        },

        vertexCanBeDeleted: function (vertex) {
            return vertex.latlngs.length > this.MIN_VERTEX;
        },

        onVertexDeleted: function (e) {
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:deleted: VertexEvent
            // Fired after a vertex has been deleted by user.
            this.fireAndForward('editable:vertex:deleted', e);
        },

        onVertexMarkerCtrlClick: function (e) {
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:ctrlclick: VertexEvent
            // Fired when a `click` with `ctrlKey` is issued on a vertex.
            this.fireAndForward('editable:vertex:ctrlclick', e);
        },

        onVertexMarkerShiftClick: function (e) {
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:shiftclick: VertexEvent
            // Fired when a `click` with `shiftKey` is issued on a vertex.
            this.fireAndForward('editable:vertex:shiftclick', e);
        },

        onVertexMarkerMetaKeyClick: function (e) {
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:metakeyclick: VertexEvent
            // Fired when a `click` with `metaKey` is issued on a vertex.
            this.fireAndForward('editable:vertex:metakeyclick', e);
        },

        onVertexMarkerAltClick: function (e) {
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:altclick: VertexEvent
            // Fired when a `click` with `altKey` is issued on a vertex.
            this.fireAndForward('editable:vertex:altclick', e);
        },

        onVertexMarkerContextMenu: function (e) {
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:contextmenu: VertexEvent
            // Fired when a `contextmenu` is issued on a vertex.
            this.fireAndForward('editable:vertex:contextmenu', e);
        },

        onVertexMarkerMouseDown: function (e) {
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:mousedown: VertexEvent
            // Fired when user `mousedown` a vertex.
            this.fireAndForward('editable:vertex:mousedown', e);
        },

        onVertexMarkerMouseOver: function (e) {
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:mouseover: VertexEvent
            // Fired when a user's mouse enters the vertex
            this.fireAndForward('editable:vertex:mouseover', e);
        },

        onVertexMarkerMouseOut: function (e) {
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:mouseout: VertexEvent
            // Fired when a user's mouse leaves the vertex
            this.fireAndForward('editable:vertex:mouseout', e);
        },

        onMiddleMarkerMouseDown: function (e) {
            // 🍂namespace Editable
            // 🍂section MiddleMarker events
            // 🍂event editable:middlemarker:mousedown: VertexEvent
            // Fired when user `mousedown` a middle marker.
            this.fireAndForward('editable:middlemarker:mousedown', e);
        },

        onVertexMarkerDrag: function (e) {
            this.onMove(e);
            if (this.feature._bounds) this.extendBounds(e);
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:drag: VertexEvent
            // Fired when a vertex is dragged by user.
            this.fireAndForward('editable:vertex:drag', e);
        },

        onVertexMarkerDragStart: function (e) {
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:dragstart: VertexEvent
            // Fired before a vertex is dragged by user.
            this.fireAndForward('editable:vertex:dragstart', e);
        },

        onVertexMarkerDragEnd: function (e) {
            // 🍂namespace Editable
            // 🍂section Vertex events
            // 🍂event editable:vertex:dragend: VertexEvent
            // Fired after a vertex is dragged by user.
            this.fireAndForward('editable:vertex:dragend', e);
        },

        setDrawnLatLngs: function (latlngs) {
            this._drawnLatLngs = latlngs || this.getDefaultLatLngs();
        },

        startDrawing: function () {
            if (!this._drawnLatLngs) this.setDrawnLatLngs();
            Waymark_L.Editable.BaseEditor.prototype.startDrawing.call(this);
        },

        startDrawingForward: function () {
            this.startDrawing();
        },

        endDrawing: function () {
            this.tools.detachForwardLineGuide();
            this.tools.detachBackwardLineGuide();
            if (this._drawnLatLngs && this._drawnLatLngs.length < this.MIN_VERTEX) this.deleteShape(this._drawnLatLngs);
            Waymark_L.Editable.BaseEditor.prototype.endDrawing.call(this);
            delete this._drawnLatLngs;
        },

        addLatLng: function (latlng) {
            if (this._drawing === Waymark_L.Editable.FORWARD) this._drawnLatLngs.push(latlng);
            else this._drawnLatLngs.unshift(latlng);
            this.feature._bounds.extend(latlng);
            var vertex = this.addVertexMarker(latlng, this._drawnLatLngs);
            this.onNewVertex(vertex);
            this.refresh();
        },

        newPointForward: function (latlng) {
            this.addLatLng(latlng);
            this.tools.attachForwardLineGuide();
            this.tools.anchorForwardLineGuide(latlng);
        },

        newPointBackward: function (latlng) {
            this.addLatLng(latlng);
            this.tools.anchorBackwardLineGuide(latlng);
        },

        // 🍂namespace PathEditor
        // 🍂method push()
        // Programmatically add a point while drawing.
        push: function (latlng) {
            if (!latlng) return console.error('Waymark_L.Editable.PathEditor.push expect a valid latlng as parameter');
            if (this._drawing === Waymark_L.Editable.FORWARD) this.newPointForward(latlng);
            else this.newPointBackward(latlng);
        },

        removeLatLng: function (latlng) {
            latlng.__vertex.delete();
            this.refresh();
        },

        // 🍂method pop(): Waymark_L.LatLng or null
        // Programmatically remove last point (if any) while drawing.
        pop: function () {
            if (this._drawnLatLngs.length <= 1) return;
            var latlng;
            if (this._drawing === Waymark_L.Editable.FORWARD) latlng = this._drawnLatLngs[this._drawnLatLngs.length - 1];
            else latlng = this._drawnLatLngs[0];
            this.removeLatLng(latlng);
            if (this._drawing === Waymark_L.Editable.FORWARD) this.tools.anchorForwardLineGuide(this._drawnLatLngs[this._drawnLatLngs.length - 1]);
            else this.tools.anchorForwardLineGuide(this._drawnLatLngs[0]);
            return latlng;
        },

        processDrawingClick: function (e) {
            if (e.vertex && e.vertex.editor === this) return;
            if (this._drawing === Waymark_L.Editable.FORWARD) this.newPointForward(e.latlng);
            else this.newPointBackward(e.latlng);
            this.fireAndForward('editable:drawing:clicked', e);
        },

        onDrawingMouseMove: function (e) {
            Waymark_L.Editable.BaseEditor.prototype.onDrawingMouseMove.call(this, e);
            if (this._drawing) {
                this.tools.moveForwardLineGuide(e.latlng);
                this.tools.moveBackwardLineGuide(e.latlng);
            }
        },

        refresh: function () {
            this.feature.redraw();
            this.onEditing();
        },

        // 🍂namespace PathEditor
        // 🍂method newShape(latlng?: Waymark_L.LatLng)
        // Add a new shape (Polyline, Polygon) in a multi, and setup up drawing tools to draw it;
        // if optional `latlng` is given, start a path at this point.
        newShape: function (latlng) {
            var shape = this.addNewEmptyShape();
            if (!shape) return;
            this.setDrawnLatLngs(shape[0] || shape);  // Polygon or polyline
            this.startDrawingForward();
            // 🍂namespace Editable
            // 🍂section Shape events
            // 🍂event editable:shape:new: ShapeEvent
            // Fired when a new shape is created in a multi (Polygon or Polyline).
            this.fireAndForward('editable:shape:new', {shape: shape});
            if (latlng) this.newPointForward(latlng);
        },

        deleteShape: function (shape, latlngs) {
            var e = {shape: shape};
            Waymark_L.Editable.makeCancellable(e);
            // 🍂namespace Editable
            // 🍂section Shape events
            // 🍂event editable:shape:delete: CancelableShapeEvent
            // Fired before a new shape is deleted in a multi (Polygon or Polyline).
            this.fireAndForward('editable:shape:delete', e);
            if (e._cancelled) return;
            shape = this._deleteShape(shape, latlngs);
            if (this.ensureNotFlat) this.ensureNotFlat();  // Polygon.
            this.feature.setLatLngs(this.getLatLngs());  // Force bounds reset.
            this.refresh();
            this.reset();
            // 🍂namespace Editable
            // 🍂section Shape events
            // 🍂event editable:shape:deleted: ShapeEvent
            // Fired after a new shape is deleted in a multi (Polygon or Polyline).
            this.fireAndForward('editable:shape:deleted', {shape: shape});
            return shape;
        },

        _deleteShape: function (shape, latlngs) {
            latlngs = latlngs || this.getLatLngs();
            if (!latlngs.length) return;
            var self = this,
                inplaceDelete = function (latlngs, shape) {
                    // Called when deleting a flat latlngs
                    shape = latlngs.splice(0, Number.MAX_VALUE);
                    return shape;
                },
                spliceDelete = function (latlngs, shape) {
                    // Called when removing a latlngs inside an array
                    latlngs.splice(latlngs.indexOf(shape), 1);
                    if (!latlngs.length) self._deleteShape(latlngs);
                    return shape;
                };
            if (latlngs === shape) return inplaceDelete(latlngs, shape);
            for (var i = 0; i < latlngs.length; i++) {
                if (latlngs[i] === shape) return spliceDelete(latlngs, shape);
                else if (latlngs[i].indexOf(shape) !== -1) return spliceDelete(latlngs[i], shape);
            }
        },

        // 🍂namespace PathEditor
        // 🍂method deleteShapeAt(latlng: Waymark_L.LatLng): Array
        // Remove a path shape at the given `latlng`.
        deleteShapeAt: function (latlng) {
            var shape = this.feature.shapeAt(latlng);
            if (shape) return this.deleteShape(shape);
        },

        // 🍂method appendShape(shape: Array)
        // Append a new shape to the Polygon or Polyline.
        appendShape: function (shape) {
            this.insertShape(shape);
        },

        // 🍂method prependShape(shape: Array)
        // Prepend a new shape to the Polygon or Polyline.
        prependShape: function (shape) {
            this.insertShape(shape, 0);
        },

        // 🍂method insertShape(shape: Array, index: int)
        // Insert a new shape to the Polygon or Polyline at given index (default is to append).
        insertShape: function (shape, index) {
            this.ensureMulti();
            shape = this.formatShape(shape);
            if (typeof index === 'undefined') index = this.feature._latlngs.length;
            this.feature._latlngs.splice(index, 0, shape);
            this.feature.redraw();
            if (this._enabled) this.reset();
        },

        extendBounds: function (e) {
            this.feature._bounds.extend(e.vertex.latlng);
        },

        onDragStart: function (e) {
            this.editLayer.clearLayers();
            Waymark_L.Editable.BaseEditor.prototype.onDragStart.call(this, e);
        },

        onDragEnd: function (e) {
            this.initVertexMarkers();
            Waymark_L.Editable.BaseEditor.prototype.onDragEnd.call(this, e);
        }

    });

    // 🍂namespace Editable; 🍂class PolylineEditor; 🍂aka Waymark_L.Editable.PolylineEditor
    // 🍂inherits PathEditor
    Waymark_L.Editable.PolylineEditor = Waymark_L.Editable.PathEditor.extend({

        startDrawingBackward: function () {
            this._drawing = Waymark_L.Editable.BACKWARD;
            this.startDrawing();
        },

        // 🍂method continueBackward(latlngs?: Array)
        // Set up drawing tools to continue the line backward.
        continueBackward: function (latlngs) {
            if (this.drawing()) return;
            latlngs = latlngs || this.getDefaultLatLngs();
            this.setDrawnLatLngs(latlngs);
            if (latlngs.length > 0) {
                this.tools.attachBackwardLineGuide();
                this.tools.anchorBackwardLineGuide(latlngs[0]);
            }
            this.startDrawingBackward();
        },

        // 🍂method continueForward(latlngs?: Array)
        // Set up drawing tools to continue the line forward.
        continueForward: function (latlngs) {
            if (this.drawing()) return;
            latlngs = latlngs || this.getDefaultLatLngs();
            this.setDrawnLatLngs(latlngs);
            if (latlngs.length > 0) {
                this.tools.attachForwardLineGuide();
                this.tools.anchorForwardLineGuide(latlngs[latlngs.length - 1]);
            }
            this.startDrawingForward();
        },

        getDefaultLatLngs: function (latlngs) {
            latlngs = latlngs || this.feature._latlngs;
            if (!latlngs.length || latlngs[0] instanceof Waymark_L.LatLng) return latlngs;
            else return this.getDefaultLatLngs(latlngs[0]);
        },

        ensureMulti: function () {
            if (this.feature._latlngs.length && isFlat(this.feature._latlngs)) {
                this.feature._latlngs = [this.feature._latlngs];
            }
        },

        addNewEmptyShape: function () {
            if (this.feature._latlngs.length) {
                var shape = [];
                this.appendShape(shape);
                return shape;
            } else {
                return this.feature._latlngs;
            }
        },

        formatShape: function (shape) {
            if (isFlat(shape)) return shape;
            else if (shape[0]) return this.formatShape(shape[0]);
        },

        // 🍂method splitShape(latlngs?: Array, index: int)
        // Split the given `latlngs` shape at index `index` and integrate new shape in instance `latlngs`.
        splitShape: function (shape, index) {
            if (!index || index >= shape.length - 1) return;
            this.ensureMulti();
            var shapeIndex = this.feature._latlngs.indexOf(shape);
            if (shapeIndex === -1) return;
            var first = shape.slice(0, index + 1),
                second = shape.slice(index);
            // We deal with reference, we don't want twice the same latlng around.
            second[0] = Waymark_L.latLng(second[0].lat, second[0].lng, second[0].alt);
            this.feature._latlngs.splice(shapeIndex, 1, first, second);
            this.refresh();
            this.reset();
        }

    });

    // 🍂namespace Editable; 🍂class PolygonEditor; 🍂aka Waymark_L.Editable.PolygonEditor
    // 🍂inherits PathEditor
    Waymark_L.Editable.PolygonEditor = Waymark_L.Editable.PathEditor.extend({

        CLOSED: true,
        MIN_VERTEX: 3,

        newPointForward: function (latlng) {
            Waymark_L.Editable.PathEditor.prototype.newPointForward.call(this, latlng);
            if (!this.tools.backwardLineGuide._latlngs.length) this.tools.anchorBackwardLineGuide(latlng);
            if (this._drawnLatLngs.length === 2) this.tools.attachBackwardLineGuide();
        },

        addNewEmptyHole: function (latlng) {
            this.ensureNotFlat();
            var latlngs = this.feature.shapeAt(latlng);
            if (!latlngs) return;
            var holes = [];
            latlngs.push(holes);
            return holes;
        },

        // 🍂method newHole(latlng?: Waymark_L.LatLng, index: int)
        // Set up drawing tools for creating a new hole on the Polygon. If the `latlng` param is given, a first point is created.
        newHole: function (latlng) {
            var holes = this.addNewEmptyHole(latlng);
            if (!holes) return;
            this.setDrawnLatLngs(holes);
            this.startDrawingForward();
            if (latlng) this.newPointForward(latlng);
        },

        addNewEmptyShape: function () {
            if (this.feature._latlngs.length && this.feature._latlngs[0].length) {
                var shape = [];
                this.appendShape(shape);
                return shape;
            } else {
                return this.feature._latlngs;
            }
        },

        ensureMulti: function () {
            if (this.feature._latlngs.length && isFlat(this.feature._latlngs[0])) {
                this.feature._latlngs = [this.feature._latlngs];
            }
        },

        ensureNotFlat: function () {
            if (!this.feature._latlngs.length || isFlat(this.feature._latlngs)) this.feature._latlngs = [this.feature._latlngs];
        },

        vertexCanBeDeleted: function (vertex) {
            var parent = this.feature.parentShape(vertex.latlngs),
                idx = Waymark_L.Util.indexOf(parent, vertex.latlngs);
            if (idx > 0) return true;  // Holes can be totally deleted without removing the layer itself.
            return Waymark_L.Editable.PathEditor.prototype.vertexCanBeDeleted.call(this, vertex);
        },

        getDefaultLatLngs: function () {
            if (!this.feature._latlngs.length) this.feature._latlngs.push([]);
            return this.feature._latlngs[0];
        },

        formatShape: function (shape) {
            // [[1, 2], [3, 4]] => must be nested
            // [] => must be nested
            // [[]] => is already nested
            if (isFlat(shape) && (!shape[0] || shape[0].length !== 0)) return [shape];
            else return shape;
        }

    });

    // 🍂namespace Editable; 🍂class RectangleEditor; 🍂aka Waymark_L.Editable.RectangleEditor
    // 🍂inherits PathEditor
    Waymark_L.Editable.RectangleEditor = Waymark_L.Editable.PathEditor.extend({

        CLOSED: true,
        MIN_VERTEX: 4,

        options: {
            skipMiddleMarkers: true
        },

        extendBounds: function (e) {
            var index = e.vertex.getIndex(),
                next = e.vertex.getNext(),
                previous = e.vertex.getPrevious(),
                oppositeIndex = (index + 2) % 4,
                opposite = e.vertex.latlngs[oppositeIndex],
                bounds = new Waymark_L.LatLngBounds(e.latlng, opposite);
            // Update latlngs by hand to preserve order.
            previous.latlng.update([e.latlng.lat, opposite.lng]);
            next.latlng.update([opposite.lat, e.latlng.lng]);
            this.updateBounds(bounds);
            this.refreshVertexMarkers();
        },

        onDrawingMouseDown: function (e) {
            Waymark_L.Editable.PathEditor.prototype.onDrawingMouseDown.call(this, e);
            this.connect();
            var latlngs = this.getDefaultLatLngs();
            // Waymark_L.Polygon._convertLatLngs removes last latlng if it equals first point,
            // which is the case here as all latlngs are [0, 0]
            if (latlngs.length === 3) latlngs.push(e.latlng);
            var bounds = new Waymark_L.LatLngBounds(e.latlng, e.latlng);
            this.updateBounds(bounds);
            this.updateLatLngs(bounds);
            this.refresh();
            this.reset();
            // Stop dragging map.
            // Waymark_L.Draggable has two workflows:
            // - mousedown => mousemove => mouseup
            // - touchstart => touchmove => touchend
            // Problem: Waymark_L.Map.Tap does not allow us to listen to touchstart, so we only
            // can deal with mousedown, but then when in a touch device, we are dealing with
            // simulated events (actually simulated by Waymark_L.Map.Tap), which are no more taken
            // into account by Waymark_L.Draggable.
            // Ref.: https://github.com/Leaflet/Leaflet.Editable/issues/103
            e.originalEvent._simulated = false;
            this.map.dragging._draggable._onUp(e.originalEvent);
            // Now transfer ongoing drag action to the bottom right corner.
            // Should we refine which corner will handle the drag according to
            // drag direction?
            latlngs[3].__vertex.dragging._draggable._onDown(e.originalEvent);
        },

        onDrawingMouseUp: function (e) {
            this.commitDrawing(e);
            e.originalEvent._simulated = false;
            Waymark_L.Editable.PathEditor.prototype.onDrawingMouseUp.call(this, e);
        },

        onDrawingMouseMove: function (e) {
            e.originalEvent._simulated = false;
            Waymark_L.Editable.PathEditor.prototype.onDrawingMouseMove.call(this, e);
        },


        getDefaultLatLngs: function (latlngs) {
            return latlngs || this.feature._latlngs[0];
        },

        updateBounds: function (bounds) {
            this.feature._bounds = bounds;
        },

        updateLatLngs: function (bounds) {
            var latlngs = this.getDefaultLatLngs(),
                newLatlngs = this.feature._boundsToLatLngs(bounds);
            // Keep references.
            for (var i = 0; i < latlngs.length; i++) {
                latlngs[i].update(newLatlngs[i]);
            }
        }

    });

    // 🍂namespace Editable; 🍂class CircleEditor; 🍂aka Waymark_L.Editable.CircleEditor
    // 🍂inherits PathEditor
    Waymark_L.Editable.CircleEditor = Waymark_L.Editable.PathEditor.extend({

        MIN_VERTEX: 2,

        options: {
            skipMiddleMarkers: true
        },

        initialize: function (map, feature, options) {
            Waymark_L.Editable.PathEditor.prototype.initialize.call(this, map, feature, options);
            this._resizeLatLng = this.computeResizeLatLng();
        },

        computeResizeLatLng: function () {
            // While circle is not added to the map, _radius is not set.
            var delta = (this.feature._radius || this.feature._mRadius) * Math.cos(Math.PI / 4),
                point = this.map.project(this.feature._latlng);
            return this.map.unproject([point.x + delta, point.y - delta]);
        },

        updateResizeLatLng: function () {
            this._resizeLatLng.update(this.computeResizeLatLng());
            this._resizeLatLng.__vertex.update();
        },

        getLatLngs: function () {
            return [this.feature._latlng, this._resizeLatLng];
        },

        getDefaultLatLngs: function () {
            return this.getLatLngs();
        },

        onVertexMarkerDrag: function (e) {
            if (e.vertex.getIndex() === 1) this.resize(e);
            else this.updateResizeLatLng(e);
            Waymark_L.Editable.PathEditor.prototype.onVertexMarkerDrag.call(this, e);
        },

        resize: function (e) {
            var radius = this.feature._latlng.distanceTo(e.latlng);
            this.feature.setRadius(radius);
        },

        onDrawingMouseDown: function (e) {
            Waymark_L.Editable.PathEditor.prototype.onDrawingMouseDown.call(this, e);
            this._resizeLatLng.update(e.latlng);
            this.feature._latlng.update(e.latlng);
            this.connect();
            // Stop dragging map.
            e.originalEvent._simulated = false;
            this.map.dragging._draggable._onUp(e.originalEvent);
            // Now transfer ongoing drag action to the radius handler.
            this._resizeLatLng.__vertex.dragging._draggable._onDown(e.originalEvent);
        },

        onDrawingMouseUp: function (e) {
            this.commitDrawing(e);
            e.originalEvent._simulated = false;
            Waymark_L.Editable.PathEditor.prototype.onDrawingMouseUp.call(this, e);
        },

        onDrawingMouseMove: function (e) {
            e.originalEvent._simulated = false;
            Waymark_L.Editable.PathEditor.prototype.onDrawingMouseMove.call(this, e);
        },

        onDrag: function (e) {
            Waymark_L.Editable.PathEditor.prototype.onDrag.call(this, e);
            this.feature.dragging.updateLatLng(this._resizeLatLng);
        }

    });

    // 🍂namespace Editable; 🍂class EditableMixin
    // `EditableMixin` is included to `Waymark_L.Polyline`, `Waymark_L.Polygon`, `Waymark_L.Rectangle`, `Waymark_L.Circle`
    // and `Waymark_L.Marker`. It adds some methods to them.
    // *When editing is enabled, the editor is accessible on the instance with the
    // `editor` property.*
    var EditableMixin = {

        createEditor: function (map) {
            map = map || this._map;
            var tools = (this.options.editOptions || {}).editTools || map.editTools;
            if (!tools) throw Error('Unable to detect Editable instance.');
            var Klass = this.options.editorClass || this.getEditorClass(tools);
            return new Klass(map, this, this.options.editOptions);
        },

        // 🍂method enableEdit(map?: Waymark_L.Map): this.editor
        // Enable editing, by creating an editor if not existing, and then calling `enable` on it.
        enableEdit: function (map) {
            if (!this.editor) this.createEditor(map);
            this.editor.enable();
            return this.editor;
        },

        // 🍂method editEnabled(): boolean
        // Return true if current instance has an editor attached, and this editor is enabled.
        editEnabled: function () {
            return this.editor && this.editor.enabled();
        },

        // 🍂method disableEdit()
        // Disable editing, also remove the editor property reference.
        disableEdit: function () {
            if (this.editor) {
                this.editor.disable();
                delete this.editor;
            }
        },

        // 🍂method toggleEdit()
        // Enable or disable editing, according to current status.
        toggleEdit: function () {
            if (this.editEnabled()) this.disableEdit();
            else this.enableEdit();
        },

        _onEditableAdd: function () {
            if (this.editor) this.enableEdit();
        }

    };

    var PolylineMixin = {

        getEditorClass: function (tools) {
            return (tools && tools.options.polylineEditorClass) ? tools.options.polylineEditorClass : Waymark_L.Editable.PolylineEditor;
        },

        shapeAt: function (latlng, latlngs) {
            // We can have those cases:
            // - latlngs are just a flat array of latlngs, use this
            // - latlngs is an array of arrays of latlngs, loop over
            var shape = null;
            latlngs = latlngs || this._latlngs;
            if (!latlngs.length) return shape;
            else if (isFlat(latlngs) && this.isInLatLngs(latlng, latlngs)) shape = latlngs;
            else for (var i = 0; i < latlngs.length; i++) if (this.isInLatLngs(latlng, latlngs[i])) return latlngs[i];
            return shape;
        },

        isInLatLngs: function (l, latlngs) {
            if (!latlngs) return false;
            var i, k, len, part = [], p,
                w = this._clickTolerance();
            this._projectLatlngs(latlngs, part, this._pxBounds);
            part = part[0];
            p = this._map.latLngToLayerPoint(l);

            if (!this._pxBounds.contains(p)) { return false; }
            for (i = 1, len = part.length, k = 0; i < len; k = i++) {

                if (Waymark_L.LineUtil.pointToSegmentDistance(p, part[k], part[i]) <= w) {
                    return true;
                }
            }
            return false;
        }

    };

    var PolygonMixin = {

        getEditorClass: function (tools) {
            return (tools && tools.options.polygonEditorClass) ? tools.options.polygonEditorClass : Waymark_L.Editable.PolygonEditor;
        },

        shapeAt: function (latlng, latlngs) {
            // We can have those cases:
            // - latlngs are just a flat array of latlngs, use this
            // - latlngs is an array of arrays of latlngs, this is a simple polygon (maybe with holes), use the first
            // - latlngs is an array of arrays of arrays, this is a multi, loop over
            var shape = null;
            latlngs = latlngs || this._latlngs;
            if (!latlngs.length) return shape;
            else if (isFlat(latlngs) && this.isInLatLngs(latlng, latlngs)) shape = latlngs;
            else if (isFlat(latlngs[0]) && this.isInLatLngs(latlng, latlngs[0])) shape = latlngs;
            else for (var i = 0; i < latlngs.length; i++) if (this.isInLatLngs(latlng, latlngs[i][0])) return latlngs[i];
            return shape;
        },

        isInLatLngs: function (l, latlngs) {
            var inside = false, l1, l2, j, k, len2;

            for (j = 0, len2 = latlngs.length, k = len2 - 1; j < len2; k = j++) {
                l1 = latlngs[j];
                l2 = latlngs[k];

                if (((l1.lat > l.lat) !== (l2.lat > l.lat)) &&
                        (l.lng < (l2.lng - l1.lng) * (l.lat - l1.lat) / (l2.lat - l1.lat) + l1.lng)) {
                    inside = !inside;
                }
            }

            return inside;
        },

        parentShape: function (shape, latlngs) {
            latlngs = latlngs || this._latlngs;
            if (!latlngs) return;
            var idx = Waymark_L.Util.indexOf(latlngs, shape);
            if (idx !== -1) return latlngs;
            for (var i = 0; i < latlngs.length; i++) {
                idx = Waymark_L.Util.indexOf(latlngs[i], shape);
                if (idx !== -1) return latlngs[i];
            }
        }

    };


    var MarkerMixin = {

        getEditorClass: function (tools) {
            return (tools && tools.options.markerEditorClass) ? tools.options.markerEditorClass : Waymark_L.Editable.MarkerEditor;
        }

    };

    var RectangleMixin = {

        getEditorClass: function (tools) {
            return (tools && tools.options.rectangleEditorClass) ? tools.options.rectangleEditorClass : Waymark_L.Editable.RectangleEditor;
        }

    };

    var CircleMixin = {

        getEditorClass: function (tools) {
            return (tools && tools.options.circleEditorClass) ? tools.options.circleEditorClass : Waymark_L.Editable.CircleEditor;
        }

    };

    var keepEditable = function () {
        // Make sure you can remove/readd an editable layer.
        this.on('add', this._onEditableAdd);
    };

    var isFlat = Waymark_L.LineUtil.isFlat || Waymark_L.LineUtil._flat || Waymark_L.Polyline._flat;  // <=> 1.1 compat.


    if (Waymark_L.Polyline) {
        Waymark_L.Polyline.include(EditableMixin);
        Waymark_L.Polyline.include(PolylineMixin);
        Waymark_L.Polyline.addInitHook(keepEditable);
    }
    if (Waymark_L.Polygon) {
        Waymark_L.Polygon.include(EditableMixin);
        Waymark_L.Polygon.include(PolygonMixin);
    }
    if (Waymark_L.Marker) {
        Waymark_L.Marker.include(EditableMixin);
        Waymark_L.Marker.include(MarkerMixin);
        Waymark_L.Marker.addInitHook(keepEditable);
    }
    if (Waymark_L.Rectangle) {
        Waymark_L.Rectangle.include(EditableMixin);
        Waymark_L.Rectangle.include(RectangleMixin);
    }
    if (Waymark_L.Circle) {
        Waymark_L.Circle.include(EditableMixin);
        Waymark_L.Circle.include(CircleMixin);
    }

    Waymark_L.LatLng.prototype.update = function (latlng) {
        latlng = Waymark_L.latLng(latlng);
        this.lat = latlng.lat;
        this.lng = latlng.lng;
    }

}, window));

Waymark_L.FeatureGroup.SubGroup = Waymark_L.FeatureGroup.extend({

    /**
     * Instantiates a SubGroup.
     * @param parentGroup (Waymark_L.LayerGroup) (optional)
     * @param layersArray (Waymark_L.Layer[]) (optional)
     */
    initialize: function (parentGroup, layersArray) {
        Waymark_L.FeatureGroup.prototype.initialize.call(this, layersArray);

        this.setParentGroup(parentGroup);
    },

    /**
     * Changes the parent group into which child markers are added to /
     * removed from.
     * @param parentGroup (Waymark_L.LayerGroup)
     * @returns {SubGroup} this
     */
    setParentGroup: function (parentGroup) {
        var pgInstanceOfLG = parentGroup instanceof Waymark_L.LayerGroup;

        this._parentGroup = parentGroup;

        // onAdd
        this.onAdd =
            pgInstanceOfLG ?
                (
                    typeof parentGroup.addLayers === "function" ?
                        this._onAddToGroupBatch :
                        this._onAddToGroup
                ) :
                this._onAddToMap;

        // onRemove
        this.onRemove =
            pgInstanceOfLG ?
                (
                    typeof parentGroup.removeLayers === "function" ?
                        this._onRemoveFromGroupBatch :
                        this._onRemoveFromGroup
                ) :
                this._onRemoveFromMap;

        // addLayer
        this.addLayer = pgInstanceOfLG ?
            this._addLayerToGroup :
            this._addLayerToMap;

        // removeLayer
        this.removeLayer = pgInstanceOfLG ?
            this._removeLayerFromGroup :
            this._removeLayerFromMap;

        return this;
    },

    /**
     * Removes the current sub-group from map before changing the parent
     * group. Re-adds the sub-group to map if it was before changing.
     * @param parentGroup (Waymark_L.LayerGroup)
     * @returns {SubGroup} this
     */
    setParentGroupSafe: function (parentGroup) {
        var map = this._map;

        if (map) {
            map.removeLayer(this);
        }

        this.setParentGroup(parentGroup);

        if (map) {
            map.addLayer(this);
        }

        return this;
    },

    /**
     * Returns the current parent group.
     * @returns {*}
     */
    getParentGroup: function () {
        return this._parentGroup;
    },


    // For parent groups with batch methods (addLayers and removeLayers)
    // like MarkerCluster.
    _onAddToGroupBatch: function (map) {
        var layersArray = this.getLayers();

        this._map = map;
        this._parentGroup.addLayers(layersArray);
    },

    _onRemoveFromGroupBatch: function () {
        var layersArray = this.getLayers();

        this._parentGroup.removeLayers(layersArray);
        this._map = null;
    },


    // For other parent layer groups.
    _onAddToGroup: function (map) {
        var parentGroup = this._parentGroup;

        this._map = map;
        this.eachLayer(parentGroup.addLayer, parentGroup);
    },

    _onRemoveFromGroup: function () {
        var parentGroup = this._parentGroup;

        this.eachLayer(parentGroup.removeLayer, parentGroup);
        this._map = null;
    },


    // Defaults to standard FeatureGroup behaviour when parent group is not
    // specified or is not a type of LayerGroup.
    _onAddToMap: Waymark_L.FeatureGroup.prototype.onAdd,
    _onRemoveFromMap: Waymark_L.FeatureGroup.prototype.onRemove,


    _addLayerToGroup: function (layer) {
        if (this.hasLayer(layer)) {
            return this;
        }

        layer.addEventParent(this);

        var id = this.getLayerId(layer);

        this._layers[id] = layer;

        if (this._map) {
            // Add to parent group instead of directly to map.
            this._parentGroup.addLayer(layer);
        }

        return this.fire("layeradd", {layer: layer});
    },

    _removeLayerFromGroup: function (layer) {
        // If unknown layer, skip.
        if (!this.hasLayer(layer)) {
            return this;
        }

        // Retrieve the layer id.
        var id = layer in this._layers ? layer : this.getLayerId(layer);

        // Retrieve the layer from this._layer.
        layer = this._layers[id];

        // Unregister from events parent.
        layer.removeEventParent(this);

        if (this._map && layer) {
            // Remove from parent group instead of directly from map.
            this._parentGroup.removeLayer(layer);
        }

        delete this._layers[id];

        return this.fire("layerremove", {layer: layer});
    },

    // Defaults to standard FeatureGroup behaviour when parent group is not
    // specified or is not a type of LayerGroup.
    _addLayerToMap: Waymark_L.FeatureGroup.prototype.addLayer,
    _removeLayerFromMap: Waymark_L.FeatureGroup.prototype.removeLayer

});



// Supply with a factory for consistency with Leaflet.
Waymark_L.featureGroup.subGroup = function (parentGroup, options) {
    return new Waymark_L.FeatureGroup.SubGroup(parentGroup, options);
};

(function(factory){var L;if(typeof define==="function"&&define.amd){define(["leaflet"],factory)}else if(typeof module!=="undefined"){L=require("leaflet");module.exports=factory(L)}else{if(typeof window.L==="undefined"){throw new Error("Leaflet must be loaded first")}factory(window.L)}})(function(L){Waymark_L.Control.Fullscreen=Waymark_L.Control.extend({options:{position:"topleft",title:{"false":"View Fullscreen","true":"Exit Fullscreen"}},onAdd:function(map){var container=Waymark_L.DomUtil.create("div","leaflet-control-fullscreen leaflet-bar leaflet-control");this.link=Waymark_L.DomUtil.create("a","leaflet-control-fullscreen-button leaflet-bar-part",container);this.link.href="#";this._map=map;this._map.on("fullscreenchange",this._toggleTitle,this);this._toggleTitle();Waymark_L.DomEvent.on(this.link,"click",this._click,this);return container},_click:function(e){Waymark_L.DomEvent.stopPropagation(e);Waymark_L.DomEvent.preventDefault(e);this._map.toggleFullscreen(this.options)},_toggleTitle:function(){this.link.title=this.options.title[this._map.isFullscreen()]}});Waymark_L.Map.include({isFullscreen:function(){return this._isFullscreen||false},toggleFullscreen:function(options){var container=this.getContainer();if(this.isFullscreen()){if(options&&options.pseudoFullscreen){this._disablePseudoFullscreen(container)}else if(document.exitFullscreen){document.exitFullscreen()}else if(document.mozCancelFullScreen){document.mozCancelFullScreen()}else if(document.webkitCancelFullScreen){document.webkitCancelFullScreen()}else if(document.msExitFullscreen){document.msExitFullscreen()}else{this._disablePseudoFullscreen(container)}}else{if(options&&options.pseudoFullscreen){this._enablePseudoFullscreen(container)}else if(container.requestFullscreen){container.requestFullscreen()}else if(container.mozRequestFullScreen){container.mozRequestFullScreen()}else if(container.webkitRequestFullscreen){container.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)}else if(container.msRequestFullscreen){container.msRequestFullscreen()}else{this._enablePseudoFullscreen(container)}}},_enablePseudoFullscreen:function(container){Waymark_L.DomUtil.addClass(container,"leaflet-pseudo-fullscreen");this._setFullscreen(true);this.fire("fullscreenchange")},_disablePseudoFullscreen:function(container){Waymark_L.DomUtil.removeClass(container,"leaflet-pseudo-fullscreen");this._setFullscreen(false);this.fire("fullscreenchange")},_setFullscreen:function(fullscreen){this._isFullscreen=fullscreen;var container=this.getContainer();if(fullscreen){Waymark_L.DomUtil.addClass(container,"leaflet-fullscreen-on")}else{Waymark_L.DomUtil.removeClass(container,"leaflet-fullscreen-on")}this.invalidateSize()},_onFullscreenChange:function(e){var fullscreenElement=document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement||document.msFullscreenElement;if(fullscreenElement===this.getContainer()&&!this._isFullscreen){this._setFullscreen(true);this.fire("fullscreenchange")}else if(fullscreenElement!==this.getContainer()&&this._isFullscreen){this._setFullscreen(false);this.fire("fullscreenchange")}}});Waymark_L.Map.mergeOptions({fullscreenControl:false});Waymark_L.Map.addInitHook(function(){if(this.options.fullscreenControl){this.fullscreenControl=new Waymark_L.Control.Fullscreen(this.options.fullscreenControl);this.addControl(this.fullscreenControl)}var fullscreenchange;if("onfullscreenchange"in document){fullscreenchange="fullscreenchange"}else if("onmozfullscreenchange"in document){fullscreenchange="mozfullscreenchange"}else if("onwebkitfullscreenchange"in document){fullscreenchange="webkitfullscreenchange"}else if("onmsfullscreenchange"in document){fullscreenchange="MSFullscreenChange"}if(fullscreenchange){var onFullscreenChange=Waymark_L.bind(this._onFullscreenChange,this);this.whenReady(function(){Waymark_L.DomEvent.on(document,fullscreenchange,onFullscreenChange)});this.on("unload",function(){Waymark_L.DomEvent.off(document,fullscreenchange,onFullscreenChange)})}});Waymark_L.control.fullscreen=function(options){return new Waymark_L.Control.Fullscreen(options)}});
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e.Leaflet=e.Leaflet||{},e.Leaflet.markercluster=e.Leaflet.markercluster||{}))}(this,function(e){"use strict";var t=L.MarkerClusterGroup=L.FeatureGroup.extend({options:{maxClusterRadius:80,iconCreateFunction:null,clusterPane:L.Marker.prototype.options.pane,spiderfyOnMaxZoom:!0,showCoverageOnHover:!0,zoomToBoundsOnClick:!0,singleMarkerMode:!1,disableClusteringAtZoom:null,removeOutsideVisibleBounds:!0,animate:!0,animateAddingMarkers:!1,spiderfyDistanceMultiplier:1,spiderLegPolylineOptions:{weight:1.5,color:"#222",opacity:.5},chunkedLoading:!1,chunkInterval:200,chunkDelay:50,chunkProgress:null,polygonOptions:{}},initialize:function(e){L.Util.setOptions(this,e),this.options.iconCreateFunction||(this.options.iconCreateFunction=this._defaultIconCreateFunction),this._featureGroup=L.featureGroup(),this._featureGroup.addEventParent(this),this._nonPointGroup=L.featureGroup(),this._nonPointGroup.addEventParent(this),this._inZoomAnimation=0,this._needsClustering=[],this._needsRemoving=[],this._currentShownBounds=null,this._queue=[],this._childMarkerEventHandlers={dragstart:this._childMarkerDragStart,move:this._childMarkerMoved,dragend:this._childMarkerDragEnd};var t=L.DomUtil.TRANSITION&&this.options.animate;L.extend(this,t?this._withAnimation:this._noAnimation),this._markerCluster=t?L.MarkerCluster:L.MarkerClusterNonAnimated},addLayer:function(e){if(e instanceof L.LayerGroup)return this.addLayers([e]);if(!e.getLatLng)return this._nonPointGroup.addLayer(e),this.fire("layeradd",{layer:e}),this;if(!this._map)return this._needsClustering.push(e),this.fire("layeradd",{layer:e}),this;if(this.hasLayer(e))return this;this._unspiderfy&&this._unspiderfy(),this._addLayer(e,this._maxZoom),this.fire("layeradd",{layer:e}),this._topClusterLevel._recalculateBounds(),this._refreshClustersIcons();var t=e,i=this._zoom;if(e.__parent)for(;t.__parent._zoom>=i;)t=t.__parent;return this._currentShownBounds.contains(t.getLatLng())&&(this.options.animateAddingMarkers?this._animationAddLayer(e,t):this._animationAddLayerNonAnimated(e,t)),this},removeLayer:function(e){return e instanceof L.LayerGroup?this.removeLayers([e]):e.getLatLng?this._map?e.__parent?(this._unspiderfy&&(this._unspiderfy(),this._unspiderfyLayer(e)),this._removeLayer(e,!0),this.fire("layerremove",{layer:e}),this._topClusterLevel._recalculateBounds(),this._refreshClustersIcons(),e.off(this._childMarkerEventHandlers,this),this._featureGroup.hasLayer(e)&&(this._featureGroup.removeLayer(e),e.clusterShow&&e.clusterShow()),this):this:(!this._arraySplice(this._needsClustering,e)&&this.hasLayer(e)&&this._needsRemoving.push({layer:e,latlng:e._latlng}),this.fire("layerremove",{layer:e}),this):(this._nonPointGroup.removeLayer(e),this.fire("layerremove",{layer:e}),this)},addLayers:function(e,t){if(!L.Util.isArray(e))return this.addLayer(e);var i,n=this._featureGroup,r=this._nonPointGroup,s=this.options.chunkedLoading,o=this.options.chunkInterval,a=this.options.chunkProgress,h=e.length,l=0,u=!0;if(this._map){var _=(new Date).getTime(),d=L.bind(function(){for(var c=(new Date).getTime();h>l;l++){if(s&&0===l%200){var p=(new Date).getTime()-c;if(p>o)break}if(i=e[l],i instanceof L.LayerGroup)u&&(e=e.slice(),u=!1),this._extractNonGroupLayers(i,e),h=e.length;else if(i.getLatLng){if(!this.hasLayer(i)&&(this._addLayer(i,this._maxZoom),t||this.fire("layeradd",{layer:i}),i.__parent&&2===i.__parent.getChildCount())){var f=i.__parent.getAllChildMarkers(),m=f[0]===i?f[1]:f[0];n.removeLayer(m)}}else r.addLayer(i),t||this.fire("layeradd",{layer:i})}a&&a(l,h,(new Date).getTime()-_),l===h?(this._topClusterLevel._recalculateBounds(),this._refreshClustersIcons(),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds)):setTimeout(d,this.options.chunkDelay)},this);d()}else for(var c=this._needsClustering;h>l;l++)i=e[l],i instanceof L.LayerGroup?(u&&(e=e.slice(),u=!1),this._extractNonGroupLayers(i,e),h=e.length):i.getLatLng?this.hasLayer(i)||c.push(i):r.addLayer(i);return this},removeLayers:function(e){var t,i,n=e.length,r=this._featureGroup,s=this._nonPointGroup,o=!0;if(!this._map){for(t=0;n>t;t++)i=e[t],i instanceof L.LayerGroup?(o&&(e=e.slice(),o=!1),this._extractNonGroupLayers(i,e),n=e.length):(this._arraySplice(this._needsClustering,i),s.removeLayer(i),this.hasLayer(i)&&this._needsRemoving.push({layer:i,latlng:i._latlng}),this.fire("layerremove",{layer:i}));return this}if(this._unspiderfy){this._unspiderfy();var a=e.slice(),h=n;for(t=0;h>t;t++)i=a[t],i instanceof L.LayerGroup?(this._extractNonGroupLayers(i,a),h=a.length):this._unspiderfyLayer(i)}for(t=0;n>t;t++)i=e[t],i instanceof L.LayerGroup?(o&&(e=e.slice(),o=!1),this._extractNonGroupLayers(i,e),n=e.length):i.__parent?(this._removeLayer(i,!0,!0),this.fire("layerremove",{layer:i}),r.hasLayer(i)&&(r.removeLayer(i),i.clusterShow&&i.clusterShow())):(s.removeLayer(i),this.fire("layerremove",{layer:i}));return this._topClusterLevel._recalculateBounds(),this._refreshClustersIcons(),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds),this},clearLayers:function(){return this._map||(this._needsClustering=[],this._needsRemoving=[],delete this._gridClusters,delete this._gridUnclustered),this._noanimationUnspiderfy&&this._noanimationUnspiderfy(),this._featureGroup.clearLayers(),this._nonPointGroup.clearLayers(),this.eachLayer(function(e){e.off(this._childMarkerEventHandlers,this),delete e.__parent},this),this._map&&this._generateInitialClusters(),this},getBounds:function(){var e=new L.LatLngBounds;this._topClusterLevel&&e.extend(this._topClusterLevel._bounds);for(var t=this._needsClustering.length-1;t>=0;t--)e.extend(this._needsClustering[t].getLatLng());return e.extend(this._nonPointGroup.getBounds()),e},eachLayer:function(e,t){var i,n,r,s=this._needsClustering.slice(),o=this._needsRemoving;for(this._topClusterLevel&&this._topClusterLevel.getAllChildMarkers(s),n=s.length-1;n>=0;n--){for(i=!0,r=o.length-1;r>=0;r--)if(o[r].layer===s[n]){i=!1;break}i&&e.call(t,s[n])}this._nonPointGroup.eachLayer(e,t)},getLayers:function(){var e=[];return this.eachLayer(function(t){e.push(t)}),e},getLayer:function(e){var t=null;return e=parseInt(e,10),this.eachLayer(function(i){L.stamp(i)===e&&(t=i)}),t},hasLayer:function(e){if(!e)return!1;var t,i=this._needsClustering;for(t=i.length-1;t>=0;t--)if(i[t]===e)return!0;for(i=this._needsRemoving,t=i.length-1;t>=0;t--)if(i[t].layer===e)return!1;return!(!e.__parent||e.__parent._group!==this)||this._nonPointGroup.hasLayer(e)},zoomToShowLayer:function(e,t){"function"!=typeof t&&(t=function(){});var i=function(){!e._icon&&!e.__parent._icon||this._inZoomAnimation||(this._map.off("moveend",i,this),this.off("animationend",i,this),e._icon?t():e.__parent._icon&&(this.once("spiderfied",t,this),e.__parent.spiderfy()))};e._icon&&this._map.getBounds().contains(e.getLatLng())?t():e.__parent._zoom<Math.round(this._map._zoom)?(this._map.on("moveend",i,this),this._map.panTo(e.getLatLng())):(this._map.on("moveend",i,this),this.on("animationend",i,this),e.__parent.zoomToBounds())},onAdd:function(e){this._map=e;var t,i,n;if(!isFinite(this._map.getMaxZoom()))throw"Map has no maxZoom specified";for(this._featureGroup.addTo(e),this._nonPointGroup.addTo(e),this._gridClusters||this._generateInitialClusters(),this._maxLat=e.options.crs.projection.MAX_LATITUDE,t=0,i=this._needsRemoving.length;i>t;t++)n=this._needsRemoving[t],n.newlatlng=n.layer._latlng,n.layer._latlng=n.latlng;for(t=0,i=this._needsRemoving.length;i>t;t++)n=this._needsRemoving[t],this._removeLayer(n.layer,!0),n.layer._latlng=n.newlatlng;this._needsRemoving=[],this._zoom=Math.round(this._map._zoom),this._currentShownBounds=this._getExpandedVisibleBounds(),this._map.on("zoomend",this._zoomEnd,this),this._map.on("moveend",this._moveEnd,this),this._spiderfierOnAdd&&this._spiderfierOnAdd(),this._bindEvents(),i=this._needsClustering,this._needsClustering=[],this.addLayers(i,!0)},onRemove:function(e){e.off("zoomend",this._zoomEnd,this),e.off("moveend",this._moveEnd,this),this._unbindEvents(),this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim",""),this._spiderfierOnRemove&&this._spiderfierOnRemove(),delete this._maxLat,this._hideCoverage(),this._featureGroup.remove(),this._nonPointGroup.remove(),this._featureGroup.clearLayers(),this._map=null},getVisibleParent:function(e){for(var t=e;t&&!t._icon;)t=t.__parent;return t||null},_arraySplice:function(e,t){for(var i=e.length-1;i>=0;i--)if(e[i]===t)return e.splice(i,1),!0},_removeFromGridUnclustered:function(e,t){for(var i=this._map,n=this._gridUnclustered,r=Math.floor(this._map.getMinZoom());t>=r&&n[t].removeObject(e,i.project(e.getLatLng(),t));t--);},_childMarkerDragStart:function(e){e.target.__dragStart=e.target._latlng},_childMarkerMoved:function(e){if(!this._ignoreMove&&!e.target.__dragStart){var t=e.target._popup&&e.target._popup.isOpen();this._moveChild(e.target,e.oldLatLng,e.latlng),t&&e.target.openPopup()}},_moveChild:function(e,t,i){e._latlng=t,this.removeLayer(e),e._latlng=i,this.addLayer(e)},_childMarkerDragEnd:function(e){var t=e.target.__dragStart;delete e.target.__dragStart,t&&this._moveChild(e.target,t,e.target._latlng)},_removeLayer:function(e,t,i){var n=this._gridClusters,r=this._gridUnclustered,s=this._featureGroup,o=this._map,a=Math.floor(this._map.getMinZoom());t&&this._removeFromGridUnclustered(e,this._maxZoom);var h,l=e.__parent,u=l._markers;for(this._arraySplice(u,e);l&&(l._childCount--,l._boundsNeedUpdate=!0,!(l._zoom<a));)t&&l._childCount<=1?(h=l._markers[0]===e?l._markers[1]:l._markers[0],n[l._zoom].removeObject(l,o.project(l._cLatLng,l._zoom)),r[l._zoom].addObject(h,o.project(h.getLatLng(),l._zoom)),this._arraySplice(l.__parent._childClusters,l),l.__parent._markers.push(h),h.__parent=l.__parent,l._icon&&(s.removeLayer(l),i||s.addLayer(h))):l._iconNeedsUpdate=!0,l=l.__parent;delete e.__parent},_isOrIsParent:function(e,t){for(;t;){if(e===t)return!0;t=t.parentNode}return!1},fire:function(e,t,i){if(t&&t.layer instanceof L.MarkerCluster){if(t.originalEvent&&this._isOrIsParent(t.layer._icon,t.originalEvent.relatedTarget))return;e="cluster"+e}L.FeatureGroup.prototype.fire.call(this,e,t,i)},listens:function(e,t){return L.FeatureGroup.prototype.listens.call(this,e,t)||L.FeatureGroup.prototype.listens.call(this,"cluster"+e,t)},_defaultIconCreateFunction:function(e){var t=e.getChildCount(),i=" marker-cluster-";return i+=10>t?"small":100>t?"medium":"large",new L.DivIcon({html:"<div><span>"+t+"</span></div>",className:"marker-cluster"+i,iconSize:new L.Point(40,40)})},_bindEvents:function(){var e=this._map,t=this.options.spiderfyOnMaxZoom,i=this.options.showCoverageOnHover,n=this.options.zoomToBoundsOnClick;(t||n)&&this.on("clusterclick",this._zoomOrSpiderfy,this),i&&(this.on("clustermouseover",this._showCoverage,this),this.on("clustermouseout",this._hideCoverage,this),e.on("zoomend",this._hideCoverage,this))},_zoomOrSpiderfy:function(e){for(var t=e.layer,i=t;1===i._childClusters.length;)i=i._childClusters[0];i._zoom===this._maxZoom&&i._childCount===t._childCount&&this.options.spiderfyOnMaxZoom?t.spiderfy():this.options.zoomToBoundsOnClick&&t.zoomToBounds(),e.originalEvent&&13===e.originalEvent.keyCode&&this._map._container.focus()},_showCoverage:function(e){var t=this._map;this._inZoomAnimation||(this._shownPolygon&&t.removeLayer(this._shownPolygon),e.layer.getChildCount()>2&&e.layer!==this._spiderfied&&(this._shownPolygon=new L.Polygon(e.layer.getConvexHull(),this.options.polygonOptions),t.addLayer(this._shownPolygon)))},_hideCoverage:function(){this._shownPolygon&&(this._map.removeLayer(this._shownPolygon),this._shownPolygon=null)},_unbindEvents:function(){var e=this.options.spiderfyOnMaxZoom,t=this.options.showCoverageOnHover,i=this.options.zoomToBoundsOnClick,n=this._map;(e||i)&&this.off("clusterclick",this._zoomOrSpiderfy,this),t&&(this.off("clustermouseover",this._showCoverage,this),this.off("clustermouseout",this._hideCoverage,this),n.off("zoomend",this._hideCoverage,this))},_zoomEnd:function(){this._map&&(this._mergeSplitClusters(),this._zoom=Math.round(this._map._zoom),this._currentShownBounds=this._getExpandedVisibleBounds())},_moveEnd:function(){if(!this._inZoomAnimation){var e=this._getExpandedVisibleBounds();this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,Math.floor(this._map.getMinZoom()),this._zoom,e),this._topClusterLevel._recursivelyAddChildrenToMap(null,Math.round(this._map._zoom),e),this._currentShownBounds=e}},_generateInitialClusters:function(){var e=Math.ceil(this._map.getMaxZoom()),t=Math.floor(this._map.getMinZoom()),i=this.options.maxClusterRadius,n=i;"function"!=typeof i&&(n=function(){return i}),null!==this.options.disableClusteringAtZoom&&(e=this.options.disableClusteringAtZoom-1),this._maxZoom=e,this._gridClusters={},this._gridUnclustered={};for(var r=e;r>=t;r--)this._gridClusters[r]=new L.DistanceGrid(n(r)),this._gridUnclustered[r]=new L.DistanceGrid(n(r));this._topClusterLevel=new this._markerCluster(this,t-1)},_addLayer:function(e,t){var i,n,r=this._gridClusters,s=this._gridUnclustered,o=Math.floor(this._map.getMinZoom());for(this.options.singleMarkerMode&&this._overrideMarkerIcon(e),e.on(this._childMarkerEventHandlers,this);t>=o;t--){i=this._map.project(e.getLatLng(),t);var a=r[t].getNearObject(i);if(a)return a._addChild(e),e.__parent=a,void 0;if(a=s[t].getNearObject(i)){var h=a.__parent;h&&this._removeLayer(a,!1);var l=new this._markerCluster(this,t,a,e);r[t].addObject(l,this._map.project(l._cLatLng,t)),a.__parent=l,e.__parent=l;var u=l;for(n=t-1;n>h._zoom;n--)u=new this._markerCluster(this,n,u),r[n].addObject(u,this._map.project(a.getLatLng(),n));return h._addChild(u),this._removeFromGridUnclustered(a,t),void 0}s[t].addObject(e,i)}this._topClusterLevel._addChild(e),e.__parent=this._topClusterLevel},_refreshClustersIcons:function(){this._featureGroup.eachLayer(function(e){e instanceof L.MarkerCluster&&e._iconNeedsUpdate&&e._updateIcon()})},_enqueue:function(e){this._queue.push(e),this._queueTimeout||(this._queueTimeout=setTimeout(L.bind(this._processQueue,this),300))},_processQueue:function(){for(var e=0;e<this._queue.length;e++)this._queue[e].call(this);this._queue.length=0,clearTimeout(this._queueTimeout),this._queueTimeout=null},_mergeSplitClusters:function(){var e=Math.round(this._map._zoom);this._processQueue(),this._zoom<e&&this._currentShownBounds.intersects(this._getExpandedVisibleBounds())?(this._animationStart(),this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,Math.floor(this._map.getMinZoom()),this._zoom,this._getExpandedVisibleBounds()),this._animationZoomIn(this._zoom,e)):this._zoom>e?(this._animationStart(),this._animationZoomOut(this._zoom,e)):this._moveEnd()},_getExpandedVisibleBounds:function(){return this.options.removeOutsideVisibleBounds?L.Browser.mobile?this._checkBoundsMaxLat(this._map.getBounds()):this._checkBoundsMaxLat(this._map.getBounds().pad(1)):this._mapBoundsInfinite},_checkBoundsMaxLat:function(e){var t=this._maxLat;return void 0!==t&&(e.getNorth()>=t&&(e._northEast.lat=1/0),e.getSouth()<=-t&&(e._southWest.lat=-1/0)),e},_animationAddLayerNonAnimated:function(e,t){if(t===e)this._featureGroup.addLayer(e);else if(2===t._childCount){t._addToMap();var i=t.getAllChildMarkers();this._featureGroup.removeLayer(i[0]),this._featureGroup.removeLayer(i[1])}else t._updateIcon()},_extractNonGroupLayers:function(e,t){var i,n=e.getLayers(),r=0;for(t=t||[];r<n.length;r++)i=n[r],i instanceof L.LayerGroup?this._extractNonGroupLayers(i,t):t.push(i);return t},_overrideMarkerIcon:function(e){var t=e.options.icon=this.options.iconCreateFunction({getChildCount:function(){return 1},getAllChildMarkers:function(){return[e]}});return t}});L.MarkerClusterGroup.include({_mapBoundsInfinite:new L.LatLngBounds(new L.LatLng(-1/0,-1/0),new L.LatLng(1/0,1/0))}),L.MarkerClusterGroup.include({_noAnimation:{_animationStart:function(){},_animationZoomIn:function(e,t){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,Math.floor(this._map.getMinZoom()),e),this._topClusterLevel._recursivelyAddChildrenToMap(null,t,this._getExpandedVisibleBounds()),this.fire("animationend")},_animationZoomOut:function(e,t){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,Math.floor(this._map.getMinZoom()),e),this._topClusterLevel._recursivelyAddChildrenToMap(null,t,this._getExpandedVisibleBounds()),this.fire("animationend")},_animationAddLayer:function(e,t){this._animationAddLayerNonAnimated(e,t)}},_withAnimation:{_animationStart:function(){this._map._mapPane.className+=" leaflet-cluster-anim",this._inZoomAnimation++},_animationZoomIn:function(e,t){var i,n=this._getExpandedVisibleBounds(),r=this._featureGroup,s=Math.floor(this._map.getMinZoom());this._ignoreMove=!0,this._topClusterLevel._recursively(n,e,s,function(s){var o,a=s._latlng,h=s._markers;for(n.contains(a)||(a=null),s._isSingleParent()&&e+1===t?(r.removeLayer(s),s._recursivelyAddChildrenToMap(null,t,n)):(s.clusterHide(),s._recursivelyAddChildrenToMap(a,t,n)),i=h.length-1;i>=0;i--)o=h[i],n.contains(o._latlng)||r.removeLayer(o)}),this._forceLayout(),this._topClusterLevel._recursivelyBecomeVisible(n,t),r.eachLayer(function(e){e instanceof L.MarkerCluster||!e._icon||e.clusterShow()}),this._topClusterLevel._recursively(n,e,t,function(e){e._recursivelyRestoreChildPositions(t)}),this._ignoreMove=!1,this._enqueue(function(){this._topClusterLevel._recursively(n,e,s,function(e){r.removeLayer(e),e.clusterShow()}),this._animationEnd()})},_animationZoomOut:function(e,t){this._animationZoomOutSingle(this._topClusterLevel,e-1,t),this._topClusterLevel._recursivelyAddChildrenToMap(null,t,this._getExpandedVisibleBounds()),this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,Math.floor(this._map.getMinZoom()),e,this._getExpandedVisibleBounds())},_animationAddLayer:function(e,t){var i=this,n=this._featureGroup;n.addLayer(e),t!==e&&(t._childCount>2?(t._updateIcon(),this._forceLayout(),this._animationStart(),e._setPos(this._map.latLngToLayerPoint(t.getLatLng())),e.clusterHide(),this._enqueue(function(){n.removeLayer(e),e.clusterShow(),i._animationEnd()})):(this._forceLayout(),i._animationStart(),i._animationZoomOutSingle(t,this._map.getMaxZoom(),this._zoom)))}},_animationZoomOutSingle:function(e,t,i){var n=this._getExpandedVisibleBounds(),r=Math.floor(this._map.getMinZoom());e._recursivelyAnimateChildrenInAndAddSelfToMap(n,r,t+1,i);var s=this;this._forceLayout(),e._recursivelyBecomeVisible(n,i),this._enqueue(function(){if(1===e._childCount){var o=e._markers[0];this._ignoreMove=!0,o.setLatLng(o.getLatLng()),this._ignoreMove=!1,o.clusterShow&&o.clusterShow()}else e._recursively(n,i,r,function(e){e._recursivelyRemoveChildrenFromMap(n,r,t+1)});s._animationEnd()})},_animationEnd:function(){this._map&&(this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim","")),this._inZoomAnimation--,this.fire("animationend")},_forceLayout:function(){L.Util.falseFn(document.body.offsetWidth)}}),L.markerClusterGroup=function(e){return new L.MarkerClusterGroup(e)};var i=L.MarkerCluster=L.Marker.extend({options:L.Icon.prototype.options,initialize:function(e,t,i,n){L.Marker.prototype.initialize.call(this,i?i._cLatLng||i.getLatLng():new L.LatLng(0,0),{icon:this,pane:e.options.clusterPane}),this._group=e,this._zoom=t,this._markers=[],this._childClusters=[],this._childCount=0,this._iconNeedsUpdate=!0,this._boundsNeedUpdate=!0,this._bounds=new L.LatLngBounds,i&&this._addChild(i),n&&this._addChild(n)},getAllChildMarkers:function(e,t){e=e||[];for(var i=this._childClusters.length-1;i>=0;i--)this._childClusters[i].getAllChildMarkers(e);for(var n=this._markers.length-1;n>=0;n--)t&&this._markers[n].__dragStart||e.push(this._markers[n]);return e},getChildCount:function(){return this._childCount},zoomToBounds:function(e){for(var t,i=this._childClusters.slice(),n=this._group._map,r=n.getBoundsZoom(this._bounds),s=this._zoom+1,o=n.getZoom();i.length>0&&r>s;){s++;var a=[];for(t=0;t<i.length;t++)a=a.concat(i[t]._childClusters);i=a}r>s?this._group._map.setView(this._latlng,s):o>=r?this._group._map.setView(this._latlng,o+1):this._group._map.fitBounds(this._bounds,e)},getBounds:function(){var e=new L.LatLngBounds;return e.extend(this._bounds),e},_updateIcon:function(){this._iconNeedsUpdate=!0,this._icon&&this.setIcon(this)},createIcon:function(){return this._iconNeedsUpdate&&(this._iconObj=this._group.options.iconCreateFunction(this),this._iconNeedsUpdate=!1),this._iconObj.createIcon()},createShadow:function(){return this._iconObj.createShadow()},_addChild:function(e,t){this._iconNeedsUpdate=!0,this._boundsNeedUpdate=!0,this._setClusterCenter(e),e instanceof L.MarkerCluster?(t||(this._childClusters.push(e),e.__parent=this),this._childCount+=e._childCount):(t||this._markers.push(e),this._childCount++),this.__parent&&this.__parent._addChild(e,!0)},_setClusterCenter:function(e){this._cLatLng||(this._cLatLng=e._cLatLng||e._latlng)},_resetBounds:function(){var e=this._bounds;e._southWest&&(e._southWest.lat=1/0,e._southWest.lng=1/0),e._northEast&&(e._northEast.lat=-1/0,e._northEast.lng=-1/0)},_recalculateBounds:function(){var e,t,i,n,r=this._markers,s=this._childClusters,o=0,a=0,h=this._childCount;if(0!==h){for(this._resetBounds(),e=0;e<r.length;e++)i=r[e]._latlng,this._bounds.extend(i),o+=i.lat,a+=i.lng;for(e=0;e<s.length;e++)t=s[e],t._boundsNeedUpdate&&t._recalculateBounds(),this._bounds.extend(t._bounds),i=t._wLatLng,n=t._childCount,o+=i.lat*n,a+=i.lng*n;this._latlng=this._wLatLng=new L.LatLng(o/h,a/h),this._boundsNeedUpdate=!1}},_addToMap:function(e){e&&(this._backupLatlng=this._latlng,this.setLatLng(e)),this._group._featureGroup.addLayer(this)},_recursivelyAnimateChildrenIn:function(e,t,i){this._recursively(e,this._group._map.getMinZoom(),i-1,function(e){var i,n,r=e._markers;for(i=r.length-1;i>=0;i--)n=r[i],n._icon&&(n._setPos(t),n.clusterHide())},function(e){var i,n,r=e._childClusters;for(i=r.length-1;i>=0;i--)n=r[i],n._icon&&(n._setPos(t),n.clusterHide())})},_recursivelyAnimateChildrenInAndAddSelfToMap:function(e,t,i,n){this._recursively(e,n,t,function(r){r._recursivelyAnimateChildrenIn(e,r._group._map.latLngToLayerPoint(r.getLatLng()).round(),i),r._isSingleParent()&&i-1===n?(r.clusterShow(),r._recursivelyRemoveChildrenFromMap(e,t,i)):r.clusterHide(),r._addToMap()})},_recursivelyBecomeVisible:function(e,t){this._recursively(e,this._group._map.getMinZoom(),t,null,function(e){e.clusterShow()})},_recursivelyAddChildrenToMap:function(e,t,i){this._recursively(i,this._group._map.getMinZoom()-1,t,function(n){if(t!==n._zoom)for(var r=n._markers.length-1;r>=0;r--){var s=n._markers[r];i.contains(s._latlng)&&(e&&(s._backupLatlng=s.getLatLng(),s.setLatLng(e),s.clusterHide&&s.clusterHide()),n._group._featureGroup.addLayer(s))}},function(t){t._addToMap(e)})},_recursivelyRestoreChildPositions:function(e){for(var t=this._markers.length-1;t>=0;t--){var i=this._markers[t];i._backupLatlng&&(i.setLatLng(i._backupLatlng),delete i._backupLatlng)}if(e-1===this._zoom)for(var n=this._childClusters.length-1;n>=0;n--)this._childClusters[n]._restorePosition();else for(var r=this._childClusters.length-1;r>=0;r--)this._childClusters[r]._recursivelyRestoreChildPositions(e)},_restorePosition:function(){this._backupLatlng&&(this.setLatLng(this._backupLatlng),delete this._backupLatlng)},_recursivelyRemoveChildrenFromMap:function(e,t,i,n){var r,s;this._recursively(e,t-1,i-1,function(e){for(s=e._markers.length-1;s>=0;s--)r=e._markers[s],n&&n.contains(r._latlng)||(e._group._featureGroup.removeLayer(r),r.clusterShow&&r.clusterShow())},function(e){for(s=e._childClusters.length-1;s>=0;s--)r=e._childClusters[s],n&&n.contains(r._latlng)||(e._group._featureGroup.removeLayer(r),r.clusterShow&&r.clusterShow())})},_recursively:function(e,t,i,n,r){var s,o,a=this._childClusters,h=this._zoom;if(h>=t&&(n&&n(this),r&&h===i&&r(this)),t>h||i>h)for(s=a.length-1;s>=0;s--)o=a[s],o._boundsNeedUpdate&&o._recalculateBounds(),e.intersects(o._bounds)&&o._recursively(e,t,i,n,r)},_isSingleParent:function(){return this._childClusters.length>0&&this._childClusters[0]._childCount===this._childCount}});L.Marker.include({clusterHide:function(){var e=this.options.opacity;return this.setOpacity(0),this.options.opacity=e,this},clusterShow:function(){return this.setOpacity(this.options.opacity)}}),L.DistanceGrid=function(e){this._cellSize=e,this._sqCellSize=e*e,this._grid={},this._objectPoint={}},L.DistanceGrid.prototype={addObject:function(e,t){var i=this._getCoord(t.x),n=this._getCoord(t.y),r=this._grid,s=r[n]=r[n]||{},o=s[i]=s[i]||[],a=L.Util.stamp(e);this._objectPoint[a]=t,o.push(e)},updateObject:function(e,t){this.removeObject(e),this.addObject(e,t)},removeObject:function(e,t){var i,n,r=this._getCoord(t.x),s=this._getCoord(t.y),o=this._grid,a=o[s]=o[s]||{},h=a[r]=a[r]||[];for(delete this._objectPoint[L.Util.stamp(e)],i=0,n=h.length;n>i;i++)if(h[i]===e)return h.splice(i,1),1===n&&delete a[r],!0},eachObject:function(e,t){var i,n,r,s,o,a,h,l=this._grid;for(i in l){o=l[i];for(n in o)for(a=o[n],r=0,s=a.length;s>r;r++)h=e.call(t,a[r]),h&&(r--,s--)}},getNearObject:function(e){var t,i,n,r,s,o,a,h,l=this._getCoord(e.x),u=this._getCoord(e.y),_=this._objectPoint,d=this._sqCellSize,c=null;for(t=u-1;u+1>=t;t++)if(r=this._grid[t])for(i=l-1;l+1>=i;i++)if(s=r[i])for(n=0,o=s.length;o>n;n++)a=s[n],h=this._sqDist(_[L.Util.stamp(a)],e),(d>h||d>=h&&null===c)&&(d=h,c=a);return c},_getCoord:function(e){var t=Math.floor(e/this._cellSize);return isFinite(t)?t:e},_sqDist:function(e,t){var i=t.x-e.x,n=t.y-e.y;return i*i+n*n}},function(){L.QuickHull={getDistant:function(e,t){var i=t[1].lat-t[0].lat,n=t[0].lng-t[1].lng;return n*(e.lat-t[0].lat)+i*(e.lng-t[0].lng)},findMostDistantPointFromBaseLine:function(e,t){var i,n,r,s=0,o=null,a=[];for(i=t.length-1;i>=0;i--)n=t[i],r=this.getDistant(n,e),r>0&&(a.push(n),r>s&&(s=r,o=n));return{maxPoint:o,newPoints:a}},buildConvexHull:function(e,t){var i=[],n=this.findMostDistantPointFromBaseLine(e,t);return n.maxPoint?(i=i.concat(this.buildConvexHull([e[0],n.maxPoint],n.newPoints)),i=i.concat(this.buildConvexHull([n.maxPoint,e[1]],n.newPoints))):[e[0]]},getConvexHull:function(e){var t,i=!1,n=!1,r=!1,s=!1,o=null,a=null,h=null,l=null,u=null,_=null;for(t=e.length-1;t>=0;t--){var d=e[t];(i===!1||d.lat>i)&&(o=d,i=d.lat),(n===!1||d.lat<n)&&(a=d,n=d.lat),(r===!1||d.lng>r)&&(h=d,r=d.lng),(s===!1||d.lng<s)&&(l=d,s=d.lng)}n!==i?(_=a,u=o):(_=l,u=h);var c=[].concat(this.buildConvexHull([_,u],e),this.buildConvexHull([u,_],e));return c}}}(),L.MarkerCluster.include({getConvexHull:function(){var e,t,i=this.getAllChildMarkers(),n=[];for(t=i.length-1;t>=0;t--)e=i[t].getLatLng(),n.push(e);return L.QuickHull.getConvexHull(n)}}),L.MarkerCluster.include({_2PI:2*Math.PI,_circleFootSeparation:25,_circleStartAngle:0,_spiralFootSeparation:28,_spiralLengthStart:11,_spiralLengthFactor:5,_circleSpiralSwitchover:9,spiderfy:function(){if(this._group._spiderfied!==this&&!this._group._inZoomAnimation){var e,t=this.getAllChildMarkers(null,!0),i=this._group,n=i._map,r=n.latLngToLayerPoint(this._latlng);this._group._unspiderfy(),this._group._spiderfied=this,t.length>=this._circleSpiralSwitchover?e=this._generatePointsSpiral(t.length,r):(r.y+=10,e=this._generatePointsCircle(t.length,r)),this._animationSpiderfy(t,e)}},unspiderfy:function(e){this._group._inZoomAnimation||(this._animationUnspiderfy(e),this._group._spiderfied=null)},_generatePointsCircle:function(e,t){var i,n,r=this._group.options.spiderfyDistanceMultiplier*this._circleFootSeparation*(2+e),s=r/this._2PI,o=this._2PI/e,a=[];for(s=Math.max(s,35),a.length=e,i=0;e>i;i++)n=this._circleStartAngle+i*o,a[i]=new L.Point(t.x+s*Math.cos(n),t.y+s*Math.sin(n))._round();return a},_generatePointsSpiral:function(e,t){var i,n=this._group.options.spiderfyDistanceMultiplier,r=n*this._spiralLengthStart,s=n*this._spiralFootSeparation,o=n*this._spiralLengthFactor*this._2PI,a=0,h=[];for(h.length=e,i=e;i>=0;i--)e>i&&(h[i]=new L.Point(t.x+r*Math.cos(a),t.y+r*Math.sin(a))._round()),a+=s/r+5e-4*i,r+=o/a;return h},_noanimationUnspiderfy:function(){var e,t,i=this._group,n=i._map,r=i._featureGroup,s=this.getAllChildMarkers(null,!0);for(i._ignoreMove=!0,this.setOpacity(1),t=s.length-1;t>=0;t--)e=s[t],r.removeLayer(e),e._preSpiderfyLatlng&&(e.setLatLng(e._preSpiderfyLatlng),delete e._preSpiderfyLatlng),e.setZIndexOffset&&e.setZIndexOffset(0),e._spiderLeg&&(n.removeLayer(e._spiderLeg),delete e._spiderLeg);i.fire("unspiderfied",{cluster:this,markers:s}),i._ignoreMove=!1,i._spiderfied=null}}),L.MarkerClusterNonAnimated=L.MarkerCluster.extend({_animationSpiderfy:function(e,t){var i,n,r,s,o=this._group,a=o._map,h=o._featureGroup,l=this._group.options.spiderLegPolylineOptions;for(o._ignoreMove=!0,i=0;i<e.length;i++)s=a.layerPointToLatLng(t[i]),n=e[i],r=new L.Polyline([this._latlng,s],l),a.addLayer(r),n._spiderLeg=r,n._preSpiderfyLatlng=n._latlng,n.setLatLng(s),n.setZIndexOffset&&n.setZIndexOffset(1e6),h.addLayer(n);this.setOpacity(.3),o._ignoreMove=!1,o.fire("spiderfied",{cluster:this,markers:e})},_animationUnspiderfy:function(){this._noanimationUnspiderfy()}}),L.MarkerCluster.include({_animationSpiderfy:function(e,t){var i,n,r,s,o,a,h=this,l=this._group,u=l._map,_=l._featureGroup,d=this._latlng,c=u.latLngToLayerPoint(d),p=L.Path.SVG,f=L.extend({},this._group.options.spiderLegPolylineOptions),m=f.opacity;for(void 0===m&&(m=L.MarkerClusterGroup.prototype.options.spiderLegPolylineOptions.opacity),p?(f.opacity=0,f.className=(f.className||"")+" leaflet-cluster-spider-leg"):f.opacity=m,l._ignoreMove=!0,i=0;i<e.length;i++)n=e[i],a=u.layerPointToLatLng(t[i]),r=new L.Polyline([d,a],f),u.addLayer(r),n._spiderLeg=r,p&&(s=r._path,o=s.getTotalLength()+.1,s.style.strokeDasharray=o,s.style.strokeDashoffset=o),n.setZIndexOffset&&n.setZIndexOffset(1e6),n.clusterHide&&n.clusterHide(),_.addLayer(n),n._setPos&&n._setPos(c);for(l._forceLayout(),l._animationStart(),i=e.length-1;i>=0;i--)a=u.layerPointToLatLng(t[i]),n=e[i],n._preSpiderfyLatlng=n._latlng,n.setLatLng(a),n.clusterShow&&n.clusterShow(),p&&(r=n._spiderLeg,s=r._path,s.style.strokeDashoffset=0,r.setStyle({opacity:m}));this.setOpacity(.3),l._ignoreMove=!1,setTimeout(function(){l._animationEnd(),l.fire("spiderfied",{cluster:h,markers:e})},200)},_animationUnspiderfy:function(e){var t,i,n,r,s,o,a=this,h=this._group,l=h._map,u=h._featureGroup,_=e?l._latLngToNewLayerPoint(this._latlng,e.zoom,e.center):l.latLngToLayerPoint(this._latlng),d=this.getAllChildMarkers(null,!0),c=L.Path.SVG;for(h._ignoreMove=!0,h._animationStart(),this.setOpacity(1),i=d.length-1;i>=0;i--)t=d[i],t._preSpiderfyLatlng&&(t.closePopup(),t.setLatLng(t._preSpiderfyLatlng),delete t._preSpiderfyLatlng,o=!0,t._setPos&&(t._setPos(_),o=!1),t.clusterHide&&(t.clusterHide(),o=!1),o&&u.removeLayer(t),c&&(n=t._spiderLeg,r=n._path,s=r.getTotalLength()+.1,r.style.strokeDashoffset=s,n.setStyle({opacity:0})));h._ignoreMove=!1,setTimeout(function(){var e=0;for(i=d.length-1;i>=0;i--)t=d[i],t._spiderLeg&&e++;for(i=d.length-1;i>=0;i--)t=d[i],t._spiderLeg&&(t.clusterShow&&t.clusterShow(),t.setZIndexOffset&&t.setZIndexOffset(0),e>1&&u.removeLayer(t),l.removeLayer(t._spiderLeg),delete t._spiderLeg);h._animationEnd(),h.fire("unspiderfied",{cluster:a,markers:d})},200)}}),L.MarkerClusterGroup.include({_spiderfied:null,unspiderfy:function(){this._unspiderfy.apply(this,arguments)},_spiderfierOnAdd:function(){this._map.on("click",this._unspiderfyWrapper,this),this._map.options.zoomAnimation&&this._map.on("zoomstart",this._unspiderfyZoomStart,this),this._map.on("zoomend",this._noanimationUnspiderfy,this),L.Browser.touch||this._map.getRenderer(this)},_spiderfierOnRemove:function(){this._map.off("click",this._unspiderfyWrapper,this),this._map.off("zoomstart",this._unspiderfyZoomStart,this),this._map.off("zoomanim",this._unspiderfyZoomAnim,this),this._map.off("zoomend",this._noanimationUnspiderfy,this),this._noanimationUnspiderfy()
},_unspiderfyZoomStart:function(){this._map&&this._map.on("zoomanim",this._unspiderfyZoomAnim,this)},_unspiderfyZoomAnim:function(e){L.DomUtil.hasClass(this._map._mapPane,"leaflet-touching")||(this._map.off("zoomanim",this._unspiderfyZoomAnim,this),this._unspiderfy(e))},_unspiderfyWrapper:function(){this._unspiderfy()},_unspiderfy:function(e){this._spiderfied&&this._spiderfied.unspiderfy(e)},_noanimationUnspiderfy:function(){this._spiderfied&&this._spiderfied._noanimationUnspiderfy()},_unspiderfyLayer:function(e){e._spiderLeg&&(this._featureGroup.removeLayer(e),e.clusterShow&&e.clusterShow(),e.setZIndexOffset&&e.setZIndexOffset(0),this._map.removeLayer(e._spiderLeg),delete e._spiderLeg)}}),L.MarkerClusterGroup.include({refreshClusters:function(e){return e?e instanceof L.MarkerClusterGroup?e=e._topClusterLevel.getAllChildMarkers():e instanceof L.LayerGroup?e=e._layers:e instanceof L.MarkerCluster?e=e.getAllChildMarkers():e instanceof L.Marker&&(e=[e]):e=this._topClusterLevel.getAllChildMarkers(),this._flagParentsIconsNeedUpdate(e),this._refreshClustersIcons(),this.options.singleMarkerMode&&this._refreshSingleMarkerModeMarkers(e),this},_flagParentsIconsNeedUpdate:function(e){var t,i;for(t in e)for(i=e[t].__parent;i;)i._iconNeedsUpdate=!0,i=i.__parent},_refreshSingleMarkerModeMarkers:function(e){var t,i;for(t in e)i=e[t],this.hasLayer(i)&&i.setIcon(this._overrideMarkerIcon(i))}}),L.Marker.include({refreshIconOptions:function(e,t){var i=this.options.icon;return L.setOptions(i,e),this.setIcon(i),t&&this.__parent&&this.__parent._group.refreshClusters(this),this}}),e.MarkerClusterGroup=t,e.MarkerCluster=i});

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('leaflet')) :
	typeof define === 'function' && define.amd ? define(['leaflet'], factory) :
	(factory(global.L));
}(this, (function (L$1) { 'use strict';

L$1 = L$1 && L$1.hasOwnProperty('default') ? L$1['default'] : L$1;

// functional re-impl of Waymark_L.Point.distanceTo,
// with no dependency on Leaflet for easier testing
function pointDistance(ptA, ptB) {
    var x = ptB.x - ptA.x;
    var y = ptB.y - ptA.y;
    return Math.sqrt(x * x + y * y);
}

var computeSegmentHeading = function computeSegmentHeading(a, b) {
    return (Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90 + 360) % 360;
};

var asRatioToPathLength = function asRatioToPathLength(_ref, totalPathLength) {
    var value = _ref.value,
        isInPixels = _ref.isInPixels;
    return isInPixels ? value / totalPathLength : value;
};

function parseRelativeOrAbsoluteValue(value) {
    if (typeof value === 'string' && value.indexOf('%') !== -1) {
        return {
            value: parseFloat(value) / 100,
            isInPixels: false
        };
    }
    var parsedValue = value ? parseFloat(value) : 0;
    return {
        value: parsedValue,
        isInPixels: parsedValue > 0
    };
}

var pointsEqual = function pointsEqual(a, b) {
    return a.x === b.x && a.y === b.y;
};

function pointsToSegments(pts) {
    return pts.reduce(function (segments, b, idx, points) {
        // this test skips same adjacent points
        if (idx > 0 && !pointsEqual(b, points[idx - 1])) {
            var a = points[idx - 1];
            var distA = segments.length > 0 ? segments[segments.length - 1].distB : 0;
            var distAB = pointDistance(a, b);
            segments.push({
                a: a,
                b: b,
                distA: distA,
                distB: distA + distAB,
                heading: computeSegmentHeading(a, b)
            });
        }
        return segments;
    }, []);
}

function projectPatternOnPointPath(pts, pattern) {
    // 1. split the path into segment infos
    var segments = pointsToSegments(pts);
    var nbSegments = segments.length;
    if (nbSegments === 0) {
        return [];
    }

    var totalPathLength = segments[nbSegments - 1].distB;

    var offset = asRatioToPathLength(pattern.offset, totalPathLength);
    var endOffset = asRatioToPathLength(pattern.endOffset, totalPathLength);
    var repeat = asRatioToPathLength(pattern.repeat, totalPathLength);

    var repeatIntervalPixels = totalPathLength * repeat;
    var startOffsetPixels = offset > 0 ? totalPathLength * offset : 0;
    var endOffsetPixels = endOffset > 0 ? totalPathLength * endOffset : 0;

    // 2. generate the positions of the pattern as offsets from the path start
    var positionOffsets = [];
    var positionOffset = startOffsetPixels;
    do {
        positionOffsets.push(positionOffset);
        positionOffset += repeatIntervalPixels;
    } while (repeatIntervalPixels > 0 && positionOffset < totalPathLength - endOffsetPixels);

    // 3. projects offsets to segments
    var segmentIndex = 0;
    var segment = segments[0];
    return positionOffsets.map(function (positionOffset) {
        // find the segment matching the offset,
        // starting from the previous one as offsets are ordered
        while (positionOffset > segment.distB && segmentIndex < nbSegments - 1) {
            segmentIndex++;
            segment = segments[segmentIndex];
        }

        var segmentRatio = (positionOffset - segment.distA) / (segment.distB - segment.distA);
        return {
            pt: interpolateBetweenPoints(segment.a, segment.b, segmentRatio),
            heading: segment.heading
        };
    });
}

/**
* Finds the point which lies on the segment defined by points A and B,
* at the given ratio of the distance from A to B, by linear interpolation.
*/
function interpolateBetweenPoints(ptA, ptB, ratio) {
    if (ptB.x !== ptA.x) {
        return {
            x: ptA.x + ratio * (ptB.x - ptA.x),
            y: ptA.y + ratio * (ptB.y - ptA.y)
        };
    }
    // special case where points lie on the same vertical axis
    return {
        x: ptA.x,
        y: ptA.y + (ptB.y - ptA.y) * ratio
    };
}

(function() {
    // save these original methods before they are overwritten
    var proto_initIcon = Waymark_L.Marker.prototype._initIcon;
    var proto_setPos = Waymark_L.Marker.prototype._setPos;

    var oldIE = (Waymark_L.DomUtil.TRANSFORM === 'msTransform');

    Waymark_L.Marker.addInitHook(function () {
        var iconOptions = this.options.icon && this.options.icon.options;
        var iconAnchor = iconOptions && this.options.icon.options.iconAnchor;
        if (iconAnchor) {
            iconAnchor = (iconAnchor[0] + 'px ' + iconAnchor[1] + 'px');
        }
        this.options.rotationOrigin = this.options.rotationOrigin || iconAnchor || 'center bottom' ;
        this.options.rotationAngle = this.options.rotationAngle || 0;

        // Ensure marker keeps rotated during dragging
        this.on('drag', function(e) { e.target._applyRotation(); });
    });

    Waymark_L.Marker.include({
        _initIcon: function() {
            proto_initIcon.call(this);
        },

        _setPos: function (pos) {
            proto_setPos.call(this, pos);
            this._applyRotation();
        },

        _applyRotation: function () {
            if(this.options.rotationAngle) {
                this._icon.style[Waymark_L.DomUtil.TRANSFORM+'Origin'] = this.options.rotationOrigin;

                if(oldIE) {
                    // for IE 9, use the 2D rotation
                    this._icon.style[Waymark_L.DomUtil.TRANSFORM] = 'rotate(' + this.options.rotationAngle + 'deg)';
                } else {
                    // for modern browsers, prefer the 3D accelerated version
                    this._icon.style[Waymark_L.DomUtil.TRANSFORM] += ' rotateZ(' + this.options.rotationAngle + 'deg)';
                }
            }
        },

        setRotationAngle: function(angle) {
            this.options.rotationAngle = angle;
            this.update();
            return this;
        },

        setRotationOrigin: function(origin) {
            this.options.rotationOrigin = origin;
            this.update();
            return this;
        }
    });
})();

L$1.Symbol = L$1.Symbol || {};

/**
* A simple dash symbol, drawn as a Polyline.
* Can also be used for dots, if 'pixelSize' option is given the 0 value.
*/
L$1.Symbol.Dash = L$1.Class.extend({
    options: {
        pixelSize: 10,
        pathOptions: {}
    },

    initialize: function initialize(options) {
        L$1.Util.setOptions(this, options);
        this.options.pathOptions.clickable = false;
    },

    buildSymbol: function buildSymbol(dirPoint, latLngs, map, index, total) {
        var opts = this.options;
        var d2r = Math.PI / 180;

        // for a dot, nothing more to compute
        if (opts.pixelSize <= 1) {
            return L$1.polyline([dirPoint.latLng, dirPoint.latLng], opts.pathOptions);
        }

        var midPoint = map.project(dirPoint.latLng);
        var angle = -(dirPoint.heading - 90) * d2r;
        var a = L$1.point(midPoint.x + opts.pixelSize * Math.cos(angle + Math.PI) / 2, midPoint.y + opts.pixelSize * Math.sin(angle) / 2);
        // compute second point by central symmetry to avoid unecessary cos/sin
        var b = midPoint.add(midPoint.subtract(a));
        return L$1.polyline([map.unproject(a), map.unproject(b)], opts.pathOptions);
    }
});

L$1.Symbol.dash = function (options) {
    return new L$1.Symbol.Dash(options);
};

L$1.Symbol.ArrowHead = L$1.Class.extend({
    options: {
        polygon: true,
        pixelSize: 10,
        headAngle: 60,
        pathOptions: {
            stroke: false,
            weight: 2
        }
    },

    initialize: function initialize(options) {
        L$1.Util.setOptions(this, options);
        this.options.pathOptions.clickable = false;
    },

    buildSymbol: function buildSymbol(dirPoint, latLngs, map, index, total) {
        return this.options.polygon ? L$1.polygon(this._buildArrowPath(dirPoint, map), this.options.pathOptions) : L$1.polyline(this._buildArrowPath(dirPoint, map), this.options.pathOptions);
    },

    _buildArrowPath: function _buildArrowPath(dirPoint, map) {
        var d2r = Math.PI / 180;
        var tipPoint = map.project(dirPoint.latLng);
        var direction = -(dirPoint.heading - 90) * d2r;
        var radianArrowAngle = this.options.headAngle / 2 * d2r;

        var headAngle1 = direction + radianArrowAngle;
        var headAngle2 = direction - radianArrowAngle;
        var arrowHead1 = L$1.point(tipPoint.x - this.options.pixelSize * Math.cos(headAngle1), tipPoint.y + this.options.pixelSize * Math.sin(headAngle1));
        var arrowHead2 = L$1.point(tipPoint.x - this.options.pixelSize * Math.cos(headAngle2), tipPoint.y + this.options.pixelSize * Math.sin(headAngle2));

        return [map.unproject(arrowHead1), dirPoint.latLng, map.unproject(arrowHead2)];
    }
});

L$1.Symbol.arrowHead = function (options) {
    return new L$1.Symbol.ArrowHead(options);
};

L$1.Symbol.Marker = L$1.Class.extend({
    options: {
        markerOptions: {},
        rotate: false
    },

    initialize: function initialize(options) {
        L$1.Util.setOptions(this, options);
        this.options.markerOptions.clickable = false;
        this.options.markerOptions.draggable = false;
    },

    buildSymbol: function buildSymbol(directionPoint, latLngs, map, index, total) {
        if (this.options.rotate) {
            this.options.markerOptions.rotationAngle = directionPoint.heading + (this.options.angleCorrection || 0);
        }
        return L$1.marker(directionPoint.latLng, this.options.markerOptions);
    }
});

L$1.Symbol.marker = function (options) {
    return new L$1.Symbol.Marker(options);
};

var isCoord = function isCoord(c) {
    return c instanceof L$1.LatLng || Array.isArray(c) && c.length === 2 && typeof c[0] === 'number';
};

var isCoordArray = function isCoordArray(ll) {
    return Array.isArray(ll) && isCoord(ll[0]);
};

L$1.PolylineDecorator = L$1.FeatureGroup.extend({
    options: {
        patterns: []
    },

    initialize: function initialize(paths, options) {
        L$1.FeatureGroup.prototype.initialize.call(this);
        L$1.Util.setOptions(this, options);
        this._map = null;
        this._paths = this._initPaths(paths);
        this._bounds = this._initBounds();
        this._patterns = this._initPatterns(this.options.patterns);
    },

    /**
    * Deals with all the different cases. input can be one of these types:
    * array of LatLng, array of 2-number arrays, Polyline, Polygon,
    * array of one of the previous.
    */
    _initPaths: function _initPaths(input, isPolygon) {
        var _this = this;

        if (isCoordArray(input)) {
            // Leaflet Polygons don't need the first point to be repeated, but we do
            var coords = isPolygon ? input.concat([input[0]]) : input;
            return [coords];
        }
        if (input instanceof L$1.Polyline) {
            // we need some recursivity to support multi-poly*
            return this._initPaths(input.getLatLngs(), input instanceof L$1.Polygon);
        }
        if (Array.isArray(input)) {
            // flatten everything, we just need coordinate lists to apply patterns
            return input.reduce(function (flatArray, p) {
                return flatArray.concat(_this._initPaths(p, isPolygon));
            }, []);
        }
        return [];
    },

    // parse pattern definitions and precompute some values
    _initPatterns: function _initPatterns(patternDefs) {
        return patternDefs.map(this._parsePatternDef);
    },

    /**
    * Changes the patterns used by this decorator
    * and redraws the new one.
    */
    setPatterns: function setPatterns(patterns) {
        this.options.patterns = patterns;
        this._patterns = this._initPatterns(this.options.patterns);
        this.redraw();
    },

    /**
    * Changes the patterns used by this decorator
    * and redraws the new one.
    */
    setPaths: function setPaths(paths) {
        this._paths = this._initPaths(paths);
        this._bounds = this._initBounds();
        this.redraw();
    },

    /**
    * Parse the pattern definition
    */
    _parsePatternDef: function _parsePatternDef(patternDef, latLngs) {
        return {
            symbolFactory: patternDef.symbol,
            // Parse offset and repeat values, managing the two cases:
            // absolute (in pixels) or relative (in percentage of the polyline length)
            offset: parseRelativeOrAbsoluteValue(patternDef.offset),
            endOffset: parseRelativeOrAbsoluteValue(patternDef.endOffset),
            repeat: parseRelativeOrAbsoluteValue(patternDef.repeat)
        };
    },

    onAdd: function onAdd(map) {
        this._map = map;
        this._draw();
        this._map.on('moveend', this.redraw, this);
    },

    onRemove: function onRemove(map) {
        this._map.off('moveend', this.redraw, this);
        this._map = null;
        L$1.FeatureGroup.prototype.onRemove.call(this, map);
    },

    /**
    * As real pattern bounds depends on map zoom and bounds,
    * we just compute the total bounds of all paths decorated by this instance.
    */
    _initBounds: function _initBounds() {
        var allPathCoords = this._paths.reduce(function (acc, path) {
            return acc.concat(path);
        }, []);
        return L$1.latLngBounds(allPathCoords);
    },

    getBounds: function getBounds() {
        return this._bounds;
    },

    /**
    * Returns an array of ILayers object
    */
    _buildSymbols: function _buildSymbols(latLngs, symbolFactory, directionPoints) {
        var _this2 = this;

        return directionPoints.map(function (directionPoint, i) {
            return symbolFactory.buildSymbol(directionPoint, latLngs, _this2._map, i, directionPoints.length);
        });
    },

    /**
    * Compute pairs of LatLng and heading angle,
    * that define positions and directions of the symbols on the path
    */
    _getDirectionPoints: function _getDirectionPoints(latLngs, pattern) {
        var _this3 = this;

        if (latLngs.length < 2) {
            return [];
        }
        var pathAsPoints = latLngs.map(function (latLng) {
            return _this3._map.project(latLng);
        });
        return projectPatternOnPointPath(pathAsPoints, pattern).map(function (point) {
            return {
                latLng: _this3._map.unproject(L$1.point(point.pt)),
                heading: point.heading
            };
        });
    },

    redraw: function redraw() {
        if (!this._map) {
            return;
        }
        this.clearLayers();
        this._draw();
    },

    /**
    * Returns all symbols for a given pattern as an array of FeatureGroup
    */
    _getPatternLayers: function _getPatternLayers(pattern) {
        var _this4 = this;

        var mapBounds = this._map.getBounds().pad(0.1);
        return this._paths.map(function (path) {
            var directionPoints = _this4._getDirectionPoints(path, pattern)
            // filter out invisible points
            .filter(function (point) {
                return mapBounds.contains(point.latLng);
            });
            return L$1.featureGroup(_this4._buildSymbols(path, pattern.symbolFactory, directionPoints));
        });
    },

    /**
    * Draw all patterns
    */
    _draw: function _draw() {
        var _this5 = this;

        this._patterns.map(function (pattern) {
            return _this5._getPatternLayers(pattern);
        }).forEach(function (layers) {
            _this5.addLayer(L$1.featureGroup(layers));
        });
    }
});
/*
 * Allows compact syntax to be used
 */
L$1.polylineDecorator = function (paths, options) {
    return new L$1.PolylineDecorator(paths, options);
};

})));

/*
 * Leaflet.Sleep
 */

/*
 * Default Button (touch devices only)
 */

Waymark_L.Control.SleepMapControl = Waymark_L.Control.extend({

  initialize: function(opts){
    Waymark_L.setOptions(this,opts);
  },

  options: {
    position: 'topright',
    prompt: 'disable map',
    styles: {
      'backgroundColor': 'white',
      'padding': '5px',
      'border': '2px solid gray'
    }
  },

  buildContainer: function(){
    var self = this;
    var container = Waymark_L.DomUtil.create('p', 'sleep-button');
    var boundEvent = this._nonBoundEvent.bind(this);
    container.appendChild( document.createTextNode( this.options.prompt ));
    Waymark_L.DomEvent.addListener(container, 'click', boundEvent);
    Waymark_L.DomEvent.addListener(container, 'touchstart', boundEvent);

    Object.keys(this.options.styles).map(function(key) {
      container.style[key] = self.options.styles[key];
    });

    return (this._container = container);
  },

  onAdd: function () {
    return this._container || this.buildContainer();
  },

  _nonBoundEvent: function(e) {
    Waymark_L.DomEvent.stop(e);
    if (this._map) this._map.sleep._sleepMap();
    return false;
  }

});

Waymark_L.Control.sleepMapControl = function(){
  return new Waymark_L.Control.SleepMapControl();
};


/*
 * The Sleep Handler
 */

Waymark_L.Map.mergeOptions({
  sleep: true,
  sleepTime: 750,
  wakeTime: 750,
  wakeMessageTouch: 'Touch to Wake',
  sleepNote: true,
  hoverToWake: true,
  sleepOpacity:.7,
  sleepButton: Waymark_L.Control.sleepMapControl
});

Waymark_L.Map.Sleep = Waymark_L.Handler.extend({

  addHooks: function () {
    var self = this;
    this.sleepNote = Waymark_L.DomUtil.create('p', 'sleep-note', this._map._container);
    this._enterTimeout = null;
    this._exitTimeout = null;

    /*
     * If the device has only a touchscreen we will never get
     * a mouseout event, so we add an extra button to put the map
     * back to sleep manually.
     *
     * a custom control/button can be provided by the user
     * with the map's `sleepButton` option
     */
    this._sleepButton = this._map.options.sleepButton();

    if (this._map.tap) {
      this._map.addControl(this._sleepButton);
    }

    var mapStyle = this._map._container.style;
    mapStyle.WebkitTransition += 'opacity .5s';
    mapStyle.MozTransition += 'opacity .5s';

    this._setSleepNoteStyle();
    this._sleepMap();
  },

  removeHooks: function () {
    if (!this._map.scrollWheelZoom.enabled()){
      this._map.scrollWheelZoom.enable();
    }
    if (this._map.tap && !this._map.tap.enabled()) {
      this._map.touchZoom.enable();
      this._map.dragging.enable();
      this._map.tap.enable();
    }
    Waymark_L.DomUtil.setOpacity( this._map._container, 1);
    Waymark_L.DomUtil.setOpacity( this.sleepNote, 0);
    this._removeSleepingListeners();
    this._removeAwakeListeners();
  },

  _setSleepNoteStyle: function() {
    var noteString = '';
    var style = this.sleepNote.style;

    if(this._map.tap) {
      noteString = this._map.options.wakeMessageTouch;
    } else if (this._map.options.wakeMessage) {
      noteString = this._map.options.wakeMessage;
    } else if (this._map.options.hoverToWake) {
      noteString = 'click or hover to wake';
    } else {
      noteString = 'click to wake';
    }

    if( this._map.options.sleepNote ){
      this.sleepNote.appendChild(document.createTextNode( noteString ));
      style.pointerEvents = 'none';
      style.maxWidth = '150px';
      style.transitionDuration = '.2s';
      style.zIndex = 5000;
      style.opacity = '.6';
      style.margin = 'auto';
      style.textAlign = 'center';
      style.borderRadius = '4px';
      style.top = '50%';
      style.position = 'relative';
      style.padding = '5px';
      style.border = 'solid 2px black';
      style.background = 'white';

      if(this._map.options.sleepNoteStyle) {
        var noteStyleOverrides = this._map.options.sleepNoteStyle;
        Object.keys(noteStyleOverrides).map(function(key) {
          style[key] = noteStyleOverrides[key];
        });
      }
    }
  },

  _wakeMap: function (e) {
    this._stopWaiting();
    this._map.scrollWheelZoom.enable();
		
		//Joe enable dragging (disabled by default)
    this._map.dragging.enable();

    if (this._map.tap) {
      this._map.touchZoom.enable();
//       this._map.dragging.enable();
      this._map.tap.enable();
      this._map.addControl(this._sleepButton);
    }
    Waymark_L.DomUtil.setOpacity( this._map._container, 1);
    this.sleepNote.style.opacity = 0;
    this._addAwakeListeners();
  },

  _sleepMap: function () {
    this._stopWaiting();
    this._map.scrollWheelZoom.disable();

    if (this._map.tap) {
      this._map.touchZoom.disable();
      this._map.dragging.disable();
      this._map.tap.disable();
      this._map.removeControl(this._sleepButton);
    }

    Waymark_L.DomUtil.setOpacity( this._map._container, this._map.options.sleepOpacity);
    this.sleepNote.style.opacity = .4;
    this._addSleepingListeners();
  },

  _wakePending: function () {
    this._map.once('mousedown', this._wakeMap, this);
    if (this._map.options.hoverToWake){
      var self = this;
      this._map.once('mouseout', this._sleepMap, this);
      self._enterTimeout = setTimeout(function(){
          self._map.off('mouseout', self._sleepMap, self);
          self._wakeMap();
      } , self._map.options.wakeTime);
    }
  },

  _sleepPending: function () {
    var self = this;
    self._map.once('mouseover', self._wakeMap, self);
    self._exitTimeout = setTimeout(function(){
        self._map.off('mouseover', self._wakeMap, self);
        self._sleepMap();
    } , self._map.options.sleepTime);
  },

  _addSleepingListeners: function(){
    this._map.once('mouseover', this._wakePending, this);
    this._map.tap &&
      this._map.once('click', this._wakeMap, this);
  },

  _addAwakeListeners: function(){
    this._map.once('mouseout', this._sleepPending, this);
  },

  _removeSleepingListeners: function(){
    this._map.options.hoverToWake &&
      this._map.off('mouseover', this._wakePending, this);
    this._map.off('mousedown', this._wakeMap, this);
    this._map.tap &&
      this._map.off('click', this._wakeMap, this);
  },

  _removeAwakeListeners: function(){
    this._map.off('mouseout', this._sleepPending, this);
  },

  _stopWaiting: function () {
    this._removeSleepingListeners();
    this._removeAwakeListeners();
    var self = this;
    if(this._enterTimeout) clearTimeout(self._enterTimeout);
    if(this._exitTimeout) clearTimeout(self._exitTimeout);
    this._enterTimeout = null;
    this._exitTimeout = null;
  }
});

Waymark_L.Map.addInitHook('addHandler', 'sleep', Waymark_L.Map.Sleep);

var toGeoJSON=(function(){var s=/\s*/g,g=/^\s*|\s*$/g,h=/\s+/;function o(t){if(!t||!t.length){return 0}for(var y=0,z=0;y<t.length;y++){z=((z<<5)-z)+t.charCodeAt(y)|0}return z}function u(t,z){return t.getElementsByTagName(z)}function m(t,z){return t.getAttribute(z)}function v(t,z){return parseFloat(m(t,z))}function k(t,A){var z=u(t,A);return z.length?z[0]:null}function e(t){if(t.normalize){t.normalize()}return t}function a(t){for(var y=0,z=[];y<t.length;y++){z[y]=parseFloat(t[y])}return z}function b(t){if(t){e(t)}return(t&&t.textContent)||""}function c(t,z){var A={},B,y;for(y=0;y<z.length;y++){B=k(t,z[y]);if(B){A[z[y]]=b(B)}}return A}function q(t,A){for(var z in A){t[z]=A[z]}}function d(t){return a(t.replace(s,"").split(","))}function n(t){var y=t.replace(g,"").split(h),z=[];for(var x=0;x<y.length;x++){z.push(d(y[x]))}return z}function w(t){var C=[v(t,"lon"),v(t,"lat")],z=k(t,"ele"),y=k(t,"gpxtpx:hr")||k(t,"hr"),B=k(t,"time"),A;if(z){A=parseFloat(b(z));if(!isNaN(A)){C.push(A)}}return{coordinates:C,time:B?b(B):null,heartRate:y?parseFloat(b(y)):null}}function j(){return{type:"FeatureCollection",features:[]}}var p;if(typeof XMLSerializer!=="undefined"){p=new XMLSerializer()}else{var r=(typeof process==="object"&&!process.browser);var l=(typeof Titanium==="object");if(typeof exports==="object"&&(r||l)){p=new (require("xmldom").XMLSerializer)()}else{throw new Error("Unable to initialize serializer")}}function f(t){if(t.xml!==undefined){return t.xml}return p.serializeToString(t)}var i={kml:function(P){var N=j(),A={},O={},G={},t=["Polygon","LineString","Point","Track","gx:Track"],E=u(P,"Placemark"),D=u(P,"Style"),M=u(P,"StyleMap");for(var K=0;K<D.length;K++){var x=o(f(D[K])).toString(16);A["#"+m(D[K],"id")]=x;O[x]=D[K]}for(var I=0;I<M.length;I++){A["#"+m(M[I],"id")]=o(f(M[I])).toString(16);var Q=u(M[I],"Pair");var J={};for(var H=0;H<Q.length;H++){J[b(k(Q[H],"key"))]=b(k(Q[H],"styleUrl"))}G["#"+m(M[I],"id")]=J}for(var L=0;L<E.length;L++){N.features=N.features.concat(z(E[L]))}function y(S){var R,T;S=S||"";if(S.substr(0,1)==="#"){S=S.substr(1)}if(S.length===6||S.length===3){R=S}if(S.length===8){T=parseInt(S.substr(0,2),16)/255;R="#"+S.substr(6,2)+S.substr(4,2)+S.substr(2,2)}return[R,isNaN(T)?undefined:T]}function F(R){return a(R.split(" "))}function C(S){var T=u(S,"coord","gx"),W=[],X=[];if(T.length===0){T=u(S,"gx:coord")}for(var V=0;V<T.length;V++){W.push(F(b(T[V])))}var R=u(S,"when");for(var U=0;U<R.length;U++){X.push(b(R[U]))}return{coords:W,times:X}}function B(X){var V,aa,W,U,T,ab=[],S=[];if(k(X,"MultiGeometry")){return B(k(X,"MultiGeometry"))}if(k(X,"MultiTrack")){return B(k(X,"MultiTrack"))}if(k(X,"gx:MultiTrack")){return B(k(X,"gx:MultiTrack"))}for(W=0;W<t.length;W++){aa=u(X,t[W]);if(aa){for(U=0;U<aa.length;U++){V=aa[U];if(t[W]==="Point"){ab.push({type:"Point",coordinates:d(b(k(V,"coordinates")))})}else{if(t[W]==="LineString"){ab.push({type:"LineString",coordinates:n(b(k(V,"coordinates")))})}else{if(t[W]==="Polygon"){var Z=u(V,"LinearRing"),Y=[];for(T=0;T<Z.length;T++){Y.push(n(b(k(Z[T],"coordinates"))))}ab.push({type:"Polygon",coordinates:Y})}else{if(t[W]==="Track"||t[W]==="gx:Track"){var R=C(V);ab.push({type:"LineString",coordinates:R.coords});if(R.times.length){S.push(R.times)}}}}}}}}return{geoms:ab,coordTimes:S}}function z(aj){var S=B(aj),ao,ac={},ax=b(k(aj,"name")),W=b(k(aj,"address")),R=b(k(aj,"styleUrl")),am=b(k(aj,"description")),ar=k(aj,"TimeSpan"),ad=k(aj,"TimeStamp"),ag=k(aj,"ExtendedData"),T=k(aj,"LineStyle"),Y=k(aj,"PolyStyle"),ap=k(aj,"visibility");if(!S.geoms.length){return[]}if(ax){ac.name=ax}if(W){ac.address=W}if(R){if(R[0]!=="#"){R="#"+R}ac.styleUrl=R;if(A[R]){ac.styleHash=A[R]}if(G[R]){ac.styleMapHash=G[R];ac.styleHash=A[G[R].normal]}var aq=O[ac.styleHash];if(aq){if(!T){T=k(aq,"LineStyle")}if(!Y){Y=k(aq,"PolyStyle")}var ab=k(aq,"IconStyle");if(ab){var au=k(ab,"Icon");if(au){var an=b(k(au,"href"));if(an){ac.icon=an}}}}}if(am){ac.description=am}if(ar){var aw=b(k(ar,"begin"));var V=b(k(ar,"end"));ac.timespan={begin:aw,end:V}}if(ad){ac.timestamp=b(k(ad,"when"))}if(T){var af=y(b(k(T,"color"))),ak=af[0],U=af[1],ai=parseFloat(b(k(T,"width")));if(ak){ac.stroke=ak}if(!isNaN(U)){ac["stroke-opacity"]=U}if(!isNaN(ai)){ac["stroke-width"]=ai}}if(Y){var X=y(b(k(Y,"color"))),ae=X[0],ah=X[1],al=b(k(Y,"fill")),Z=b(k(Y,"outline"));if(ae){ac.fill=ae}if(!isNaN(ah)){ac["fill-opacity"]=ah}if(al){ac["fill-opacity"]=al==="1"?ac["fill-opacity"]||1:0}if(Z){ac["stroke-opacity"]=Z==="1"?ac["stroke-opacity"]||1:0}}if(ag){var av=u(ag,"Data"),at=u(ag,"SimpleData");for(ao=0;ao<av.length;ao++){ac[av[ao].getAttribute("name")]=b(k(av[ao],"value"))}for(ao=0;ao<at.length;ao++){ac[at[ao].getAttribute("name")]=b(at[ao])}}if(ap){ac.visibility=b(ap)}if(S.coordTimes.length){ac.coordTimes=(S.coordTimes.length===1)?S.coordTimes[0]:S.coordTimes}var aa={type:"Feature",geometry:(S.geoms.length===1)?S.geoms[0]:{type:"GeometryCollection",geometries:S.geoms},properties:ac};if(m(aj,"id")){aa.id=m(aj,"id")}return[aa]}return N},gpx:function(H){var B,D=u(H,"trk"),I=u(H,"rte"),E=u(H,"wpt"),C=j(),J;for(B=0;B<D.length;B++){J=G(D[B]);if(J){C.features.push(J)}}for(B=0;B<I.length;B++){J=z(I[B]);if(J){C.features.push(J)}}for(B=0;B<E.length;B++){C.features.push(y(E[B]))}function F(K,L){for(var M=0;M<L;M++){K.push(null)}return K}function A(M,L){var R=u(M,L),S=[],K=[],Q=[],N=R.length;if(N<2){return{}}for(var O=0;O<N;O++){var P=w(R[O]);S.push(P.coordinates);if(P.time){K.push(P.time)}if(P.heartRate||Q.length){if(!Q.length){F(Q,O)}Q.push(P.heartRate||null)}}return{line:S,times:K,heartRates:Q}}function G(M){var O=u(M,"trkseg"),L=[],K=[],Q=[],S;for(var N=0;N<O.length;N++){S=A(O[N],"trkpt");if(S){if(S.line){L.push(S.line)}if(S.times&&S.times.length){K.push(S.times)}if(Q.length||(S.heartRates&&S.heartRates.length)){if(!Q.length){for(var R=0;R<N;R++){Q.push(F([],L[R].length))}}if(S.heartRates&&S.heartRates.length){Q.push(S.heartRates)}else{Q.push(F([],S.line.length||0))}}}}if(L.length===0){return}var P=x(M);q(P,t(k(M,"extensions")));if(K.length){P.coordTimes=L.length===1?K[0]:K}if(Q.length){P.heartRates=L.length===1?Q[0]:Q}return{type:"Feature",properties:P,geometry:{type:L.length===1?"LineString":"MultiLineString",coordinates:L.length===1?L[0]:L}}}function z(M){var K=A(M,"rtept");if(!K.line){return}var N=x(M);q(N,t(k(M,"extensions")));var L={type:"Feature",properties:N,geometry:{type:"LineString",coordinates:K.line}};return L}function y(K){var L=x(K);q(L,c(K,["sym"]));return{type:"Feature",properties:L,geometry:{type:"Point",coordinates:w(K).coordinates}}}function t(P){var O={};if(P){var K=k(P,"line");if(K){var L=b(k(K,"color")),M=parseFloat(b(k(K,"opacity"))),N=parseFloat(b(k(K,"width")));if(L){O.stroke=L}if(!isNaN(M)){O["stroke-opacity"]=M}if(!isNaN(N)){O["stroke-width"]=N*96/25.4}}}return O}function x(N){var O=c(N,["name","cmt","desc","type","time","keywords"]),K=u(N,"link");if(K.length){O.links=[]}for(var L=0,M;L<K.length;L++){M={href:m(K[L],"href")};q(M,c(K[L],["text","type"]));O.links.push(M)}return O}return C}};return i})();if(typeof module!=="undefined"){module.exports=toGeoJSON};
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.togpx = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var JXON = require("jxon");
JXON.config({attrPrefix: '@'});

function togpx( geojson, options ) {
  options = (function (defaults, options) {
    for (var k in defaults) {
      if (options.hasOwnProperty(k))
        defaults[k] = options[k];
    }
    return defaults;
  })({
    creator: "togpx",
    metadata: undefined,
    featureTitle: get_feature_title,
    featureDescription: get_feature_description,
    featureLink: undefined,
    featureCoordTimes: get_feature_coord_times,
  }, options || {});

  // is featureCoordTimes is a string -> look for the specified property
  if (typeof options.featureCoordTimes === 'string') {
    var customTimesFieldKey = options.featureCoordTimes;
    options.featureCoordTimes = function (feature) {
      return feature.properties[customTimesFieldKey];
    }
  }

  function get_feature_title(props) {
    // a simple default heuristic to determine a title for a given feature
    // uses a nested `tags` object or the feature's `properties` if present
    // and then searchs for the following properties to construct a title:
    // `name`, `ref`, `id`
    if (!props) return "";
    if (typeof props.tags === "object") {
      var tags_title = get_feature_title(props.tags);
      if (tags_title !== "")
        return tags_title;
    }
    if (props.name)
      return props.name;
    if (props.ref)
      return props.ref;
    if (props.id)
      return props.id;
    return "";
  }
  function get_feature_description(props) {
    // constructs a description for a given feature
    // uses a nested `tags` object or the feature's `properties` if present
    // and then concatenates all properties to construct a description.
    if (!props) return "";
    if (typeof props.tags === "object")
      return get_feature_description(props.tags);
    var res = "";
    for (var k in props) {
      if (typeof props[k] === "object")
        continue;
      res += k+"="+props[k]+"\n";
    }
    return res.substr(0,res.length-1);
  }
  function get_feature_coord_times(feature) {
    if (!feature.properties) return null;
    return feature.properties.times || feature.properties.coordTimes || null;
  }
  function add_feature_link(o, f) {
    if (options.featureLink)
      o.link = { "@href": options.featureLink(f.properties) }
  }
  // make gpx object
  var gpx = {"gpx": {
    "@xmlns":"http://www.topografix.com/GPX/1/1",
    "@xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance",
    "@xsi:schemaLocation":"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd",
    "@version":"1.1",
    "metadata": null,
    "wpt": [],
    "trk": [],
  }};
  if (options.creator)
    gpx.gpx["@creator"] = options.creator;
  if (options.metadata)
    gpx.gpx["metadata"] = options.metadata;
  else
    delete options.metadata;

  var features;
  if (geojson.type === "FeatureCollection")
    features = geojson.features;
  else if (geojson.type === "Feature")
    features = [geojson];
  else
    features = [{type:"Feature", properties: {}, geometry: geojson}];
  features.forEach(function mapFeature(f) {
    switch (f.geometry.type) {
    // POIs
    case "Point":
    case "MultiPoint":
      var coords = f.geometry.coordinates;
      if (f.geometry.type == "Point") coords = [coords];
      coords.forEach(function (coordinates) {
        o = {
          "@lat": coordinates[1],
          "@lon": coordinates[0],
          "name": options.featureTitle(f.properties),
          "desc": options.featureDescription(f.properties)
        };
        if (coordinates[2] !== undefined) {
          o.ele = coordinates[2];
        }
        add_feature_link(o,f);
        gpx.gpx.wpt.push(o);
      });
      break;
    // LineStrings
    case "LineString":
    case "MultiLineString":
      var coords = f.geometry.coordinates;
      var times = options.featureCoordTimes(f);
      if (f.geometry.type == "LineString") coords = [coords];
      o = {
        "name": options.featureTitle(f.properties),
        "desc": options.featureDescription(f.properties)
      };
      add_feature_link(o,f);
      o.trkseg = [];
      coords.forEach(function(coordinates) {
        var seg = {trkpt: []};
        coordinates.forEach(function(c, i) {
          var o = {
            "@lat": c[1],
            "@lon":c[0]
          };
          if (c[2] !== undefined) {
            o.ele = c[2];
          }
          if (times && times[i]) {
            o.time = times[i];
          }
          seg.trkpt.push(o);
        });
        o.trkseg.push(seg);
      });
      gpx.gpx.trk.push(o);
      break;
    // Polygons / Multipolygons
    case "Polygon":
    case "MultiPolygon":
      o = {
        "name": options.featureTitle(f.properties),
        "desc": options.featureDescription(f.properties)
      };
      add_feature_link(o,f);
      o.trkseg = [];
      var coords = f.geometry.coordinates;
      var times = options.featureCoordTimes(f);
      if (f.geometry.type == "Polygon") coords = [coords];
      coords.forEach(function(poly) {
        poly.forEach(function(ring) {
          var seg = {trkpt: []};
          var i = 0;
          ring.forEach(function(c) {
            var o = {
              "@lat": c[1],
              "@lon":c[0]
            };
            if (c[2] !== undefined) {
              o.ele = c[2];
            }
            if (times && times[i]) {
              o.time = times[i];
            }
            i++;
            seg.trkpt.push(o);
          });
          o.trkseg.push(seg);
        });
      });
      gpx.gpx.trk.push(o);
      break;
    case "GeometryCollection":
      f.geometry.geometries.forEach(function (geometry) {
        var pseudo_feature = {
          "properties": f.properties,
          "geometry": geometry
        };
        mapFeature(pseudo_feature);
      });
      break;
    default:
      console.log("warning: unsupported geometry type: "+f.geometry.type);
    }
  });
  gpx_str = JXON.stringify(gpx);
  return gpx_str;
};

module.exports = togpx;

},{"jxon":2}],2:[function(require,module,exports){
/*
 * JXON framework - Copyleft 2011 by Mozilla Developer Network
 *
 * Revision #1 - September 5, 2014
 *
 * https://developer.mozilla.org/en-US/docs/JXON
 *
 * This framework is released under the GNU Public License, version 3 or later.
 * http://www.gnu.org/licenses/gpl-3.0-standalone.html
 *
 * small modifications performed by the iD project:
 * https://github.com/openstreetmap/iD/commits/18aa33ba97b52cacf454e95c65d154000e052a1f/js/lib/jxon.js
 *
 * small modifications performed by user @bugreport0
 * https://github.com/tyrasd/JXON/pull/2/commits
 *
 * some additions and modifications by user @igord
 * https://github.com/tyrasd/JXON/pull/5/commits
 *
 * bugfixes and code cleanup by user @laubstein
 * https://github.com/tyrasd/jxon/pull/32
 *
 * adapted for nodejs and npm by @tyrasd (Martin Raifer <tyr.asd@gmail.com>) 
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory(window));
  } else if (typeof exports === 'object') {
    if (typeof window === 'object' && window.DOMImplementation && window.XMLSerializer && window.DOMParser) {
      // Browserify. hardcode usage of browser's own XMLDom implementation
      // see https://github.com/tyrasd/jxon/issues/18

      module.exports = factory(window);
    } else {
      // Node. Does not work with strict CommonJS, but
      // only CommonJS-like environments that support module.exports,
      // like Node.

      module.exports = factory(require('xmldom'), true);
    }
  } else {
    // Browser globals (root is window)

    root.JXON = factory(window);
  }
}(this, function(xmlDom, isNodeJs) {
  var opts = {
    valueKey: '_',
    attrKey: '$',
    attrPrefix: '$',
    lowerCaseTags: false,
    trueIsEmpty: false,
    autoDate: false,
    ignorePrefixedNodes: false,
    parseValues: false
  };
  var aCache = [];
  var rIsNull = /^\s*$/;
  var rIsBool = /^(?:true|false)$/i;
  var DOMParser;

  return new (function() {

    this.config = function(cfg) {
      for (var k in cfg) {

        opts[k] = cfg[k];
      }
      if (opts.parserErrorHandler) {
        DOMParser = new xmlDom.DOMParser({
          errorHandler: opts.parserErrorHandler,
          locator: {}
        });
      }
    };

    function parseText(sValue) {
      if (!opts.parseValues) {
        return sValue;
      }

      if (rIsNull.test(sValue)) {
        return null;
      }

      if (rIsBool.test(sValue)) {
        return sValue.toLowerCase() === 'true';
      }

      if (isFinite(sValue)) {
        return parseFloat(sValue);
      }

      if (opts.autoDate && isFinite(Date.parse(sValue))) {
        return new Date(sValue);
      }

      return sValue;
    }
    function EmptyTree() {
    }
    EmptyTree.prototype.toString = function() {
      return 'null';
    };

    EmptyTree.prototype.valueOf = function() {
      return null;
    };

    function objectify(vValue) {
      return vValue === null ? new EmptyTree() : vValue instanceof Object ? vValue : new vValue.constructor(vValue);
    }

    function createObjTree(oParentNode, nVerb, bFreeze, bNesteAttr) {
      var CDATA = 4,
        TEXT = 3,
        ELEMENT = 1,
        nLevelStart = aCache.length,
        bChildren = oParentNode.hasChildNodes(),
        bAttributes = oParentNode.nodeType === oParentNode.ELEMENT_NODE && oParentNode.hasAttributes(),
        bHighVerb = Boolean(nVerb & 2),
        nLength = 0,
        sCollectedTxt = '',
        vResult = bHighVerb ? {} : /* put here the default value for empty nodes: */ (opts.trueIsEmpty ? true : ''),
        sProp,
        vContent;

      if (bChildren) {
        for (var oNode, nItem = 0; nItem < oParentNode.childNodes.length; nItem++) {

          oNode = oParentNode.childNodes.item(nItem);
          if (oNode.nodeType === CDATA) {
            sCollectedTxt += oNode.nodeValue;
          } /* nodeType is "CDATASection" (4) */
          else if (oNode.nodeType === TEXT) {
            sCollectedTxt += oNode.nodeValue.trim();
          } /* nodeType is "Text" (3) */
          else if (oNode.nodeType === ELEMENT && !(opts.ignorePrefixedNodes && oNode.prefix)) {
            aCache.push(oNode);
          }
        /* nodeType is "Element" (1) */
        }
      }

      var nLevelEnd = aCache.length,
        vBuiltVal = parseText(sCollectedTxt);

      if (!bHighVerb && (bChildren || bAttributes)) {
        vResult = nVerb === 0 ? objectify(vBuiltVal) : {};
      }

      for (var nElId = nLevelStart; nElId < nLevelEnd; nElId++) {

        sProp = aCache[nElId].nodeName;
        if (opts.lowerCaseTags) {
          sProp = sProp.toLowerCase();
        }

        vContent = createObjTree(aCache[nElId], nVerb, bFreeze, bNesteAttr);
        if (vResult.hasOwnProperty(sProp)) {
          if (vResult[sProp].constructor !== Array) {
            vResult[sProp] = [vResult[sProp]];
          }

          vResult[sProp].push(vContent);
        } else {
          vResult[sProp] = vContent;

          nLength++;
        }
      }

      if (bAttributes) {
        var nAttrLen = oParentNode.attributes.length,
          sAPrefix = bNesteAttr ? '' : opts.attrPrefix,
          oAttrParent = bNesteAttr ? {} : vResult;

        for (var oAttrib, oAttribName, nAttrib = 0; nAttrib < nAttrLen; nLength++, nAttrib++) {

          oAttrib = oParentNode.attributes.item(nAttrib);

          oAttribName = oAttrib.name;
          if (opts.lowerCaseTags) {
            oAttribName = oAttribName.toLowerCase();
          }

          oAttrParent[sAPrefix + oAttribName] = parseText(oAttrib.value.trim());
        }

        if (bNesteAttr) {
          if (bFreeze) {
            Object.freeze(oAttrParent);
          }

          vResult[opts.attrKey] = oAttrParent;

          nLength -= nAttrLen - 1;
        }

      }

      if (nVerb === 3 || (nVerb === 2 || nVerb === 1 && nLength > 0) && sCollectedTxt) {
        vResult[opts.valueKey] = vBuiltVal;
      } else if (!bHighVerb && nLength === 0 && sCollectedTxt) {
        vResult = vBuiltVal;
      }
      if (bFreeze && (bHighVerb || nLength > 0)) {
        Object.freeze(vResult);
      }

      aCache.length = nLevelStart;

      return vResult;
    }
    function loadObjTree(oXMLDoc, oParentEl, oParentObj) {
      var vValue,
        oChild,
        elementNS;

      if (oParentObj.constructor === String || oParentObj.constructor === Number || oParentObj.constructor === Boolean) {
        oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toString())); /* verbosity level is 0 or 1 */
        if (oParentObj === oParentObj.valueOf()) {
          return;
        }

      } else if (oParentObj.constructor === Date) {
        oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toISOString()));
      }
      for (var sName in oParentObj) {

        vValue = oParentObj[sName];
        if ( vValue === undefined ) {
          continue;
        }
        if ( vValue === null ) {
          vValue = {};
        }

        if (isFinite(sName) || vValue instanceof Function) {
          continue;
        }

        /* verbosity level is 0 */
        if (sName === opts.valueKey) {
          if (vValue !== null && vValue !== true) {
            oParentEl.appendChild(oXMLDoc.createTextNode(vValue.constructor === Date ? vValue.toISOString() : String(vValue)));
          }

        } else if (sName === opts.attrKey) { /* verbosity level is 3 */
          for (var sAttrib in vValue) {
            oParentEl.setAttribute(sAttrib, vValue[sAttrib]);
          }
        } else if (sName === opts.attrPrefix + 'xmlns') {
          if (isNodeJs) {
            oParentEl.setAttribute(sName.slice(1), vValue);
          }
        // do nothing: special handling of xml namespaces is done via createElementNS()
        } else if (sName.charAt(0) === opts.attrPrefix) {
          oParentEl.setAttribute(sName.slice(1), vValue);
        } else if (vValue.constructor === Array) {
          for (var nItem in vValue) {
            if (!vValue.hasOwnProperty(nItem)) continue;
            elementNS = (vValue[nItem] && vValue[nItem][opts.attrPrefix + 'xmlns']) || oParentEl.namespaceURI;
            if (elementNS) {
              oChild = oXMLDoc.createElementNS(elementNS, sName);
            } else {
              oChild = oXMLDoc.createElement(sName);
            }

            loadObjTree(oXMLDoc, oChild, vValue[nItem] || {});
            oParentEl.appendChild(oChild);
          }
        } else {
          elementNS = (vValue || {})[opts.attrPrefix + 'xmlns'] || oParentEl.namespaceURI;
          if (elementNS) {
            oChild = oXMLDoc.createElementNS(elementNS, sName);
          } else {
            oChild = oXMLDoc.createElement(sName);
          }
          if (vValue instanceof Object) {
            loadObjTree(oXMLDoc, oChild, vValue);
          } else if (vValue !== null && (vValue !== true || !opts.trueIsEmpty)) {
            oChild.appendChild(oXMLDoc.createTextNode(vValue.toString()));
          }
          oParentEl.appendChild(oChild);
        }
      }
    }
    this.xmlToJs = this.build = function(oXMLParent, nVerbosity /* optional */ , bFreeze /* optional */ , bNesteAttributes /* optional */ ) {
      var _nVerb = arguments.length > 1 && typeof nVerbosity === 'number' ? nVerbosity & 3 : /* put here the default verbosity level: */ 1;
      return createObjTree(oXMLParent, _nVerb, bFreeze || false, arguments.length > 3 ? bNesteAttributes : _nVerb === 3);
    };

    this.jsToXml = this.unbuild = function(oObjTree, sNamespaceURI /* optional */ , sQualifiedName /* optional */ , oDocumentType /* optional */ ) {
      var documentImplementation = xmlDom.document && xmlDom.document.implementation || new xmlDom.DOMImplementation();
      var oNewDoc = documentImplementation.createDocument(sNamespaceURI || null, sQualifiedName || '', oDocumentType || null);
      loadObjTree(oNewDoc, oNewDoc.documentElement || oNewDoc, oObjTree);
      return oNewDoc;
    };

    this.stringToXml = function(xmlStr) {
      if (!DOMParser) {
        DOMParser = new xmlDom.DOMParser();
      }

      return DOMParser.parseFromString(xmlStr, 'application/xml');
    };

    this.xmlToString = function(xmlObj) {
      if (typeof xmlObj.xml !== 'undefined') {
        return xmlObj.xml;
      } else {
        return (new xmlDom.XMLSerializer()).serializeToString(xmlObj);
      }
    };

    this.stringToJs = function(str) {
      var xmlObj = this.stringToXml(str);
      return this.xmlToJs(xmlObj);
    };

    this.jsToString = this.stringify = function(oObjTree, sNamespaceURI /* optional */ , sQualifiedName /* optional */ , oDocumentType /* optional */ ) {
      return this.xmlToString(
        this.jsToXml(oObjTree, sNamespaceURI, sQualifiedName, oDocumentType)
      );
    };

    this.each = function(arr, func, thisArg) {
      if (arr instanceof Array) {
        arr.forEach(func, thisArg);
      } else {
        [arr].forEach(func, thisArg);
      }
    };
  })();

}

));

},{"xmldom":3}],3:[function(require,module,exports){

},{}]},{},[1])(1)
});
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tokml = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var esc = require('xml-escape');
var strxml = require('strxml'),
    tag = strxml.tag;

module.exports = function tokml(geojson, options) {

    options = options || {
        documentName: undefined,
        documentDescription: undefined,
        name: 'name',
        description: 'description',
        simplestyle: false,
        timestamp: 'timestamp'
    };

    return '<?xml version="1.0" encoding="UTF-8"?>' +
        tag('kml', {'xmlns': 'http://www.opengis.net/kml/2.2'},
            tag('Document',
                documentName(options) +
                documentDescription(options) +
                root(geojson, options)
               ));
};

function feature(options, styleHashesArray) {
    return function(_) {
        if (!_.properties || !geometry.valid(_.geometry)) return '';
        var geometryString = geometry.any(_.geometry);
        if (!geometryString) return '';
        
        var styleDefinition = '',
            styleReference = '';
        if (options.simplestyle) {
            var styleHash = hashStyle(_.properties);
            if (styleHash) {
                if (geometry.isPoint(_.geometry) && hasMarkerStyle(_.properties)) {
                    if (styleHashesArray.indexOf(styleHash) === -1) {
                        styleDefinition = markerStyle(_.properties, styleHash);
                        styleHashesArray.push(styleHash);
                    }
                    styleReference = tag('styleUrl', '#' + styleHash);
                } else if ((geometry.isPolygon(_.geometry) || geometry.isLine(_.geometry)) && 
                    hasPolygonAndLineStyle(_.properties)) {
                    if (styleHashesArray.indexOf(styleHash) === -1) {
                        styleDefinition = polygonAndLineStyle(_.properties, styleHash);
                        styleHashesArray.push(styleHash);
                    }
                    styleReference = tag('styleUrl', '#' + styleHash);
                }
                // Note that style of GeometryCollection / MultiGeometry is not supported
            }
        }
  
        var attributes = {}
        if (_.id) attributes.id = _.id
        return styleDefinition + tag('Placemark',
            attributes,
            name(_.properties, options) +
            description(_.properties, options) +
            extendeddata(_.properties) +
            timestamp(_.properties, options) +
            geometryString +
            styleReference);
    };
}

function root(_, options) {
    if (!_.type) return '';
    var styleHashesArray = [];
            
    switch (_.type) {
        case 'FeatureCollection':
            if (!_.features) return '';
            return _.features.map(feature(options, styleHashesArray)).join('');
        case 'Feature':
            return feature(options, styleHashesArray)(_);
        default:
            return feature(options, styleHashesArray)({
                type: 'Feature',
                geometry: _,
                properties: {}
            });
    }
}

function documentName(options) {
    return (options.documentName !== undefined) ? tag('name', options.documentName) : '';
}

function documentDescription(options) {
    return (options.documentDescription !== undefined) ? tag('description', options.documentDescription) : '';
}

function name(_, options) {
    return _[options.name] ? tag('name', esc(_[options.name])) : '';
}

function description(_, options) {
    return _[options.description] ? tag('description', esc(_[options.description])) : '';
}

function timestamp(_, options) {
    return _[options.timestamp] ? tag('TimeStamp', tag('when', esc(_[options.timestamp]))) : '';
}

// ## Geometry Types
//
// https://developers.google.com/kml/documentation/kmlreference#geometry
var geometry = {
    Point: function(_) {
        return tag('Point', tag('coordinates', _.coordinates.join(',')));
    },
    LineString: function(_) {
        return tag('LineString', tag('coordinates', linearring(_.coordinates)));
    },
    Polygon: function(_) {
        if (!_.coordinates.length) return '';
        var outer = _.coordinates[0],
            inner = _.coordinates.slice(1),
            outerRing = tag('outerBoundaryIs', 
                tag('LinearRing', tag('coordinates', linearring(outer)))),
            innerRings = inner.map(function(i) {
                return tag('innerBoundaryIs', 
                    tag('LinearRing', tag('coordinates', linearring(i))));
            }).join('');
        return tag('Polygon', outerRing + innerRings);
    },
    MultiPoint: function(_) {
        if (!_.coordinates.length) return '';
        return tag('MultiGeometry', _.coordinates.map(function(c) {
            return geometry.Point({ coordinates: c });
        }).join(''));
    },
    MultiPolygon: function(_) {
        if (!_.coordinates.length) return '';
        return tag('MultiGeometry', _.coordinates.map(function(c) {
            return geometry.Polygon({ coordinates: c });
        }).join(''));
    },
    MultiLineString: function(_) {
        if (!_.coordinates.length) return '';
        return tag('MultiGeometry', _.coordinates.map(function(c) {
            return geometry.LineString({ coordinates: c });
        }).join(''));
    },
    GeometryCollection: function(_) {
        return tag('MultiGeometry',
            _.geometries.map(geometry.any).join(''));
    },
    valid: function(_) {
        return _ && _.type && (_.coordinates ||
            _.type === 'GeometryCollection' && _.geometries && _.geometries.every(geometry.valid));
    },
    any: function(_) {
        if (geometry[_.type]) {
            return geometry[_.type](_);
        } else {
            return '';
        }
    },
    isPoint: function(_) {
        return _.type === 'Point' ||
        _.type === 'MultiPoint';
    },
    isPolygon: function(_) {
        return _.type === 'Polygon' ||
        _.type === 'MultiPolygon';
    },
    isLine: function(_) {
        return _.type === 'LineString' ||
        _.type === 'MultiLineString';
    }
};

function linearring(_) {
    return _.map(function(cds) { return cds.join(','); }).join(' ');
}

// ## Data
function extendeddata(_) {
    return tag('ExtendedData', {}, pairs(_).map(data).join(''));
}

function data(_) {
    return tag('Data', {'name': _[0]}, tag('value', {}, esc(_[1] ? _[1].toString() : '')));
}

// ## Marker style
function hasMarkerStyle(_) {
    return !!(_['marker-size'] || _['marker-symbol'] || _['marker-color']);
}

function markerStyle(_, styleHash) {
    return tag('Style', {'id': styleHash},
            tag('IconStyle',
                tag('Icon',
                    tag('href', iconUrl(_)))
                ) + iconSize(_)
            );
}

function iconUrl(_) {
    var size = _['marker-size'] || 'medium',
        symbol = _['marker-symbol'] ? '-' + _['marker-symbol'] : '',
        color = (_['marker-color'] || '7e7e7e').replace('#', '');

    return 'https://api.tiles.mapbox.com/v3/marker/' + 'pin-' + size.charAt(0) +
        symbol + '+' + color + '.png';
}

function iconSize(_) {
    return tag('hotSpot', {
        'xunits': 'fraction',
        'yunits': 'fraction',
        'x': '0.5',
        'y': '0.5'
    }, '');
}

// ## Polygon and Line style
function hasPolygonAndLineStyle(_) {
    for (var key in _) {
        if ({
            "stroke": true,
            "stroke-opacity": true,
            "stroke-width": true,
            "fill": true,
            "fill-opacity": true
        }[key]) return true;
    }
}

function polygonAndLineStyle(_, styleHash) {
    var lineStyle = tag('LineStyle', tag('color', hexToKmlColor(_['stroke'], _['stroke-opacity']) || 'ff555555') +
        tag('width', {}, _['stroke-width'] === undefined ? 2 : _['stroke-width'])
    );
    
    var polyStyle = '';
    
    if (_['fill'] || _['fill-opacity']) {
        polyStyle = tag('PolyStyle', 
            tag('color', {}, hexToKmlColor(_['fill'], _['fill-opacity']) || '88555555')
        );
    }
    
    return tag('Style', {'id': styleHash}, lineStyle + polyStyle);
}

// ## Style helpers
function hashStyle(_) {
    var hash = '';
    
    if (_['marker-symbol']) hash = hash + 'ms' + _['marker-symbol'];
    if (_['marker-color']) hash = hash + 'mc' + _['marker-color'].replace('#', '');
    if (_['marker-size']) hash = hash + 'ms' + _['marker-size'];
    if (_['stroke']) hash = hash + 's' + _['stroke'].replace('#', '');
    if (_['stroke-width']) hash = hash + 'sw' + _['stroke-width'].toString().replace('.', '');
    if (_['stroke-opacity']) hash = hash + 'mo' + _['stroke-opacity'].toString().replace('.', '');
    if (_['fill']) hash = hash + 'f' + _['fill'].replace('#', '');
    if (_['fill-opacity']) hash = hash + 'fo' + _['fill-opacity'].toString().replace('.', '');
    
    return hash;
}

function hexToKmlColor(hexColor, opacity) {
    if (typeof hexColor !== 'string') return '';
    
    hexColor = hexColor.replace('#', '').toLowerCase();
    
    if (hexColor.length === 3) {
        hexColor = hexColor[0] + hexColor[0] + 
        hexColor[1] + hexColor[1] + 
        hexColor[2] + hexColor[2];
    } else if (hexColor.length !== 6) {
        return '';
    }
    
    var r = hexColor[0] + hexColor[1];
    var g = hexColor[2] + hexColor[3];
    var b = hexColor[4] + hexColor[5];
    
    var o = 'ff';
    if (typeof opacity === 'number' && opacity >= 0.0 && opacity <= 1.0) {
        o = (opacity * 255).toString(16);
        if (o.indexOf('.') > -1) o = o.substr(0, o.indexOf('.'));
        if (o.length < 2) o = '0' + o;
    }
    
    return o + b + g + r;
}

// ## General helpers
function pairs(_) {
    var o = [];
    for (var i in _){
        if(_[i]){
            o.push([i, _[i]]);
        }else{
            o.push([i, '']);
        }
    }
    return o;
}
},{"strxml":2,"xml-escape":3}],2:[function(require,module,exports){
var esc = require('xml-escape');

module.exports.attr = attr;
module.exports.tagClose = tagClose;
module.exports.tag = tag;

/**
 * @param {array} _ an array of attributes
 * @returns {string}
 */
function attr(attributes) {
    if (!Object.keys(attributes).length) return '';
    return ' ' + Object.keys(attributes).map(function(key) {
        return key + '="' + esc(attributes[key]) + '"';
    }).join(' ');
}

/**
 * @param {string} el element name
 * @param {array} attributes array of pairs
 * @returns {string}
 */
function tagClose(el, attributes) {
    return '<' + el + attr(attributes) + '/>';
}

/**
 * @param {string} el element name
 * @param {string} contents innerXML
 * @param {array} attributes array of pairs
 * @returns {string}
 */
function tag(el, attributes, contents) {
    if (Array.isArray(attributes) || typeof attributes === 'string') {
        contents = attributes;
        attributes = {};
    }
    if (Array.isArray(contents)) contents = '\n' + contents.map(function(content) {
        return '  ' + content;
    }).join('\n') + '\n';
    return '<' + el + attr(attributes) + '>' + contents + '</' + el + '>';
}

},{"xml-escape":3}],3:[function(require,module,exports){


var escape = module.exports = function escape(string, ignore) {
  var pattern;

  if (string === null || string === undefined) return;
	
	//Might be Int... cast
	string = string.toString();

  ignore = (ignore || '').replace(/[^&"<>\']/g, '');
  pattern = '([&"<>\'])'.replace(new RegExp('[' + ignore + ']', 'g'), '');

  return string.replace(new RegExp(pattern, 'g'), function(str, item) {
            return escape.map[item];
          })
}

var map = escape.map = {
    '>': '&gt;'
  , '<': '&lt;'
  , "'": '&apos;'
  , '"': '&quot;'
  , '&': '&amp;'
}
},{}]},{},[1])(1)
});

/*
	==================================
	=============== MAP ==============
	==================================
*/

function Waymark_Map() {
  this.init = function (user_config = {}) {
    Waymark = this;

    //Start timer
    Waymark.start_time = new Date().getTime();

    // jQuery Map Container
    Waymark.jq_map_container = null;

    //Default config
    Waymark.config = {
      // Locale (BCP-47)

      locale: "",

      // Map (Common Options)

      map_options: {
        debug_mode: 0,

        map_height: null,
        map_div_id: "waymark-map",
        map_width: null,
        map_init_zoom: null,
        map_init_latlng: null,
        map_init_basemap: null,
        map_max_zoom: null,

        // Basemaps

        tile_layers: [
          {
            layer_name: "OpenStreetMap",
            layer_url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?r=1",
            layer_attribution:
              '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            layer_max_zoom: "18",
          },
        ],

        line_types: [],
        shape_types: [],
        marker_types: [],

        // Common Features
        show_scale: 0,
      },

      // Viewer

      viewer_options: {
        // Features
        show_gallery: 0,
        show_filter: 1,

        // Cluster
        show_cluster: 1,
        cluster_radius: 80,
        cluster_threshold: 14,

        // Elevation
        show_elevation: 0,
        elevation_div_id: "waymark-elevation",
        elevation_units: "metric",
        elevation_initial: 1,
        elevation_colour: "green",

        // Sleep
        sleep_delay_seconds: 2,
        sleep_do_message: 0,
        sleep_wake_message: "Click or Hover to Wake",
      },

      // Editor

      editor_options: {
        confirm_delete: 1,
        data_div_id: "waymark-data",
      },

      // Legacy overlay type key aliases

      type_aliases: {
        marker: {},
        line: {},
        shape: {},
      },

      // Media Library

      image_size_names: ["thumbnail", "medium", "large", "full"],

      // Type Defaults

      marker_type_defaults: {
        marker_title: "Marker",
        marker_shape: "marker",
        marker_size: "medium",
        marker_colour: "#b42714",
        marker_icon: "fa-star",
        icon_type: "font",
        icon_colour: "white",
      },

      line_type_defaults: {
        line_title: "Line",
        line_colour: "#b42714",
        line_weight: "2",
        line_opacity: "0.7",
      },

      shape_type_defaults: {
        shape_title: "Shape",
        shape_colour: "red",
        fill_opacity: "0.4",
      },

      // Data Properties

      marker_data_defaults: {
        title: undefined,
        type: undefined,
        image_thumbnail_url: undefined,
        image_medium_url: undefined,
        image_large_url: undefined,
        description: undefined,
      },
      line_data_defaults: {
        type: undefined,
        title: undefined,
        image_thumbnail_url: undefined,
        image_medium_url: undefined,
        image_large_url: undefined,
        description: undefined,
        direction: undefined,
      },
      shape_data_defaults: {
        type: undefined,
        title: undefined,
        image_thumbnail_url: undefined,
        image_medium_url: undefined,
        image_large_url: undefined,
        description: undefined,
      },

      // Localisation

      language: {
        //Viewer
        action_fullscreen_activate: "View Fullscreen",
        action_fullscreen_deactivate: "Exit Fullscreen",
        action_locate_activate: "Show me where I am",
        action_zoom_in: "Zoom in",
        action_zoom_out: "Zoom out",
        label_total_length: "Total Length:",
        label_max_elevation: "Max Elevation:",
        label_min_elevation: "Min Elevation:",
        label_ascent: "Total Ascent:",
        label_descent: "Total Descent:",
        label_altitude: "Altitude",
        label_download: "Download",
        label_unit_km: "km",
        label_unit_m: "m",
        label_unit_mi: "mi",
        label_unit_ft: "ft",
        error_geocoder: "Nothing found.",
        //Editor
        add_line_title: "Draw a Line",
        add_photo_title: "Upload Image",
        add_marker_title: "Place a Marker",
        add_rectangle_title: "Draw a Rectangle",
        add_polygon_title: "Draw a Polygon",
        add_circle_title: "Draw a Circle",
        upload_file_title:
          "Read Lines and Markers from file (GPX/KML/GeoJSON supported, which most apps should Export to)",
        action_edit_marker: "Edit Marker",
        action_edit_line: "Edit Line",
        action_edit_shape: "Edit Shape",
        action_edit_done: "Finish editing",
        action_duplicate_marker: "Duplicate Marker",
        action_duplicate_line: "Duplicate Line",
        action_duplicate_shape: "Duplicate Shape",
        action_delete_marker: "Delete Marker",
        action_delete_line: "Delete Line",
        action_delete_shape: "Delete Shape",
        action_delete_confirm_marker:
          "Are you sure you want to delete this Marker?",
        action_delete_confirm_line:
          "Are you sure you want to delete this Line?",
        action_delete_confirm_shape:
          "Are you sure you want to delete this Shape?",
        action_upload_image: "Upload Image",
        object_type_label_marker: "Marker type:",
        object_type_label_line: "Line type:",
        object_type_label_shape: "Shape type:",
        object_title_placeholder_marker: "Marker title",
        object_title_placeholder_line: "Line title",
        object_title_placeholder_shape: "Shape title",
        object_image_placeholder: "Image URL",
        object_description_placeholder_marker: "Marker description",
        object_description_placeholder_line: "Line description",
        object_description_placeholder_shape: "Shape description",
        marker_latlng_label: "Lat,Lng",
        action_search_placeholder: "Search...",
        object_label_marker: "Marker",
        object_label_line: "Line",
        object_label_shape: "Shape",
        object_label_marker_plural: "Markers",
        object_label_line_plural: "Lines",
        object_label_shape_plural: "Shapes",
        error_message_prefix: "Waymark Error",
        info_message_prefix: "Waymark Info",
        debug_message_prefix: "Waymark Debug",
        error_file_type: "This file type is not supported.",
        error_file_conversion: "Could not convert this file to GeoJSON.",
        error_file_upload: "File upload error.",
        error_photo_meta: "Could not retrieve Image metadata.",
        info_exif_yes: "Image location metadata (EXIF) detected!",
        info_exif_no: "Image location metadata (EXIF) NOT detected.",
        no_direction: "No Direction",
        show_direction: "Show Direction",
        reverse_direction: "Reverse Direction",
      },
    };

    // Merge config

    //Iterate over user config (Only map_options, viewer_options, editor_options, type_aliases)

    for (key in user_config) {
      // Only allow the following keys: map_options, viewer_options, editor_options, type_aliases, language
      if (
        [
          "map_options",
          "viewer_options",
          "editor_options",
          "type_aliases",
          "language",
        ].indexOf(key) > -1
      ) {
        //Iterate over user config
        for (sub_key in user_config[key]) {
          //Check key exists
          if (typeof Waymark.config[key][sub_key] !== "undefined") {
            // If Object
            if (typeof user_config[key][sub_key] === "object") {
              // Keep Arrays	as Arrays
              if (Array.isArray(user_config[key][sub_key])) {
                Waymark.config[key][sub_key] = user_config[key][sub_key];
                // Else, merge
              } else {
                Waymark.config[key][sub_key] = Object.assign(
                  {},
                  Waymark.config[key][sub_key],
                  user_config[key][sub_key],
                );
              }
              // Else, set
            } else {
              Waymark.config[key][sub_key] = user_config[key][sub_key];
            }
          }
        }
      }
    }

    //Locale (BCP-47) is a top-level scalar
    if (typeof user_config.locale !== "undefined") {
      Waymark.config.locale = user_config.locale;
    }

    //Set defaults
    var default_line_type = Waymark.get_type("line");
    var default_line_type_key =
      default_line_type.type_key ||
      Waymark.make_key(default_line_type.line_title);
    Waymark.config.line_data_defaults.type = default_line_type_key;

    var default_shape_type = Waymark.get_type("shape");
    var default_shape_type_key =
      default_shape_type.type_key ||
      Waymark.make_key(default_shape_type.shape_title);
    Waymark.config.shape_data_defaults.type = default_shape_type_key;

    var default_marker_type = Waymark.get_type("marker");
    var default_marker_type_key =
      default_marker_type.type_key ||
      Waymark.make_key(default_marker_type.marker_title);
    Waymark.config.marker_data_defaults.type = default_marker_type_key;

    // Debug
    if (Waymark.config.map_options.debug_mode) {
      console.log(Waymark.config);
    }

    //Groups
    Waymark.marker_parent_group = Waymark_L.layerGroup();
    Waymark.marker_sub_groups = {};
    Waymark.line_parent_group = Waymark_L.layerGroup();
    Waymark.line_sub_groups = {};
    Waymark.shape_parent_group = Waymark_L.layerGroup();
    Waymark.shape_sub_groups = {};

    Waymark.active_layer = null;

    //Setup...
    Waymark.pre_map_setup();
    Waymark.setup_map();
    Waymark.handle_resize();
    Waymark.init_done();
    Waymark.load_done();
  };

  //Sanitise user-authored description HTML (allowlist only)
  this.sanitize_description = function (html) {
    //DOMPurify is vendored into the concatenated bundle
    if (typeof window.DOMPurify === "undefined") {
      return html;
    }

    return window.DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p",
        "a",
        "br",
        "b",
        "strong",
        "em",
        "i",
        "u",
        "ul",
        "ol",
        "li",
        "div",
        "span",
        "blockquote",
      ],
      ALLOWED_ATTR: ["class", "href", "target", "title"],
    });
  };

  //Allow only http(s) URLs
  this.is_safe_url = function (url) {
    return /^https?:\/\//i.test(url);
  };

  //Convert plain text to a safe HTML string
  this.escape_html = function (str) {
    return jQuery("<span />").text(str).html();
  };

  //Format a number using the configured locale
  this.format_number = function (value, decimals) {
    var locale =
      this.config.locale || document.documentElement.lang || undefined;

    try {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    } catch (error) {
      return Number(value).toFixed(decimals);
    }
  };

  //Format a coordinate value for display, preserving non-numeric values
  this.format_coordinate = function (value, decimals) {
    var number = typeof value === "number" ? value : parseFloat(value);

    if (!isFinite(number)) {
      return value;
    }

    return this.format_number(number, decimals);
  };

  //Thanks! https://stackoverflow.com/questions/2631001/test-for-existence-of-nested-javascript-object-key
  this.get_property = function (obj, ...args) {
    return args.reduce((obj, level) => obj && obj[level], obj);
  };

  /**
   *
   * Output debugging content
   * 	- Only if config.map_options.debug_mode is enabled
   *
   * @param  {string} thing  Thing to debug
   * @param  {string} output Output method (console|alert)
   * @return {void}
   * @since  0.9
   *
   * @example
   * Waymark.debug('Hello World');
   * Waymark.debug({foo: 'bar'});
   * Waymark.debug({foo: 'bar'}, 'alert');
   *
   */
  this.debug = function (thing, output = "console") {
    if (this.config.map_options.debug_mode) {
      //String
      if (typeof thing === "string") {
        this.message(thing, "debug", output);

        //Object
      } else {
        // Ensure if plain object
        if (typeof thing === "object" && thing !== null) {
          thing = JSON.parse(JSON.stringify(thing));
        }

        // Console
        if (output == "console") {
          console.debug(thing);

          //Alert
        } else {
          this.message(JSON.stringify(thing), "debug", output);
        }
      }
    }
  };

  this.message = function (text = null, type = "info", output = "console") {
    if (text) {
      var prefix = "";

      switch (type) {
        case "debug":
        case "error":
          prefix = Waymark.config.language[type + "_message_prefix"];

          break;
        default:
        case "info":
          prefix = Waymark.config.language.info_message_prefix;

          break;
      }

      if (prefix) {
        prefix = "[" + prefix + "] ";
      }

      if (output == "console") {
        if (type == "error") {
          console.error(prefix + text);
        } else if (type == "debug") {
          console.debug(prefix + text);
        } else {
          console.log(prefix + text);
        }
      } else {
        alert(prefix + text);
      }
    }
  };

  this.title_case = function (str) {
    return str.replace(/(?:^|\s)\w/g, function (match) {
      return match.toUpperCase();
    });
  };

  //Cyrillic to latin

  // TODO - move to... somewhere

  //Thanks! https://stackoverflow.com/a/11404121
  this.transliterate = function (word) {
    var a = {
      Ё: "YO",
      Й: "I",
      Ц: "TS",
      У: "U",
      К: "K",
      Е: "E",
      Н: "N",
      Г: "G",
      Ш: "SH",
      Щ: "SCH",
      З: "Z",
      Х: "H",
      Ъ: "'",
      ё: "yo",
      й: "i",
      ц: "ts",
      у: "u",
      к: "k",
      е: "e",
      н: "n",
      г: "g",
      ш: "sh",
      щ: "sch",
      з: "z",
      х: "h",
      ъ: "'",
      Ф: "F",
      Ы: "I",
      В: "V",
      А: "a",
      П: "P",
      Р: "R",
      О: "O",
      Л: "L",
      Д: "D",
      Ж: "ZH",
      Э: "E",
      ф: "f",
      ы: "i",
      в: "v",
      а: "a",
      п: "p",
      р: "r",
      о: "o",
      л: "l",
      д: "d",
      ж: "zh",
      э: "e",
      Я: "Ya",
      Ч: "CH",
      С: "S",
      М: "M",
      И: "I",
      Т: "T",
      Ь: "'",
      Б: "B",
      Ю: "YU",
      я: "ya",
      ч: "ch",
      с: "s",
      м: "m",
      и: "i",
      т: "t",
      ь: "'",
      б: "b",
      ю: "yu",
    };

    return word
      .split("")
      .map(function (char) {
        return a[char] || char;
      })
      .join("");
  };

  this.make_key = function (str_in) {
    if (!str_in) {
      return str_in;
    }

    //No cyrillic
    str_out = this.transliterate(str_in);

    //No underscores
    str_out = str_out.replace(/[^a-z0-9+]+/gi, "");

    //Lower
    str_out = str_out.toLowerCase();

    // Check for empty str_out
    if (!str_out) {
      // Convert to hex
      str_out = str_in
        .split("")
        .map(function (char) {
          return char.charCodeAt(0).toString(16);
        })
        .join("");
    }

    return str_out;
  };

  this.get_feature_overlay_type = function (feature) {
    if (typeof feature.geometry.type == "undefined") {
      return false;
    }

    switch (feature.geometry.type) {
      // CIRCLES & MARKERS

      case "Point":
        //Circle
        if (feature.properties.radius) {
          return "shape";

          //Marker
        } else {
          return "marker";
        }

      // LINES
      case "LineString":
      case "MultiLineString":
        return "line";

      // Polygon & Rectangle
      case "Polygon":
      case "MultiPolygon":
        //Is this a retangle?
        //				if(feature.properties.rectangle) {}

        return "shape";

        break;
    }

    return false;
  };

  /*
	==================================
	========= COMMOM METHODS =========
	==================================
*/

  this.setup_map = function () {
    Waymark = this;

    Waymark.jq_map_container = jQuery(
      "#" + Waymark.config.map_options.map_div_id,
    );
    Waymark.jq_map_container.addClass("waymark-map-container");

    const map_height = Waymark.config.map_options.map_height
      ? Waymark.config.map_options.map_height + "px"
      : "100%";

    Waymark.jq_map_container.css("height", map_height);

    //Create Map
    var map_options = {
      fullscreenControl: false,
      attributionControl: false,
      editable: true,
      zoomControl: false,
      sleep: false,
    };

    // === Viewer ===

    if (Waymark.mode == "view") {
      //START Sleep
      //  			map_options.scrollWheelZoom = false;
      //Let Sleep enable this on Wake
      map_options.dragging = false;

      //Sleep
      map_options.sleep = true;
      map_options.wakeTime =
        1000 * Waymark.config.viewer_options.sleep_delay_seconds;

      //If Sleep Note
      if (Waymark.config.viewer_options.sleep_do_message === "1") {
        map_options.sleepNote = true;
        map_options.wakeMessage =
          Waymark.config.viewer_options.sleep_wake_message;
        //No Sleep Note
      } else {
        map_options.sleepNote = false;
        map_options.wakeMessage = false;
      }

      // 	    hoverToWake: false,
      map_options.sleepOpacity = 1;
      //END Sleep

      // === Editor ===
    } else {
      //Sleep not used, enable
      map_options.dragging = true;
    }

    //Merge Map options
    if (typeof Waymark.config.map_options !== "undefined") {
      // If not undefined
      if (
        typeof Waymark.config.map_options.map_max_zoom !== "undefined" &&
        Waymark.config.map_options.map_max_zoom
      ) {
        // Set
        map_options.maxZoom = Waymark.config.map_options.map_max_zoom;

        console.log("Max Zoom: " + map_options.maxZoom);
      }
    }

    //Create Map

    Waymark.map = Waymark_L.map(
      Waymark.config.map_options.map_div_id,
      map_options,
    );
    Waymark_L.control
      .attribution({
        prefix:
          '<a href="https://www.ogis.org/waymark-js/" title="Make Meaningful Maps">Waymark</a> ' +
          '<span aria-hidden="true">|</span> ' +
          '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">' +
          '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag">' +
          '<path fill="#4C7BE1" d="M0 0h12v4H0z"></path>' +
          '<path fill="#FFD500" d="M0 4h12v3H0z"></path>' +
          '<path fill="#E0BC00" d="M0 7h12v1H0z"></path>' +
          "</svg>&nbsp;Leaflet</a>",
      })
      .addTo(Waymark.map);

    // All attribution links should open in a new tab. The control rebuilds
    // its contents whenever attributions change (e.g. a basemap switch),
    // so re-apply the attributes on every update.
    var attribution_control = Waymark.map
      .getContainer()
      .querySelector(".leaflet-control-attribution");

    var set_attribution_targets = function () {
      var links = attribution_control.querySelectorAll("a");

      for (var i = 0; i < links.length; i++) {
        links[i].setAttribute("target", "_blank");
        links[i].setAttribute("rel", "noopener noreferrer");
      }
    };

    set_attribution_targets();

    new MutationObserver(set_attribution_targets).observe(attribution_control, {
      childList: true,
      subtree: true,
    });

    //Show scale?
    if (Waymark.config.map_options.show_scale == true) {
      Waymark_L.control.scale().addTo(Waymark.map);
    }

    //Add reference
    Waymark.jq_map_container.data("Waymark", Waymark);

    //View
    let initial_latlng = Waymark.config.map_options.map_init_latlng;
    if (typeof initial_latlng !== "undefined" && initial_latlng) {
      Waymark.map.setView(initial_latlng);
    } else {
      initial_latlng = false;
    }

    let initial_zoom = Waymark.config.map_options.map_init_zoom;
    if (typeof initial_zoom !== "undefined" && initial_zoom) {
      Waymark.map.setZoom(initial_zoom);
    } else {
      initial_zoom = false;
    }

    // If no initial latlng or zoom
    if (!initial_latlng && !initial_zoom) {
      Waymark.debug("No initial latlng or zoom set! 🌍");

      // Random country bounds
      // let fallback_bounds = Waymark.country_code_to_bounds();

      // // Fit
      // Waymark.map.fitBounds(fallback_bounds, {
      // 	padding: [50, 50],
      // });
    }

    //Set default style
    Waymark_L.Path.mergeOptions({
      color: "#b42714",
    });

    //Zoom Control
    Waymark_L.control
      .zoom({
        position: "topleft",
        zoomInTitle: Waymark.config.language.action_zoom_in,
        zoomOutTitle: Waymark.config.language.action_zoom_out,
      })
      .addTo(Waymark.map);

    //Locate Button
    Waymark_L.control
      .locate({
        position: "bottomright",
        icon: "ion ion-android-locate",
        drawCircle: false,
        strings: {
          title: Waymark.config.language.action_locate_activate,
        },
        locateOptions: {
          enableHighAccuracy: true,
        },
      })
      .addTo(Waymark.map);

    //Fullscreen Control
    Waymark_L.control
      .fullscreen({
        position: "topleft",
        title: {
          false: Waymark.config.language.action_fullscreen_activate,
          true: Waymark.config.language.action_fullscreen_deactivate,
        },
      })
      .addTo(Waymark.map);

    //Add parent groups to map
    Waymark.marker_parent_group.addTo(Waymark.map);
    Waymark.line_parent_group.addTo(Waymark.map);
    Waymark.shape_parent_group.addTo(Waymark.map);

    //Setup
    Waymark.setup_layers();
    Waymark.create_data_layer();
    Waymark.create_buttons();
  };

  this.create_data_layer = function () {
    Waymark = this;

    //Create data layer
    Waymark.map_data = Waymark_L.geoJSON(null, {
      pointToLayer: function (feature, latlng) {
        if (
          typeof feature.properties !== "undefined" &&
          feature.properties.radius
        ) {
          return new Waymark_L.Circle(
            latlng,
            parseFloat(feature.properties.radius),
          );
        } else {
          return Waymark.create_marker(latlng);
        }
      },
      onEachFeature: function (feature, layer) {
        // Active
        layer.on("popupopen", function (e) {
          Waymark.active_layer = layer;
        });
        layer.on("popupclose", function (e) {
          Waymark.active_layer = null;
        });

        switch (feature.geometry.type) {
          // CIRCLES & MARKERS

          case "Point":
            //Circle
            if (feature.properties.radius) {
              //Build Waymark data
              feature.properties = Waymark.parse_layer_data(
                "shape",
                feature.properties,
              );

              //Set style
              var type = Waymark.get_type("shape", feature.properties.type);
              layer.setStyle({
                color: type.shape_colour,
                fillOpacity: type.fill_opacity,
              });

              //Set info window
              Waymark.info_window("shape", feature, layer);

              //Set title tooltip
              Waymark.tooltip("shape", feature, layer);

              //Add to group
              Waymark.add_to_group("shape", layer);
              //Marker
            } else {
              //Build Waymark data
              feature.properties = Waymark.parse_layer_data(
                "marker",
                feature.properties,
              );

              //Set marker style
              var type = Waymark.get_type("marker", feature.properties.type);

              //Create Icon
              layer.setIcon(Waymark_L.divIcon(Waymark.build_icon_data(type)));

              //Add any photos to photo gallery
              if (typeof Waymark.gallery_images !== "undefined") {
                Waymark.add_to_gallery(layer);
              }

              //Set info window
              Waymark.info_window("marker", feature, layer);

              //Set title tooltip
              Waymark.tooltip("marker", feature, layer);

              //Add to group
              Waymark.add_to_group("marker", layer);
            }

            break;

          // LINES

          case "LineString":
          case "MultiLineString":
            //Build Waymark data
            feature.properties = Waymark.parse_layer_data(
              "line",
              feature.properties,
            );

            //Set line style
            var type = Waymark.get_type("line", feature.properties.type);
            layer.setStyle({
              color: type.line_colour,
              weight: type.line_weight,
              opacity: type.line_opacity,
            });

            //Set info window
            Waymark.info_window("line", feature, layer);

            //Set title tooltip
            Waymark.tooltip("line", feature, layer);

            //Line direction, shown initially?
            var show_initially = parseInt(type.line_display);
            Waymark.draw_line_direction(layer, show_initially);

            //Add to group
            Waymark.add_to_group("line", layer);

            break;

          // Polygon & Rectangle

          case "Polygon":
          case "MultiPolygon":
            //Build Waymark data
            feature.properties = Waymark.parse_layer_data(
              "shape",
              feature.properties,
            );

            //Is this a rectangle?
            if (feature.properties.rectangle) {
              //...
            }

            //Set shape style
            var type = Waymark.get_type("shape", feature.properties.type);
            layer.setStyle({
              color: type.shape_colour,
              fillOpacity: type.fill_opacity,
            });

            //Set info window
            Waymark.info_window("shape", feature, layer);

            //Set title tooltip
            Waymark.tooltip("shape", feature, layer);

            //Add to group
            Waymark.add_to_group("shape", layer);

            break;
        }
      },
    });
  };

  this.draw_line_direction = function (layer, show_initially = true) {
    var feature = layer.feature;
    var direction = feature.properties.direction;
    var type = Waymark.get_type("line", feature.properties.type);

    if (typeof layer.direction_layer === "object") {
      Waymark.map.removeLayer(layer.direction_layer);
    }

    //Valid direction
    if (
      typeof direction === "string" &&
      (direction == "default" || direction == "reverse")
    ) {
      var head_angle = 45;
      //Reverse
      if (direction == "reverse") {
        head_angle = 360 - head_angle;
      }

      var decorator = Waymark_L.polylineDecorator(layer, {
        patterns: [
          {
            // 	            	offset: 25,
            repeat: 100,
            symbol: L.Symbol.arrowHead({
              pixelSize: 15,
              headAngle: head_angle,
              polygon: true,
              pathOptions: {
                color: "#fff",
                fillColor: type.line_colour,
                opacity: "0.7",
                stroke: true,
                fillOpacity: 0.7,
                weight: 2,
              },
            }),
          },
        ],
      });

      if (show_initially) {
        decorator.addTo(Waymark.map);
      }

      layer.direction_layer = decorator;
    }
  };

  this.setup_layers = function () {
    Waymark = this;

    Waymark.layer_control = Waymark_L.control.layers();

    var basemaps = [];
    var initial_basemap_index = 0;

    //Determine initial basemap
    //Set by name?
    if (
      typeof Waymark.config.map_options.map_init_basemap !== "undefined" &&
      Waymark.config.map_options.map_init_basemap
    ) {
      //Search
      for (var i in Waymark.config.map_options.tile_layers) {
        var init_basemap_name =
          Waymark.config.map_options.map_init_basemap.toUpperCase();
        var this_basemap_name =
          Waymark.config.map_options.tile_layers[i].layer_name.toUpperCase();

        //Found
        if (init_basemap_name === this_basemap_name) {
          //Use
          initial_basemap_index = i;
        }
      }
    }

    //For each tile layer
    for (var i in Waymark.config.map_options.tile_layers) {
      //Append URL?
      if (
        typeof Waymark.config.map_options.tile_layers[i].append !== "undefined"
      ) {
        Waymark.config.map_options.tile_layers[i].layer_url +=
          Waymark.config.map_options.tile_layers[i].append;
      }

      //Create key
      var basemap_key = Waymark.config.map_options.tile_layers[
        i
      ].layer_name.replace(/ /g, "");

      //Create tile layer
      var layer_options = {
        id: basemap_key,
        attribution:
          Waymark.config.map_options.tile_layers[i].layer_attribution,
      };

      //Max zoom?
      var layer_max_zoom = parseInt(
        Waymark.config.map_options.tile_layers[i].layer_max_zoom,
      );
      if (layer_max_zoom) {
        layer_options.maxZoom = layer_max_zoom;
      }

      var basemap = Waymark_L.tileLayer(
        Waymark.config.map_options.tile_layers[i].layer_url,
        layer_options,
      );
      basemaps[Waymark.config.map_options.tile_layers[i].layer_name] = basemap;

      //Set initial basemap
      if (i == initial_basemap_index) {
        basemap.addTo(Waymark.map);
      }
    }

    //More than one tile layer
    if (i >= 1) {
      //Layer control
      Waymark.layer_control.addTo(Waymark.map);
      for (basemap_name in basemaps) {
        Waymark.layer_control.addBaseLayer(
          basemaps[basemap_name],
          basemap_name,
        );
      }
    }
  };

  this.resolve_type_key = function (layer_type, type_key) {
    Waymark = this;

    if (
      typeof type_key === "undefined" ||
      type_key === null ||
      type_key === ""
    ) {
      return "";
    }

    var aliases =
      (Waymark.config.type_aliases &&
        Waymark.config.type_aliases[layer_type]) ||
      {};

    //Direct alias
    if (Object.prototype.hasOwnProperty.call(aliases, type_key)) {
      return aliases[type_key];
    }

    //Compare through make_key so legacy underscores and casing still match
    var made_key = Waymark.make_key(type_key);
    for (var alias in aliases) {
      if (Waymark.make_key(alias) == made_key) {
        return aliases[alias];
      }
    }

    return type_key;
  };

  this.get_type = function (layer_type, type_key) {
    Waymark = this;

    var type = null;
    var requested_key = Waymark.resolve_type_key(layer_type, type_key);
    var requested_made_key = Waymark.make_key(requested_key);
    var config_types = Waymark.config.map_options[layer_type + "_types"];

    //Iterate over all types
    for (var i in config_types) {
      //Use first as default
      if (i == 0) {
        type = config_types[i];
      }

      var config_type = config_types[i];
      var explicit_key = config_type.type_key;
      var type_title = config_type[layer_type + "_title"];

      //Found by explicit key
      var explicit_match =
        typeof explicit_key !== "undefined" &&
        explicit_key !== null &&
        explicit_key !== "" &&
        (explicit_key == requested_key ||
          Waymark.make_key(explicit_key) == requested_made_key);

      //Legacy fallback, title derived key
      var title_match =
        type_title && Waymark.make_key(type_title) == requested_made_key;

      if (explicit_match || title_match) {
        type = config_type;
      }
    }

    //Set key
    type = Waymark.parse_type(type, layer_type);

    return type;
  };

  //Checks for types
  this.parse_type = function (type = {}, layer_type = "marker") {
    Waymark = this;

    if (typeof type === "undefined" || type === null) {
      type = {};
    }

    // Start with fallbacks
    var fallback = Waymark.config[layer_type + "_type_defaults"];

    // Merge
    type = Object.assign({}, fallback, type);

    //Set key, keeping an explicit key
    if (
      typeof type.type_key === "undefined" ||
      type.type_key === null ||
      type.type_key === ""
    ) {
      type.type_key = Waymark.make_key(type[layer_type + "_title"]);
    }

    return type;
  };

  this.handle_resize = function () {
    Waymark = this;

    jQuery(window).on("resize", function () {
      Waymark.config.map_options.map_height = Waymark.jq_map_container.height();
      Waymark.config.map_options.map_width = Waymark.jq_map_container.width();

      if (typeof Waymark.size_gallery === "function") {
        Waymark.size_gallery();
      }
    });
  };

  this.tooltip = function (layer_type, feature, layer) {
    Waymark = this;

    var text = "";

    //Displaying Type?
    var type = Waymark.get_type(layer_type, feature.properties.type);

    if (type && typeof type[layer_type + "_title"] !== "undefined") {
      var title = type[layer_type + "_title"];
      text = '<span class="waymark-type-label">[' + title + "]</span> ";
    }

    //Title
    if (feature.properties.title) {
      text += Waymark.escape_html(feature.properties.title);
    }

    if (!text) {
      return;
    }

    layer.bindTooltip(text);

    layer.on("mouseover", function (e) {
      var tooltip = e.target.getTooltip();
      tooltip.setLatLng(e.latlng);
      tooltip.openTooltip();
    });

    layer.on("mousemove", function (e) {
      var tooltip = e.target.getTooltip();
      tooltip.setLatLng(e.latlng);
    });
  };

  this.get_data_defaults = function (layer_type) {
    return Object.assign({}, Waymark.config[layer_type + "_data_defaults"]);
  };

  this.parse_layer_data = function (layer_type, data_in) {
    let data_out = {};

    // Iterate over input data
    for (key in data_in) {
      // Has value
      if (data_in[key]) {
        switch (key) {
          // Migrate some keys

          case "name":
            data_out.title = data_in[key];

            break;
          case "desc":
          case "notes":
            data_out.description = data_in[key];

            break;

          case "radius":
            data_out.radius = parseFloat(data_in[key]);

            break;

          // Store all other properties!

          default:
            data_out[key] = data_in[key];

            break;
        }
      }
    }

    return data_out;
  };

  this.add_to_group = function (layer_type, layer) {
    Waymark = this;

    var feature = layer.feature;

    //If we have a type
    if (typeof feature.properties.type !== "undefined") {
      //Get Type
      var type_key = feature.properties.type;
      var type = Waymark.get_type(layer_type, type_key);

      if (
        typeof Waymark[layer_type + "_sub_groups"][type.type_key] == "undefined"
      ) {
        //Create the sub-group
        var group = Waymark_L.featureGroup.subGroup(
          Waymark[layer_type + "_parent_group"],
        );

        //Add to groups
        Waymark[layer_type + "_sub_groups"][type.type_key] = group;

        //Add to Map
        if (
          Waymark.mode == "view" &&
          typeof type[layer_type + "_display"] !== "undefined"
        ) {
          if (type[layer_type + "_display"] == "1") {
            group.addTo(Waymark.map);
          }
        } else {
          group.addTo(Waymark.map);
        }
      }

      //Add Layer to group
      layer.addTo(Waymark[layer_type + "_sub_groups"][type.type_key]);
      //Direction layer?
      if (layer_type == "line" && typeof layer.direction_layer === "object") {
        layer.direction_layer.addTo(
          Waymark[layer_type + "_sub_groups"][type.type_key],
        );
      }

      //If Overlay Filter is enabled
      if (
        parseInt(Waymark.config.viewer_options.show_filter) &&
        Waymark.mode == "view"
      ) {
        //Ensure the control is added
        Waymark.layer_control.addTo(Waymark.map);

        //Redraw in layer Control
        Waymark.layer_control.removeLayer(
          Waymark[layer_type + "_parent_group"],
        );
        Waymark.layer_control.addOverlay(
          Waymark[layer_type + "_parent_group"],
          "<b>" +
            Waymark.escape_html(
              Waymark.config.language["object_label_" + layer_type + "_plural"],
            ) +
            "</b>",
        );

        Waymark_L.stamp(Waymark[layer_type + "_parent_group"]);
        for (key in Waymark[layer_type + "_sub_groups"]) {
          var this_type = Waymark.get_type(layer_type, key);
          var group = Waymark[layer_type + "_sub_groups"][key];

          //(Re-?)add to control
          Waymark.layer_control.removeLayer(group);
          Waymark.layer_control.addOverlay(
            group,
            Waymark.type_to_text(layer_type, this_type),
          );
        }
      }
      //No type key - just add to Map
    } else {
      layer.addTo(Waymark[layer_type + "_parent_group"]);
    }
  };

  //Represent Type as text
  this.type_to_text = function (layer_type = "", type = {}, ele = "span") {
    Waymark = this;

    var preview_class = "waymark-type-text waymark-" + layer_type + "-type";
    var preview_style = "";

    switch (layer_type) {
      case "marker":
        preview_style += "color:" + type.icon_colour + ";";
        preview_style +=
          "background:" + Waymark.get_marker_background(type.marker_colour);

        break;
      case "line":
        preview_style += "background:" + type.line_colour;

        break;
      case "shape":
        preview_style += "background:" + type.shape_colour;

        break;
    }

    return (
      "<" +
      ele +
      ' class="' +
      preview_class +
      '" style="' +
      preview_style +
      '">' +
      Waymark.escape_html(type[layer_type + "_title"]) +
      "</" +
      ele +
      ">"
    );
  };

  //Create marker
  this.create_marker = function (latlng) {
    return Waymark_L.marker(latlng);
  };

  this.build_icon_data = function (type = {}) {
    Waymark = this;

    // Ensure is a an object with a non-empty type key
    if (typeof type !== "object" || typeof type.type_key === "undefined") {
      return false;
    }

    var icon_data = {
      className: "waymark-marker waymark-marker-" + type.type_key,
    };

    //Shape
    if (
      typeof type.marker_shape !== "undefined" &&
      typeof type.marker_size !== "undefined"
    ) {
      icon_data.className += " waymark-marker-" + type.marker_shape;
      icon_data.className += " waymark-marker-" + type.marker_size;

      switch (type.marker_shape) {
        //Markers & Circles
        case "rectangle":
        case "circle":
        case "marker":
          //Size
          switch (type.marker_size) {
            case "small":
              icon_data.iconSize = [16, 16];

              break;
            case "medium":
              icon_data.iconSize = [25, 25];

              break;
            default:
            case "large":
              icon_data.iconSize = [32, 32];

              break;
          }

          break;
      }

      //Marker only
      if (type.marker_shape == "marker") {
        icon_data.iconAnchor = [
          icon_data.iconSize[0] / 2,
          icon_data.iconSize[1] * 1.25,
        ];
      }
    }

    //CSS Styles
    var background_css =
      "background:" + Waymark.get_marker_background(type.marker_colour) + ";";
    var icon_css = "color:" + type.icon_colour + ";";

    //HTML
    icon_data.html =
      '<div class="waymark-marker-background" style="' +
      background_css +
      '"></div>';

    // Ensure we have type.marker_icon
    if (typeof type.marker_icon === "undefined") {
      Waymark.debug(
        "No marker_icon for type: " + JSON.stringify(type),
        "alert",
      );
    }

    //Classes
    var icon_class = "waymark-marker-icon";

    //Text, HTML or Icon Name
    switch (type.icon_type) {
      //Text
      case "text":
        icon_class += " waymark-icon-text";

        icon_data.html +=
          '<div style="' +
          icon_css +
          '" class="' +
          icon_class +
          '">' +
          type.marker_icon +
          "</div>";

        break;

      //HTML
      case "html":
        icon_class += " waymark-icon-html";

        //Decode HTML entities using jQuery
        var icon_html = jQuery("<div/>").html(type.marker_icon).text();

        icon_data.html +=
          '<div class="' + icon_class + '">' + icon_html + "</div>";

        break;

      //Icon Name
      case "icon":
      default:
        icon_class += " waymark-icon-icon";

        //If Ionic Icons
        if (type.marker_icon.indexOf("ion-") === 0) {
          icon_class += " ion ";
          icon_class += " " + type.marker_icon;
          //Font Awesome
        } else if (type.marker_icon.indexOf("fa-") === 0) {
          icon_class += " fa";
          icon_class += " " + type.marker_icon;
          //Default to Ionic
        } else {
          icon_class += " ion";
          icon_class += " ion-" + type.marker_icon;
        }

        icon_data.html +=
          '<i style="' + icon_css + '" class="' + icon_class + '"></i>';

        break;
    }

    return icon_data;
  };

  this.build_type_heading = function (
    overlay_type = "marker",
    type_key = null,
  ) {
    Waymark = this;

    //Default to the first configured type
    if (type_key === null) {
      type_key = Waymark.get_type(overlay_type).type_key;
    }

    //Get Type
    const type = Waymark.get_type(overlay_type, type_key);

    if (!type) {
      Waymark.message("Type not found: " + type_key, "error");
    }

    // Defaults
    let text_color = "inherit";
    let background_color = type.shape_colour;

    // Switch
    switch (overlay_type) {
      case "marker":
        background_color = Waymark.get_marker_background(type.marker_colour);

        break;
      case "line":
        background_color = type.line_colour;

        break;

      case "shape":
        background_color = type.shape_colour;

        break;
    }

    if (type) {
      heading = `
				<div class="waymark-type-heading" style="background:${background_color}">
					${Waymark.type_preview(overlay_type, type)}
					${Waymark.type_to_text(overlay_type, type)}
				</div>
			`;
    }

    return heading;
  };

  this.type_preview = function (
    overlay_type = "marker",
    type = {},
    ele = "div",
  ) {
    Waymark = this;

    let out = `<${ele} class="waymark-type-preview waymark-${overlay_type}-type waymark-${overlay_type}-${type.type_key}">`;

    // By overlay type
    switch (overlay_type) {
      case "marker":
        // Get Icon Data
        const icon_data = Waymark.build_icon_data(type);

        // Add Icon
        out += `<div class="${icon_data.className}" style="width:${icon_data.iconSize[0]}px;height:${icon_data.iconSize[1]}px;">${icon_data.html}</div>`;

        break;
      case "line":
        out += Waymark.type_to_text(overlay_type, type, "span");

        break;

      case "shape":
        out += Waymark.type_to_text(overlay_type, type, "span");

        break;
    }

    out += `</${ele}>`;

    return out;
  };

  this.get_marker_background = function (colour) {
    var old_background_options = [
      "red",
      "darkred",
      "orange",
      "green",
      "darkgreen",
      "blue",
      "purple",
      "darkpurple",
      "cadetblue",
      "white",
      "black",
    ];

    //Convert
    if (old_background_options.includes(colour)) {
      switch (colour) {
        case "red":
          return "#da3d20";
          break;
        case "darkred":
          return "#a43233";
          break;
        case "orange":
          return "#f9960a";
          break;
        case "green":
          return "#70af00";
          break;
        case "darkgreen":
          return "#72820d";
          break;
        case "blue":
          return "#2aabe1";
          break;
        case "purple":
          return "#d553bd";
          break;
        case "darkpurple":
          return "#5c3a6e";
          break;
        case "cadetblue":
          return "#416979";
          break;
        case "white":
          return "#fbfbfb";
          break;
        case "black":
          return "#303030";
          break;
      }
    }

    return colour;
  };

  this.create_marker_json = function (lat_lng, properties = {}) {
    var marker_properties = Object.assign(
      {},
      Waymark.config.marker_data_defaults,
      properties,
    );

    var marker_json = {
      geometry: {
        type: "Point",
        coordinates: [lat_lng.lng, lat_lng.lat],
      },
      type: "Feature",
      properties: marker_properties,
    };

    return marker_json;
  };

  this.get_exif_latlng = function (data) {
    if (
      data.GPSLatitudeNum &&
      !isNaN(data.GPSLatitudeNum) &&
      data.GPSLongitudeNum &&
      !isNaN(data.GPSLongitudeNum)
    ) {
      Waymark.debug(Waymark.config.language.info_exif_yes);

      return L.latLng(data.GPSLatitudeNum, data.GPSLongitudeNum);
    } else {
      Waymark.debug(Waymark.config.language.info_exif_no);
    }

    return false;
  };

  this.get_image_sizes = function (data, fallback) {
    Waymark = this;

    var image_sizes = {};

    //Grab these
    for (var i in Waymark.config.image_size_names) {
      //Use fallback
      image_sizes["image_" + Waymark.config.image_size_names[i] + "_url"] =
        fallback;

      //We have the data we want
      if (
        typeof data[Waymark.config.image_size_names[i]] !== "undefined" &&
        typeof data[Waymark.config.image_size_names[i]]["url"] !== "undefined"
      ) {
        //Use it
        image_sizes["image_" + Waymark.config.image_size_names[i] + "_url"] =
          data[Waymark.config.image_size_names[i]]["url"];
      }
    }

    return image_sizes;
  };

  this.build_overlay_content = function (
    feature = [],
    feature_type = "",
    type_data = [],
  ) {
    Waymark = this;

    const has_title = feature.properties.title
      ? "waymark-overlay-has-title"
      : "";
    const has_desc = feature.properties.description
      ? "waymark-overlay-has-desc"
      : "";
    const has_image = feature.properties.image_large_url
      ? "waymark-overlay-has-image"
      : "";

    var content = `<div class="waymark-overlay-content ${has_title} ${has_desc} ${has_image} waymark-overlay-${feature_type}">`;

    //Expected Waymark properties
    const property_keys = ["type", "title", "description", "image_large_url"];
    //Iterate over each

    for (index in property_keys) {
      var property_key = property_keys[index];

      //Wrap in div
      content += `<div class="waymark-overlay-property waymark-overlay-property-${property_key}">`;

      switch (property_key) {
        //Type
        case "type":
          content += Waymark.type_to_text(feature_type, type_data);

          break;

        //Title
        case "title":
          content += feature.properties.title
            ? Waymark.escape_html(feature.properties.title)
            : "<em>Untitled " +
              Waymark.escape_html(type_data[feature_type + "_title"]) +
              " " +
              Waymark.escape_html(
                Waymark.config.language["object_label_" + feature_type],
              ) +
              "</em>";

          break;

        //Description
        case "description":
          var description = feature.properties.description;
          var safe_desc = Waymark.sanitize_description(description);

          //We have a description
          if (description) {
            //HTML
            if (description.indexOf("<") === 0) {
              content += safe_desc;
              //Plain text
            } else {
              content += `<p>${safe_desc}</p>`;
            }
          }

          break;

        //Image
        case "image_large_url":
          //We have an image
          if (!feature.properties.image_large_url) {
            break;
          }

          //Validate the URL
          if (!Waymark.is_safe_url(feature.properties.image_large_url)) {
            break;
          }

          //We have an image
          if (feature.properties.image_large_url) {
            //Use Medium if we have it
            var thumb_url = feature.properties.image_large_url;
            if (
              feature.properties.image_medium_url &&
              Waymark.is_safe_url(feature.properties.image_medium_url)
            ) {
              thumb_url = feature.properties.image_medium_url;
            }

            content += `<a href="${feature.properties.image_large_url}" target="_blank" style="background-image:url(${thumb_url})"></a>`;
          }

          break;
      }

      content += "</div>";
    }

    content += "</div>";

    return content;
  };

  this.load_done = function () {
    Waymark = this;

    // Calculate execution time
    let end_time = new Date().getTime();
    let execution_time = (end_time - Waymark.start_time) / 1000;

    Waymark.debug(
      "Waymark Loaded in " + execution_time.toFixed(3) + " seconds",
    );

    // Check for callback waymark_loaded_callback
    if (typeof waymark_loaded_callback === "function") {
      Waymark.debug(
        "Global Callback detected! waymark_loaded_callback(waymark_instance)",
      );

      // Call it
      waymark_loaded_callback(Waymark);
    } else {
      Waymark.debug("No Global Callback detected.");
    }
  };

  this.country_code_to_bounds = function (country_code = "") {
    let coords = [-140.99778, 41.6751050889, -52.6480987209, 83.23324];

    var country_bounding_boxes = {
      AF: [60.5284298033, 29.318572496, 75.1580277851, 38.4862816432],
      AO: [11.6400960629, -17.9306364885, 24.0799052263, -4.43802336998],
      AL: [19.3044861183, 39.624997667, 21.0200403175, 42.6882473822],
      AE: [51.5795186705, 22.4969475367, 56.3968473651, 26.055464179],
      AR: [-73.4154357571, -55.25, -53.628348965, -21.8323104794],
      AM: [43.5827458026, 38.7412014837, 46.5057198423, 41.2481285671],
      AQ: [-180.0, -90.0, 180.0, -63.2706604895],
      TF: [68.72, -49.775, 70.56, -48.625],
      AU: [113.338953078, -43.6345972634, 153.569469029, -10.6681857235],
      AT: [9.47996951665, 46.4318173285, 16.9796667823, 49.0390742051],
      AZ: [44.7939896991, 38.2703775091, 50.3928210793, 41.8606751572],
      BI: [29.0249263852, -4.49998341229, 30.752262811, -2.34848683025],
      BE: [2.51357303225, 49.5294835476, 6.15665815596, 51.4750237087],
      BJ: [0.772335646171, 6.14215770103, 3.79711225751, 12.2356358912],
      BF: [-5.47056494793, 9.61083486576, 2.17710778159, 15.1161577418],
      BD: [88.0844222351, 20.670883287, 92.6727209818, 26.4465255803],
      BG: [22.3805257504, 41.2344859889, 28.5580814959, 44.2349230007],
      BS: [-78.98, 23.71, -77.0, 27.04],
      BA: [15.7500260759, 42.65, 19.59976, 45.2337767604],
      BY: [23.1994938494, 51.3195034857, 32.6936430193, 56.1691299506],
      BZ: [-89.2291216703, 15.8869375676, -88.1068129138, 18.4999822047],
      BO: [-69.5904237535, -22.8729187965, -57.4983711412, -9.76198780685],
      BR: [-73.9872354804, -33.7683777809, -34.7299934555, 5.24448639569],
      BN: [114.204016555, 4.007636827, 115.450710484, 5.44772980389],
      BT: [88.8142484883, 26.7194029811, 92.1037117859, 28.2964385035],
      BW: [19.8954577979, -26.8285429827, 29.4321883481, -17.6618156877],
      CF: [14.4594071794, 2.2676396753, 27.3742261085, 11.1423951278],
      CA: [-140.99778, 41.6751050889, -52.6480987209, 83.23324],
      CH: [6.02260949059, 45.7769477403, 10.4427014502, 47.8308275417],
      CL: [-75.6443953112, -55.61183, -66.95992, -17.5800118954],
      CN: [73.6753792663, 18.197700914, 135.026311477, 53.4588044297],
      CI: [-8.60288021487, 4.33828847902, -2.56218950033, 10.5240607772],
      CM: [8.48881554529, 1.72767263428, 16.0128524106, 12.8593962671],
      CD: [12.1823368669, -13.2572266578, 31.1741492042, 5.25608775474],
      CG: [11.0937728207, -5.03798674888, 18.4530652198, 3.72819651938],
      CO: [-78.9909352282, -4.29818694419, -66.8763258531, 12.4373031682],
      CR: [-85.94172543, 8.22502798099, -82.5461962552, 11.2171192489],
      CU: [-84.9749110583, 19.8554808619, -74.1780248685, 23.1886107447],
      CY: [32.2566671079, 34.5718694118, 34.0048808123, 35.1731247015],
      CZ: [12.2401111182, 48.5553052842, 18.8531441586, 51.1172677679],
      DE: [5.98865807458, 47.3024876979, 15.0169958839, 54.983104153],
      DJ: [41.66176, 10.9268785669, 43.3178524107, 12.6996385767],
      DK: [8.08997684086, 54.8000145534, 12.6900061378, 57.730016588],
      DO: [-71.9451120673, 17.598564358, -68.3179432848, 19.8849105901],
      DZ: [-8.68439978681, 19.0573642034, 11.9995056495, 37.1183806422],
      EC: [-80.9677654691, -4.95912851321, -75.2337227037, 1.3809237736],
      EG: [24.70007, 22.0, 36.86623, 31.58568],
      ER: [36.3231889178, 12.4554157577, 43.0812260272, 17.9983074],
      ES: [-9.39288367353, 35.946850084, 3.03948408368, 43.7483377142],
      EE: [23.3397953631, 57.4745283067, 28.1316992531, 59.6110903998],
      ET: [32.95418, 3.42206, 47.78942, 14.95943],
      FI: [20.6455928891, 59.846373196, 31.5160921567, 70.1641930203],
      FJ: [-180.0, -18.28799, 180.0, -16.0208822567],
      FK: [-61.2, -52.3, -57.75, -51.1],
      FR: [-54.5247541978, 2.05338918702, 9.56001631027, 51.1485061713],
      GA: [8.79799563969, -3.97882659263, 14.4254557634, 2.32675751384],
      GB: [-7.57216793459, 49.959999905, 1.68153079591, 58.6350001085],
      GE: [39.9550085793, 41.0644446885, 46.6379081561, 43.553104153],
      GH: [-3.24437008301, 4.71046214438, 1.0601216976, 11.0983409693],
      GN: [-15.1303112452, 7.3090373804, -7.83210038902, 12.5861829696],
      GM: [-16.8415246241, 13.1302841252, -13.8449633448, 13.8764918075],
      GW: [-16.6774519516, 11.0404116887, -13.7004760401, 12.6281700708],
      GQ: [9.3056132341, 1.01011953369, 11.285078973, 2.28386607504],
      GR: [20.1500159034, 34.9199876979, 26.6041955909, 41.8269046087],
      GL: [-73.297, 60.03676, -12.20855, 83.64513],
      GT: [-92.2292486234, 13.7353376327, -88.2250227526, 17.8193260767],
      GY: [-61.4103029039, 1.26808828369, -56.5393857489, 8.36703481692],
      HN: [-89.3533259753, 12.9846857772, -83.147219001, 16.0054057886],
      HR: [13.6569755388, 42.47999136, 19.3904757016, 46.5037509222],
      HT: [-74.4580336168, 18.0309927434, -71.6248732164, 19.9156839055],
      HU: [16.2022982113, 45.7594811061, 22.710531447, 48.6238540716],
      ID: [95.2930261576, -10.3599874813, 141.03385176, 5.47982086834],
      IN: [68.1766451354, 7.96553477623, 97.4025614766, 35.4940095078],
      IE: [-9.97708574059, 51.6693012559, -6.03298539878, 55.1316222195],
      IR: [44.1092252948, 25.0782370061, 63.3166317076, 39.7130026312],
      IQ: [38.7923405291, 29.0990251735, 48.5679712258, 37.3852635768],
      IS: [-24.3261840479, 63.4963829617, -13.609732225, 66.5267923041],
      IL: [34.2654333839, 29.5013261988, 35.8363969256, 33.2774264593],
      IT: [6.7499552751, 36.619987291, 18.4802470232, 47.1153931748],
      JM: [-78.3377192858, 17.7011162379, -76.1996585761, 18.5242184514],
      JO: [34.9226025734, 29.1974946152, 39.1954683774, 33.3786864284],
      JP: [129.408463169, 31.0295791692, 145.543137242, 45.5514834662],
      KZ: [46.4664457538, 40.6623245306, 87.3599703308, 55.3852501491],
      KE: [33.8935689697, -4.67677, 41.8550830926, 5.506],
      KG: [69.464886916, 39.2794632025, 80.2599902689, 43.2983393418],
      KH: [102.3480994, 10.4865436874, 107.614547968, 14.5705838078],
      KR: [126.117397903, 34.3900458847, 129.468304478, 38.6122429469],
      KW: [46.5687134133, 28.5260627304, 48.4160941913, 30.0590699326],
      LA: [100.115987583, 13.88109101, 107.564525181, 22.4647531194],
      LB: [35.1260526873, 33.0890400254, 36.6117501157, 34.6449140488],
      LR: [-11.4387794662, 4.35575511313, -7.53971513511, 8.54105520267],
      LY: [9.31941084152, 19.58047, 25.16482, 33.1369957545],
      LK: [79.6951668639, 5.96836985923, 81.7879590189, 9.82407766361],
      LS: [26.9992619158, -30.6451058896, 29.3251664568, -28.6475017229],
      LT: [21.0558004086, 53.9057022162, 26.5882792498, 56.3725283881],
      LU: [5.67405195478, 49.4426671413, 6.24275109216, 50.1280516628],
      LV: [21.0558004086, 55.61510692, 28.1767094256, 57.9701569688],
      MA: [-17.0204284327, 21.4207341578, -1.12455115397, 35.7599881048],
      MD: [26.6193367856, 45.4882831895, 30.0246586443, 48.4671194525],
      MG: [43.2541870461, -25.6014344215, 50.4765368996, -12.0405567359],
      MX: [-117.12776, 14.5388286402, -86.811982388, 32.72083],
      MK: [20.46315, 40.8427269557, 22.9523771502, 42.3202595078],
      ML: [-12.1707502914, 10.0963607854, 4.27020999514, 24.9745740829],
      MM: [92.3032344909, 9.93295990645, 101.180005324, 28.335945136],
      ME: [18.45, 41.87755, 20.3398, 43.52384],
      MN: [87.7512642761, 41.5974095729, 119.772823928, 52.0473660345],
      MZ: [30.1794812355, -26.7421916643, 40.7754752948, -10.3170960425],
      MR: [-17.0634232243, 14.6168342147, -4.92333736817, 27.3957441269],
      MW: [32.6881653175, -16.8012997372, 35.7719047381, -9.23059905359],
      MY: [100.085756871, 0.773131415201, 119.181903925, 6.92805288332],
      NA: [11.7341988461, -29.045461928, 25.0844433937, -16.9413428687],
      NC: [164.029605748, -22.3999760881, 167.120011428, -20.1056458473],
      NE: [0.295646396495, 11.6601671412, 15.9032466977, 23.4716684026],
      NG: [2.69170169436, 4.24059418377, 14.5771777686, 13.8659239771],
      NI: [-87.6684934151, 10.7268390975, -83.147219001, 15.0162671981],
      NL: [3.31497114423, 50.803721015, 7.09205325687, 53.5104033474],
      NO: [4.99207807783, 58.0788841824, 31.29341841, 80.6571442736],
      NP: [80.0884245137, 26.3978980576, 88.1748043151, 30.4227169866],
      NZ: [166.509144322, -46.641235447, 178.517093541, -34.4506617165],
      OM: [52.0000098, 16.6510511337, 59.8080603372, 26.3959343531],
      PK: [60.8742484882, 23.6919650335, 77.8374507995, 37.1330309108],
      PA: [-82.9657830472, 7.2205414901, -77.2425664944, 9.61161001224],
      PE: [-81.4109425524, -18.3479753557, -68.6650797187, -0.0572054988649],
      PH: [117.17427453, 5.58100332277, 126.537423944, 18.5052273625],
      PG: [141.000210403, -10.6524760881, 156.019965448, -2.50000212973],
      PL: [14.0745211117, 49.0273953314, 24.0299857927, 54.8515359564],
      PR: [-67.2424275377, 17.946553453, -65.5910037909, 18.5206011011],
      KP: [124.265624628, 37.669070543, 130.780007359, 42.9853868678],
      PT: [-9.52657060387, 36.838268541, -6.3890876937, 42.280468655],
      PY: [-62.6850571357, -27.5484990374, -54.2929595608, -19.3427466773],
      QA: [50.7439107603, 24.5563308782, 51.6067004738, 26.1145820175],
      RO: [20.2201924985, 43.6884447292, 29.62654341, 48.2208812526],
      RU: [-180.0, 41.151416124, 180.0, 81.2504],
      RW: [29.0249263852, -2.91785776125, 30.8161348813, -1.13465911215],
      SA: [34.6323360532, 16.3478913436, 55.6666593769, 32.161008816],
      SD: [21.93681, 8.61972971293, 38.4100899595, 22.0],
      SS: [23.8869795809, 3.50917, 35.2980071182, 12.2480077571],
      SN: [-17.6250426905, 12.332089952, -11.4678991358, 16.5982636581],
      SB: [156.491357864, -10.8263672828, 162.398645868, -6.59933847415],
      SL: [-13.2465502588, 6.78591685631, -10.2300935531, 10.0469839543],
      SV: [-90.0955545723, 13.1490168319, -87.7235029772, 14.4241327987],
      SO: [40.98105, -1.68325, 51.13387, 12.02464],
      RS: [18.82982, 42.2452243971, 22.9860185076, 46.1717298447],
      SR: [-58.0446943834, 1.81766714112, -53.9580446031, 6.0252914494],
      SK: [16.8799829444, 47.7584288601, 22.5581376482, 49.5715740017],
      SI: [13.6981099789, 45.4523163926, 16.5648083839, 46.8523859727],
      SE: [11.0273686052, 55.3617373725, 23.9033785336, 69.1062472602],
      SZ: [30.6766085141, -27.2858794085, 32.0716654803, -25.660190525],
      SY: [35.7007979673, 32.312937527, 42.3495910988, 37.2298725449],
      TD: [13.5403935076, 7.42192454674, 23.88689, 23.40972],
      TG: [-0.0497847151599, 5.92883738853, 1.86524051271, 11.0186817489],
      TH: [97.3758964376, 5.69138418215, 105.589038527, 20.4178496363],
      TJ: [67.4422196796, 36.7381712916, 74.9800024759, 40.9602133245],
      TM: [52.5024597512, 35.2706639674, 66.5461503437, 42.7515510117],
      TL: [124.968682489, -9.39317310958, 127.335928176, -8.27334482181],
      TT: [-61.95, 10.0, -60.895, 10.89],
      TN: [7.52448164229, 30.3075560572, 11.4887874691, 37.3499944118],
      TR: [26.0433512713, 35.8215347357, 44.7939896991, 42.1414848903],
      TW: [120.106188593, 21.9705713974, 121.951243931, 25.2954588893],
      TZ: [29.3399975929, -11.7209380022, 40.31659, -0.95],
      UG: [29.5794661801, -1.44332244223, 35.03599, 4.24988494736],
      UA: [22.0856083513, 44.3614785833, 40.0807890155, 52.3350745713],
      UY: [-58.4270741441, -34.9526465797, -53.209588996, -30.1096863746],
      US: [-171.791110603, 18.91619, -66.96466, 71.3577635769],
      UZ: [55.9289172707, 37.1449940049, 73.055417108, 45.5868043076],
      VE: [-73.3049515449, 0.724452215982, -59.7582848782, 12.1623070337],
      VN: [102.170435826, 8.59975962975, 109.33526981, 23.3520633001],
      VU: [166.629136998, -16.5978496233, 167.844876744, -14.6264970842],
      PS: [34.9274084816, 31.3534353704, 35.5456653175, 32.5325106878],
      YE: [42.6048726743, 12.5859504257, 53.1085726255, 19.0000033635],
      ZA: [16.3449768409, -34.8191663551, 32.830120477, -22.0913127581],
      ZM: [21.887842645, -17.9612289364, 33.4856876971, -8.23825652429],
      ZW: [25.2642257016, -22.2716118303, 32.8498608742, -15.5077869605],
    };

    if (country_bounding_boxes[country_code]) {
      coords = country_bounding_boxes[country_code];
    } else {
      // Pick random country
      var keys = Object.keys(country_bounding_boxes);
      var random_key = keys[Math.floor(Math.random() * keys.length)];

      coords = country_bounding_boxes[random_key];
    }

    // Convert into Leaflet LatLngBounds
    return Waymark_L.latLngBounds(
      [coords[1], coords[0]],
      [coords[3], coords[2]],
    );
  };

  this.clear_json = function () {
    Waymark = this;

    // Iterate over data layer
    Waymark.map_data.eachLayer(function (layer) {
      // Remove it
      Waymark.map.removeLayer(layer);
      Waymark.map_data.removeLayer(layer);

      // Direction layer?
      if (typeof layer.direction_layer === "object") {
        Waymark.map.removeLayer(layer.direction_layer);
      }
    });

    Waymark.map_data.clearLayers();
  };

  /*
	==================================
	======== ABSTRACT METHODS ========
	==================================
*/

  this.pre_map_setup = function () {};
  this.init_done = function () {};
  this.info_window = function (layer_type, feature, layer) {};
  this.build_content = function (layer_type, feature) {};
}

/*
	==================================
	============= VIEWER =============
	==================================
*/

function Waymark_Map_Viewer() {
  this.gallery_images = [];

  this.pre_map_setup = function () {
    Waymark = this;

    Waymark.mode = "view";
  };

  this.init_done = function () {
    Waymark = this;

    //Show!
    Waymark.jq_map_container.show();
    Waymark.map.invalidateSize();
    Waymark.config.map_options.map_width = Waymark.jq_map_container.width();

    //Gallery
    Waymark.setup_gallery();

    //Elevation
    Waymark.setup_elevation();

    //Clustering
    Waymark.setupCluster();

    jQuery(Waymark.map.getContainer()).addClass("waymark-is-viewer");

    //Hidden? (i.e. display:none)
    Waymark.setup_hidden_checker();
  };

  this.setupCluster = () => {
    if (!parseInt(Waymark.config.viewer_options.show_cluster)) {
      return;
    }

    // Add Cluster Class
    Waymark.jq_map_container.addClass("waymark-has-cluster");

    //Fix - https://github.com/Leaflet/Leaflet.markercluster/issues/611#issuecomment-277670244
    Waymark.map._layersMaxZoom = 18;

    // Create Marker Cluster
    Waymark.marker_cluster = L.markerClusterGroup({
      animate: false,
      showCoverageOnHover: false,
      removeOutsideVisibleBounds: true,
      iconCreateFunction: this.clusterIconFunction,
      spiderfyOnMaxZoom: false,
      disableClusteringAtZoom: Waymark.config.viewer_options.cluster_threshold,
      maxClusterRadius: Waymark.config.viewer_options.cluster_radius,
    });

    // Make Marker Cluster the parent group for all markers
    Waymark.marker_parent_group = Waymark.marker_cluster;

    // Add Cluster to Map
    Waymark.map.addLayer(Waymark.marker_cluster);
  };

  this.clusterIconFunction = (cluster) => {
    const clusterTypes = new Map([]);

    // Each Marker
    cluster.getAllChildMarkers().forEach((marker) => {
      // Get data
      const typeKey = marker.feature.properties.type;
      const typeData = Waymark.get_type("marker", typeKey);

      // Keep Count
      if (!clusterTypes.has(typeKey)) {
        typeData.typeCount = 1;
      } else {
        typeData.typeCount = clusterTypes.get(typeKey).typeCount + 1;
      }

      typeData.iconData = Waymark.build_icon_data(typeData);
      clusterTypes.set(typeKey, typeData);
    });

    //Build HTML
    let clusterHTML = ``;

    let index = 0;
    let maxWidth = 0;
    let maxHeight = 0;

    // Iterate over each cluster type, ordered by count
    [...clusterTypes.entries()]
      .sort((a, b) => b[1].typeCount - a[1].typeCount)
      .forEach(([typeKey, typeData]) => {
        const count = typeData.typeCount;
        const data = typeData.iconData;
        const indexReversed = clusterTypes.size - index;

        maxWidth = data.iconSize[0] > maxWidth ? data.iconSize[0] : maxWidth;
        maxHeight = data.iconSize[0] > maxHeight ? data.iconSize[0] : maxHeight;

        //Append count?
        if (count > 1) {
          data.html += `<div class="waymark-cluster-count">${Waymark.format_number(count, 0)}</div>`;
        }

        const left = index * 8;

        clusterHTML += `
				<div 
					class="${data.className}" 
					style="
						left:${left}px;
						z-index:${indexReversed};
						height:${data.iconSize[1]}px;
						width:${data.iconSize[0]}px;
						height:${data.iconSize[1]}px;
					"
				>
					${data.html}					
				</div>
			`;

        index++;
      });

    return L.divIcon({
      className: "waymark-cluster",
      html: clusterHTML,
      iconSize: [maxWidth, maxHeight],
    });
  };

  //Initally hidden?
  this.setup_hidden_checker = function () {
    let hidden_checker = setInterval(function () {
      is_hidden = Waymark.jq_map_container.is(":hidden");

      if (!is_hidden) {
        Waymark.reset_map_view();

        clearInterval(hidden_checker);
      }
    }, 100);
  };

  this.create_buttons = function () {};

  //Add GeoJSON to map
  this.load_json = function (json, reset_view = true) {
    Waymark = this;

    //Must be a vaid object with features
    if (typeof json === "object" && typeof json.features !== "undefined") {
      //Add data
      Waymark.map_data.addData(json);

      //Reset view?
      if (reset_view) {
        Waymark.reset_map_view();
      }
    }
  };

  this.reset_map_view = function () {
    Waymark = this;

    let init_latlng = Waymark.config.map_options.map_init_latlng;
    let init_zoom = Waymark.config.map_options.map_init_zoom;

    // If undefined, set as false
    if (typeof init_latlng === "undefined") {
      init_latlng = false;
    }
    if (typeof init_zoom === "undefined") {
      init_zoom = false;
    }

    //No view specified
    if (!init_latlng && !init_zoom) {
      //Use data layer bounds (if we have)
      var bounds = Waymark.map_data.getBounds();
      if (typeof bounds === "object" && bounds.isValid()) {
        Waymark.map.invalidateSize();

        Waymark.map.fitBounds(bounds);
      }
      //Both zoom AND centre specified
    } else if (init_latlng && init_zoom) {
      //Use them
      Waymark.map.setView(init_latlng, init_zoom);
      //Either zoom or centre specified
    } else {
      //Centre specified
      if (init_latlng) {
        Waymark.map.setView(init_latlng);

        //Use data layer for zoom
        Waymark.map.setZoom(
          Waymark.map.getBoundsZoom(Waymark.map_data.getBounds()),
        );
      }

      //Zoom specified
      if (init_zoom) {
        Waymark.map.setZoom(init_zoom);

        //Use data layer for centre
        Waymark.map.setView(Waymark.map_data.getBounds().getCenter());
      }
    }
  };

  this.build_content = function (layer_type, feature) {
    Waymark = this;

    var content = jQuery("<div />");
    var list = jQuery("<ul />").addClass(
      "waymark-info waymark-" + layer_type + "-info",
    );

    //Expected Waymark properties
    for (key in Waymark.config[layer_type + "_data_defaults"]) {
      var ele = null;

      switch (key) {
        case "title":
          var title = feature.properties.title;

          //We have a title
          if (title) {
            ele = jQuery("<strong />").text(feature.properties.title);
            //No description
          } else {
            ele = jQuery("<strong />").html("&nbsp;");
            list.addClass("waymark-no-title");
          }

          break;
        case "type":
          //Get type
          var type = Waymark.get_type(layer_type, feature.properties.type);
          if (type) {
            ele = Waymark.type_to_text(layer_type, type, "small");
          }

          break;

        case "description":
          var description = feature.properties.description;
          var safe_desc = Waymark.sanitize_description(description);

          //We have a description
          if (description) {
            //HTML
            if (description.indexOf("<") === 0) {
              ele = safe_desc;
              //Plain text
            } else {
              ele = jQuery("<p />").html(safe_desc);
            }
            //No description
          } else {
            list.addClass("waymark-no-description");
          }

          break;
        case "image_large_url":
          //We have an image
          if (typeof feature.properties.image_large_url !== "undefined") {
            //Validate the URL
            if (!Waymark.is_safe_url(feature.properties.image_large_url)) {
              list.addClass("waymark-no-image");
              break;
            }

            //Use Medium if we have it
            var thumb_url = feature.properties.image_large_url;
            if (
              typeof feature.properties.image_medium_url !== "undefined" &&
              Waymark.is_safe_url(feature.properties.image_medium_url)
            ) {
              var thumb_url = feature.properties.image_medium_url;
            }

            ele = jQuery("<a />").attr({
              href: feature.properties.image_large_url,
              target: "_blank",
              style: "background-image:url(" + thumb_url + ")",
            });
            //We don't have an image
          } else {
            list.addClass("waymark-no-image");
          }

          break;
      }

      if (ele) {
        list.append(
          jQuery("<li />")
            .addClass(
              "waymark-info-" + key + " waymark-" + layer_type + "-info-" + key,
            )
            .append(ele),
        );
      }
    }

    if (list.children().length) {
      content.append(list);
    }

    return content;
  };

  this.info_window = function (layer_type, feature, layer) {
    Waymark = this;

    //Show elevation for Line?
    if (
      parseInt(Waymark.config.viewer_options.show_elevation) &&
      layer_type == "line"
    ) {
      //Has elevation data, but nothing displayed yet
      if (
        parseInt(Waymark.config.viewer_options.elevation_initial) &&
        Waymark.line_has_elevation_data(feature) &&
        !Waymark.elevation_container.is(":visible")
      ) {
        //Show it!
        Waymark.elevation_container.show();
        Waymark.elevation_control.loadData(feature);
      }

      jQuery(layer).on("click", { W: Waymark }, function (e) {
        var W = e.data.W;
        var feature = e.target.feature;

        //Clear chart
        W.elevation_control.clear();

        //Clear Map layer
        if (typeof W.elevation_control.layer !== "undefined") {
          W.elevation_control.layer.removeFrom(W.map);
        }

        //Feature has elevation data
        W.elevation_container.hide();
        if (W.line_has_elevation_data(feature)) {
          W.elevation_container.show();

          W.elevation_control.loadData(feature);
        }
      });
    }

    //If only Title to display
    if (
      typeof feature.properties.description == "undefined" &&
      typeof feature.properties.image_large_url == "undefined"
    ) {
      //Don't show info window
      return;
    }

    //Build content
    var content = Waymark.build_content(layer_type, feature, layer);
    var title = feature.properties.title;

    //Bind content to info window
    layer.bindPopup(content.get(0)).openPopup();
  };

  this.line_has_elevation_data = function (feature) {
    if (feature.geometry.type == "MultiLineString") {
      //Each line
      for (var i in feature.geometry.coordinates) {
        //Each point
        for (var j in feature.geometry.coordinates[i]) {
          //If has elevation data
          if (feature.geometry.coordinates[i][j].length == 3) {
            return true;
          }
        }
      }
    } else {
      //Each point
      for (var j in feature.geometry.coordinates) {
        //If has elevation data
        if (feature.geometry.coordinates[j].length == 3) {
          return true;
        }
      }
    }

    return false;
  };

  this.setup_elevation = function () {
    Waymark = this;

    if (!Waymark.config.viewer_options.show_elevation) {
      return;
    }

    Waymark.debug("Setting up Elevation Control");

    //Number formatting
    Waymark_L.numberLocale =
      Waymark.config.locale || document.documentElement.lang || null;

    //Localize
    const total_length = Waymark.escape_html(
      Waymark.config.language.label_total_length,
    );
    const max_elevation = Waymark.escape_html(
      Waymark.config.language.label_max_elevation,
    );
    const min_elevation = Waymark.escape_html(
      Waymark.config.language.label_min_elevation,
    );
    const ascent = Waymark.escape_html(Waymark.config.language.label_ascent);
    const descent = Waymark.escape_html(Waymark.config.language.label_descent);

    Waymark_L.registerLocale("waymark", {
      "Total Length: ": total_length + " ",
      "Total Length:": total_length,
      "Max Elevation: ": max_elevation + " ",
      "Max Elevation:": max_elevation,
      "Min Elevation: ": min_elevation + " ",
      "Min Elevation:": min_elevation,
      "Total Ascent: ": ascent + " ",
      "Total Ascent:": ascent,
      "Total Descent: ": descent + " ",
      "Total Descent:": descent,
      Altitude: Waymark.config.language.label_altitude,
      Download: Waymark.escape_html(Waymark.config.language.label_download),
    });
    Waymark_L.setLocale("waymark");

    //Create config
    var config = {
      theme: "magenta-theme",
      detached: true,
      followMarker: false,
      width: Waymark.config.map_options.map_width,
    };

    // Add Inline stylsheet for colours
    // Needs to target both map and elevation divs by ID
    const elevation_css = `
			div#${Waymark.config.map_options.map_div_id} .elevation-polyline { stroke: ${Waymark.config.viewer_options.elevation_colour} !important; }
			div#${Waymark.config.viewer_options.elevation_div_id} .elevation-control.elevation .area { fill: ${Waymark.config.viewer_options.elevation_colour} !important; }
		`;

    // Append to head
    jQuery("head").append(`<style type="text/css">${elevation_css}</style>`);

    //Container
    if (typeof Waymark.config.viewer_options.elevation_div_id !== "undefined") {
      config.elevationDiv =
        "#" + Waymark.config.viewer_options.elevation_div_id;

      // Check if container exists
      Waymark.elevation_container = jQuery(config.elevationDiv);

      // Create if it doesn't exist
      if (!Waymark.elevation_container.length) {
        Waymark.debug("Creating Elevation Container");

        // Attached
        config.width = Waymark.config.map_options.map_width / 2;

        Waymark.elevation_container = jQuery("<div />")
          .attr("id", Waymark.config.viewer_options.elevation_div_id)
          .appendTo(Waymark.jq_map_container);
      }

      Waymark.elevation_container
        .addClass("waymark-elevation-container")
        .hide();

      //Close
      var elevation_close = jQuery("<span />")
        .addClass("waymark-elevation-close")
        .text("x")
        .on("click", { W: Waymark }, function (e) {
          var W = e.data.W;

          W.elevation_control.clear();
          if (typeof W.elevation_control.layer !== "undefined") {
            W.elevation_control.layer.removeFrom(W.map);
          }

          W.elevation_container.hide();
        });
      Waymark.elevation_container.append(elevation_close);
    }

    //Units
    const imperial_units =
      typeof Waymark.config.viewer_options.elevation_units !== "undefined" &&
      Waymark.config.viewer_options.elevation_units == "imperial";

    if (imperial_units) {
      config.imperial = true;
    }

    config.xLabel = Waymark.escape_html(
      Waymark.config.language[
        imperial_units ? "label_unit_mi" : "label_unit_km"
      ],
    );
    config.yLabel = Waymark.escape_html(
      Waymark.config.language[
        imperial_units ? "label_unit_ft" : "label_unit_m"
      ],
    );

    //Create elevation control
    Waymark.elevation_control = Waymark_L.control
      .elevation(config)
      .addTo(Waymark.map);

    //Close elevation?
    Waymark.map.on("overlayremove", function (e) {
      if (typeof Waymark.elevation_control.layer !== "undefined") {
        var lat_lngs = null;

        //Active Elevation Line
        Waymark.elevation_control.layer.eachLayer(function (layer) {
          lat_lngs = JSON.stringify(layer.getLatLngs());
        });

        //Valid Line to compare
        if (lat_lngs) {
          //Each layer being closed
          e.layer.eachLayer(function (layer) {
            if (typeof layer.getLatLngs !== "undefined") {
              //Compare against active elevation
              if (lat_lngs == JSON.stringify(layer.getLatLngs())) {
                Waymark.elevation_control.clear();
                Waymark.elevation_control.layer.removeFrom(Waymark.map);
                Waymark.elevation_container.hide();
              }
            }
          });
        }
      }
    });
  };

  this.setup_gallery = function () {
    Waymark = this;

    //Only if enabled
    if (!parseInt(Waymark.config.viewer_options.show_gallery)) {
      return;
    }

    //Create gallery
    Waymark.gallery = jQuery("<div />")
      .attr("id", Waymark.config.viewer_options.gallery_div_id)
      .css("width", Waymark.config.map_options.map_width)
      .addClass("waymark-gallery-container")
      .html("");

    //Needed to open marker info
    Waymark_L.DomEvent.disableClickPropagation(Waymark.gallery.get(0));

    jQuery(Waymark.map.getContainer()).append(Waymark.gallery);

    Waymark.size_gallery();

    //Redraw on pan zoom
    var W = Waymark;
    Waymark.map.on(
      "moveend",
      function () {
        W.render_gallery();
      },
      { W: W },
    );

    //Redraw when layers are added/removed
    Waymark.map.on(
      "layerremove layeradd",
      function () {
        W.render_gallery();
      },
      { W: W },
    );
  };

  this.size_gallery = function () {
    Waymark = this;

    //Only size gallery if there is one
    if (typeof Waymark.gallery === "undefined" || !Waymark.gallery.length) {
      return;
    }

    gallery_padding = Waymark.gallery.css("paddingRight");
    gallery_padding = gallery_padding.replace("px", "");
    gallery_padding = parseInt(gallery_padding);
    var gallery_width =
      Waymark.config.map_options.map_width - 2 * gallery_padding;

    Waymark.gallery.css("width", gallery_width);
  };

  this.add_to_gallery = function (layer) {
    Waymark = this;

    //Ensure we have an image
    if (
      typeof layer.feature.properties.image_thumbnail_url === "undefined" ||
      typeof layer.feature.properties.image_large_url === "undefined"
    ) {
      return false;
    }

    //Clone data
    var image = Object.assign({}, layer.feature.properties);

    //Set data
    image.latlng = layer.feature.geometry.coordinates;
    image.marker = layer;

    //Add to gallery
    Waymark.gallery_images.push(image);
  };

  this.render_gallery = function () {
    Waymark = this;

    var in_bounds_count = 0;

    //Only create gallery if there is a container
    if (typeof Waymark.gallery === "undefined" || !Waymark.gallery.length) {
      return;
    }

    //Empty first
    Waymark.gallery.html("");
    Waymark.gallery.hide();
    jQuery(Waymark.map.getContainer()).removeClass("waymark-has-gallery");

    //If we have images
    if (Waymark.gallery_images.length) {
      for (i = 0; i < Waymark.gallery_images.length; i++) {
        var image = Waymark.gallery_images[i];

        // Check the Map by default
        let checkLayer = Waymark.map;

        // If we are clustering
        if (
          parseInt(Waymark.config.viewer_options.show_cluster) &&
          typeof Waymark.marker_cluster === "object"
        ) {
          // Check that
          checkLayer = Waymark.marker_cluster;
        }

        //If visible AND active on map
        if (
          Waymark.map.getBounds().contains(image.marker.getLatLng()) &&
          checkLayer.hasLayer(image.marker)
        ) {
          //Only show images with valid URLs
          if (Waymark.is_safe_url(image.image_thumbnail_url)) {
            in_bounds_count++;

            var div = jQuery("<div />")
              .addClass("waymark-image")

              //When a gallery image is clicked
              .on("click", { marker: image.marker }, function (e) {
                var marker = e.data.marker;

                //Zoom in
                Waymark.map.setView(marker.getLatLng(), 16);

                //Open popup at marker
                marker.openPopup();
              });

            var img = jQuery("<img />").attr({
              src: image.image_thumbnail_url,
            });
            div.append(img);

            Waymark.gallery.append(div);
          }
        }
      }

      //If not empty
      if (in_bounds_count) {
        Waymark.gallery.show();
        jQuery(Waymark.map.getContainer()).addClass("waymark-has-gallery");
      }
    }
  };
}

/*
	==================================
	============= EDITOR =============
	==================================
*/

function Waymark_Map_Editor() {
  /*
		==================================
		============= ABSTRACT ===========
		==================================
	*/

  this.pre_map_setup = function () {
    Waymark = this;

    Waymark.mode = "edit";
  };

  this.init_done = function () {
    Waymark = this;

    //This is the editor
    Waymark.jq_map_container.addClass("waymark-is-editor");

    // Set up data container
    const data_div_id = Waymark.config.editor_options.data_div_id;
    Waymark.jq_data_container = jQuery("#" + data_div_id);

    //Data container found
    if (Waymark.jq_data_container.length) {
      // Get existing data
      const map_data = Waymark.jq_data_container.val();

      // Ensure is valid GeoJSON
      try {
        // Parse
        const parsed_data = JSON.parse(map_data);

        // Load
        Waymark.load_json(parsed_data);

        Waymark.debug(
          `Data container (#${data_div_id}) found, valid GeoJSON added to Map.`,
        );
      } catch (error) {
        Waymark.debug(
          `Data container (#${data_div_id}) found, but not valid GeoJSON.`,
        );
      }
      // Data container not found
    } else {
      // Add to map container

      Waymark.debug(
        `Data container (#${data_div_id}) not found, adding to DOM.`,
      );

      Waymark.jq_data_container = jQuery("<textarea />")
        .attr({
          id: data_div_id,
          name: "map_data",
        })
        .addClass("waymark-input waymark-input-map_data")
        .appendTo(Waymark.jq_map_container);
    }

    //Add loading
    Waymark.jq_map_container.append(
      jQuery("<div />")
        .attr({
          id: "waymark-loading",
        })
        .html('<div class="waymark-spinner"></div>'),
    );

    //Every time a layer is created
    Waymark.map.on("editable:drawing:commit", function (e) {
      layer = e.layer;

      //Initialize feature
      if (typeof layer.feature == "undefined") {
        layer.feature = {
          type: "Feature",
          properties: {},
        };
      }

      //Use default type data
      switch (true) {
        case layer instanceof Waymark_L.Circle:
          layer.feature.properties = Waymark.config.shape_data_defaults;

          //Set radius
          layer.feature.properties.radius = layer.getRadius();

          break;
        case layer instanceof Waymark_L.Rectangle:
          layer.feature.properties = Waymark.config.shape_data_defaults;

          //Remember that this is a rectangle, not any old polygon
          layer.feature.properties.rectangle = true;

          break;
        case layer instanceof Waymark_L.Polygon:
          layer.feature.properties = Waymark.config.shape_data_defaults;

          break;

        case layer instanceof Waymark_L.Polyline:
          layer.feature.properties = Waymark.config.line_data_defaults;

          break;
      }

      //Add to data layer
      Waymark.map_data.addData(layer.toGeoJSON());

      //We're done with this now
      Waymark.map.removeLayer(layer);

      //Save
      Waymark.map_was_edited();
    });

    //Every time a layer is edited
    Waymark.map.on("editable:editing", function (e) {
      layer = e.layer;

      //Circle?
      if (
        typeof layer.feature !== "undefined" &&
        layer.feature.properties.radius
      ) {
        layer.feature.properties.radius = layer.getRadius();
      }

      Waymark.map_was_edited();
    });
  };

  this.create_marker = function (latlng) {
    Waymark = this;

    //Create marker
    var marker = Waymark_L.marker(latlng, { draggable: true });

    //Dragged
    marker.on("moveend", function (e) {
      var layer = e.target;
      var feature = layer.feature;

      //Update feature with new coordinates
      feature.geometry.coordinates = [
        Number(layer._latlng.lng.toFixed(6)),
        Number(layer._latlng.lat.toFixed(6)),
      ];

      //Update content to reflect change in position
      Waymark.info_window("marker", feature, layer);

      Waymark.map_was_edited();
    });

    return marker;
  };

  //Update meta field
  this.save_data_layer = function () {
    Waymark = this;

    //Map Data
    var map_data_string = JSON.stringify(Waymark.map_data.toGeoJSON());

    //Update custom field form
    Waymark.jq_data_container.val(map_data_string);
  };

  //Something was edited
  this.map_was_edited = function () {
    Waymark = this;

    // Save... always save!
    Waymark.save_data_layer();
  };

  this.loading_start = function () {
    Waymark = this;

    Waymark.jq_map_container.addClass("waymark-loading");
  };

  this.loading_stop = function () {
    Waymark = this;

    Waymark.jq_map_container.removeClass("waymark-loading");
  };

  this.create_buttons = function () {
    Waymark = this;

    //Geocoder
    var geocoder_options = {
      position: "bottomright",
      defaultMarkGeocode: false,
      placeholder: Waymark.config.language.action_search_placeholder,
      errorMessage: Waymark.escape_html(Waymark.config.language.error_geocoder),
    };

    if (Waymark.config.locale) {
      geocoder_options.geocodingQueryParams = {
        "accept-language": Waymark.config.locale,
      };
    }

    var geocoder = Waymark_L.Control.geocoder(geocoder_options);
    geocoder.on("markgeocode", function (e) {
      Waymark.map.fitBounds(e.geocode.bbox);
    });
    geocoder.addTo(Waymark.map);

    //Edit Toolbar
    var edit_toolbar_control = Waymark_L.Control.extend({
      options: {
        position: "bottomleft",
      },
      onAdd: function (map) {
        var toolbar = Waymark_L.DomUtil.create(
          "div",
          "leaflet-bar leaflet-control waymark-leaflet-control waymark-edit-toolbar",
        );

        //Line
        var button = Waymark_L.DomUtil.create(
          "a",
          "waymark-icon waymark-edit-button waymark-edit-line",
          toolbar,
        );
        button.setAttribute("title", Waymark.config.language.add_line_title);
        button.onclick = function () {
          Waymark.map.editTools.startPolyline();
        };

        //Image Upload
        var button = Waymark_L.DomUtil.create(
          "a",
          "waymark-edit-button waymark-edit-image",
          toolbar,
        );
        button.innerHTML = '<i class="ion ion-image"></i>';
        button.setAttribute("title", Waymark.config.language.add_photo_title);

        // Hide initially
        button.classList.add("waymark-hidden");

        // TODO - Implement image upload

        //Marker
        var button = Waymark_L.DomUtil.create(
          "a",
          "waymark-edit-button waymark-edit-marker",
          toolbar,
        );
        button.innerHTML = '<i class="ion ion-location"></i>';
        button.setAttribute("title", Waymark.config.language.add_marker_title);
        button.onclick = function () {
          //Create JSON
          var marker_json = Waymark.create_marker_json(Waymark.map.getCenter());

          //Add Marker
          Waymark.map_data.addData(marker_json);

          //Save
          Waymark.map_was_edited();
        };

        //Rectangle
        var button = Waymark_L.DomUtil.create(
          "a",
          "waymark-edit-button waymark-edit-rectangle",
          toolbar,
        );
        button.innerHTML =
          '<i class="ion ion-android-checkbox-outline-blank"></i>';
        button.setAttribute(
          "title",
          Waymark.config.language.add_rectangle_title,
        );
        button.onclick = function () {
          Waymark.map.editTools.startRectangle();
        };

        //Polygon
        var button = Waymark_L.DomUtil.create(
          "a",
          "waymark-edit-button waymark-edit-polygon",
          toolbar,
        );
        button.innerHTML = '<i class="ion ion-android-star-outline"></i>';
        button.setAttribute("title", Waymark.config.language.add_polygon_title);
        button.onclick = function () {
          Waymark.map.editTools.startPolygon();
        };

        //Circle
        var button = Waymark_L.DomUtil.create(
          "a",
          "waymark-edit-button waymark-edit-circle",
          toolbar,
        );
        button.innerHTML = '<i class="ion ion-ios-circle-outline"></i>';
        button.setAttribute("title", Waymark.config.language.add_circle_title);
        button.onclick = function () {
          Waymark.map.editTools.startCircle();
        };

        //File Upload

        var button = Waymark_L.DomUtil.create(
          "a",
          "waymark-edit-button waymark-edit-upload waymark-hidden",
          toolbar,
        );
        button.innerHTML =
          '<i class="ion ion-document"></i><i class="ion ion-arrow-up-c"></i>';
        button.setAttribute("title", Waymark.config.language.upload_file_title);

        //Thanks to: https://stackoverflow.com/a/24939229
        var file_input = jQuery("<input />")
          .attr({
            type: "file",
            name: "add_file",
          })
          .css("display", "none")
          .change(function () {
            Waymark.handle_file_upload(jQuery(this));
          });

        jQuery("#waymark-edit-toolbar").append(file_input);

        button.onclick = function () {
          //Fire the form
          file_input.trigger("click");

          //Weird circle bug fix...
          Waymark.map.editTools.stopDrawing();
        };

        return toolbar;
      },
    });
    Waymark.map.addControl(new edit_toolbar_control());
  };

  this.handle_file_upload = function (input, data = {}) {
    Waymark = this;

    Waymark.loading_start();

    //Create form data
    var form_data = new FormData();
    form_data.append("waymark_security", waymark_security);
    form_data.append("action", "waymark_read_file");
    form_data.append(input.attr("name"), input[0].files[0]);

    jQuery.ajax({
      type: "POST",
      url: waymark_js.ajaxurl,
      data: form_data,
      dataType: "json",
      processData: false,
      contentType: false,
      success: function (response) {
        Waymark.debug("File upload response:");
        Waymark.debug(response);

        //Error?
        if (response === null) {
          Waymark.message(Waymark.config.language.error_file_upload, "error");
          Waymark.loading_stop();

          return false;
        } else if (response.error) {
          Waymark.message(response.error, "error");
          Waymark.loading_stop();

          return false;
        }

        switch (input.attr("name")) {
          case "add_file":
            Waymark.load_file_contents(
              response.file_contents,
              response.file_type,
            );

            break;

          case "add_photo":
            //Ensure we have the data we want
            if (typeof response.url === "undefined") {
              return false;
            }

            //Default centre
            var marker_latlng = Waymark.map.getCenter();

            //Extract EXIF location
            if ((latlng = Waymark.get_exif_latlng(response))) {
              marker_latlng = latlng;

              //Center on it
              Waymark.map.setView(marker_latlng);
            }

            //Get Image URLs
            var image_sizes = Waymark.get_image_sizes(
              response.sizes,
              response.url,
            );

            //Create JSON
            var marker_json = Waymark.create_marker_json(
              marker_latlng,
              image_sizes,
            );

            //Add Marker
            Waymark.map_data.addData(marker_json);

            break;

          case "marker_photo":
            //Ensure we have the data we want
            if (typeof response.url === "undefined") {
              return false;
            }

            //Get Image URLs
            var image_sizes = Waymark.get_image_sizes(
              response.sizes,
              response.url,
            );

            //Update data
            data.feature.properties = Object.assign(
              {},
              data.feature.properties,
              image_sizes,
            );

            //Update preview
            data.img_view.attr("href", data.feature.properties.image_large_url);
            jQuery("img", data.img_view).attr(
              "src",
              data.feature.properties.image_thumbnail_url,
            );

            //Update input
            data.img_input.val(data.feature.properties.image_large_url);

            break;
        }

        Waymark.map_was_edited();

        Waymark.loading_stop();

        return;
      },
    });
  };

  this.build_content = function (layer_type, feature, layer) {
    Waymark = this;

    //Build output
    var content = jQuery("<div />");
    var list = jQuery("<ul />").addClass("waymark-info");

    //Edit button
    if (layer_type == "line" || layer_type == "shape") {
      var ele = jQuery("<button />")
        .html('<i class="ion-edit"></i>')
        .addClass("button")
        .attr("title", Waymark.config.language["action_edit_" + layer_type])
        .on("click", function (e) {
          e.preventDefault();

          //Get the element we need
          var button = jQuery(this);
          var icon = jQuery("i", button);

          //Finish
          if (layer.editEnabled()) {
            //Disable edit
            layer.disableEdit();

            //Change title
            button.attr(
              "title",
              Waymark.config.language["action_edit_" + layer_type],
            );

            //Change icon
            icon.attr("class", "ion-edit");
            //Start
          } else {
            //Enable edit
            layer.enableEdit();

            //Close popup
            layer.closePopup();

            //Change title
            button.attr("title", Waymark.config.language.action_edit_done);

            //Change icon
            icon.attr("class", "ion-android-done");
          }

          return false;
        });
      list.append(
        jQuery("<li />")
          .addClass(
            "waymark-info-button waymark-info-edit waymark-" +
              layer_type +
              "-edit",
          )
          .append(ele),
      );
    }

    //Duplicate button
    var ele = jQuery("<button />")
      .html('<i class="ion-ios-copy"></i>')
      .addClass("button")
      .attr("title", Waymark.config.language["action_duplicate_" + layer_type])
      .on("click", function (e) {
        e.preventDefault();

        //Clone
        Waymark.load_json(Object.assign({}, layer.feature));

        Waymark.map_was_edited();

        return false;
      });
    list.append(
      jQuery("<li />")
        .addClass(
          "waymark-info-button waymark-info-duplicate waymark-" +
            layer_type +
            "-duplicate",
        )
        .append(ele),
    );

    //Delete button
    var ele = jQuery("<button />")
      .html('<i class="ion-trash-a"></i>')
      .addClass("button")
      .attr("title", Waymark.config.language["action_delete_" + layer_type])
      .on("click", function (e) {
        e.preventDefault();

        //Confirm delete...
        if (Waymark.config.editor_options.confirm_delete == "1") {
          if (
            !confirm(
              Waymark.config.language["action_delete_confirm_" + layer_type],
            )
          ) {
            return false;
          }
        }

        //Remove from Map
        Waymark.map.removeLayer(layer);
        //Remove from data later
        Waymark.map_data.removeLayer(layer);

        Waymark.map_was_edited();

        return false;
      });
    list.append(
      jQuery("<li />")
        .addClass(
          "waymark-info-button waymark-info-delete waymark-" +
            layer_type +
            "-delete",
        )
        .append(ele),
    );

    //Type
    var config_types = Waymark.config.map_options[layer_type + "_types"];
    var types_data = [];

    // ================================
    // ===== DIRECTION SELECTOR =======
    // ================================

    if (layer_type == "line") {
      var jq_line_direction_select = jQuery("<select />");

      //Options
      jq_line_direction_select.append(
        jQuery("<option />").val("").text(Waymark.config.language.no_direction),
        jQuery("<option />")
          .val("default")
          .text(Waymark.config.language.show_direction),
        jQuery("<option />")
          .val("reverse")
          .text(Waymark.config.language.reverse_direction),
      );

      //On change
      jq_line_direction_select.change(function () {
        var selected_input = jQuery("option:selected", jQuery(this));

        //Get direction value
        var selected_direction = jQuery(this).val();

        //Update data layer
        feature.properties.direction = selected_direction;

        //Redraw - layer Direction
        Waymark.draw_line_direction(layer);

        Waymark.map_was_edited();
      });

      //Add item
      list.append(
        jQuery("<li />")
          .addClass("waymark-info-direction waymark-line-direction")
          .append(jq_line_direction_select),
      );

      //Set selected
      if (typeof feature.properties.direction === "string") {
        jQuery("option", jq_line_direction_select)
          .filter(function () {
            return (
              jQuery(this).val() ==
              Waymark.make_key(feature.properties.direction)
            );
          })
          .attr("selected", "selected");
      }
    }

    // ================================
    // ======== TYPE SELECTOR =========
    // ================================

    var jq_layer_type_select = jQuery("<select />");

    jq_layer_type_select.append(
      jQuery("<option />")
        .attr({
          disabled: "disabled",
        })
        .text(Waymark.config.language["object_type_label_" + layer_type]),
    );

    //Pre-defined config_types
    for (var i in config_types) {
      //Get Key
      var type_key =
        config_types[i].type_key ||
        Waymark.make_key(config_types[i][layer_type + "_title"]);

      //Add option
      jq_layer_type_select.append(
        jQuery("<option />")
          .val(type_key)
          .text(config_types[i][layer_type + "_title"]),
      );
    }

    //On change
    jq_layer_type_select.change(function () {
      var selected_input = jQuery("option:selected", jQuery(this));

      //Get type value
      var selected_type = jQuery(this).val();

      //Update data layer
      feature.properties.type = selected_type;

      //Predefined
      if (typeof selected_type != "object") {
        var type = Waymark.get_type(layer_type, feature.properties.type);
      }

      //Change live style
      switch (layer_type) {
        case "line":
          layer.setStyle({
            color: type.line_colour,
            weight: type.line_weight,
            opacity: type.line_opacity,
          });

          break;
        case "shape":
          layer.setStyle({
            color: type.shape_colour,
            fillOpacity: type.fill_opacity,
          });

          break;
        case "marker":
          //Create Icon
          layer.setIcon(Waymark_L.divIcon(Waymark.build_icon_data(type)));

          break;
      }

      Waymark.map_was_edited();
    });
    list.append(
      jQuery("<li />")
        .addClass("waymark-info-type waymark-" + layer_type + "-type")
        .append(jq_layer_type_select),
    );

    //Set selected
    var resolved_feature_type = Waymark.resolve_type_key(
      layer_type,
      feature.properties.type,
    );

    jQuery("option", jq_layer_type_select)
      .filter(function () {
        return jQuery(this).val() == resolved_feature_type;
      })
      .attr("selected", "selected");

    // ================================
    // ========= TYPE PREVIEW =========
    // ================================

    var jq_overlay_preview_container = jQuery("<div />").addClass(
      "waymark-overlay-preview waymark-" + layer_type + "-preview",
    );
    //Pre-defined config_types
    for (var i in config_types) {
      var type_title = config_types[i][layer_type + "_title"];

      //Get Key
      var type_key = config_types[i].type_key || Waymark.make_key(type_title);
      var type = Waymark.get_type(layer_type, type_key);

      // Markers, Lines & Shapes...

      var overlay_preview = jQuery("<div />")
        .addClass("waymark-type")
        .data("type_key", type_key)
        .attr("title", type_title);
      switch (layer_type) {
        //Markers
        case "marker":
          //Icon
          var icon_data = Waymark.build_icon_data(type);

          //Marker DIV
          overlay_preview
            .addClass(icon_data.className)
            .html(icon_data.html)
            .css({
              width: icon_data.iconSize[0],
              height: icon_data.iconSize[1],
            });

          break;

        //Lines
        case "line":
          overlay_preview.addClass("waymark-line").append(
            jQuery("<div />").css({
              margin: "15px 0",
              height: "1px",
              borderTop: type.line_weight + "px solid " + type.line_colour,
            }),
          );

          break;

        //Shapes
        case "shape":
          overlay_preview
            .addClass("waymark-shape")
            .css({
              border: "3px solid " + type.shape_colour,
            })
            .append(
              jQuery("<div />").css({
                height: "20px",
                background: type.shape_colour,
                opacity: type.fill_opacity,
              }),
            );

          break;
      }

      //Wrap
      var overlay_preview_wrap = jQuery("<div />")
        .addClass("waymark-overlay-wrap waymark-" + layer_type + "-wrap")
        .attr("title", type_title);

      //Append actual preview
      overlay_preview_wrap.append(overlay_preview);

      //On Click
      overlay_preview_wrap.on("click", function () {
        overlay_preview = jQuery(".waymark-type", jQuery(this));

        var clicked_type_key = overlay_preview.data("type_key");

        //Set selected
        jQuery("option", jq_layer_type_select).each(function () {
          if (overlay_preview.val() == clicked_type_key) {
            overlay_preview.attr("selected", "selected");
          } else {
            overlay_preview.removeAttr("selected");
          }
        });

        //Update actual select
        jq_layer_type_select.val(clicked_type_key);
        jq_layer_type_select.trigger("change");

        //Active
        jQuery(
          ".waymark-" + layer_type + "-wrap",
          jq_overlay_preview_container,
        ).each(function () {
          jQuery(this).removeClass("waymark-active");
        });
        overlay_preview
          .parent(".waymark-" + layer_type + "-wrap")
          .addClass("waymark-active");
      });

      //Current?
      if (type_key == resolved_feature_type) {
        overlay_preview_wrap.addClass("waymark-active");

        //Prepend
        jq_overlay_preview_container.prepend(overlay_preview_wrap);
      } else {
        //Append
        jq_overlay_preview_container.append(overlay_preview_wrap);
      }
    }

    list.append(jq_overlay_preview_container);

    // ================================
    // ============= DATA =============
    // ================================

    for (key in Waymark.config[layer_type + "_data_defaults"]) {
      var ele = null;

      switch (key) {
        case "title":
          var ele = jQuery("<input />")
            .attr({
              type: "text",
              value: feature.properties.title,
              placeholder:
                Waymark.config.language[
                  "object_title_placeholder_" + layer_type
                ],
            })
            .on("change", function () {
              //Update properties
              feature.properties.title = jQuery(this).val();

              Waymark.map_was_edited();
            });

          break;
        case "description":
          var ele_id = "waymark-info-description";

          var ele = jQuery("<textarea />")
            .attr({
              id: ele_id,
              class: "wp-editor",
              placeholder:
                Waymark.config.language[
                  "object_description_placeholder_" + layer_type
                ],
            })
            .val(feature.properties.description)
            .on("change", function () {
              //Update properties
              feature.properties.description = jQuery(this).val();

              Waymark.map_was_edited();
            });

          break;
        case "image_large_url":
          var img_input = jQuery("<input />")
            .attr({
              value: feature.properties.image_large_url,
              placeholder: Waymark.config.language.object_image_placeholder,
            })
            .on("change", function () {
              //Update properties
              feature.properties.image_large_url = jQuery(this).val();

              Waymark.map_was_edited();
            });

          if (typeof feature.properties.image_thumbnail_url !== "undefined") {
            var thumb_url = feature.properties.image_thumbnail_url;
          } else {
            var thumb_url = feature.properties.image_large_url;
          }

          //Image Preview
          var img_ele = jQuery("<img />").attr({
            src: thumb_url,
            width: 160,
          });
          img_input.on("change", function () {
            img_ele.attr("src", jQuery(this).val());
          });

          var img_view = jQuery("<a />")
            .attr({
              href: feature.properties.image_large_url,
              target: "_blank",
            })
            .append(img_ele)
            .hover(
              function () {
                jQuery(this).addClass("waymark-hover");
              },
              function () {
                jQuery(this).removeClass("waymark-hover");
              },
            );

          //Upload

          const img_upload = jQuery("<div />")
            .text(Waymark.config.language.action_upload_image)
            // Hide initially
            .addClass("button button-small waymark-hidden");

          // TODO - Info window image upload integration

          var ele = jQuery("<div />").append(img_view, img_input, img_upload);
      }

      if (ele) {
        list.append(
          jQuery("<li />")
            .addClass(
              "waymark-info-" + key + " waymark-" + layer_type + "-info-" + key,
            )
            .append(ele),
        );
      }
    }

    //Position
    if (
      layer_type == "marker" &&
      typeof layer.feature.geometry.coordinates != "undefined"
    ) {
      var latlng = layer.feature.geometry.coordinates;
      var lat = layer.feature.geometry.coordinates[1];
      var lng = layer.feature.geometry.coordinates[0];
      //Format for display only; stored coordinates stay dot-decimal
      lng = Waymark.format_coordinate(lng, 6);
      lat = Waymark.format_coordinate(lat, 6);

      //Output
      ele = jQuery("<small>").html(
        "<b>" +
          Waymark.escape_html(Waymark.config.language.marker_latlng_label) +
          "</b>: " +
          lat +
          "," +
          lng,
      );
      list.append(
        jQuery("<li />")
          .addClass("waymark-info-latlng waymark-marker-info-latlng")
          .append(ele),
      );
    }

    //Content
    if (list.children().length) {
      content.append(list);
    }

    return content;
  };

  this.info_window = function (layer_type, feature, layer) {
    Waymark = this;

    //Build content
    var content = Waymark.build_content(layer_type, feature, layer);
    var content_html = content.get(0);

    //Bind content to info window
    layer.bindPopup(content_html).openPopup();
  };

  this.load_file_contents = function (file_contents, file_type) {
    Waymark = this;

    //The DOMParser doesn't like whitespace
    file_contents = file_contents.trim();

    //Ignore case
    file_type = file_type.toLowerCase();

    switch (file_type) {
      case "gpx":
        var gpx_doc = new DOMParser().parseFromString(
          file_contents,
          "text/xml",
        );
        var geo_json = toGeoJSON.gpx(gpx_doc);

        break;
      case "kml":
        var kml_doc = new DOMParser().parseFromString(
          file_contents,
          "text/xml",
        );
        var geo_json = toGeoJSON.kml(kml_doc);

        break;
      case "json":
      case "geojson":
        var geo_json = JSON.parse(file_contents);

        break;
      default:
        Waymark.message(Waymark.config.language.error_file_type, "error");
    }

    //Valid data
    if (typeof geo_json !== "undefined") {
      //Only keep specific properties
      //var keep_properties = ['title', 'name', 'description', 'photos'];
      // 			var keep_properties = ['title', 'name', 'description'];
      // 			//Each feature
      // 			for(var i in geo_json.features) {
      // 				//Each property
      // 				for(key in geo_json.features[i].properties) {
      // 					//We want this
      // 					if(keep_properties.includes(key)) {
      // 						switch(key) {
      // 							case 'photos' :
      // 								//geo_json.features[i].properties[key];
      //
      // 								break;
      // 						}
      // 					//We don't want this
      // 					} else {
      // 						//Delete
      // 						delete geo_json.features[i].properties[key];
      // 					}
      // 				}
      // 			}

      //Add to map
      this.load_json(geo_json);
      //Invalid data
    } else {
      Waymark.message(Waymark.config.language.error_file_conversion, "error");
    }
  };

  /*
	==================================
	============ OVERLOAD ============
	==================================
*/

  //Add GeoJSON to map
  this.load_json = function (json) {
    Waymark = this;

    if (typeof json === "object") {
      //Add JSON
      Waymark.map_data.addData(json);

      //Save
      Waymark.map_was_edited();

      //Update map bounds (if we have)
      var bounds = Waymark.map_data.getBounds();
      if (bounds.isValid()) {
        Waymark.map.fitBounds(bounds);
      }
    }
  };
}

/*
	==================================
	============= FACTORY ============
	==================================
*/

function Waymark_Map_Factory() {
	this.instances = [];

	this.viewer = function () {
		var instance = Object.assign(new Waymark_Map(), new Waymark_Map_Viewer());

		this.instances.push(instance);

		return instance;
	};

	this.editor = function () {
		var instance = Object.assign(new Waymark_Map(), new Waymark_Map_Editor());

		this.instances.push(instance);

		return instance;
	};
}

window.Waymark_Map_Factory = new Waymark_Map_Factory();
