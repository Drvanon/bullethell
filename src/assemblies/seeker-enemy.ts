import { Movable } from './../components/movable';
import { Drawable } from './../components/drawable';
import { RadialCollider } from './../components/radial-collider';
import { Seeker } from './../components/seeker';

export class SeekerEnemy {
  public movable:Movable;
  public seeker:Seeker;
  public drawable:Drawable;
  public collider:RadialCollider;

  constructor (starting_location:number[], goal:Movable) {
    this.movable = new Movable(starting_location);

    this.seeker = new Seeker(this.movable, 2, goal);
    this.drawable = new Drawable(
      (pos) => {
        Drawable.p.fill(120);
        Drawable.p.ellipse(pos[0], pos[1], 5, 5);
      },
      this.movable
    );

    this.collider = new RadialCollider(
      5,
      this.movable,
      (identifier) => {
        if (identifier == 'player') {
          this.destructor();
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
