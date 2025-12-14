import NetInfo from "@react-native-community/netinfo";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_CONFIG } from '../config/api.config';

const WS_URL_DEV = `${API_CONFIG.BASE_URL}/ws-sockjs`;
const WS_URL_PROD = `${API_CONFIG.BASE_URL}/ws`;
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
  private _isConnected = false; // ✅ Cache trạng thái kết nối

  constructor() {
    console.log("🔌 WebSocketService initialized | URL:", WS_URL);
  }

  // === KẾT NỐI ===
  connect(userId: string, accessToken: string): Promise<void> {
    // ✅ Nếu đang kết nối, trả về promise hiện tại
    if (this.isConnecting && this.connectPromise) {
      console.log("Connection already in progress...");
      return this.connectPromise;
    }

    // ✅ Nếu đã kết nối thành công với cùng user
    if (this._isConnected && this.userId === userId) {
      console.log("Already connected with same user");
      return Promise.resolve();
    }

    // ✅ Nếu đang kết nối với user khác, disconnect trước
    if (this._isConnected && this.userId !== userId) {
      console.log("Switching user, disconnect first");
      this.disconnect();
    }

    this.isConnecting = true;
    this.userId = userId;
    this.accessToken = accessToken;

    this.connectPromise = new Promise((resolve, reject) => {
      console.log("Connecting via SockJS ", WS_URL);

      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        connectHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
        debug: (str) => {
          if (__DEV__) {
            if (str.includes("CONNECT") || str.includes("ERROR") || str.includes("CONNECTED")) {
              console.log("STOMP:", str);
            }
          }
        },
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        reconnectDelay: 0,

        onConnect: () => {
          console.log("SOCKJS + STOMP CONNECTED!");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.connectPromise = null;
          this._isConnected = true;

          this.emit("connectionStatusChange", true);

          this.setupSubscriptions();
          this.startNetworkListener();

          resolve();
        },

        onStompError: (frame) => {
          const errorMsg = frame.headers["message"] || frame.body || "STOMP error";
          console.log("STOMP ERROR:", errorMsg);
          this.isConnecting = false;
          this.connectPromise = null;
          this._isConnected = false;

          this.emit("connectionStatusChange", false);

          if (errorMsg.includes("TOKEN_EXPIRED") || errorMsg.includes("Unauthorized")) {
            console.log("Token expired detected");
            this.emit("TOKEN_EXPIRED", {});
            return; 
          }

          // Tự động reconnect cho các lỗi khác
          this.scheduleReconnect();

          reject(new Error(errorMsg));
        },

        onWebSocketError: (error) => {
          console.log("SOCKJS ERROR:", error);
          this.isConnecting = false;
          this.connectPromise = null;
          this._isConnected = false;

          this.emit("connectionStatusChange", false);

          reject(error);
        },

        onWebSocketClose: (event) => {
          console.log("SOCKJS CLOSED:", event?.code, event?.reason);
          this.isConnecting = false;
          this.connectPromise = null;
          this._isConnected = false;

          this.emit("connectionStatusChange", false);

          // Chỉ reconnect nếu:
          // - Có userId và token (chưa logout)
          // - Không phải lỗi token expired
          // - Code không phải 1000 (normal closure)
          if (this.userId && this.accessToken && event?.code !== 1000) {
            this.scheduleReconnect();
          }
        },
      });

      try {
        this.client.activate();
      } catch (error) {
        console.log("Failed to activate client:", error);
        this.isConnecting = false;
        this.connectPromise = null;
        this._isConnected = false;
        this.emit("connectionStatusChange", false);
        reject(error);
      }
    });

    return this.connectPromise;
  }

  // === TỰ ĐỘNG RECONNECT ===
  private scheduleReconnect() {
    // Clear timer cũ
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Kiểm tra điều kiện reconnect
    if (!this.userId || !this.accessToken) {
      console.log(" No credentials, skip reconnect");
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(" Max reconnect attempts reached");
      this.emit("MAX_RECONNECT_FAILED", {});
      return;
    }

    //  Exponential backoff
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30s
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      if (this.userId && this.accessToken && !this._isConnected) {
        this.reconnectAttempts++;
        this.connect(this.userId, this.accessToken).catch(err => {
          console.log(" Reconnect failed:", err.message);
        });
      }
    }, delay);
  }

  // === NGHE MẠNG ===
  private startNetworkListener() {
    if (this.networkListenerUnsubscribe) {
      console.log(" Network listener already active");
      return;
    }

    this.networkListenerUnsubscribe = NetInfo.addEventListener(state => {
      console.log(" Network state:", {
        connected: state.isConnected,
        type: state.type,
      });

      //  Khi mạng khôi phục, reconnect nếu chưa connected
      if (state.isConnected && !this._isConnected && this.userId && this.accessToken) {
        console.log(" Network restored → reconnecting...");
        
        //  Reset reconnect attempts khi mạng khôi phục
        this.reconnectAttempts = 0;
        
        //  Delay nhỏ để đảm bảo mạng ổn định
        setTimeout(() => {
          if (!this._isConnected && this.userId && this.accessToken) {
            this.connect(this.userId!, this.accessToken!).catch(err => {
              console.log(" Network reconnect failed:", err.message);
            });
          }
        }, 1000);
      }
    });

    console.log(" Network listener started");
  }

  // === SETUP SUBSCRIPTIONS ===
  private setupSubscriptions() {
    if (!this.client?.connected || !this.userId) {
      console.warn(" Cannot setup subscriptions: not connected or no userId");
      return;
    }

    console.log("📡 Setting up subscriptions for user:", this.userId);

    // Clear subscriptions cũ trước khi tạo mới
    this.subscriptions.forEach((sub, key) => {
      try {
        sub.unsubscribe();
      } catch (e) {
        console.log(" Error unsubscribing old subscription:", key);
      }
    });
    this.subscriptions.clear();

    // 1. Thông báo cá nhân
    this.subscribeOnce(
      `/user/${this.userId}/queue/notifications`,
      "notifications",
      (msg) => {
        try {
          const data = JSON.parse(msg.body);
          console.log(" Notification received:", data.action);
          
          //  Emit event chính
          this.emit("NOTIFICATION", data);

          //  Emit event con theo action
          if (data.action === "NEW") this.emit("NEW_NOTIFICATION", data);
          if (data.action === "READ") this.emit("READ_NOTIFICATION", data);
          if (data.action === "DELETE") this.emit("DELETE_NOTIFICATION", data);
          if (data.action === "READ_ALL") this.emit("READ_ALL_NOTIFICATIONS", data);
        } catch (e) {
          console.log(" Parse notification error:", e);
        }
      }
    );

    // 2. Trạng thái tài khoản
    this.subscribeOnce(
      `/user/${this.userId}/queue/account-status`,
      "account-status",
      (msg) => {
        try {
          const data = JSON.parse(msg.body);
          console.log(" Account status received:", data.type);

          if (data.type === "ACCOUNT_BANNED") {
            this.emit("ACCOUNT_BANNED", data);
          }
        } catch (e) {
          console.log(" Parse account status error:", e);
        }
      }
    );

    // 3.  FOLLOW/UNFOLLOW Updates
    this.subscribeOnce(
      `/user/${this.userId}/queue/follow`,
      "follow-updates",
      (msg) => {
        try {
          const data = JSON.parse(msg.body);
          console.log(" Follow update received:", data.action);

          // Emit event chính
          this.emit("FOLLOW_UPDATE", data);

          //  Emit event con theo action
          if (data.action === "FOLLOW") this.emit("USER_FOLLOWED", data);
          if (data.action === "UNFOLLOW") this.emit("USER_UNFOLLOWED", data);
        } catch (e) {
          console.log(" Parse follow update error:", e);
        }
      }
    );

    // 4. Re-subscribe các recipe đang chờ
    if (this.pendingSubscriptions.size > 0) {
      console.log(" Re-subscribing to pending recipes:", Array.from(this.pendingSubscriptions));
      const pending = Array.from(this.pendingSubscriptions);
      this.pendingSubscriptions.clear();
      
      pending.forEach(recipeId => {
        this.subscribeToRecipeComments(recipeId);
      });
    }

    console.log(" All subscriptions setup complete");
  }

  // === SUBSCRIBE CHUNG ===
  private subscribeOnce(destination: string, key: string, callback: (msg: IMessage) => void) {
    //  Kiểm tra đã subscribe chưa
    if (this.subscriptions.has(key)) {
      console.log(" Already subscribed:", key);
      return;
    }

    //  Kiểm tra kết nối
    if (!this.client?.connected) {
      console.warn(" Not connected → cannot subscribe:", key);
      return;
    }

    try {
      const sub = this.client.subscribe(destination, callback);
      this.subscriptions.set(key, sub);
      console.log(" Subscribed:", destination);
    } catch (e) {
      console.log(" Subscribe failed:", key, e);
    }
  }

  // === COMMENT THEO RECIPE ===
  subscribeToRecipeComments(recipeId: string) {
    const topic = `/topic/recipe/${recipeId}/comments`;
    const key = `recipe_${recipeId}`;

    // Kiểm tra đã subscribe
    if (this.subscriptions.has(key)) {
      console.log(" Already subscribed to recipe:", recipeId);
      return;
    }

    // Nếu chưa connected, lưu vào pending
    if (!this._isConnected) {
      console.warn(" Not connected → queuing recipe subscription:", recipeId);
      this.pendingSubscriptions.add(recipeId);
      return;
    }

    this.subscribeOnce(topic, key, (msg) => {
      try {
        const data = JSON.parse(msg.body);
        console.log(" Comment update:", data.action, "on recipe:", recipeId);
        
        //  Emit với recipeId
        this.emit("COMMENT_UPDATE", { recipeId, ...data });

        if (data.action === "CREATE") this.emit("NEW_COMMENT", data);
        if (data.action === "UPDATE") this.emit("UPDATE_COMMENT", data);
        if (data.action === "DELETE") this.emit("DELETE_COMMENT", data);
      } catch (e) {
        console.log(" Parse comment error:", e);
      }
    });
  }

  unsubscribeFromRecipeComments(recipeId: string) {
    const key = `recipe_${recipeId}`;
    const sub = this.subscriptions.get(key);
    
    if (sub) {
      try {
        sub.unsubscribe();
        this.subscriptions.delete(key);
        this.pendingSubscriptions.delete(recipeId);
        console.log(" Unsubscribed from recipe:", recipeId);
      } catch (e) {
        console.log(" Error unsubscribing from recipe:", recipeId, e);
      }
    }
  }

  // === EVENT SYSTEM ===
  on(event: string, callback: EventCallback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    const listeners = this.eventListeners.get(event)!;
    
    //  Tránh duplicate listeners
    if (listeners.includes(callback)) {
      console.log(` Listener already registered for: ${event}`);
      return;
    }
    
    listeners.push(callback);
    console.log(` Registered listener for: ${event} (total: ${listeners.length})`);
  }

  off(event: string, callback: EventCallback) {
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;

    const idx = listeners.indexOf(callback);
    if (idx > -1) {
      listeners.splice(idx, 1);
      console.log(` Removed listener for: ${event} (remaining: ${listeners.length})`);
      
      //  Cleanup map nếu không còn listeners
      if (listeners.length === 0) {
        this.eventListeners.delete(event);
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    
    if (!listeners || listeners.length === 0) {
      //  Chỉ log cho các event quan trọng
      if (["connectionStatusChange", "TOKEN_EXPIRED", "ACCOUNT_BANNED"].includes(event)) {
        console.log(` No listeners for important event: ${event}`);
      }
      return;
    }

    console.log(` Emitting ${event} to ${listeners.length} listener(s)`);
    
    //  Clone array để tránh issues khi listener modify array
    [...listeners].forEach((cb, i) => {
      try {
        cb(data);
      } catch (e) {
        console.log(` Error in listener ${i} for ${event}:`, e);
      }
    });
  }

  // === NGẮT KẾT NỐI ===
  disconnect() {
    console.log("🔌 Disconnecting WebSocket...");

    //  Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Unsubscribe tất cả
    this.subscriptions.forEach((sub, key) => {
      try {
        sub.unsubscribe();
        console.log(" Unsubscribed:", key);
      } catch (e) {
        console.log(" Error unsubscribing:", key);
      }
    });
    this.subscriptions.clear();
    this.pendingSubscriptions.clear();

    //  Stop network listener
    if (this.networkListenerUnsubscribe) {
      this.networkListenerUnsubscribe();
      this.networkListenerUnsubscribe = null;
    }

    //  Deactivate client
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {
        console.log(" Error deactivating client:", e);
      }
      this.client = null;
    }

    //  Reset state
    this.userId = null;
    this.accessToken = null;
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.connectPromise = null;
    this._isConnected = false;

    //  Emit disconnected
    this.emit("connectionStatusChange", false);
    
    console.log("✅ WebSocket fully disconnected");
  }

  // === TRẠNG THÁI ===
  isConnected(): boolean {
    //  Sử dụng cached state thay vì check client mỗi lần
    return this._isConnected;
  }

  getConnectionStatus(): "connected" | "connecting" | "disconnected" {
    if (this._isConnected) return "connected";
    if (this.isConnecting) return "connecting";
    return "disconnected";
  }

  //  Debug info
  getDebugInfo() {
    return {
      isConnected: this._isConnected,
      isConnecting: this.isConnecting,
      userId: this.userId,
      hasToken: !!this.accessToken,
      subscriptions: Array.from(this.subscriptions.keys()),
      pendingSubscriptions: Array.from(this.pendingSubscriptions),
      reconnectAttempts: this.reconnectAttempts,
      listeners: Object.fromEntries(
        Array.from(this.eventListeners.entries()).map(([key, val]) => [key, val.length])
      ),
    };
  }
}
const websocketService = new WebSocketService();
export default websocketService;