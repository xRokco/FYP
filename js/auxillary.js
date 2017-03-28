//Canvac creation
var canvas = new fabric.Canvas('c');
canvas.enableRetinaScaling = false;
canvas.backgroundColor="white";
fabric.Object.prototype.selectable = false;
canvas.setHeight(400);
canvas.setWidth(600);
canvas.preserveObjectStacking = true;
document.getElementById('canvasWrapper').style.width = canvas.getWidth() + "px";
var angle = 0;
var backgroundFlipY = false;
var backgroundFlipX = false;
canvas.renderAll();
var initWidth = canvas.getWidth();
var initHeight = canvas.getHeight();
var panDiffTop = 0;
var panDiffLeft = 0;
var transformedP = {};
transformedP.x = 0;
transformedP.y = 0;
var backgroundImageUrl;

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
    canvas.cropMode = false;
    canvas.straightLineMode = false;
    canvas.selectionColor = "rgba(0,0,0,0)";
    canvas.selectionBorderColor = "rgba(0,0,0,0)";

    updateLayers();

    $('.tool').css("border", "1px solid #EEE");

    document.getElementById("drawing-mode-options").style.display = 'none';
    document.getElementById("shape-mode-options").style.display = 'none';
    document.getElementById("text-mode-options").style.display = 'none';
    document.getElementById("locklab").style.display = 'none';
    document.getElementById("straightlab").style.display = 'none';
    document.getElementById("filter-options").style.display = "none";
    fabric.Object.prototype.selectable = false;
}

