//Canvac creation
var canvas = new fabric.Canvas('c');  //creates Fabric.JS canvas object
canvas.enableRetinaScaling = false; //Disables retina scaling for high res displays
canvas.backgroundColor="white"; //Sets canvas background colour to white
fabric.Object.prototype.selectable = false; //Makes all objects unselectable
canvas.setHeight(400); //Sets height of canvas to 400
canvas.setWidth(600); //Sets width of canvas to 600
canvas.preserveObjectStacking = true; //Disables the currently selected objects from appearing on top of all others, even if they are places lower
$("#canvasWrapper").width(canvas.getWidth()); //Sets the checkboard backgroun pattern to the same width as the canvas
var angle = 0;
var backgroundFlipY = false;
var backgroundFlipX = false;
canvas.renderAll(); //Updates the canvas on screen
var initWidth = canvas.getWidth();
var initHeight = canvas.getHeight();
var panDiffTop = 0;
var panDiffLeft = 0;
var backgroundImageUrl;

$( function() {
    $( ".outer-drag" ).draggable({ //Makes any div with the outer-drag class draggable
        cancel: ".inner-drag", //Makes the above div be undraggable when inner-drag is clicked (to simulate only being able to drag when clicking on a "border")
        scroll: false //Stops draggable divs scrolling the page around
    });

    $( ".modal-drag" ).draggable({ //Makes modals draggable
        cancel: ".cancel-drag", //Disables drag on the contents of the modal like the input boxes and text
        scroll: false //Stops draggable modals scrolling the page around
    });

    $("#outer-layers").resizable({ //Makes the outer-layers window resizable
        handles: 'e, w', //Only allows horizontal resize
        minWidth: 232 //Can't be made smaller than 232 pixels
    });
});

/*
 * This function gets called whenever a tool icon is clicked - it resets the current settings to default and hides all the specific tool options
 * and makes all the objects unselectable.
 */
function hideOptions() {
    //Disables the currently selected tool
    canvas.eyedropper = false;
    canvas.isDrawingMode = false;
    canvas.rectDrawing = false;
    canvas.circleDrawing = false;
    canvas.textDrawing = false;
    canvas.cropMode = false;
    canvas.straightLineMode = false;

    //Makes the select box invisible as it should only be visible when the select tool is chosen
    canvas.selectionColor = "rgba(0,0,0,0)";
    canvas.selectionBorderColor = "rgba(0,0,0,0)";

    updateLayers(); //Updates the layer window

    $('.tool').css("border", "1px solid #EEE"); //Sets the border of the tool icon to be the same as the background (essentially hiding it)

    //Hides all tool specific options
    $("#drawing-mode-options").hide();
    $("#shape-mode-options").hide();
    $("#text-mode-options").hide();
    $("#locklab").hide();
    $("#straightlab").hide();
    $("#filter-options").hide();

    fabric.Object.prototype.selectable = false; //Makes all objects unselectable
}

/*
 * This gets called whenever an object gets added, removed, changes visibility, changes order or changes ID, and in a couple of places
 * It generates a list of objects in the order they appear on the canvas, and has buttons that call other functions for each object.
 */
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

/*
 * This function rotates the canvas, all objects on it and its background image by a certain number of degress. This only works with 90 or -90 degree turns.
 * It creates a canvas sized group of all the objects and then rotates the group around its center point
 * It also rotates the background image and depending on the final angle changes its offset from the top and left.
 * @param a Angle to rotate the canvas by
 */
