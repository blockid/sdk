/* tslint:disable */

export default [
  {
    "constant": true,
    "inputs": [
      {
        "name": "_identity",
        "type": "address",
      },
      {
        "name": "_issuer",
        "type": "address",
      },
      {
        "name": "_topic",
        "type": "uint256",
      },
    ],
    "name": "identityClaimExists",
    "outputs": [
      {
        "name": "",
        "type": "bool",
      },
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ensRootNode",
        "type": "bytes32",
      },
    ],
    "name": "addEnsRootNode",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ensRootNode",
        "type": "bytes32",
      },
    ],
    "name": "removeEnsRootNode",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_identity",
        "type": "address",
      },
    ],
    "name": "identityExists",
    "outputs": [
      {
        "name": "",
        "type": "bool",
      },
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_issuer",
        "type": "address",
      },
      {
        "name": "_topic",
        "type": "uint256",
      },
    ],
    "name": "removeIdentityClaim",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ensLabel",
        "type": "bytes32",
      },
      {
        "name": "_ensRootNode",
        "type": "bytes32",
      },
      {
        "name": "_messageSignature",
        "type": "bytes",
      },
    ],
    "name": "createIdentity",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ensLabel",
        "type": "bytes32",
      },
      {
        "name": "_ensRootNode",
        "type": "bytes32",
      },
    ],
    "name": "createSelfIdentity",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_ensRootNode",
        "type": "bytes32",
      },
    ],
    "name": "ensRootNodeExists",
    "outputs": [
      {
        "name": "",
        "type": "bool",
      },
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_nonce",
        "type": "uint256",
      },
      {
        "name": "_issuer",
        "type": "address",
      },
      {
        "name": "_topic",
        "type": "uint256",
      },
      {
        "name": "_data",
        "type": "bytes",
      },
      {
        "name": "_signature",
        "type": "bytes",
      },
    ],
    "name": "addIdentityClaim",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_identity",
        "type": "address",
      },
    ],
    "name": "getIdentityClaimNonce",
    "outputs": [
      {
        "name": "",
        "type": "uint256",
      },
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_identity",
        "type": "address",
      },
      {
        "name": "_issuer",
        "type": "address",
      },
      {
        "name": "_topic",
        "type": "uint256",
      },
    ],
    "name": "getIdentityClaim",
    "outputs": [
      {
        "name": "nonce",
        "type": "uint256",
      },
      {
        "name": "issuer",
        "type": "address",
      },
      {
        "name": "topic",
        "type": "uint256",
      },
      {
        "name": "data",
        "type": "bytes",
      },
      {
        "name": "signature",
        "type": "bytes",
      },
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
  },
  {
    "inputs": [
      {
        "name": "_ens",
        "type": "address",
      },
      {
        "name": "_ensResolver",
        "type": "address",
      },
      {
        "name": "_identityBase",
        "type": "address",
      },
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "ensRootNode",
        "type": "bytes32",
      },
    ],
    "name": "EnsRootNodeAdded",
    "type": "event",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "ensRootNode",
        "type": "bytes32",
      },
    ],
    "name": "EnsRootNodeRemoved",
    "type": "event",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "identity",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "member",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "ensLabel",
        "type": "bytes32",
      },
      {
        "indexed": false,
        "name": "ensRootNode",
        "type": "bytes32",
      },
    ],
    "name": "IdentityCreated",
    "type": "event",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "identity",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "nonce",
        "type": "uint256",
      },
      {
        "indexed": false,
        "name": "issuer",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "topic",
        "type": "uint256",
      },
      {
        "indexed": false,
        "name": "data",
        "type": "bytes",
      },
      {
        "indexed": false,
        "name": "signature",
        "type": "bytes",
      },
    ],
    "name": "IdentityClaimAdded",
    "type": "event",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "identity",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "issuer",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "topic",
        "type": "uint256",
      },
    ],
    "name": "IdentityClaimRemoved",
    "type": "event",
  },
];
