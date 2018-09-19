/* tslint:disable */

export default [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ensRootNode",
        "type": "bytes32"
      }
    ],
    "name": "addEnsRootNode",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ensRootNode",
        "type": "bytes32"
      }
    ],
    "name": "removeEnsRootNode",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "guardian",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_sharedAccount",
        "type": "address"
      }
    ],
    "name": "sharedAccountExists",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_ensRootNode",
        "type": "bytes32"
      }
    ],
    "name": "ensRootNodeExists",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_salt",
        "type": "uint256"
      },
      {
        "name": "_ensLabel",
        "type": "bytes32"
      },
      {
        "name": "_ensRootNode",
        "type": "bytes32"
      },
      {
        "name": "_memberMessageSignature",
        "type": "bytes"
      },
      {
        "name": "_guardianMessageSignature",
        "type": "bytes"
      }
    ],
    "name": "createSharedAccount",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "_guardian",
        "type": "address"
      },
      {
        "name": "_ens",
        "type": "address"
      },
      {
        "name": "_ensResolver",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "ensRootNode",
        "type": "bytes32"
      }
    ],
    "name": "EnsRootNodeAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "ensRootNode",
        "type": "bytes32"
      }
    ],
    "name": "EnsRootNodeRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "sharedAccount",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "ensLabel",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "ensRootNode",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "member",
        "type": "address"
      }
    ],
    "name": "SharedAccountCreated",
    "type": "event"
  }
];
