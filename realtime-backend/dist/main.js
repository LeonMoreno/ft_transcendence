"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const server = app.getHttpServer();
    const serverAddress = server.address();
    if (serverAddress) {
        const address = typeof serverAddress === 'string' ? serverAddress : serverAddress.address;
        const port = serverAddress.port;
        console.log(`Server is running at ws://${address}:${port}`);
    }
    await app.listen(3001);
}
bootstrap();
//# sourceMappingURL=main.js.map