import p5 from './../p5';
import * as util from './../util';

import { Component } from './ECS';
import { Movable } from './movable';

type DrawFunction = (p: p5, pos:number[]) => void;

export class Drawable implements Component {
  static p: p5;
  static entities:Drawable[] = [];

  constructor (
    public drawing:DrawFunction,
    public movable:Movable
  ) {
    Drawable.entities.push(this);
  }

  static update () {
    Drawable.entities.forEach( (drawable) => {
      drawable.drawing(drawable.movable.pos);
    });
  }

  destructor () {
    this.movable.destructor();

    util.remove_from_array(Drawable.entities, this);
  }
}
