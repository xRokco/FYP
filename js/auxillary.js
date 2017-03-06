//Canvac creation
var canvas = new fabric.Canvas('c');
canvas.enableRetinaScaling = false;
canvas.backgroundColor="white";
fabric.Object.prototype.selectable = false;
canvas.setHeight(400);
canvas.setWidth(600);
document.getElementById('canvasWrapper').style.width = canvas.getWidth() + "px";
var angle = 0;
var backgroundFlipY = false;
var backgroundFlipX = false;
canvas.renderAll();
var initWidth = canvas.getWidth();
var initHeight = canvas.getHeight();


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

function rotate(a) {

    var width = canvas.getWidth();
    var height = canvas.getHeight();
    canvas.setWidth(height);
    canvas.setHeight(width);
    document.getElementById('canvasWrapper').style.width = canvas.getWidth() + "px";

    var group = new fabric.Group();
    var origItems = canvas._objects;

    if(a > 0){
        group.set({width: canvas.width, height: canvas.height, left: canvas.width, top: 0, originX: 'center', originY: 'center', centeredRotation: true})        
    } else {
        group.set({width: canvas.width, height: canvas.height, left: 0, top: canvas.height, originX: 'center', originY: 'center', centeredRotation: true})            
    }
    

    var obj = canvas.getObjects();
    for(i=obj.length - 1; i >= 0;i--){
        group.add(obj[i]);
    }
    canvas.add(group);
    group.set({angle: a});

    if(canvas.backgroundImage){
        angle = (angle + a) % 360;
        console.log(angle);

        canvas.backgroundImage.setAngle(angle);

        if(angle == 0) {
            canvas.backgroundImage.top = 0;
            canvas.backgroundImage.left = 0;
        } else if(angle == 90 || angle == -270){
            canvas.backgroundImage.top = 0;
            canvas.backgroundImage.left = canvas.width;
        } else if(angle == 180 || angle == -180) {
            canvas.backgroundImage.top = canvas.height;
            canvas.backgroundImage.left = canvas.width;
        } else if(angle == 270 || angle == -90){
            canvas.backgroundImage.top = canvas.height;
            canvas.backgroundImage.left = 0;
        }
    }

    canvas.renderAll();

    items = group._objects;
    group._restoreObjectsState();
    canvas.remove(group);

    for (var i = 0; i < items.length; i++) {
        canvas.add(items[i]);
        canvas.remove(origItems[i]);
    }
}

function flipY() {
    var group = new fabric.Group();
    var origItems = canvas._objects;

    group.set({width: canvas.width, height: canvas.height, left: canvas.width, top: 0, originX: 'center', originY: 'center', centeredRotation: true})        
    
    var obj = canvas.getObjects();
    for(i=obj.length - 1; i >= 0;i--){
        group.add(obj[i]);
        obj[i].flipY2 = !obj[i].flipY2;
    }

    canvas.add(group);
    group.set("angle", "-180").set('flipY', true);

    if(canvas.backgroundImage){
        angle = (angle + 180) % 360;
        console.log(angle);


        if(angle == 90 || angle == 270 || angle == -90 || angle == -270){
            backgroundFlipX = !backgroundFlipX;
            canvas.backgroundImage.setAngle(angle).set('flipX', backgroundFlipX);   
        } else if(angle == 0 || angle == 180 || angle == -0 || angle == -180){
            backgroundFlipY = !backgroundFlipY;
            canvas.backgroundImage.setAngle(angle).set('flipY', backgroundFlipY);   
        }

        if(angle == 0) {
            canvas.backgroundImage.top = 0;
            canvas.backgroundImage.left = 0;
        } else if(angle == 180 || angle == -180) {
            canvas.backgroundImage.top = canvas.height;
            canvas.backgroundImage.left = canvas.width;
        }
    }

    canvas.renderAll();

    items = group._objects;
    group._restoreObjectsState();
    canvas.remove(group);

    for (var i = 0; i < items.length; i++) {
        canvas.add(items[i]);
        canvas.remove(origItems[i]);
    }
}