function rotate(a) {
    var zoom = canvas.getZoom();
    canvas.setZoom(1);
    canvas.setDimensions({
        width: initWidth,
        height: initHeight
    });
    var width = canvas.getWidth();
    var height = canvas.getHeight();
    canvas.setWidth(height);
    canvas.setHeight(width);
    $("#canvasWrapper").width(canvas.getWidth());

    var group = new fabric.Group();
    var origItems = canvas._objects;

    if(a > 0){
        group.set({
            width: canvas.getWidth(),
            height: canvas.getHeight(),
            left: canvas.getWidth()/canvas.getZoom(),
            top: 0,
            originX: 'center',
            originY: 'center',
            centeredRotation: true
        })        
    } else {
        group.set({
            width: canvas.getWidth(),
            height: canvas.getHeight(),
            left: 0,
            top: canvas.getHeight()/canvas.getZoom(),
            originX: 'center',
            originY: 'center',
            centeredRotation: true
        })            
    }
    

    var obj = canvas.getObjects();
    for(i=obj.length - 1; i >= 0;i--){
        group.add(obj[i]);
    }
    canvas.add(group);
    group.set({angle: a});

    if(canvas.backgroundImage){
        angle = canvas.backgroundImage.angle;
        angle = (angle + a) % 360;
        console.log(angle);

        canvas.backgroundImage.setAngle(angle);

        if(angle == 0) {
            canvas.backgroundImage.top = 0;
            canvas.backgroundImage.left = 0;
        } else if(angle == 90 || angle == -270){
            canvas.backgroundImage.top = 0;
            canvas.backgroundImage.left = canvas.getWidth()/canvas.getZoom();
        } else if(angle == 180 || angle == -180) {
            canvas.backgroundImage.top = canvas.getHeight()/canvas.getZoom();
            canvas.backgroundImage.left = canvas.getWidth()/canvas.getZoom();
        } else if(angle == 270 || angle == -90){
            canvas.backgroundImage.top = canvas.getHeight()/canvas.getZoom();
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
        items[i].hasControls = true;
        //items[i].originX = right;
        //items[i].originY = top;
        //canvas.add(items[i]);
        //canvas.remove(origItems[i]);
    }

    canvas.setZoom(zoom);
    canvas.setDimensions({
        width: initWidth * canvas.getZoom(),
        height: initHeight * canvas.getZoom()
    });
    $("#canvasWrapper").width(canvas.getWidth());
    
    canvas.calcOffset();
    $("#select").click();
}

/*
 * Flips the canvas and all objects vertically. Works very similarly to the rotation, but as well as rotating everything -180 degrees, it also flips them,
 * to simulate a verticle flip.
 */
function flipY() {
    var group = new fabric.Group();
    var origItems = canvas._objects;

    group.set({width: canvas.getWidth(), height: canvas.getHeight(), left: canvas.getWidth(), top: 0, originX: 'center', originY: 'center', centeredRotation: true})        
    
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
            canvas.backgroundImage.top = canvas.getHeight();
            canvas.backgroundImage.left = canvas.getWidth();
        }
    }

    canvas.renderAll();

    items = group._objects;
    group._restoreObjectsState();
    canvas.remove(group);

    for (var i = 0; i < items.length; i++) {
        items[i].hasControls = true;
        //canvas.add(items[i]);
        //canvas.remove(origItems[i]);
    }
}

/*
 * Flips the canvas and all objects horizontally. Works very similarly to the rotation, but as well as rotating everything -180 degrees, it also flips them,
 * to simulate a horizontal flip.
 */
function flipX() {
    var group = new fabric.Group();
    var origItems = canvas._objects;

    group.set({width: canvas.getWidth(), height: canvas.getHeight(), left: 0, top: canvas.getHeight(), originX: 'center', originY: 'center', centeredRotation: true})        
    
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
            canvas.backgroundImage.top = canvas.getHeight();
            canvas.backgroundImage.left = canvas.getWidth();
        }
    }

    canvas.renderAll();

    items = group._objects;
    group._restoreObjectsState();
    canvas.remove(group);

    for (var i = 0; i < items.length; i++) {
        items[i].hasControls = true;
        //canvas.add(items[i]);
        //canvas.remove(origItems[i]);
    }
}

/*
 * Sends the object backwards relative to other objects, and then updates the layers list
 * @param index The index of the object to be moved
 */
function moveBack(index) {
    canvas.sendBackwards(canvas.item(index));
    updateLayers();
}

/*
 * Brings the object forwards relative to other objects, and then updates the layers list
 * @param index The index of the object to be moved
 */
function moveForwards(index) {
    canvas.bringForward(canvas.item(index));
    updateLayers();
}

