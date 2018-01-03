/* These functions control the modals and functions within the modals
 *
 * Author: Matt Carrick
 * Website: http://stijl.cc
 */

/*
 * On hover of the keyboard icon fade in the modal background and content box
 * On mouseout, fade them both out
 */
$('#keyboard-icon').hover(function(){
    $('#keyboardModal').fadeIn(800); //fade in modal background
    $('#keyboardModal .modal-content').fadeIn(800); //fade in modal window
},function(){
    $('#keyboardModal').fadeOut(800); //fade out modal background
    $('#keyboardModal .modal-content').fadeOut(800); //fade out modal window
});

/*
 * On click on the export button in the file menu, display the export modal
 */
$('#exportButton').click(function(){
    $("#exportModal").show();
});

/*
 * On document load, check if their userAgent includes the string "Mobi" and display the mobile warning modal if so
 */
$(document).ready(function(){
    if (/Mobi/.test(navigator.userAgent)) {
        $("#mobileModal").show();
    }
});

/*
 * On click on the export button in the file menu, display the export modal
 */
$('#filterButton').click(function(){
    $("#filterModal").show(); //show the background image filter modal
    if(!canvas.backgroundImage) { //if there's no background image filter
        $("#filter-warning").show(); //display a warning informing users there's no background image
        $(".background-filter-options input").prop('disabled', true); //disable the checkboxes
    } else { //if there is a backgroun image
        $("#filter-warning").hide(); //hide the warning
        $(".background-filter-options input").prop('disabled', false); //enable the checkboxes
    }
});

/*
 * When any of the export buttons are clicked, either -
 * display the JSON modal and fill the code box with JSON, or
 * open the image on the canvas in a new tab/window
 */
$('.export').click(function(){
    //if($(this).attr("value")=="json"){ //if JSON export is clicked
        document.getElementById('json').innerHTML = 'Loading...'; //put a loading warning in the json field
        $("#jsonModal").show(); //show the json modal
        setTimeout(function() { //use an async function to display the JSON
            //temporarily change zoom level to 1
            var zoom = canvas.getZoom();
            resetZoom();

            //generate the JSON and display it
            document.getElementById('json').innerHTML = JSON.stringify(canvas.toJSON(['width', 'height', 'id', 'flipX2', 'flipY2']), null, 4);

            //revert zoom to the previous value
            fixZoom(zoom);
        }, 0);
    //}
});

document.getElementById('png').addEventListener('click', function() {
    downloadCanvas(this, 'png', 'image.png');
}, false);

document.getElementById('jpg').addEventListener('click', function() {
    downloadCanvas(this, 'jpeg', 'image.jpg');
}, false);

function downloadCanvas(link, format, filename) {
    //temporarily change zoom level to 1
    var zoom = canvas.getZoom();
    resetZoom();

    link.href = canvas.toDataURL( {format: format });
    link.download = filename;

    //revert zoom to the previous value
    fixZoom(zoom);
}

/*
 * When the "Select All" button is clicked on in the JSON modal
 * Select/highlight all the JSON code in the window
 */
$('#select').click(function(){
    var text = document.getElementById('json');
    if (document.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    } 
});

/*
 * When the import menu button is clicked show the import the modal
 */
$('#importButton').click(function(){
    $("#importModal").show();
});

/*
 * When the import button on the import modal is clicked, try imprt the user JSON
 */
$('#import').click(function(){
    var json = document.getElementById('importJSON').value; //get the JSON from the textarea
    try { //try to parse the json
        var object = JSON.parse(json);
    } catch(err){ //if json doesn't parse return an error
        alert("There seems to be a problem with your JSON. Make sure it's formatted correctly and try again. Sorry about that");
        return;
    }
    //console.log("importing")
    
    try { //try import the json again
        if("objects" in object && "background" in object && "width" in object && "height" in object) { //if the json doesn't have atleast those properties, return an error
            canvas.loadFromJSON(json, function(){ //Load the canvas from JSON
                canvas.renderAll.bind(canvas); //render changes
                canvas.setWidth(object.width); //Set the canvas size
                canvas.setHeight(object.height);
                initWidth = canvas.getWidth(); //change the initial size
                initHeight = canvas.getHeight();
                $("#canvasWrapper").width(canvas.getWidth()); //fix the background pattern
                var obj = canvas.getObjects(); //get all objects
                for(i=obj.length - 1; i >= 0;i--){ //loop though all objects
                    if(obj[i].flipX2 == true && obj[i].flipY2 == true){ //If both flip vars are true do nothing
                        //do nothing
                    }else if(obj[i].flipY2 == true || obj[i].flipX2 == true){ //if only one of them are true flip the object
                        //console.log("flipping")
                        obj[i].flipY = true;
                    }
                }

                //fix the zoom if the new canvas is bigger than the screen
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

                canvas.renderAll(); //render changes
                resetPan(); //reset canvas to center
                updateLayers(); //update layer window
                $('.close').click(); //close the JSON modal
            });
        } else { //if there's an error in the json, throw error
            throw("You may have badly formatted JSON, please make sure it has objects, background, width and height properties");
        }
    } catch(err) {
        alert(err); //display the error
    }
})

