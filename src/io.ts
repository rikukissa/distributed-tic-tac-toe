import { Action, handleAction } from "./actions";
import { IClient } from "./client";
import { createSignature, verifyActionSender } from "./pgp";

export interface ISignedAction {
  signature: string;
  action: Action;
}

/* 
 * Inbound message handling
 */

export function receiveAction(client: IClient, signedAction: ISignedAction) {
  if (!verifyActionSender(signedAction, client.publicKeys)) {
    return client;
  }
  return handleAction(client, signedAction.action);
}

// Used for the first "JOIN" message when others do not know your public key
function receiveUnsecureAction(client: IClient, action: Action) {
  return handleAction(client, action);
}

/* 
 * Outbound communication
 */

export function dispatchAction(
  client: IClient,
  action: Action,
  clients: IClient[]
): IClient[] {
  const signature = createSignature(
    client.privateKey,
    JSON.stringify(action.payload)
  );
  const signedAction = {
    action,
    signature
  };

  return clients.map(cli => receiveAction(cli, signedAction));
}

// Used for the first "JOIN" message when others do not know your public key
export function dispatchUnsecureAction(
  action: Action,
  clients: IClient[]
): IClient[] {
  return clients.map(client => receiveUnsecureAction(client, action));
}
