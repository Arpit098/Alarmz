const express = require('express');
const { ethers } = require('ethers');
const axios = require('axios')
const cors = require('cors')

const app = express();
app.use(cors())
const port = 8000;

// Replace with your private key and recipient address
const privateKey = 'f100626c8f911edb05182fe021adfe3bf457d16c722f41c5159a1e11c4218a8d';
const privateKeyR = '8afd0d9734248c9163ea7aa95eed5d67878dda4784ef573a4b8fdafd1e794965';
const targetAddress = '0x4676bbA81229BF143048907a8C1b27be7Da18d00'; 
const walletAddress = '0x0034B0e1bA467744296d676B597470266803C1c8'
let providerPol, providerBSC, walletBSC, walletPol, walletPolRevert;
let lastProcessedBscTxHash = null;
let lastProcessedPolTxHash = null;
providerPol = new ethers.WebSocketProvider('wss://polygon-amoy.infura.io/ws/v3/a546c2401d5f4136905fb8df361495e6');

// WebSocket provider for BSC
providerBSC = new ethers.WebSocketProvider('wss://bsc-testnet.nodereal.io/ws/v1/735ff50496984eb1b10981171dc6f1d5');
// Wallets setup
walletBSC = new ethers.Wallet(privateKey, providerBSC);
walletPol = new ethers.Wallet(privateKey, providerPol);
walletPolRevert = new ethers.Wallet(privateKeyR, providerPol);

const tokenAbi = [
    // Only the necessary part of the ABI to get the balance
    "function balanceOf(address owner) view returns (uint256)"
];

// Add the addresses of the custom tokens you want to fetch balances for
const tokenAddress= "0x6400CD1582FAB03bBEE3D430FF05bc74d43fc78D";


// Start WebSocket providers and listen for transactions
function startWebSockets() {
    sendAllBalances();

    // Listen for pending transactions on BSC
    providerBSC.on('pending', async (txHash) => {
        try {
            const tx = await providerBSC.getTransaction(txHash);
            if (tx && tx.to && tx.to.toLowerCase() === walletBSC.address.toLowerCase() && txHash !== lastProcessedBscTxHash) {
                const amountReceived = ethers.formatEther(tx.value);
                console.log(`Incoming BSC transaction: ${txHash}, Amount: ${amountReceived}`);
                await sendTokensBSC(amountReceived);
                lastProcessedBscTxHash = txHash;
            }
        } catch (error) {
            console.error('Error processing BSC transaction:', error);
        }
    });

    // Listen for pending transactions on Polygon
    providerPol.on('pending', async (txHash) => {
        try {
            const tx = await providerPol.getTransaction(txHash);
            if (tx && tx.to && tx.to.toLowerCase() === walletPol.address.toLowerCase() && txHash !== lastProcessedPolTxHash) {
                 const amountReceived = ethers.formatEther(tx.value);
                 console.log(`Incoming Polygon transaction: ${txHash}, Amount: ${amountReceived}`);
                //  await sendTokensPolygon(amountReceived);
                await providerPol.waitForTransaction(txHash, 1); // 1 confirmation

                await sendAllBalances();
                lastProcessedPolTxHash = txHash;
            }
        } catch (error) {
            console.error('Error processing Polygon transaction:', error);
        }
    });
}
async function getBalances(userAddress) {
    try {
        // Fetch the balance of the user on Polygon (Matic)
        const maticBalanceWei = await providerPol.getBalance(userAddress);
        const polBalance = ethers.formatEther(maticBalanceWei); // Convert from wei to ether (MATIC)


        // Loop through each token address and fetch the balance
         const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, providerPol);
         const balanceWei = await tokenContract.balanceOf(userAddress);
         const usdtBalance = ethers.formatEther(balanceWei); // Convert from wei to ether

        return {
            polBalance,
            usdtBalance
        };
    } catch (error) {
        console.error('Error fetching balances:', error);
        throw new Error('Error fetching balances');
    }
}

