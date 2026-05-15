// socket.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let client = null;

export const connectSocket = (onMessage, barberId) => {
    if (client && client.active) return client;

    const socket = new SockJS("http://localhost:1009/ws");

    client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
    });

    client.onConnect = () => {
        console.log("✅ WebSocket Connected");

        client.subscribe(`/topic/barber/${barberId}`, (msg) => {
            const data = JSON.parse(msg.body);
            onMessage(data);
        });
    };

    client.activate();

    return client;
};

export const disconnectSocket = () => {
    if (client && client.active) {
        client.deactivate();
        client = null;
    }
};