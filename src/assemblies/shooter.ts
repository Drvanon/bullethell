import { Movable } from './../components/movable';
import { RadialCollider } from './../components/radial-collider';
import { Drawable } from './../components/drawable';
import { Timer } from './../components/timer';
import { Bullet } from './../components/bullet';

export class ShooterEnemy {
  public movable:Movable;
  public timer:Timer;
  public collider:RadialCollider;
  public drawable:Drawable;

  constructor(
    starting_position:number[],
    public goal:Movable,
    public bullet_speed:number
  ) {
    this.movable = new Movable(starting_position);

    this.timer = new Timer(
      () => {this.shoot_bullet();},
      1000,
      -1
    );

    this.collider = new RadialCollider(
      15,
      this.movable,
      (identifier) => {
        if (identifier == 'player') {
          this.destructor();
        }
      },
      'shooter'
    );

    this.drawable = new Drawable(
      (pos) => {
        Drawable.p.fill(120, 120, 120);
        Drawable.p.ellipse(pos[0], pos[1], 15, 15);
      },
      this.movable
    );
  }

  shoot_bullet () {
    new Bullet(this.movable.pos, this.goal.pos, this.bullet_speed);
  }

  destructor () {
    this.movable.destructor();
    this.collider.destructor();
    this.drawable.destructor();
    this.timer.destructor();
  }
}
