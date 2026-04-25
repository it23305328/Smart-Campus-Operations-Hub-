import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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
            stompClient.subscribe(`/user/queue/notifications`, (message) => {
                const newNotification = JSON.parse(message.body);
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
        }, (error) => {
            console.error('WebSocket Connection Error:', error);
        });

        // Initial fetch of notifications
        const fetchInitialNotifications = async () => {
            try {
                const response = await api.get('/api/notifications');
                setNotifications(response.data);
                setUnreadCount(response.data.filter(n => !n.isRead).length);
            } catch (err) {
                console.error('Failed to fetch initial notifications:', err);
            }
        };

        fetchInitialNotifications();

        return () => {
            if (stompClientRef.current && stompClientRef.current.connected) {
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
