import { Action, handleAction, Result } from "./actions";
import { IClient } from "./client";
import { verifyActionSender } from "./pgp";

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
 * - Should be implemented by API consumer
 */
