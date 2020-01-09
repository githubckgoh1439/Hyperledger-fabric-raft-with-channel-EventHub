
'use strict';

const SQLConnect = require('../pgsql');


async function main() {
    try {

      const sqlConnect = new SQLConnect();
      
      //1. query :
      var result = await sqlConnect.queryDB();
      console.log("rs : " + JSON.stringify(result));     

      var data_id = result.id;
      var data_block_height = result.block_height;
      var data_tx_id = result.tx_id;
      console.log(".......block_height : " + data_block_height);     
      console.log(".......tx_id : " + data_tx_id);     
  
      //2. INSERT :
      var cur_block = parseInt(data_block_height);
      var nx_block = cur_block + 1;
      var blockNumber_ledger = nx_block;
      var transactionId = '3333333';
      var cur_block_events = '{"blockNumber":"3","txId":"3333333","carId":"CAR03","description":"Create Fabcar Successfully"}';

      let data_json = {
              "blockNumber":blockNumber_ledger, 
              "txId":transactionId,
              "description": cur_block_events         
      }
      var eventName = "FabcarEvent";
      // callback()
      //await sqlConnect.insertDB(eventName, data_json).then(result => console.log( "resultSet : " + JSON.stringify(result) ));

      var rs_insert = await sqlConnect.insertDB(blockNumber_ledger, transactionId, eventName, data_json);
      console.log("rs : " + JSON.stringify(rs_insert));    


    } catch (error) {

        var err = "Failed to connect : " + error;
        console.error(err); 
        process.exit(1);
    }
}

async function getBlockNumber(result){

    let json_data = JSON.stringify(result.data)
    block_no = JSON.stringify(JSON.parse(json_data).blockNumber);
    console.log("getBlockNumber().......block_no : " + block_no);     

    return block_no;
}




main();

