const socket = io();

Matter.use('matter-collision-events');
let engine = Matter.Engine.create();

let render = Matter.Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 2000,
        height: 800
    }
});

let boxes = []

for (let i = 0; i < 30; i++){
    boxes.push(Matter.Bodies.rectangle(i * 30, 770, 61, 70, { 
        frictionAir: 0,
        friction: 0,
        frictionStatic: 0,
        inertia: Infinity,
        restitution: 1,
        isStatic: true }))
}

let notes = [                 'F2', 'G2',  'A2', 'B2',
            'C3', 'D3', 'E3', 'F3', 'G3',  'A3', 'B3',
            'C4', 'D4', 'E4', 'F4', 'G4',  'A4', 'B4', 
            'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5',
            'C6', 'D6', 'E6', 'F6', 'G6', ]


let instrument = new Tone.Synth().toMaster();
let synthJSON = {
    "oscillator": {
        "type": "fatcustom",
      	"partials" : [0.2, 1, 0, 0.5, 0.1],
      	"spread" : 40,
      	"count" : 3
    },
    "envelope": {
        "attack": 0.001,
        "decay": 1.6,
        "sustain": 0,
        "release": 1.6
    }
};

instrument.set(synthJSON);
instrument.volume.value = -25


for (let i = 0; i < 30; i++){

    boxes[i].onCollide((pair) => {
        instrument.triggerAttackRelease(notes[i], "1n");
        instrument.triggerRelease("+4n")
    })
}

stepBoxes = []

let stepBoxNumber = 0
for (let j = 0; j < 4; j++){
    for (let i = 0; i < 8; i ++){
        stepBoxArray = []
        stepBoxArray.push(Matter.Bodies.rectangle(1100 + 100 * i, 100 + j * 100, 20, 50, { 
            restitution: 0,
            isStatic: true }))

        stepBoxArray.push(Matter.Bodies.rectangle(1150 + 100 * i, 100  + j * 100, 20, 50, { 
                restitution: 0,
                isStatic: true }))

        stepBoxArray.push(Matter.Bodies.rectangle(1125 + 100 * i, 135  + j * 100, 70, 20, { 
                restitution: 0,
                isStatic: true }))
        
        stepBox = Matter.Composite.create();
        stepBox.number += 1;
        Matter.Composite.add(stepBox, stepBoxArray);
        stepBoxes.push(stepBox);
    }
}


let storageBoxes = []

storageBoxes.push(Matter.Bodies.rectangle(1490, 800, 1000, 20, {isStatic: true}))
for (let i = 0; i < 9; i++){
storageBoxes.push(Matter.Bodies.rectangle(1000 + i * 125, 750, 20, 200, {isStatic: true}))
}

let mouse = Matter.Mouse.create(render.canvas),
    mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

render.mouse = mouse;


let chords = []
let collisions = []

for (let j = 0; j < 8; j++){
    for (let i = 0; i < 4; i++){
        chordBall = Matter.Bodies.circle(1080 + j * 120, 720, 10)
        chordBall.chord = j
        chords.push(chordBall)
    }
}


Matter.World.add(engine.world, [...boxes, ...stepBoxes, ...storageBoxes, ...chords, mouseConstraint]);
Matter.Runner.run(engine);
Matter.Render.run(render);


Tone.Transport.bpm.value = 80;
Tone.Transport.scheduleRepeat(repeat, "4n");
Tone.Transport.start();


let players = []
for (let i = 0; i < 8; i++){
    const player = new Tone.Player({
        "url" : `./sounds/chord${i + 1}.mp3`
    }).toMaster();
    players.push(player)
}



let index = 0;

async function repeat(){

    let step = index % 32;
    let bodies = Matter.Composite.allBodies(stepBoxes[step]);

    chords.map((chordBall) => {
        if (Matter.SAT.collides(bodies[0], chordBall).collided || 
            Matter.SAT.collides(bodies[1], chordBall).collided ||
            Matter.SAT.collides(bodies[2], chordBall).collided){
            players.map((player) =>{
                player.stop()
            })
            players[chordBall.chord].start()
        }
    })
    index++
    
}



window.addEventListener("mousedown", (e) => {
    e.preventDefault();

    if (e.clientX < 900){
        socket.emit("mousedown", e.clientX, e.clientY);
    }

})

socket.on("placeBall", (x, y) => {
    Tone.context.resume().then(() =>     
    Matter.World.add(engine.world, Matter.Bodies.circle(x, y, 10,{
    frictionAir: 0,
    friction: 0,
    frictionStatic: 0,
    inertia: Infinity,
    restitution: 1,
})))
});
