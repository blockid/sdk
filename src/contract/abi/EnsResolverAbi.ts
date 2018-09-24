/* tslint:disable */

export default [
  {
    "inputs": [
      {
        "name": "_ens",
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
        "indexed": true,
        "name": "node",
        "type": "bytes32",
      },
      {
        "indexed": false,
        "name": "a",
        "type": "address",
      },
    ],
    "name": "AddrChanged",
    "type": "event",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "node",
        "type": "bytes32",
      },
      {
        "indexed": true,
        "name": "contentType",
        "type": "uint256",
      },
    ],
    "name": "ABIChanged",
    "type": "event",
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_id",
        "type": "bytes4",
      },
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "name": "",
        "type": "bool",
      },
    ],
    "payable": false,
    "stateMutability": "pure",
    "type": "function",
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_node",
        "type": "bytes32",
      },
    ],
    "name": "addr",
    "outputs": [
      {
        "name": "",
        "type": "address",
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
        "name": "_node",
        "type": "bytes32",
      },
      {
        "name": "_addr",
        "type": "address",
      },
    ],
    "name": "setAddr",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_node",
        "type": "bytes32",
      },
      {
        "name": "_contentTypes",
        "type": "uint256",
      },
    ],
    "name": "ABI",
    "outputs": [
      {
        "name": "contentType",
        "type": "uint256",
      },
      {
        "name": "data",
        "type": "bytes",
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
        "name": "_node",
        "type": "bytes32",
      },
      {
        "name": "_contentTypes",
        "type": "uint256",
      },
      {
        "name": "_data",
        "type": "bytes",
      },
    ],
    "name": "setABI",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
];
