import { Action, handleAction, Result } from "./actions";
import { IClient } from "./client";
import { signAction, verifyActionSender } from "./pgp";

export interface ISignedAction {
  signature: string;
  action: Action;
}

/* 
 * Inbound message handling
 */

export function receiveAction(
  client: IClient,
  signedAction: ISignedAction
): Result {
  if (!verifyActionSender(signedAction, client.publicKeys)) {
    return [client, []];
  }

  return receiveUnsecureAction(client, signedAction.action);
}

// Used for the first "JOIN" message when others do not know your public key
export function receiveUnsecureAction(client: IClient, action: Action) {
  return handleAction(client, action);
}

/* 
 * Outbound communication
 */

export function dispatchAction(client: IClient, action: Action): void {
  const signedAction = signAction(client, action);
  // Send to peers HTTP
}

// Used for the first "JOIN" message when others do not know your public key
export function dispatchUnsecureAction(action: Action): void {
  // Send to peers
}
