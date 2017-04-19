/* These functions control almost everything that occurs in the background and on tools in the menu such as rotation, flipping, zooming, panning, etc
 *
 * Author: Matt Carrick
 * Website: http://stijl.cf
 */

//Canvac creation
var canvas = new fabric.Canvas('c');  //creates Fabric.JS canvas object
canvas.enableRetinaScaling = false; //Disables retina scaling for high res displays
canvas.backgroundColor="white"; //Sets canvas background colour to white
fabric.Object.prototype.selectable = false; //Makes all objects unselectable
canvas.setHeight(400); //Sets height of canvas to 400
canvas.setWidth(600); //Sets width of canvas to 600
canvas.preserveObjectStacking = true; //Disables the currently selected objects from appearing on top of all others, even if they are places lower
$("#canvasWrapper").width(canvas.getWidth()); //Sets the checkboard backgroun pattern to the same width as the canvas
canvas.renderAll(); //Updates the canvas on screen
//Initializes some global variables
var angle = 0;
var backgroundFlipY = false;
var backgroundFlipX = false;
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
    var obj = canvas.getObjects(); //Get array of all objects on the canvas
    var text = ""; //Initialise the variable to hold the HTML text
    for(i=obj.length - 1; i >= 0;i--){ //Loop through each object
        if(i == obj.length - 1){ //If current object is last in list, make the bring object forward button disabled and greyed out
            var up = "<img src=\"images/up.png\" style=\"opacity:0.1\">"
        } else { //Otherwise, add a bring object forward button that changes object order when clicked
            var up = "<img title=\"Bring object forwards\" src=\"images/up.png\" onclick=\"moveForwards(" + i + ")\">"
        }

        if(i == 0) { //If current object is first in list, make the send object backward button disabled and greyed out
            var down = "<img src=\"images/down.png\" style=\"opacity:0.1\">";
        } else { //Otherwise, add a send object backward button that changes object order when clicked
            var down = "<img title=\"Send object backwards\" src=\"images/down.png\" onclick=\"moveBack(" + i + ")\">";
        }

        //If the current object is active (i.e. is selected) add a class the 'selected' class to its HTML, which will change its colour.
        //Otherwise the class is the empty string
        var selected = "";
        if(obj[i].active == true){
            var selected = "selected";
        }

        //If the current object is not visible (i.e. is hidden) change the image link from a full eye to a more hollow eye to indicate this
        //And change its title to reflect this
        var image = "";
        var title = "Hide object";
        if(obj[i].visible == false) {
            var image = "-white";
            var title = "Make object visible";
        }

        //Concat together all the HTML and the variables as set above
        text += "<div class=\"" + selected + "\">" + down + up + "<img title=\"Remove object\" class=\"delete\"src=\"images/delete.png\" onclick=\"deleteObj(" + i + ")\"><span title=\"" + obj[i].id + "\" onclick=\"selectLayer(event, " + i + ")\">" + obj[i].id + "</span><img title=\"" + title + "\" id=\"image" + i + "\" src=\"images/eye" +  image + ".png\" onclick=\"hideLayer(" + i + ")\"></div>"
    }
    document.getElementById("layers").innerHTML = text; //Add the full HTML code to the layers window
}

/*
 * This function rotates the canvas, all objects on it and its background image by a certain number of degress. This only works with 90 or -90 degree turns.
 * It creates a canvas sized group of all the objects and then rotates the group around its center point
 * It also rotates the background image and depending on the final angle changes its offset from the top and left.
 * @param a Angle to rotate the canvas by
 */
