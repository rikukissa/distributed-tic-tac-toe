type PlayerId = 1 | 2 | 3 | 4;
type Empty = null;
type ReservedSquare<PlayerId> = PlayerId;

type Square = Empty | ReservedSquare<PlayerId>;
type Row = Square[];
type GameBoard = Row[];

type Client = {
  playerId: PlayerId;
  actions: Action[];
  // Stuff that could be also just derived from actions
  gameboard: GameBoard;
  turn: PlayerId;
};

enum ActionType {
  MOVE = "MOVE"
}

type Move = {
  x: number;
  y: number;
  playerId: PlayerId;
};

interface MoveAction {
  type: ActionType.MOVE;
  payload: Move;
}

type Action = MoveAction; // | Something | else

function createGameboard(): GameBoard {
  return Array(16)
    .fill(null)
    .map(() => Array(16).fill(null));
}

const createClient = (playerId): Client => ({
  playerId,
  actions: [],

  // Stuff that could be also just derived from actions
  gameboard: createGameboard(),
  turn: 1
});

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

/*
 * Mitä vastaanottajien (myös lähettäjän) päässä kutsutaan
 */

function handleAction(client: Client, action: Action): Client {
  // validoi signature

  if (action.type === ActionType.MOVE) {
    return makeMove(client, action);
  }
  return client;
}

/*
 * Mitä lähettäjä kutsuu
 */
function dispatchAction(action: Action, clients: Client[]): Client[] {
  // http / websocket
  return clients.map(client => handleAction(client, action));
}

function printGameboard(board: GameBoard): void {
  console.log(
    board
      .map(row => row.map(square => (square === null ? "_" : square)).join(" "))
      .join("\n")
  );
}

describe("Hangouts", () => {
  describe("Client", () => {
    it("can do a move", () => {
      const client1 = createClient(1);
      const client2 = createClient(2);
      const client3 = createClient(3);
      const client4 = createClient(4);

      const updatedClients = dispatchAction(
        {
          type: ActionType.MOVE,
          payload: { x: 14, y: 0, playerId: 1 }
        },
        [client1, client2, client3, client4]
      );

      expect(updatedClients[0].gameboard).toEqual(updatedClients[1].gameboard);
      expect(updatedClients[2].gameboard).toEqual(updatedClients[3].gameboard);

      expect(client1.gameboard).not.toEqual(updatedClients[0].gameboard);

      expect(updatedClients[1].turn).toEqual(2);
    });

    it("can't do a move when it's someone else's turn", () => {
      const client1 = createClient(1);
      const client2 = createClient(2);
      const client3 = createClient(3);
      const client4 = createClient(4);

      const initialGameboard = client1.gameboard;

      const updatedClients = dispatchAction(
        {
          type: ActionType.MOVE,
          payload: { x: 14, y: 0, playerId: 2 }
        },
        [client1, client2, client3, client4]
      );

      expect(updatedClients[1].gameboard).toEqual(initialGameboard);
      expect(updatedClients[1].turn).toEqual(1);
    });

    describe("Invalid moves", () => {
      // might need signatures etc..
      it.skip("cant do a move as any other player", () => {});

      it.skip("can't add an X on to a reserved square", () => {});

      it.skip("can't just declare game to be won", () => {});
    });
  });

  describe("Game", () => {
    it("starts with an empty board", () => {
      const client1 = createClient(1);

      const emptySquareRows = client1.gameboard.filter(
        row => row.filter(square => square !== null).length !== 0
      );

      expect(emptySquareRows).toHaveLength(0);
    });

    it.skip("should end the game when there's no free squares", () => {});

    it.skip("should end the game when one player has 4 marks on a row", () => {});
  });
});
