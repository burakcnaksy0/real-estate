import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
    private client: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private isConnected: boolean = false;
    private pendingSubscriptions: Array<{ destination: string; callback: (message: any) => void }> = [];

    connect() {
        if (this.client?.active) {
            return; // Already connected
        }

        this.client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                console.log('✅ WebSocket connected');
                this.isConnected = true;

                // Process pending subscriptions
                this.pendingSubscriptions.forEach(({ destination, callback }) => {
                    this.doSubscribe(destination, callback);
                });
                this.pendingSubscriptions = [];
            },
            onDisconnect: () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.activate();
    }

    private doSubscribe(destination: string, callback: (message: any) => void): StompSubscription | null {
        if (!this.client?.active) {
            return null;
        }

        // Unsubscribe if already subscribed
        if (this.subscriptions.has(destination)) {
            this.subscriptions.get(destination)?.unsubscribe();
        }

        const subscription = this.client.subscribe(destination, (message) => {
            try {
                const data = JSON.parse(message.body);
                console.log(' WebSocket message received:', data);
                callback(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });

        this.subscriptions.set(destination, subscription);
        console.log('🔔 Subscribed to:', destination);
        return subscription;
    }

    subscribe(destination: string, callback: (message: any) => void): StompSubscription | null {
        if (!this.isConnected) {
            console.log('WebSocket not connected yet, queuing subscription:', destination);
            // Queue the subscription to be processed when connected
            this.pendingSubscriptions.push({ destination, callback });
            return null;
        }

        return this.doSubscribe(destination, callback);
    }

    unsubscribe(destination: string) {
        const subscription = this.subscriptions.get(destination);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
            console.log('Unsubscribed from:', destination);
        }
    }

    disconnect() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions.clear();
        this.pendingSubscriptions = [];
        this.isConnected = false;

        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
    }
}

export const websocketService = new WebSocketService();
