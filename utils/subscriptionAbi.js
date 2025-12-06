export default [
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "subscriptions",
    "outputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "interval", "type": "uint256" },
      { "internalType": "uint256", "name": "lastExecution", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
