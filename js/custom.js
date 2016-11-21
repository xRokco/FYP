$(document).ready(function() {
    $('#colorpicker').farbtastic('#colorvalue');

    $('.farbtastic').click(function() {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec($('#colorvalue').val());
        r = parseInt(result[1], 16);
        g = parseInt(result[2], 16);
        b = parseInt(result[3], 16);
        $("#rvalue").val(r);
        $("#gvalue").val(g);
        $("#bvalue").val(b);

        console.log([r, g, b]);
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
        canvas.freeDrawingBrush.color = $.farbtastic('#colorpicker').color;
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
        canvas.freeDrawingBrush.color = $.farbtastic('#colorpicker').color;
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
        canvas.freeDrawingBrush.color = $.farbtastic('#colorpicker').color;
    });

    // Variables
    var $popoverLink = $('[data-popover]'),
    $document = $(document)

    function init() {
        $popoverLink.on('click', openPopover)
        $document.on('click', closePopover)
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

$( function() {
    $( ".drag" ).draggable();
});

//hide options
function hideOptions() {
    canvas.isDrawingMode = false;
    canvas.freeDrawing = false;

    document.getElementById("drawing-mode-options").style.display = 'none';
    document.getElementById("rectangle-mode-options").style.display = 'none';
}

//Canvac creation
var canvas = new fabric.Canvas('c');
canvas.backgroundColor="white";
fabric.Object.prototype.selectable = false;
canvas.renderAll();

//Free drawing-mode
document.getElementById("drawing-mode").onclick = function() {
    hideOptions();
    canvas.isDrawingMode = true;
    document.getElementById("drawing-mode-options").style.display = '';
};

document.getElementById("colorvalue").onchange = function() {
    canvas.freeDrawingBrush.color = $.farbtastic('#colorpicker').color;
};

document.getElementById("drawing-line-width").onchange = function() {
    canvas.freeDrawingBrush.width = parseInt(document.getElementById("drawing-line-width").value, 10) || 1;
};

if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.color = document.getElementById("colorvalue").value;
    canvas.freeDrawingBrush.width = parseInt(document.getElementById("drawing-line-width").value, 10) || 1;
    canvas.freeDrawingBrush.shadowBlur = 0;
}

//Image uploading
var myAppModule = (function () {
    var outObj = {};

    var file, fileReader, img;
    var cImg;

    var init = function (newFile, newFileReader) {
        file = newFile;
        fileReader = newFileReader;
    };

    var onloadImage = function () {
        //cCanvas = new fabric.Canvas('myCanvas');
        //canvas.setWidth(img.width);
        //canvas.setHeight(img.height);

        cImg = new fabric.Image(img, {
            left: 0,
            top: 0,
            angle: 0,
            selectable: true
        });

        canvas.add(cImg);
    };

    var onloadFile = function (e) {
        img = new Image();
        img.onload = onloadImage;
        img.src = fileReader.result;
    };

    outObj.init = init;
    outObj.OnloadFile = onloadFile;

    return outObj;
})();

function handleFileSelect(evt) {
    var files = evt.target.files;
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {

        if (!f.type.match('image.*')) {
            continue;
        }

        var reader = new FileReader();

        myAppModule.init(f, reader);

        reader.onload = myAppModule.OnloadFile;

        reader.readAsDataURL(f);

    }
}

$(document).ready(function () {
    document.getElementById("selectFile").addEventListener('change', handleFileSelect, false);
});

//Rectangle drawing
$(document).ready(function(){
    var divPos = {};
    var offset = $("#c").offset();

    $(document).mousemove(function(e){
        divPos = {
            left: e.pageX - offset.left,
            top: e.pageY - offset.top
        };
    });

    $('#rectangle-mode').click(function(){
        console.log("Button 2 cilcked");

        //Declaring the variables
        var isMouseDown=false;
        var refRect;

        hideOptions();
        document.getElementById("rectangle-mode-options").style.display = '';

        canvas.freeDrawing = true;

        //Setting the mouse events
        canvas.on('mouse:down',function(event){   
            //Defining the procedure
            isMouseDown=true;

            if(document.getElementById('rectangle-fill').checked) {
                var fill = $.farbtastic('#colorpicker').color;
            } else {
                var fill = '';
            }

            //Getting yhe mouse Co-ordinates
            //Creating the rectangle object
            if(canvas.freeDrawing) {
                var rect=new fabric.Rect({
                    left:divPos.left,
                    top:divPos.top,
                    width:0,
                    height:0,
                    stroke: $.farbtastic('#colorpicker').color,
                    strokeWidth: parseInt(document.getElementById("rectangle-line-width").value, 10) || 1,
                    fill:fill
                });
                    
                canvas.add(rect);
                refRect=rect;  //**Reference of rectangle object
            }
        });

        canvas.on('mouse:move', function(event){
            // Defining the procedure
            if(!isMouseDown) {
                return;
            }
            
            //Getting the mouse Co-ordinates
            if(canvas.freeDrawing) {
                var posX=divPos.left;
                var posY=divPos.top;

                refRect.setWidth(Math.abs((posX-refRect.get('left'))));
                refRect.setHeight(Math.abs((posY-refRect.get('top'))));
                canvas.renderAll(); 
            }
        });

        canvas.on('mouse:up',function(){
            //alert("mouse up!");
            isMouseDown=false;
            //hideOptions();
            //freeDrawing=false;  // **Disables line drawing
        });
    });
});