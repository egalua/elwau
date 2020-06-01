(function(){
	var rootListLink = document.querySelectorAll(".root-list__item-name");
	var rootList = document.querySelector(".root-list").addEventListener("click", function(event){
		var target = event.target;
		// root-list__sign
		// root-list__item-name
		target.className = normalize(target.className);
		// если кликнули по надписи (root-list__sign), то подняться до ссылки (root-list__item-name)
		if(classNameTest(target, "root-list__sign")){
			while(!classNameTest(target, "root-list__item-name")){
					target = target.parentNode;
			}
		}
		// если кликнули по root-list__item-name (или поднялись от root-list__sign)
		if(classNameTest(target, "root-list__item-name")){
			// если установлен класс root-list__item-name_active
			if(classNameTest(target, "root-list__item-name_active")){
				// удалить класс root-list__item-name_active
				target.className = delClassName(target, "root-list__item-name_active");
				// подняться до root-list__item
				while(!classNameTest(target, "root-list__item")){
						target = target.parentNode;
				}
				// очистить стили
				closeSubList(target);
			}else{
				// установить класс root-list__item-name_active
				target.className += " " + "root-list__item-name_active";
				// подняться до root-list__item
				while(!classNameTest(target, "root-list__item")){
						target = target.parentNode;
				}
				// установить стили
				openSubList(target);
			}
			// принудительный пересчет стилей (на всякий случай)
			window.getComputedStyle(target).color;
		}
	})
	function openSubList(rootListItem){
		rootListItem.querySelector(".root-list__item-name").style.backgroundColor = "#ed6d3b";
		rootListItem.querySelector(".sub-list").style.display = "block";
		var rootListSign = rootListItem.querySelector(".root-list__sign");
		rootListSign.style.color = "white";
		rootListSign.style.textDecoration = "none";
		
	}
	function closeSubList(rootListItem){
		rootListItem.querySelector(".root-list__item-name").style.backgroundColor = '';
		rootListItem.querySelector(".sub-list").style.display = "";
		var rootListSign = rootListItem.querySelector(".root-list__sign");
		rootListSign.style.color = "";
		rootListSign.style.textDecoration = "";
	}
	function classNameTest(el, testClassName){
		var testClass = testClassName.trim();
		var classList = []; // на случай, если el.className одна строка или вообще пусто
		classList = normalize(el.className).split(" ");
		for(var i = 0; i<classList.length; i++){
			if(classList[i]== testClass) return true;
		}
		return false;
	}
	function normalize(str){
		var space = " ";
		var tab = "\t";
		var tmpStr = str.trim();
		var res =  "";
		for(var i=0; i<tmpStr.length; i++){
				if( (tmpStr[i]!=space && tmpStr[i]!=tab) || (res[res.length-1]!=space && res[res.length-1]!=tab) ){
					// на всякий случай меняем tab на пробел, если, конечно, нам попался tab
					res += (tmpStr[i]!=tab) ? tmpStr[i]: " ";
				} 
		}
		return res;
	}
	function delClassName(el, delClassName){
			var classList = [];
			var newClassName = "";
			classList = normalize(el.className).split(" ");
			for(var i=0; i<classList.length; i++){
				if(classList[i]!=delClassName) newClassName+=" "+classList[i];
			}
			return newClassName;
	}	
})();



