'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RefreshCw, Users, Shield, Crown, UserCog, Mail, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  emailVerified: boolean;
  createdAt: string;
  _count?: {
    startups: number;
  };
}

interface UsersData {
  users: User[];
  stats: {
    total: number;
    byRole: {
      USER: number;
      MODERATOR: number;
      ADMIN: number;
      SUPER_ADMIN: number;
    };
  };
}

const ROLE_COLORS = {
  USER: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  MODERATOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  SUPER_ADMIN: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const ROLE_ICONS = {
  USER: Users,
  MODERATOR: Shield,
  ADMIN: UserCog,
  SUPER_ADMIN: Crown,
};

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const fetchedData = await response.json();
        setData(fetchedData);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users. Please check your permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    setUpdating(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user role');
      }

      alert('User role updated successfully!');
      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      alert(error.message || 'Failed to update user role. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Failed to load users.</p>
        </CardContent>
      </Card>
    );
  }

  // Filter users
  const filteredUsers = data.users.filter((user) => {
    const matchesSearch =
      searchTerm === '' ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.total}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <UserCog className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.byRole.ADMIN}</div>
            <p className="text-xs text-muted-foreground">Admin users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderators</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.byRole.MODERATOR}</div>
            <p className="text-xs text-muted-foreground">Moderator users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.byRole.SUPER_ADMIN}</div>
            <p className="text-xs text-muted-foreground">Super admin users</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="MODERATOR">Moderator</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your criteria.
              </div>
            ) : (
              filteredUsers.map((user) => {
                const RoleIcon = ROLE_ICONS[user.role];
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
                        <AvatarFallback>
                          {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{user.name || 'No name'}</p>
                          <Badge className={ROLE_COLORS[user.role]}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {user.role}
                          </Badge>
                          {user.emailVerified && (
                            <Badge variant="outline" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                          {user._count && (
                            <span className="flex items-center gap-1">
                              {user._count.startups} startup(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="MODERATOR">Moderator</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="border-yellow-600">
        <CardHeader>
          <CardTitle className="text-yellow-600">⚠️ Important</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Only SUPER_ADMIN users can access this page</li>
            <li>Changing a user to SUPER_ADMIN gives them full system access</li>
            <li>ADMIN users can manage featured startups but not users</li>
            <li>MODERATOR users can moderate content (future feature)</li>
            <li>Be careful when modifying user roles - changes take effect immediately</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
