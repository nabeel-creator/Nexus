import React, { useState, useEffect } from 'react';
import { Search, Filter, DollarSign, TrendingUp, Users, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { fetchSentCollaborationRequests } from '../../services/collaborationService';

export const DealsPage: React.FC = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDeals = async () => {
      if (!user || user.role !== 'investor') {
        setLoading(false);
        return;
      }

      try {
        const requests = await fetchSentCollaborationRequests();
        
        // Transform collaboration requests into deals
        const dealsData = requests.map((req: any) => ({
          id: req.id,
          startup: {
            name: req.entrepreneur?.name || 'Unknown',
            logo: req.entrepreneur?.avatarUrl,
            industry: 'Technology'
          },
          entrepreneur: req.entrepreneur,
          amount: 'TBD',
          equity: 'To be negotiated',
          status: req.status === 'pending' ? 'Pending' : req.status === 'accepted' ? 'Negotiation' : 'Passed',
          stage: 'Early Stage',
          lastActivity: new Date(req.createdAt).toISOString().split('T')[0],
          message: req.message
        }));
        
        setDeals(dealsData);
      } catch (err) {
        console.error('Error fetching deals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [user]);
  
  const statuses = ['Pending', 'Negotiation', 'Passed'];
  
  const toggleStatus = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'accent';
      case 'Negotiation':
        return 'primary';
      case 'Passed':
        return 'error';
      default:
        return 'gray';
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = searchQuery === '' || 
      deal.startup.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(deal.status);
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Pipeline</h1>
          <p className="text-gray-600">Track collaboration requests and investment opportunities</p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg mr-3">
                <Users size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Startups</p>
                <h3 className="text-2xl font-bold text-gray-900">{deals.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-lg mr-3">
                <Clock size={20} className="text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {deals.filter(d => d.status === 'Pending').length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-lg mr-3">
                <CheckCircle size={20} className="text-success-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {deals.filter(d => d.status === 'Negotiation').length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search startups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search size={18} />}
            fullWidth
          />
        </div>
        
        <div className="flex gap-2">
          {statuses.map(status => (
            <Badge
              key={status}
              variant={selectedStatus.includes(status) ? getStatusColor(status) : 'gray'}
              className="cursor-pointer"
              onClick={() => toggleStatus(status)}
            >
              {status}
            </Badge>
          ))}
        </div>
      </div>

      {/* Deals List */}
      {loading ? (
        <div className="text-center py-8">Loading deals...</div>
      ) : filteredDeals.length > 0 ? (
        <div className="space-y-4">
          {filteredDeals.map(deal => (
            <Card key={deal.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar
                      src={deal.startup.logo}
                      alt={deal.startup.name}
                      size="lg"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{deal.startup.name}</h3>
                        <Badge variant={getStatusColor(deal.status)} size="sm">
                          {deal.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{deal.message}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Stage:</span>
                          <span className="ml-1 font-medium text-gray-900">{deal.stage}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Equity:</span>
                          <span className="ml-1 font-medium text-gray-900">{deal.equity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Activity:</span>
                          <span className="ml-1 font-medium text-gray-900">{deal.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to chat or profile
                        window.location.href = `/profile/entrepreneur/${deal.entrepreneur.id}`;
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-12">
            <Users size={32} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">No deals yet</h3>
            <p className="text-gray-600 mt-2">Start by sending collaboration requests to entrepreneurs</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};