function flipX() {
    var group = new fabric.Group();
    var origItems = canvas._objects;

    group.set({width: canvas.width, height: canvas.height, left: 0, top: canvas.height, originX: 'center', originY: 'center', centeredRotation: true})        
    
    var obj = canvas.getObjects();
    for(i=obj.length - 1; i >= 0;i--){
        group.add(obj[i]);
        obj[i].flipX2 = !obj[i].flipX2;
    }

    canvas.add(group);
    group.set("angle", "-180").set('flipX', true);

    if(canvas.backgroundImage){
        angle = (angle + 180) % 360;
        console.log(angle);


        if(angle == 90 || angle == 270 || angle == -90 || angle == -270){
            backgroundFlipY = !backgroundFlipY;
            canvas.backgroundImage.setAngle(angle).set('flipY', backgroundFlipY);  
        } else if(angle == 0 || angle == 180 || angle == -0 || angle == -180){
            backgroundFlipX = !backgroundFlipX;
            canvas.backgroundImage.setAngle(angle).set('flipX', backgroundFlipX);   
        }

        if(angle == 0) {
            canvas.backgroundImage.top = 0;
            canvas.backgroundImage.left = 0;
        } else if(angle == 180 || angle == -180) {
            canvas.backgroundImage.top = canvas.height;
            canvas.backgroundImage.left = canvas.width;
        }
    }

    canvas.renderAll();

    items = group._objects;
    group._restoreObjectsState();
    canvas.remove(group);

    for (var i = 0; i < items.length; i++) {
        canvas.add(items[i]);
        canvas.remove(origItems[i]);
    }
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
    width = width || initWidth;
    height = height || initHeight;
    bg = canvas.backgroundColor
    canvas.clear();
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
    canvas.setZoom(1);
    canvas.setHeight(initHeight);
    canvas.setWidth(initWidth);
    document.getElementById('canvasWrapper').style.width = canvas.getWidth() + "px";
    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
    canvas.setHeight(height);
    canvas.setWidth(width);
    angle = 0;
    backgroundFlipY = false;
    backgroundFlipX = false;
    initWidth = canvas.getWidth();
    initHeight = canvas.getHeight();
    updateLayers();
    $('.close').click();
    document.getElementById('canvasWrapper').style.width = width + "px";
}

function resizeCanvas(width, height) {
    var width = width || initWidth;
    var height = height || initHeight;
    var bg = canvas.backgroundColor
    if(document.getElementById('resizeTransparent').checked){
        bg=null;
    } else {
        if(document.getElementById('resizeBgcolour').value!=''){
            bg=document.getElementById('bgcolour').value;
        }
    }
    
    if(document.getElementById('resizeType').value == 'percent'){
        var obj = canvas.getObjects();
        for(i=obj.length - 1; i >= 0;i--){
            obj[i].width = obj[i].width *(width/100);
            obj[i].height = obj[i].height *(height/100);
            obj[i].left = obj[i].left*(width/100);
            obj[i].top = obj[i].top*(height/100);
        }
        width = initWidth*(width/100);
        height = initHeight*(height/100);
    }

    if(canvas.backgroundImage){
        canvas.backgroundImage.width = width;
        canvas.backgroundImage.height = height;
        canvas.renderAll()
    }

    canvas.setZoom(1);
    canvas.setHeight(initHeight);
    canvas.setWidth(initWidth);
    document.getElementById('canvasWrapper').style.width = canvas.getWidth() + "px";
    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
    canvas.setHeight(height);
    canvas.setWidth(width);
    initWidth = canvas.getWidth();
    initHeight = canvas.getHeight();
    updateLayers();
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
            canvas.setZoom(1);
            document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
            canvas.clear();
            canvas.setWidth(img.width);
            canvas.setHeight(img.height);
            canvas.setBackgroundImage(cImg, canvas.renderAll.bind(canvas));
            canvas.background = false;
            document.getElementById('canvasWrapper').style.width = img.width + "px";
            angle = 0;
            backgroundFlipY = false;
            backgroundFlipX = false;
            initWidth = canvas.getWidth();
            initHeight = canvas.getHeight();
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
    console.log("here");
    var files = evt.target.files;
    var output = [];
    if (!files[0].type.match('image.*')) {
        return;
    }

    var reader = new FileReader();

    myAppModule.init(files[0], reader);

    reader.onload = myAppModule.OnloadFile;

    reader.readAsDataURL(files[0]);
    document.getElementById("selectFile").value = "";

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