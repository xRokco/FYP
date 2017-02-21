//Canvac creation
var canvas = new fabric.Canvas('c');
canvas.enableRetinaScaling = false;
canvas.backgroundColor="white";
fabric.Object.prototype.selectable = false;
canvas.setHeight(500);
canvas.setWidth(800);

canvas.renderAll();


$( function() {
    $( ".drag" ).draggable();
});

//hide options
function hideOptions() {
    canvas.eyedropper = false;
    canvas.isDrawingMode = false;
    canvas.rectDrawing = false;
    canvas.circleDrawing = false;
    canvas.textDrawing = false;
    canvas.selectionColor = "rgba(0,0,0,0)";
    canvas.selectionBorderColor = "rgba(0,0,0,0)";

    $('.tool').css("border", "1px solid #EEE");

    document.getElementById("drawing-mode-options").style.display = 'none';
    document.getElementById("shape-mode-options").style.display = 'none';
    document.getElementById("text-mode-options").style.display = 'none';
    fabric.Object.prototype.selectable = false;
}

function updateLayers() {
    var obj = canvas.getObjects();
    var text = "";
    for(i=obj.length - 1; i >= 0;i--){
        if(obj[i].id == "erase"){
            canvas.sendToBack(canvas.item(i));
            //continue;
        }
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
    $(window).resize();
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
            document.getElementById('canvasWrapper').style.width = img.width + "px";
            $(window).resize();
            $('#select-mode').click();
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

$(window).on('beforeunload', function (e) {
    if(canvas.getObjects().length > 0){
        var confirmationMessage = 'It looks like you have been editing an image. '
                        + 'If you leave before saving, your changes will be lost.';

        //(e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    }
});