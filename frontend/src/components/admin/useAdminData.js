/**
 * Custom hook for admin data fetching and state management
 * Extracted from AdminPanel.js for reusability
 */
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

import { API_BASE } from '../../config/api';

const API = API_BASE;

export const useAdminData = () => {
    const [stats, setStats] = useState({});
    const [pendingJobs, setPendingJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [blogPosts, setBlogPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // Pagination state for Manage Jobs
    const [jobsSkip, setJobsSkip] = useState(0);
    const [hasMoreJobs, setHasMoreJobs] = useState(true);
    const [loadingMoreJobs, setLoadingMoreJobs] = useState(false);
    const JOBS_PER_PAGE = 100;

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }, []);

    const retryFetchData = useCallback(() => {
        if (retryCount < 3) {
            setError(null);
            setRetryCount(prev => prev + 1);
        } else {
            toast.error('Maximum retry attempts reached. Please refresh the page.');
        }
    }, [retryCount]);

    const fetchAdminData = useCallback(async () => {
        setLoading(true);
        try {
            const headers = getAuthHeaders();

            const [statsResponse, jobsResponse, blogResponse] = await Promise.all([
                axios.get(`${API}/admin/stats`, { headers }),
                axios.get(`${API}/admin/jobs/pending`, { headers }),
                axios.get(`${API}/admin/blog`, { headers })
            ]);

            setStats(statsResponse.data || {});
            setPendingJobs(jobsResponse.data || []);
            setBlogPosts(blogResponse.data || []);
            setError(null);
            setRetryCount(0);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
            let errorMessage = 'Failed to load admin dashboard data';

            if (error.response?.status === 401) {
                errorMessage = 'Session expired. Please login again.';
            } else if (error.response?.status === 403) {
                errorMessage = 'Admin access required.';
            } else if (!error.response) {
                errorMessage = 'Network error. Check your connection.';
            }

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    const fetchAllJobs = useCallback(async (loadMore = false) => {
        try {
            const headers = getAuthHeaders();
            const skip = loadMore ? jobsSkip + JOBS_PER_PAGE : 0;

            if (!loadMore) setLoadingMoreJobs(true);

            const response = await axios.get(
                `${API}/admin/jobs?include_deleted=true&skip=${skip}&limit=${JOBS_PER_PAGE}`,
                { headers }
            );

            const jobs = response.data || [];

            if (loadMore) {
                setAllJobs(prev => [...prev, ...jobs]);
            } else {
                setAllJobs(jobs);
            }

            setHasMoreJobs(jobs.length === JOBS_PER_PAGE);
            setJobsSkip(skip);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            toast.error('Failed to load jobs');
        } finally {
            setLoadingMoreJobs(false);
        }
    }, [getAuthHeaders, jobsSkip, JOBS_PER_PAGE]);

    const approveJob = useCallback(async (jobId) => {
        try {
            const headers = getAuthHeaders();
            await axios.put(`${API}/admin/jobs/${jobId}/approve`, {}, { headers });

            toast.success('Job approved successfully!');
            setPendingJobs(prev => prev.filter(job => job.id !== jobId));
            setStats(prev => ({
                ...prev,
                pending_jobs: Math.max(0, prev.pending_jobs - 1),
                approved_jobs: prev.approved_jobs + 1
            }));
        } catch (error) {
            console.error('Failed to approve job:', error);
            toast.error(error.response?.data?.detail || 'Failed to approve job');
        }
    }, [getAuthHeaders]);

    const deleteJob = useCallback(async (jobId) => {
        try {
            const headers = getAuthHeaders();
            await axios.delete(`${API}/admin/jobs/${jobId}`, { headers });

            toast.success('Job deleted successfully!');
            setAllJobs(prev => prev.filter(job => job.id !== jobId));
        } catch (error) {
            console.error('Failed to delete job:', error);
            toast.error('Failed to delete job');
        }
    }, [getAuthHeaders]);

    const archiveJob = useCallback(async (jobId) => {
        try {
            const headers = getAuthHeaders();
            await axios.put(`${API}/admin/jobs/${jobId}/archive`, {}, { headers });

            toast.success('Job archived successfully!');
            setAllJobs(prev => prev.map(job =>
                job.id === jobId ? { ...job, is_archived: true } : job
            ));
        } catch (error) {
            console.error('Failed to archive job:', error);
            toast.error('Failed to archive job');
        }
    }, [getAuthHeaders]);

    const unarchiveJob = useCallback(async (jobId) => {
        try {
            const headers = getAuthHeaders();
            await axios.put(`${API}/admin/jobs/${jobId}/unarchive`, {}, { headers });

            toast.success('Job unarchived successfully!');
            setAllJobs(prev => prev.map(job =>
                job.id === jobId ? { ...job, is_archived: false } : job
            ));
        } catch (error) {
            console.error('Failed to unarchive job:', error);
            toast.error('Failed to unarchive job');
        }
    }, [getAuthHeaders]);

    const deleteBlog = useCallback(async (blogId) => {
        try {
            const headers = getAuthHeaders();
            await axios.delete(`${API}/admin/blog/${blogId}`, { headers });

            setBlogPosts(prev => prev.filter(blog => blog.id !== blogId));
            toast.success('Blog post deleted successfully!');
        } catch (error) {
            console.error('Failed to delete blog:', error);
            toast.error('Failed to delete blog post');
        }
    }, [getAuthHeaders]);

    useEffect(() => {
        fetchAdminData();
        fetchAllJobs();
    }, [retryCount]);

    return {
        // State
        stats,
        pendingJobs,
        allJobs,
        blogPosts,
        loading,
        error,
        retryCount,
        hasMoreJobs,
        loadingMoreJobs,

        // Actions
        fetchAdminData,
        fetchAllJobs,
        approveJob,
        deleteJob,
        archiveJob,
        unarchiveJob,
        deleteBlog,
        retryFetchData,
        setBlogPosts,
        setAllJobs,

        // API helpers
        API,
        getAuthHeaders
    };
};

export default useAdminData;
