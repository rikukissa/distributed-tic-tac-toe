import { Action, handleAction } from "./actions";
import { Client } from "./client";
import { createSignature, verifyActionSender } from "./pgp";

export interface SignedAction<Action> {
  signature: string;
  action: Action;
}

/* 
 * Inbound message handling
 */

export function receiveAction(
  client: Client,
  signedAction: SignedAction<Action>
) {
  if (!verifyActionSender(signedAction, client.publicKeys)) {
    return client;
  }
  return handleAction(client, signedAction.action);
}

// Used for the first "JOIN" message when others do not know your public key
function receiveUnsecureAction(client: Client, action: Action) {
  return handleAction(client, action);
}

/* 
 * Outbound communication
 */

export function dispatchAction(
  client: Client,
  action: Action,
  clients: Client[]
): Client[] {
  const signature = createSignature(
    client.privateKey,
    JSON.stringify(action.payload)
  );
  const signedAction = {
    signature,
    action
  };

  return clients.map(client => receiveAction(client, signedAction));
}

// Used for the first "JOIN" message when others do not know your public key
export function dispatchUnsecureAction(
  action: Action,
  clients: Client[]
): Client[] {
  return clients.map(client => receiveUnsecureAction(client, action));
}
