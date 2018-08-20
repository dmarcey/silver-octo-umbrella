export interface IActionPayload {

}

export interface IGameContext {

}

export interface IGameAction {
    type: string;
    payload: IActionPayload;
}

export interface IActionResolver<S extends IGameContext, T extends IActionPayload> {
    execute(gameContext: S, action: T): boolean;
    canExecute?(gameContext: S, action: T): boolean;

    undo?(gameContext: S, action: T): void;
}

export interface IGameService<S extends IGameContext> {
    registerActionResolver<T extends IActionPayload>(actionType: string, resolver: IActionResolver<S, T>): void;
    resolveAction(action: IGameAction): void;
    undo(): void;
    redo(): void;

    canExecute(action: IGameAction): boolean;

    actions: IGameAction[];
    undoable: IGameAction[];
    redoable: IGameAction[];
}

export class GameService<S> implements IGameService<S> {
    private resolverMap: { [actionType: string]: IActionResolver<S, any> } = {};
    private gameContext: S;

    public actions: IGameAction[] = [];
    public undoable: IGameAction[] = [];
    public redoable: IGameAction[] = [];

    constructor(gameContext: S) {
        this.gameContext = gameContext;
    }

    public canExecute(action: IGameAction): boolean {
        const resolver = this.getResolver(action.type);
        if (resolver.canExecute) {
            return resolver.canExecute(this.gameContext, action);
        }
        return true;
    }

    public registerActionResolver<T extends IActionPayload>(actionType: string, resolver: IActionResolver<S, T>): void {
        const cachedResolver = this.getResolver(actionType);
        if (cachedResolver) {
            throw Error(`Action of type ${actionType} already resolved`);
        }
        this.resolverMap[actionType] = resolver;
    }

    public resolveAction(action: IGameAction): void {
        const resolver = this.getResolver(action.type);
        const canUndo = resolver.execute(this.gameContext, action.payload);

        this.actions.push(action);

        if (canUndo) {
            this.undoable.push(action);
        }
        else {
            this.undoable = [];
            this.redoable = [];
        }
    }

    public undo(): void {
        const action = this.undoable.pop();
        if (action) {
            const resolver = this.getResolver(action.type);
            if (resolver.undo) {
                resolver.undo(this.gameContext, action.payload);
                this.actions.pop();
                this.redoable.push(action);
            }
        }
    }

    public redo(): void {
        const action = this.redoable.pop();
        if (action) {
            const resolver = this.getResolver(action.type);
            resolver.execute(this.gameContext, action.payload);
            this.actions.push(action);
            this.undoable.push(action);
        }
    }

    private getResolver<T>(actionType: string): IActionResolver<S, T> {
        return this.resolverMap[actionType];
    }
}