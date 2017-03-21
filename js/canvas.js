/* These functions control almost everything that occurs on the canvas, such as creating it, adding shapes, changing colours of tools
 *
 * Author: Matt Carrick
 * Website: http://matt.netsoc.co/FYP
 */


/*
 * When page has finished loading -
 * - create the position coordinates object,
 * - get the canvas offset
 * - remove the canvas selection box
 */
$(document).ready(function(){
    canvas.selectionColor = "rgba(0,0,0,0)";
    canvas.selectionBorderColor = "rgba(0,0,0,0)";
    var context = document.getElementById("c").getContext("2d");
    var clipboard = [];
    var pasteMultiplier = 0;

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
        console.log("entering select");

        hideOptions();
        $("#select-mode").css("border", "1px solid silver");

        canvas.selectionColor = "rgba(100, 100, 255, 0.3)";
        canvas.selectionBorderColor = "rgba(255, 255, 255, 0.3)";
        canvas.defaultCursor = "url('images/cursors/select.png'), auto";
        canvas.hoverCursor = "url('images/cursors/select.png'), auto";
        canvas.moveCursor = "url('images/cursors/select.png'), auto";
        fabric.Object.prototype.selectable = true; 
    });

    /*
     * Enter free drawing mode when the icon is clicked
     * Set the line width
     * Change the cursor to the pencil
     * Display the relevant options while hiding non-relevant
     */
    $("#drawing-mode").click(function() {
        console.log("entering line drawing");
        canvas.deactivateAll().renderAll();

        hideOptions();
        $("#drawing-mode").css("border", "1px solid silver");

        if(document.getElementById("straight").checked == true){
            canvas.straightLineMode = true;
            canvas.isDrawingMode = false;
            var refShape;
        } else {
            canvas.isDrawingMode = true;
            canvas.straightLineMode = false;
        }

        canvas.freeDrawingBrush.width = parseInt(document.getElementById("drawing-line-width").value, 10) || 1;
        canvas.freeDrawingCursor = "url('images/cursors/pencil.png'), auto";
        document.getElementById("drawing-mode-options").style.display = "";
        document.getElementById("straightlab").style.display = "";
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
        console.log("entering rectangle mode");
        canvas.deactivateAll().renderAll();
        
        //Declaring the variables
        canvas.isMouseDown=false;
        var refShape;
        
        hideOptions();
        $('#rectangle-mode').css("border", "1px solid silver");

        document.getElementById("shape-mode-options").style.display = '';
        document.getElementById("locklab").style.display = '';
        canvas.defaultCursor = "url('images/cursors/rectangle.png'), auto";
        canvas.hoverCursor = "url('images/cursors/rectangle.png'), auto";
        canvas.rectDrawing = true;
    });

    /*
     * Enter circle/ellipse drawing mode when the icon is clicked
     * Init the shape variable
     * Change the cursor to the circle
     * Display the relevant options while hiding non-relevant
     */
    $('#circle-mode').click(function(){
        console.log("entering circle mode");
        canvas.deactivateAll().renderAll();

        //Declaring the variables
        canvas.isMouseDown=false;
        var refShape;

        hideOptions();
        $('#circle-mode').css("border", "1px solid silver");

        document.getElementById("shape-mode-options").style.display = '';
        document.getElementById("locklab").style.display = '';
        canvas.defaultCursor = "url('images/cursors/circle.png'), auto";
        canvas.hoverCursor = "url('images/cursors/circle.png'), auto";
        canvas.circleDrawing = true;
    });

    /*
     * Enter text insertion mode when the icon is clicked
     * Change the cursor to the text
     * Display the relevant options while hiding non-relevant
     */
    $('#text-mode').click(function () {
        console.log("entering text mode");
        canvas.deactivateAll().renderAll();
        
        document.getElementById('bold').checked = false;
        document.getElementById('italic').checked = false;
        document.getElementById('font').value = 'Lato';
        document.getElementById('text').value = "";

        hideOptions();
        $('#text-mode').css("border", "1px solid silver");

        canvas.defaultCursor = "url('images/cursors/text.png'), auto";
        canvas.hoverCursor = "url('images/cursors/text.png'), auto";
        canvas.textDrawing = true;
    });

    /*
     * Enter eyedropper mode when the icon is clicked
     * Change the cursor to the eyedropper
     * Hide options
     */
    $('#eyedropper-mode').click(function (){
        console.log("entering eyedropper mode");
        canvas.deactivateAll().renderAll();

        hideOptions();
        $('#eyedropper-mode').css("border", "1px solid silver");

        canvas.defaultCursor = "url('images/cursors/eyedropper.png'), auto";
        canvas.hoverCursor = "url('images/cursors/eyedropper.png'), auto";
        canvas.eyedropper = true;
    });

    $('#crop-mode').click(function (){
        console.log("entering crop mode");
        canvas.deactivateAll().renderAll();
        
        //Declaring the variables
        canvas.isMouseDown=false;
        var refShape;
        
        hideOptions();
        $('#crop-mode').css("border", "1px solid silver");

        document.getElementById("locklab").style.display = '';
        canvas.defaultCursor = "url('images/cursors/crop.png'), auto";
        canvas.hoverCursor = "url('images/cursors/crop.png'), auto";
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

        if(document.getElementById('shape-fill').checked) {
            var fill = $.farbtastic('#colorpicker').color;
        } else {
            var fill = '';
        }

        startPointLeft = canvas.getPointer().x;
        startPointTop = canvas.getPointer().y;

        if(canvas.straightLineMode) {
            var pointer = canvas.getPointer(event.e);
            var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
            var line = new fabric.Line(points, {
                strokeWidth: parseInt(document.getElementById("drawing-line-width").value, 10) || 1,
                fill: $.farbtastic('#colorpicker').color,
                stroke: $.farbtastic('#colorpicker').color,
                originX: 'center',
                originY: 'center',
                id: 'straight line'
            });
            canvas.add(line);
            refShape=line;
        }

        if(canvas.eyedropper) {
            // calculate the x and y coordinates of the cursor
            var imagesdata = context.getImageData((canvas.getPointer().x + panDiffLeft) * canvas.getZoom(), (canvas.getPointer().y + panDiffTop) * canvas.getZoom(), 1, 1 );
            var new_color = [ imagesdata.data[0],
                            imagesdata.data[1],
                            imagesdata.data[2] ];
            
            hexr = ("00" + imagesdata.data[0].toString(16)).substr(-2);
            hexg = ("00" + imagesdata.data[1].toString(16)).substr(-2);
            hexb = ("00" + imagesdata.data[2].toString(16)).substr(-2);

            $.farbtastic('#colorpicker').setColor('#'+hexr+hexg+hexb);
            $('.farbtastic').click();
        }

        //Creating the rectangle object
        if(canvas.rectDrawing) {
            if(document.getElementById('lock').checked){
                var id = 'square';
            } else {
                var id = 'rectangle';
            }

            var rect=new fabric.Rect({
                id: id,
                left:canvas.getPointer().x,
                top:canvas.getPointer().y,
                width:5,
                height:5,
                stroke: $.farbtastic('#colorpicker').color,
                strokeWidth: parseInt(document.getElementById("shape-line-width").value, 10) || 1,
                fill:fill
            });
            
            canvas.add(rect);
            refShape=rect;  //Reference of rectangle object
        }

        if(canvas.cropMode) {
            var rect = new fabric.Rect({
                id: 'cropper',
                left:canvas.getPointer().x,
                top:canvas.getPointer().y,
                fill: 'transparent',
                width: 2,
                height: 2,
                strokeDashArray: [5, 5],
                stroke: 'black',
                type: 'cropper',
                lockRotation: true,
                selectable: true
            });

            canvas.add(rect);
            refShape=rect;
        }

        if(canvas.circleDrawing) {
            //create the circle object if the lock checkbox is checked
            if(document.getElementById('lock').checked){
                var circle = new fabric.Circle({
                    id: 'circle',
                    left:canvas.getPointer().x,
                    top:canvas.getPointer().y,                
                    radius:6,
                    stroke: $.farbtastic('#colorpicker').color,
                    strokeWidth: parseInt(document.getElementById("shape-line-width").value, 10) || 1,
                    fill:fill
                 });
            } else {
                //otherwise create an ellipse object
                circle = new fabric.Ellipse({
                    id: 'ellipse',
                    left: startPointLeft,
                    top: startPointTop,
                    originX:canvas.getPointer().x,
                    originY:canvas.getPointer().y,
                    rx: canvas.getPointer().x-startPointLeft,
                    ry: canvas.getPointer().y-startPointTop,
                    angle: 0,
                    fill: '',
                    stroke: $.farbtastic('#colorpicker').color,
                    strokeWidth: parseInt(document.getElementById("shape-line-width").value, 10) || 1,
                    fill:fill
                });
            }
            
            canvas.add(circle);
            refShape=circle;  //Reference of circle/ellipse object
        }
    });

    /*
     * When mouse is moved across the canvas -
     * - check if isMouseDown variable is set to true and if not return
     * - if rectangle mode is set, modify/generate the rectangle object based on mouse coords
     * - if circle mode is set, do the same for the circle/ellipse
     * @param {Event} event Event object
     */
    canvas.on('mouse:move', function(event){
        // Defining the procedure
        //console.log(canvas.getPointer().x + 'vs' + canvas.getPointer().x);
        //console.log(canvas.getPointer().y + 'vs' + canvas.getPointer().y);


        if(!canvas.isMouseDown) {
            return;
        }

        if(canvas.straightLineMode) {
            refShape.set({ 
                x2: canvas.getPointer().x, 
                y2: canvas.getPointer().y 
            });

            canvas.renderAll(); 
        }

        if(canvas.eyedropper) {
            // calculate the x and y coordinates of the cursor
            var imagesdata = context.getImageData((canvas.getPointer().x + panDiffLeft) * canvas.getZoom(), (canvas.getPointer().y + panDiffTop) * canvas.getZoom(), 1, 1 );
            var new_color = [ imagesdata.data[0],
                            imagesdata.data[1],
                            imagesdata.data[2] ];
            
            hexr = ("00" + imagesdata.data[0].toString(16)).substr(-2);
            hexg = ("00" + imagesdata.data[1].toString(16)).substr(-2);
            hexb = ("00" + imagesdata.data[2].toString(16)).substr(-2);

            $.farbtastic('#colorpicker').setColor('#'+hexr+hexg+hexb);
            $('.farbtastic').click();
        }
        
        //Getting the mouse Co-ordinates
        if(canvas.rectDrawing || canvas.cropMode) {
            var posX=canvas.getPointer().x;
            var posY=canvas.getPointer().y;

            if(document.getElementById('lock').checked){
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
            var posX=canvas.getPointer().x;
            var posY=canvas.getPointer().y;

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

    /*
     * When mouse is clicked up from the canvas -
     * - set isMouseDown variable to false
     * - if free drawing mode is set, change the id attribute of the line just added (from 'undefined' to 'line')
     * - if text drawing mode is set, add a text object at the mouse coordinates, select the object and display relevant options
     * - if circle mode or rectangle mode is set, select the object
     * - call the updateLayers function
     */
    canvas.on('mouse:up',function(){
        canvas.isMouseDown=false;
        if(canvas.isDrawingMode == true) {
            var obj = canvas.getObjects()
            obj[obj.length - 1].id = "line";
        }

        if(canvas.straightLineMode) {
            refShape.setCoords();
        }

        if(canvas.textDrawing) {
            if(document.getElementById('italic').checked) {
                var italic = 'italic';
            } else {
                var italic = 'normal';
            }

            if(document.getElementById('bold').checked) {
                var bold = 700;
            } else {
                var bold = 400;
            }
            console.log("adding text");
            var text = new fabric.Text('text', {
                id: 'text',
                left: canvas.getPointer().x, 
                top: canvas.getPointer().y,
                fontFamily: "Lato",
                fontWeight: bold,
                fontStyle: italic,
                fill: $.farbtastic('#colorpicker').color
            });
            canvas.add(text);
            canvas.setActiveObject(text);
            $('#select-mode').click();
            document.getElementById("text-mode-options").style.display = '';
            canvas.textDrawing = false;
        }

        if(canvas.cropMode){
            var croppedLeft = refShape.left;
            var croppedTop = refShape.top;
            var croppedWidth = refShape.width;
            var croppedHeight = refShape.height;

            refShape.remove();
            canvas.renderAll();

            var url = canvas.toDataURL({
                format: 'png',
                left: croppedLeft,
                top: croppedTop,
                width: croppedWidth,
                height: croppedHeight
            });
            
            window.open(url);

            $('#select-mode').click();
        }

        if(canvas.circleDrawing || canvas.rectDrawing){
            canvas.setActiveObject(refShape);    
        }
        
        updateLayers();
    });

    /*
     * When the text field in the text object options gets an input, keydown, a paste or a change -
     * - change the text attribute of the object
     * - change the id value of the object
     * - call the updateLayers function
     */
    $('#text').on('change keydown paste input', function() {
        console.log("text changed");
        if (canvas.getActiveObject() && getSelectedType() == "text") {
            canvas.getActiveObject().text = document.getElementById('text').value;
            if (document.getElementById('text').value == "") {
                canvas.getActiveObject().id = "text";
            } else {
                canvas.getActiveObject().id = document.getElementById('text').value.replace(/(\r\n|\n|\r)/gm," ");
            }
            updateLayers();
            canvas.getActiveObject()._initDimensions();
            canvas.getActiveObject().setCoords();
            canvas.renderAll();
        }
    });

    $('#straight').change(function() {
        if(document.getElementById('straight').checked == true){
            canvas.straightLineMode = true;
            canvas.isDrawingMode = false;
        } else {
            canvas.isDrawingMode = true;
            canvas.straightLineMode = false;
        }
    });

    /*
     * When the font option changes change the font of the text on the select text object
     */
    $('#font').change(function() {
        console.log("font changed");
        canvas.getActiveObject().fontFamily = this.value;
        canvas.getActiveObject()._initDimensions();
        canvas.getActiveObject().setCoords();
        canvas.renderAll();
    });

    /*
     * When the bold checkbox is checked, toggle between bold and normal font on the object
     */
    $('#bold').change(function() {
        console.log("bold changed");
        if(document.getElementById('bold').checked) {
            canvas.getActiveObject().fontWeight = 700;
        } else {
            canvas.getActiveObject().fontWeight = 400;
        }
        canvas.getActiveObject()._initDimensions();
        canvas.getActiveObject().setCoords();
        canvas.renderAll();
    });

    /*
     * When the italic checkbox is checked, toggle between italic and normal font on the object
     */
    $('#italic').change(function() {
        console.log("italic changed");
        if(document.getElementById('italic').checked) {
            canvas.getActiveObject().fontStyle = 'italic';
        } else {
            canvas.getActiveObject().fontStyle = 'normal';
        }
        canvas.getActiveObject()._initDimensions();
        canvas.getActiveObject().setCoords();
        canvas.renderAll();
    });

    $('#outline').on('change keydown paste input', function() {
        console.log("outline changed");
        if (canvas.getActiveObject() && getSelectedType() == "text") {
            if(document.getElementById('outline').value == ""){
                canvas.getActiveObject().strokeWidth = 0;   
            } else {
                canvas.getActiveObject().stroke = document.getElementById('outline').value;
                canvas.getActiveObject().strokeWidth = 1;
            }
            updateLayers();
            canvas.getActiveObject()._initDimensions();
            canvas.getActiveObject().setCoords();
            canvas.renderAll();
        }
    });

    /*
     * When the color value from the color picker changes, change the color of the selected object (rect, circle, ellipse, line, text)
     */
    $('#colorvalue').change(function() {
        if(getSelectedType() == 'text'){
            console.log("text colour changed");
            canvas.getActiveObject().fill = $.farbtastic('#colorpicker').color;
        } else if (getSelectedType() != 'image' && getSelectedType() != null) {
            console.log("rect, circle, ellipse colour changed");
            if(document.getElementById('shape-fill').checked) {
                canvas.getActiveObject().fill = $.farbtastic('#colorpicker').color;
            }
            canvas.getActiveObject().stroke = $.farbtastic('#colorpicker').color;
        }
        canvas.renderAll();
    });

    /*
     * When the shape line width slider changes, change the line width of the selected shape (rect, circle, ellipse)
     */
    $('#shape-line-width').on('input', function(){
        if(getSelectedType() != 'text' && getSelectedType() != 'image' && getSelectedType() != null){
            canvas.getActiveObject().strokeWidth = parseInt(document.getElementById("shape-line-width").value, 10) || 1;
            canvas.getActiveObject().setCoords();
            canvas.renderAll();
        }
    });

    /*
     * When the shape line width slider changes, change the line width of the selected shape (rect, circle, ellipse)
     */
    $('#drawing-line-width').on('input', function(){
        if(getSelectedType() == 'path' || getSelectedType() == 'line'){
            canvas.getActiveObject().strokeWidth = parseInt(document.getElementById("drawing-line-width").value, 10) || 1;
            canvas.getActiveObject().setCoords();
            canvas.renderAll();
        }
    });



    /*
     * When the fill checkbox is checked, toggle between solid and hollow center on the object (rect, circle, ellipse)
     */
    $('#shape-fill').change(function(){
        if(canvas.getActiveObject()){
            if(getSelectedType() != 'text' && getSelectedType() != 'image'){
                if(document.getElementById('shape-fill').checked) {
                    var fill = $.farbtastic('#colorpicker').color;
                } else {
                    var fill = '';
                }
                canvas.getActiveObject().fill = fill;
                canvas.renderAll();
            }
        }
    });

    $('#erase-mode').click(function() {
        hideOptions();
        console.log("entering erase mode"); 

        canvas.eraser = true;
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = canvas.backgroundColor;
        canvas.freeDrawingBrush.width = 10;
        // define a custom fillCircle method
        /*context.fillCircle = function(x, y, radius, fillColor) {
            this.fillStyle = fillColor;
            this.beginPath();
            this.moveTo(x, y);
            this.arc(x, y, radius, 0, Math.PI * 2, false);
            this.fill();
        };

        //context.clearTo = function(fillColor) {
        //    context.fillStyle = fillColor;
            //context.fillRect(0, 0, width, height);
        //};
        //context.clearTo("#ddd");

        // bind mouse events
        canvas.on('mouse:move',function(e){
            if (!canvas.isDrawing) {
               return;
            }
            console.log("moving");
            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;
            var radius = 10; // or whatever
            var fillColor = 'red';
            //context.globalCompositeOperation = 'destination-out';
            context.fillCircle(x, y, radius, fillColor);
        });

        canvas.on('mouse:down',function(){
            canvas.isDrawing = true;
        });

        canvas.on('mouse:up',function(){
            canvas.isDrawing = false;
        });*/
    });

    /*
     * When an object is selected
     * - simulate a click on the select icon
     * - display the relevant options
     */
    canvas.on('object:selected', function() {
        hideOptions();
        $('#select-mode').click();
        if(getSelectedType() == 'text'){
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

            document.getElementById("text-mode-options").style.display = 'block';
        } else if (getSelectedType() == 'rect' || getSelectedType() == 'square' || getSelectedType() == 'circle' || getSelectedType() == 'ellipse') {
            document.getElementById("shape-line-width").value = canvas.getActiveObject().strokeWidth;
            if(canvas.getActiveObject().fill == ''){
                document.getElementById("shape-fill").checked = false;
            } else {
                document.getElementById("shape-fill").checked = true;
            }
            document.getElementById("shape-mode-options").style.display = 'block';
            document.getElementById("locklab").style.display = 'none';
        } else if (getSelectedType() == 'path' || getSelectedType() == 'line'){
            document.getElementById("drawing-line-width").value = canvas.getActiveObject().strokeWidth;
            document.getElementById("drawing-mode-options").style.display = 'block';
        }
    });

    /*
     * When objects stop being selected, unless in free drawing mode, simulate a select icon click
     */
    canvas.on('selection:cleared', function() {
        if( !canvas.isDrawingMode ){
            $('#select-mode').click();
        }
    });

    $('#rasterize').click(function(){
        if(getSelectedType() != null) {
            console.log("attempting to collapse");
            var obj = canvas.getObjects();
            var keepHidden = [];
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
            
            var url = canvas.toDataURL({
                format: 'png',
                left: 0,
                top: 0,
                width: canvas.width,
                height: canvas.height,
                multiplier: 1
            });

            //var tempImg = new Image();
            //tempImg.setAttribute('crossOrigin', 'anonymous'); //set this attribute to get around cross origin canvas security stuff.
            //tempImg.src = url;
            //context.drawImage(tempImg,0,0);
            //console.log(context);

            fabric.Image.fromURL(url, function(oImg){
                canvas.setBackgroundImage(oImg, canvas.renderAll.bind(canvas));
            });
            if(canvas.getActiveObject()) {
                canvas.getActiveObject().remove();
            } else if(getSelectedType() == "group") {
                canvas.getActiveGroup().forEachObject(function(o){ canvas.remove(o) });
            }
            var obj = canvas.getObjects();
            for(i=obj.length - 1; i >= 0;i--){
                if(!keepHidden.includes(obj[i])){
                    obj[i].visible = true;
                }
            }
            canvas.deactivateAll();
            canvas.renderAll();
            updateLayers();
        } else {
            alert('You need to select an object or group of objects to collapse them to the background')
        }
    });

    /*
     * When a key is pushed down, call this function
     * - only perform certain actions if the control key was held down when the function gets called
     * @param {Event} event Event object
     */
    $(document).on('keydown', function( event ) {
        //console.log(event.which);
        if(event.which == 46) { //delete object
            if(canvas.getActiveObject()) {
                canvas.getActiveObject().remove();  
            } else if(getSelectedType() == "group") {
                canvas.getActiveGroup().forEachObject(function(o){ canvas.remove(o) });
                canvas.discardActiveGroup().renderAll();
            }
            updateLayers();
        }
        if(event.ctrlKey==true && event.which == 187){ //zoom in
            event.preventDefault();
            zoomIn();
        }
        if(event.ctrlKey==true && event.which == 189){ //zoom out
            event.preventDefault();
            zoomOut();
        }
        if(event.ctrlKey==true && event.which == 48){ //reset zoom
            event.preventDefault();
            resetZoom();
        }
        if(event.ctrlKey==true && event.which == 8) { //reset pan
            resetPan();
        }
        if(event.ctrlKey==true && event.which == 83) { //save/export
            event.preventDefault();
            $('#exportButton').click();
        }
        if(event.ctrlKey==true && event.which == 73) { //import
            event.preventDefault();
            $('#importButton').click();
        }
        if(event.ctrlKey==true && event.which == 66) { //new
            event.preventDefault();
            $('#newCanvasButton').click();
        }
        if(event.ctrlKey==true && event.which == 79) { //open background image
            event.preventDefault();
            $('#background').click();
        }
        if(event.ctrlKey==true && event.which == 78) { //new **DOESN'T WORK ON CHROME USUALLY**
            event.preventDefault();
            $('#newCanvasButton').click();
        }
        if(event.which == 37) { //left arrow
            if(event.ctrlKey==true){ //pan left
                pan(10,0);
            } else {
                if(!$("input,textarea,select").is(":focus")) { //move object left
                    if(canvas.getActiveObject()) {
                        canvas.getActiveObject().left--;
                    } else if (getSelectedType() == "group"){
                        canvas.getActiveGroup().left--;
                    }
                    canvas.renderAll();
                }
            }
        }
        if(event.which == 38) { //up arrow
            if(event.ctrlKey==true){ //pan up
                pan(0,10);
            } else {
                if(!$("input,textarea,select").is(":focus")) { //move object up
                    if(canvas.getActiveObject()) {
                        canvas.getActiveObject().top--;
                    } else if (getSelectedType() == "group"){
                        canvas.getActiveGroup().top--;
                    }
                    canvas.renderAll();
                }
            }
        }
        if(event.which == 39) { //right arrow
            if(event.ctrlKey==true){ //pan right
                pan(-10,0);
            } else {
                if(!$("input,textarea,select").is(":focus")) { //move object right
                    if(canvas.getActiveObject()) {
                        canvas.getActiveObject().left++;
                    } else if (getSelectedType() == "group"){
                        canvas.getActiveGroup().left++;
                    }
                    canvas.renderAll();
                }
            }
        }
        if(event.which == 40) { //down arrow
            if(event.ctrlKey==true){ //pan down
                pan(0,-10);
            } else {
                if(!$("input,textarea,select").is(":focus")) { //move object down
                    if(canvas.getActiveObject()) {
                        canvas.getActiveObject().top++;
                    } else if (getSelectedType() == "group"){
                        canvas.getActiveGroup().top++;
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
            if (event.originalEvent.wheelDelta >= 0) {
                event.preventDefault();
                zoomIn();
            } else {
                event.preventDefault();
                zoomOut();
            }
        }
    });

    /*
     * Override copy behaviour to copy the selected object or group to clipboard
     */
    $(document).bind('copy', function() {
        if(!$("input,textarea,select").is(":focus")) {
            console.log('copied')
            if(canvas.getActiveObject()) {
                pasteMultiplier = 0;
                var i = 0;
                clipboard = [];
                var o = canvas.getActiveObject();
                clipboard[1] =  fabric.util.object.clone(o);
                clipboard[1].left = o.left + 15;
                clipboard[1].top = o.top + 15;
                updateLayers();
            } else if(getSelectedType() == "group") {
                pasteMultiplier = 0;
                var i = 0;
                clipboard = [];
                canvas.getActiveGroup().forEachObject(function(o) {
                    clipboard[i] = fabric.util.object.clone(o);
                    clipboard[i].left = o.left + (canvas.getActiveGroup().width/2) + canvas.getActiveGroup().left + 15;
                    clipboard[i].top = o.top + (canvas.getActiveGroup().height/2) + canvas.getActiveGroup().top + 15;
                    updateLayers();
                    i++;
                });
                canvas.deactivateAll().renderAll();
            } 
        }
    }); 

    /*
     * Override cut behaviour to copy the selected object or group to clipboard, and remove the object or group from the canvas
     */
    $(document).bind('cut', function() {
        if(!$("input,textarea,select").is(":focus")) {
            console.log('cut')
            if(canvas.getActiveObject()) {
                pasteMultiplier = 0;
                var i = 0;
                clipboard = [];
                var o = canvas.getActiveObject();
                clipboard[1] =  fabric.util.object.clone(o);
                clipboard[1].left = o.left + 15;
                clipboard[1].top = o.top + 15;
                canvas.getActiveObject().remove();
                updateLayers();
            } else if(getSelectedType() == "group") {
                pasteMultiplier = 0;
                var i = 0;
                clipboard = [];
                canvas.getActiveGroup().forEachObject(function(o) {
                    clipboard[i] = fabric.util.object.clone(o);
                    clipboard[i].left = o.left + (canvas.getActiveGroup().width/2) + canvas.getActiveGroup().left + 15;
                    clipboard[i].top = o.top + (canvas.getActiveGroup().height/2) + canvas.getActiveGroup().top + 15;
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
        if(!$("input,textarea,select").is(":focus")) {
            console.log('pasted')
            var i = 0;
            var paste = [];
            clipboard.forEach(function(o) {
                paste[i] = fabric.util.object.clone(o);
                canvas.add(paste[i]);
                paste[i].set("top", paste[i].top + (pasteMultiplier*15));
                paste[i].set("left", paste[i].left + (pasteMultiplier*15));
                updateLayers();
                canvas.renderAll();
                i++;
            })
            pasteMultiplier++;
        } else if($("#importJSON").is(":focus")) {
            e.preventDefault();
            $('#importJSON').val("Loading...");
            var data = e.originalEvent.clipboardData.getData('text');
            setTimeout(function() {
                $('#importJSON').val(data);
            }, 0, data);
        }
    });

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