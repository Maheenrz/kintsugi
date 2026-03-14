let cracks = [];
let jarImg;
let jarScale = 0.9;

function preload() {
    // Ensure this path matches your folder structure exactly!
    jarImg = loadImage('assets/images/jar.png');
}

function setup() {
    // Determine canvas size (responsive but capped at 500px)
    let canvasSize = min(windowWidth - 40, 500);
    let cnv = createCanvas(canvasSize, canvasSize);
    
    // Move canvas into the HTML wrapper
    cnv.parent('canvas-wrapper');
    
    pixelDensity(1);
    initializeJar();
}

function initializeJar() {
    background(20);
    // Resize jar to fit the current canvas width
    jarImg.resize(width, 0); 
    imageMode(CENTER);
    image(jarImg, width / 2, height / 2);
}

function draw() {
    // We don't redraw the background here so the lines stay visible
    for (let crack of cracks) {
        crack.update();
        crack.display();
    }
}

function windowResized() {
    let canvasSize = min(windowWidth - 40, 500);
    resizeCanvas(canvasSize, canvasSize);
    initializeJar();
    cracks = []; 
}

/**
 * CORE FIX: Input Handling
 * This uses getBoundingClientRect to find the canvas on the page 
 * even after the user has scrolled down.
 */
function handleInput(screenX, screenY) {
    let cnvRect = document.querySelector('canvas').getBoundingClientRect();
    
    // 1. Calculate the click position relative to the TOP-LEFT of the canvas
    let relX = screenX - cnvRect.left;
    let relY = screenY - cnvRect.top;

    // 2. Map that to the Jar Image's internal coordinates
    let imgX = floor(relX - (width / 2 - jarImg.width / 2));
    let imgY = floor(relY - (height / 2 - jarImg.height / 2));
    
    // 3. Check if we are inside the image boundaries
    if (imgX >= 0 && imgX < jarImg.width && imgY >= 0 && imgY < jarImg.height) {
        let c = jarImg.get(imgX, imgY);
        
        // 4. Only start crack if pixel is NOT transparent
        if (alpha(c) > 0) {
            for (let i = 0; i < 6; i++) {
                cracks.push(new Crack(relX, relY));
            }
        }
    }
}

// Mouse Event
function mousePressed() {
    // 'mouseX' in p5 is already relative, but when scrolling we need window coordinates
    // We use the browser's native clientX/Y for precision with getBoundingClientRect
    handleInput(mouseX + document.querySelector('canvas').getBoundingClientRect().left, 
                mouseY + document.querySelector('canvas').getBoundingClientRect().top);
}

// Touch Event (Mobile)
function touchStarted() {
    if (touches.length > 0) {
        handleInput(touches[0].x + document.querySelector('canvas').getBoundingClientRect().left, 
                    touches[0].y + document.querySelector('canvas').getBoundingClientRect().top);
    }
    
    // Prevent scrolling ONLY if the touch is on the canvas
    let cnvRect = document.querySelector('canvas').getBoundingClientRect();
    if (mouseX > cnvRect.left && mouseX < cnvRect.right && 
        mouseY > cnvRect.top && mouseY < cnvRect.bottom) {
        return false; 
    }
}

class Crack {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D().mult(random(0.5, 2));
        this.prevPos = this.pos.copy();
        this.lifetime = random(50, 150);
    }

    update() {
        if (this.lifetime <= 0) return;

        this.prevPos = this.pos.copy();
        
        // Look ahead to check the edge
        let nextPos = p5.Vector.add(this.pos, p5.Vector.mult(this.vel, 3));
        let imgX = floor(nextPos.x - (width / 2 - jarImg.width / 2));
        let imgY = floor(nextPos.y - (height / 2 - jarImg.height / 2));

        if (imgX >= 0 && imgX < jarImg.width && imgY >= 0 && imgY < jarImg.height) {
            let c = jarImg.get(imgX, imgY);
            if (alpha(c) > 0) {
                this.vel.rotate(random(-0.15, 0.15));
                this.pos.add(this.vel);
                this.lifetime--;
            } else { this.lifetime = 0; }
        } else { this.lifetime = 0; }
    }

    display() {
        if (this.lifetime > 0) {
            drawingContext.shadowBlur = 12;
            drawingContext.shadowColor = color(212, 175, 55);
            
            stroke(212, 175, 55);
            strokeWeight(random(0.8, 2.2));
            line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
            
            drawingContext.shadowBlur = 0;
        }
    }
}

function saveKintsugi() {
    saveCanvas('kintsugi-repair', 'png');
}

function clearCanvas() {
    cracks = [];
    initializeJar();
}