function updateLayers() {
    var obj = canvas.getObjects();
    var text = "";
    for(i=obj.length - 1; i >= 0;i--){
        if(i == obj.length - 1){
            var up = "<img src=\"images/up.png\" style=\"opacity:0.1\">"
        } else {
            var up = "<img title=\"Bring object forwards\" src=\"images/up.png\" onclick=\"moveForwards(" + i + ")\">"
        }

        if(i == 0) {
            var down = "<img src=\"images/down.png\" style=\"opacity:0.1\">";
        } else {
            var down = "<img title=\"Send object backwards\" src=\"images/down.png\" onclick=\"moveBack(" + i + ")\">";
        }

        var selected = "";
        if(obj[i].active == true){
            var selected = "selected";
        }

        var image = "";
        var title = "Hide object";
        if(obj[i].visible == false) {
            var image = "-white";
            var title = "Make object visible";
        }

        text += "<div class=\"" + selected + "\">" + down + up + "<img title=\"Remove object\" class=\"delete\"src=\"images/delete.png\" onclick=\"deleteObj(" + i + ")\"><span title=\"" + obj[i].id + "\" onclick=\"selectLayer(event, " + i + ")\">" + obj[i].id + "</span><img title=\"" + title + "\" id=\"image" + i + "\" src=\"images/eye" +  image + ".png\" onclick=\"hideLayer(" + i + ")\"></div>"
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

    initWidth = canvas.getWidth();
    initHeight = canvas.getHeight();

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

function deleteObj(index) {
    canvas.getObjects()[index].remove();
    updateLayers();
}

function zoomIn() {
    canvas.setZoom(canvas.getZoom() + 0.01 );
    canvas.setDimensions({
            width: initWidth * canvas.getZoom(),
            height: initHeight * canvas.getZoom()
    });
    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
    document.getElementById('canvasWrapper').style.width = canvas.getWidth() + "px";
}

function zoomOut() {
    canvas.setZoom(canvas.getZoom() - 0.01 );
    canvas.setDimensions({
        width: initWidth * canvas.getZoom(),
        height: initHeight * canvas.getZoom()
    });
    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
    document.getElementById('canvasWrapper').style.width = canvas.getWidth() + "px";
}

function resetZoom() {
    canvas.setZoom(1);
    canvas.setDimensions({
        width: initWidth,
        height: initHeight
    });
    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
    document.getElementById('canvasWrapper').style.width = canvas.getWidth() + "px";
}

function pan(x, y) {
    var delta = new fabric.Point(x,y) ;
    canvas.relativePan(delta);
    panDiffLeft += Math.round(x*(1/canvas.getZoom()));
    panDiffTop += Math.round(y*(1/canvas.getZoom()));
}

function resetPan() {
    var delta = new fabric.Point(0,0) ;
    canvas.absolutePan(delta);
    panDiffTop = 0;
    panDiffLeft = 0;
}

function selectLayer(event, index) {
    if(event.shiftKey == true){
        if(canvas.getActiveGroup()){
            var objs = [];
            canvas.getActiveGroup()._objects.forEach(function(ele) {
                objs.push(ele);
            });
            canvas.deactivateAll();    
            
            var i;
            var alreadyIn = false;
            for (i = 0; i < objs.length; i++) {
                if (objs[i] === canvas.item(index)) {
                    alreadyIn = true;
                }
            }

            if(alreadyIn == false){
                objs.push(canvas.item(index));
            }

            objs.forEach(function(ele) {
                ele.set('active', true);
            });

            var group = new fabric.Group(objs, {
                originX: 'center',
                originY: 'center'
            });

            canvas._activeObject = null;
            group.setCoords();
            canvas.setActiveGroup(group).renderAll();
        } else if(canvas.getActiveObject()){
            var objs = [canvas.getActiveObject(), canvas.item(index)];

            objs.forEach(function(ele) {
                ele.set('active', true);
            });

            //create group
            var group = new fabric.Group(objs, {
                originX: 'center',
                originY: 'center'
            });

            canvas._activeObject = null;
            group.setCoords();
            canvas.setActiveGroup(group).renderAll();
        } else {
            canvas.deactivateAll().renderAll();
            $('#select-mode').click();
            canvas.setActiveObject(canvas.item(index));
        }
    } else {
        canvas.deactivateAll().renderAll();
        $('#select-mode').click();
        canvas.setActiveObject(canvas.item(index));
    }
    updateLayers();
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
    if(canvas.getObjects().length > 0 || canvas.backgroundImage){
        var confirm = window.confirm("Are you sure you want to destroy current canvas to create a new one?");
    } else {
        var confirm = true;
    }

    if(confirm == true) {
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
        backgroundImageUrl = "";
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
}

function resizeCanvas(width, height) {
    var width = width || initWidth;
    var height = height || initHeight;
    var bg = canvas.backgroundColor
    if(document.getElementById('resizeTransparent').checked){
        bg=null;
    } else {
        if(document.getElementById('resizeBgcolour').value!=''){
            bg=document.getElementById('resizeBgcolour').value;
        }
    }
    
    if(document.getElementById('resizeType').value == 'percent'){
        var obj = canvas.getObjects();
        for(i=obj.length - 1; i >= 0;i--){
            if(obj[i].get('type')=='text'){
                if (width == height) {
                    obj[i].fontSize = obj[i].fontSize*(width/100);
                } else {
                    obj[i].scaleX = obj[i].scaleX *(width/100);
                    obj[i].scaleY = obj[i].scaleY *(height/100);
                }
            } else {
                obj[i].width = obj[i].width *(width/100);
                obj[i].height = obj[i].height *(height/100);
            }
            obj[i].left = obj[i].left*(width/100);
            obj[i].top = obj[i].top*(height/100);
        }
        width = initWidth*(width/100);
        height = initHeight*(height/100);
    } else {
        var obj = canvas.getObjects();
        var widthRatio = width/initWidth;
        var heightRatio = height/initHeight; 
        for(i=obj.length - 1; i >= 0;i--){
            if(obj[i].get('type')=='text'){
                if (widthRatio == heightRatio) {
                    obj[i].fontSize = obj[i].fontSize*widthRatio;
                } else {
                    obj[i].scaleX = obj[i].scaleX * widthRatio;
                    obj[i].scaleY = obj[i].scaleY * heightRatio;
                }
            } else {
                obj[i].width = obj[i].width *widthRatio;
                obj[i].height = obj[i].height *heightRatio;
            }
            obj[i].left = obj[i].left*widthRatio;
            obj[i].top = obj[i].top*heightRatio;
        }
    }

    if(canvas.backgroundImage){
        if(Math.abs(canvas.backgroundImage.angle) == 0) {
            canvas.backgroundImage.width = width;
            canvas.backgroundImage.height = height;
        } else if(canvas.backgroundImage.angle == 90 || canvas.backgroundImage.angle == -270) {
            canvas.backgroundImage.left = width;
            canvas.backgroundImage.width = height;
            canvas.backgroundImage.height = width;
        } else if(canvas.backgroundImage.angle == -90 || canvas.backgroundImage.angle == 270){
            canvas.backgroundImage.top = height;
            canvas.backgroundImage.width = height;
            canvas.backgroundImage.height = width;
        } else if(Math.abs(canvas.backgroundImage.angle) == 180) {
            canvas.backgroundImage.top = height;
            canvas.backgroundImage.left = width;
            canvas.backgroundImage.width = width;
            canvas.backgroundImage.height = height;
        }
        canvas.renderAll()
    }

    canvas.setZoom(1);
    canvas.setHeight(initHeight);
    canvas.setWidth(initWidth);
    document.getElementById('canvasWrapper').style.width = canvas.getWidth() + "px";
    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
    canvas.setHeight(height);
    canvas.setWidth(width);
    canvas.backgroundColor = bg;
    canvas.renderAll();
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
        if(canvas.getActiveObject().get("id").startsWith("square")) {
            return "square";
        } else {
            return canvas.getActiveObject().get("type");
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
            if(canvas.getObjects().length > 0 || canvas.backgroundImage){
                var confirm = window.confirm("Are you sure you want to destroy current canvas to create a new one with this image?");
            } else {
                var confirm = true;
            }

            if(confirm == true) {
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
                backgroundImageUrl = canvas.backgroundImage.toDataURL();
                $(window).resize();
                $('#select-mode').click();
            }
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
    document.getElementById("background").value = "";
}

$(window).on('beforeunload', function (e) {
    if(canvas.getObjects().length > 0 || canvas.backgroundImage){
        var confirmationMessage = 'It looks like you have been editing an image. '
                        + 'If you leave before saving, your changes will be lost.';

        return confirmationMessage;
    }
});

$(document).ready(function() {
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