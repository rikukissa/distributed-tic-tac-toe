import { PlayerId } from "./game";

export type Empty = null;
export type ReservedSquare<PlayerId> = PlayerId;
export type Square = Empty | ReservedSquare<PlayerId>;
export type Row = Square[];
export type GameBoard = Row[];
export type Position = { x: number; y: number };

export function createGameboard(): GameBoard {
  return Array(16)
    .fill(null)
    .map(() => Array(16).fill(null));
}

export function reserveSquare(
  gameboard: GameBoard,
  playerId: PlayerId,
  position: Position
): GameBoard {
  return gameboard.map((row, rowNumber) => {
    if (rowNumber === position.y) {
      const newRow = row.slice(0);
      newRow[position.x] = playerId;
      return newRow;
    }
    return row;
  });
}
