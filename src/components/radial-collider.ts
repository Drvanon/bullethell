import * as util from './../util';

import { Component } from './ECS';
import { Movable } from './movable';

export class RadialCollider implements Component {
  static entities:RadialCollider[] = [];

  constructor (
    public radius:number,
    public movable:Movable,
    public call_back:Function,
    public identifier:string
  ) {
    RadialCollider.entities.push(this);
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

  destructor () {
    util.remove_from_array(RadialCollider.entities, this)
  }
}
