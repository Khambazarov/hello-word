import { io } from "socket.io-client";

class SocketManager {
  constructor() {
    this.socket = null;
    this.isInitialized = false;
    this.listeners = new Map();
    this.connectionPromise = null;
  }

  async connect() {
    // Verhindere mehrfache Verbindungsversuche
    if (this.isInitialized && this.socket?.connected) {
      console.log("Socket already connected, reusing existing connection");
      return this.socket;
    }

    if (this.connectionPromise) {
      console.log("Connection already in progress, waiting...");
      return this.connectionPromise;
    }

    console.log("Creating new socket connection via SocketManager");

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Cleanup existing socket if present
        if (this.socket) {
          this.socket.removeAllListeners();
          this.socket.disconnect();
        }

        this.socket = io(import.meta.env.VITE_REACT_APP_SOCKET_URL || "http://localhost:8080", {
          transports: ["websocket"],
          withCredentials: true,
          autoConnect: true,
          reconnection: true,
          reconnectionDelay: 2000,
          reconnectionDelayMax: 10000,
          maxReconnectionAttempts: 3,
          timeout: 10000,
          forceNew: false
        });

        this.socket.on("connect", () => {
          console.log("Socket connected via SocketManager");
          this.isInitialized = true;
          this.connectionPromise = null;
          resolve(this.socket);
        });

        this.socket.on("connect_error", (error) => {
          console.warn("Socket connection failed via SocketManager:", error.message);
          this.isInitialized = false;
          this.connectionPromise = null;
          reject(error);
        });

        this.socket.on("disconnect", (reason) => {
          console.log("Socket disconnected via SocketManager:", reason);
          if (reason !== "io client disconnect") {
            this.isInitialized = false;
          }
        });

        // Re-attach existing listeners
        this.reattachListeners();

      } catch (error) {
        console.error("Error creating socket:", error);
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  addListener(eventName, callback, componentId) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Map());
    }
    
    const eventListeners = this.listeners.get(eventName);
    
    // Prüfen ob Listener bereits existiert
    if (eventListeners.has(componentId)) {
      console.log(`Listener for ${eventName} already exists for ${componentId}, skipping`);
      return;
    }
    
    eventListeners.set(componentId, callback);
    
    // Attach to current socket if available
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  removeListener(eventName, componentId) {
    if (this.listeners.has(eventName)) {
      const eventListeners = this.listeners.get(eventName);
      const callback = eventListeners.get(componentId);
      
      if (callback && this.socket) {
        this.socket.off(eventName, callback);
      }
      
      eventListeners.delete(componentId);
      
      // Remove event map if empty
      if (eventListeners.size === 0) {
        this.listeners.delete(eventName);
      }
    }
  }

  removeAllListeners(componentId) {
    for (const [eventName, eventListeners] of this.listeners.entries()) {
      this.removeListener(eventName, componentId);
    }
  }

  reattachListeners() {
    if (!this.socket) return;

    for (const [eventName, eventListeners] of this.listeners.entries()) {
      for (const [componentId, callback] of eventListeners.entries()) {
        this.socket.on(eventName, callback);
      }
    }
  }

  disconnect() {
    console.log("Disconnecting socket via SocketManager");
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isInitialized = false;
    this.connectionPromise = null;
    this.listeners.clear();
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Singleton instance
const socketManager = new SocketManager();

export default socketManager;
