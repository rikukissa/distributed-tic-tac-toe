import { Action, createJoinAction, createMoveAction } from "./lib/actions";
import { createClient, IClient } from "./lib/client";
import { ISignedAction, receiveAction, receiveUnsecureAction } from "./lib/io";
import { signAction } from "./lib/pgp";

import { EventEmitter } from "events";

// tslint:disable-next-line no-empty
const noop = () => {};

interface INetwork {
  emit: (action: Action | ISignedAction) => void;
  subscribe: (action: Action | ISignedAction) => void;
}

function createNetwork() {
  const eventEmitter = new EventEmitter();
  return {
    emit: action => eventEmitter.emit("message", action),
    subscribe: handler => eventEmitter.on("message", handler)
  };
}

function dispatchAction(
  client: IClient,
  action: Action,
  network: INetwork
): void {
  const signedAction = signAction(client, action);
  network.emit(signedAction);
}

function createStatefulClient(id, network) {
  const client = { current: createClient(id) };

  network.subscribe((action: ISignedAction | Action) => {
    let updatedClient;
    let actions;

    [updatedClient, actions] = (action as ISignedAction).signature
      ? receiveAction(client.current, action as ISignedAction)
      : receiveUnsecureAction(client.current, action as Action);

    actions.forEach(next => network.emit(next));
    client.current = updatedClient;
  });

  network.emit(createJoinAction(client.current));

  return client;
}

describe("Hangouts", () => {
  describe("Client", () => {
    it("can do a move", () => {
      const network = createNetwork();

      const clients = [
        createStatefulClient(1, network),
        createStatefulClient(2, network),
        createStatefulClient(3, network),
        createStatefulClient(4, network)
      ];

      const [client1] = clients;
      const initialGameboard = client1.current.gameboard;
      dispatchAction(
        client1.current,
        createMoveAction(client1.current, 14, 0),
        network
      );

      expect(clients[0].current.gameboard).toEqual(
        clients[1].current.gameboard
      );
      expect(clients[2].current.gameboard).toEqual(
        clients[3].current.gameboard
      );
      expect(clients[1].current.turn).toEqual(2);
      expect(initialGameboard).not.toEqual(clients[0].current.gameboard);
    });

    it("can't do a move when it's someone else's turn", () => {
      const network = createNetwork();

      const clients = [
        createStatefulClient(1, network),
        createStatefulClient(2, network),
        createStatefulClient(3, network),
        createStatefulClient(4, network)
      ];

      const [client1, client2] = clients;

      const initialGameboard = client1.current.gameboard;

      dispatchAction(
        client2.current,
        createMoveAction(client2.current, 14, 0),
        network
      );

      expect(clients[1].current.gameboard).toEqual(initialGameboard);
      expect(clients[1].current.turn).toEqual(1);
    });

    describe("Invalid moves", () => {
      it("cant do a move as any other player", () => {
        const network = createNetwork();

        const clients = [
          createStatefulClient(1, network),
          createStatefulClient(2, network),
          createStatefulClient(3, network),
          createStatefulClient(4, network)
        ];
        const [client1] = clients;
        const initialGameboard = client1.current.gameboard;
        const action = createMoveAction(client1.current, 14, 0);
        action.payload.playerId = 2;

        dispatchAction(client1.current, action, network);
        expect(clients[2].current.gameboard).toEqual(initialGameboard);
      });

      it.skip("can't add an X on to a reserved square", noop);

      it.skip("can't just declare game to be won", noop);
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

    it.skip("should end the game when there's no free squares", noop);

    it.skip("should end the game when one player has 4 marks on a row", noop);
  });
});
