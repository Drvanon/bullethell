export interface Component {
    static entities:any = [];
    constructor ():void;
    destructor (): void;
    static update ():void;
}
