import cluster from "cluster";
import { cpus } from "os";
import { WebSocketServer } from "ws";
import Redis from "ioredis";

const numCPUs = 8;

if (cluster.isMaster) {
    console.log(`Master process ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });

} else {
    const subscriber = new Redis();
    const publisher = new Redis();
    const wss = new WebSocketServer({ port: 8080 });
    const clients = new Set();

    console.log(`Worker ${process.pid} started`);

    wss.on("connection", (ws) => {
        console.log(`New Client Connected on Worker ${process.pid}`);
        clients.add(ws);

        ws.on("message", async (message) => {
            console.log(`Worker ${process.pid} Received Message: ${message.toString()}`);
            await publisher.publish("SCALE_CHAT", message.toString());
        });

        ws.on("close", () => {
            console.log(`Client Disconnected on Worker ${process.pid}`);
            clients.delete(ws);
        });

        ws.on("error", (error) => {
            console.error(`WebSocket Error on Worker ${process.pid}:`, error);
            clients.delete(ws);
        });
    });

    subscriber.subscribe("SCALE_CHAT");
    subscriber.on("message", (channel, message) => {
        if (channel === "SCALE_CHAT") {
            console.log(`Worker ${process.pid} Broadcasting Message: ${message}`);
            clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(message);
                }
            });
        }
    });
}
