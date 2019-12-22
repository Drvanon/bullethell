import './p5';
import * as util from './util';
import * as ECS from './ECS';

declare const p5: any;

class Movable extends ECS.Component {
  constructor (
    public pos:number[] = [0, 0],
    public vel:number[] = [0, 0]
  ) {
    super();
  }

  update() {
    Movable.entities.forEach( (movable, i) => {
      Movable.entities[i].pos = util.vector_addition(movable.pos, movable.vel);
    });
  }
}

class Seeker extends ECS.Component {
  constructor (
    public movable:Movable,
    public speed:number,
    public goal:Movable
  ) {
    super();
  }

  static update () {
   Seeker.entities.forEach((seeker) => {
      if (seeker.movable.pos == seeker.goal.pos ) {
        seeker.movable.vel = [0, 0];
      } else {
        let diff:number[]  = util.vector_subtraction(seeker.goal.movable.pos, seeker.movable.pos);
        seeker.movable.vel = util.skalar_multiplication(diff, seeker.speed/util.vector_length(diff));
      }
    });
  }
}

class RadialCollider extends ECS.Component {
  constructor (
    public radius:number,
    public movable:Movable,
    public call_back:Function,
    public identifier:string
  ) {
    super();
  }

  static update () {
    RadialCollider.entities.forEach((c1) => {
      RadialCollider.entities.forEach( (c2) => {
        if (c1 == c2) { return } // Prevent measuring distance to self.

        const distance:number = util.vector_length(util.vector_subtraction(c1.movable.pos, c2.movable.pos));
        if (distance < c1.radius + c2.radius ) {
          c1.call_back(c2.identifier);
          c2.call_back(c1.identifier);
        }
      });
    });
  }
}

type DrawFunction = (pos:number[]) => void;

class Drawable extends ECS.Component {
  constructor (public drawing:DrawFunction, public movable:Movable) {
    super();
  }

  static update () {
    Drawable.entities.forEach( (drawable) => {
      drawable.drawing(drawable.movable.pos);
    });
  }

  destructor () {
    this.movable.destructor();
  }
}

class Timer extends ECS.Component {
  public last:number;

  constructor (
    public callback:() => void,
    public duration:number,
    public repetitions:number,
    public repetition_callback:() => void = () => {}
  ) {
    super();
    this.last = Date.now();
  }

  static update () {
    Timer.entities.forEach((timer) => {
      if (Date.now() - timer.last > timer.duration) {
        timer.last = Date.now();
        if (timer.repetions != 0) {
          timer.callback();
        } else {
          timer.repetition_callback()
          util.remove_from_array(timers, timer);
        }

        if (timer.repetitions != -1 ) {
          timer.repetitions -= 1;
        }
      }
    });
  }
}

class ShooterEnemy extends ECS.Component{
  public movable:Movable;
  public timer:Timer;
  public collider:RadialCollider;
  public drawable:Drawable;

  constructor(
    starting_position:number[],
    public bullet_speed:number
  ) {
    super();
    this.movable = new Movable(starting_position);

    this.timer = new Timer(
      () => {this.shoot_bullet();},
      1000,
      -1
    );

    this.collider = new RadialCollider(
      15,
      this.movable,
      (identifier) => {
        if (identifier == 'player') {
          this.destructor();
        }
      },
      'shooter'
    );

    this.drawable = new Drawable(
      (pos) => {
        p5.p5.fill(120, 120, 120);
        p5.p5.ellipse(pos[0], pos[1], 15, 15);
      },
      this.movable
    );
  }

  shoot_bullet () {
    const bullet = new Bullet(this.movable.pos, player.movable.pos, this.bullet_speed);
  }

  destructor () {
    this.movable.destructor();
    this.collider.destructor();
    this.drawable.destructor();
    this.timer.destructor();
  }
}

class Bullet extends ECS.Component {
  public movable:Movable;
  public collider:RadialCollider;
  public drawable:Drawable;

  constructor (
    public starting_location:number[],
    public goal:number[],
    public speed:number,
    public radius:number = 3
  ) {
    super();
    this.movable = new Movable(movables);
    this.movable.pos = starting_location;
    const direction:number[] = util.vector_subtraction(goal, starting_location);
    this.movable.vel = util.skalar_multiplication(direction, speed/util.vector_length(direction));

    this.collider = new RadialCollider(
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
      (pos) => {
        p5.fill(0, 0, 120);
        p5.ellipse(pos[0], pos[1], this.radius, this.radius);
      },
      this.movable
    );
  }

