

// https://node-postgres.com/features/queries

const pg = require('pg');

const config = {
    user: 'postgres',
    database: 'nftdb',
    password: 'root',
    port: 5432                  //Default port, change it if needed
};


class SQLConnect {

    constructor() {
    }

    async queryDB(){


        const pool = new pg.Pool(config)
        const client = await pool.connect()

        try {
            var sql = "SELECT block_height, tx_id, id FROM nft ORDER BY id USING> LIMIT 1";
            var rs = await client.query(sql);
            return rs.rows[0];

        } finally {
            await client.end()
        }

    }

    async insertDB(block_height, tx_id, event_name, data_json){


        const pool = new pg.Pool(config)
        const client = await pool.connect()

        try {
            var sql = "INSERT INTO nft (block_height, tx_id, data, function_event, create_dt) VALUES ($1, $2, $3, $4, $5) RETURNING id";
            var rs = await client.query(sql, [block_height, tx_id, data_json, event_name, new Date()]);

            return rs.rows;

        } finally {
            await client.end()
        }

    }

}

module.exports = SQLConnect;



