/**
 * Admin Overview Tab Component
 * Displays dashboard statistics and platform health
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const OverviewTab = ({ stats }) => {
    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="card" data-testid="admin-stat-users">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-800">{stats.total_users || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">Registered members</p>
                    </CardContent>
                </Card>

                <Card className="card" data-testid="admin-stat-jobs">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-800">{stats.total_jobs || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">All job postings</p>
                    </CardContent>
                </Card>

                <Card className="card" data-testid="admin-stat-pending">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.pending_jobs || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                    </CardContent>
                </Card>

                <Card className="card" data-testid="admin-stat-applications">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-800">{stats.total_applications || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">Total submissions</p>
                    </CardContent>
                </Card>

                <Card className="card" data-testid="admin-stat-blogs">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Blog Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-800">{stats.total_blogs || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">Articles created</p>
                    </CardContent>
                </Card>

                <Card className="card" data-testid="admin-stat-published">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{stats.published_blogs || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">Live articles</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="card">
                <CardHeader>
                    <CardTitle className="text-lg text-gray-800">Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">System Status</span>
                            <Badge className="bg-emerald-100 text-emerald-700">Operational</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">AI Service</span>
                            <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Database</span>
                            <Badge className="bg-emerald-100 text-emerald-700">Connected</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OverviewTab;
