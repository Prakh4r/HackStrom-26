const API_BASE = '/api';

const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const login = async (email) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
}

export async function verifyOtp(email, otp) {
    const response = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    });
    if (!response.ok) throw new Error('Invalid OTP');
    const data = await response.json();
    if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
}

export async function predictDelayAsync(query) {
    const response = await fetch(`${API_BASE}/predict-risk`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error(`Prediction failed: ${response.statusText}`);
    return response.json(); // Returns { jobId, statusUrl }
}

export async function pollJobStatus(jobId) {
    const response = await fetch(`${API_BASE}/job-status/${jobId}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch status');
    return response.json();
}

export async function getHistory(limit = 20) {
    try {
        const response = await fetch(`${API_BASE}/history?limit=${limit}`, {
            headers: getHeaders()
        });
        if (response.status === 401) throw new Error('Unauthorized');
        if (!response.ok) return [];
        return response.json();
    } catch {
        return [];
    }
}
