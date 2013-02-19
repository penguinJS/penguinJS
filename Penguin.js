(function(){

    /**
     * Penguin JS templating library
     * @namespace Penguin
     */
    var Penguin = {};

    /**
     *
     * @type {Object}
     */
    Penguin.cache = {};

    /**
     *
     * @type {Object}
     */
    Penguin.presetTypes = {};

    /**
     *
     * @type {string}
     */
    Penguin.segmentsPath = '';


    /**
     *
     * @param template {String}
     * @param config {Object}
     * @param completeFunc {Function}
     * @param context {Object}
     */
    Penguin.loadSegment = function(template, config, completeFunc, context){

        var gl = typeof window !== 'undefined'?window:global;
        var ctx = context||gl;

        Penguin.ajax(Penguin.segmentsPath + '/' +template, function(data){

            var processedPartial = Penguin.renderTemplate(data, config);
            Penguin.cache[template] = data;

            if(typeof completeFunc == 'function'){
                
                completeFunc.call(ctx, processedPartial);
            }

        });
    };

    /**
     *
     * @param template {String}
     * @param config {Object}
     * @param completeFunc {Function}
     * @param context {Object}
     * @example
     &lt;div id="toolbarDiv"&gt;

     &lt;div&gt;
         [~includeStartButton:if~]
         &lt;button&gt;Start&lt;/button&gt;
         [/~includeStartButton:if~]
     &lt;/div&gt;

     &lt;div class="label"&gt;<b>[~title~]</b>&lt;/div&gt;

     &lt;ul&gt;
     <b>[~items:repeater~]</b>
     &lt;li&gt;<b>[~items~name~]</b> is <b>[~items~age~] years old.</b>  &lt;/li&gt;
     <b>[/~items:repeater~]</b>
     &lt;/ul&gt;
     &lt;/div&gt;

     var configObject = {          title : "Title goes here !!!",
                                   items : [    {name:"Elliot", age:"29"},
                                                {name:"Ben", age:"28"}],
                                   includeStartButton: true};


     Penguin.getMarkup("toolbar.html", configObject, function(e){
        console.log("your partial is : "+e);
     });

     */
    Penguin.getMarkup = function(template, config, completeFunc, context){

       if(!Penguin.cache[template]){

            // if there is a config object but no callback then use could be attempting to render a template before preload

            if(arguments.length === 2){
                throw Error('No callback provided but template not pre-loaded. \nUse Penguin.loadSegment to preload segment, or provide a callback function');
            }

            Penguin.loadSegment(template, config, completeFunc, context);

        }else{

            var processedPartial = Penguin.renderTemplate(Penguin.cache[template], config);
            if(typeof completeFunc == 'function'){

                completeFunc.call(ctx, processedPartial);
            }else{
                return processedPartial;
            }

        }
    };


    /**
     *
     * @param templateString
     * @param config
     * @returns {String} correct markup based on template and config properties
     */
    Penguin.renderTemplate = function(templateString, config){

        var templateStringOriginal = templateString;

        var i = 0 ;
        var iLen = 0;

        // replace presets with correct markup
        var presetPattern = /\[~(\w+)@(\w+)~\]/g;
        var presetPatternProperties = /\[~(\w+)@(\w+)~\]/;

        var presetList = templateString.match(presetPattern);
        iLen = (presetList != null) ? presetList.length : 0;

        for(i=0; i<iLen; i++){
            var presetPropertyNames = presetPatternProperties.exec(presetList[i]);
            var presetTemplate = Penguin.presetTypes[presetPropertyNames[2]];
            var presetConfig = config[presetPropertyNames[1]];
            var replacementText = Penguin.renderTemplate(presetTemplate, presetConfig);

            templateString = templateString.replace(presetList[i], replacementText);
        }


        var commentPattern = /\|~\|(?:.|\s)*?\|\/~\|/mg;

        templateString = templateString.replace(commentPattern, "");


        var macroPattern = /\[~([\w\s]+(?:#[\w\s]+)*)(:)?([\w\s]+)?~\]/g;

        var macroList = templateString.match(macroPattern);
        iLen =  (macroList != null) ? macroList.length : 0;

        var i = 0 ;
        var iLen =  (macroList != null) ? macroList.length : 0;

        for(i=0; i<iLen; i++){

            var tag             = macroList[i];
            var propertyName    = tag.replace(/\[~(.+?)~\]/g,"$1");

            var isFunctional            = propertyName.indexOf(":") != -1 ;
            var functionName            = propertyName.split(":")[1];
            var functionPropertyName    = propertyName.split(":")[0];

            if(!isFunctional){
                templateString = templateString.replace(tag, config[propertyName]);
            }else{

                // prevent Penguin trying to parse previously processed macros
                if(templateString.indexOf(tag) === -1){
                    continue;
                }

                // get everything INSIDE the function tag
                var startRepeaterIndex  = templateString.indexOf(tag) + tag.length;
                var endRepeaterName     = tag.replace("[~","[/~");
                var endRepeaterIndex    = templateString.indexOf(endRepeaterName);
                var repeaterText        = templateString.substring(startRepeaterIndex,endRepeaterIndex);

                // get the WHOLE function tag
                startRepeaterIndex  -= tag.length;
                endRepeaterIndex    += endRepeaterName.length;
                var wholeRepeater   = templateString.substring(startRepeaterIndex,endRepeaterIndex);

                switch(functionName){

                    case "if" :

                        var resultString = "";

                        if(config[functionPropertyName]){
                            resultString = repeaterText;
                        }

                        templateString      = templateString.replace(wholeRepeater, resultString);

                        break;

                    case "repeater" :

                        var repeaterString = Penguin.changeRepeaterItemNamespace(repeaterText);

                        var resultString = [];

                        var j = 0;
                        var jLen = config[functionPropertyName].length;
                        for(j=0; j<jLen; j++){

                            var modifiedConfig = JSON.parse(JSON.stringify(config));

                            for(var k in config[functionPropertyName][j]){
                                modifiedConfig[functionPropertyName+"#"+k] = config[functionPropertyName][j][k];
                            }

                            resultString.push(Penguin.renderTemplate(repeaterString, modifiedConfig));

                        }

                        templateString      = templateString.replace(wholeRepeater, resultString.join(""));

                        break;

                    case "switch":

                        var resultString = "";
                        var pattern = new RegExp('\\[\\~\\=' + config[functionPropertyName] + '\\~\\]((?:.|\\s)+?)\\[\\/\\~\\=' +  config[functionPropertyName] + '\\~\\]','m');
                        var caseContent = pattern.exec(repeaterText);

                        if(caseContent)
                            resultString = caseContent[1];

                        templateString = templateString.replace(wholeRepeater, Penguin.renderTemplate(resultString, config));

                        break;

                }

            }

        }


        return templateString;

    };


    /**
     * defines preset types to be used in templates
     * @param name
     * @param template
     * @param isExternal
     */
    Penguin.definePresetType = function(name, template, isExternal){

        if(!isExternal){
            Penguin.presetTypes[name] = template;
        }else{
            Penguin.ajax(Config.defaultPartialsPath+template, function(data){
                    Penguin.presetTypes[name] = data;
            });
        }

    };


    /**
     *
     * @param repeaterText
     * @return {string}
     */
    Penguin.changeRepeaterItemNamespace = function(repeaterText){



        var macroPattern = /(\[\/?~[\w\s]+(?:#[\w\s]+)*)~([\w\s]+(?:~[\w\s]+)*(?::\w+)?~\])/g;

        var macroList = repeaterText.match(macroPattern);

        var i = 0;
        var iLen = (macroList != null) ? macroList.length : 0;
        for(i=0; i<iLen; i++){

            var newMac = macroList[i].replace(macroPattern, "$1#$2");
            repeaterText = repeaterText.replace(macroList[i], newMac);

        }

        return repeaterText

    };



    /**
     * @param path {string}
     * @param success {function}
     */
    Penguin.ajax = function(path, success){

        var request = new XMLHttpRequest();

        request.onreadystatechange = function(){
            if(request.readyState === 4 && request.status === 200){
                success(response.responseText);
            }
        };

        xhr.open('GET', path);
        xhr.send(null);
    };



    if(typeof define == 'function'){
        define(function(jq){

            return Penguin;
        });
    }else if(typeof window !== 'undefined'){

        window['Penguin'] = Penguin;

    }else if(typeof module !== 'undefined'){

        module.exports = Penguin;
    }

}());