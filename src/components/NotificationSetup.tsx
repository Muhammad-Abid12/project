import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Snackbar, Alert, Button } from '@mui/material';

export const NotificationSetup = () => {
  const { user } = useAuth();
  const [notificationStatus, setNotificationStatus] = useState<'idle' | 'denied' | 'granted'>('idle');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return;
    }

    // Check permission status
    if (Notification.permission === 'denied') {
      setNotificationStatus('denied');
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationStatus('granted');
      subscribeToNotifications();
      return;
    }

    // Show prompt if permission not yet requested
    if (Notification.permission === 'default') {
      setShowPrompt(true);
    }
  }, [user]);

  const subscribeToNotifications = () => {
    if (!user) return;

    // Listen to forum_notifications table for new messages
    const channel = supabase
      .channel('forum-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_notifications',
        },
        (payload) => {
          const notification = payload.new;

          // Don't show notification for own messages
          if (notification.author_id === user.id) {
            return;
          }

          // Show desktop notification
          showDesktopNotification(notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const showDesktopNotification = async (notification: any) => {
    if (Notification.permission !== 'granted') return;

    // Get author details
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', notification.author_id)
      .single();

    const authorName = profile?.full_name || 'Someone';
    const messagePreview = notification.content.substring(0, 100);

    // Create notification
    const notif = new Notification(`New message from ${authorName}`, {
      body: messagePreview,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: `forum-${notification.forum_id}`,
      requireInteraction: false,
    });

    // Handle click
    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => notif.close(), 5000);
  };

  const handleEnableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        setNotificationStatus('granted');
        setShowPrompt(false);
        subscribeToNotifications();
      } else {
        setNotificationStatus('denied');
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  return (
    <>
      <Snackbar
        open={showPrompt}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          action={
            <>
              <Button color="inherit" size="small" onClick={handleEnableNotifications}>
                Enable
              </Button>
              <Button color="inherit" size="small" onClick={() => setShowPrompt(false)}>
                Later
              </Button>
            </>
          }
        >
          Enable notifications to get updates when someone posts in forums
        </Alert>
      </Snackbar>

      <Snackbar
        open={notificationStatus === 'denied'}
        autoHideDuration={6000}
        onClose={() => setNotificationStatus('idle')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setNotificationStatus('idle')}>
          Notifications blocked. Please enable them in your browser settings.
        </Alert>
      </Snackbar>
    </>
  );
};