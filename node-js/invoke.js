/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const fs = require('fs');
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', "node-js", "connection", 'connection-org1.json');

async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('admin_org1');
        if (!userExists) {
            console.log('An identity for the user "admin_org1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin_org1', discovery: { enabled: false, asLocalhost: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('channelall');
        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        await contract.submitTransaction('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom');
        console.log('Transaction has been submitted');

        //start Channel Event
        var client = gateway.getClient();

        //get the channel by channel-name
        var channel = gateway.getClient().getChannel("channelall");

        //Read the TLS_CERT PEM file from peer
        const data = fs.readFileSync(path.join(__dirname, '../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp/tlscacerts/tlsca.org1.example.com-cert.pem'));
        const peer = client.newPeer(
            'grpcs://localhost:7051',
            {
                pem: Buffer.from(data).toString(),
                'ssl-target-name-override': 'peer0.org1.example.com'
            }
        );
        // create the new channel event hub
        const channel_event_hub = channel.newChannelEventHub(peer);

        //Connect the event hub with filter full_block :true

        // channel_event_hub.connect({ full_block: true }, (err, status) => {
        //     if (err) {
        //         console.log("err", err)
        //     } else {
        //         console.log("status", status)
        //     }
        // });
        // Register the new channel event hub
        // channel_event_hub.registerBlockEvent((block) => {
        //     console.log("All the block details", JSON.stringify(block))
        //     console.log('Successfully received the block event', block);
        // })

        //Regiseter event hub with start and end index
        let block_reg = channel_event_hub.registerBlockEvent((block) => {
            console.log('Successfully received a block event', JSON.stringify(block));
            const event_block = Long.fromValue(block.header.number);
            if (event_block.equals(current_block)) {
                console.log('Successfully got the last block number');
            }
        }, (error) => {
            console.log('Failed to receive the block event ::' + error);
        },
         { startBlock: 1, endBlock: 3 }
        );
        console.log(block_reg)
        channel_event_hub.connect({ full_block: true });
        //End of channel event

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
