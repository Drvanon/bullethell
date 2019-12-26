import * as util from './../util';
import { Component } from './ECS';

export class Timer implements Component {
  static entities:Timer[] = [];
  public last:number;

  constructor (
    public callback:() => void,
    public duration:number,
    public repetitions:number,
    public repetition_callback:() => void = () => {}
  ) {
    Timer.entities.push(this);
    this.last = Date.now();
  }

  static update () {
    Timer.entities.forEach((timer) => {
      if (Date.now() - timer.last > timer.duration) {
        timer.last = Date.now();
        if (timer.repetitions != 0) {
          timer.callback();
        } else {
          timer.repetition_callback()
          timer.destructor();
        }

        if (timer.repetitions != -1 ) {
          timer.repetitions -= 1;
        }
      }
    });
  }

  destructor() {
    util.remove_from_array(Timer.entities, this);
  }
}