/*
 * Deletes the object at index
 * @param index The index of the object to be deleted
 */
function deleteObj(index) {
    canvas.getObjects()[index].remove();
    updateLayers();
}

/*
 * Zooms the canvas in by 1% and increases the width and height of the canvas by the new zoom level to simulate a zoom in
 */
function zoomIn() {
    canvas.setZoom(canvas.getZoom() + 0.01 );
    canvas.setDimensions({
            width: initWidth * canvas.getZoom(),
            height: initHeight * canvas.getZoom()
    });
    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
    $("#canvasWrapper").width(canvas.getWidth());
}

/*
 * Zooms the canvas out by 1 percentage point and decreases the width and height of the canvas by the new zoom level to simulate a zoom out
 */
function zoomOut() {
    canvas.setZoom(canvas.getZoom() - 0.01 );
    canvas.setDimensions({
        width: initWidth * canvas.getZoom(),
        height: initHeight * canvas.getZoom()
    });
    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
    $("#canvasWrapper").width(canvas.getWidth());
}

/*
 * Resets the zoom level of the canvas to 100% and the width and height to its initial values
 */
function resetZoom() {
    canvas.setZoom(1);
    canvas.setDimensions({
        width: initWidth,
        height: initHeight
    });
    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
    $("#canvasWrapper").width(canvas.getWidth());
}

/*
 * Moves the editable canvas area within the canvas viewport to simulate panning around
 * @param x The horizontal distance to pan by, plus or minus value to move different directions
 * @param y The parrallel distance to pan by, plus or minus value to move different directions
 */
function pan(x, y) {
    var marginTop = $("#canvasWrapper").css("margin-top");
    marginTop = parseInt(marginTop) + parseInt(y);
    $("#canvasWrapper").css("margin-top", (marginTop) + "px");

    var marginLeft = $("#canvasWrapper").css("margin-left");
    marginLeft = parseInt(marginLeft) + parseInt(x);
    $("#canvasWrapper").css("margin-left", (marginLeft) + "px");



    // var delta = new fabric.Point(x,y) ;
    // canvas.relativePan(delta);
    // panDiffLeft += Math.round(x*(1/canvas.getZoom()));
    // panDiffTop += Math.round(y*(1/canvas.getZoom()));
    // document.getElementById("pan").innerHTML = "Relative pan: " + panDiffLeft + ", " + panDiffTop;
}

/*
 * Restes the canvas viewport to default by setting the absolute pan distance to 0, 0.
 */
function resetPan() {
    $("#canvasWrapper").css("margin-left", "auto");
    $("#canvasWrapper").css("margin-right", "auto");
    $("#canvasWrapper").css("margin-top", "115px");

    // var delta = new fabric.Point(0,0) ;
    // canvas.absolutePan(delta);
    // panDiffTop = 0;
    // panDiffLeft = 0;
    // document.getElementById("pan").innerHTML = "Relative pan: " + panDiffLeft + ", " + panDiffTop;
}

