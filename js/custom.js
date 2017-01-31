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
        $("#colorvalue").change();
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
        $("#colorvalue").change();
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
    canvas.selectionColor = "rgba(0,0,0,0)";

    document.getElementById("drawing-mode-options").style.display = 'none';
    document.getElementById("shape-mode-options").style.display = 'none';
    document.getElementById("text-mode-options").style.display = 'none';
    fabric.Object.prototype.selectable = false;
}

function updateLayers() {
    var obj = canvas.getObjects();
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
canvas.setHeight(500);
canvas.setWidth(800);
canvas.renderAll();

function newCanvas(width, height) {
    width = width || canvas.width;
    height = height || canvas.height;
    bg = canvas.backgroundColor
    canvas.clear()
    if(document.getElementById('transparent').checked){
        canvas.backgroundColor=null;
    } else {
        if(document.getElementById('bgcolour').value!=''){
            canvas.backgroundColor=document.getElementById('bgcolour').value;
        } else {
            canvas.backgroundColor = bg;
        }
    }
    
    fabric.Object.prototype.selectable = false;
    canvas.setHeight(height);
    canvas.setWidth(width);
    $('.close').click();
    document.getElementById('canvasWrapper').style.width = width + "px";
}

function getSelectedType() {
    if (canvas.getActiveGroup()){
        return "group";
    } else if(canvas.getActiveObject()){
        if (canvas.getActiveObject().hasOwnProperty('text')){
            return "text";
        } else {
            return canvas.getActiveObject().id;
        }
    } else {
        return null;
    }
}

//Free drawing-mode
document.getElementById("drawing-mode").onclick = function() {
    console.log("entering line drawing");
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
        cImg = new fabric.Image(img, {
            id: 'image',
            left: 0,
            top: 0,
            angle: 0
        });

        if(canvas.background) {
            canvas.setWidth(img.width);
            canvas.setHeight(img.height);
            canvas.setBackgroundImage(cImg, canvas.renderAll.bind(canvas));
            canvas.background = false;
        } else {
            canvas.add(cImg);
            updateLayers();
            $('#select-mode').click();
        }
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

function handleFileSelect2(evt) {
    var files = evt.target.files;
    var output = [];
    canvas.background = true;
    if (!files[0].type.match('image.*')) {
        return;
    }

    var reader = new FileReader();

    myAppModule.init(files[0], reader);

    reader.onload = myAppModule.OnloadFile;

    reader.readAsDataURL(files[0]);
}

$(document).ready(function(){
    document.getElementById("selectFile").addEventListener('change', handleFileSelect, false);
    document.getElementById("background").addEventListener('change', handleFileSelect2, false);
    var divPos = {};
    var offset = $("#c").offset();
    var ctrlDown = false;
    canvas.selectionColor = "rgba(0,0,0,0)";

    $(document).mousemove(function(e){
        divPos = {
            left: e.pageX - offset.left,
            top: e.pageY - offset.top
        };
    });

    //Rectangle drawing
    $('#rectangle-mode').click(function(){
        console.log("entering rectangle mode");
        hideOptions();
        //Declaring the variables
        canvas.isMouseDown=false;
        var refShape;
        
        document.getElementById("shape-mode-options").style.display = '';
        document.getElementById("locklab").style.display = '';
        canvas.defaultCursor = "url('images/cursors/rectangle.png'), auto";
        canvas.hoverCursor = "url('images/cursors/rectangle.png'), auto";
        canvas.rectDrawing = true;
    });

    //Circle Drawing
    $('#circle-mode').click(function(){
        console.log("entering circle mode");

        //Declaring the variables
        canvas.isMouseDown=false;
        var refShape;

        hideOptions();
        document.getElementById("shape-mode-options").style.display = '';
        document.getElementById("locklab").style.display = '';
        canvas.defaultCursor = "url('images/cursors/circle.png'), auto";
        canvas.hoverCursor = "url('images/cursors/circle.png'), auto";
        canvas.circleDrawing = true;
    });

    $('#text-mode').click(function () {
        console.log("entering text mode");

        hideOptions();
        canvas.defaultCursor = "url('images/cursors/circle.png'), auto";
        canvas.hoverCursor = "url('images/cursors/circle.png'), auto";
        canvas.textDrawing = true;
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

        startPointLeft = divPos.left;
        startPointTop = divPos.top;

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
            refShape=rect;  //**Reference of rectangle object
        }

        if(canvas.circleDrawing) {
            if(document.getElementById('lock').checked){
                var circle = new fabric.Circle({
                    id: 'circle',
                    left:divPos.left,
                    top:divPos.top,                
                    radius:6,
                    stroke: $.farbtastic('#colorpicker').color,
                    strokeWidth: parseInt(document.getElementById("shape-line-width").value, 10) || 1,
                    fill:fill
                 });
            } else {
                circle = new fabric.Ellipse({
                    id: 'ellipse',
                    left: startPointLeft,
                    top: startPointTop,
                    originX:divPos.left,
                    originY:divPos.top,
                    rx: divPos.left-startPointLeft,
                    ry: divPos.top-startPointTop,
                    angle: 0,
                    fill: '',
                    stroke: $.farbtastic('#colorpicker').color,
                    strokeWidth: parseInt(document.getElementById("shape-line-width").value, 10) || 1,
                    fill:fill
                });
            }
            
            canvas.add(circle);
            refShape=circle;  //**Reference of rectangle object
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

            if(document.getElementById('lock').checked){
                refShape.id = 'square';
                if(startPointLeft > posX) {
                    refShape.set({originX: 'right' });
                    refShape.setWidth(Math.max(Math.abs(posX-refShape.get('left')), Math.abs(posY-refShape.get('top'))));  
                } else {
                    refShape.set({originX: 'left' });
                    refShape.setWidth(Math.max(Math.abs(posX-refShape.get('left')), Math.abs(posY-refShape.get('top'))));  
                }

                if(startPointTop > posY) {
                    refShape.set({originY: 'bottom' });
                    refShape.setHeight(Math.max(Math.abs(posX-refShape.get('left')), Math.abs(posY-refShape.get('top'))));
                } else {
                    refShape.set({originY: 'top' });
                    refShape.setHeight(Math.max(Math.abs(posX-refShape.get('left')), Math.abs(posY-refShape.get('top'))));
                }
            } else {
                if(startPointLeft > posX) {
                    refShape.set({originX: 'right' });
                    refShape.setWidth(Math.abs((posX-startPointLeft)));
                } else {
                    refShape.set({originX: 'left' });
                    refShape.setWidth(Math.abs((posX-refShape.get('left'))));
                }

                if(startPointTop > posY) {
                    refShape.set({originY: 'bottom' });
                    refShape.setHeight(Math.abs(posY-startPointTop));
                } else {
                    refShape.set({originY: 'top' });
                    refShape.setHeight(Math.abs((posY-refShape.get('top'))));
                }
            }
            refShape.setCoords();
            canvas.renderAll(); 
        }

        if(canvas.circleDrawing) {
            var posX=divPos.left;
            var posY=divPos.top;

            if(document.getElementById('lock').checked) {
                var radius = Math.max(Math.abs(startPointTop - posY),Math.abs(startPointLeft - posX))/2;
                refShape.set({ radius: radius});
            } else {
                var rx = Math.abs(startPointLeft - posX)/2;
                var ry = Math.abs(startPointTop - posY)/2;
                refShape.set({ rx: rx, ry: ry});
            }
            
            if(startPointLeft>posX){
                refShape.set({originX: 'right' });
            } else {
                refShape.set({originX: 'left' });
            }
            if(startPointTop>posY){
                refShape.set({originY: 'bottom'  });
            } else {
                refShape.set({originY: 'top'  });
            }
            
            refShape.setCoords();
            canvas.renderAll(); 
        }
    });

    canvas.on('mouse:up',function(){
        canvas.isMouseDown=false;
        if(canvas.isDrawingMode == true) {
            var obj = canvas.getObjects()
            obj[obj.length - 1].id = "line";
        }

        if(canvas.textDrawing) {
            console.log("adding text");
            var text = new fabric.Text('text', {
                id: 'text',
                left: divPos.left, 
                top: divPos.top,
                fontFamily: "Raleway",
                fill: $.farbtastic('#colorpicker').color
            });
            canvas.add(text);
            canvas.setActiveObject(text);
            $('#select-mode').click();
            document.getElementById("text-mode-options").style.display = '';
            canvas.textDrawing = false;
        }

        if(canvas.circleDrawing || canvas.rectDrawing){
            canvas.setActiveObject(refShape);    
        }
        
        updateLayers();
    });

    $('#text').on('change keydown paste input', function() {
        console.log("text changed");
        canvas.getActiveObject().text = document.getElementById('text').value;
        if (document.getElementById('text').value == "") {
            canvas.getActiveObject().id = "text";
            updateLayers();
        } else {
            canvas.getActiveObject().id = document.getElementById('text').value.replace(/(\r\n|\n|\r)/gm," ");
        }
        updateLayers();
        canvas.renderAll();
    });

    $('#font').on('change', function() {
        console.log("font changed");
        canvas.getActiveObject().fontFamily = this.value;
        canvas.renderAll();
    });

    $('#colorvalue').change(function() {
        console.log("object colour changed");
        if(getSelectedType() == 'text'){
            canvas.getActiveObject().fill = $.farbtastic('#colorpicker').color;
        } else if (getSelectedType() != 'image' && getSelectedType() != null) {
            if(document.getElementById('shape-fill').checked) {
                canvas.getActiveObject().fill = $.farbtastic('#colorpicker').color;
            }
            canvas.getActiveObject().stroke = $.farbtastic('#colorpicker').color;
        }
        canvas.renderAll();
    });

    $('#shape-line-width').on('input', function(){
        if(getSelectedType() != 'text' && getSelectedType() != 'image'){
            canvas.getActiveObject().strokeWidth = parseInt(document.getElementById("shape-line-width").value, 10) || 1;
            canvas.renderAll();
        }
    });

    $('#shape-fill').change(function(){
        if(getSelectedType() != 'text' && getSelectedType() != 'image'){
            if(document.getElementById('shape-fill').checked) {
                var fill = $.farbtastic('#colorpicker').color;
            } else {
                var fill = '';
            }
            canvas.getActiveObject().fill = fill;
            canvas.renderAll();
        }
    });

    //Select tool
    $('#select-mode').click(function(){
        console.log("entering select");
        hideOptions();
        canvas.selectionColor = "rgba(100, 100, 255, 0.3)";
        canvas.defaultCursor = "url('images/cursors/select.png'), auto";
        canvas.hoverCursor = "url('images/cursors/select.png'), auto";
        canvas.moveCursor = "url('images/cursors/select.png'), auto";
        fabric.Object.prototype.selectable = true; 
    });

    canvas.on('object:selected', function() {
        if(getSelectedType() == 'text'){
            $('#select-mode').click();
            hideOptions();
            document.getElementById("text-mode-options").style.display = 'block';
        } else if (getSelectedType() == 'rectangle' || getSelectedType() == 'square' || getSelectedType() == 'circle' || getSelectedType() == 'ellipse') {
            $('#select-mode').click();
            document.getElementById("shape-mode-options").style.display = 'block';
            document.getElementById("locklab").style.display = 'none';
        }
    });

    canvas.on('selection:cleared', function() {
        if( !canvas.isDrawingMode ){
            $('#select-mode').click();
        }
    });

    $('#rasterize').click(function(){
        if(canvas.getActiveObject() || canvas.getActiveGroup()) {
            var obj = canvas.getObjects();
            var keepHidden = [];
            console.log(obj);
            for(i=obj.length - 1; i >= 0;i--){
                if(obj[i].active == false){
                    if(obj[i].visible == false){
                        keepHidden.push(obj[i]);
                    } else {
                        obj[i].visible = false;
                    }
                }
            }
            canvas.renderAll();
            
            fabric.Image.fromURL(canvas.toDataURL({
                format: 'png',
                left: 0,
                top: 0,
                width: canvas.width,
                height: canvas.height
            }), function(oImg){
                canvas.setBackgroundImage(oImg, canvas.renderAll.bind(canvas));
            });
            if(canvas.getActiveObject()) {
                canvas.getActiveObject().remove();
            } else if(canvas.getActiveGroup()) {
                canvas.getActiveGroup().forEachObject(function(o){ canvas.remove(o) });
            }
            var obj = canvas.getObjects();
            for(i=obj.length - 1; i >= 0;i--){
                if(!keepHidden.includes(obj[i])){
                    obj[i].visible = true;
                }
            }
            canvas.renderAll();
            updateLayers();
        } else {
            alert('You need to select an object or group of objects to collapse them to the background')
        }
    });

    $(document).keypress(function( event ) {
        if(canvas.getActiveObject()) {
            if(event.keyCode == 127) {
                canvas.getActiveObject().remove();
                updateLayers();
            }
        } else if(canvas.getActiveGroup()) {
            if(event.keyCode == 127) {
                canvas.getActiveGroup().forEachObject(function(o){ canvas.remove(o) });
                updateLayers();
            }
        }        
    });

    $(document).bind('copy', function() {
        console.log('copied')
        if(canvas.getActiveObject()) {
            canvas.clipboard = canvas.getActiveObject();
        } else if(canvas.getActiveGroup()) {
            canvas.clipboard = canvas.getActiveGroup();
        }
    }); 

    $(document).bind('paste', function() {
        if(canvas.getActiveObject()) {
            console.log('pasted')
            var object = fabric.util.object.clone(canvas.clipboard);
            object.set("top", object.top+15);
            object.set("left", object.left+15);
            canvas.add(object);
            updateLayers();
        } else if(canvas.getActiveGroup()) {
            canvas.clipboard.forEachObject(function(o) {
                var object = fabric.util.object.clone(o);
                object.set("top", object.top+15);
                object.set("left", object.left+15);
                canvas.add(object);
                updateLayers();
            })
        }
    });

    $(document).bind('cut', function() {
        console.log('cut')
        if(canvas.getActiveObject()) {
            canvas.clipboard = canvas.getActiveObject();
            canvas.getActiveObject().remove();
            updateLayers();
        } else if(canvas.getActiveGroup()) {
            canvas.clipboard = canvas.getActiveGroup();
            canvas.getActiveGroup().forEachObject(function(o){ canvas.remove(o) });
            updateLayers();
        }
    });

    $('#select-mode').click();
});

//Export Modal
$('#exportButton').click(function(){
    document.getElementById('exportModal').style.display = "block";
});

// When the user clicks on <span> (x), close the modal
$('.close').click(function() {
    document.getElementById('exportModal').style.display = "none";
});

// When the user clicks anywhere outside of the modal, close it
$(window).click(function(event) {
    if (event.target == document.getElementById('exportModal')) {
        document.getElementById('exportModal').style.display = "none";
    }
});

//Export Modal
$('#newCanvasButton').click(function(){
    document.getElementById('bgcolour').value='';
    document.getElementById('newCanvasModal').style.display = "block";
});

// When the user clicks on <span> (x), close the modal
$('.close').click(function() {
    document.getElementById('newCanvasModal').style.display = "none";
});

// When the user clicks anywhere outside of the modal, close it
$(window).click(function(event) {
    if (event.target == document.getElementById('newCanvasModal')) {
        document.getElementById('newCanvasModal').style.display = "none";
    }
});

$('.form').submit(function(e) {
    e.preventDefault();
});