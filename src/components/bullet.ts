import * as util from './../util';
import { Component } from './ECS';

import { Movable } from './movable';
import { RadialCollider } from './radial-collider';
import { Drawable } from './drawable';

export class Bullet implements Component {
  public movable:Movable;
  public collider:RadialCollider;
  public drawable:Drawable;
  public static entities:Bullet[] = [];
  static LEVEL_WIDTH:number;
  static LEVEL_HEIGHT:number;

  constructor (
    public starting_location:number[],
    public goal:number[],
    public speed:number,
    public radius:number = 3,
  ) {
    this.movable = new Movable(starting_location);
    const direction:number[] = util.vector_subtraction(goal, starting_location);
    this.movable.vel = util.skalar_multiplication(direction, speed/util.vector_length(direction));

    this.collider = new RadialCollider(
      this.radius,
      this.movable, (identifier) => {
        if (identifier == 'player') {
          this.destructor();
        }
      },
      'bullet'
    );

    this.drawable = new Drawable(
      (pos) => {
        Drawable.p.fill(0, 0, 120);
        Drawable.p.ellipse(pos[0], pos[1], this.radius, this.radius);
      },
      this.movable
    );
  }

  destructor () {
    this.drawable.destructor();
    this.movable.destructor();
    this.collider.destructor();
  }

  static update () {
    Bullet.entities.forEach( (bullet) => {
      const x:number = bullet.movable.pos[0];
      const y:number = bullet.movable.pos[1];
      if (
        0 > x ||
        x > this.LEVEL_WIDTH ||
        0 > y ||
        y > this.LEVEL_HEIGHT
      ) {
        bullet.destructor();
      }
    });
  }
}
