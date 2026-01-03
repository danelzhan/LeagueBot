

var canvas = document.getElementById("annotate_canvas");
var ctx = canvas.getContext("2d");

ctx.strokeStyle = "red";
ctx.lineWidth = "1px"

var dragging = false;

var startX = 0;
var startY = 0;
var endX = 0;
var endY = 0;

var annotations = [];
var boxes = [];
const frame = canvas.getBoundingClientRect();

canvas.addEventListener("mousedown", (e) => {
    handleMouseDown(e);
});

canvas.addEventListener("mouseup", (e) => {
    handleMouseUp(e);
});

function handleMouseDown(e) {
    console.log("mouse location:", e.clientX, e.clientY);
    dragging = true;
    startX = e.clientX - frame.left;
    startY = e.clientY - frame.top;
}

function handleMouseUp(e) {
    if (dragging == false) return;
    dragging = false;
    endX = e.clientX - frame.left;
    endY = e.clientY - frame.top;
    drawRectangle(startX, startY, endX, endY);
}

function drawRectangle(startX, startY, endX, endY) {

    var x = 0;
    var y = 0;
    var width = 0;
    var height = 0;

    if (Math.abs(endX - startX) < 10 || Math.abs(endY - startY) < 10) {
        console.log("Box too small");
    } else {
        x = Math.min(endX, startX);
        y = Math.min(endY, startY);
        width = Math.max(endX, startX) - x;
        height = Math.max(endY, startY) - y;
        ctx.rect(x, y, width, height);
        ctx.stroke();

        saveAnnotation()

    }
}

function saveAnnotation() {
    var annotation = {
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY
    }

    annotations.push(annotation);

    console.log(annotations);

}