/**
 * Pending Jobs Tab Component
 * Displays and manages pending job approvals
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatSalary } from './adminUtils';

const PendingJobsTab = ({ pendingJobs, onApprove }) => {
    return (
        <Card className="card" data-testid="pending-jobs-card">
            <CardHeader>
                <CardTitle className="text-lg text-gray-800">
                    Pending Job Approvals ({pendingJobs.length})
                </CardTitle>
                <p className="text-gray-600">Review and approve job postings from employers</p>
            </CardHeader>
            <CardContent>
                {pendingJobs.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">All caught up!</h3>
                        <p className="text-gray-600">No jobs pending approval at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingJobs.map((job) => (
                            <div key={job.id} className="border rounded-lg p-4 bg-white" data-testid={`pending-job-${job.id}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-800">{job.title}</h4>
                                        <p className="text-emerald-600 font-medium">{job.company}</p>
                                        <p className="text-gray-600">{job.location}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                            Pending
                                        </Badge>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-gray-700 line-clamp-3">{job.description}</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Posted {new Date(job.created_at).toLocaleDateString()}
                                        {job.salary_min && (
                                            <span className="ml-4">
                                                {formatSalary(job.salary_min, job.currency)}
                                                {job.salary_max && ` - ${formatSalary(job.salary_max, job.currency)}`}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-x-2">
                                        <Button
                                            onClick={() => onApprove(job.id)}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            data-testid={`approve-job-${job.id}`}
                                        >
                                            ✓ Approve
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PendingJobsTab;
