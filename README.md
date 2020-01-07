# Hyperledger-fabric-raft-with-channel-EventHub
Hyper-ledger Fabric setup using the raft consensus engine which also includes creation of channel eventhub.This example contains, Two organistion each consist of two peers, one CA, five orderer.


### Steps for create the channel and join the channel using CLI

* Peer0.org1.example.com

        docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" -it cli_org1 bash

* Peer0.org2.example.com

        docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp" -e "CORE_PEER_ADDRESS=peer0.org2.example.com:9051" -it cli_org1 bash

* Set the orderer tls

        export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

#### create the channel transaction

    peer channel create -o orderer.example.com:7050 -c channelall -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/channelAll.tx --tls --cafile $ORDERER_CA

#### Join the channel

    peer channel join -b channelall.block --tls --cafile $ORDERER_CA


#### Install the chain-code we are using the fabcar

    peer chaincode install -n fabcar -p github.com/chaincode/chaincode/fabcar -v 1.1


#### Initialise the fabcar

    peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile $ORDERER_CA -C channelall -c '{"Args":[]}'  -n fabcar -v 1.1

#### Init the fabcar

    peer chaincode invoke -o orderer.example.com:7050 --tls --cafile $ORDERER_CA -C channelall -n fabcar -c '{"Args":["initLedger"]}'


### Interacting with blockchain using fabric node client and working with channel event

     cd node-js

     npm install

* Enrol the CA which create the wallet folder and certificate for ca admin.

    `node enroll.js`

* Register user which create the user's certificate and store in wallet folder.

    `node registerUser.js`

* Invoke the transaction which creates the transaction on fabric network.

    `node invoke.js`


> Note: In invoke.js file, we can see the implementation for channel event. There are two implementations for channel event, one for getting the latest block and another chain event for providing the start and end index of block