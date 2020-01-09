/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const fs = require('fs');
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
const util = require('util');
const SQLConnect = require('./pgsql');


const ccpPath = path.resolve(__dirname, '..', "node-js", "connection", 'connection-org1.json');

const userRegister = "admin111_org1"


async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        ///const walletPath = path.join("full_path", 'wallet');

        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(userRegister);
        if (!userExists) {
            console.log('An identity for the user "admin_org1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        ///============================================== start : Gateway()
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: userRegister, discovery: { enabled: false, asLocalhost: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('channelall');
        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Submit the specified transaction.
        // 1. '{"Args":["createCar", "CARxx", "Proton", "Persona", "grey", "goh772"]}'
        var returnvalue_create = await contract.submitTransaction('createCar', 'CAR513', 'audi-naga-513', 'Accord-naga-513', 'Black-naga-513', 'naga-123');
        console.log('Transaction has been submitted for createCar : ' + returnvalue_create);

      
        var client = gateway.getClient();

        //get the channel by channel-name
        var channel = gateway.getClient().getChannel("channelall");

        //Read the TLS_CERT PEM file from peer
        const data = fs.readFileSync(path.join(__dirname, '../crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp/tlscacerts/tlsca.org1.example.com-cert.pem'));
        const peer = client.newPeer(
            'grpcs://127.0.0.1:7051',
            {
                pem: Buffer.from(data).toString(),
                'ssl-target-name-override': 'peer0.org1.example.com'
            }
        );
        // create the new channel event hub
        const channel_event_hub = channel.newChannelEventHub(peer);
        
        ///============================================== start : block event
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

        ///============================================== start : Channel Event - Block Replaying
        const sqlConnect = new SQLConnect();
        var result = await sqlConnect.queryDB();
        var data_block_height = result.block_height;
        var blockNumber_db = data_block_height;

        //Regiseter event hub with start and end index
        let block_reg = channel_event_hub.registerBlockEvent((block) => {
            var cur_block_events = JSON.stringify(block)
            console.log('Successfully received a block event', cur_block_events);

            // 1. get block_number
            var json_block_header = JSON.stringify(block.header)
            var blockNumber_ledger = JSON.parse(json_block_header).number;

            if (blockNumber_db == parseInt(blockNumber_ledger)) {
                console.log('\nSuccessfully synched with the last block number in ledger\n');
                return;
            }

            console.log('\nNeed to process to synch. between DB and ledger\n');
            console.log("==================== start block data ====================")
            let data = block.data.data[0];
            console.log("block data : " + util.inspect(data, {showHidden: false, depth: 5}))
            console.log("==================== end block data ====================")

            // 2. get tx_id
            let json_data = JSON.stringify(data)
            let json_payload = JSON.stringify(JSON.parse(json_data).payload);
            let json_header = JSON.stringify(JSON.parse(json_payload).header);
            let json_channel_header = JSON.stringify(JSON.parse(json_header).channel_header);
            let transactionId = JSON.parse(json_channel_header).tx_id;
            

            //INSERT INTO db : eg. postgresql
            let data_json = {
                    "blockNumber":blockNumber_ledger, 
                    "txId":transactionId,
                    "description": json_channel_header         
            }
            var eventName = "FabcarEvent";
            var rs_insert = sqlConnect.insertDB(blockNumber_ledger, transactionId, eventName, data_json);
            console.log("rs : " + JSON.stringify(rs_insert));    

        }, 
        (error) => {
            console.log('\nFailed to receive the block event ::' + error);
        },
        //{ startBlock: blockNumber_db, endBlock: 45 }          // testing purpose
        { startBlock: blockNumber_db }
        );
        channel_event_hub.connect({ full_block: true });
        //console.log('\nFINAL : ' + block_reg)
                

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
