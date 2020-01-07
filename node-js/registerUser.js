/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', "node-js", "connection",'connection-org1.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

const userRegister = "admin_org1"
const enrollAdmin = "admin-ca1"

async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(userRegister);
        if (userExists) {
            console.log('An identity for the user ' + userRegister + ' already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(enrollAdmin);
        if (!adminExists) {
            console.log('An identity for the admin user ' + enrollAdmin + ' does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: enrollAdmin, discovery: { enabled: true } });

        console.log("#################################gateway######################################################",gateway)
        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        console.log("#################################adminIdentity######################################################",adminIdentity)

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: 'org1.example.com', enrollmentID: userRegister, role: 'admin', attrs: [{ name: "roletype", value: "admin", ecert: true }] }, adminIdentity);

        //const secret = await ca.register({ affiliation: 'org1.avantas.com', enrollmentID: userRegister, role: 'client', attrs: [{ name: "roletype", value: "member", ecert: true }] }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: userRegister, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        wallet.import(userRegister, userIdentity);
        console.log('Successfully registered and enrolled admin user ' + userRegister + ' and imported it into the wallet');

    } catch (error) {
        console.error('Failed to register user ' + userRegister + ' : ' + error);
        process.exit(1);
    }
}

main();
