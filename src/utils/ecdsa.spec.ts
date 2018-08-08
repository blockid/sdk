import { generatePrivateKey, privateKeyToAddress, publicKeyToAddress } from "./ecdsa";
import { publicKeyCreate } from "secp256k1";

const PRIVATE_KEY = Buffer.from("571c876e806cb42ac54f6dd7bf9c73c229543a3de0d43bc02d6ead41a76aae0c", "hex");
const PUBLIC_KEY = publicKeyCreate(PRIVATE_KEY, false);
const ADDRESS = "0x194eb1c67b25cc851d6037641fcd9f0b65ae7d90";

describe("utils/ecdsa", () => {

  describe("generatePrivateKey()", () => {

    it("should generates private key", () => {
      const privateKey = generatePrivateKey();
      expect(Buffer.isBuffer(privateKey)).toBeTruthy();
      expect(privateKey.length).toBe(32);
    });
  });

  describe("privateKeyToAddress()", () => {

    it("should converts private key to address", () => {
      const address = privateKeyToAddress(PRIVATE_KEY);
      expect(address).toBe(ADDRESS);
    });
  });

  describe("publicKeyToAddress()", () => {

    it("should converts public key to address", () => {
      const address = publicKeyToAddress(PUBLIC_KEY);
      expect(address).toBe(ADDRESS);
    });
  });
});
