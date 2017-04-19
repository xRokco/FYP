/* These functions control everything to do with the colourpicker like converting between colour values
 *
 * Author: Matt Carrick
 * Website: http://stijl.cf
 */

$(document).ready(function() {
    $('#colorpicker').farbtastic(function(){ //Callback function for the colourwheel, called whenever the colour in the wheel changes (by click or in any other way)
        //console.log(this.color);
        $('#colorvalue').val($.farbtastic('#colorpicker').color.toUpperCase()); //Puts the current selected colour Hex code into a text box 
        $('#colorvalue').css('background-color', $.farbtastic('#colorpicker').color); //Changes the text box colour to be the same as the selected colour

        canvas.freeDrawingBrush.color = $.farbtastic("#colorpicker").color; //Changes the free drawing brush colour for the pen tool

        //Uses Regex to parse the hex code
        //e.g. if the colour is set to #96641C, 'result' will be ['#96641C','96','64','1C']
        //r will then contain the number 96 converted to decimal (150)
        //g will contain 100 and b will contain 28
        // The textboxes for the RGB values are then populated with these values
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec($.farbtastic('#colorpicker').color);
        r = parseInt(result[1], 16);
        g = parseInt(result[2], 16);
        b = parseInt(result[3], 16);
        $("#rvalue").val(r);
        $("#gvalue").val(g);
        $("#bvalue").val(b);

        //Converting to HSL from RGB
        //Most converting code taken from http://stackoverflow.com/a/9493060
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min){
            h = s = 0; // achromatic
        }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        //The textboxes for HSL values are set
        $("#hvalue").val(Math.round(h * 100) / 100);
        $("#svalue").val(Math.round(s * 100) / 100);
        $("#lvalue").val(Math.round(l * 100) / 100);

        //If the selected colour is light (l value > 0.5)
        // - Set the text colour in the hex textbox to black
        //If the selected colour is dark (l value <= 0.5)
        // - Set the text colour to white
        $('#colorvalue').css('color', $("#lvalue").val() > 0.5 ? '#000' : '#fff');

        //If the new canvas modal or resize modal is visible, change the value 
        //of the background colour text box in this to be the hex code of the selected color
        if(document.getElementById('newCanvasModal').style.display != "none"){
            $('#bgcolour').val($.farbtastic('#colorpicker').color);
        }

        if(document.getElementById('resizeModal').style.display != "none"){
            $('#resizeBgcolour').val($.farbtastic('#colorpicker').color);
        }
        $("#colorvalue").change();        
    });

    $.farbtastic('#colorpicker').setColor('#000000'); //Set the initial color to black on page load

    $("#colorvalue").change(function(){ //When the colourvalue box changes
        $.farbtastic('#colorpicker').setColor($("#colorvalue").val());//Set the colour wheel colour to the colour of the hexcode in the colorvalue box      
    });

    $(".rgbvalue").change(function() { //When any of the RGB box changes
        if(parseInt($(this).val()) < 0 || parseInt($(this).val()) > 255) { //If the value isn't between 0 and 255 do nothing
            return;
        }

        //Get the values in the boxes
        r = parseInt($("#rvalue").val());
        g = parseInt($("#gvalue").val());
        b = parseInt($("#bvalue").val());

        //Convert the values to hex
        hexr = ("00" + r.toString(16)).substr(-2);
        hexg = ("00" + g.toString(16)).substr(-2);
        hexb = ("00" + b.toString(16)).substr(-2);

        //Set the colour of the wheel based on the hex value computed from the RGB values
        $.farbtastic('#colorpicker').setColor('#'+hexr+hexg+hexb);
        $('#bgcolour').val($.farbtastic('#colorpicker').color);
    });

    $(".hslvalue").change(function() { //When any HSL boxes change
        if(parseFloat($(this).val()) < 0 || parseFloat($(this).val()) > 1) { //If the value isn't between 0 and 1 do nothing
            return;
        }

        //get the values
        h = parseFloat($("#hvalue").val());
        s = parseFloat($("#svalue").val());
        l = parseFloat($("#lvalue").val());

        //Set the colour of the wheel based on the HSL values in the boxes
        $.farbtastic('#colorpicker').setHSL([h,s,l]);
        $('#bgcolour').val($.farbtastic('#colorpicker').color);
    });
});