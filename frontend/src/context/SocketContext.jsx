import { createContext, useEffect, useRef, useState } from "react";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const socket = useRef(null);
    const [messages, setMessages] = useState([]);
    console.log(messages,'messages')
    function connectionSocket() {
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            console.log("WebSocket already connected");
            return;
        }

        const ws = new WebSocket("ws://localhost:8080");
        socket.current = ws;

        ws.onopen = () => {
            console.log("✅ Connection Established");
        };

        ws.onmessage = (event) => {
            console.log("📩 New Message:", event.data);
            setMessages(prevMessages => [...prevMessages, event.data]);  
        };

        ws.onclose = () => {
            console.log("❌ Connection Closed. Attempting to reconnect...");
            setTimeout(connectionSocket, 3000); // Attempt reconnect after 3 seconds
        };

        ws.onerror = (error) => {
            console.log("⚠️ WebSocket Error:", error);
        };
    }

    function sendMessage(message) {
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            console.log("📤 Sending Message:", message);
            socket.current.send(message);
        } else {
            console.log("⚠️ Socket not open. Reconnecting...");
            connectionSocket();
            setTimeout(() => {
                if (socket.current && socket.current.readyState === WebSocket.OPEN) {
                    console.log("📤 Resending after reconnect:", message);
                    socket.current.send(message);
                }
            }, 3000);
        }
    }

    useEffect(() => {
        connectionSocket();

        return () => {
            if (socket.current) {
                socket.current.close();
                console.log("🔌 Socket Closed");
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ sendMessage, messages }}>
            {children}
        </SocketContext.Provider>
    );
};
