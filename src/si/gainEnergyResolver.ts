import {
  IGameContext,
  IActionResolver,
  IActionPayload,
  IGameAction
} from "../game/gameService";

export interface ISIPlayerContext {
  energy: number;
}

export interface ISIGameContext extends IGameContext {
  players?: { [playerId: string]: ISIPlayerContext };
}

export interface IGainEnergyPayload extends IActionPayload {
  playerId: string;
  energyGained: number;
}

export class GainEnergyResolver
  implements IActionResolver<ISIGameContext, IGainEnergyPayload> {
  public execute(gameContext: ISIGameContext, action: IGainEnergyPayload) {
    gameContext.players![action.playerId].energy += action.energyGained;
    return true;
  }

  public static type = "GAIN_ENERGY";

  public static create(
    gameContext: ISIGameContext,
    playerId: string,
    energyGained: number
  ): IGameAction {
    return {
      type: GainEnergyResolver.type,
      payload: {
        playerId,
        energyGained
      }
    };
  }
}
