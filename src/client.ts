import { GameBoard, createGameboard } from "./gameboard";
import { PlayerId } from "./game";
import { Action } from "./actions";
import { generatePrivateKey } from "./pgp";

export type Client = {
  playerId: PlayerId;
  actions: Action[];
  // Stuff that could be also just derived from actions
  gameboard: GameBoard;
  turn: PlayerId;
  privateKey: any;
  publicKeys: {
    [player: number]: string;
  };
};

export const createClient = (playerId): Client => {
  const privateKey = generatePrivateKey();

  return {
    playerId,
    actions: [],

    // Stuff that could be also just derived from actions
    gameboard: createGameboard(),
    turn: 1,
    publicKeys: {},

    // Stuff that would live somewhere in the client
    // never to be shared with other clients
    privateKey
  };
};

export function storePublicKey(
  client: Client,
  playedId: PlayerId,
  publicKey: string
): Client {
  return {
    ...client,
    publicKeys: {
      ...client.publicKeys,
      [playedId]: publicKey
    }
  };
}
