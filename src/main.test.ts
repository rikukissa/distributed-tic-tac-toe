import { Action, createJoinAction, createMoveAction } from "./actions";
import { createClient, IClient } from "./client";
import { receiveAction, receiveUnsecureAction } from "./io";
import { signAction } from "./pgp";

// tslint:disable-next-line no-empty
const noop = () => {};

function dispatchAction(
  client: IClient,
  action: Action,
  clients: IClient[]
): IClient[] {
  const signedAction = signAction(client, action);

  return clients.reduce((allUpdatedClients, cli) => {
    const [updatedClient, actions] = receiveAction(cli, signedAction);
    return actions.reduce(
      (updatedClients, proceedingAction) =>
        dispatchAction(updatedClient, proceedingAction, updatedClients),
      allUpdatedClients.map(
        c => (c.playerId === updatedClient.playerId ? updatedClient : c)
      )
    );
  }, clients);
}

type AccumulatedResults = [IClient[], Action[]];

export function dispatchUnsecureAction(
  action: Action,
  clients: IClient[]
): IClient[] {
  const [updatedClients, actions]: AccumulatedResults = clients.reduce(
    (
      [allUpdatedClients, newActionsFromAllClients]: AccumulatedResults,
      receivingClient: IClient
    ): AccumulatedResults => {
      const [updatedClient, newActions] = receiveUnsecureAction(
        receivingClient,
        action
      );

      return [
        allUpdatedClients.concat(updatedClient),
        newActionsFromAllClients.concat(newActions)
      ];
    },
    [[], []]
  );

  return actions.reduce(
    (allUpdatedClients: IClient[], proceedingAction: Action) =>
      dispatchUnsecureAction(proceedingAction, allUpdatedClients),
    updatedClients
  );
}

function sharePublicKeys(clients): IClient[] {
  return clients.reduce(
    (finalClients, client) =>
      dispatchUnsecureAction(createJoinAction(client), finalClients),
    clients
  );
}

describe("Hangouts", () => {
  describe("Client", () => {
    it("can do a move", () => {
      const clients = sharePublicKeys([
        createClient(1),
        createClient(2),
        createClient(3),
        createClient(4)
      ]);

      const [client1] = clients;

      const updatedClients = dispatchAction(
        client1,
        createMoveAction(client1, 14, 0),
        clients
      );

      expect(updatedClients[0].gameboard).toEqual(updatedClients[1].gameboard);
      expect(updatedClients[2].gameboard).toEqual(updatedClients[3].gameboard);

      expect(client1.gameboard).not.toEqual(updatedClients[0].gameboard);

      expect(updatedClients[1].turn).toEqual(2);
    });

    it("can't do a move when it's someone else's turn", () => {
      const clients = sharePublicKeys([
        createClient(1),
        createClient(2),
        createClient(3),
        createClient(4)
      ]);

      const [client1, client2] = clients;

      const initialGameboard = client1.gameboard;

      const updatedClients = dispatchAction(
        client2,
        createMoveAction(client2, 14, 0),
        clients
      );

      expect(updatedClients[1].gameboard).toEqual(initialGameboard);
      expect(updatedClients[1].turn).toEqual(1);
    });

    describe("Invalid moves", () => {
      it("cant do a move as any other player", () => {
        const clients = sharePublicKeys([
          createClient(1),
          createClient(2),
          createClient(3),
          createClient(4)
        ]);
        const [client1] = clients;
        const initialGameboard = client1.gameboard;
        const action = createMoveAction(client1, 14, 0);
        action.payload.playerId = 2;
        const [, client2] = dispatchAction(client1, action, clients);
        expect(client2.gameboard).toEqual(initialGameboard);
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
