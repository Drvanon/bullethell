import * as util from './../util';

import { Component } from './ECS';
import { Movable } from './movable';

export class Seeker implements Component {
  static entities:Seeker[] = [];

  constructor (
    public movable:Movable,
    public speed:number,
    public goal:Movable
  ) {
    Seeker.entities.push(this);
  }

  static update () {
   Seeker.entities.forEach((seeker) => {
      if (seeker.movable.pos == seeker.goal.pos ) {
        seeker.movable.vel = [0, 0];
      } else {
        let diff:number[]  = util.vector_subtraction(seeker.goal.pos, seeker.movable.pos);
        seeker.movable.vel = util.skalar_multiplication(diff, seeker.speed/util.vector_length(diff));
      }
    });
  }

  destructor () {
    util.remove_from_array(Seeker.entities, this);
  }
}