/*
 * Programatically selects an object or creates a group of objects cased on a click or other event.
 * If select is held down and an object is already selected it will create a group and add the two objects to it (essentially selecting them both)
 * If select is held down and a group is already selected it will add the clicked object to the group
 * If select isn't held down it will just select the sing object
 * @param event The Javascript event object
 * @param index The index of the object to be selected
 */
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
        $("#canvasWrapper").width(canvas.getWidth());
        document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
        canvas.setHeight(height);
        canvas.setWidth(width);
        angle = 0;
        backgroundFlipY = false;
        backgroundFlipX = false;
        initWidth = canvas.getWidth();
        initHeight = canvas.getHeight();
        if(canvas.getWidth() > $(window).width()) {
            canvas.setZoom(($(window).width()-300)/canvas.getWidth());
            canvas.setDimensions({
                    width: initWidth * canvas.getZoom(),
                    height: initHeight * canvas.getZoom()
            });
            document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
        }
        if(canvas.getHeight() > ($(window).height()-115)) {
            console.log("height");
            canvas.setZoom(($(window).height()-200)/initHeight);
            canvas.setDimensions({
                    width: initWidth * canvas.getZoom(),
                    height: initHeight * canvas.getZoom()
            });
            document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
        }
        resetPan();
        updateLayers();
        $('.close').click();
        $("#canvasWrapper").width(canvas.getWidth());
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
            canvas.backgroundImage.width = parseInt(width);
            canvas.backgroundImage.height = parseInt(height);
        } else if(canvas.backgroundImage.angle == 90 || canvas.backgroundImage.angle == -270) {
            canvas.backgroundImage.left = width/canvas.getZoom();
            canvas.backgroundImage.width = parseInt(height);
            canvas.backgroundImage.height = parseInt(width);
        } else if(canvas.backgroundImage.angle == -90 || canvas.backgroundImage.angle == 270){
            canvas.backgroundImage.top = height/canvas.getZoom();
            canvas.backgroundImage.width = parseInt(height);
            canvas.backgroundImage.height = parseInt(width);
        } else if(Math.abs(canvas.backgroundImage.angle) == 180) {
            canvas.backgroundImage.top = height/canvas.getZoom();
            canvas.backgroundImage.left = width/canvas.getZoom();
            canvas.backgroundImage.width = parseInt(width);
            canvas.backgroundImage.height = parseInt(height);
        }
        canvas.renderAll()
    }

    canvas.setZoom(1);
    canvas.setHeight(initHeight);
    canvas.setWidth(initWidth);
    $("#canvasWrapper").width(canvas.getWidth());
    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
    canvas.setHeight(height);
    canvas.setWidth(width);
    canvas.backgroundColor = bg;
    canvas.renderAll();
    initWidth = canvas.getWidth();
    initHeight = canvas.getHeight();
    if(canvas.getWidth() > $(window).width()) {
        canvas.setZoom(($(window).width()-300)/canvas.getWidth());
        canvas.setDimensions({
                width: initWidth * canvas.getZoom(),
                height: initHeight * canvas.getZoom()
        });
        document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
    }
    if(canvas.getHeight() > ($(window).height()-115)) {
        console.log("height");
        canvas.setZoom(($(window).height()-200)/initHeight);
        canvas.setDimensions({
                width: initWidth * canvas.getZoom(),
                height: initHeight * canvas.getZoom()
        });
        document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
    }
    updateLayers();
    $('.close').click();
    $("#canvasWrapper").width(canvas.getWidth());
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
            id: 'image ',
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
                $("#canvasWrapper").width(canvas.getWidth());
                angle = 0;
                backgroundFlipY = false;
                backgroundFlipX = false;
                initWidth = canvas.getWidth();
                initHeight = canvas.getHeight();
                backgroundImageUrl = canvas.backgroundImage.toDataURL();
                if(canvas.getWidth() > $(window).width()) {
                    canvas.setZoom(($(window).width()-300)/canvas.getWidth());
                    canvas.setDimensions({
                            width: initWidth * canvas.getZoom(),
                            height: initHeight * canvas.getZoom()
                    });
                    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
                    $("#canvasWrapper").width(canvas.getWidth());
                }
                if(canvas.getHeight() > ($(window).height()-115)) {
                    console.log("height");
                    canvas.setZoom(($(window).height()-200)/initHeight);
                    canvas.setDimensions({
                            width: initWidth * canvas.getZoom(),
                            height: initHeight * canvas.getZoom()
                    });
                    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
                    $("#canvasWrapper").width(canvas.getWidth());
                }
                resetPan();
                $('#select-mode').click();
            }
        } else {
            canvas.incrementer['image']++;
            cImg.id = 'image ' + canvas.incrementer['image'];
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

$(window).resize(function(e){
    $("#canvasWrapper").css("margin-left", "auto");
    $("#canvasWrapper").css("margin-right", "auto");
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
        if($($(this).data('popover')).hasClass("open")){
            closePopover();    
        } else {
            closePopover();
            var popover = $($(this).data('popover'));
            popover.toggleClass('open')
            e.stopImmediatePropagation();
        }
    }

    function closePopover(e) {
        if($('.popover.open').length > 0) {
            $('.popover').removeClass('open')
        }
    }

    init();

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }
});