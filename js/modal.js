//Keyboard shortcut Modal
$('#keyboard-icon').hover(function(){
    $('#keyboardModal').fadeIn(800);
    $('#keyboardModal .modal-content').fadeIn(800);
},function(){
    $('#keyboardModal').fadeOut(800);
    $('#keyboardModal .modal-content').fadeOut(800);
});

//Export Modal
$('#exportButton').click(function(){
    document.getElementById('exportModal').style.display = "block";
});

$('.export').click(function(){
    if($(this).attr("value")=="json"){
        document.getElementById('jsonModal').style.display = "block";
        document.getElementById('json').innerHTML = JSON.stringify(canvas, null, 4)
    } else {
        window.open(canvas.toDataURL( {format: $(this).attr("value") })) 
    }
});

$('#select').click(function(){
    var range = document.createRange();
    range.selectNode(document.getElementById('json'));
    window.getSelection().addRange(range);
});

//Export Modal
$('#newCanvasButton').click(function(){
    document.getElementById('newCanvasModal').style.display = "block";
});

$('#newCanvas').click(function(){
    newCanvas(document.getElementById('width').value,document.getElementById('height').value);
});

// When the user clicks on <span> (x), close the modal
$('.close').click(function() {
    document.getElementById('newCanvasModal').style.display = "none";
    document.getElementById('exportModal').style.display = "none";
});

$('.closeJSON').click(function() {
    document.getElementById('jsonModal').style.display = "none";
});

// When the user clicks anywhere outside of the modal, close it
$(window).click(function(event) {
    if (event.target == document.getElementById('exportModal')) {
        document.getElementById('exportModal').style.display = "none";
    }
    if (event.target == document.getElementById('newCanvasModal')) {
        document.getElementById('newCanvasModal').style.display = "none";
    }
    if (event.target == document.getElementById('jsonModal')) {
        document.getElementById('jsonModal').style.display = "none";
    }
});

$('.form').submit(function(e) {
    e.preventDefault();
});