function rotate(a) {
    //Get current zoom and temporarily reset zoom to 100%
    var zoom = canvas.getZoom();
    resetZoom();

    //Get the canvas width and height and switch them to rotate the canvas size
    var width = canvas.getWidth();
    var height = canvas.getHeight();
    canvas.setWidth(height);
    canvas.setHeight(width);
    $("#canvasWrapper").width(canvas.getWidth()); //Sets the checkboard backgroun pattern to the same width as the canvas

    var group = new fabric.Group(); //Create a new FabricJS group

    if(a > 0){ //If rotating clockwise (a = 90)
        group.set({ //Set the groups values to be the width and height of the canvas and have a left offset the same width of the canvas. Rotate it about its center.
            width: canvas.getWidth(),
            height: canvas.getHeight(),
            left: canvas.getWidth(),
            top: 0,
            originX: 'center',
            originY: 'center',
            centeredRotation: true
        })        
    } else { //Otherwise, rotating counter clockwise (a = -90)
        group.set({ //Set the groups values to be the width and height of the canvas and have a top offset the same height of the canvas. Rotate it about its center.
            width: canvas.getWidth(),
            height: canvas.getHeight(),
            left: 0,
            top: canvas.getHeight(),
            originX: 'center',
            originY: 'center',
            centeredRotation: true
        })            
    }
    

    var obj = canvas.getObjects(); //Get all the objects on the canvas
    for(i=obj.length - 1; i >= 0;i--){ //Loop through the objects
        group.add(obj[i]); //Add each object to the group
    }
    canvas.add(group); //Add the group to the canvas
    group.set({angle: a}); //Set the groups angle to 90 or -90 (rotating all the objects)

    if(canvas.backgroundImage){ //If the canvas has a background image, rotate it
        angle = canvas.backgroundImage.angle; //Get the current image angle
        angle = (angle + a) % 360; //Add either 90 or -90 (a) to the current angle (angle), and then reduce to to be less than the absolute value of 360 using modulus
        console.log(angle);

        canvas.backgroundImage.setAngle(angle); //Set the images new angle to be what was calculated above

        if(angle == 0) { //Depending on the new angle, change the canvas offset
            canvas.backgroundImage.top = 0;
            canvas.backgroundImage.left = 0;
        } else if(angle == 90 || angle == -270){
            canvas.backgroundImage.top = 0;
            canvas.backgroundImage.left = canvas.getWidth();
        } else if(angle == 180 || angle == -180) {
            canvas.backgroundImage.top = canvas.getHeight();
            canvas.backgroundImage.left = canvas.getWidth();
        } else if(angle == 270 || angle == -90){
            canvas.backgroundImage.top = canvas.getHeight();
            canvas.backgroundImage.left = 0;
        }
    }

    canvas.renderAll(); //Render all the changes

    initWidth = canvas.getWidth(); //Generate a new initWidth for the rotated canvas.
    initHeight = canvas.getHeight(); //Generate a new initHeight for the rotated canvas.

    items = group._objects; //Get the objects from the group
    group._restoreObjectsState(); //Restore them to be seperate objects (not in a group)
    canvas.remove(group); //Remove the group completely

    for (var i = 0; i < items.length; i++) { //Loop through each object
        items[i].hasControls = true; //Re-enable its controls.
        //items[i].originX = right;
        //items[i].originY = top;
        //canvas.add(items[i]);
        //canvas.remove(origItems[i]);
    }

    fixZoom(zoom); //Revert the zoom level to what it was at start of function
    
    canvas.calcOffset();
    $("#select").click(); //Enable select mode
}

/*
 * Flips the canvas and all objects vertically. Works very similarly to the rotation, but as well as rotating everything -180 degrees, it also flips them,
 * to simulate a verticle flip.
 */
