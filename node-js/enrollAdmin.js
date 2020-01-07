/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..',"node-js","connection", 'connection-org1.json');
console.log("#####################" + ccpPath)
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

const enrollAdmin = "admin-ca1"


async function main() {
    try {

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(enrollAdmin);
        if (adminExists) {
            console.log('An identity for the admin user ' + enrollAdmin + ' already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin-ca1', enrollmentSecret: 'adminpw'});
        const identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        wallet.import(enrollAdmin, identity);
        console.log('Successfully enrolled admin user ' + enrollAdmin + ' and imported it into the wallet');

    } catch (error) {
        console.error('Failed to enroll admin user ' + enrollAdmin + ' : ' + error);
        process.exit(1);
    }
}

main();
