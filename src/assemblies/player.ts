import { Movable } from './../components/movable';
import { RadialCollider } from './../components/radial-collider';
import { Drawable } from './../components/drawable';
import { Health } from './../components/health';

export class Player {
  public movable:Movable;
  public life:number;
  public speed:number;
  public drawable:Drawable;
  public collider:RadialCollider;

  constructor (public health:Health, public movable:Movable) {
    this.movable = new Movable([10, 20], [0, 0]);
    this.speed = 10;

    this.collider = new RadialCollider(
      10,
      this.movable,
      (id) => {
        if (id == 'bullet') {
          this.health.damage(1);
        } else if ( id == 'seeker' ) {
          this.health.damage(10);
        }
      },
      'player'
    );

    this.drawable = new Drawable (
      (pos) => {
        Drawable.p.fill(0);
        Drawable.p.ellipse(pos[0], pos[1], 10, 10);
      },
      this.movable
    );
  }
}
