import React from 'react';
import { Button, HStack, Text, Avatar, Box, Tooltip } from '@chakra-ui/react';
import { FaWallet } from 'react-icons/fa';
import { toast } from '@chakra-ui/react';

function makeBlockie(address) {
  // Simple blockie placeholder (use a real blockie lib for production)
  // Here, just use a colored circle with the last 4 chars
  const color = `#${address?.slice(2, 8) || 'ccc'}`;
  return (
    <Avatar size="sm" bg={color} color="white" name={address} />
  );
}

const WalletConnect = ({ account, connectWallet }) => (
  <HStack justify="center" spacing={3} mt={2}>
    {account ? (
      <Tooltip label={account} hasArrow>
        <Box display="flex" alignItems="center" gap={2} px={3} py={2} bg="gray.100" _dark={{ bg: 'gray.700' }} borderRadius="lg" boxShadow="sm">
          {makeBlockie(account)}
          <Text fontWeight={700} fontSize="sm" color="purple.700" _dark={{ color: 'purple.200' }}>
            {account.slice(0, 6)}...{account.slice(-4)}
          </Text>
        </Box>
      </Tooltip>
    ) : (
      <Button
        leftIcon={<FaWallet />}
        colorScheme="purple"
        size="md"
        borderRadius="lg"
        fontWeight={700}
        onClick={connectWallet}
        px={6}
        boxShadow="md"
      >
        Connect Wallet
      </Button>
    )}
  </HStack>
);

export default WalletConnect; 