import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [walletId, setWalletId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [transactionHash, setTransactionHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const authToken = process.env.REACT_APP_AUTH_TOKEN;
  const contractId = process.env.REACT_APP_CONTRACT_ID;

  const connectWallet = async () => {
    const response = await axios.post(
      'https://protocol-sandbox.lumx.io/v2/wallets',
      {},
      { headers: { Authorization: authToken } }
    );
    setWalletId(response.data.id); // Show the wallet ID after connecting
  };

  const mintToken = async () => {
    setLoading(true);
    const response = await axios.post(
      'https://protocol-sandbox.lumx.io/v2/transactions/mints',
      { walletId, quantity, contractId },
      { headers: { Authorization: authToken, 'Content-Type': 'application/json' } }
    );
    const transactionId = response.data.id;

    // Poll transaction status every 2 seconds
    const pollInterval = setInterval(async () => {
      const pollResponse = await axios.get(
        `https://protocol-sandbox.lumx.io/v2/transactions/${transactionId}`,
        { headers: { Authorization: authToken } }
      );
      if (pollResponse.data.transactionHash) {
        setTransactionHash(pollResponse.data.transactionHash);
        clearInterval(pollInterval);
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div>
      <button onClick={connectWallet}>Connect Wallet</button>
      {walletId && <p>Wallet ID: {walletId}</p>} {/* Display Wallet ID */}
      {walletId && (
        <>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <button onClick={mintToken} disabled={loading}>
            {loading ? 'Minting...' : 'Mint'}
          </button>
        </>
      )}
      {transactionHash && <a href={`https://amoy.polygonscan.com/tx/${transactionHash}`} target="_blank">View on Explorer</a>}
    </div>
  );
};

export default App;
