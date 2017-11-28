import { GameBoard, createGameboard } from "./gameboard";
import { PlayerId } from "./game";
import { Action } from "./actions";
import { generatePrivateKey } from "./pgp";

export type Client = {
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
};

export const createClient = (playerId): Client => {
  const privateKey = generatePrivateKey();

  return {
    playerId,
    actions: [],
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
