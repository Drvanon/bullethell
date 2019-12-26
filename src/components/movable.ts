import { Component } from './ECS';
import * as util from './../util';

export class Movable implements Component {
  static entities:Movable[] = [];

  constructor (
    public pos:number[] = [0, 0],
    public vel:number[] = [0, 0]
  ) {
    Movable.entities.push(this);
  }

  static update() {
    Movable.entities.forEach( (movable:Movable, i:number) => {
      Movable.entities[i].pos = util.vector_addition(movable.pos, movable.vel);
    });
  }

  destructor () {
    util.remove_from_array(Movable.entities, this);
  }
}
