import { PlayerId } from "./game";

export type Empty = null;
export type ReservedSquare<PlayerId> = PlayerId;
export type Square = Empty | ReservedSquare<PlayerId>;
export type Row = Square[];
export type GameBoard = Row[];

export function createGameboard(): GameBoard {
  return Array(16)
    .fill(null)
    .map(() => Array(16).fill(null));
}
