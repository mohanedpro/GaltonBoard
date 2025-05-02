let canvasbox = document.getElementById("canvasbox")
let marblecount = document.getElementById("marblecount")
let pegcount = document.getElementById("pegcount")
const pegrowsinput = document.getElementById("pegrows");
const pegdivsinput = document.getElementById("pegdivs");
const pegsizeinput = document.getElementById("pegsizeinput");

let tt = document.getElementById('canvas1')

let width = 850;
let height = tt.offsetHeight - 2;
let marblesize = 10;
let marblefriction = 0.5;
let pegfriction = 0.1;
let dividerthickness = 6;
let gravity = 1.1;
let engine;
let world;
let paused = false;
let pegsize = 14;
let pegrow = 6;
let pegdiv = 12;

let mean = width / 2; // Mean of the bell curve
let stdDev = 9; // Standard deviation of the bell curve


let floor;
let roof;
let leftwall;
let rightwall;


let tempboxes = [];
let dividers = [];
let pegs = [];
let obstacles = [];



let marblesizeinput = document.getElementById("marblesizeinput")
marblesizeinput.addEventListener("change", function (e) {
    console.log("marble size changed")

    marblesize = e.target.value
})

let marblefrictioninput = document.getElementById("marblefrictioninput")
marblefrictioninput.addEventListener("change", function (e) {
    console.log("marble friction changed")

    marblefriction = e.target.value
})


let gravityinput = document.getElementById("gravityinput")
gravityinput.addEventListener("change", function (e) {
    console.log("gravity changed")

    gravity = e.target.value
    world.gravity.y = parseFloat(e.target.value);
})


let resetbutton = document.getElementById("resetbutton").addEventListener("click", function (e) {
    // delet all the marbles

    tempboxes.forEach(element => {
        Matter.Composite.remove(world, element);
    });
    tempboxes = []
    marblecount.innerText = 0

})

let pausebutton = document.getElementById("pausebutton")
pausebutton.addEventListener("click", function (e) {
    console.log("pause button pressed")

    if (paused == false) {
        tempboxes.forEach(element => {
            element.isStatic = true
        });
        pausebutton.innerText = "Resume"
        paused = true
    }

    else {
        tempboxes.forEach(element => {
            element.isStatic = false
        });
        pausebutton.innerText = "Pasue"
        paused = false
    }

})




function setup() {

    marblesizeinput.value = marblesize
    marblefrictioninput.value = marblefriction
    gravityinput.value = gravity
    pegrowsinput.value = pegrow
    pegdivsinput.value = pegdiv
    pegsizeinput.value = pegsize

    // 800 / 3 = 267
    // 267 * 2 = 534
    let canvas = createCanvas(width, height);
    canvas.parent(canvasbox);

    
    engine = Matter.Engine.create();
    world = engine.world;
    world.gravity.y = gravity;
    

    // Create the walls
    createthewalls()
    // create dividers
    createDividers(14);
    // create pegs
    createPegs(12, 6) // 11 or 12
    // create obstacles
    addobstacles()

    // Run the engine
    Matter.Engine.run(engine);
}


function draw() {
    // let s_color = '#341c61'
    let s_color = '#EFE9D5'

    // Update the engine
    Matter.Engine.update(engine);

    // background(256);
    // background('#03090e');
    background('#1b2f40');
    fill(0);

    // lines
    // line(0, height / 3, width, height / 3);
    // line(0, (height / 3) * 2, width, (height / 3) * 2);

    // // draw walls
    rectMode(CENTER);
    // fill(150);
    fill(s_color);
    noStroke()
    rect(floor.position.x, floor.position.y, width, 15);
    // rect(roof.position.x, roof.position.y, width, 15);
    // rect(leftwall.position.x, leftwall.position.y, 15, height);
    // rect(rightwall.position.x, rightwall.position.y, 15, height);


    // draw dividers
    for (let index = 0; index < dividers.length; index++) {
        rectMode(CENTER);
        // fill(150);
        fill(s_color);
        noStroke()
        rect(dividers[index].position.x, dividers[index].position.y, dividerthickness, height / 3);
    }


    // draw pegs
    for (let index = 0; index < pegs.length; index++) {
        rectMode(CENTER);
        // fill(150);
        fill(s_color);
        noStroke()
        circle(pegs[index].position.x, pegs[index].position.y, pegsize);
    }


    // draw tempboxes
    for (let index = 0; index < tempboxes.length; index++) {
        const x = tempboxes[index].position.x;
        const y = tempboxes[index].position.y;
        const size = marblesize * 2;
    
        push(); // Save current drawing style
        rectMode(CENTER);
    
        // Add glow using HTML5 Canvas API
        drawingContext.shadowBlur = 25;
        drawingContext.shadowColor = '#fcad03';
    
        // stroke(255); // Optional white stroke
        // strokeWeight(1);
        fill('#fcad03'); // Main fill color
        circle(x, y, size); // Draw the marble
        pop(); // Restore drawing style
    }

    // draw obstacles
    for (let index = 0; index < obstacles.length; index++) {
        rectMode(CENTER);
        // fill(150);
        fill(s_color);
        noStroke()
        push();
        translate(obstacles[index].position.x, obstacles[index].position.y);
        rotate(obstacles[index].angle);

        rect(0, 0, width / 3 + 140, 15);
        pop();
    }


    // draw the bell curve
    // stroke(150);
    fill(s_color);
    stroke('#7AE2CF');
    strokeWeight(3)
    noFill();
    beginShape();
    for (let x = 0; x < width; x++) {
        let y = 5000 * bellCurve(x);
        vertex(x, height - y);
    }
    endShape();

}


