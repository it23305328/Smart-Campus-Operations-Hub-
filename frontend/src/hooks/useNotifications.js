import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useAuth } from '../context/AuthContext';

const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const stompClientRef = useRef(null);

    useEffect(() => {
        if (!user || !user.email) return;

        const socket = new SockJS('http://localhost:8083/ws');
        const stompClient = Stomp.over(socket);
        stompClientRef.current = stompClient;

        // Disable stomp logging in production if needed
        // stompClient.debug = () => {};

        stompClient.connect({}, (frame) => {
            console.log('Connected to Notification WebSocket');
            
            // Subscribe to user-specific notification queue
            // Spring's /user prefix maps to the authenticated user's session
            stompClient.subscribe(`/user/queue/notifications`, (message) => {
                const newNotification = JSON.parse(message.body);
                console.log('Received real-time notification:', newNotification);
                
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
        }, (error) => {
            console.error('WebSocket Connection Error:', error);
            // Optional: Implement reconnection logic here
        });

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.disconnect(() => {
                    console.log('Disconnected from Notification WebSocket');
                });
            }
        };
    }, [user?.email]);

    const markAllAsRead = () => {
        setUnreadCount(0);
        // Note: You should also call an API to mark them as read in DB if needed
    };

    return { 
        notifications, 
        unreadCount, 
        clearUnread: markAllAsRead,
        isConnected: !!stompClientRef.current?.connected
    };
};

export default useNotifications;
