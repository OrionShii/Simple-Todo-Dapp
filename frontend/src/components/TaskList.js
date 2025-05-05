import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  IconButton,
  Progress,
  Badge,
  HStack,
  VStack,
  useColorModeValue,
  useToast,
  Collapse,
  Spacer,
  Tooltip,
  Avatar,
  SkeletonCircle,
} from '@chakra-ui/react';
import { CheckIcon, DeleteIcon, EditIcon, CloseIcon, SearchIcon } from '@chakra-ui/icons';
import { FaUserCircle } from 'react-icons/fa';
import makeBlockie from 'ethereum-blockies-base64';
import { ethers } from 'ethers';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

const TaskList = ({ contract, account }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [ensNames, setEnsNames] = useState({});
  const toast = useToast();
  const ensCache = useRef({});

  const loadTasks = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const count = await contract.taskCount();
      const items = [];
      for (let i = 1; i <= count; i++) {
        const task = await contract.tasks(i);
        if (task.creator !== '0x0000000000000000000000000000000000000000') {
          items.push(task);
        }
      }
      setTasks(items);
      // ENS lookup for all unique creators
      const provider = contract.runner?.provider || contract.provider;
      const uniqueCreators = [...new Set(items.map(t => t.creator))];
      for (const addr of uniqueCreators) {
        if (!ensCache.current[addr]) {
          try {
            const name = await provider.lookupAddress(addr);
            if (name) {
              ensCache.current[addr] = name;
              setEnsNames(e => ({ ...e, [addr]: name }));
            }
          } catch {}
        }
      }
    } catch (err) {
      toast({ title: 'Load Error', description: err?.message || JSON.stringify(err), status: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
    if (!contract) return;
    contract.on('TaskCreated', loadTasks);
    contract.on('TaskCompleted', loadTasks);
    contract.on('TaskDeleted', loadTasks);
    return () => {
      contract.off('TaskCreated', loadTasks);
      contract.off('TaskCompleted', loadTasks);
      contract.off('TaskDeleted', loadTasks);
    };
    // eslint-disable-next-line
  }, [contract]);

  const handleComplete = async (id) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.completeTask(id);
      await tx.wait();
    } catch (err) {
      toast({ title: 'Complete Error', description: err?.message || JSON.stringify(err), status: 'error' });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.deleteTask(id);
      await tx.wait();
    } catch (err) {
      toast({ title: 'Delete Error', description: err?.message || JSON.stringify(err), status: 'error' });
    }
    setLoading(false);
  };

  // Inline edit (simulate, since contract doesn't support update)
  const handleEdit = (task) => {
    setEditId(task.id);
    setEditContent(task.content);
  };
  const handleEditCancel = () => {
    setEditId(null);
    setEditContent('');
  };
  const handleEditSave = async () => {
    console.log('editId:', editId, 'editContent:', editContent, 'account:', account);
    try {
      const tx = await contract.editTask(editId, editContent);
      await tx.wait();
      toast({ title: 'Task Edited', status: 'success' });
      setEditId(null);
      setEditContent('');
    } catch (err) {
      toast({ title: 'Edit Error', description: err?.message || JSON.stringify(err), status: 'error' });
    }
    console.log('editId:', editId, 'editContent:', editContent, 'account:', account);
  };
  // Filtering and searching
  const filtered = tasks.filter(task => {
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (search && !task.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const cardBg = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box mt={4}>
      <Flex align="center" mb={4} gap={2} wrap="wrap">
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          maxW="220px"
          size="sm"
          bg={cardBg}
        />
        <Spacer />
        {FILTERS.map(f => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? 'solid' : 'ghost'}
            colorScheme={filter === f.value ? 'purple' : 'gray'}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </Flex>
      <Flex align="center" mb={2}>
        <Text fontSize="sm" color="gray.500" fontWeight={600}>
          {completedCount} of {totalCount} tasks completed
        </Text>
        <Progress ml={4} flex={1} colorScheme="purple" borderRadius={8} value={progress} height="8px" />
      </Flex>
      <VStack align="stretch" spacing={3} mt={4}>
        {loading && <Text color="gray.400">Loading tasks...</Text>}
        {!loading && filtered.length === 0 && <Text color="gray.400">No tasks found.</Text>}
        {filtered.map(task => (
          <Collapse in={true} key={task.id.toString()} animateOpacity>
            <Flex
              align="center"
              bg={cardBg}
              borderRadius="lg"
              borderWidth={1}
              borderColor={borderColor}
              p={3}
              boxShadow="sm"
              gap={3}
            >
              <Box>
                <Avatar size="sm" src={makeBlockie(task.creator)} name={task.creator} />
              </Box>
              <Box flex={1} minW={0}>
                {editId === task.id ? (
                  <Flex align="center" gap={2}>
                    <Input
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      size="sm"
                      maxW="70%"
                    />
                    <IconButton
                      icon={<CheckIcon />}
                      aria-label="Save"
                      size="sm"
                      colorScheme="green"
                      onClick={handleEditSave}
                    />
                    <IconButton
                      icon={<CloseIcon />}
                      aria-label="Cancel"
                      size="sm"
                      colorScheme="gray"
                      onClick={handleEditCancel}
                    />
                  </Flex>
                ) : (
                  <Text
                    as={task.completed ? 's' : undefined}
                    color={task.completed ? 'gray.400' : 'gray.800'}
                    fontWeight={600}
                    fontSize="md"
                    isTruncated
                  >
                    {task.content}
                  </Text>
                )}
                <HStack spacing={2} mt={1}>
                  <Badge colorScheme={task.completed ? 'green' : 'purple'} fontSize="0.7em">
                    {task.completed ? 'Completed' : 'Active'}
                  </Badge>
                  <Text fontSize="xs" color="gray.400">
                    {ensNames[task.creator] ? (
                      <>
                        {ensNames[task.creator]} <span style={{ opacity: 0.5 }}>({task.creator.slice(0, 6)}...{task.creator.slice(-4)})</span>
                      </>
                    ) : (
                      <>{task.creator.slice(0, 6)}...{task.creator.slice(-4)}</>
                    )}
                  </Text>
                </HStack>
              </Box>
              <HStack>
                {account && account.toLowerCase() === task.creator.toLowerCase() && !task.completed && (
                  <Tooltip label="Mark as completed">
                    <IconButton
                      icon={<CheckIcon />}
                      aria-label="Complete"
                      size="sm"
                      colorScheme="purple"
                      variant="ghost"
                      onClick={() => handleComplete(task.id)}
                      isRound
                    />
                  </Tooltip>
                )}
                {account && account.toLowerCase() === task.creator.toLowerCase() && !task.completed && (
                  <Tooltip label="Edit">
                    <IconButton
                      icon={<EditIcon />}
                      aria-label="Edit"
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={() => handleEdit(task)}
                      isRound
                    />
                  </Tooltip>
                )}
                {task.completed && <CheckIcon color="green.400" boxSize={5} />}
                {account && account.toLowerCase() === task.creator.toLowerCase() && (
                  <Tooltip label="Delete">
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="Delete"
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDelete(task.id)}
                      isRound
                    />
                  </Tooltip>
                )}
              </HStack>
            </Flex>
          </Collapse>
        ))}
      </VStack>
    </Box>
  );
};

export default TaskList; 