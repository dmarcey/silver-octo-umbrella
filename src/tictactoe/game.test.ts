import { ITTTGameContext, GameState, StartGameResolver, MarkSquareResolver } from "./game";
import { GameService } from "../game/GameService";

describe("tictactoe", () => {
    it("full game", () => {
        const gameContext: ITTTGameContext = {
            squares: [],
            currentPlayer: "",
            state: GameState.PreGame
        };
        const gameService = new GameService<ITTTGameContext>(gameContext);
        const startGameResolver = new StartGameResolver();
        gameService.registerActionResolver(StartGameResolver.type, startGameResolver);
        const markSquareResolver = new MarkSquareResolver();
        gameService.registerActionResolver(MarkSquareResolver.type, markSquareResolver);

        const startAction = StartGameResolver.create(gameContext);
        gameService.resolveAction(startAction);
        expect(gameContext.state).toBe(GameState.InGame);
        expect(gameContext.squares[1][1]).toBe("");

        let markSquareAction = MarkSquareResolver.create(gameContext, 0, 0); // X
        gameService.resolveAction(markSquareAction);

        markSquareAction = MarkSquareResolver.create(gameContext, 2, 0); // O
        gameService.resolveAction(markSquareAction);

        markSquareAction = MarkSquareResolver.create(gameContext, 1, 1); // X
        gameService.resolveAction(markSquareAction);

        markSquareAction = MarkSquareResolver.create(gameContext, 2, 1); // O
        gameService.resolveAction(markSquareAction);

        markSquareAction = MarkSquareResolver.create(gameContext, 2, 2); // X
        gameService.resolveAction(markSquareAction);

        expect(gameContext.state).toBe(GameState.PostGame);

        gameService.undo();
        expect(gameContext.state).toBe(GameState.InGame);

        markSquareAction = MarkSquareResolver.create(gameContext, 0, 1); // X
        gameService.resolveAction(markSquareAction);

        markSquareAction = MarkSquareResolver.create(gameContext, 2, 2); // O
        gameService.resolveAction(markSquareAction);

        expect(gameContext.state).toBe(GameState.PostGame);
    });
});