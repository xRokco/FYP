$(document).ready(function() {
    //$('#colorpicker').farbtastic('#colorvalue');
    
    $('#colorpicker').farbtastic(function(){
        //console.log(this.color);
        $('#colorvalue').val($.farbtastic('#colorpicker').color.toUpperCase());
        $('#colorvalue').css('background-color', $.farbtastic('#colorpicker').color);

        canvas.freeDrawingBrush.color = $.farbtastic("#colorpicker").color;

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec($.farbtastic('#colorpicker').color);
        r = parseInt(result[1], 16);
        g = parseInt(result[2], 16);
        b = parseInt(result[3], 16);
        $("#rvalue").val(r);
        $("#gvalue").val(g);
        $("#bvalue").val(b);

        // $("#rvalue").css('background-color', "rgb(" + r + ", 0, 0)");
        // $("#gvalue").css('background-color', "rgb(0, " + g + ", 0)");
        // $("#bvalue").css('background-color', "rgb(0, 0, " + b + ")");

        // //console.log([r, g, b]);
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

        $("#hvalue").val(Math.round(h * 100) / 100);
        $("#svalue").val(Math.round(s * 100) / 100);
        $("#lvalue").val(Math.round(l * 100) / 100);
        if(document.getElementById('newCanvasModal').style.display != "none"){
            $('#bgcolour').val($.farbtastic('#colorpicker').color);
        }
        $("#colorvalue").change();        
    });

    $(".rgbvalue").change(function() {
        if(parseInt($(this).val()) < 0 || parseInt($(this).val()) > 255) {
            return;
        }

        r = parseInt($("#rvalue").val());
        g = parseInt($("#gvalue").val());
        b = parseInt($("#bvalue").val());

        hexr = ("00" + r.toString(16)).substr(-2);
        hexg = ("00" + g.toString(16)).substr(-2);
        hexb = ("00" + b.toString(16)).substr(-2);

        $.farbtastic('#colorpicker').setColor('#'+hexr+hexg+hexb);
        $('#bgcolour').val($.farbtastic('#colorpicker').color);
    });

    $(".hslvalue").change(function() {
        if(parseFloat($(this).val()) < 0 || parseFloat($(this).val()) > 1) {
            return;
        }

        h = parseFloat($("#hvalue").val());
        s = parseFloat($("#svalue").val());
        l = parseFloat($("#lvalue").val());

        $.farbtastic('#colorpicker').setHSL([h,s,l]);
        console.log($.farbtastic('#colorpicker').hsl);
        $('#bgcolour').val($.farbtastic('#colorpicker').color);
    });

    // Variables
    var $popoverLink = $('[data-popover]'),
    $document = $(document)

    function init() {
        $popoverLink.click(openPopover);
        $document.click(closePopover);
    }

    function openPopover(e) {
        e.preventDefault()
        closePopover();
        var popover = $($(this).data('popover'));
        popover.toggleClass('open')
        e.stopImmediatePropagation();
    }

    function closePopover(e) {
        if($('.popover.open').length > 0) {
            $('.popover').removeClass('open')
        }
    }

    init();
});