  destruct() {
    util.remove_from_array(drawables, this.drawable);
    util.remove_from_array(movables, this.movable);
    util.remove_from_array(radial_colliders, this.collider);
  }

  update() {
    Bullet.entities.forEach( (bullet) => {
      const x:number = bullet.movable.pos[0];
      const y:number = bullet.movable.pos[1];
      if ( 0 > x || x > LEVEL_WIDTH || 0 > y || y > LEVEL_HEIGHT ) {
        bullet.desctructor();
      }
    });
  }
}

class SeekerEnemy extends ECS.Component {
  public movable:Movable;
  public seeker:Seeker;
  public drawable:Drawable;
  public collider:RadialCollider;

  constructor (starting_location) {
    super();
    this.movable = new Movable(movables);
    this.movable.pos = starting_location;

    this.seeker = new Seeker(this.movable, 2, player.movable);
    this.drawable = new Drawable(
      (pos) => {
        p5.fill(120);
        p5.ellipse(pos[0], pos[1], 5, 5);
      },
      this.movable
    );

    this.collider = new RadialCollider(
      5,
      this.movable,
      (identifier) => {
        if (identifier == 'player') {
          this.destructor();
          player.life -= 10;
        } else if (identifier == 'bullet') {
          this.destructor();
        }
      },
      'seeker'
    );
  }

  destructor () {
    this.movable.destructor();
    this.seeker.destructor();
    this.collider.destructor();
    this.drawable.destructor();
  }
}

class Player {
  public movable:Movable;
  public life:number;
  public speed:number;
  public drawable:Drawable;
  public collider:RadialCollider;

  constructor () {
    this.movable = new Movable([10, 20], [0, 0]);
    this.life = 100;
    this.speed = 10;

    this.collider = new RadialCollider(
      10,
      this.movable,
      (id) => {},
      'player'
    );
  }
}

const LEVEL_WIDTH = 640;
const LEVEL_HEIGHT = 480;

let player = new Player();
let movables = [];
let seekers = [];
let drawables = [];
let radial_colliders = [];
let timers = [];

let seeker_enemies = [];
let shooter_enemies = [];
let bullets = [];
let update = true;

function init () {
  player.movable = new Movable(movables);

  player.drawable = new Drawable(
    (pos) => {
      p5.fill(0);
      p5.ellipse(pos[0], pos[1], 10, 10);
    },
    player.movable
  );

  player
  player.life = 100;

  const seeker_locations:number[][] = [ [100, 100], [300, 400], [200, 500], [400, 600]];
  seeker_locations.forEach( (loc, i) => {
    let enemy:SeekerEnemy = new SeekerEnemy(loc);
  });

  const shooter_locations:number[][] =  [ [400, 100], [10, 400]];
  shooter_locations.forEach(
    (loc) => {
      const shooter_enemy:ShooterEnemy = new ShooterEnemy(loc, 3);
      shooter_enemies.push(shooter_enemy);
    }
  )
}

function game_loop () {
  handle_input();
  Movable.update();
  Seeker.update();
  Timer.update();
  RadialCollider.update();

  ShooterEnemy.update();
  SeekerEnemy.update();
}

function setup () {
  init();

  p5.createCanvas(640, 480);
  p5.frameRate(30);
}

function update_stats() {
  const width:number = 150;
  const height:number = 50;
  p5.fill(255);
  p5.rect(640-width, 0, width, height);

  p5.fill(0);
  p5.textSize(16);
  p5.textAlign(p5.LEFT);
  p5.text('Life: ' + player.life, 640-width, height/2);
}

function handle_input() {
  let player_vel:number[] = [0, 0];
  if (p5.keyIsDown(p5.LEFT_ARROW)) {
    player_vel = util.vector_addition(player_vel, [-1, 0]);
  } else if (p5.keyIsDown(p5.RIGHT_ARROW)) {
    player_vel = util.vector_addition(player_vel, [1, 0]);
  } if (p5.keyIsDown(p5.UP_ARROW)) {
    player_vel = util.vector_addition(player_vel, [0, -1]);
  } else if (p5.keyIsDown(p5.DOWN_ARROW)) {
    player_vel = util.vector_addition(player_vel, [0, 1]);
  }

  if (util.vector_length(player_vel) == 0) {
    player.movable.vel = player_vel;
  } else {
    player.movable.vel = util.skalar_multiplication(
      player_vel,
      player.speed / util.vector_length(player_vel)
    );
  }
}

function keyPressed () {
  if (p5.keyCode == 32) { // SPACEBAR
    update = !update;
  }
}

function draw () {
  p5.background(255);
  Drawable.update();
  if (update) {
    game_loop();
  }

  update_stats();
}
