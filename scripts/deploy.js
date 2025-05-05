// scripts/deploy.js
// Deployment script for TodoList contract

const fs = require('fs');
const path = require('path');

async function main() {
    const TodoList = await ethers.getContractFactory('TodoList');
    const todoList = await TodoList.deploy();
    await todoList.deployed();
    console.log('TodoList deployed to:', todoList.address);

    // Write contract address to frontend/src/utils/contract.js
    const contractJs = `export const TODO_LIST_ADDRESS = '${todoList.address}';\n`;
    const utilsDir = path.join(__dirname, '../frontend/src/utils');
    fs.writeFileSync(path.join(utilsDir, 'contract.js'), contractJs);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 