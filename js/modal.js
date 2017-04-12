/* These functions control the modals and functions within the modals
 *
 * Author: Matt Carrick
 * Website: http://matt.netsoc.co/FYP
 */

/*
 * On hover of the keyboard icon fade in the modal background and content box
 * On mouseout, fade them both out
 */
$('#keyboard-icon').hover(function(){
    $('#keyboardModal').fadeIn(800);
    $('#keyboardModal .modal-content').fadeIn(800);
},function(){
    $('#keyboardModal').fadeOut(800);
    $('#keyboardModal .modal-content').fadeOut(800);
});

/*
 * On click on the export button in the file menu, display the export modal
 */
$('#exportButton').click(function(){
    $("#exportModal").show();
});

$(document).ready(function(){
    if (/Mobi/.test(navigator.userAgent)) {
        $("#mobileModal").show();
    }
});

/*
 * On click on the export button in the file menu, display the export modal
 */
$('#filterButton').click(function(){
    $("#filterModal").show();
    if(!canvas.backgroundImage) {
        $("#filter-warning").show();
        $(".background-filter-options input").prop('disabled', true);
    } else {
        $("#filter-warning").hide();
        $(".background-filter-options input").prop('disabled', false);
    }
});

/*
 * When any of the export buttons are clicked, either -
 * display the JSON modal and fill the code box with JSON, or
 * open the image on the canvas in a new tab/window
 */
$('.export').click(function(){
    if($(this).attr("value")=="json"){
        document.getElementById('json').innerHTML = 'Loading...';
        $("#jsonModal").show();
        setTimeout(function() {
            var zoom = canvas.getZoom();
            canvas.setZoom(1);
            canvas.setDimensions({
                width: initWidth,
                height: initHeight
            });

            document.getElementById('json').innerHTML = JSON.stringify(canvas.toJSON(['width', 'height', 'id', 'flipX2', 'flipY2']), null, 4);

            canvas.setZoom(zoom);
            canvas.setDimensions({
                width: initWidth * canvas.getZoom(),
                height: initHeight * canvas.getZoom()
            });
        }, 0);
    } else {
        var zoom = canvas.getZoom();
        canvas.setZoom(1);
        canvas.setDimensions({
            width: initWidth,
            height: initHeight
        });

        window.open(canvas.toDataURL( {format: $(this).attr("value") }));

        canvas.setZoom(zoom);
        canvas.setDimensions({
            width: initWidth * canvas.getZoom(),
            height: initHeight * canvas.getZoom()
        });
    }
});

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

$('#importButton').click(function(){
    $("#importModal").show();
});

$('#import').click(function(){
    var json = document.getElementById('importJSON').value;
    try {
        var object = JSON.parse(json);
    } catch(err){
        alert("There seems to be a problem with your JSON. Make sure it's formatted correctly and try again. Sorry about that");
        return;
    }
    console.log("importing")
    try {
        if("objects" in object && "background" in object && "width" in object && "height" in object) {
            canvas.loadFromJSON(json, function(){
                canvas.renderAll.bind(canvas);
                canvas.setWidth(object.width);
                canvas.setHeight(object.height);
                initWidth = canvas.getWidth();
                initHeight = canvas.getHeight();
                $("#canvasWrapper").width(canvas.getWidth());
                var obj = canvas.getObjects();
                for(i=obj.length - 1; i >= 0;i--){
                    if(obj[i].flipX2 == true && obj[i].flipY2 == true){
                        //do nothing
                    }else if(obj[i].flipY2 == true || obj[i].flipX2 == true){
                        console.log("flipping")
                        obj[i].flipY = true;
                    }
                }
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
                canvas.renderAll();
                resetPan();
                updateLayers();
                $('.close').click();
            });
        } else {
            throw("You may have badly formatted JSON, please make sure it has objects, background, width and height properties");
        }
    } catch(err) {
        alert(err);
    }
})

//Export Modal
$('#newCanvasButton').click(function(){
    $('#bgcolour').val(canvas.backgroundColor);
    $("#newCanvasModal").show();
});

$('#newCanvas').click(function(){
    newCanvas(document.getElementById('width').value,document.getElementById('height').value);
});

$('#resizeButton').click(function(){
    console.log("here");
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

$('#resizeCanvas').click(function(){
    resizeCanvas(document.getElementById('resizeWidth').value,document.getElementById('resizeHeight').value);
});

$('#resizeWidth').on('change keydown paste input', function() {
    if(document.getElementById('resizeLocked').checked == true){
        if(document.getElementById('resizeType').value == 'px'){
            document.getElementById('resizeHeight').value = initHeight * (document.getElementById('resizeWidth').value/initWidth);
        } else {
            document.getElementById('resizeHeight').value = document.getElementById('resizeWidth').value; 
        }
    }
});

$('#resizeHeight').on('change keydown paste input', function() {
    if(document.getElementById('resizeLocked').checked == true){
        if(document.getElementById('resizeType').value == 'px'){
            document.getElementById('resizeWidth').value = initWidth * (document.getElementById('resizeHeight').value/initHeight);
        } else {
            document.getElementById('resizeWidth').value = document.getElementById('resizeHeight').value;
        }
    }
});

// When the user clicks on <span> (x), close the modal
$('.close').click(function() {
    $("#exportModal").hide();
    $("#newCanvasModal").hide();
    $("#importModal").hide();
    $("#resizeModal").hide();
    $("#mobileModal").hide();
    $("#filterModal").hide();
});

$('.closeJSON').click(function() {
    $("#jsonModal").hide();
});

// When the user clicks anywhere outside of the modal, close it
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

$('.form').submit(function(e) {
    e.preventDefault();
});