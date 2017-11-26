import { PlayerId } from "./game";
import { Client, storePublicKey } from "./client";
import { getPublicKey } from "./pgp";

export enum ActionType {
  MOVE = "MOVE",
  JOIN = "JOIN"
}

export type Move = {
  x: number;
  y: number;
  playerId: PlayerId;
};

export interface MoveAction {
  type: ActionType.MOVE;
  payload: Move;
}

export type Join = {
  publicKey: string;
  playerId: PlayerId;
};

export interface JoinAction {
  type: ActionType.JOIN;
  payload: Join;
}

export type Action = MoveAction | JoinAction;

export function handleAction(client: Client, action: Action): Client {
  if (action.type === ActionType.MOVE) {
    return makeMove(client, action);
  }

  if (action.type === ActionType.JOIN) {
    return storePublicKey(
      client,
      action.payload.playerId,
      action.payload.publicKey
    );
  }

  return client;
}

function makeMove(client: Client, action: MoveAction): Client {
  if (client.turn !== action.payload.playerId) {
    // Not gonna do anything!
    return client;
  }

  const move = action.payload;
  const newGameboard = client.gameboard.map((row, rowNumber) => {
    if (rowNumber === move.y) {
      const newRow = row.slice(0);
      newRow[move.x] = move.playerId;
      return newRow;
    }
    return row;
  });

  return {
    ...client,
    gameboard: newGameboard,
    actions: client.actions.concat(action),
    turn: <PlayerId>((client.turn + 1) % 4)
  };
}

export function createMoveAction(
  client: Client,
  x: number,
  y: number
): MoveAction {
  return {
    type: ActionType.MOVE,
    payload: { x, y, playerId: client.playerId }
  };
}

export function createJoinAction(client: Client): JoinAction {
  return {
    type: ActionType.JOIN,
    payload: {
      playerId: client.playerId,
      publicKey: getPublicKey(client.privateKey)
    }
  };
}
