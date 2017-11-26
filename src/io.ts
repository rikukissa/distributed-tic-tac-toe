import { Action, handleAction } from "./actions";
import { Client } from "./client";
import { createSignature, verifyActionSender } from "./pgp";

export interface SignedAction extends Action {
  signature: string;
}

// Inbound communication
export function receiveAction(client: Client, action: SignedAction) {
  if (!verifyActionSender(action, client.publicKeys)) {
    return client;
  }
  return handleAction(client, action);
}

// Outbound communication
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
    ...action,
    signature
  };

  return clients.map(client => receiveAction(client, signedAction));
}
