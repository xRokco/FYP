/* These functions control almost all the canvas event handlers and functions in the tools window like adding shapes, changing colours of tools
 * Also manages keyboard shortcut code
 *
 * Author: Matt Carrick
 * Website: http://stijl.cf
 */


/*
 * When page has finished loading -
 * - create the position coordinates object,
 * - get the canvas offset
 * - remove the canvas selection box
 */
$(document).ready(function(){
    //Make the selection box invisible
    canvas.selectionColor = "rgba(0,0,0,0)";
    canvas.selectionBorderColor = "rgba(0,0,0,0)";

    var context = document.getElementById("c").getContext("2d"); //create canvas context for eyedropper tool
    
    //create and initialize some variables
    var clipboard = []; //used for copy and paste
    var pasteMultiplier = 0; //used to offset each pasted object from the original/previous one
    

    canvas.incrementer = { //Used for the shape IDs/names
        rectangle: 0,
        square: 0,
        line: 0,
        ellipse: 0,
        circle: 0,
        image: 0
    }
    canvas.incrementer['straight line'] = 0;

    /*
     * Call the file upload functions when the relevant icon is clicked
     */
    $("#selectFile").change(handleFileSelect);
    $("#background").change(handleFileSelect2);

    /*
     * Enter object selection mode when the icon is clicked
     * Change the cursor to the hand
     * Hide all options
     * Set all objects to selectable
     */
    $("#select-mode").click(function(){
        //console.log("entering select");

        hideOptions(); //reset options
        $("#select-mode").css("border", "1px solid silver"); //draw a border around the hand icon

        //make the selection box visible
        canvas.selectionColor = "rgba(100, 100, 255, 0.3)";
        canvas.selectionBorderColor = "rgba(255, 255, 255, 0.3)";

        //change the cursor
        canvas.defaultCursor = "url('images/cursors/select.png'), auto";
        canvas.hoverCursor = "url('images/cursors/select.png'), auto";
        canvas.moveCursor = "url('images/cursors/select.png'), auto";

        fabric.Object.prototype.selectable = true; //make objects selectable
    });

    /*
     * Enter free drawing mode when the icon is clicked
     * Set the line width
     * Change the cursor to the pencil
     * Display the relevant options while hiding non-relevant
     */
    $("#drawing-mode").click(function() {
        //console.log("entering line drawing");
        canvas.deactivateAll().renderAll(); //deselect all objects and render changes

        hideOptions(); //reset options
        $("#drawing-mode").css("border", "1px solid silver"); //draw border on pencil icon

        //set straight line mode to the value of the straight checkbox (true or false)
        //set drawing mode to the onverse of that
        canvas.straightLineMode = document.getElementById("straight").checked;
        canvas.isDrawingMode = !document.getElementById("straight").checked;

        var refShape;//declare reference shape variable

        canvas.freeDrawingBrush.width = parseInt(document.getElementById("drawing-line-width").value, 10) || 1; //set the drawing line width

        //change the cursor
        canvas.freeDrawingCursor = "url('images/cursors/pencil.png'), auto";

        //Display the options
        $("#drawing-mode-options").show();
        $("#straightlab").show();
    });

    /*
     * Change the freeDrawingBrush color value when the colorpicker text field changes value
     */
    $("#colorvalue").change(function() {
        canvas.freeDrawingBrush.color = $.farbtastic("#colorpicker").color;
    });

    /*
     * Change the freeDrawingBrush width value when the slider changes
     */
    $('#drawing-line-width').change(function() {
        canvas.freeDrawingBrush.width = parseInt(document.getElementById("drawing-line-width").value, 10) || 1;
    });


    /*
     * Enter rectangle drawing mode when the icon is clicked
     * Init the shape variable
     * Change the cursor to the rectangle
     * Display the relevant options while hiding non-relevant
     */
    $('#rectangle-mode').click(function(){
        //console.log("entering rectangle mode");
        canvas.deactivateAll().renderAll(); //deselect all objects
        
        //Declaring the variables
        canvas.isMouseDown=false;
        var refShape;
        
        hideOptions(); //reset options

        $('#rectangle-mode').css("border", "1px solid silver");//draw border on square icon

        //show options
        $("#shape-mode-options").show();
        $("#locklab").show();

        //change cursor
        canvas.defaultCursor = "url('images/cursors/rectangle.png'), auto";
        canvas.hoverCursor = "url('images/cursors/rectangle.png'), auto";

        //enable rectangle drawing
        canvas.rectDrawing = true;
    });

    /*
     * Enter circle/ellipse drawing mode when the icon is clicked
     * Init the shape variable
     * Change the cursor to the circle
     * Display the relevant options while hiding non-relevant
     */
    $('#circle-mode').click(function(){
        //console.log("entering circle mode");
        canvas.deactivateAll().renderAll(); //deselect objects

        //Declaring the variables
        canvas.isMouseDown=false;
        var refShape;

        hideOptions(); //reset options

        $('#circle-mode').css("border", "1px solid silver");//draw border on circle icon

        //show options
        $("#shape-mode-options").show();
        $("#locklab").show();

        //change cursor
        canvas.defaultCursor = "url('images/cursors/circle.png'), auto";
        canvas.hoverCursor = "url('images/cursors/circle.png'), auto";

        //enable circle drawing
        canvas.circleDrawing = true;
    });

    /*
     * Enter text insertion mode when the icon is clicked
     * Change the cursor to the text
     * Display the relevant options while hiding non-relevant
     */
    $('#text-mode').click(function () {
        //console.log("entering text mode");
        canvas.deactivateAll().renderAll(); //deselect objects
        
        //Reset options variables
        document.getElementById('bold').checked = false;
        document.getElementById('italic').checked = false;
        document.getElementById('font').value = 'Lato';
        document.getElementById('text').value = "";

        hideOptions(); //reset options

        $('#text-mode').css("border", "1px solid silver"); //draw border on T icon

        //change cursor
        canvas.defaultCursor = "url('images/cursors/text.png'), auto";
        canvas.hoverCursor = "url('images/cursors/text.png'), auto";

        //enable text mode
        canvas.textDrawing = true;
    });

    /*
     * Enter eyedropper mode when the icon is clicked
     * Change the cursor to the eyedropper
     * Hide options
     */
    $('#eyedropper-mode').click(function (){
        //console.log("entering eyedropper mode");
        canvas.deactivateAll().renderAll(); //deselect objects

        hideOptions(); //hide objects
        $('#eyedropper-mode').css("border", "1px solid silver");//draw border on eyedropper icon

        //change cursor
        canvas.defaultCursor = "url('images/cursors/eyedropper.png'), auto";
        canvas.hoverCursor = "url('images/cursors/eyedropper.png'), auto";

        //enable eyedropper mode
        canvas.eyedropper = true;
    });

    /*
     * Enter crop mode when icon clicked
     * Change cursor to crop
     * Display the lock aspect ratio label
     */
    $('#crop-mode').click(function (){
        //console.log("entering crop mode");
        canvas.deactivateAll().renderAll(); //deselect objects
        
        //Declaring the variables
        canvas.isMouseDown=false;
        var refShape;
        
        hideOptions(); //reset options
        $('#crop-mode').css("border", "1px solid silver"); //draw border on crop icon

        $("#locklab").show(); //show lock label option

        //change cursor
        canvas.defaultCursor = "url('images/cursors/crop.png'), auto";
        canvas.hoverCursor = "url('images/cursors/crop.png'), auto";

        //enable crop mode
        canvas.cropMode = true;
    });

    /*
     * When mouse is clicked down on the canvas -
     * - set the isMouseDown variable to true
     * - get the color for the shape fill if the option is checked
     * - store the initial coordinates in variables
     * - if eyedropper mode is set get image data from pixel
     * - if rectangle mode is set create and add a rectangle object
     * - if circle mode is set create an ellipse object or create a circle object if the lock aspect ratio is checked and add them 
     * @param {Event} event Event object
     */
    canvas.on('mouse:down',function(event){   
        //Defining the procedure
        canvas.isMouseDown=true;

        //If the fill checkbox is checked, put the current colour in the fill variable, otherwise put the empty string
        if(document.getElementById('shape-fill').checked) {
            var fill = $.farbtastic('#colorpicker').color;
        } else {
            var fill = '';
        }

        //get the location where the canvas was clicked down on
        startPointLeft = canvas.getPointer().x;
        startPointTop = canvas.getPointer().y;

        if(canvas.straightLineMode) { //straightlinemode is selected
            var points = [ startPointLeft, startPointTop, startPointLeft, startPointTop ]; //set the initial points for the ends of the line
            canvas.incrementer['straight line']++;//increment the straight line counter for the ID naming

            var line = new fabric.Line(points, { //create the line from the points array
                strokeWidth: parseInt(document.getElementById("drawing-line-width").value, 10) || 1, //set the line width
                stroke: $.farbtastic('#colorpicker').color, //set line colour
                id: 'straight line ' + canvas.incrementer['straight line'] //set line ID
            });
            canvas.add(line); //add line
            refShape=line; //create a reference to the line
        }

        if(canvas.eyedropper) {
            //calculate the x and y coordinates of the cursor as this function uses the native canvas API
            //And needs to be modified to work while zoomed or panned
            //Get image data of the 1x1 pixel at the current coordinates calculated
            var imagesdata = context.getImageData((canvas.getPointer().x) * canvas.getZoom(), (canvas.getPointer().y) * canvas.getZoom(), 1, 1 );
            
            //get the colour data from the image data
            var new_color = [ imagesdata.data[0],
                            imagesdata.data[1],
                            imagesdata.data[2] ];
            
            //convert RGB to Hex
            hexr = ("00" + imagesdata.data[0].toString(16)).substr(-2);
            hexg = ("00" + imagesdata.data[1].toString(16)).substr(-2);
            hexb = ("00" + imagesdata.data[2].toString(16)).substr(-2);

            $.farbtastic('#colorpicker').setColor('#'+hexr+hexg+hexb); //change the colour wheel colour
        }

        //Creating the rectangle object
        if(canvas.rectDrawing) { //if in rectangle mode
            if(document.getElementById('lock').checked){ //If aspect ration checkbox is check we're drawing a square, so set the ID as such
                canvas.incrementer['square']++;
                var id = 'square ' + canvas.incrementer['square'];
            } else { //otherwise we're drawing a rectangle, so set that ID
                canvas.incrementer['rectangle']++;
                var id = 'rectangle ' + canvas.incrementer['rectangle'];
            }

            var rect=new fabric.Rect({ //create the rectangle
                id: id, //add its ID
                left:canvas.getPointer().x, //get its coords
                top:canvas.getPointer().y,
                width:5, //set a minimum width and height so even if a user doesn't drag their mouse it will be visible on screen
                height:5,
                stroke: $.farbtastic('#colorpicker').color, //set the outline colour
                strokeWidth: parseInt(document.getElementById("shape-line-width").value, 10) || 1, //set the line width
                fill:fill //set the colour of the rectangle internals, if any
            });
            
            canvas.add(rect); //add the object
            refShape=rect;  //Reference of rectangle object
        }

        if(canvas.cropMode) { //if in crop mode
            var rect = new fabric.Rect({ //create a rectangle
                id: 'cropper', //give it a special ID
                left:canvas.getPointer().x, //get it's coords
                top:canvas.getPointer().y,
                fill: 'transparent', //make it transparent
                width: 2, //give it an initial width and height
                height: 2,
                strokeDashArray: [5, 5], //make its outline a dashed line
                stroke: 'black', //make the outline black
                type: 'cropper', //give it a custom type
                lockRotation: true, //make it not able to be rotated
                selectable: true
            });

            canvas.add(rect); //add it to the canvas
            refShape=rect; //reference of the shape
        }

        if(canvas.circleDrawing) { //if circle/ellipse is set
            //create the circle object if the lock checkbox is checked
            if(document.getElementById('lock').checked){
                canvas.incrementer['circle']++; //increment the circle counter
                var circle = new fabric.Circle({ //create the circle
                    id: 'circle ' + canvas.incrementer['circle'], //set its ID
                    left:canvas.getPointer().x, //set its starting coords
                    top:canvas.getPointer().y,                
                    radius: 5, //set a minimum radius
                    stroke: $.farbtastic('#colorpicker').color, //set line colour
                    strokeWidth: parseInt(document.getElementById("shape-line-width").value, 10) || 1, //set line width
                    fill:fill //set internal colour
                 });
            } else {
                //otherwise create an ellipse object
                canvas.incrementer['ellipse']++; //increment the ellipse counter
                circle = new fabric.Ellipse({ //create an ellipse
                    id: 'ellipse ' + canvas.incrementer['ellipse'], //set id
                    left: canvas.getPointer().x, //set coords
                    top: canvas.getPointer().y,
                    rx: 5, //set x and y radius
                    ry: 5,
                    stroke: $.farbtastic('#colorpicker').color, //set line colour
                    strokeWidth: parseInt(document.getElementById("shape-line-width").value, 10) || 1, //set line width
                    fill:fill //set internal colour
                });
            }
            
            canvas.add(circle); //add shape to canvas
            refShape=circle;  //Reference of circle/ellipse object
        }
    });

    /*
     * When mouse is moved across the canvas -
     * - check if isMouseDown variable is set to true and if not return
     * - if straightline mode is set, modify the end point of the line
     * - if eyedropper mode is set continuously change colour value of pixel under mouse cursor
     * - if rectangle mode or crop mode is set, modify/generate the rectangle object based on mouse coords
     * - if circle mode is set, do the same for the circle/ellipse
     * @param {Event} event Event object
     */
    canvas.on('mouse:move', function(event){
        // Defining the procedure
        //console.log(canvas.getPointer().x + 'vs' + canvas.getPointer().x);
        //console.log(canvas.getPointer().y + 'vs' + canvas.getPointer().y);


        if(!canvas.isMouseDown) { //If isMouseDown is false, return without doing anything
            return;
        }

        if(canvas.straightLineMode) { //if straight line mode is set
            refShape.set({ //modify the end coords of the line with the current mouse coords
                x2: canvas.getPointer().x, 
                y2: canvas.getPointer().y 
            });

            canvas.renderAll(); //render changes
        }

        if(canvas.eyedropper) { //if eyedropper mode is set
            //calculate the x and y coordinates of the cursor as this function uses the native canvas API
            //And needs to be modified to work while zoomed or panned
            //Get image data of the 1x1 pixel at the current coordinates calculated
            var imagesdata = context.getImageData((canvas.getPointer().x) * canvas.getZoom(), (canvas.getPointer().y) * canvas.getZoom(), 1, 1 );
            
            //get the colour data from the image data
            var new_color = [ imagesdata.data[0],
                            imagesdata.data[1],
                            imagesdata.data[2] ];
            
            //conert to hex
            hexr = ("00" + imagesdata.data[0].toString(16)).substr(-2);
            hexg = ("00" + imagesdata.data[1].toString(16)).substr(-2);
            hexb = ("00" + imagesdata.data[2].toString(16)).substr(-2);

            $.farbtastic('#colorpicker').setColor('#'+hexr+hexg+hexb); //change colour of wheel
        }
        
        if(canvas.rectDrawing || canvas.cropMode) { //if rectangle or crop mode set
            //get mouse coords
            var posX=canvas.getPointer().x;
            var posY=canvas.getPointer().y;

            //check which direction the user moved their mouse  relative to the starting point and change the origin to match
            if(startPointLeft > posX) {
                refShape.set({originX: 'right' });
            } else {
                refShape.set({originX: 'left' });
            }
            
            if(startPointTop > posY) {
                refShape.set({originY: 'bottom' });
            } else {
                refShape.set({originY: 'top' });
            }

            if(document.getElementById('lock').checked){
                //If drawing a square get the higher of the absolute values of the x and y distance of the
                //cursor from the starting point and use that as the edge lenght
                refShape.setWidth(Math.max(Math.abs(posX-startPointLeft), Math.abs(posY-startPointTop)));
                refShape.setHeight(Math.max(Math.abs(posX-startPointLeft), Math.abs(posY-startPointTop)));
            } else {
                //If drawing a rectanle just set the width and the height seperately using distance from the
                //start point
                refShape.setHeight(Math.abs(posY-startPointTop));
                refShape.setWidth(Math.abs(posX-startPointLeft));
            }

            refShape.setCoords(); //fix the grab box coords
            canvas.renderAll();  //render changes
        }

        if(canvas.circleDrawing) {//if circle or ellipse drawing
            //get mouse coords
            var posX=canvas.getPointer().x;
            var posY=canvas.getPointer().y;

            if(document.getElementById('lock').checked) {
                //if drawing a circle set the radius to be the higher of the absolute values of the distance
                //between the cursor and the starting points for x and y
                var radius = Math.max(Math.abs(startPointTop - posY)+refShape.strokeWidth/8,Math.abs(startPointLeft - posX)+refShape.strokeWidth/8);
                refShape.set({ radius: radius});
            } else {
                //if drawing an ellipse set the x and y radius seperately
                var rx = Math.abs(startPointLeft - posX)/2;
                var ry = Math.abs(startPointTop - posY)/2;
                refShape.set({ rx: rx, ry: ry});
            }
            
            //check which direction the user moved their mouse relative to the starting point and change the origin to match
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
            
            refShape.setCoords();//fix grab box coords
            canvas.renderAll();  //render changes
        }
    });

    /*
     * When mouse is clicked up from the canvas -
     * - set isMouseDown variable to false
     * - if free drawing mode is set, change the id attribute of the line just added (from 'undefined' to 'line')
     * - if straight line mode is set, fix the grab box of the line
     * - if text drawing mode is set, add a text object at the mouse coordinates, select the object and display relevant options
     * - if circle mode or rectangle mode is set, select the object
     * - call the updateLayers function
     */
    canvas.on('mouse:up',function(){
        canvas.isMouseDown=false; //set isMouseDown to false

        if(canvas.isDrawingMode == true) { //if in drawing mode
            canvas.incrementer['line']++; //increment the line counter
            var obj = canvas.getObjects(); //get all objects
            obj[obj.length - 1].id = "line " + canvas.incrementer['line']; //change the ID of the last added object
        }

        if(canvas.straightLineMode) { //if in straight line mode fix the grab box coords
            refShape.setCoords();
        }

        if(canvas.textDrawing) { //if in text mode
            if(document.getElementById('italic').checked) { //if the italic box is checked set the italic var to "italic", otherwise set to "normal"
                var italic = 'italic';
            } else {
                var italic = 'normal';
            }

            if(document.getElementById('bold').checked) { //if bold box is checked, set bold var to 700, otherwise set to 400
                var bold = 700;
            } else {
                var bold = 400;
            }

            //console.log("adding text");
            
            var text = new fabric.Text('text', { //create the text object
                id: 'text', //set its ID
                left: canvas.getPointer().x, //set its coords
                top: canvas.getPointer().y,
                fontFamily: "Lato", //set the default font
                fontWeight: bold, //set the font weight (bold = 700, normal = 400)
                fontStyle: italic, //set the font style (italic = 'italic', normal = 'normal')
                fill: $.farbtastic('#colorpicker').color //set text colour
            });

            canvas.add(text); //add to canvas
            canvas.setActiveObject(text); //select text object

            //show text options
            $('#select-mode').click();
            $("#text-mode-options").show();

            canvas.textDrawing = false;//disable text mode
        }

        if(canvas.cropMode){ //if in cropping mode
            //record and reset zoom temporarily
            var zoom = canvas.getZoom();
            resetZoom();

            //declare some variables
            var croppedLeft = 0;
            var croppedTop = 0;
            var canvasJson = canvas.getObjects();
            var keepHidden = [];

            // Cropping canvas according to cropper rectangle
            if (canvas.getObjects().length > 0) { //make sure there is atleast 1 object on the canvas (the cropper)
                var i;
                for (i = 0; i < canvas.getObjects().length; i++) { //Loop through all objects
                    if (canvas.getObjects()[i].type == 'cropper') { //if the object is the cropper
                        //get the cropper's coords
                        croppedLeft = canvas.getObjects()[i].left;
                        croppedTop = canvas.getObjects()[i].top;
                        
                        //change the canvas size to be the same size as the cropper
                        canvas.setHeight(canvas.getObjects()[i].height);
                        canvas.setWidth(canvas.getObjects()[i].width);

                        canvas.getObjects()[i].remove(); //remove the cropper

                        //update the init canvas size
                        initWidth = canvas.getWidth();
                        initHeight = canvas.getHeight();
                    } else { //if the object is not the cropper
                        if(canvas.getObjects()[i].visible == false){ //if the object is hidden
                            keepHidden.push(canvas.getObjects()[i]); //add it to the keepHidden array
                        } else { //if the object isn't hidden
                            canvas.getObjects()[i].visible = false; //temporarily hide it
                        }
                    }
                }
            }

            if(canvas.backgroundImage) { //if canvas has a background image
                var url = canvas.toDataURL({ //Crop the canvas background image to the cropper coords
                    format: 'png',
                    left: croppedLeft,
                    top: croppedTop,
                    width: canvas.width,
                    height: canvas.height
                });

                fabric.Image.fromURL(url, function(oImg){ //set the new background image to this cropped image
                    canvas.setBackgroundImage(oImg, canvas.renderAll.bind(canvas));
                });
            }

            //Shifting the objects accordigly
            for (i = 0; i < canvasJson.length; i++) { //loop through all objects
                //change their coords to match the cropping
                canvas.getObjects()[i].left = canvas.getObjects()[i].left - croppedLeft
                canvas.getObjects()[i].top = canvas.getObjects()[i].top - croppedTop

                if(!keepHidden.includes(canvas.getObjects()[i])){ //If the object is not in the keepHidden array, make it visible
                    canvas.getObjects()[i].visible = true;
                }

                canvas.renderAll();//render changes
            } 

            fixZoom(zoom); //revert zoom to previous value
            $('#select-mode').click(); //enter select mode
            resetPan(); //reset pan to center
        }

        if(canvas.circleDrawing || canvas.rectDrawing){ //if in circle or rectangle mode
            //console.log(refShape);
            canvas.setActiveObject(refShape); //select the added object
        }
        
        updateLayers(); //update the layer window
    });

    /*
     * When the text field in the text object options gets an input, keydown, a paste or a change -
     * - change the text attribute of the object
     * - change the id value of the object
     * - call the updateLayers function
     */
    $('#text').on('change keydown paste input', function() {
        //console.log("text changed");
        
        if (canvas.getActiveObject() && getSelectedType() == "text") { //make sure a text object is selected
            canvas.getActiveObject().text = document.getElementById('text').value; //set the text of the object to the value of the text box
            if (document.getElementById('text').value == "") { //if there is no text in the object set the ID to "text"
                canvas.getActiveObject().id = "text";
            } else { //otherwise, set the ID to whatever the text object says
                canvas.getActiveObject().id = document.getElementById('text').value.replace(/(\r\n|\n|\r)/gm," "); //replace line breaks with spaces in the ID
            }
            updateLayers(); //update the layer window

            //fix grab box coords
            canvas.getActiveObject()._initDimensions();
            canvas.getActiveObject().setCoords();
            canvas.renderAll(); //render changes
        }
    });

    /*
     * When the straight line checkbox is changed
     * set the straightlinemode variable to the value of the checkbox
     * set the drawingmode varibel to the inverse of the value of the checkbox
     */
    $('#straight').change(function() {
        canvas.straightLineMode = document.getElementById('straight').checked;
        canvas.isDrawingMode = !document.getElementById('straight').checked;
    });

    /*
     * When the font option changes change the font of the text on the select text object
     */
    $('#font').change(function() {
        //console.log("font changed");
        canvas.getActiveObject().fontFamily = this.value; //change the font family to the value of the dropdown box

        //fix grab box
        canvas.getActiveObject()._initDimensions();
        canvas.getActiveObject().setCoords();
        
        canvas.renderAll();//render changes
    });

    /*
     * When the bold checkbox is checked, toggle between bold and normal font on the object
     */
    $('#bold').change(function() {
        //console.log("bold changed");

        //depending on the value of the bold checkbox, change the font width
        if(document.getElementById('bold').checked) {
            canvas.getActiveObject().fontWeight = 700;
        } else {
            canvas.getActiveObject().fontWeight = 400;
        }

        //fix grab box
        canvas.getActiveObject()._initDimensions();
        canvas.getActiveObject().setCoords();

        canvas.renderAll(); //render changes
    });

    //create the filters array for image filters
    var filters = [
        new fabric.Image.filters.Grayscale(),       // grayscale    0
        new fabric.Image.filters.Sepia2(),          // sepia        1
        new fabric.Image.filters.Invert()          // invert       2
        
        // new fabric.Image.filters.Convolute({        // emboss       3
        //     matrix: [ 1, 1, 1,
        //              1, 0.7, -1,
        //              -1, -1, -1 ]
        // }),

        // new fabric.Image.filters.Convolute({        // sharpen      4
        //     matrix: [  0, -1, 0,
        //             -1, 5, -1,
        //             0, -1, 0 ]
        // })
    ];

    /*
     * When any of the filter checkboxes are changed, change the value of the filters based on 
     * which checkbox was changed and wether it was checked or not
     */
    $('.filters').on("change", "input", function () {
        var isChecked = $(this).prop("checked");//check if the checkbox is checked
        var filter = $(this).data("filter"); //get the filter that coresponds to this checkbox
        var obj = canvas.getActiveObject(); //get the current selected object
        
        obj.filters[filter] = isChecked ? filters[filter] : null; //if the checkbox is checked add the filter, otherwise just add null
        obj.applyFilters(function () { //apply the filter
            canvas.renderAll(); //render changes
        });

        //console.log(obj.filters);
    });

    /*
     * Whenever any of the background image filters are changed
     * Changes the filters for the background images
     * an entire new background image needs to be generated
     */
    $('.background-filter-options').on("change", "input", function () {
        //get the current relevant properties of the background image
        var angle = canvas.backgroundImage.angle;
        var X = canvas.backgroundImage.flipX;
        var Y = canvas.backgroundImage.flipY;
        var width = canvas.backgroundImage.width;
        var height = canvas.backgroundImage.height;
        var top = canvas.backgroundImage.top;
        var left = canvas.backgroundImage.left;
        //console.log(top);
        //console.log(left);
        
        fabric.Image.fromURL(backgroundImageUrl, (function(image){//set a new background image from this image
            var filter = $(this).data("filter"); //get the changed filter
            var isChecked = $(this).prop("checked"); //check if it is checked
            image.filters[filter] = isChecked ? filters[filter] : null; //if checked add the filter, otherwise add null
            image.applyFilters((function(){ //apply the filter to the image object
                canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas)); //set the image object as the new background image

                //reset the relevant properties that were stored above
                canvas.backgroundImage.setAngle(angle);
                canvas.backgroundImage.set('flipX', X);
                canvas.backgroundImage.set('flipY', Y);
                canvas.backgroundImage.width = width;
                canvas.backgroundImage.height = height;
                canvas.backgroundImage.top = top;
                canvas.backgroundImage.left = left;
                canvas.renderAll(); //render changes
            }).bind(this));
        }).bind(this));
    });


    /*
     * When the italic checkbox is checked, toggle between italic and normal font on the object
     */
    $('#italic').change(function() {
        //console.log("italic changed");
        if(document.getElementById('italic').checked) { //if italic is checked change the italic property of the select object to 'italic', otherwise change to 'normal'
            canvas.getActiveObject().fontStyle = 'italic';
        } else {
            canvas.getActiveObject().fontStyle = 'normal';
        }

        //fix grab box
        canvas.getActiveObject()._initDimensions();
        canvas.getActiveObject().setCoords();
        canvas.renderAll(); //render changes
    });

    /*
     * Change whether text has an outline when the text box controlling it changes
     */
    $('#outline').on('change keydown paste input', function() {
        //console.log("outline changed");
        if (canvas.getActiveObject() && getSelectedType() == "text") { //make sure a text object is selected
            if(document.getElementById('outline').value == ""){ //if the outline text box is empty remove all outline
                canvas.getActiveObject().strokeWidth = 0;   
            } else { //if there's anything in the text box give the text a 1 pixel outline the same colour as the value of the textbox (default black)
                canvas.getActiveObject().stroke = document.getElementById('outline').value;
                canvas.getActiveObject().strokeWidth = 1;
            }

            updateLayers();//update layer window

            //fix grab box
            canvas.getActiveObject()._initDimensions();
            canvas.getActiveObject().setCoords();
            canvas.renderAll(); //render changes
        }
    });

    /*
     * When the color value from the color picker changes, change the color of the selected object (rect, circle, ellipse, line, text)
     */
    $('#colorvalue').change(function() {
        if(getSelectedType() == 'text'){ //if the object is text
            //console.log("text colour changed");
            canvas.getActiveObject().fill = $.farbtastic('#colorpicker').color; //change the texts fill property
        } else if (getSelectedType() != 'image' && getSelectedType() != null) { //if the object is anything else other than image (or nothing)
            //console.log("rect, circle, ellipse colour changed");
            if(document.getElementById('shape-fill').checked) { //if the object has a fill
                canvas.getActiveObject().fill = $.farbtastic('#colorpicker').color; //change the fill colour
            }
            canvas.getActiveObject().stroke = $.farbtastic('#colorpicker').color;//change the line colour
        }
        canvas.renderAll();//render changes
    });

    /*
     * When the shape line width slider changes, change the line width of the selected shape (rect, circle, ellipse)
     */
    $('#shape-line-width').on('input', function(){
        //if the object is anything other than text, image or nothing
        if(getSelectedType() != 'text' && getSelectedType() != 'image' && getSelectedType() != null){
            canvas.getActiveObject().strokeWidth = parseInt(document.getElementById("shape-line-width").value, 10) || 1; //change the line widht
            canvas.getActiveObject().setCoords(); //fix the grab box
            canvas.renderAll(); //render changes
        }
    });

    /*
     * When the shape line width slider changes, change the line width of the selected shape (rect, circle, ellipse)
     */
    $('#drawing-line-width').on('input', function(){
        if(getSelectedType() == 'path' || getSelectedType() == 'line'){ //if the object is a straight line or path (freehand drawing)
            canvas.getActiveObject().strokeWidth = parseInt(document.getElementById("drawing-line-width").value, 10) || 1; //change line width
            canvas.getActiveObject().setCoords(); //fix grab box
            canvas.renderAll(); //render changes
        }
    });



    /*
     * When the fill checkbox is checked, toggle between solid and hollow center on the object (rect, circle, ellipse)
     */
    $('#shape-fill').change(function(){
        if(canvas.getActiveObject()){//if an object is selected
            if(getSelectedType() != 'text' && getSelectedType() != 'image'){//and its anything but text and image
                if(document.getElementById('shape-fill').checked) { //if fill is checked
                    var fill = canvas.getActiveObject().stroke; //set the fill to the objects line colour
                } else { //if not checked
                    var fill = ''; //set fill to empty string (no fill)
                }
                canvas.getActiveObject().fill = fill; //apply to the object itself
                canvas.renderAll(); //render changes
            }
        }
    });

    /*
     * Old erase code that worked somewhat but couldn't be added fully
     */
    // $('#erase-mode').click(function() {
    //     hideOptions();
    //     console.log("entering erase mode"); 

    //     canvas.eraser = true;
    //     canvas.isDrawingMode = true;
    //     canvas.freeDrawingBrush.color = canvas.backgroundColor;
    //     canvas.freeDrawingBrush.width = 10;
    //     // define a custom fillCircle method
    //     context.fillCircle = function(x, y, radius, fillColor) {
    //         this.fillStyle = fillColor;
    //         this.beginPath();
    //         this.moveTo(x, y);
    //         this.arc(x, y, radius, 0, Math.PI * 2, false);
    //         this.fill();
    //     };

    //     //context.clearTo = function(fillColor) {
    //     //    context.fillStyle = fillColor;
    //         //context.fillRect(0, 0, width, height);
    //     //};
    //     //context.clearTo("#ddd");

    //     // bind mouse events
    //     canvas.on('mouse:move',function(e){
    //         if (!canvas.isDrawing) {
    //            return;
    //         }
    //         console.log("moving");
    //         var x = e.pageX - this.offsetLeft;
    //         var y = e.pageY - this.offsetTop;
    //         var radius = 10; // or whatever
    //         var fillColor = 'red';
    //         //context.globalCompositeOperation = 'destination-out';
    //         context.fillCircle(x, y, radius, fillColor);
    //     });

    //     canvas.on('mouse:down',function(){
    //         canvas.isDrawing = true;
    //     });

    //     canvas.on('mouse:up',function(){
    //         canvas.isDrawing = false;
    //     });
    // });

    /*
     * When an object is selected
     * - simulate a click on the select icon
     * - display the relevant options
     */
    canvas.on('object:selected', function(event) {
        //console.log("selected");
      
        if(getSelectedType() == 'text'){ //if object is text, get currently set options and display them
            hideOptions();
            $('#select-mode').click();
            
            if(canvas.getActiveObject().fontWeight == 700){
                document.getElementById("bold").checked = true;
            } else {
                document.getElementById("bold").checked = false;
            }

            if(canvas.getActiveObject().fontStyle == 'italic'){
                document.getElementById("italic").checked = true;
            } else {
                document.getElementById("italic").checked = false;
            }

            document.getElementById("font").value = canvas.getActiveObject().fontFamily;

            if(canvas.getActiveObject().text == "text"){
                document.getElementById("text").value = "";
            } else {
                document.getElementById("text").value = canvas.getActiveObject().text;
            }

            if(canvas.getActiveObject().strokeWidth == 0){
                document.getElementById("outline").value = "";
            } else {
                document.getElementById("outline").value = canvas.getActiveObject().stroke;
            }

            document.getElementById("size").innerHTML = Math.round(canvas.getActiveObject().width*canvas.getActiveObject().scaleX) + " x " + Math.round(canvas.getActiveObject().height*canvas.getActiveObject().scaleY);

            $("#text-mode-options").show();
        } else if (getSelectedType() == 'rect' || getSelectedType() == 'square' || getSelectedType() == 'circle' || getSelectedType() == 'ellipse') {
            //if selected object is rect, circle, square or ellipse show the current setting and relevant options
            hideOptions();
            $('#select-mode').click();
            
            document.getElementById("shape-line-width").value = canvas.getActiveObject().strokeWidth;
            if(canvas.getActiveObject().fill == ''){
                document.getElementById("shape-fill").checked = false;
            } else {
                document.getElementById("shape-fill").checked = true;
            }

            //show the current size of the object in the bottom left of the screen
            document.getElementById("size").innerHTML = Math.round(canvas.getActiveObject().width*canvas.getActiveObject().scaleX) + " x " + Math.round(canvas.getActiveObject().height*canvas.getActiveObject().scaleY);

            $("#shape-mode-options").show();
            $("#locklab").hide();
        } else if (getSelectedType() == 'path' || getSelectedType() == 'line'){ //if object is path or straight line show options
            hideOptions();
            $('#select-mode').click();
            
            document.getElementById("drawing-line-width").value = canvas.getActiveObject().strokeWidth;

            document.getElementById("size").innerHTML = Math.round(canvas.getActiveObject().width*canvas.getActiveObject().scaleX) + " x " + Math.round(canvas.getActiveObject().height*canvas.getActiveObject().scaleY);

            $("#drawing-mode-options").show();
        } else if(getSelectedType() == "image") { //if object is image show filter options
            hideOptions();
            $('#select-mode').click();
            if(canvas.getActiveObject().filters[0]) {
                document.getElementById("grayscale").checked = true;
            } else {
                document.getElementById("grayscale").checked = false;
            }

            if(canvas.getActiveObject().filters[1]) {
                document.getElementById("sepia").checked = true;
            } else {
                document.getElementById("sepia").checked = false;
            }

            if(canvas.getActiveObject().filters[2]) {
                document.getElementById("invert").checked = true;
            } else {
                document.getElementById("invert").checked = false;
            }

            document.getElementById("size").innerHTML = Math.round(canvas.getActiveObject().width*canvas.getActiveObject().scaleX) + " x " + Math.round(canvas.getActiveObject().height*canvas.getActiveObject().scaleY);

            $("#filter-options").show();
        } 

        if(getSelectedType() != null) { //if any type of object is selected update its position value in the bottom left of screen
            if(canvas.getActiveObject()){
                canvas.getActiveObject().setCoords();
                document.getElementById("pos").innerHTML = Math.round(canvas.getActiveObject().oCoords.tl.x) + ", " + Math.round(canvas.getActiveObject().oCoords.tl.y);
            } else {
                canvas.getActiveGroup().setCoords();
                document.getElementById("pos").innerHTML = Math.round(canvas.getActiveGroup().oCoords.tl.x) + ", " + Math.round(canvas.getActiveGroup().oCoords.tl.y);
            }
        }
    });

    /*
     * Whenever objects change size update the size and position values on screen
     */
    canvas.on('object:scaling', function() {
        if(canvas.getActiveObject()){
            document.getElementById("size").innerHTML = Math.round(canvas.getActiveObject().width*canvas.getActiveObject().scaleX) + " x " + Math.round(canvas.getActiveObject().height*canvas.getActiveObject().scaleY);
            canvas.getActiveObject().setCoords();
            document.getElementById("pos").innerHTML = Math.round(canvas.getActiveObject().oCoords.tl.x) + ", " + Math.round(canvas.getActiveObject().oCoords.tl.y);
        } else {
            canvas.getActiveGroup().setCoords();
            document.getElementById("pos").innerHTML = Math.round(canvas.getActiveGroup().oCoords.tl.x) + ", " + Math.round(canvas.getActiveGroup().oCoords.tl.y);
        }
    });

    /*
     * Whenever objects move change the position value on screen
     */
    canvas.on('object:moving', function() {
        if(canvas.getActiveObject()){
            canvas.getActiveObject().setCoords();
            document.getElementById("pos").innerHTML = Math.round(canvas.getActiveObject().oCoords.tl.x) + ", " + Math.round(canvas.getActiveObject().oCoords.tl.y);
        } else {
            canvas.getActiveGroup().setCoords();
            document.getElementById("pos").innerHTML = Math.round(canvas.getActiveGroup().oCoords.tl.x) + ", " + Math.round(canvas.getActiveGroup().oCoords.tl.y);
        }
    });

    /*
     * Whenever objects rotate change the position value on screen
     */
    canvas.on('object:rotating', function(){
        if(canvas.getActiveObject()){
            canvas.getActiveObject().setCoords();
            document.getElementById("pos").innerHTML = Math.round(canvas.getActiveObject().oCoords.tl.x) + ", " + Math.round(canvas.getActiveObject().oCoords.tl.y);
        } else {
            canvas.getActiveGroup().setCoords();
            document.getElementById("pos").innerHTML = Math.round(canvas.getActiveGroup().oCoords.tl.x) + ", " + Math.round(canvas.getActiveGroup().oCoords.tl.y);
        }
    });

    /*
     * When objects stop being selected, unless in free drawing mode, simulate a select icon click
     */
    canvas.on('selection:cleared', function() {
        if( !canvas.isDrawingMode ){
            $('#select-mode').click();
        }
        document.getElementById("size").innerHTML = ""; //as no object is being selected, remove the size and position values from the screen
        document.getElementById("pos").innerHTML = "";
    });

    /*
     * Old, semi-working rasterize/flatten code
     */
    // $('#rasterize').click(function(){
    //     if(getSelectedType() != null) {
    //         console.log("attempting to collapse");
    //         var obj = canvas.getObjects();
    //         var keepHidden = [];
    //         for(i=obj.length - 1; i >= 0;i--){
    //             if(obj[i].active == false){
    //                 if(obj[i].visible == false){
    //                     keepHidden.push(obj[i]);
    //                 } else {
    //                     obj[i].visible = false;
    //                 }
    //             }
    //         }
    //         canvas.renderAll();
            
    //         var url = canvas.toDataURL({
    //             format: 'png',
    //             left: 0,
    //             top: 0,
    //             width: canvas.width,
    //             height: canvas.height,
    //             multiplier: 1
    //         });

    //         //var tempImg = new Image();
    //         //tempImg.setAttribute('crossOrigin', 'anonymous'); //set this attribute to get around cross origin canvas security stuff.
    //         //tempImg.src = url;
    //         //context.drawImage(tempImg,0,0);
    //         //console.log(context);

    //         fabric.Image.fromURL(url, function(oImg){
    //             canvas.setBackgroundImage(oImg, canvas.renderAll.bind(canvas));
    //         });
    //         if(canvas.getActiveObject()) {
    //             canvas.getActiveObject().remove();
    //         } else if(getSelectedType() == "group") {
    //             canvas.getActiveGroup().forEachObject(function(o){ canvas.remove(o) });
    //         }
    //         var obj = canvas.getObjects();
    //         for(i=obj.length - 1; i >= 0;i--){
    //             if(!keepHidden.includes(obj[i])){
    //                 obj[i].visible = true;
    //             }
    //         }
    //         canvas.deactivateAll();
    //         canvas.renderAll();
    //         updateLayers();
    //     } else {
    //         alert('You need to select an object or group of objects to collapse them to the background')
    //     }
    // });

    /*
     * When a key is pushed down, call this function
     * - only perform certain actions if the control key was held down when the function gets called
     * @param {Event} event Keydown event object
     */
    $(document).on('keydown', function( event ) {
        //console.log(event.which);
        if(event.which == 46 || event.which == 8) { //delete object (delete key, backspace)
            if(!$("input,textarea,select").is(":focus")) {
                if(canvas.getActiveObject()) {
                    canvas.getActiveObject().remove(); //remove selected object
                } else if(canvas.getActiveGroup()) { //if a group is selected
                    var group = canvas.getActiveGroup().getObjects(); //get all the objects in that group
                    canvas.discardActiveGroup(); //deselect the group
                    group.forEach(function(object) { //loop through each object in the group
                        canvas.remove(object); //remove the object
                    });
                }
                updateLayers(); //update layer window
            }
        }
        if(event.which == 27) { //exit modal (esc key)
            //Hide the modals
            if(document.getElementById("jsonModal").style.display == "block") {
                $("#jsonModal").hide();
            } else {
                $("#exportModal").hide();
                $("#newCanvasModal").hide();
                $("#importModal").hide();
                $("#resizeModal").hide();
                $("#mobileModal").hide();
                $("#filterModal").hide();
            }
        }
        if(event.ctrlKey==true && (event.which == 187 || event.which == 107)){ //zoom in (numLine =, numPad +)
            event.preventDefault();
            zoomIn();
        }
        if(event.ctrlKey==true && (event.which == 189 || event.which == 109)){ //zoom out (numLine -, numPad -)
            event.preventDefault();
            zoomOut();
        }
        if(event.ctrlKey==true && (event.which == 48 || event.which == 96)){ //reset zoom (numLine 0, numPad 0)
            event.preventDefault();
            resetZoom();
        }
        if(event.ctrlKey==true && event.which == 8) { //reset pan (backspace)
            resetPan();
        }
        if(event.ctrlKey==true && event.which == 83) { //save/export (S key)
            event.preventDefault();
            $('#exportButton').click();
        }
        if(event.ctrlKey==true && event.which == 73) { //import (I key)
            event.preventDefault();
            $('#importButton').click();
        }
        if(event.ctrlKey==true && event.which == 66) { //new (B key)
            event.preventDefault();
            $('#newCanvasButton').click();
        }
        if(event.ctrlKey==true && event.which == 79) { //open background image (O key)
            event.preventDefault();
            $('#background').click();
        }
        if(event.ctrlKey==true && event.which == 78) { //new (N key) **doesnt work in chrome**
            event.preventDefault();
            $('#newCanvasButton').click();
        }
        if(event.which == 37 || event.which == 100) { //left arrow, numPad 4
            if(event.ctrlKey==true){ //pan left
                event.preventDefault();
                pan(10,0);
            } else { //move object left
                if(!$("input,textarea,select").is(":focus")) { //if a text box or area isn't in focus
                    if(canvas.getActiveObject()) {
                        canvas.getActiveObject().left--; //reduce the left value by 1
                        canvas.getActiveObject().setCoords(); //fix the grab box
                        //update position value on screen
                        document.getElementById("pos").innerHTML = Math.round(canvas.getActiveObject().left) + ", " + Math.round(canvas.getActiveObject().top);
                    } else if (getSelectedType() == "group"){ //if a group is selected
                        canvas.getActiveGroup().left--; //reduce group left value by 1
                        canvas.getActiveGroup().setCoords(); //fix grab box
                    }
                    canvas.renderAll(); //render changes
                }
            }
        }
        if(event.which == 38 || event.which == 104) { //up arrow, numPad 8
            if(event.ctrlKey==true){ //pan up
                event.preventDefault();
                pan(0,10);
            } else {
                if(!$("input,textarea,select").is(":focus")) { //move object up
                    if(canvas.getActiveObject()) {
                        canvas.getActiveObject().top--;
                        canvas.getActiveObject().setCoords();
                        document.getElementById("pos").innerHTML = Math.round(canvas.getActiveObject().left) + ", " + Math.round(canvas.getActiveObject().top);
                    } else if (getSelectedType() == "group"){
                        canvas.getActiveGroup().top--;
                        canvas.getActiveGroup().setCoords();
                    }
                    canvas.renderAll();
                }
            }
        }
        if(event.which == 39 || event.which == 102) { //right arrow, numPad 6
            if(event.ctrlKey==true){ //pan right
                event.preventDefault();
                pan(-10,0);
            } else {
                if(!$("input,textarea,select").is(":focus")) { //move object right
                    if(canvas.getActiveObject()) {
                        canvas.getActiveObject().left++;
                        canvas.getActiveObject().setCoords();
                        document.getElementById("pos").innerHTML = Math.round(canvas.getActiveObject().left) + ", " + Math.round(canvas.getActiveObject().top);
                    } else if (getSelectedType() == "group"){
                        canvas.getActiveGroup().left++;
                        canvas.getActiveGroup().setCoords();
                    }
                    canvas.renderAll();
                }
            }
        }
        if(event.which == 40 || event.which == 98) { //down arrow, numPad 2
            if(event.ctrlKey==true){ //pan down
                event.preventDefault();
                pan(0,-10);
            } else {
                if(!$("input,textarea,select").is(":focus")) { //move object down
                    if(canvas.getActiveObject()) {
                        canvas.getActiveObject().top++;
                        canvas.getActiveObject().setCoords();
                        document.getElementById("pos").innerHTML = Math.round(canvas.getActiveObject().left) + ", " + Math.round(canvas.getActiveObject().top);
                    } else if (getSelectedType() == "group"){
                        canvas.getActiveGroup().top++;
                        canvas.getActiveGroup().setCoords();
                    }
                    canvas.renderAll();
                }
            }
        }
    });

    /*
     * When mouse whele is scrolled, call this function and -
     * - if ctrl is help while scrolling, zoom based on direction
     * @param {Event} event Event object
     */
    $(window).bind('mousewheel DOMMouseScroll', function (event) {
        if (event.ctrlKey == true) {
            if (event.originalEvent.wheelDelta >= 0) { //if mouse wheel has moved and is >= 0 zoom in (mouse wheel up)
                event.preventDefault();
                zoomIn();
            } else { //otherwise zoom out (mouse wheel down)
                event.preventDefault();
                zoomOut();
            }
        }
    });

    /*
     * Override copy behaviour to copy the selected object or group to clipboard
     */
    $(document).bind('copy', function() {
        if(!$("input,textarea,select").is(":focus")) { //if a textbox/area etc is not in focus
            //console.log('copied')
            if(canvas.getActiveObject()) { //if an object is selected
                pasteMultiplier = 0; //reset the paste multiplier and clipboard
                clipboard = [];

                clipboard[0] = canvas.getActiveObject().toObject('id'); //add the object to the clipboard
                clipboard[0].id = clipboard[0].id + " copy"; //change its ID to indicate its a copy
                updateLayers(); //update layer window
            } else if(getSelectedType() == "group") { //if a group is selected
                //reset the variables
                pasteMultiplier = 0;
                var i = 0;
                clipboard = [];
                canvas.getActiveGroup().forEachObject(function(o) { //loop through each object in the group
                    clipboard[i] = o.toObject('id'); //add it to the clipboard array
                    //change the coords of the object within the group to offset them on paste
                    clipboard[i].left = o.left + (canvas.getActiveGroup().width/2) + canvas.getActiveGroup().left;
                    clipboard[i].top = o.top + (canvas.getActiveGroup().height/2) + canvas.getActiveGroup().top;
                    clipboard[i].id = clipboard[i].id + " copy"; //change the ID
                    updateLayers(); //update layer window
                    i++;
                });
                canvas.deactivateAll().renderAll(); //deselct all objects
            } 
        }
    }); 

    /*
     * Override cut behaviour to copy the selected object or group to clipboard, and remove the object or group from the canvas
     */
    $(document).bind('cut', function() { //works the same as copy code above but also removes the object from the canavs
        if(!$("input,textarea,select").is(":focus")) {
            //console.log('cut')
            if(canvas.getActiveObject()) {
                pasteMultiplier = 0;
                clipboard = [];
                clipboard[0] = canvas.getActiveObject().toObject('id');
                canvas.getActiveObject().remove();
                updateLayers();
            } else if(getSelectedType() == "group") {
                pasteMultiplier = 0;
                var i = 0;
                clipboard = [];
                var group = canvas.getActiveGroup().getObjects();
                canvas.discardActiveGroup();
                group.forEach(function(o) {
                    clipboard[i] = o.toObject('id');
                    canvas.remove(o);
                    updateLayers();
                    i++;
                });
                canvas.deactivateAll().renderAll();
            }
        }
    });

    /*
     * Override paste behaviour to paste/clone the copied/cut object or group to the canvas
     */
    $(document).bind('paste', function(e) {
        if(!$("input,textarea,select").is(":focus")) { //if a text box isn't in focus
            //console.log('pasted');

            pasteMultiplier++; //increment the pastemultiplier to offset the objects
            fabric.util.enlivenObjects(clipboard, function(objects) { //go throught the clipboard array and add each object to the canvas
                objects.forEach(function(o) {
                    o.set("top", o.top + (pasteMultiplier*15)); //change their coordinates to be 15 down and left of the original
                    o.set("left", o.left + (pasteMultiplier*15));
                    o.set("id", o.get("id") + " " + pasteMultiplier); //append the paste multiplier to the id to know which copy this is (copy 1, copy 2, etc)
                    canvas.add(o); //add the object
                });
                updateLayers(); //update layer window
                canvas.renderAll(); //render changes
            });
            canvas.deactivateAll().renderAll(); //deselect all
        } else if($("#importJSON").is(":focus")) { //if the import json text area is in focus
            e.preventDefault();// overwrite default copy
            $('#importJSON').val("Loading..."); //insert a loading warning
            var data = e.originalEvent.clipboardData.getData('text'); //paste the text into the textarea
            setTimeout(function() { //do it async to mitigate browser freeze/stutter
                $('#importJSON').val(data);
            }, 0, data);
        }
    });

    //The following are menu items that call simple functions defined in canvas.js or auxiliary.js
    $('#rotateCW').click(function() {
        rotate(90);
    });

    $('#rotateCCW').click(function() {
        rotate(-90);
    });

    $('#flipY').click(function() {
        flipY();
    });

    $('#flipX').click(function() {
        flipX();
    });

    $('#zoomIn').click(function() {
        zoomIn();
    });

    $('#zoomOut').click(function() {
        zoomOut();
    });

    $('#resetZoom').click(function() {
        resetZoom();
    });

    $('#panUp').click(function() {
        pan(0,10);
    });

    $('#panDown').click(function() {
        pan(0,-10);
    });

    $('#panLeft').click(function() {
        pan(10,0);
    });

    $('#panRight').click(function() {
        pan(-10,0);
    });

    $('#resetPan').click(function() {
        resetPan();
    });

    $('#copy').click(function() {
        $(document).trigger("copy");
    });

    $('#cut').click(function() {
        $(document).trigger("cut");
    });

    $('#paste').click(function() {
        $(document).trigger("paste");
    });

    /*
     * Simulate a select icon click to init the functions
     */
    $('#select-mode').click();

    $(".upper-canvas").on("contextmenu", function() { //disable right click on the canvas to try stop bad image download
        return false;
    });
});