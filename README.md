# Web3 To-Do List dApp

A decentralized to-do list application using React, Solidity, Hardhat, and Chakra UI. Features include:
- Add, complete, delete, and edit tasks (edit is on-chain)
- MetaMask wallet connect
- ENS name and blockie avatar for task creators
- Filter, search, and progress bar
- Responsive, modern UI with dark mode

## Project Structure
```
web3-todo-app/
├── contracts/             # Solidity smart contracts
│   └── TodoList.sol
├── scripts/               # Hardhat deployment scripts
│   └── deploy.js
├── frontend/              # React frontend app
│   ├── public/
│   └── src/
│       ├── components/    # React components
│       ├── utils/         # ABI, contract address, helper functions
│       ├── App.js
│       └── index.js
├── .env
├── hardhat.config.js
├── package.json
└── README.md
```

## Current Known Issue: Edit Error

**If you see an error like:**
```
Edit Error
missing revert data (action="estimateGas", ...)
```

This means the `editTask` transaction is reverting on-chain. Possible causes:
- You are not the creator of the task you are trying to edit.
- The task does not exist (was deleted or never created).
- The new content is empty.

**How to debug:**
- Make sure you are editing a task you created (your address matches `task.creator`).
- Make sure the task exists (not deleted).
- Make sure the new content is not empty.
- Use `console.log` in the frontend to print `editId`, `editContent`, `account`, and `await contract.tasks(editId)` before calling `editTask`.

**This is a contract-side error, not a frontend bug.**

---

For more help, see the comments in the code or open an issue.
