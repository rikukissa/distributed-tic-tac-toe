import * as ursa from "ursa";

import { ISignedAction } from "./io";

export function verifyActionSender(
  signedAction: ISignedAction,
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
