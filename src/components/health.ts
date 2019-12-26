import * as util from './../util';
import { Component } from './ECS';

export class Health implements Component {
  public current_health:number;
  static entities:Health[] = [];

  constructor (
    public max_health:number,
    public on_death:() => void = () => {}
  ) {
    Health.entities.push(this);
    this.current_health = max_health;
  }

  damage (damage:number) {
    this.current_health -= damage;
    if (this.current_health <= 0) {
      this.on_death();
    }
  }

  destructor() {
    util.remove_from_array(Health.entities, this);
  }
}
