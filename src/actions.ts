import { PlayerId } from "./game";
import { Client } from "./client";

export enum ActionType {
  MOVE = "MOVE"
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

export type Action = MoveAction; // | Something | else

export function handleAction(client: Client, action: Action): Client {
  if (action.type === ActionType.MOVE) {
    return makeMove(client, action);
  }

  return client;
}

function makeMove(client: Client, action: Action): Client {
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
