import { IGameContext, IActionResolver, IGameAction, IActionPayload } from "../game/GameService";

export const enum GameState {
    PreGame,
    InGame,
    PostGame
}

export class ITTTGameContext implements IGameContext {
    squares: string[][];
    currentPlayer: string;
    state: GameState;
}

export interface StartGamePayload extends IActionPayload {

}

export class StartGameResolver implements IActionResolver<ITTTGameContext, StartGamePayload> {
    public execute(gameContext: ITTTGameContext, action: StartGamePayload) {
        gameContext.currentPlayer = "X";
        gameContext.squares = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""]
        ];
        gameContext.state = GameState.InGame;
        return false;
    }

    public static type = "START_GAME";

    public static create(gameContext: ITTTGameContext): IGameAction {
        return {
            type: StartGameResolver.type,
            payload: {}
        };
    }
}

export interface MarkSquarePayload {
    player: string;
    x: number;
    y: number;
}

export class MarkSquareResolver implements IActionResolver<ITTTGameContext, MarkSquarePayload> {
    public execute(gameContext: ITTTGameContext, action: MarkSquarePayload) {
        const { x, y, player } = action;
        gameContext.squares[x][y] = player;
        if (this.checkForGameEnd(gameContext, player)) {
            gameContext.state = GameState.PostGame;
        }
        else {
            this.switchPlayer(gameContext);
        }
        return true;
    }

    public undo(gameContext: ITTTGameContext, action: MarkSquarePayload) {
        const { x, y, player } = action;
        gameContext.squares[x][y] = "";
        this.switchPlayer(gameContext);
        gameContext.state = GameState.InGame;
    }

    private switchPlayer(gameContext: ITTTGameContext) {
        gameContext.currentPlayer === "X" ? gameContext.currentPlayer = "O" : gameContext.currentPlayer = "X";
    }

    private checkForGameEnd(gameContext: ITTTGameContext, player: string) {
        const { squares } = gameContext;

        for (let i = 0; i < 3; i++) {
            if (squares[i][0] === player &&
                squares[i][1] === player &&
                squares[i][2] === player) {
                return true;
            }

            if (squares[0][i] === player &&
                squares[1][i] === player &&
                squares[2][i] === player) {
                return true;
            }
        }

        if (squares[0][0] === player &&
            squares[1][1] === player &&
            squares[2][2] === player) {
            return true;
        }

        if (squares[0][2] === player &&
            squares[1][1] === player &&
            squares[2][0] === player) {
            return true;
        }

        return false;
    }

    public static type = "MARK_SQUARE";

    public static create(gameContext: ITTTGameContext, x: number, y: number): IGameAction {
        const player = gameContext.currentPlayer;
        return {
            type: MarkSquareResolver.type,
            payload: {
                player,
                x,
                y
            }
        };
    }

}