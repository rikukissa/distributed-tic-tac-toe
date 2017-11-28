import { Action } from "./actions";
import { PlayerId } from "./game";
import { createGameboard, GameBoard } from "./gameboard";
import { generatePrivateKey } from "./pgp";

export interface IClient {
  playerId: PlayerId;
  actions: Action[];
  publicKeys: {
    [player: number]: string;
  };

  // Stuff that would live somewhere in the client
  // never to be shared with other clients
  privateKey: any;

  // Stuff that could be also just derived from actions
  gameboard: GameBoard;
  turn: PlayerId;
}

export const createClient = (playerId): IClient => {
  const privateKey = generatePrivateKey();

  return {
    actions: [],
    playerId,
    publicKeys: {},

    // Stuff that would live somewhere in the client
    // never to be shared with other clients
    privateKey,

    // Stuff that could be also just derived from actions
    gameboard: createGameboard(),
    turn: 1
  };
};

export function storePublicKey(
  client: IClient,
  playedId: PlayerId,
  publicKey: string
): IClient {
  return {
    ...client,
    publicKeys: {
      ...client.publicKeys,
      [playedId]: publicKey
    }
  };
}
