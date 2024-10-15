// components/TransferChip.js
import React, { useState, useEffect } from 'react';

const TransferChip = ({ walletId, contractAddress, authToken }) => {
  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);
  const [chipId, setChipId] = useState(6); // Valor inicial do chip ID
  const [recipientAddress, setRecipientAddress] = useState('0x5bb7dd6a6eb4a440d6C70e1165243190295e290B'); // Endereço do destinatário
  const [dataBytes, setDataBytes] = useState('0x4b594320666f72207573657231'); // Dados de bytes iniciais
  const [errorMessage, setErrorMessage] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false); // Controle para permissão concedida
  const [permissionValue, setPermissionValue] = useState(true); // Valor de permissão inicial (true)

  // Função para setar permissão
  const setPermission = async () => {
    setLoading(true);
    setErrorMessage('');
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
              functionSignature: 'setNotPermission(bool, uint256)',
              argumentsValues: [permissionValue, chipId], // Usa o valor de permissão selecionado
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
        setErrorMessage('Erro ao configurar permissão. Tente novamente.');
        setLoading(false);
      }, 10000);

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
            setPermissionGranted(true); // Marca permissão como concedida
            clearInterval(pollInterval);
            setLoading(false);
          }
        } catch (error) {
          console.error(error);
        }
      }, 2000);
    } catch (error) {
      console.error('Erro ao configurar permissão:', error);
      setLoading(false);
    }
  };

  // Função para transferência de chip
  const transferChip = async () => {
    setLoading(true);
    setErrorMessage('');
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
              functionSignature: 'transferChip(uint256, address, (bytes,address))',
              argumentsValues: [
                chipId, // ID do Chip
                recipientAddress, // Endereço do destinatário
                [dataBytes, recipientAddress], // Dados de bytes e o mesmo endereço
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

      // Timeout de 10 segundos para o polling
      const timeout = setTimeout(() => {
        setErrorMessage('Erro na transferência. Tente novamente.');
        setLoading(false);
      }, 10000);

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
            setTransactionHash(pollData.transactionHash); // Armazena o hash da transação
            clearInterval(pollInterval);
            setLoading(false);
          }
        } catch (error) {
          console.error(error);
        }
      }, 2000);
    } catch (error) {
      console.error('Erro na transferência do chip:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Configurar Permissão e Transferir Chip</h3>
      <label>
        ID do Chip:
        <input
          type="number"
          value={chipId}
          onChange={(e) => setChipId(Number(e.target.value))}
        />
      </label>
      <label>
        Permissão:
        <select
          value={permissionValue}
          onChange={(e) => setPermissionValue(e.target.value === 'true')}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </label>
      <button onClick={setPermission} disabled={loading || permissionGranted || !walletId}>
        {loading ? 'Configurando Permissão...' : 'Configurar Permissão'}
      </button>
      {permissionGranted && (
        <>
          <h4>Permissão Concedida</h4>
          <label>
            Endereço do Destinatário:
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
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
          <button onClick={transferChip} disabled={loading || !walletId}>
            {loading ? 'Transferindo Chip...' : 'Transferir Chip'}
          </button>
        </>
      )}
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

export default TransferChip;
