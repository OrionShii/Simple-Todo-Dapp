import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { TODO_LIST_ABI } from './utils/abi';
import { TODO_LIST_ADDRESS } from './utils/contract';
import WalletConnect from './components/WalletConnect';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import {
  Box,
  Flex,
  Heading,
  useColorMode,
  IconButton,
  useToast,
  Spacer,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

function ColorModeSwitcher() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      aria-label="Toggle dark mode"
      icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      onClick={toggleColorMode}
      size="md"
      variant="ghost"
      position="absolute"
      top={4}
      right={4}
    />
  );
}

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [eventMsg, setEventMsg] = useState('');
  const toast = useToast();

  useEffect(() => {
    const loadWallet = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const signer = await provider.getSigner();
          const account = await signer.getAddress();
          setAccount(account);
          const todoList = new ethers.Contract(TODO_LIST_ADDRESS, TODO_LIST_ABI, signer);
          setContract(todoList);
        }
      } catch (err) {
        toast({
          title: 'Wallet Error',
          description: err?.message || JSON.stringify(err),
          status: 'error',
          duration: 6000,
          isClosable: true,
        });
      }
    };
    loadWallet();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!contract) return;
    const onCreated = (id, content, creator) => {
      const msg = `Task created: "${content}" by ${creator}`;
      setEventMsg(msg);
      toast({ title: 'Task Created', description: msg, status: 'success', duration: 4000, isClosable: true });
    };
    const onCompleted = (id) => {
      const msg = `Task completed: #${id}`;
      setEventMsg(msg);
      toast({ title: 'Task Completed', description: msg, status: 'info', duration: 4000, isClosable: true });
    };
    const onDeleted = (id) => {
      const msg = `Task deleted: #${id}`;
      setEventMsg(msg);
      toast({ title: 'Task Deleted', description: msg, status: 'warning', duration: 4000, isClosable: true });
    };
    contract.on('TaskCreated', onCreated);
    contract.on('TaskCompleted', onCompleted);
    contract.on('TaskDeleted', onDeleted);
    return () => {
      contract.off('TaskCreated', onCreated);
      contract.off('TaskCompleted', onCompleted);
      contract.off('TaskDeleted', onDeleted);
    };
    // eslint-disable-next-line
  }, [contract]);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = await provider.getSigner();
        const account = await signer.getAddress();
        setAccount(account);
        const todoList = new ethers.Contract(TODO_LIST_ADDRESS, TODO_LIST_ABI, signer);
        setContract(todoList);
      }
    } catch (err) {
      toast({
        title: 'Wallet Error',
        description: err?.message || JSON.stringify(err),
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bgGradient="linear(to-br, blue.50, purple.50)">
      <Box position="relative" w="100%" maxW="420px" p={8} borderRadius={"2xl"} boxShadow="2xl" bg="whiteAlpha.900">
        <ColorModeSwitcher />
        <Heading as="h1" size="xl" textAlign="center" mb={6} color="purple.700" fontWeight={800} letterSpacing={1}>
          Web3 To-Do List dApp
        </Heading>
        <WalletConnect account={account} connectWallet={connectWallet} />
        <Box mt={8}>
          <TaskForm contract={contract} />
          <TaskList contract={contract} account={account} />
        </Box>
      </Box>
    </Flex>
  );
}

export default App; 