import * as util from './util';

export class Component {
    static entities = [];

    constructor () {
        Component.entities.push(this);
    }

    destructor () {
      util.remove_from_array(Component.entities, this);
    }

    static update () {}
}
