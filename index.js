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

function remove_from_array(array, item) {
    array.splice(array.indexOf(item) , 1);
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

class Timer {
    constructor (timers, callback, duration, repetitions, repetition_callback) {
        this.last = Date.now();
        this.callback = callback;
        this.duration = duration;
        this.repetitions = repetitions;

        timers.push(this);
    }
}

function update_timers (timers) {
    timers.forEach((timer) => {
        if (Date.now() - timer.last > timer.duration) {
            timer.last = Date.now();
            if (timer.repetions != 0) {
                timer.callback();
            } else {
                timer.repetition_callback()
                remove_from_array(timers, timer);
            }

            if (timer.repetitions != -1 ) {
                timer.repetitions -= 1;
            }
        }
    });
}

class ShooterEnemy {
    constructor(starting_location, bullet_speed) {
        this.movable = new Movable(movables);
        this.movable.pos = starting_location;

        this.bullet_speed = bullet_speed;

        this.timer = new Timer(
            timers,
            () => {this.shoot_bullet();},
            1000,
            -1
        );

        this.collider = new RadialCollider(
            radial_colliders,
            15,
            this.movable,
            (identifier) => {
                if (identifier == 'player') {
                    this.destruct();
                }
            },
            'shooter'
        );

        this.drawable = new Drawable(
            drawables,
            (pos) => {
                fill(120, 120, 120);
                ellipse(pos[0], pos[1], 15, 15);
            },
            this.movable
        );
    }

    shoot_bullet () {
        let bullet = new Bullet(this.movable.pos, player.movable.pos, this.bullet_speed);
        bullets.push(bullet);
    }

    destruct () {
        remove_from_array(movables, this.movable);
        remove_from_array(seekers, this.seeker);
        remove_from_array(radial_colliders, this.collider);
        remove_from_array(drawables, this.drawable);
        remove_from_array(timers, this.timer);
    }
}

function update_shooters () {}

class Bullet {
    constructor (starting_location, goal, speed, radius=3) {
        this.radius = radius;
        this.movable = new Movable(movables);
        this.movable.pos = starting_location;
        let direction = vector_subtraction(goal, starting_location);
        this.movable.vel = skalar_multiplication(direction, speed/vector_length(direction));

        this.collider = new RadialCollider(
            radial_colliders,
            this.radius,
            this.movable, (identifier) => {
                if (identifier == 'player') {
                    player.life -= 1;
                    this.destruct();
                }
            },
            'bullet'
        );

        this.drawable = new Drawable(
            drawables,
            (pos) => {
                fill(0, 0, 120);
                ellipse(pos[0], pos[1], this.radius, this.radius);
            },
            this.movable
        );
    }

    destruct() {
        remove_from_array(drawables, this.drawable);
        remove_from_array(movables, this.movable);
        remove_from_array(radial_colliders, this.collider);
    }
}

function update_bullets (bullets) {
    bullets.forEach( (bullet) => {
        const x = bullet.movable.pos[0];
        const y = bullet.movable.pos[1];
        if ( 0 > x > LEVEL_WIDTH || 0 > y > LEVEL_HEIGHT ) {
        }
    });
}

class SeekerEnemy {
    constructor (starting_location) {
        this.movable = new Movable(movables);
        this.movable.pos = starting_location;

        this.seeker = new Seeker(seekers, this.movable, 2, player);
        this.drawable = new Drawable(
            drawables,
            (pos) => {
                fill(120);
                ellipse(pos[0], pos[1], 5, 5);
            },
            this.movable
        );

        this.collider = new RadialCollider(
            radial_colliders,
            5,
            this.movable,
            (identifier) => {
                if (identifier == 'player') {
                    this.destruct();
                    player.life -= 10;
               } else if (identifier == 'bullet') {
                    this.destruct();
               }
            },
            'seeker'
        );
    }

    destruct () {
        remove_from_array(movables, this.movable);
        remove_from_array(seekers, this.seeker);
        remove_from_array(radial_colliders, this.collider);
        remove_from_array(drawables, this.drawable);
    }
}

LEVEL_WIDTH = 640;
LEVEL_HEIGHT = 480;

player = new Object();
movables = [];
seekers = [];
drawables = [];
radial_colliders = [];
timers = [];

seeker_enemies = [];
shooter_enemies = [];
bullets = [];
update = true;

function init () {
    player.movable = new Movable(movables);
    player.movable.pos = [10, 20];
    player.movable.vel = [0, 0];

    player.speed = 10;

    player.drawable = new Drawable(
        drawables,
        (pos) => {
            fill(0);
            ellipse(pos[0], pos[1], 10, 10);
        },
        player.movable
    );

    player.collider = new RadialCollider(
        radial_colliders,
        10,
        player.movable,
        (id) => {},
        'player'
    );

    player.life = 100;

    seeker_locations = [ [100, 100], [300, 400], [200, 500], [400, 600]];
    seeker_locations.forEach( (loc, i) => {
        enemy = new SeekerEnemy(loc);
        seeker_enemies.push(enemy);
    });

    shooter_locations =  [ [400, 100], [10, 400]];
    shooter_locations.forEach(
        (loc) => {
            shooter_enemy = new ShooterEnemy(loc, 3);
            shooter_enemies.push(shooter_enemy);
        }
    )

}

function my_loop () {
    handle_input();
    seekers = update_seekers(seekers);
    movables = update_movables(movables);
    update_radial_colliders(radial_colliders);
    update_timers(timers);
}

function setup () {
    init();

    createCanvas(640, 480);
    frameRate(30);
}

function update_stats() {
    width = 150;
    height = 50;
    fill(255);
    rect(640-width, 0, width, height);

    fill(0);
    textSize(16);
    textAlign(LEFT);
    text('Life: ' + player.life, 640-width, height/2);
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
        update = !update;
    }
}

function draw () {
    background(255);
    update_drawables(drawables);
    if (update) {
        my_loop();
    }

    update_stats();
}
