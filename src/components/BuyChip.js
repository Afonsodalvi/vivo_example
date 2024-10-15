// components/buyChip.js
import React, { useState, useEffect } from 'react';

const BuyChip = ({ walletId, walletAddress, contractAddress, authToken }) => {
  const [transactionHash, setTransactionHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chipId, setChipId] = useState(6); // Valor inicial do chip ID
  const [dataBytes, setDataBytes] = useState('0x4b594320666f72207573657231'); // Dados de bytes iniciais
  const [addressValue, setAddressValue] = useState(walletAddress); // Endereço inicial usando walletAddress
  const [errorMessage, setErrorMessage] = useState('');
  const messageValue = 1000000000000000; // Valor fixo do messageValue em wei

  // Atualiza o endereço automaticamente quando walletAddress muda
  useEffect(() => {
    setAddressValue(walletAddress);
  }, [walletAddress]);

  const buyChip = async () => {
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
              functionSignature: 'buyChip(uint256,(bytes,address))',
              argumentsValues: [
                chipId, // ID do Chip
                [dataBytes, addressValue], // Dados de bytes e endereço
              ],
              messageValue, // Valor da mensagem em wei
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      const data = await response.json();
      const transactionId = data.id;

      // Timeout de 10 segundos para o polling
      const timeout = setTimeout(() => {
        setErrorMessage('O chip já foi criado ou a transação falhou.');
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
            setLoading(false);
          }
        } catch (error) {
          console.error(error);
        }
      }, 2000);
    } catch (error) {
      console.error('Erro ao comprar o chip:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Preencha as informações para comprar um chip</h3>
      <label>
        ID do Chip:
        <input
          type="number"
          value={chipId}
          onChange={(e) => setChipId(Number(e.target.value))}
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
      <p>Message Value: {messageValue} wei</p>
      <button onClick={buyChip} disabled={loading || !walletId}>
        {loading ? 'Comprando Chip...' : 'Comprar Chip'}
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
    </div>
  );
};

export default BuyChip;
