/* tslint:disable */

export default [
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
    "name": "ENSRootNodeAdded",
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
    "name": "ENSRootNodeRemoved",
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
        "name": "ensRootNode",
        "type": "bytes32",
      },
      {
        "indexed": false,
        "name": "ensLabel",
        "type": "bytes32",
      },
    ],
    "name": "IdentityCreated",
    "type": "event",
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
    "constant": false,
    "inputs": [
      {
        "name": "_ensRootNode",
        "type": "bytes32",
      },
      {
        "name": "_ensLabel",
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
        "name": "_ensRootNode",
        "type": "bytes32",
      },
      {
        "name": "_ensLabel",
        "type": "bytes32",
      },
    ],
    "name": "createSelfIdentity",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
];