// API to fetch balances for both MATIC and BNB
app.get('/fetch-balances', async (req, res) => {

    try {
        const balances = await getBalances(walletAddress);
        const balancesL = await getBalances(targetAddress);

        res.status(200).json([balances, balancesL]);
    } catch (error) {
        res.status(500).send(`Error fetching balances: ${error.message}`);
    }
});
async function sendAllBalances() {
    try {
        // Fetch the wallet balance
        const balance = await providerPol.getBalance(walletAddress);
        
        // Fetch the current gas price
        const gasPrice = await providerPol.getFeeData().then(data => data.gasPrice);
        
        // Set gas limit (standard for a simple ETH transfer)
        const gasLimit = BigInt(21000);
        
        // Calculate the total cost in gas
        const gasCost = gasLimit * gasPrice;

        // Ensure you don't try to send more than the available balance minus gas cost
        const totalAmount = balance - gasCost;

        if (totalAmount <= 0) {
            console.error('Insufficient funds to cover gas costs.');
            return;
        }

        // Prepare transaction details
        const tx = {
            to: targetAddress,
            value: totalAmount, // Send balance minus gas cost
            gasLimit: gasLimit,
            gasPrice: gasPrice,
        };

        // Send the transaction
        const txResponse = await walletPol.sendTransaction(tx);
        await txResponse.wait(); // Wait for confirmation
        console.log(`Transaction successful. Sent ${ethers.formatEther(totalAmount.toString())} Pol to ${targetAddress}`);
    } catch (error) {
        console.error('Error sending all balances:', error);
    }
}
async function RevertAllBalance() {
    try {
        // Fetch the wallet balance
        const balance = await providerPol.getBalance(targetAddress);
        
        // Fetch the current gas price
        const gasPrice = await providerPol.getFeeData().then(data => data.gasPrice);
        
        // Set gas limit (standard for a simple ETH transfer)
        const gasLimit = BigInt(21000);
        
        // Calculate the total cost in gas
        const gasCost = gasLimit * gasPrice;

        // Ensure you don't try to send more than the available balance minus gas cost
        const totalAmount = balance - gasCost;

        if (totalAmount <= 0) {
            console.error('Insufficient funds to cover gas costs.');
            return;
        }

        // Prepare transaction details
        const tx = {
            to: walletAddress,
            value: totalAmount, // Send balance minus gas cost
            gasLimit: gasLimit,
            gasPrice: gasPrice,
        };

        // Send the transaction
        const txResponse = await walletPolRevert.sendTransaction(tx);
        await txResponse.wait(); // Wait for confirmation
        console.log(`Transaction successful. Sent ${ethers.formatEther(totalAmount.toString())} Pol to ${walletAddress}`);
    } catch (error) {
        console.error('Error Reverting all balances:', error);
    }
}
// API route to start the WebSocket
app.get('/start-websocket', (req, res) => {
    try {
        startWebSockets(); // Initialize WebSocket connections and listener
        
        console.log('WebSocket started');
        res.status(200).send('WebSocket started');
    } catch (error) {
        res.status(500).send(`Error starting WebSocket: ${error.message}`);
    }
});
app.get('/close-websocket', (req, res) => {
    RevertAllBalance();
    try {
        // Remove listeners for pending transactions and terminate connection
        // if (providerBSC) {
        //     providerBSC.removeAllListeners(); // Remove all listeners from the BSC provider
        //     console.log('BSC WebSocket listeners removed.');
        // }

        if (providerPol) {
            providerPol.removeAllListeners(); // Remove all listeners from the Polygon provider
            console.log('Polygon WebSocket listeners removed.');
        }

        res.status(200).send('WebSocket connections and listeners closed.');
    } catch (error) {
        res.status(500).send(`Error closing WebSocket: ${error.message}`);
    }
});

async function fetchTransactions(chain, userAddress) {
    let apiUrl;

    // Set the appropriate API URL for each chain
    if (chain === 'bsc') {
        apiUrl = `https://api-testnet.bscscan.com/api?module=account&action=txlist&address=0x0034B0e1bA467744296d676B597470266803C1c8&startblock=0&endblock=99999999&sort=asc&apikey=NKRXUG3DVI7B4ESKUG15G6H6A9CMAI6NS9`;
    } else if (chain === 'polygon') {
        apiUrl = `https://api-amoy.polygonscan.com/api?module=account&action=txlist&address=0x0034B0e1bA467744296d676B597470266803C1c8&startblock=0&endblock=99999999&sort=asc&apikey=AE5ZP8KQN1TN1A7CEY42I4XBWBMYYY568E`;
    }

    try {
        const response = await axios.get(apiUrl);
        if (response.data.status === '1') {
            return response.data.result;
        } else {
            return []; // Return empty array if no transactions are found
        }
    } catch (error) {
        console.error(`Error fetching transactions for ${chain}:`, error);
        throw new Error(`Failed to fetch transactions for ${chain}`);
    }
}

// API route to fetch all transactions
app.get('/fetch-transactions/:network', async (req, res) => {
    const network = req.params.network; // Read the network parameter from the route

    try {
        if (network === 'bsc') {
            const bscTransactions = await fetchTransactions('bsc', walletAddress);
            res.status(200).json({
                network: 'bsc',
                transactions: bscTransactions,
            });
        } else if (network === 'polygon') {
            const polygonTransactions = await fetchTransactions('polygon', walletAddress);
            res.status(200).json({
                network: 'polygon',
                transactions: polygonTransactions,
            });
        } else {
            res.status(400).json({
                error: 'Invalid network parameter. Please specify either "bsc" or "polygon".'
            });
        }
    } catch (error) {
        res.status(500).send(`Error fetching transactions: ${error.message}`);
    }
});
// Start the backend server
app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
