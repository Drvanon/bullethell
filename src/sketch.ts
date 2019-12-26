import 'p5';
import * as util from './util';

import { Drawable } from './components/drawable';
import { Movable } from './components/movable';
import { RadialCollider } from './components/radial-collider';
import { Seeker } from './components/seeker';
import { Timer } from './components/timer';
import { Health } from './components/health';

import { Player } from './assemblies/player';
import { SeekerEnemy } from './assemblies/seeker-enemy';
import { ShooterEnemy } from './assemblies/shooter';
import { Bullet } from './components/bullet';

const LEVEL_WIDTH = 640;
const LEVEL_HEIGHT = 480;
Bullet.LEVEL_WIDTH = LEVEL_WIDTH;
Bullet.LEVEL_HEIGHT = LEVEL_HEIGHT;

let update = true;

function init (): void {
  const player = new Player(new Health(100), new Movable([10, 10]));

  const seeker_locations:number[][] = [ [100, 100], [300, 400], [200, 500], [400, 600]];
  seeker_locations.forEach( (loc, i) => {
    new SeekerEnemy(loc, player.movable);
  });

  const shooter_locations:number[][] =  [ [400, 100], [10, 400]];
  shooter_locations.forEach(
    (loc) => {
      new ShooterEnemy(loc, player.movable, 3);
    }
  );

  return player;
}

const components:Component[] = [Movable, Seeker, Timer, RadialCollider, Bullet];
function update_components (): void {
  components.forEach((component) => {component.update();});
}

function update_stats(p: p5, player: Player): void {
  const width:number = 150;
  const height:number = 50;
  p.fill(255);
  p.rect(640-width, 0, width, height);

  p.fill(0);
  p.textSize(16);
  p.textAlign(p.LEFT);
  p.text('Life: ' + player.health.current_health, 640-width, height/2);
}

var sketch = function (p: p5) {
  let player:Player;

  p.setup = function () {
    player = init();

    p.createCanvas(640, 480);
    p.frameRate(30);
  }

  p.draw = function () {
    p.background(255);
    Drawable.update();
    if (update) {
      update_components();
    }

    update_stats(p, player);
    handle_input();
  }

  let handle_input = function () {
    let player_vel:number[] = [0, 0];
    if (p.keyIsDown(p.LEFT_ARROW)) {
      player_vel = util.vector_addition(player_vel, [-1, 0]);
    } else if (p.keyIsDown(p.RIGHT_ARROW)) {
      player_vel = util.vector_addition(player_vel, [1, 0]);
    } if (p.keyIsDown(p.UP_ARROW)) {
      player_vel = util.vector_addition(player_vel, [0, -1]);
    } else if (p.keyIsDown(p.DOWN_ARROW)) {
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

  p.keyPressed = function () {
    if (p.keyCode == 32) { // SPACEBAR
      update = !update;
    }
  }
}

Drawable.p = new p5(sketch);
