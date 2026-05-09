class Router {
    constructor () {
        this.routes = [];
    }

    add (method, path, handler) {
        this.routes.push({method, path, handler});

    }
    match (method, path) {
        for (const route of this.routes){
            const routeParts = route.path.split('/');
            const pathParts = path.split('/');

            if (route.method !== method) continue;
            if (routeParts.length !== pathParts.length) continue;

            const params = {};
            let matched = true;

            for (let i =0; i< routeParts.length; i++){
                if (routeParts[i].startsWith(':')) {
                    params[routeParts[i].slice(1)] = pathParts[i];
                } else if (routeParts[i] !== pathParts[i]) {
                    matched = false;
                    break;
                }
                }
                if (matched) return {handler: route.handler, params};
                
            }
            return null;
        }
    }
module.exports = Router;