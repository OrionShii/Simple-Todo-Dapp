import React, { useState } from 'react';
import { Box, Input, Button, Flex, useToast, Spinner } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const TaskForm = ({ contract }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !contract) return;
    setLoading(true);
    try {
      const tx = await contract.createTask(content);
      await tx.wait();
      setContent('');
      toast({ title: 'Task Added', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: 'Error', description: err?.message || JSON.stringify(err), status: 'error', duration: 5000 });
    }
    setLoading(false);
  };

  return (
    <Box as="form" onSubmit={handleSubmit} mb={6}>
      <Flex gap={2} align="center">
        <Input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="New task..."
          disabled={loading}
          bg="gray.50"
          _dark={{ bg: 'gray.700' }}
          size="md"
          fontSize="md"
          borderRadius="lg"
        />
        <Button
          type="submit"
          colorScheme="purple"
          leftIcon={loading ? <Spinner size="xs" /> : <AddIcon />}
          isLoading={loading}
          loadingText="Adding"
          disabled={loading || !content.trim()}
          borderRadius="lg"
          px={6}
          fontWeight={700}
        >
          Add
        </Button>
      </Flex>
    </Box>
  );
};

export default TaskForm; 