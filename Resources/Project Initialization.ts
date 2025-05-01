// Note: 
// Step 1: yarn init
// Step 2: yarn add prisma typescript ts-node @types/node -D
// Step 3: npx tsc --init
// Step 4: Go to tsconfig.json and Change "rootDir": "./src", "outDir": "./dist",
// Step 5: npx prisma init
// Step 6: DATABASE_URL="postgresql://postgres:MehediMehad@localhost:5432/health_care?schema=public"
// Step 7: yarn add express
// Step 8: yarn add ts-node @types/node -D
// Step 9: yarn add @types/express -D
// Step 10: yarn add @types/cors -D
// Step 11: Go to package.json file and add "scripts": {"dev": "ts-node-dev --respawn --transpile-only src/server.ts"},
/* Step 12: create src/server.ts file 
import { Server } from "http";
import app from "./app";

const port = 3000;

async function main() {
  const server: Server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port} 😎`);
  });
}

main().catch((error) => {
  console.error("❌ Server failed to start", error);
  process.exit(1);
});

*/

/* Step 13: create src/app.ts file 
import express, { Application, Request, Response } from 'express';
import cors from 'cors';


const app: Application = express();
app.use(cors())

app.get('/', (req: Request, res: Response) => {
    res.send({
        message: 'Hello from the Health Care Server!'
    });
})

export default app;

*/

// Step 14: yarn dev