function flipY() {
    var group = new fabric.Group(); //Create a new FabricJS group

    group.set({ //Set the groups values to be the width and height of the canvas and have a left offset the same width of the canvas. Rotate it about its center.
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        left: canvas.getWidth(),
        top: 0,
        originX: 'center',
        originY: 'center',
        centeredRotation: true
    });        
    
    var obj = canvas.getObjects(); //Get all the objects on the canvas
    for(i=obj.length - 1; i >= 0;i--){ //Loop through each object
        group.add(obj[i]); //Add it to the group
        obj[i].flipY2 = !obj[i].flipY2; //Change its flipY2 property from True to False or from False to True (this is for importing a possibly flipped object)
    }

    canvas.add(group); //Add the group to the canvas
    group.set("angle", "-180").set('flipY', true); //Set the groups flipY value to true and angle to -180 (simulating a verticle flip around the canvas center) 

    if(canvas.backgroundImage){ //If the canvas has a background image
        angle = (angle + 180) % 360; //Calculate its new angle as above
        console.log(angle);


        //If a background image is at 90 degree rotation, a normal vertical flip would appear to do what a horizontal flip is expected to do
        //i.e. flip the canvas horizontally, because the image is essentially on its side. This check allows for this.
        if(angle == 90 || angle == 270 || angle == -90 || angle == -270){ //If the canvas has been rotated +-90 or +-270 degress perform a horizontal flip rather than vertical
            backgroundFlipX = !backgroundFlipX; //Invert its backgroundFlipX property (again, used for importing and exporting)
            canvas.backgroundImage.setAngle(angle).set('flipX', backgroundFlipX); //Change its angle and horizontal flip the background image
        } else if(angle == 0 || angle == 180 || angle == -0 || angle == -180){ //If the canvas has been rotated +-0 or +-180 degress perform a vertical flip
            backgroundFlipY = !backgroundFlipY; //Invert its backgroundFlipY property (again, used for importing and exporting)
            canvas.backgroundImage.setAngle(angle).set('flipY', backgroundFlipY); //Change its angle and vertical flip the background image
        }

        //Change the offset depending on the final angle
        if(angle == 0) {
            canvas.backgroundImage.top = 0;
            canvas.backgroundImage.left = 0;
        } else if(angle == 180 || angle == -180) {
            canvas.backgroundImage.top = canvas.getHeight();
            canvas.backgroundImage.left = canvas.getWidth();
        }
    }

    canvas.renderAll(); //Render changes

    //Re-add objects from group to the canvas
    items = group._objects;
    group._restoreObjectsState();
    canvas.remove(group);

    for (var i = 0; i < items.length; i++) { //Fix all object controls
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
    var group = new fabric.Group(); //Create a new FabricJS group

    group.set({ //Set the groups values to be the width and height of the canvas and have a left offset the same width of the canvas. Rotate it about its center.
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        left: 0,
        top: canvas.getHeight(),
        originX: 'center',
        originY: 'center',
        centeredRotation: true
    });
    
    var obj = canvas.getObjects(); //Get all the objects on the canvas
    for(i=obj.length - 1; i >= 0;i--){ //Loop through each object
        group.add(obj[i]); //Add it to the group
        obj[i].flipX2 = !obj[i].flipX2; //Change its flipY2 property from True to False or from False to True (this is for importing a possibly flipped object)
    }

    canvas.add(group); //Add the group to the canvas
    group.set("angle", "-180").set('flipX', true); //Set the groups flipY value to true and angle to -180 (simulating a verticle flip around the canvas center) 

    if(canvas.backgroundImage){ //If the canvas has a background image
        angle = (angle + 180) % 360; //Calculate its new angle as above
        console.log(angle);

        //If a background image is at 90 degree rotation, a normal horizontal flip would appear to do what a vertical flip is expected to do
        //i.e. flip the canvas vertically, because the image is essentially on its side. This check allows for this.
        if(angle == 90 || angle == 270 || angle == -90 || angle == -270){ //If the canvas has been rotated +-90 or +-270 degress perform a vertical flip rather than horizontal
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
    canvas.sendBackwards(canvas.item(index)); //Re-orders the object
    updateLayers(); //Updates the html on the layers window
}

/*
 * Brings the object forwards relative to other objects, and then updates the layers list
 * @param index The index of the object to be moved
 */
function moveForwards(index) {
    canvas.bringForward(canvas.item(index)); //Re-orders the object
    updateLayers(); //Updates the html on the layers window
}

/*
 * Deletes the object at index
 * @param index The index of the object to be deleted
 */
function deleteObj(index) {
    canvas.getObjects()[index].remove(); //Deletes the object
    updateLayers(); //Updates the html on the layers window
}

/*
 * Zooms the canvas in by 1% and increases the width and height of the canvas by the new zoom level to simulate a zoom in
 */
function zoomIn() {
    canvas.setZoom(canvas.getZoom() + 0.01 ); //Sets the zoom to the old zoom +1 percentage point
    canvas.setDimensions({ //Changes the size of the canvas to the original width and height times the new zoom level
            width: initWidth * canvas.getZoom(),
            height: initHeight * canvas.getZoom()
    });
    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100; //Updates the zoom level HTML
    $("#canvasWrapper").width(canvas.getWidth()); //Updates the checkboard background pattern
}

/*
 * Zooms the canvas out by 1 percentage point and decreases the width and height of the canvas by the new zoom level to simulate a zoom out
 */
function zoomOut() {
    canvas.setZoom(canvas.getZoom() - 0.01 ); //Sets the zoom to the old zoom -1 percentage point
    canvas.setDimensions({ //Changes the size of the canvas to the original width and height times the new zoom level
        width: initWidth * canvas.getZoom(),
        height: initHeight * canvas.getZoom()
    });
    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100; //Updates the zoom level HTML
    $("#canvasWrapper").width(canvas.getWidth()); //Updates the checkboard background pattern
}

/*
 * Resets the zoom level of the canvas to 100% and the width and height to its initial values
 */
function resetZoom() {
    canvas.setZoom(1); //Changes zoom level to 100%
    canvas.setDimensions({ //Sets the size of the canvas to its original size
        width: initWidth,
        height: initHeight
    });
    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100; //Updates the zoom level HTML
    $("#canvasWrapper").width(canvas.getWidth()); //Changes the background checkboard pattern
}

/*
 * Sets the canvas zoom level to a specific value and changes its width and height to match
 * Used to revert the zoom level at the end of a function after the function forced it to 100%
 */
function fixZoom(zoom) {
    canvas.setZoom(zoom); //Sets zoom level to whatever was passed in the zoom variable
    canvas.setDimensions({ //Changes size of canvas to the original size times the new zoom level
        width: initWidth * canvas.getZoom(),
        height: initHeight * canvas.getZoom()
    });
    document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100; //Updates HTML
    $("#canvasWrapper").width(canvas.getWidth()); //Change backgroun pattern
}

/*
 * Moves the canvas around the page
 * @param x The horizontal distance to pan by, plus or minus value to move different directions
 * @param y The vertical distance to pan by, plus or minus value to move different directions
 */
function pan(x, y) {
    var marginTop = $("#canvasWrapper").css("margin-top"); //Get current top margin
    marginTop = parseInt(marginTop) + parseInt(y); //Add pan distance (y, usually 10 or -10) to top margin
    $("#canvasWrapper").css("margin-top", (marginTop) + "px"); //Changes top margin to new value

    var marginLeft = $("#canvasWrapper").css("margin-left"); //Get current left margin
    marginLeft = parseInt(marginLeft) + parseInt(x); //Add pan distance (x, usually 10 or -10) to left margin
    $("#canvasWrapper").css("margin-left", (marginLeft) + "px"); //Changes left margin to new value



    //Previous code - used fabricJS inbuilt pan to move the editable area within the fixed canvas viewpoint.
    //This worked but was a little confusing to use, especially if the user had cropped a background image

    // var delta = new fabric.Point(x,y) ;
    // canvas.relativePan(delta);
    // panDiffLeft += Math.round(x*(1/canvas.getZoom()));
    // panDiffTop += Math.round(y*(1/canvas.getZoom()));
    // document.getElementById("pan").innerHTML = "Relative pan: " + panDiffLeft + ", " + panDiffTop;
}

/*
 * Restes the canvas location to default by reseting the margins
 */
function resetPan() {
    $("#canvasWrapper").css("margin-left", "auto"); //Center the canvas horizontally
    $("#canvasWrapper").css("margin-right", "auto"); //Center the canvas horizontally
    $("#canvasWrapper").css("margin-top", "115px");

    //Previous code - used fabricJS inbuilt pan to move the editable area within the fixed canvas viewpoint.
    //This worked but was a little confusing to use, especially if the user had cropped a background image

    // var delta = new fabric.Point(0,0) ;
    // canvas.absolutePan(delta);
    // panDiffTop = 0;
    // panDiffLeft = 0;
    // document.getElementById("pan").innerHTML = "Relative pan: " + panDiffLeft + ", " + panDiffTop;
}

/*
 * Programatically selects an object or creates a group of objects cased on a click or other event.
 * If shift is held down and an object is already selected it will create a group and add the two objects to it (essentially selecting them both)
 * If shift is held down and a group is already selected it will add the clicked object to the group
 * If shift isn't held down it will just select the sing object
 * @param event The Javascript event object
 * @param index The index of the object to be selected
 */
function selectLayer(event, index) {
    if(event.shiftKey == true){ //If shift is held down
        if(canvas.getActiveGroup()){ //If a group already exists
            var objs = [];
            canvas.getActiveGroup()._objects.forEach(function(ele) { //Get the objects from the current group and push them to a new array
                objs.push(ele);
            });
            canvas.deactivateAll();    
            
            var i;
            var alreadyIn = false;
            for (i = 0; i < objs.length; i++) { //For each object in the group
                if (objs[i] === canvas.item(index)) { //If the clicked on object was already in the group
                    alreadyIn = true; //Set the alreadyIn value to true
                }
            }

            if(alreadyIn == false){ //If the clicked on object wasn't in the group, add it to the array of objects in the group
                objs.push(canvas.item(index));
            }

            objs.forEach(function(ele) { //For each object in the array
                ele.set('active', true); //Make it active (i.e. selected)
            });

            var group = new fabric.Group(objs, { //Create a new group containing the array of objects created above
                originX: 'center',
                originY: 'center'
            });

            canvas._activeObject = null;
            group.setCoords();
            canvas.setActiveGroup(group).renderAll(); //Set the group to be selected and render it on screen
        } else if(canvas.getActiveObject()){ //If a single object is already selected
            var objs = [canvas.getActiveObject(), canvas.item(index)]; //Create an array of the single previously selected object and the object clicked on

            objs.forEach(function(ele) { //Make them both active (i.e. selected)
                ele.set('active', true);
            });

            //create group of the above array
            var group = new fabric.Group(objs, {
                originX: 'center',
                originY: 'center'
            });

            canvas._activeObject = null;
            group.setCoords();
            canvas.setActiveGroup(group).renderAll(); //Set the group to be selected and render it on screen
        } else { //If nothing else it selected
            canvas.deactivateAll().renderAll(); //Make all other objects unselected
            $('#select-mode').click(); //Enter select mode
            canvas.setActiveObject(canvas.item(index)); //Make the clicked on object active
        }
    } else { //If shift key isn't held down
        canvas.deactivateAll().renderAll(); //Make all other objects unselected
        $('#select-mode').click(); //Enter select mode
        canvas.setActiveObject(canvas.item(index)); //Make the clicked on object active
    }
    updateLayers(); //Update layer window.
}

/*
 * Toggle the visibility of an object on the canvas
 * @param index The index of the object to be selected
 */
function hideLayer(index) {
    canvas.item(index).visible = !canvas.item(index).visible; //Invert the visible value
    updateLayers(); //Update the layer window
    canvas.renderAll(); //Render changes
}

/*
 * Creates a new canvas a certain width and height
 * @param width The width of the new canvas
 * @param height The height of the new canvas
 */
function newCanvas(width, height) {
    if(canvas.getObjects().length > 0 || canvas.backgroundImage){ //Check if the current canvas has any objects or a background image
        var confirm = window.confirm("Are you sure you want to destroy current canvas to create a new one?"); //If it does, warn the user of impending destruction of current canvas
    } else { //If the don't have any objects or a background image there's no point warning them
        var confirm = true;
    }

    if(confirm == true) { //If they accept the warning
        width = width || initWidth; //If the width var is empty use the current canvas width
        height = height || initHeight; //If the height var is empty use the current canvas height
        bg = canvas.backgroundColor //get the current canvas background colour
        canvas.clear(); //Clear the canvas
        if(document.getElementById('transparent').checked){ //If the user specified a transparent canvas, set the backgroundColor to null
            canvas.backgroundColor=null;
        } else {
            if(document.getElementById('bgcolour').value!=''){ //If the colour field was not empty use whatever was in it
                canvas.backgroundColor=document.getElementById('bgcolour').value;
            } else { //Otherwise use the background colour of the previous canvas
                canvas.backgroundColor = bg;
            }
        }
        
        fabric.Object.prototype.selectable = false;//Make all objects unselectable
        resetZoom(); //Set zoom to 100%
        canvas.setHeight(height); //Set the height
        canvas.setWidth(width); //Set the width

        //Revert some variables to their starting values
        angle = 0;
        backgroundFlipY = false;
        backgroundFlipX = false;
        backgroundImageUrl = "";

        //Set a new init size
        initWidth = canvas.getWidth();
        initHeight = canvas.getHeight();

        //Auto zoom out the canvas if the new canvas width is too wide
        if(canvas.getWidth() > $(window).width()) {//If canvas width is bigger than window width
            canvas.setZoom(($(window).width()-300)/canvas.getWidth()); //Set the zoom value to the width of the user window -300 divided by the width of the new canvas
            canvas.setDimensions({ //Set the width to match this zoom value
                    width: initWidth * canvas.getZoom(),
                    height: initHeight * canvas.getZoom()
            });
            document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100; //Update zoom html
        }

        //Auto zoom out the canvas if the new canvas height is too tall
        if(canvas.getHeight() > ($(window).height()-115)) { //If canvas height is bigger than window height (minus the margin)
            canvas.setZoom(($(window).height()-200)/initHeight); //Change zoom level similar to above
            canvas.setDimensions({
                    width: initWidth * canvas.getZoom(),
                    height: initHeight * canvas.getZoom()
            });
            document.getElementById("zoom").innerHTML = "Zoom level: " + Math.round(canvas.getZoom() * 100)/100;
        }

        resetPan(); //reset the location of the canvas to centered
        updateLayers(); //Update layer window
        $('.close').click(); //Close the modal used to create the canvas
        $("#canvasWrapper").width(canvas.getWidth()); //Fix the background checkboard pattern
    }
}

/*
 * Resize the canvas and everything on it to a certain width and height
 * @param width The new width of the canvas
 * @param height The new height of the canvas
 */
function resizeCanvas(width, height) {
    var width = width || initWidth; //If width isn't set use the initial width
    var height = height || initHeight; //If height isn't set use the initial height
    var bg = canvas.backgroundColor //get the current backgroundcolor of the canvas
    if(document.getElementById('resizeTransparent').checked){ //If the user wants to make their canvas transparent set the background to null
        bg=null;
    } else {
        if(document.getElementById('resizeBgcolour').value!=''){ //If the user writes something for a new bg colour then set this as their new colour
            bg=document.getElementById('resizeBgcolour').value;
        }
    }
    
    if(document.getElementById('resizeType').value == 'percent'){ //If the user is resizing with percentage
        var obj = canvas.getObjects(); //Get all objects
        for(i=obj.length - 1; i >= 0;i--){ //Loop through all objects
            if(obj[i].get('type')=='text'){ //If its a text object
                if (width == height) { //If the width and height values are the same (i.e. same aspect ratio resize)
                    obj[i].fontSize = obj[i].fontSize*(width/100); //change the font size of the text rather than scale to make it look sharper
                } else { //If the height and width are different, stretch/squash the text with the scale values
                    obj[i].scaleX = obj[i].scaleX *(width/100);
                    obj[i].scaleY = obj[i].scaleY *(height/100);
                }
            } else { //If the obejct is any type other than text change its width and height values
                obj[i].width = obj[i].width *(width/100);
                obj[i].height = obj[i].height *(height/100);
            }
            //Change the objects position based on how much the resized
            obj[i].left = obj[i].left*(width/100);
            obj[i].top = obj[i].top*(height/100);
        }
        //Get the new canvas size values
        width = initWidth*(width/100);
        height = initHeight*(height/100);
    } else { //If the user is resizing with fixed pixel values
        var obj = canvas.getObjects();  //Get objects
        //Find the ratio the canvas is being increased by
        var widthRatio = width/initWidth;
        var heightRatio = height/initHeight; 

        for(i=obj.length - 1; i >= 0;i--){//Loop through all objects
            if(obj[i].get('type')=='text'){ //If object is text
                if (widthRatio == heightRatio) {//if the the ratios are equal
                    obj[i].fontSize = obj[i].fontSize*widthRatio; //change font size rather than scale
                } else { //Otherwise change the scale
                    obj[i].scaleX = obj[i].scaleX * widthRatio;
                    obj[i].scaleY = obj[i].scaleY * heightRatio;
                }
            } else { //For any other object type other than text objects
                //Change the width and height of the objects
                obj[i].width = obj[i].width *widthRatio;
                obj[i].height = obj[i].height *heightRatio;
            }
            //Change the objects position based on their resize ratio
            obj[i].left = obj[i].left*widthRatio;
            obj[i].top = obj[i].top*heightRatio;
        }
    }

    resetZoom();//Reset zoom to 100%

    if(canvas.backgroundImage){ //if the canvas has a background image
        if(Math.abs(canvas.backgroundImage.angle) == 0) { //Depending on the angle of the background image, change its width and/or height and offset
            canvas.backgroundImage.width = parseInt(width);
            canvas.backgroundImage.height = parseInt(height);
        } else if(canvas.backgroundImage.angle == 90 || canvas.backgroundImage.angle == -270) {
            canvas.backgroundImage.left = width;
            canvas.backgroundImage.width = parseInt(height);
            canvas.backgroundImage.height = parseInt(width);
        } else if(canvas.backgroundImage.angle == -90 || canvas.backgroundImage.angle == 270){
            canvas.backgroundImage.top = height;
            canvas.backgroundImage.width = parseInt(height);
            canvas.backgroundImage.height = parseInt(width);
        } else if(Math.abs(canvas.backgroundImage.angle) == 180) {
            canvas.backgroundImage.top = height;
            canvas.backgroundImage.left = width;
            canvas.backgroundImage.width = parseInt(width);
            canvas.backgroundImage.height = parseInt(height);
        }
        canvas.renderAll(); //render changes
    }

    //Set the canvas width and height to their new values
    canvas.setHeight(height);
    canvas.setWidth(width);

    canvas.backgroundColor = bg; //Chaneg the canvas background colour
    canvas.renderAll(); //Render changes
    initWidth = canvas.getWidth(); //Set new initial width
    initHeight = canvas.getHeight(); //Set new initial height

    //Zoom the canvas out if the new size is too wide for the page, same code as above
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

    updateLayers();//update layer window
    $('.close').click();//close resize modal
    $("#canvasWrapper").width(canvas.getWidth());//fix background pattern
}

/*
 * Returns the type of object selected
 * @return {String} group if a group is selected, null if nothing is and the id/type if an object is
 */
function getSelectedType() {
    if (canvas.getActiveGroup()){ //If a group is selected return "group"
        return "group";
    } else if(canvas.getActiveObject()){ //If an object is selected
        if(canvas.getActiveObject().get("id").startsWith("square") && canvas.getActiveObject().get("type") != "text") { //If the selected object isn't text but its ID starts with "square" return "square"
            return "square";
        } else { //Otherwise, return the fabricjs type
            return canvas.getActiveObject().get("type");
        }
    } else { //If neither a group nor object is selected (i.e. nothing is selected) return null
        return null;
    }
}

//Image uploading
var myAppModule = (function () {
    
    //Initialise some variables
    var outObj = {};
    var file;
    var fileReader;
    var img;
    var cImg;

    var init = function (newFile, newFileReader) {
        file = newFile;
        fileReader = newFileReader;
    };

    var onloadImage = function () { //When the image loads
        cImg = new fabric.Image(img, { //create a fabricjs image from the uploaded image
            id: 'image ',
            left: 0,
            top: 0,
            angle: 0
        });

        if(canvas.background) { //If the background value is set (i.e. the uploaded image is being set as a background image for the canvas)
            if(canvas.getObjects().length > 0 || canvas.backgroundImage){ //Warn the user about destroying their canvas
                var confirm = window.confirm("Are you sure you want to destroy current canvas to create a new one with this image?");
            } else {
                var confirm = true;
            }

            if(confirm == true) { //If they proceed
                resetZoom(); // Reset the zoom to 100%
                canvas.clear(); //Clear the canvas

                //Set the canvas size to the same as the image
                canvas.setWidth(img.width);
                canvas.setHeight(img.height);
                canvas.setBackgroundImage(cImg, canvas.renderAll.bind(canvas)); //Set the background image to the uploaded image
                canvas.background = false; //reset the background var to false
                $("#canvasWrapper").width(canvas.getWidth()); //Fix background pattern

                //Reset a load of variables
                angle = 0;
                backgroundFlipY = false;
                backgroundFlipX = false;

                //Set new initial size
                initWidth = canvas.getWidth();
                initHeight = canvas.getHeight();

                backgroundImageUrl = canvas.backgroundImage.toDataURL(); //Set the backgrounImageUrl var to the base64 url of the background image

                //Zoom out if the canvas is too big for the window
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

                resetPan(); //Reset canvas location/margins
                $('#select-mode').click();//enter select mode
            }
        } else { //If the image is just being added to the canvas and not a background image
            canvas.incrementer['image']++;
            cImg.id = 'image ' + canvas.incrementer['image']; //Set the image object ID
            canvas.add(cImg); //Add the object to the canvas
            updateLayers(); //update the layer window
            $('#select-mode').click(); //Enter select mode
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

function handleFileSelect(evt) { //Handle file selection for the adding images function
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

function handleFileSelect2(evt) { //handle file selection for backgroun image function
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

$(window).on('beforeunload', function (e) { //If the window is about to be unloaded (tab closed, etc) give a warning about unsaved work
    if(canvas.getObjects().length > 0 || canvas.backgroundImage){
        var confirmationMessage = 'It looks like you have been editing an image. '
                        + 'If you leave before saving, your changes will be lost.';

        return confirmationMessage;
    }
});

$(window).resize(function(e){ //Whenever the window resizes, recenter the canvas
    $("#canvasWrapper").css("margin-left", "auto");
    $("#canvasWrapper").css("margin-right", "auto");
});

//Code to make the menu work, mostly from SkeletonCSS
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

    //Polyfill to make startsWith work on only IE versions (10 or lower)
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }
});