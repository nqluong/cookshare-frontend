// services/websocketService.ts - FIXED VERSION
import NetInfo from "@react-native-community/netinfo";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// === CẤU HÌNH URL ===
// const WS_URL_DEV = `${API_CONFIG}/ws-sockjs`;
const WS_URL_DEV = "https://cookshare-app.io.vn/ws-sockjs";
const WS_URL_PROD = "https://cookshare-app.io.vn/ws";
const WS_URL = __DEV__ ? WS_URL_DEV : WS_URL_PROD;

type EventCallback = (data: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private eventListeners: Map<string, EventCallback[]> = new Map();
  private userId: string | null = null;
  private accessToken: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 3000;
  private isConnecting = false;
  private connectPromise: Promise<void> | null = null;
  private pendingSubscriptions: Set<string> = new Set();
  private networkListenerUnsubscribe: (() => void) | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    console.log("🔌 WebSocketService initialized | URL:", WS_URL);
  }

  // === KẾT NỐI ===
  connect(userId: string, accessToken: string): Promise<void> {
    // ✅ Nếu đang kết nối, trả về promise hiện tại
    if (this.isConnecting && this.connectPromise) {
      console.log("⏳ Connection already in progress...");
      return this.connectPromise;
    }

    // ✅ Nếu đã kết nối thành công
    if (this.client?.connected) {
      console.log("✅ Already connected");
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.userId = userId;
    this.accessToken = accessToken;

    this.connectPromise = new Promise((resolve, reject) => {
      console.log("🔄 Connecting via SockJS →", WS_URL);

      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        connectHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
        debug: (str) => {
          if (__DEV__) {
            if (str.includes("CONNECT") || str.includes("ERROR") || str.includes("CONNECTED")) {
              console.log("📡 STOMP:", str);
            }
          }
        },
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        reconnectDelay: 0, // ❌ Tắt auto-reconnect của STOMP, ta tự xử lý

        onConnect: () => {
          console.log("✅ SOCKJS + STOMP CONNECTED!");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.connectPromise = null;

          // ✅ QUAN TRỌNG: Emit event ngay khi kết nối thành công
          this.emit("connectionStatusChange", true);

          this.setupSubscriptions();
          this.startNetworkListener();

          resolve();
        },

        onStompError: (frame) => {
          const errorMsg = frame.headers["message"] || frame.body || "STOMP error";
          console.error("❌ STOMP ERROR:", errorMsg);
          this.isConnecting = false;
          this.connectPromise = null;

          this.emit("connectionStatusChange", false);

          // ✅ Tự động reconnect
          this.scheduleReconnect();

          reject(new Error(errorMsg));
        },

        onWebSocketError: (error) => {
          console.error("❌ SOCKJS ERROR:", error);
          this.isConnecting = false;
          this.connectPromise = null;

          this.emit("connectionStatusChange", false);

          reject(error);
        },

        onWebSocketClose: (event) => {
          console.log("🔌 SOCKJS CLOSED:", event?.code, event?.reason);
          this.isConnecting = false;
          this.connectPromise = null;

          // ✅ Emit disconnected
          this.emit("connectionStatusChange", false);

          // ✅ Tự động reconnect nếu không phải logout
          if (this.userId && this.accessToken) {
            this.scheduleReconnect();
          }
        },
      });

      try {
        this.client.activate();
      } catch (error) {
        console.error("❌ Failed to activate client:", error);
        this.isConnecting = false;
        this.connectPromise = null;
        this.emit("connectionStatusChange", false);
        reject(error);
      }
    });

    return this.connectPromise;
  }

  // === TỰ ĐỘNG RECONNECT ===
  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("❌ Max reconnect attempts reached");
      return;
    }

    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30s
    );

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      if (this.userId && this.accessToken && !this.client?.connected) {
        this.reconnectAttempts++;
        this.connect(this.userId, this.accessToken).catch(err => {
          console.error("Reconnect failed:", err);
        });
      }
    }, delay);
  }

  // === NGHE MẠNG ===
  private startNetworkListener() {
    if (this.networkListenerUnsubscribe) return;

    this.networkListenerUnsubscribe = NetInfo.addEventListener(state => {
      console.log("📱 Network state:", state.isConnected);

      if (state.isConnected && !this.client?.connected && this.userId && this.accessToken) {
        console.log("🌐 Network restored → reconnecting...");
        setTimeout(() => {
          this.connect(this.userId!, this.accessToken!).catch(err => {
            console.error("Network reconnect failed:", err);
          });
        }, 1000);
      }
    });
  }

  // === SETUP SUBSCRIPTIONS ===
  private setupSubscriptions() {
    if (!this.client?.connected || !this.userId) {
      console.warn("⚠️ Cannot setup subscriptions: not connected or no userId");
      return;
    }

    console.log("📡 Setting up subscriptions for user:", this.userId);

    // 1. Thông báo cá nhân
    this.subscribeOnce(
      `/user/${this.userId}/queue/notifications`,
      "notifications",
      (msg) => {
        try {
          const data = JSON.parse(msg.body);
          console.log("🔔 Received notification:", data);
          this.emit("NOTIFICATION", data);

          if (data.action === "NEW") this.emit("NEW_NOTIFICATION", data);
          if (data.action === "READ") this.emit("READ_NOTIFICATION", data);
          if (data.action === "DELETE") this.emit("DELETE_NOTIFICATION", data);
          if (data.action === "READ_ALL") this.emit("READ_ALL_NOTIFICATIONS", data);
        } catch (e) {
          console.error("❌ Parse notification error:", e);
        }
      }
    );

    // 2. Retry các recipe đang chờ
    if (this.pendingSubscriptions.size > 0) {
      console.log("🔄 Retrying pending subscriptions:", Array.from(this.pendingSubscriptions));
      this.pendingSubscriptions.forEach(recipeId => {
        this.subscribeToRecipeComments(recipeId);
      });
      this.pendingSubscriptions.clear();
    }
  }

  // === SUBSCRIBE CHUNG ===
  private subscribeOnce(destination: string, key: string, callback: (msg: IMessage) => void) {
    if (this.subscriptions.has(key)) {
      console.log("ℹ️ Already subscribed:", key);
      return;
    }

    if (!this.client?.connected) {
      console.warn("⚠️ Not connected → cannot subscribe:", key);
      return;
    }

    try {
      const sub = this.client.subscribe(destination, callback);
      this.subscriptions.set(key, sub);
      console.log("✅ Subscribed:", destination);
    } catch (e) {
      console.error("❌ Subscribe failed:", key, e);
    }
  }

  // === COMMENT THEO RECIPE ===
  subscribeToRecipeComments(recipeId: string) {
    const topic = `/topic/recipe/${recipeId}/comments`;
    const key = `recipe_${recipeId}`;

    if (this.subscriptions.has(key)) {
      console.log("ℹ️ Already subscribed to recipe:", recipeId);
      return;
    }

    if (!this.client?.connected) {
      console.warn("⚠️ Not connected → queuing recipe subscription:", recipeId);
      this.pendingSubscriptions.add(recipeId);
      return;
    }

    this.subscribeOnce(topic, key, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        console.log("💬 Received comment update:", data);
        this.emit("COMMENT_UPDATE", { recipeId, ...data });

        if (data.action === "CREATE") this.emit("NEW_COMMENT", data);
        if (data.action === "UPDATE") this.emit("UPDATE_COMMENT", data);
        if (data.action === "DELETE") this.emit("DELETE_COMMENT", data);
      } catch (e) {
        console.error("❌ Parse comment error:", e);
      }
    });
  }

  unsubscribeFromRecipeComments(recipeId: string) {
    const key = `recipe_${recipeId}`;
    const sub = this.subscriptions.get(key);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(key);
      this.pendingSubscriptions.delete(recipeId);
      console.log("✅ Unsubscribed from recipe:", recipeId);
    }
  }

  // === EVENT SYSTEM ===
  on(event: string, callback: EventCallback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
    console.log(`👂 Registered listener for: ${event} (total: ${this.eventListeners.get(event)!.length})`);
  }

  off(event: string, callback: EventCallback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const idx = listeners.indexOf(callback);
      if (idx > -1) {
        listeners.splice(idx, 1);
        console.log(`🔇 Removed listener for: ${event}`);
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (!listeners?.length) {
      console.log(`📢 No listeners for: ${event}`);
      return;
    }

    console.log(`📢 Emitting ${event} to ${listeners.length} listeners`);
    listeners.forEach((cb, i) => {
      try {
        cb(data);
      } catch (e) {
        console.error(`❌ Error in listener ${i} for ${event}:`, e);
      }
    });
  }

  // === NGẮT KẾT NỐI ===
  disconnect() {
    console.log("🔌 Disconnecting WebSocket...");

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.subscriptions.forEach(sub => {
      try {
        sub.unsubscribe();
      } catch (e) {
        console.error("Error unsubscribing:", e);
      }
    });
    this.subscriptions.clear();
    this.pendingSubscriptions.clear();

    if (this.networkListenerUnsubscribe) {
      this.networkListenerUnsubscribe();
      this.networkListenerUnsubscribe = null;
    }

    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {
        console.error("Error deactivating client:", e);
      }
      this.client = null;
    }

    this.userId = null;
    this.accessToken = null;
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.connectPromise = null;

    this.emit("connectionStatusChange", false);
    console.log("✅ WebSocket disconnected");
  }

  // === TRẠNG THÁI ===
  isConnected(): boolean {
    const connected = this.client?.connected ?? false;
    console.log("🔍 isConnected check:", connected);
    return connected;
  }

  getConnectionStatus(): "connected" | "connecting" | "disconnected" {
    if (this.client?.connected) return "connected";
    if (this.isConnecting) return "connecting";
    return "disconnected";
  }
}

// === EXPORT SINGLETON ===
const websocketService = new WebSocketService();
export default websocketService;