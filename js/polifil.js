/*******************************************************************/
/*********** Полифил для реализации addEventListener()**************/
/*******************************************************************/
!window.addEventListener && (function (WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
	WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
		var target = this;

		registry.unshift([target, type, listener, function (event) {
			event.currentTarget = target;
			event.preventDefault = function () { event.returnValue = false };
			event.stopPropagation = function () { event.cancelBubble = true };
			event.target = event.srcElement || target;

			listener.call(target, event);
		}]);

		this.attachEvent("on" + type, registry[0][3]);
	};

	WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
		for (var index = 0, register; register = registry[index]; ++index) {
			if (register[0] == this && register[1] == type && register[2] == listener) {
				return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
			}
		}
	};

	WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
		return this.fireEvent("on" + eventObject.type, eventObject);
	};
})(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);


/*******************************************************************/
/*********** Полифил для реализации getComputedStyle() *************/
/*******************************************************************/
if(!window.getComputedStyle){
    window.getComputedStyle = function(elem){
        var parentEl = elem;
        var k = 1.0;
        // если ширина установлена в процентах, то проверяем цепочку родительских элементов
        // до первого родителя с шириной не в процентах
        // и еще очень повезет, если это будут пиксели
        // потому как если это не пиксели, то все поломается
        while( parentEl.currentStyle.width.indexOf('%')>=0 ){
            k *= parseFloat(parentEl.currentStyle.width)/100;
            parentEl = parentEl.parentNode;
        }
        // Если предыдущий цикл отработал (т.е. это действительно были проценты, а не auto или px)
        if(parentEl!=elem){
            // вычисляем значение в px
            var width = parseFloat(parentEl.currentStyle.width) * k;
            // в отличии от currentStyle, runtimeStyle позволяет изменять значения свойств 
            elem.runtimeStyle.width = width + 'px';
        }
        return elem.currentStyle;
    }
}

/*******************************************************************/
/*********** Полифил для реализации String.trim() *************/
/*******************************************************************/
// добавляет trim() trimLeft() trimRight()
if(String.trim==undefined){
	String.prototype.trimLeft = function(){
		var resStr = "";
		var tab = "\t";
		var space = " ";
		var firstNotSpace = false;
		for(var i=0; i<this.length; i++){
			if(!firstNotSpace && (this.charAt(i)==space || this.charAt(i)==tab))
				continue;
			firstNotSpace=true;
			resStr += this.charAt(i);
		}
		return resStr;
	};
	String.prototype.trimRight = function(){
		var resStr = "";
		var tab = "\t";
		var space = " ";
		var firstNotSpace = false;
		for(var i = this.length-1; i >= 0; i--){
			if(this.charAt(i)!=space && this.charAt(i)!=tab)break;
		}
		for(var j = 0; j<(i+1); j++){
			resStr += this.charAt(j);
		}
		return resStr;
	};
	String.prototype.trim = function(){
		var resStr = "";
		resStr = this.trimLeft();
		resStr = resStr.trimRight();
		return resStr;
	}
}
