import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle, UserPlus, DollarSign } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { fetchReceivedCollaborationRequests, updateCollaborationRequestStatus } from '../../services/collaborationService';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || user.role !== 'entrepreneur') {
        setLoading(false);
        return;
      }

      try {
        const requests = await fetchReceivedCollaborationRequests();
        
        // Transform requests into notifications
        const notifs = requests.map(req => ({
          id: req.id,
          type: 'collaboration',
          investorId: req.investorId,
          investor: req.investor,
          content: `is interested in learning more about your startup`,
          time: new Date(req.createdAt),
          unread: req.status === 'pending',
          status: req.status,
          message: req.message
        }));

        setNotifications(notifs.sort((a, b) => b.time.getTime() - a.time.getTime()));
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);
  
  const handleAcceptRequest = async (notificationId: string) => {
    try {
      await updateCollaborationRequestStatus(notificationId, 'accepted');
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, status: 'accepted', unread: false } : n)
      );
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  const handleRejectRequest = async (notificationId: string) => {
    try {
      await updateCollaborationRequestStatus(notificationId, 'rejected');
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, status: 'rejected', unread: false } : n)
      );
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'collaboration':
        return <DollarSign size={16} className="text-accent-600" />;
      case 'message':
        return <MessageCircle size={16} className="text-primary-600" />;
      case 'connection':
        return <UserPlus size={16} className="text-secondary-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Investment inquiries and collaboration requests</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading notifications...</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map(notification => (
            <Card
              key={notification.id}
              className={`transition-colors duration-200 ${
                notification.unread ? 'bg-accent-50 border-accent-200' : ''
              }`}
            >
              <CardBody className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <Avatar
                      src={notification.investor?.avatarUrl}
                      alt={notification.investor?.name}
                      size="md"
                      className="flex-shrink-0 mr-4"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">
                          {notification.investor?.name}
                        </span>
                        {notification.unread && (
                          <Badge variant="accent" size="sm" rounded>New</Badge>
                        )}
                        <Badge variant="secondary" size="sm">
                          {getNotificationIcon(notification.type)}
                          <span className="ml-1">Investor</span>
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mt-1">
                        {notification.content}
                      </p>

                      {notification.message && (
                        <p className="text-sm text-gray-500 mt-2 italic">
                          "{notification.message}"
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTime(notification.time)}
                      </p>
                    </div>
                  </div>

                  {notification.status === 'pending' && (
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(notification.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(notification.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-12">
            <Bell size={32} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
            <p className="text-gray-600 mt-2">When investors show interest in your startup, you'll see it here</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};