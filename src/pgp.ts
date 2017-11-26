import * as ursa from "ursa";
import { SignedAction } from "./io";

export function verifyActionSender(
  action: SignedAction,
  publicKeys: {
    [player: number]: string;
  }
) {
  try {
    const pub = ursa.createPublicKey(publicKeys[action.payload.playerId]);
    pub.publicDecrypt(action.signature, "base64", "utf8");
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
