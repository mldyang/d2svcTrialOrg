({
    afterRender: function(cmp, helper,event) {
        /*console.log('hello');
        var svg = component.find("svg_content");
        var value = svg.getElement().innerText;
        console.log(value);
        value = value.replace("<![CDATA[", "").replace("]]>", "");
        svg.getElement().innerHTML =  value; //'<svg><defs><clipPath id="clipping"><circle cx="284" cy="213" r="213" /></clipPath></defs></svg>';   */
        
        cmp.find("vid").getElement().play();
    }
})