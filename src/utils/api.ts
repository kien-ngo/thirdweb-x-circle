export const AUTH_STRING = `Bearer ${process.env.CIRCLE_API_KEY}`;

export const getPublicKey = async () => {
  const {
    data: { publicKey: _publicKey },
  } = await fetch("https://api.circle.com/v1/w3s/config/entity/publicKey", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: AUTH_STRING,
    },
  })
    .then((r) => r.json())
    .catch((err) => console.log(err));
  return _publicKey;
};

export const getEntitySecretCipherText = async () => {
  const _publicKey = await getPublicKey();
  const forge = require("node-forge");
  const entitySecret = forge.util.hexToBytes(process.env.ENTITY_SECRET);
  const publicKey = forge.pki.publicKeyFromPem(_publicKey);
  const encryptedData = publicKey.encrypt(entitySecret, "RSA-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha256.create(),
    },
  });
  const entitySecretCipherText = forge.util.encode64(encryptedData);
  return entitySecretCipherText;
};

export const getIdempotencyKey = async () => {
  const crypto = await import("node:crypto");
  const uuid = crypto.randomUUID();
  return uuid;
};
