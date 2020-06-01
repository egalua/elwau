/**
 * Конструктор слайдера
 * @param {string} className имя класса слайдера
 * @param {boolean} eAnimation включение анимации (по умолчанию true)
 */
function Slider(className, eAnimation){
    this.slider = document.querySelector("."+className); // слайдер
    this.next = this.slider.querySelector(".slider__next"); // правая кнопка
    this.prev = this.slider.querySelector(".slider__prev"); // левая кнопка
    this.wrapper = this.slider.querySelector(".slider__wrapper"); // контейнер ленты
    this.tape = this.slider.querySelector(".slider__tape"); // лента
    this.currentAnimationState = true; // текущее состояние анимации
    
    // включение/выключение анимации вообще
    if(window.getComputedStyle(this.slider).transitionProperty==undefined || eAnimation==false){
		this.enableAnimation = false;
	} else {
		this.enableAnimation = true;
	}
    
    this.initSlides(); // инициализация слайдов
    this.initTape(); // инициализация ленты
    this.wrapperInit(); // инициализация контейнера ленты
    this.eventListInit(); // установка обработчиков событий
    this.init(); // приведение слайдера в начальное состояние
}

Slider.prototype = {
    init: function(){
        // HTMLCollection слайдов
        var slides = this.tape.querySelectorAll(".slider__slide");
        // отключение анимации у ленты
        this.tape.resetAnimationTape();
        // реальное количество слайдов в ленте
        var totalSlideCnt = slides.length;
        // рассчетное количество видимых в окне слайдов
        var visibleSlideCnt = this.wrapper.visibleSlideCount();
        // если реальное количество слайдов в ленте больше
        // рассчетного количества видимых слайдов, то
        // клонировать первые слайды в конец, а последние слайды в начало ленты
        if(totalSlideCnt>=visibleSlideCnt){
            this.tape.cloneSlides(visibleSlideCnt);
        }
        // установить ленту на активном слайде (на слайде с классом active)
        this.tape.moveTapeToActiveSlide();
        // -- принудительный пересчет стилей --
        this.reflow();
        // включение анимации
        if(this.enableAnimation) this.tape.setAnimationTape();
    },
    eventListInit: function(){
        // чтобы можно было использовать правильный this внутри анонимных функций
        // для next и prev
        var self = this;
        // правая кнопка
        this.next.addEventListener("click", function(e){
            //var target = e.target;
            // можно использовать self и это будет замыканием
            // т.к. после завершения работы init() ссылка на self останется
            // в данном случае scope анонимной функции ссылается 
            // на Lexical Environment функции init(),
            // т.к. объявлена анонимная функция не внутри addEventListener(),
            // а в месте её вызова, а по правилам scope функции ссылается
            // на Lexical Environment того места, где она была объявлена
            if(self.currentAnimationState){ // текущее состояние анимации (true == уже закончилась)
                // если разрешено использование анимации
                if(self.enableAnimation) self.currentAnimationState = false; 
              
                // включить анимацию
                if(self.enableAnimation) self.tape.setAnimationTape();
                
                // установить active у предыдущего слайда
                self.tape.prevNextActiveSlide(false); // не переносит active
        
                // Установить ленту на слайд с active
                self.tape.moveTapeToActiveSlide();

                // "нормализация" ленты если нет анимации 
                if(!self.enableAnimation){ 
                    self.tape.normalizeTapeOffset();
                }
            }
        });
        //левая кнопка
        this.prev.addEventListener("click", function(e){
            // через self доступны все свойства и методы объекта slider

            // проверка текущего состояния анимации
            if(self.currentAnimationState){
                // Если анимация используется, 
                // то установить текущее состояние анимации = false
                if(self.enableAnimation) self.currentAnimationState = false;

                // включить анимацию (устанавливает стиль transition у ленты)
                if(self.enableAnimation) self.tape.setAnimationTape();
                
                // установить active у следующего слайда
                self.tape.prevNextActiveSlide(true);
                
                // Установить ленту на слайд с active
                self.tape.moveTapeToActiveSlide();
                
                // Если анимация отключена, то провести "нормализацию" положения ленты
                if(!self.enableAnimation){
                    self.tape.normalizeTapeOffset();
                }
            }
        });
        // окончание анимации
        this.slider.addEventListener("transitionend", function(e){
            // сбросить стили анимации у ленты
            self.tape.resetAnimationTape();

            // переносит active на правильный слайд (без clone)
            // смещает ленту на слайд с active
            self.tape.normalizeTapeOffset();
            // поменять текущее состояние анимации
            self.currentAnimationState = true;

        });
        /**
         * Принудительный пересчет стилей (reflow)
         */
        this.reflow = function(){
            // первый способ
            var currentStyle = window.getComputedStyle(this.tape);
            // второй способ
            var currentOffsetHeight = this.tape.offsetHeight;
        }
    },
    initSlides: function(){ // инициализация слайдов в ленте, в т.ч. добавление клонов
        // инициализация дополнительных методов слайдов
        var slides = this.tape.querySelectorAll(".slider__slide");
        for(var i = 0; i < slides.length; i++){
            /**
             * Проверяет есть ли такой класс у даного HTML элемента
             * @param {string} className имя класса
             * @returns {boolean} true == есть; false == нет
             */
            slides[i].classNameTest = function(className){
                // получить классы элемента element
                var elementClassName = this.className ? this.className : '';
                // список классов элемента element
                var classList = elementClassName.split(' ');
                // если в списке есть className, то вернуть true
                for(var i = 0; i < classList.length; i++){
                    if(classList[i] == className) return true;
                }
                // в противном случае false
                return false;
            }
            /**
             * Возвращает имя класса html элемента сооветствующее регулярному выражению
             * @param {RegExp} regexp регулярное выражение, которому должен соответствовать класс
             * @returns {string} имя найденного класса или пустая строка
             */
            slides[i].getClassName = function(regExp){
                var classList = this.className.split(' ');
                for(var i = 0; i < classList.length; i++){
                    if(regExp.test(classList[i])) return classList[i];
                }
                return '';
            }
            /**
             * Удаляет первый, последний и повторяющиеся пробелы в строке
             */            
            slides[i].trimClassNames = function(){
                // регулярное выражение пробелы_строка_пробелы
                var trimSpace = /^\s+|\s+$/g;
                // один или больше пробелов
                var multiSpace = /\s+/g;
                // удаляем первые и последние пробелы
                this.className = this.className.replace(trimSpace, '');
                // меняем много пробелов на один
                this.className = this.className.replace(multiSpace, ' ');
            }
            /**
             * Добавление нового имени класса у элемента
             * @param {string} className имя устанавливаемого класса
             */
            slides[i].addClassName = function(className){
                // если нет такого имени класса у слайда или у ленты
                if(!this.classNameTest(className)){
                    this.className += ' ' + className;
                }
                // удалить первый, последний и повторяющиеся пробелы, если есть
                this.trimClassNames();
            }
            /**
             * Удаление указанного класса у элемета
             * @param {string} className имя удаляемого класса
             */
            slides[i].delClassName = function(className){
                //className = "^" + className + "$";
                // регулярное выражение на основе полученной строки className
                var regClassName = new RegExp(className, 'g');
                // удаление всех вхождений подстроки className 
                this.className = this.className.replace(regClassName, '');
                // удалить первый, последний и повторяющиеся пробелы, если есть
                this.trimClassNames();
            }
            /**
             * Клонирует текущий слайд
             * @returns {HTMLElement} полный клон слайда (со веми добавленными методами)
             */
            slides[i].cloneThisSlide = function(){
                var clone = this.cloneNode(true);
                clone.classNameTest = this.classNameTest;
                clone.getClassName = this.getClassName;
                clone.trimClassNames = this.trimClassNames;
                clone.addClassName = this.addClassName;
                clone.delClassName = this.delClassName;
                return clone;
            }
        }
    },
    initTape: function(){ // инициализация ленты, в т.ч. добавление новых методов
        /**
         * Смещает ленту относительно её нормального положения
         * @param {float} offset - смещение в px (offset>0 - вправо, offset<0 - влево)
         */
        this.tape.moveTape = function(offset){
            this.style.left = offset + 'px';
            //tape.style.left = offset + 'px';
            // принудительный пересчет стилей (по всей видимости не работает)
            window.getComputedStyle(this);
        }
        /**
         * Получить текущее смещение ленты tape
         * @return {float} текущее смещение  ленты (css: tape.left)
         */
        this.tape.getTapeOffset = function(){
            //var tape = slider.querySelector(".slider__tape");
            return parseFloat(window.getComputedStyle(this).left);
        }
        /**
         * Удаляет первый, последний и повторяющиеся пробелы в строке
         * просто копируем такой же метод из любого слайда
         * (слайды к этому времени должны быть инициализированы)
         */ 
        this.tape.trimClassNames = this.tape.querySelector(".slider__slide").trimClassNames;

        /**
         * Добавление нового имени класса у элемента
         * @param {string} className имя устанавливаемого класса
         * просто копируем такой же метод из любого слайда
         * (слайды к этому времени должны быть инициализированы)
        */
        this.tape.addClassName = this.tape.querySelector(".slider__slide").addClassName;

        /**
         * Удаление указанного класса у элемета
         * @param {string} className имя удаляемого класса
         * просто копируем такой же метод из любого слайда
         * (слайды к этому времени должны быть инициализированы)
         */
        this.tape.delClassName = this.tape.querySelector(".slider__slide").delClassName;

        /**
         * Проверяет есть ли такой класс у даного HTML элемента
         * @param {string} className имя класса
         * @returns {boolean} true == есть; false == нет
         * просто копируем такой же метод из любого слайда
         * (слайды к этому времени должны быть инициализированы)
         */
        this.tape.classNameTest = this.tape.querySelector(".slider__slide").classNameTest;

        /**
         * Определяет смещение в px от начала ленты до слайда с active
         * (это смещение всегда неотрицательно)
         * @returns {float} смещение
         */
        this.tape.getActiveSlideOffset = function(){
            // положение слайда с active относительно начала ленты
            var offset = 0.0;
            var slides = this.querySelectorAll(".slider__slide");
            // ширина слайда (у всех слайдов должна быть одинаковая ширина)
            var slideWidth = parseFloat(window.getComputedStyle(slides[0]).width);
            for(var i = 0; i < slides.length; i++){
                if(slides[i].classNameTest('active')) break;
                offset += slideWidth;
            }
            return offset;
        }
        /**
         * Проверяет есть ли слайд с одновременно заданными классами active и clone
         * если есть, то удаляет у него класс active и
         * возвращает имя класса начинающегося на "slider__slide_n" 
         * или "" если такого салайда нет
         * @returns {string} имя класса начинающегося на "slider__slide_n" или ""
         */
        this.tape.removeActiveFromCloneSlide = function(){
            // слайды
            var slides = this.querySelectorAll(".slider__slide");
            // регулярное выражение для поиска имени класса
            var classNameRegExp = /^slider__slide_n/;
            // переменная для хранения результата
            var numSlideClass = '';
            for(var i = 0; i < slides.length; i++){
                // если slides[i] слайд с классами active и clone
                if( slides[i].classNameTest('active')) {
                    if( slides[i].classNameTest('clone')){
                        // класс начинающийся на "slider__slide_n" у слайда с "active" "clone"
                        numSlideClass = slides[i].getClassName(classNameRegExp);
                        // удалить active у слайда
                        slides[i].delClassName('active');
                    }
                // если только active и без clone то проверять больше не нужно
                break;
                }
            }
            return numSlideClass;
        }
        /**
         * "Нормализует" положение ленты так,
         * чтобы класс active не был установлен совместно с классом clone
         */
        this.tape.normalizeTapeOffset = function(){
            // слайды
            var slides = this.querySelectorAll(".slider__slide");
            // класс начинающийся на "slider__slide_n"
            var numSlideClass = '';
            // 1. проверить есть ли у слайда с active класс clone
            //    если есть, то удалить у него класс active и вернуть
            //    имя класса начинающегося со "slider__slide_n"
            numSlideClass = this.removeActiveFromCloneSlide();
            // 2. если есть, установить active у слайда 
            //    с классом  slider__slide_n...  и без класса clone
            if(numSlideClass!=''){
                for(var i = 0; i < slides.length; i++){
                    if(!slides[i].classNameTest("clone") && slides[i].classNameTest(numSlideClass)){
                        slides[i].addClassName('active');
                        break;
                    }
                }
            }   
            // 3. Установить ленту на слайд с active
            this.moveTapeToActiveSlide();
        }
        /**
         * Смещает ленту до слайда с классом active
         * (слайд с классом active становится первым слева)
         */
        this.tape.moveTapeToActiveSlide = function(){
            // текущее смещение ленты
            var currentTapeOffset = this.getTapeOffset();
            // текущее смещение active слайда в ленте
            var currentActiveSlideOffset = this.getActiveSlideOffset();
            // проверяет, нужно ли смещение ленте
            if(currentActiveSlideOffset!=-currentTapeOffset){
                // смещение ленты tape
                this.moveTape(-currentActiveSlideOffset);
            }
        }
        /**
         * Перенос класса active от текущего слайда к следующему или предыдущему
         * в зависимости от параметра prevNext (true - следующий, false - предыдущий)
         * @param {boolean} prevNext направление (true - следующий, false - предыдущий)
         */
        this.tape.prevNextActiveSlide = function(prevNext){
            // коллекция слайдов
            var slides = this.querySelectorAll(".slider__slide");
            // количество слайдов
            var n = slides.length;
            // последний индекс
            var lastIndex = n-1;
            // пробегаемся по всем слайдам в поисках слайда с классом active
            for(var i = 0; i < n; i++){
                if(slides[i].classNameTest('active')){
                    if(prevNext){ // сработала кнопка "next"
                        if(i!=lastIndex){ // если это не последний слайд
                            slides[i].delClassName('active');
                            slides[++i].addClassName('active');
                            break;
                        } else break;
                    }else{ // сработала кнопка "prev"
                        if(i!=0){ // если это не первый слайд
                            slides[i].delClassName('active');
                            slides[--i].addClassName('active');
                            break;
                        } else break;
                    }
                }
            }
        }
        /**
         * Клонирует слайды из начала ленты и помещает их в конец ленты,
         * клонирует слайды с конца ленты и помещает их в начало ленты
         * @param {integer} quantitySlides количество клонов слайдов
         */
        this.tape.cloneSlides = function(quantitySlides){
            // "коллекция" слайдов
            var slideCollection = this.querySelectorAll(".slider__slide");
            // массивы клонов начала и конца ленты 
            var StartPartSlideCollection = [];
            var EndPartSlideCollection = [];
            // заполняем массив клонов начала ленты
            for(var i = 0; i < quantitySlides; i++){
                // добавляем клон в конец массива
                StartPartSlideCollection.push( slideCollection[i].cloneThisSlide() );
                // добавляем клону имя класса clone
                StartPartSlideCollection[i].addClassName('clone');
                // удаляем имя класса active
                StartPartSlideCollection[i].delClassName('active');
            }
            // заполняем массив клонов конца ленты 
            // начинаем с индекса количество_слайдов-количеество_клонов
            // т.е. slideCollection.length - quantitySlides
            for(i = slideCollection.length-quantitySlides; i < slideCollection.length ; i++){
                // добавляем клон в начало массива 
                EndPartSlideCollection.unshift( slideCollection[i].cloneThisSlide() );
                // добавляем клону класс clone
                EndPartSlideCollection[0].addClassName('clone');
                // удаляем класс active, если есть
                EndPartSlideCollection[0].delClassName('active');
            }
           // вставляем первые слайды
            for(var i = 0; i < StartPartSlideCollection.length; i++){
                // всавляем всегда в конец ленты
                this.appendChild(StartPartSlideCollection[i]);
            }
            // вставляем последние слайды
            for(var i = 0; i < EndPartSlideCollection.length; i++){
                // вставляем всегда перед первым слайдом ленты
                this.insertBefore(EndPartSlideCollection[i], this.firstChild);
            }
        }
        /**
         * включение анимации ленты
         */
        this.tape.setAnimationTape = function(){
            // установить класс с анимацией у ленты
            this.addClassName('transition-left');
            // принудительный пересчет стилей
            var style = window.getComputedStyle(this);  
        }
        /**
         * отключение анимации ленты
         */
        this.tape.resetAnimationTape = function(){
            // удалить класс с анимацией у ленты
            this.delClassName('transition-left');
            // принудительный пересчет стилей
            var style = window.getComputedStyle(this);
        }
    },
    wrapperInit: function(){
        // this == объект slider целиком 
        // добавляем методы к объекту wrapper,
        // включенного как поле в объект slider
        /**
         * Определяет количество отображаемых в окне слайдов
         * @returns {integer} количество видимых слайдов
         */
        this.wrapper.visibleSlideCount = function(){
            // this == wrapper
            // первый слайд
            var anySlide = this.querySelector(".slider__slide");
            // слайдер (окно слайдера)
            //var wrapper = slider.querySelector(".slider__wrapper");
            // ширина слайда
            var slideWidth = parseFloat(window.getComputedStyle(anySlide).width);
            // ширина окна
            var wrapperWidth = parseFloat(window.getComputedStyle(this).width);
            // деление с округлением вверх, т.е. Math.ceil(2.1) == 3
            return Math.ceil(wrapperWidth/slideWidth);
        }
    }
}

var sld = new Slider("slider");
//var sld = new Slider("slider", false);
