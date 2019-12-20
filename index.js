function vector_addition (v1, v2) {
    if (v1.length != v2.length) { throw "Vectors not of same length"; };
    return v1.map((el, i) => el + v2[i]);
}

function vector_subtraction(v1, v2) {
    if (v1.length != v2.length) { throw "Vectors not of same length"; };
    return v1.map((el, i) => el - v2[i]);
}

function vector_length(vector) {
    return Math.sqrt(vector.reduce((acc, val) => {return acc + val * val}, 0));
}

function skalar_multiplication(v1, skalar) {
    return v1.map((el) => skalar*el);
}

class Movable {
    constructor (movables) {
        this.pos = [0, 0];
        this.vel = [0, 0];

        movables.push(this);
    }
}

function update_movables (movables) {
    movables.forEach( (movable, i) => {
        movables[i].pos = vector_addition(movable.pos, movable.vel);
    });

    return movables;
}

class Seeker {
    constructor (seekers, movable, speed, goal) {
        this.movable = movable;
        this.speed = speed;
        this.goal = goal;

        seekers.push(this);
    }
}

function update_seekers (seekers) {
    seekers.forEach((seeker) => {
        if (seeker.movable.pos == seeker.goal.pos ) {
            seeker.movable.vel = [0, 0];
        } else {
            diff = vector_subtraction(seeker.goal.movable.pos, seeker.movable.pos);
            seeker.movable.vel = skalar_multiplication(diff, seeker.speed/vector_length(diff));
        }
    });

    return seekers;
}

class RadialCollider {
    constructor (colliders, radius, movable, call_back, identifier) {
        this.radius = radius;
        this.movable = movable;
        this.call_back = call_back;
        this.identifier = identifier;

        colliders.push(this);
    }
}

function update_radial_colliders(colliders) {
    colliders.forEach((c1) => {
        colliders.forEach( (c2) => {
            if (c1 == c2) { return } // Prevent measuring distance to self.

            distance = vector_length(vector_subtraction(c1.movable.pos, c2.movable.pos));
            if (distance < c1.radius + c2.radius ) {
                c1.call_back(c2.identifier);
                c2.call_back(c1.identifier);
            }
        });
    });
}

class Drawable {
    constructor (drawables, drawing, movable) {
        this.drawing = drawing;
        this.movable = movable;

        drawables.push(this);
    }
}

function update_drawables( drawables ) {
    drawables.forEach( (drawable) => {
        drawable.drawing(drawable.movable.pos);
    });
}


player = new Object();
enemy = new Object();
movables = []
seekers = []
drawables = []
radial_colliders = []
update = true;

function init () {
    player.movable = new Movable(movables);
    player.movable.pos = [10, 20];
    player.movable.vel = [0, 0];

    player.speed = 10;

    player.drawable = new Drawable(
        drawables,
        (pos) => {
            ellipse(pos[0], pos[1], 10, 10);
            fill(0);
        },
        player.movable
    );

    player.collider = new RadialCollider(
        radial_colliders,
        10,
        player.movable,
        (id) => {
            console.log('You got hit!');
        },
        'player'
    );

    enemy_locations = [ [100, 100], [300, 400], [200, 500] ];

    enemy_locations.forEach( (loc) => {
        enemy_movable = new Movable(movables);
        enemy = new Seeker(seekers, enemy_movable, 2, player);
        enemy_movable.pos = loc;

        enemy_drawable = new Drawable(
            drawables,
            (pos) => {
                ellipse(pos[0], pos[1], 5, 5);
                fill(120);
            },
            enemy.movable
        );

        enemy_collider = new RadialCollider(
            radial_colliders,
            5,
            enemy_movable,
            (id) => {
                if (id == 'player') {
                    movables.splice(movables.indexOf(enemy_movable));
                    seekers.splice(seekers.indexOf(enemy));
                    radial_colliders.splice(radial_colliders.indexOf(enemy_collider));
                    drawables.splice(drawables.indexOf(enemy_drawable));
               }
            },
            'enemy'
        );
    });
}

function my_loop () {
    handle_input();
    seekers = update_seekers(seekers);
    movables = update_movables(movables);
    update_radial_colliders(radial_colliders);
}

function setup () {
    init();

    createCanvas(640, 480);
    frameRate(30);
}

function handle_input() {
    player_vel = [0, 0]
    if (keyIsDown(LEFT_ARROW)) {
        player_vel = vector_addition(player_vel, [-1, 0]);
    } else if (keyIsDown(RIGHT_ARROW)) {
        player_vel = vector_addition(player_vel, [1, 0]);
    } if (keyIsDown(UP_ARROW)) {
        player_vel = vector_addition(player_vel, [0, -1]);
    } else if (keyIsDown(DOWN_ARROW)) {
        player_vel = vector_addition(player_vel, [0, 1]);
    }

    if (vector_length(player_vel) == 0) {
        player.movable.vel = player_vel;
    } else {
        player.movable.vel = skalar_multiplication(
            player_vel,
            player.speed / vector_length(player_vel)
        );
    }
}

function keyPressed () {
    if (keyCode == 32) { // SPACEBAR
        update = false;
    }
}

function draw () {
    background(255);
    update_drawables(drawables);
    if (update) {
        my_loop();
    }
}
