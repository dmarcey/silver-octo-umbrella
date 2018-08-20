import { IGameAction, GameService, IActionResolver, IActionPayload, IGameContext } from "./gameService";

class TestPayload implements IActionPayload {

}

class GameContext implements IGameContext {

}

const MockActionResolver = jest.fn<IActionResolver<GameContext, TestPayload>>((canUndo?: boolean) => ({
    execute: jest.fn(() => canUndo),
    undo: jest.fn()
}));

const MockActionResolverCannotExecute = jest.fn<IActionResolver<GameContext, TestPayload>>(() => ({
    execute: jest.fn(),
    canExecute: () => false
}));

describe("action resolvers", () => {
    describe("registration", () => {
        it("gameService throws trying to resolve unregistered action", () => {
            const gameContext: GameContext = {};
            const gameService = new GameService<GameContext>(gameContext);
            const action: IGameAction = {
                type: "foo",
                payload: {}
            };
            expect(() => {
                gameService.resolveAction(action);
            }).toThrow();
        });

        it("gameService throws when trying to re-register action resolver", () => {
            const gameContext: GameContext = {};
            const gameService = new GameService<GameContext>(gameContext);

            const mock = new MockActionResolver();
            gameService.registerActionResolver("foo", mock);
            expect(() => {
                gameService.registerActionResolver("foo", mock);
            }).toThrow();
        });
    });
    describe("execution", () => {
        it("gameService calls execute on action resolver for registered actions", () => {
            const gameContext: GameContext = {};
            const gameService = new GameService<GameContext>(gameContext);

            const mock = new MockActionResolver();
            gameService.registerActionResolver("foo", mock);
            const action: IGameAction = {
                type: "foo",
                payload: {}
            };

            gameService.resolveAction(action);
            expect(mock.execute).toHaveBeenCalled();
            expect(gameService.actions[0]).toBe(action);
        });

        it("gameService canExecute returns true if action resolver does not implement canExecute", () => {
            const gameContext: GameContext = {};
            const gameService = new GameService<GameContext>(gameContext);

            const mock = new MockActionResolver();
            gameService.registerActionResolver("foo", mock);
            const action: IGameAction = {
                type: "foo",
                payload: {}
            };

            const canExecute = gameService.canExecute(action);
            expect(canExecute);
        });

        it("gameService canExecute calls resolver canExecute", () => {
            const gameContext: GameContext = {};
            const gameService = new GameService<GameContext>(gameContext);

            const mock = new MockActionResolverCannotExecute();
            gameService.registerActionResolver("foo", mock);
            const action: IGameAction = {
                type: "foo",
                payload: {}
            };

            const canExecute = gameService.canExecute(action);
            expect(canExecute).toBeFalsy();
        });
    });
    describe("undo/redo", () => {
        it("undoable action gets added to undoable stack on execute", () => {
            const gameContext: GameContext = {};
            const gameService = new GameService<GameContext>(gameContext);

            const mock = new MockActionResolver(true);
            gameService.registerActionResolver("foo", mock);
            const action: IGameAction = {
                type: "foo",
                payload: {}
            };

            gameService.resolveAction(action);

            expect(gameService.undoable[0]).toBe(action);
        });

        it("non-undoable action does not get added to stack on execute", () => {
            const gameContext: GameContext = {};
            const gameService = new GameService<GameContext>(gameContext);

            const mock = new MockActionResolver(false);
            gameService.registerActionResolver("foo", mock);
            const action: IGameAction = {
                type: "foo",
                payload: {}
            };

            gameService.resolveAction(action);

            expect(gameService.undoable.length).toBe(0);
        });

        it("non-undoable action resets undoable and redoable stacks", () => {
            const gameContext: GameContext = {};
            const gameService = new GameService<GameContext>(gameContext);

            const mock = new MockActionResolver(false);
            gameService.registerActionResolver("foo", mock);
            const action: IGameAction = {
                type: "foo",
                payload: {}
            };

            gameService.undoable.push(action);
            gameService.redoable.push(action);

            gameService.resolveAction(action);

            expect(gameService.undoable.length).toBe(0);
            expect(gameService.redoable.length).toBe(0);
            expect(gameService.actions.length).toBe(1);
        });

        it("undo calls undo on resolver, updates actions, and stacks", () => {
            const gameContext: GameContext = {};
            const gameService = new GameService<GameContext>(gameContext);

            const mock = new MockActionResolver(true);
            gameService.registerActionResolver("foo", mock);
            const action: IGameAction = {
                type: "foo",
                payload: {}
            };

            gameService.actions.push(action);
            gameService.undoable.push(action);

            gameService.undo();

            expect(mock.undo).toHaveBeenCalled();
            expect(gameService.undoable.length).toBe(0);
            expect(gameService.redoable.length).toBe(1);
            expect(gameService.actions.length).toBe(0);
        });

        it("redo calls execute on resolver, updates actions, and stacks", () => {
            const gameContext: GameContext = {};
            const gameService = new GameService<GameContext>(gameContext);

            const mock = new MockActionResolver(true);
            gameService.registerActionResolver("foo", mock);
            const action: IGameAction = {
                type: "foo",
                payload: {}
            };

            gameService.redoable.push(action);

            gameService.redo();

            expect(mock.execute).toHaveBeenCalled();
            expect(gameService.undoable.length).toBe(1);
            expect(gameService.redoable.length).toBe(0);
            expect(gameService.actions.length).toBe(1);
        });
    });
});