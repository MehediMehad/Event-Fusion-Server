import { Server } from 'http';
import app from './app';
import config from './config';
import { UserService } from './app/modules/User/user.service';

const port = config.port as string;

async function main() {
    const server: Server = app.listen(port, () => {
        UserService.createDemoUser();
        console.log(`🚀 Server listening at http://localhost:${port} 😎`);
    });
}

main().catch((error) => {
    console.error('❌ Server failed to start', error);
    process.exit(1);
});
