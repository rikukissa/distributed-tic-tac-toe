import * as ursa from "ursa";
import { SignedAction } from "./io";
import { Action } from "./actions";

export function verifyActionSender(
  signedAction: SignedAction<Action>,
  publicKeys: {
    [player: number]: string;
  }
) {
  const { playerId } = signedAction.action.payload;

  try {
    const pub = ursa.createPublicKey(publicKeys[playerId]);
    pub.publicDecrypt(signedAction.signature, "base64", "utf8");
    return true;
  } catch {
    return false;
  }
}

export function generatePrivateKey() {
  return ursa.generatePrivateKey(1024, 6969);
}

export function createSignature(privateKey, payload): string {
  return privateKey.privateEncrypt(JSON.stringify(payload), "utf8", "base64");
}

export function getPublicKey(privateKey): string {
  return privateKey.toPublicPem().toString();
}
