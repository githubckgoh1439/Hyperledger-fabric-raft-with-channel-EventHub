-- to create a new database
CREATE DATABASE nftsql;

-- to use database
use nftsql;

-- creating a new table
CREATE TABLE nft (
  id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  block_height INT(8) NOT NULL,
  tx_id VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  function_event VARCHAR(100) NOT NULL,
  create_dt DATETIME, 
  modified_dt DATETIME
);

-- to show all tables
show tables;

-- to describe table
describe nft;

================================================
--USED :
DROP TABLE IF EXISTS nft;

CREATE TABLE nft (id SERIAL PRIMARY KEY, block_height INT, tx_id VARCHAR(100), data json,function_event VARCHAR(100),create_dt timestamp,modified_dt timestamp);


# testing :
INSERT INTO nft (block_height, tx_id, data, function_event, create_dt) VALUES (1, '11111', '{"blockNumber":"1","txId":"11111","carId":"CAR01","description":"Create Fabcar Successfully"}','FabcarEvent',CURRENT_TIMESTAMP);
INSERT INTO nft (block_height, tx_id, data, function_event, create_dt) VALUES (2, '22222','{"blockNumber":"2","txId":"22222","carId":"CAR02","description":"Create Fabcar Successfully"}','FabcarEvent',CURRENT_TIMESTAMP);