// Function to calculate the value of the bell curve at a given x-coordinate
function bellCurve(x) {
    let exponent = -0.002 * ((x - mean) / stdDev) ** 2;
    return (1 / (stdDev * sqrt(TWO_PI))) * exp(exponent); 
}


function mouseDragged() {
    // console.log(`Mouse clicked! x=${mouseX} y=${mouseY}`);
    // create a box on click
    let boxtemp = Matter.Bodies.circle(mouseX, mouseY, marblesize);
    boxtemp.mass = 10;
    boxtemp.restitution = 0.4;
    boxtemp.friction = marblefriction
    tempboxes.push(boxtemp)
    // console.log(boxtemp.mass)
    // Matter.Body.set(boxtemp, "collisionFilter", { group: 1 });
    Matter.World.add(world, boxtemp);
    marblecount.innerText = tempboxes.length
}


function createDividers(numberofdivs) {
    let eachdivwidth = width / numberofdivs
    const divideroptions = {
        isStatic: true
    };
    for (let index = 0; index < numberofdivs - 1; index++) {

        let temdivider = Matter.Bodies.rectangle(eachdivwidth + index * eachdivwidth, height - (height / 3) / 2 + 70, dividerthickness, height / 3, divideroptions);
        dividers.push(temdivider)
    }
    Matter.World.add(world, dividers);
}

function createPegs(numberofdivs, rows) {
    let eachdivwidth = width / numberofdivs
    const pegoptions = {
        isStatic: true
    };

    // loop for rows
    for (let j = 0; j < rows; j++) {
        for (let index = 0; index < numberofdivs - 1; index++) {
            if (j % 2 === 0) {
                // Even iteration
                let temppeg = Matter.Bodies.circle(eachdivwidth + index * eachdivwidth + eachdivwidth / 2, (height / 3) + j * eachdivwidth / 1.5, 15, pegoptions);

                temppeg.restitution = 0;
                temppeg.friction = pegfriction

                pegs.push(temppeg)
            } else {
                // Odd iteration
                let temppeg = Matter.Bodies.circle(eachdivwidth + index * eachdivwidth, (height / 3) + j * eachdivwidth / 1.5, 15, pegoptions);
                temppeg.restitution = 0;
                temppeg.friction = pegfriction
                pegs.push(temppeg)
            }
        }
    }
    Matter.World.add(world, pegs);
    pegcount.innerText = pegs.length
}

function addobstacles() {

    const rotationAngle = 28; // Set the desired rotation angle in degrees
    const rotationInRadians = radians(rotationAngle);


    const divideroptions = {
        isStatic: true
    };

    let tempobstacle1 = Matter.Bodies.rectangle(width / 3 - 80, (height / 4) - 120, width / 3 + 140, 20, divideroptions);
    Matter.Body.rotate(tempobstacle1, rotationInRadians);


    obstacles.push(tempobstacle1)
    let tempobstacle2 = Matter.Bodies.rectangle(width / 3 * 2 + 80, (height / 4) - 120, width / 3 + 140, 20, divideroptions);
    Matter.Body.rotate(tempobstacle2, - rotationInRadians);

    obstacles.push(tempobstacle2)

    Matter.World.add(world, obstacles);

}

function createthewalls() {
    //floor
    const groundOptions = {
        isStatic: true
    };
    floor = Matter.Bodies.rectangle(width / 2, height - 2, width, 20, groundOptions);
    //roof
    roof = Matter.Bodies.rectangle(width / 2, 2, width, 20, groundOptions);
    //leftwall
    leftwall = Matter.Bodies.rectangle(2, height / 2, 20, height, groundOptions);
    //rightwall
    rightwall = Matter.Bodies.rectangle(width - 2, height / 2, 20, height, groundOptions);

    Matter.World.add(world, [floor, roof, leftwall, rightwall]);
}

//----------------------------------------------------------

pegrowsinput.addEventListener("change", updatePegs);
pegdivsinput.addEventListener("change", updatePegs);

function updatePegs() {
    let rows = parseInt(pegrowsinput.value);
    let divs = parseInt(pegdivsinput.value);

    // Remove old pegs
    for (let peg of pegs) {
        Matter.World.remove(world, peg);
    }
    pegs = [];

    // Create new pegs
    createPegs(divs, rows);
}

//----------------------------------------------------------


// Update pegsize whenever the input changes
pegsizeinput.addEventListener("input", function (e) {
    pegsize = parseInt(e.target.value);
});