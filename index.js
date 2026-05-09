const net = require('net');
const Router = require ('./router');
const handlers = require ('./handlers');


const router = new Router;

router.add('POST', '/shorten', handlers.createUrl);
router.add('GET', '/shorten/:code', handlers.getUrl);
router.add('PUT', '/shorten/:code', handlers.updateUrl);
router.add('DELETE', '/shorten/:code', handlers.deleteUrl);
router.add('GET', '/shorten/:code/stats', handlers.getStats);
router.add('GET', '/:code', handlers.redirectUrl);

const server = net.createServer((socket) => {
    socket.on('data', async (data) => {
        const raw = data.toString();

        const lines = raw.split('\r\n');
        const [method, path] = lines[0].split(' ');

        const bodyIndex = raw.indexOf('\r\n\r\n');
        let body = null;
        if (bodyIndex !== -1){
            try {
                body = JSON.parse(raw.slice(bodyIndex +4));
            } catch (e) {}
            }
            const match = router.match(method, path);
            if (!match) {
                const responseBody = JSON.stringify({ error: 'Not found' });
                socket.write(
                    `HTTP/1.1 404 Not Found\r\n` +
                    `Content-Type: application/json\r\n` +
                    `Content-Length: ${Buffer.byteLength(responseBody)}\r\n` +
                    `\r\n` +
                    responseBody
                );
                socket.end();
                return;
            }
            const result = await match.handler(match.params, body);

            let responseBody = '';
            if (result.body !== null && result.body !== undefined) {
                responseBody = JSON.stringify(result.body);
            }
            
            if (result.redirect) {
                socket.write(
                    `HTTP/1.1 301 Moved Permanently\r\n` +
                    `Location: ${result.redirect}\r\n` +
                    `Content-Length: 0\r\n` +
                    `\r\n`
                );
                socket.end();
                return;
            }
        
            socket.write(
                `HTTP/1.1 ${result.status}\r\n` +
                `Content-Type: application/json\r\n` +
                `Content-Length: ${Buffer.byteLength(responseBody)}\r\n` +
                `\r\n` +
                responseBody
            );
            socket.end();
        

    });
});
server.listen(3000, () => console.log('listening on 3000'));