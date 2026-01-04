import fs from 'fs';
import path from 'path';

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

        saveAnnotation();
        updateAnnotatedList(startX, startY, endX, endY);

    }
}

const labels = document.getElementById("label");

function saveAnnotation() {
    var annotation = {
        label: labels.value,
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY
    }

    annotations.push(annotation);

    console.log(annotations);

}

// managing the lists that are annotated
const annotatedList = document.getElementById("annotations");
labels.addEventListener("change", () => {restoreAnnotatedList()});

function updateAnnotatedList(startX, startY, endX, endY) {
    const newAnnotation = document.createElement("div");
    var text = document.createElement("p");
    text.innerHTML = "startX: " + startX + " startY: " + startY + " | endX: " + endX + " endY: " + endY;
    newAnnotation.appendChild(text);
    annotatedList.appendChild(newAnnotation);
}

function restoreAnnotatedList() {
    clearAnnotatedList();
    for (var i = 0; i < annotations.length; i++) {
        console.log("it")
        if (annotations[i].label === labels.value) {
            console.log(annotations[i]);
            updateAnnotatedList(annotations[i].startX, annotations[i].startY, annotations[i].endX, annotations[i].endY);
        }
    }
}

function clearAnnotatedList() {
    annotatedList.replaceChildren();
}

// creating labels
const newLabelText = document.getElementById("new_label");
const addLabelButton = document.getElementById("add_label");

addLabelButton.addEventListener("click", addLabel);

function addLabel() {
    const newLabel = document.createElement("option");
    newLabel.attributes.value = newLabelText.value;
    newLabel.innerHTML = newLabelText.value;
    labels.appendChild(newLabel);
    newLabelText.value = "";
}

var data = [];

// manage input data
document.getElementById('file_input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;
            const lines = contents.split('\n');
            

            for (var i = 0; i < lines.length; i++) {
                const fields = lines[i].split(',');
                data.push(fields);
            }

            console.log("data", data);
            document.getElementById('output').textContent = contents;
        };
        reader.readAsText(file)
    } else {
        console.log("upload error")
    }
});

function updateData(file_address, startX, startY, endX, endY, label) {
    data[0].push(file_address);
    data[1].push(startX);
    data[2].push(startY);
    data[3].push(endX);
    data[4].push(endY);
    data[5].push(label);
}

var images = []

function getImages() {

    const folderPath = './raw_data';

    try {
    const filenames = fs.readdirSync(folderPath);

    filenames.forEach((file) => {
        console.log('Found file or directory:', file);
        const fullPath = path.join(folderPath, file);
        
        // Check if it's a file or directory
        if (needsAnnotation(file)) {
            console.log(`'${file}' is a file.`);
        }
    });
    } catch (err) {
    console.error('Error reading directory:', err);
    }


}

function needsAnnotation(file) {
    for (var i = 0; i < data[0].length; i++) {
        if (file === data[0][i]) return false;
    }
    return true;
}

getImages()