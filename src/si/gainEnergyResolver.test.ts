import { GainEnergyResolver, ISIGameContext, IGainEnergyPayload } from "./gainEnergyResolver";

describe("gainEnergyResolver", () => {
  describe("create", () => {
    it("sets player id and energy gained", () => {
      const gameContext: ISIGameContext = {};
      const action = GainEnergyResolver.create(gameContext, "1", 3);
      expect(action.type).toEqual(GainEnergyResolver.type);
    });
  });

  describe("execute", () => {
    it("updates energy for player", () => {
      const gameContext: ISIGameContext = {
        players: {
          "1": { energy: 2}
        }
      };
      const payload: IGainEnergyPayload = {
        playerId: "1",
        energyGained: 3
      };
      const resolver = new GainEnergyResolver();
      resolver.execute(gameContext, payload);

      expect(gameContext.players!["1"].energy).toBe(5);
    });
  }
});
