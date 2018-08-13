export enum ApiStatus {
  Connecting = "CONNECTING",
  Connected = "CONNECTED",
  Verified = "VERIFIED",
  Disconnected = "DISCONNECTED",
}

export enum ApiMessageTypes {
  SessionCreated = 0x01,
  VerifySession = 0x02,
  SessionVerified = 0x03,
}
