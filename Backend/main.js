const { ethers } = require('ethers');
const WebSocket = require('ws'); // WebSocket library

const port = 5000;
const wss = new WebSocket.Server({ port });

let lastBSCTransaction = null;
let lastPolygonTransaction = null;

const walletAddress = '0x0034B0e1bA467744296d676B597470266803C1c8'; // Your wallet address
const targetWalletAddress = '0x4676bbA81229BF143048907a8C1b27be7Da18d00'; // Replace with your target wallet address

// WebSocket providers for BSC and Polygon
const providerBSC = new ethers.WebSocketProvider('wss://bsc-testnet-rpc.publicnode.com/NKRXUG3DVI7B4ESKUG15G6H6A9CMAI6NS9'); // Replace with actual WebSocket URL
const providerPolygon = new ethers.WebSocketProvider('wss://polygon-amoy-bor-rpc.publicnode.com/AE5ZP8KQN1TN1A7CEY42I4XBWBMYYY568E'); // Replace with actual WebSocket URL

const privateKey = 'f100626c8f911edb05182fe021adfe3bf457d16c722f41c5159a1e11c4218a8d'; // Replace with your wallet's private key
const signerBsc = new ethers.Wallet(privateKey, providerBSC);
const signerPol = new ethers.Wallet(privateKey, providerPolygon);

// Send tokens on BSC
async function sendTokensBsc(amount, targetAddress) {
    const tx = {
        to: targetAddress,
        value: ethers.parseEther(amount.toString()),
    };

    try {
        const tx_response = await signerBsc.sendTransaction(tx);
        console.log(`Transaction sent on BSC: ${tx_response.hash}`);
        await tx_response.wait();
        console.log('Transaction confirmed on BSC');
    } catch (error) {
        console.error('Error sending BSC tokens:', error);
    }
}

// Send tokens on Polygon
async function sendTokensPol(amount, targetAddress) {
    const tx = {
        to: targetAddress,
        value: ethers.parseEther(amount.toString()),
    };

    try {
        const tx_response = await signerPol.sendTransaction(tx);
        console.log(`Transaction sent on Polygon: ${tx_response.hash}`);
        await tx_response.wait();
        console.log('Transaction confirmed on Polygon');
    } catch (error) {
        console.error('Error sending Polygon tokens:', error);
    }
}

// Function to monitor BSC transactions via WebSocket
function monitorBSCTransactions() {
    providerBSC.on('pending', async (txHash) => {
        try {
            const tx = await providerBSC.getTransaction(txHash);
            if (tx && tx.to && tx.to.toLowerCase() === walletAddress.toLowerCase()) {
                console.log('Incoming BSC transaction:', tx);
                const amount = ethers.formatEther(tx.value);
                if (tx.hash !== lastBSCTransaction) {
                    lastBSCTransaction = tx.hash;
                    await sendTokensBsc(amount, targetWalletAddress);
                }
            }
        } catch (error) {
            console.error('Error processing BSC transaction:', error);
        }
    });
}

// Function to monitor Polygon transactions via WebSocket
function monitorPolygonTransactions() {
    providerPolygon.on('pending', async (txHash) => {
        try {
            const tx = await providerPolygon.getTransaction(txHash);
            if (tx && tx.to && tx.to.toLowerCase() === walletAddress.toLowerCase()) {
                console.log('Incoming Polygon transaction:', tx);
                const amount = ethers.formatEther(tx.value);
                if (tx.hash !== lastPolygonTransaction) {
                    lastPolygonTransaction = tx.hash;
                    await sendTokensPol(amount, targetWalletAddress);
                }
            }
        } catch (error) {
            console.error('Error processing Polygon transaction:', error);
        }
    });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('client connected');

    // Handle incoming messages from client
    ws.on('message', (message) => {
        console.log(`Received message from client: ${message}`);
    });

    // Notify client of the connection status
    ws.send('Transaction Monitor Server: Connected');

    // Example: send transaction data to the client every second
    const sendTransactionData = setInterval(() => {
        ws.send(`BSC Last Tx: ${lastBSCTransaction || 'None'}`);
        ws.send(`Polygon Last Tx: ${lastPolygonTransaction || 'None'}`);
    }, 1000);

    // Clean up when the client disconnects
    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(sendTransactionData);
    });
});

// Start monitoring BSC and Polygon transactions
monitorBSCTransactions();
monitorPolygonTransactions();

console.log(`WebSocket server running on ws://localhost:${port}`);
