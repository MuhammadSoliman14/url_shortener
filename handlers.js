const pool = require('./db');

function generateCode(){
    return Math.random().toString(36).slice(2,8);

}

const handlers = {
    async createUrl (params, body){
        if (!body?.url) {
            return { status: 400, body: {error: "URL is required"}};
        }
        const code = generateCode();
        const result = await pool.query(
            'INSERT INTO urls (url, short_code) VALUES ($1, $2) RETURNING *',
            [body.url, code]
        );
        return { status: 201, body: result.rows[0]};
    },

    async getUrl (params, body){
        const result = await pool.query(
            'SELECT * FROM urls WHERE short_code = $1', 
            [params.code]
        );

        if (result.rows.length === 0) {
            return {status: 404, body: {error: "URL not found"}};
        }

        await pool.query(
            'UPDATE urls SET access_count = access_count +1 WHERE short_code = $1',
            [params.code] 
        );
        return {status: 200, body: result.rows[0]};

    },

    async updateUrl (params, body){
        if (!body?.url){
            return { status: 400, body: { error: 'URL is required' } };
        }

        const result = await pool.query(
            'UPDATE urls SET url = $1, updated_at = NOW() WHERE short_code = $2 RETURNING *',
            [body.url, params.code]
        );
        if (result.rows.length === 0){
            return { status: 404, body: { error: 'URL not found' } };
        }
        return {status: 200, body: result.rows[0]};
    },

    async deleteUrl (params, body){
        const result = await pool.query(
            'DELETE FROM urls WHERE short_code = $1 RETURNING *',
            [params.code]
        );

        if (result.rows.length === 0){
            return { status: 404, body: { error: 'URL not found' } };
        }
    
        return {status: 204, body: null};
},


async getStats(params, body) {
    const result = await pool.query(
        'SELECT * FROM urls WHERE short_code = $1',
        [params.code]
    );

    if (result.rows.length === 0) {
        return { status: 404, body: { error: 'URL not found' } };
    }

    return { status: 200, body: result.rows[0] };
}
};

module.exports = handlers;