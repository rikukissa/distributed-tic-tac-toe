import { IClient, storePublicKey } from "./client";
import { PlayerId } from "./game";
import { reserveSquare } from "./gameboard";
import { getPublicKey } from "./pgp";

export enum ActionType {
  MOVE = "MOVE",
  JOIN = "JOIN",
  HANDSHAKE = "HANDSHAKE"
}

export interface IMove {
  x: number;
  y: number;
  playerId: PlayerId;
}

export interface IMoveAction {
  type: ActionType.MOVE;
  payload: IMove;
}

export interface IJoin {
  publicKey: string;
  playerId: PlayerId;
}

export interface IJoinAction {
  type: ActionType.JOIN;
  payload: IJoin;
}

export interface IHandshake {
  to: PlayerId;
  publicKey: string;
  playerId: PlayerId;
}

export interface IHandshakeAction {
  type: ActionType.HANDSHAKE;
  payload: IHandshake;
}

export type Action = IMoveAction | IJoinAction | IHandshakeAction;

export type Result = [IClient, Action[]];

/* 
 * Main action handler
 */

export function handleAction(client: IClient, action: Action): Result {
  if (action.type === ActionType.MOVE) {
    return [makeMove(client, action), []];
  }

  if (action.type === ActionType.JOIN) {
    return [
      storePublicKey(client, action.payload.playerId, action.payload.publicKey),
      [createHandshakeAction(client, action.payload.playerId)]
    ];
  }

  if (action.type === ActionType.HANDSHAKE) {
    return [
      storePublicKey(client, action.payload.playerId, action.payload.publicKey),
      []
    ];
  }

  return [client, []];
}

/* 
 * Action handlers
 */

function makeMove(client: IClient, action: IMoveAction): IClient {
  if (client.turn !== action.payload.playerId) {
    // Not gonna do anything!
    return client;
  }

  const { x, y, playerId } = action.payload;
  const newGameboard = reserveSquare(client.gameboard, playerId, { x, y });

  return {
    ...client,
    actions: client.actions.concat(action),
    gameboard: newGameboard,
    turn: ((client.turn + 1) % 4) as PlayerId
  };
}

/* 
 * Action creators
 */

export function createMoveAction(
  client: IClient,
  x: number,
  y: number
): IMoveAction {
  return {
    payload: { x, y, playerId: client.playerId },
    type: ActionType.MOVE
  };
}

export function createJoinAction(client: IClient): IJoinAction {
  return {
    payload: {
      playerId: client.playerId,
      publicKey: getPublicKey(client.privateKey)
    },
    type: ActionType.JOIN
  };
}

export function createHandshakeAction(
  client: IClient,
  receivingPlayerId: PlayerId
): IHandshakeAction {
  return {
    payload: {
      playerId: client.playerId,
      publicKey: getPublicKey(client.privateKey),
      to: receivingPlayerId
    },
    type: ActionType.HANDSHAKE
  };
}
