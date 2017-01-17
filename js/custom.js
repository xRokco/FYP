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
    canvas.rectDrawing = false;
    canvas.circleDrawing = false;

    document.getElementById("drawing-mode-options").style.display = 'none';
    document.getElementById("shape-mode-options").style.display = 'none';
    fabric.Object.prototype.selectable = false;
    //document.getElementById("circle-mode-options").style.display = 'none';
}

function updateLayers() {
    var obj = canvas.getObjects();
    console.log(obj);
    var text = "";
    for(i=obj.length - 1; i >= 0;i--){
        if(i == obj.length - 1){
            var up = "<img src=\"images/up.png\" style=\"opacity:0.1\">"
        } else {
            var up = "<img src=\"images/up.png\" onclick=\"moveForwards(" + i + ")\">"
        }

        if(i == 0) {
            var down = "<img src=\"images/down.png\" style=\"opacity:0.1\">";
        } else {
            var down = "<img src=\"images/down.png\" onclick=\"moveBack(" + i + ")\">";
        }
     
        var image = "";
        if(obj[i].visible == false) {
            var image = "-white";
        }

        text += "<div>" + down + up + "<span onclick=\"selectLayer(" + i + ")\">" + obj[i].id + "</span><img id=\"image" + i + "\" src=\"images/eye" +  image + ".png\" onclick=\"hideLayer(" + i + ")\"></div>"
    }
    document.getElementById("layers").innerHTML = text;
}

function moveBack(index) {
    canvas.sendBackwards(canvas.item(index));
    updateLayers();
}

function moveForwards(index) {
    canvas.bringForward(canvas.item(index));
    updateLayers();
}

function selectLayer(index) {
    hideOptions();
    fabric.Object.prototype.selectable = true; 
    canvas.setActiveObject(canvas.item(index));
}

function hideLayer(index) {
    if (canvas.item(index).visible==false) {
        canvas.item(index).visible=true;
        document.getElementById("image" + index).src="images/eye.png";
    } else {
        canvas.item(index).visible=false;
        document.getElementById("image" + index).src="images/eye-white.png";
    }
    canvas.renderAll(); 
}

//Canvac creation
var canvas = new fabric.Canvas('c');
canvas.backgroundColor="white";
fabric.Object.prototype.selectable = false;
canvas.renderAll();

//Free drawing-mode
document.getElementById("drawing-mode").onclick = function() {
    console.log("drawing cilcked");
    hideOptions();
    canvas.isDrawingMode = true;
    canvas.freeDrawingCursor = "url('images/cursors/pencil.png'), auto";
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
            id: 'image',
            left: 0,
            top: 0,
            angle: 0
        });

        canvas.add(cImg);
        updateLayers();
        $('#select-mode').click();
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

$(document).ready(function(){
    document.getElementById("selectFile").addEventListener('change', handleFileSelect, false);
    var divPos = {};
    var offset = $("#c").offset();
    var ctrlDown = false;

    $(document).mousemove(function(e){
        divPos = {
            left: e.pageX - offset.left,
            top: e.pageY - offset.top
        };
    });

    //Rectangle drawing
    $('#rectangle-mode').click(function(){
        console.log("Button 2 cilcked");
        hideOptions();
        //Declaring the variables
        canvas.isMouseDown=false;
        var refRect;

        
        document.getElementById("shape-mode-options").style.display = '';
        canvas.defaultCursor = "url('images/cursors/rectangle.png'), auto";
        canvas.hoverCursor = "url('images/cursors/rectangle.png'), auto";
        canvas.rectDrawing = true;
    });

    //Circle Drawing
    $('#circle-mode').click(function(){
        console.log("Button 2 cilcked");

        //Declaring the variables
        canvas.isMouseDown=false;
        var refCircle;

        hideOptions();
        document.getElementById("shape-mode-options").style.display = '';
        canvas.defaultCursor = "url('images/cursors/circle.png'), auto";
        canvas.hoverCursor = "url('images/cursors/circle.png'), auto";
        canvas.circleDrawing = true;
    });

    //Setting the mouse events
    canvas.on('mouse:down',function(event){   
        //Defining the procedure
        canvas.isMouseDown=true;

        if(document.getElementById('shape-fill').checked) {
            var fill = $.farbtastic('#colorpicker').color;
        } else {
            var fill = '';
        }

        //Getting yhe mouse Co-ordinates
        //Creating the rectangle object
        if(canvas.rectDrawing) {
            var rect=new fabric.Rect({
                id: 'rectangle',
                left:divPos.left,
                top:divPos.top,
                width:5,
                height:5,
                stroke: $.farbtastic('#colorpicker').color,
                strokeWidth: parseInt(document.getElementById("shape-line-width").value, 10) || 1,
                fill:fill
            });
                
            canvas.add(rect);
            refRect=rect;  //**Reference of rectangle object
        }

        if(canvas.circleDrawing) {
            var circle = new fabric.Circle({
                id: 'circle',
                left:divPos.left,
                top:divPos.top,                
                radius:6,
                stroke: $.farbtastic('#colorpicker').color,
                strokeWidth: parseInt(document.getElementById("shape-line-width").value, 10) || 1,
                fill:fill
             });
            
            canvas.add(circle);
            refCircle=circle;  //**Reference of rectangle object
        }
    });

    canvas.on('mouse:move', function(event){
        // Defining the procedure
        if(!canvas.isMouseDown) {
            return;
        }
        
        //Getting the mouse Co-ordinates
        if(canvas.rectDrawing) {
            var posX=divPos.left;
            var posY=divPos.top;

            refRect.setWidth(Math.abs((posX-refRect.get('left'))));
            refRect.setHeight(Math.abs((posY-refRect.get('top'))));
            refRect.setCoords();
            canvas.renderAll(); 
        }

        if(canvas.circleDrawing) {
            var posX=divPos.left;
            var posY=divPos.top;

            refCircle.set('radius',Math.abs((posX-refCircle.get('left'))));
            refCircle.setCoords();
            canvas.renderAll(); 
        }
    });

    canvas.on('mouse:up',function(){
        //alert("mouse up!");
        canvas.isMouseDown=false;
        if(canvas.isDrawingMode == true) {
            var obj = canvas.getObjects()
            obj[obj.length - 1].id = "line";
        }

        updateLayers();

        if(canvas.rectDrawing) {
            console.log("rect update");
        }

        if(canvas.circleDrawing) {
            console.log("circle update");
        }
    });

    //Select tool
    $('#select-mode').click(function(){
        console.log("select cilcked");
        hideOptions();
        canvas.defaultCursor = "url('images/cursors/select.png'), auto";
        canvas.hoverCursor = "url('images/cursors/select.png'), auto";
        canvas.moveCursor = "url('images/cursors/select.png'), auto";
        fabric.Object.prototype.selectable = true; 
    });

    $(document).keypress(function( event ) {
        if(canvas.getActiveObject()) {
            if(event.keyCode == 127) {
                canvas.getActiveObject().remove();
                updateLayers();
            }
        }
    });

    $(document).bind('copy', function() {
        console.log('copy behaviour detected!')
    }); 

    $(document).bind('paste', function() {
        console.log('paste behaviour detected!')
    });
     
    $(document).bind('cut', function() {
        console.log('cut behaviour detected!')
    });
});

// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}