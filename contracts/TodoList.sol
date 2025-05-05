// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
    struct Task {
        uint id;
        string content;
        bool completed;
        address creator;
    }

    mapping(uint => Task) public tasks;
    uint public taskCount;

    event TaskCreated(uint id, string content, address creator);
    event TaskCompleted(uint id);
    event TaskDeleted(uint id);
    event TaskEdited(uint id, string newContent);

    function createTask(string memory content) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, content, false, msg.sender);
        emit TaskCreated(taskCount, content, msg.sender);
    }

    function completeTask(uint id) public {
        Task storage task = tasks[id];
        require(task.creator == msg.sender, "Not task creator");
        require(!task.completed, "Already completed");
        task.completed = true;
        emit TaskCompleted(id);
    }

    function deleteTask(uint id) public {
        Task storage task = tasks[id];
        require(task.creator == msg.sender, "Not task creator");
        delete tasks[id];
        emit TaskDeleted(id);
    }

    function editTask(uint id, string memory newContent) public {
        Task storage task = tasks[id];
        require(task.creator == msg.sender, "Not task creator");
        require(bytes(newContent).length > 0, "Content required");
        task.content = newContent;
        emit TaskEdited(id, newContent);
    }
} 