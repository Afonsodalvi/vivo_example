// components/createWallet.js
import React, { useState } from 'react';
import axios from 'axios';

const CreateWallet = ({ setWalletId, setWalletAddress }) => {
  const [inputWalletId, setInputWalletId] = useState(''); // Campo para ID da wallet existente
  const authToken = process.env.REACT_APP_AUTH_TOKEN;

  // Função para conectar uma wallet existente
  const connectExistingWallet = async () => {
    try {
      const response = await axios.get(
        `https://protocol-sandbox.lumx.io/v2/wallets/${inputWalletId}`,
        {
          headers: { Authorization: authToken },
        }
      );
      setWalletId(response.data.id);
      setWalletAddress(response.data.address);
    } catch (error) {
      console.error('Erro ao conectar a wallet existente:', error);
    }
  };

  // Função para criar uma nova wallet
  const createNewWallet = async () => {
    try {
      const response = await axios.post(
        'https://protocol-sandbox.lumx.io/v2/wallets',
        {},
        {
          headers: { Authorization: authToken },
        }
      );
      setWalletId(response.data.id);
      setWalletAddress(response.data.address);
    } catch (error) {
      console.error('Erro ao criar a carteira:', error);
    }
  };

  const handleConnect = () => {
    if (inputWalletId) {
      connectExistingWallet();
    } else {
      createNewWallet();
    }
  };

  return (
    <div>
      <label>
        Wallet ID Existente:
        <input
          type="text"
          value={inputWalletId}
          onChange={(e) => setInputWalletId(e.target.value)}
          placeholder="Insira o Wallet ID (opcional)"
        />
      </label>
      <button onClick={handleConnect}>Conectar Wallet</button>
    </div>
  );
};

export default CreateWallet;
