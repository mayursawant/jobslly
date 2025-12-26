/**
 * Manage Jobs Tab Component
 * Displays all jobs with edit, archive, delete functionality
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatSalary } from './adminUtils';

const ManageJobsTab = ({
    allJobs,
    hasMoreJobs,
    loadingMoreJobs,
    onLoadMore,
    onEdit,
    onDelete,
    onArchive,
    onUnarchive
}) => {
    return (
        <Card className="card">
            <CardHeader>
                <CardTitle className="text-lg text-gray-800">
                    Manage All Jobs ({allJobs.length})
                </CardTitle>
                <p className="text-gray-600">Edit, archive, or delete job listings</p>
            </CardHeader>
            <CardContent>
                {allJobs.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">No jobs found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {allJobs.map((job) => (
                            <div
                                key={job.id}
                                className={`border rounded-lg p-4 ${job.is_deleted ? 'bg-red-50' : job.is_archived ? 'bg-gray-50' : 'bg-white'}`}
                                data-testid={`manage-job-${job.id}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-800">{job.title}</h4>
                                        <p className="text-emerald-600 font-medium">{job.company}</p>
                                        <p className="text-gray-600">{job.location}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {job.is_deleted && (
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                Deleted
                                            </Badge>
                                        )}
                                        {job.is_archived && !job.is_deleted && (
                                            <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                                                Archived
                                            </Badge>
                                        )}
                                        {job.is_approved && !job.is_deleted && !job.is_archived && (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                Active
                                            </Badge>
                                        )}
                                        {!job.is_approved && !job.is_deleted && (
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                Pending
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        {job.salary_min && (
                                            <span>
                                                {formatSalary(job.salary_min, job.currency)}
                                                {job.salary_max && ` - ${formatSalary(job.salary_max, job.currency)}`}
                                            </span>
                                        )}
                                        <span className="ml-4">Views: {job.view_count || 0}</span>
                                        <span className="ml-4">Applications: {job.application_count || 0}</span>
                                    </div>
                                    <div className="space-x-2">
                                        {!job.is_deleted && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onEdit(job)}
                                                >
                                                    Edit
                                                </Button>
                                                {job.is_archived ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onUnarchive(job.id)}
                                                    >
                                                        Unarchive
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onArchive(job.id)}
                                                    >
                                                        Archive
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50"
                                                    onClick={() => onDelete(job.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {hasMoreJobs && (
                            <div className="text-center pt-4">
                                <Button
                                    variant="outline"
                                    onClick={onLoadMore}
                                    disabled={loadingMoreJobs}
                                >
                                    {loadingMoreJobs ? 'Loading...' : 'Load More Jobs'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ManageJobsTab;
