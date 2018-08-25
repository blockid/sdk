/* tslint:disable */

export default [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_nonce",
        "type": "uint256",
      },
      {
        "name": "_member",
        "type": "address",
      },
      {
        "name": "_purpose",
        "type": "address",
      },
      {
        "name": "_limit",
        "type": "uint256",
      },
      {
        "name": "_unlimited",
        "type": "bool",
      },
    ],
    "name": "addMember",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_member",
        "type": "address",
      },
    ],
    "name": "memberExists",
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
        "name": "_member",
        "type": "address",
      },
      {
        "name": "_purpose",
        "type": "address",
      },
    ],
    "name": "memberHasPurpose",
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
        "name": "_member",
        "type": "address",
      },
    ],
    "name": "getMember",
    "outputs": [
      {
        "name": "purpose",
        "type": "address",
      },
      {
        "name": "limit",
        "type": "uint256",
      },
      {
        "name": "unlimited",
        "type": "bool",
      },
      {
        "name": "manager",
        "type": "address",
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
        "name": "_purpose",
        "type": "address",
      },
    ],
    "name": "getPurposeMembers",
    "outputs": [
      {
        "name": "",
        "type": "address[]",
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
        "name": "_to",
        "type": "address",
      },
      {
        "name": "_value",
        "type": "uint256",
      },
      {
        "name": "_data",
        "type": "bytes",
      },
      {
        "name": "_extraGas",
        "type": "uint256",
      },
      {
        "name": "_messageSignature",
        "type": "bytes",
      },
    ],
    "name": "gasRelayedExecuteTransaction",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
        "name": "_member",
        "type": "address",
      },
      {
        "name": "_extraGas",
        "type": "uint256",
      },
      {
        "name": "_messageSignature",
        "type": "bytes",
      },
    ],
    "name": "gasRelayedRemoveMember",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
        "name": "_member",
        "type": "address",
      },
      {
        "name": "_purpose",
        "type": "address",
      },
      {
        "name": "_limit",
        "type": "uint256",
      },
      {
        "name": "_unlimited",
        "type": "bool",
      },
      {
        "name": "_extraGas",
        "type": "uint256",
      },
      {
        "name": "_messageSignature",
        "type": "bytes",
      },
    ],
    "name": "gasRelayedAddMember",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_member",
        "type": "address",
      },
    ],
    "name": "addFirstMember",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
        "name": "_member",
        "type": "address",
      },
    ],
    "name": "removeMember",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
        "name": "_member",
        "type": "address",
      },
      {
        "name": "_limit",
        "type": "uint256",
      },
      {
        "name": "_extraGas",
        "type": "uint256",
      },
      {
        "name": "_messageSignature",
        "type": "bytes",
      },
    ],
    "name": "gasRelayedUpdateMemberLimit",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
        "name": "_member",
        "type": "address",
      },
      {
        "name": "_limit",
        "type": "uint256",
      },
    ],
    "name": "updateMemberLimit",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "constant": true,
    "inputs": [],
    "name": "nonce",
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
    "constant": false,
    "inputs": [
      {
        "name": "_nonce",
        "type": "uint256",
      },
      {
        "name": "_to",
        "type": "address",
      },
      {
        "name": "_value",
        "type": "uint256",
      },
      {
        "name": "_data",
        "type": "bytes",
      },
    ],
    "name": "executeTransaction",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_member",
        "type": "address",
      },
      {
        "name": "_limit",
        "type": "uint256",
      },
    ],
    "name": "verifyMemberLimit",
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
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor",
  },
  {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "sender",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "nonce",
        "type": "uint256",
      },
      {
        "indexed": false,
        "name": "member",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "purpose",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "limit",
        "type": "uint256",
      },
      {
        "indexed": false,
        "name": "unlimited",
        "type": "bool",
      },
      {
        "indexed": false,
        "name": "manager",
        "type": "address",
      },
    ],
    "name": "MemberAdded",
    "type": "event",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "sender",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "nonce",
        "type": "uint256",
      },
      {
        "indexed": false,
        "name": "member",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "limit",
        "type": "uint256",
      },
    ],
    "name": "MemberLimitUpdated",
    "type": "event",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "sender",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "nonce",
        "type": "uint256",
      },
      {
        "indexed": false,
        "name": "member",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "manager",
        "type": "address",
      },
    ],
    "name": "MemberManagerUpdated",
    "type": "event",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "sender",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "nonce",
        "type": "uint256",
      },
      {
        "indexed": false,
        "name": "member",
        "type": "address",
      },
    ],
    "name": "MemberRemoved",
    "type": "event",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "sender",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "nonce",
        "type": "uint256",
      },
      {
        "indexed": false,
        "name": "to",
        "type": "address",
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256",
      },
      {
        "indexed": false,
        "name": "data",
        "type": "bytes",
      },
      {
        "indexed": false,
        "name": "succeeded",
        "type": "bool",
      },
    ],
    "name": "TransactionExecuted",
    "type": "event",
  },
];