/*
 * When the new canvas button in the menu is clicked show the new canvas modal
 */
$('#newCanvasButton').click(function(){
    $('#bgcolour').val(canvas.backgroundColor); //get the current background colour and set the text box to be this
    $("#newCanvasModal").show();
});

/*
 * When the newCanvas button in the newcanvasmodal is clicked create a new canvas
 */
$('#newCanvas').click(function(){
    newCanvas(document.getElementById('width').value,document.getElementById('height').value); //create new canvas with these dimensions passed in
});

/*
 * When the resizeButton is clicked in the menu, get the resize settings and how the modal.
 */
$('#resizeButton').click(function(){
    if(canvas.backgroundColor){
        document.getElementById('resizeBgcolour').value = canvas.backgroundColor;
        document.getElementById('resizeTransparent').checked = false;  
    } else {
        document.getElementById('resizeBgcolour').value = '';
        document.getElementById('resizeTransparent').checked = true;  
    }
    document.getElementById('resizeLocked').checked = false;
    document.getElementById('resizeWidth').value = initWidth;
    document.getElementById('resizeHeight').value = initHeight;
    document.getElementById('resizeType').value = 'px';
    $("#resizeModal").show();
});

/*
 * When the resize canvas function in the resize modal is clicked, resize the canvas.
 */
$('#resizeCanvas').click(function(){
    resizeCanvas(document.getElementById('resizeWidth').value,document.getElementById('resizeHeight').value); //resize the canvas with these new dimensions
});

/*
 * Whenever the width is changed in the resize modal, if the maintain aspect ratio is checked, change the height by the same ratio
 */
$('#resizeWidth').on('change keydown paste input', function() {
    if(document.getElementById('resizeLocked').checked == true){
        if(document.getElementById('resizeType').value == 'px'){
            document.getElementById('resizeHeight').value = initHeight * (document.getElementById('resizeWidth').value/initWidth);
        } else {
            document.getElementById('resizeHeight').value = document.getElementById('resizeWidth').value; 
        }
    }
});

/*
 * Whenever the height is changed in the resize modal, if the maintain aspect ratio is checked, change the width by the same ratio
 */
$('#resizeHeight').on('change keydown paste input', function() {
    if(document.getElementById('resizeLocked').checked == true){
        if(document.getElementById('resizeType').value == 'px'){
            document.getElementById('resizeWidth').value = initWidth * (document.getElementById('resizeHeight').value/initHeight);
        } else {
            document.getElementById('resizeWidth').value = document.getElementById('resizeHeight').value;
        }
    }
});

/*
 * When the X icon is clicked, close the modal
 */
$('.close').click(function() {
    $("#exportModal").hide();
    $("#newCanvasModal").hide();
    $("#importModal").hide();
    $("#resizeModal").hide();
    $("#mobileModal").hide();
    $("#filterModal").hide();
});

/*
 * When the X icon is clicked on the json modal, close it
 */
$('.closeJSON').click(function() {
    $("#jsonModal").hide();
});

/*
 * When the user clicks anywhere outside of the modal, close it
 */
$(window).click(function(event) {
    if (event.target == document.getElementById('exportModal')) {
        $("#exportModal").hide();
    }
    if (event.target == document.getElementById('newCanvasModal')) {
        $("#newCanvasModal").hide();
    }
    if (event.target == document.getElementById('importModal')) {
        $("#importModal").hide();
    }
    if (event.target == document.getElementById('resizeModal')) {
        $("#resizeModal").hide();
    }
    if (event.target == document.getElementById('mobileModal')) {
        $("#mobileModal").hide();
    }
    if (event.target == document.getElementById('filterModal')) {
        $("#filterModal").hide();
    }
    if (event.target == document.getElementById('jsonModal')) {
        $("#jsonModal").hide();
    }
});

/*
 * Disable the form submissions
 */
$('.form').submit(function(e) {
    e.preventDefault();
});