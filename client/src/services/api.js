import { supabase } from './supabaseClient';

const API_BASE = '/api';

const getHeaders = async () => {
    // Get the current Supabase session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export async function predictDelayAsync(query) {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/predict-risk`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
    });
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
    }
    if (!response.ok) throw new Error(`Prediction failed: ${response.statusText}`);
    return response.json(); // Returns { jobId, statusUrl }
}

export async function pollJobStatus(jobId) {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/job-status/${jobId}`, {
        headers
    });
    if (!response.ok) throw new Error('Failed to fetch status');
    return response.json();
}

export async function getHistory(limit = 20) {
    try {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE}/history?limit=${limit}`, {
            headers
        });
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            throw new Error('Session expired.');
        }
        if (!response.ok) return [];
        return response.json();
    } catch {
        return [];
    }
}
