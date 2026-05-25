import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Globe, Palette, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';

const parseCommaList = (value: string) =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/users/profile/${user.id}`);
        const data = await response.json();

        if (response.ok) {
          setProfileData({
            name: data.name || user.name,
            email: data.email || user.email,
            bio: data.bio || '',
            startupName: data.startupName || '',
            industry: data.industry || '',
            location: data.location || '',
            foundedYear: data.foundedYear || '',
            teamSize: data.teamSize || 1,
            pitchSummary: data.pitchSummary || '',
            fundingNeeded: data.fundingNeeded || '',
            investmentFocus: data.investmentFocus || '',
            portfolioSize: data.portfolioSize || 0,
            typicalTicketSize: data.typicalTicketSize || '',
            investmentInterests: (data.investmentInterests || []).join(', '),
            investmentStage: (data.investmentStage || []).join(', '),
            portfolioCompanies: (data.portfolioCompanies || []).join(', '),
            totalInvestments: data.totalInvestments || 0,
            minimumInvestment: data.minimumInvestment || '',
            maximumInvestment: data.maximumInvestment || ''
          });
        }
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="p-6">Loading profile...</div>;

  const handleCancel = () => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/users/profile/${user.id}`)
      .then(response => response.json())
      .then(data => {
        setProfileData({
          name: data.name || user.name,
          email: data.email || user.email,
          bio: data.bio || '',
          startupName: data.startupName || '',
          industry: data.industry || '',
          location: data.location || '',
          foundedYear: data.foundedYear || '',
          teamSize: data.teamSize || 1,
          pitchSummary: data.pitchSummary || '',
          fundingNeeded: data.fundingNeeded || '',
          investmentFocus: data.investmentFocus || '',
          portfolioSize: data.portfolioSize || 0,
          typicalTicketSize: data.typicalTicketSize || '',
          investmentInterests: (data.investmentInterests || []).join(', '),
          investmentStage: (data.investmentStage || []).join(', '),
          portfolioCompanies: (data.portfolioCompanies || []).join(', '),
          totalInvestments: data.totalInvestments || 0,
          minimumInvestment: data.minimumInvestment || '',
          maximumInvestment: data.maximumInvestment || ''
        });
      })
      .catch(error => console.error('Failed to reload profile', error))
      .finally(() => setLoading(false));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);

    try {
      const [firstName, ...rest] = (profileData.name || '').trim().split(' ');
      const lastName = rest.join(' ');
      const updates: Record<string, any> = {
        firstName,
        lastName,
        bio: profileData.bio,
        location: profileData.location,
      };

      if (user.role === 'entrepreneur') {
        updates.startupName = profileData.startupName;
        updates.industry = profileData.industry;
        updates.foundedYear = Number(profileData.foundedYear) || '';
        updates.teamSize = Number(profileData.teamSize) || 1;
        updates.pitchSummary = profileData.pitchSummary;
        updates.fundingNeeded = profileData.fundingNeeded;
      }

      if (user.role === 'investor') {
        updates.investmentFocus = profileData.investmentFocus;
        updates.portfolioSize = Number(profileData.portfolioSize) || 0;
        updates.typicalTicketSize = profileData.typicalTicketSize;
        updates.investmentInterests = parseCommaList(profileData.investmentInterests || '');
        updates.investmentStage = parseCommaList(profileData.investmentStage || '');
        updates.portfolioCompanies = parseCommaList(profileData.portfolioCompanies || '');
        updates.totalInvestments = Number(profileData.totalInvestments) || 0;
        updates.minimumInvestment = profileData.minimumInvestment;
        updates.maximumInvestment = profileData.maximumInvestment;
      }

      await updateProfile(user.id, updates);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
        <Card className="lg:col-span-1">
          <CardBody className="p-2">
            <nav className="space-y-1">
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-md">
                <User size={18} className="mr-3" />
                Profile
              </button>
              
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Lock size={18} className="mr-3" />
                Security
              </button>
              
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Bell size={18} className="mr-3" />
                Notifications
              </button>
              
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Globe size={18} className="mr-3" />
                Language
              </button>
              
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Palette size={18} className="mr-3" />
                Appearance
              </button>
              
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <CreditCard size={18} className="mr-3" />
                Billing
              </button>
            </nav>
          </CardBody>
        </Card>
        
        {/* Main settings content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar
                  src={user.avatarUrl}
                  alt={user.name}
                  size="xl"
                />
                
                <div>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                  <p className="mt-2 text-sm text-gray-500">
                    JPG, GIF or PNG. Max size of 800K
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={profileData.name || ''}
                  onChange={handleChange}
                />
                
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email || ''}
                  disabled
                />
                
                <Input
                  label="Role"
                  value={user.role}
                  disabled
                />
                
                <Input
                  label="Location"
                  name="location"
                  value={profileData.location || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows={4}
                  value={profileData.bio || ''}
                  onChange={handleChange}
                />
              </div>
              
              {user.role === 'entrepreneur' && (
                <div className="space-y-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-base font-semibold text-gray-900">Entrepreneur Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Startup Name"
                      name="startupName"
                      value={profileData.startupName || ''}
                      onChange={handleChange}
                    />
                    <Input
                      label="Industry"
                      name="industry"
                      value={profileData.industry || ''}
                      onChange={handleChange}
                    />
                    <Input
                      label="Founded Year"
                      name="foundedYear"
                      type="number"
                      value={profileData.foundedYear || ''}
                      onChange={handleChange}
                    />
                    <Input
                      label="Team Size"
                      name="teamSize"
                      type="number"
                      value={profileData.teamSize || ''}
                      onChange={handleChange}
                    />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pitch Summary</label>
                      <textarea
                        name="pitchSummary"
                        className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        rows={4}
                        value={profileData.pitchSummary || ''}
                        onChange={handleChange}
                      />
                    </div>
                    <Input
                      label="Funding Needed"
                      name="fundingNeeded"
                      value={profileData.fundingNeeded || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {user.role === 'investor' && (
                <div className="space-y-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-base font-semibold text-gray-900">Investor Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Investment Focus"
                      name="investmentFocus"
                      value={profileData.investmentFocus || ''}
                      onChange={handleChange}
                    />
                    <Input
                      label="Portfolio Size"
                      name="portfolioSize"
                      type="number"
                      value={profileData.portfolioSize || ''}
                      onChange={handleChange}
                    />
                    <Input
                      label="Typical Ticket Size"
                      name="typicalTicketSize"
                      value={profileData.typicalTicketSize || ''}
                      onChange={handleChange}
                    />
                    <Input
                      label="Total Investments"
                      name="totalInvestments"
                      type="number"
                      value={profileData.totalInvestments || ''}
                      onChange={handleChange}
                    />
                    <Input
                      label="Minimum Investment"
                      name="minimumInvestment"
                      value={profileData.minimumInvestment || ''}
                      onChange={handleChange}
                    />
                    <Input
                      label="Maximum Investment"
                      name="maximumInvestment"
                      value={profileData.maximumInvestment || ''}
                      onChange={handleChange}
                    />
                    <div className="md:col-span-2">
                      <Input
                        label="Investment Interests"
                        name="investmentInterests"
                        value={profileData.investmentInterests || ''}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Investment Stage"
                        name="investmentStage"
                        value={profileData.investmentStage || ''}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Portfolio Companies"
                        name="portfolioCompanies"
                        value={profileData.portfolioCompanies || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancel} disabled={saving}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardBody>
          </Card>
          
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                    <Badge variant="error" className="mt-1">Not Enabled</Badge>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                  />
                  
                  <Input
                    label="New Password"
                    type="password"
                  />
                  
                  <Input
                    label="Confirm New Password"
                    type="password"
                  />
                  
                  <div className="flex justify-end">
                    <Button>Update Password</Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};