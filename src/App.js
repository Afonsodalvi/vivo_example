// App.js
import React, { useState } from 'react';
import CreateWallet from './components/CreateWallet';
import CreateChip from './components/CreateChip';
import BuyChip from './components/BuyChip';
import TransferChip from './components/TransferChip'; // Novo componente
import './App.css';

const App = () => {
  const [walletId, setWalletId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const authToken = process.env.REACT_APP_AUTH_TOKEN;
  const contractAddress = process.env.REACT_APP_CONTRACT_ID;

  return (
    <div className="app-container">
      <header className="header">
        <CreateWallet setWalletId={setWalletId} setWalletAddress={setWalletAddress} />
        {walletId && (
          <p className="wallet-info">
            Wallet ID: {walletId}
            <br />
            Endereço: {walletAddress}
          </p>
        )}
      </header>
      <main className="content">
        <h1>Vivo - Gerenciamento de Chips</h1>
        <CreateChip walletId={walletId} contractAddress={contractAddress} authToken={authToken} />
        <BuyChip walletId={walletId} walletAddress={walletAddress} contractAddress={contractAddress} authToken={authToken} />
        <TransferChip walletId={walletId} contractAddress={contractAddress} authToken={authToken} />
      </main>
    </div>
  );
};

export default App;
