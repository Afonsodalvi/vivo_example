// components/CreateChip.js
import React, { useState, useEffect } from 'react';

const CreateChip = ({ walletId, contractAddress, authToken }) => {
  const [transactionHash, setTransactionHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [numberValue, setNumberValue] = useState(7); // Valor inicial do número
  const [dataBytes, setDataBytes] = useState('0x4b594320666f72207573657231'); // Dados de bytes iniciais
  const [addressValue, setAddressValue] = useState('0x5bb7dd6a6eb4a440d6C70e1165243190295e290B'); // Endereço inicial
  const [createdChips, setCreatedChips] = useState([]); // Lista de chips criados
  const [errorMessage, setErrorMessage] = useState('');

  const createChip = async () => {
    setLoading(true);
    setErrorMessage(''); // Limpa a mensagem de erro
    try {
      const response = await fetch('https://protocol-sandbox.lumx.io/v2/transactions/custom', {
        method: 'POST',
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletId,
          contractAddress,
          operations: [
            {
              functionSignature: 'createChip(address[], uint256[], (bytes,address)[])',
              argumentsValues: [
                [addressValue], // Endereço
                [numberValue], // Número
                [[dataBytes, addressValue]], // Dados de bytes e endereço
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      const data = await response.json();
      const transactionId = data.id;

      // Inicia o polling para o transactionHash
      const timeout = setTimeout(() => {
        setErrorMessage('Tente outro ID');
        setLoading(false);
      }, 10000); // 10 segundos

      const pollInterval = setInterval(async () => {
        try {
          const pollResponse = await fetch(
            `https://protocol-sandbox.lumx.io/v2/transactions/${transactionId}`,
            { headers: { Authorization: authToken } }
          );

          if (!pollResponse.ok) {
            throw new Error(`Erro ao verificar transação: ${pollResponse.status}`);
          }

          const pollData = await pollResponse.json();

          if (pollData.transactionHash) {
            clearTimeout(timeout); // Cancela o timeout se o hash for encontrado
            setTransactionHash(pollData.transactionHash);
            clearInterval(pollInterval);
            setCreatedChips((prev) => [...prev, numberValue]); // Armazena o número de chips criados
            setLoading(false);
          }
        } catch (error) {
          console.error(error);
        }
      }, 2000);
    } catch (error) {
      console.error('Erro ao criar o chip:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Preencha as informações para criar um chip</h3>
      <label>
        Número:
        <input
          type="number"
          value={numberValue}
          onChange={(e) => setNumberValue(Number(e.target.value))}
        />
      </label>
      <label>
        Dados de Bytes:
        <input
          type="text"
          value={dataBytes}
          onChange={(e) => setDataBytes(e.target.value)}
        />
      </label>
      <label>
        Endereço:
        <input
          type="text"
          value={addressValue}
          onChange={(e) => setAddressValue(e.target.value)}
        />
      </label>
      <button onClick={createChip} disabled={loading || !walletId}>
        {loading ? 'Criando Chip...' : 'Criar Chip'}
      </button>
      {transactionHash && (
        <p>
          <a
            href={`https://amoy.polygonscan.com/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver no Explorer
          </a>
        </p>
      )}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <h4>Chips Criados:</h4>
      <ul>
        {createdChips.map((chip, index) => (
          <li key={index}>Número do chipo: {chip}</li>
        ))}
      </ul>
    </div>
  );
};

export default CreateChip;
