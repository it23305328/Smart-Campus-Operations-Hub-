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
        
        stompClient.debug = null; // Disable noisy debug logs

        stompClient.connect({}, (frame) => {
            console.log('Connected to WebSocket');
            
            // Subscribe to user-specific notification queue
            const subscription = stompClient.subscribe(`/user/queue/notifications`, (message) => {
                const newNotification = JSON.parse(message.body);
                console.log("New notification received via WebSocket:", newNotification);
                setNotifications(prev => {
                    // Check for duplicate ID to be safe
                    if (prev.some(n => n.id === newNotification.id)) return prev;
                    return [newNotification, ...prev];
                });
                setUnreadCount(prev => prev + 1);
            });

            return () => {
                if (subscription) subscription.unsubscribe();
            };
        }, (error) => {
            console.error('WebSocket connection error:', error);
        });

        // Cleanup on unmount
        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect(() => {
                    console.log('Disconnected from WebSocket');
                });
            }
        };
    }, [user]);

    // Initial fetch of notifications
    useEffect(() => {
        if (!user || !user.email) return;

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

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/api/notifications/${notificationId}/read`);
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = () => {
        setUnreadCount(0);
        // Add API call for mark all if needed
    };

    return { 
        notifications, 
        unreadCount, 
        markAsRead,
        clearUnread: markAllAsRead,
        isConnected: !!stompClientRef.current?.connected
    };
};

export default useNotifications;
