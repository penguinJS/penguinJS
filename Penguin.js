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
                                            {name:"Ben", age:"34"}],
                               includeStartButton: true};


 Penguin.getMarkup("toolbar.html", configObject, function(e){
    console.log("your partial is : "+e);
 });

 */
Penguin.getMarkup = function(template, config, completeFunc){

   if(!Penguin.cache[template]){

       var start = Date.now();

        $.ajax(Penguin.segmentsPath + '/' +template, {
            success:function(data){

                var processedPartial = Penguin.renderTemplate(data, config);
                Penguin.cache[template] = data;
                completeFunc(processedPartial);

                //console.log("Penguin.getMarkup "+ template  +"takes  : "+(Date.now()-start)+"ms");

            }
        });

    }else{

        var start = Date.now();

        var processedPartial = Penguin.renderTemplate(Penguin.cache[template], config);
        completeFunc(processedPartial);

        //console.log("Penguin.getMarkup "+ template  +"takes  : "+(Date.now()-start)+"ms");
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


    var macroPattern = /\[~(\w+(?:#\w+)*)(:)?(\w+)?~\]/g;

    var macroList = templateString.match(macroPattern);
    iLen =  (macroList != null) ? macroList.length : 0;

    var i = 0 ;
    var iLen =  (macroList != null) ? macroList.length : 0;

    for(i=0; i<iLen; i++){

        var tag             = macroList[i];
        var propertyName    = tag.replace(/\[~(.+)~\]/,"$1");

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

                        var modifiedConfig = $.extend(false, {}, config);

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
        $.ajax(Config.defaultPartialsPath+template,  {
            success:function(data){
                Penguin.presetTypes[name] = data;
            }
        });
    }

};


/**
 *
 * @param repeaterText
 * @return {string}
 */
Penguin.changeRepeaterItemNamespace = function(repeaterText){



    var macroPattern = /(\[\/?~\w+(?:#\w+)*)~(\w+(?:~\w+)*(?::\w+)?~\])/g;

    var macroList = repeaterText.match(macroPattern);

    var i = 0;
    var iLen = (macroList != null) ? macroList.length : 0;
    for(i=0; i<iLen; i++){

        var newMac = macroList[i].replace(macroPattern, "$1#$2");
        repeaterText = repeaterText.replace(macroList[i], newMac);

    }

    return repeaterText

};
