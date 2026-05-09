const net = require('net');
const Router = require ('./router');
const handlers = require ('./handlers');


const router = new Router;

router.add('POST', '/shorten', handlers.createUrl);
router.add('GET', '/shorten/:code', handlers.getUrl);
router.add('PUT', '/shorten/:code', handlers.updateUrl);
router.add('DELETE', '/shorten/:code', handlers.deleteUrl);
router.add('GET', '/shorten/:code/stats', handlers.getStats);

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

            const responseBody = result.body ? JSON.stringify(result.body) : '';
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