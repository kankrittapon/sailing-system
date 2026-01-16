'use client';

import { auth, rtdb } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const checkAdminRole = async (uid: string): Promise<boolean> => {
        try {
            const adminRef = ref(rtdb, `admins/${uid}`);
            const snapshot = await get(adminRef);
            return snapshot.exists() && snapshot.val().role === 'admin';
        } catch (error) {
            console.error('Error checking admin role:', error);
            return false;
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const isAdmin = await checkAdminRole(userCredential.user.uid);

            if (!isAdmin) {
                await auth.signOut();
                setError('Access denied: Admin privileges required');
                setLoading(false);
                return;
            }

            router.push('/admin');
        } catch (err: any) {
            setError(err.message || 'Login failed');
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const isAdmin = await checkAdminRole(userCredential.user.uid);

            if (!isAdmin) {
                await auth.signOut();
                setError('Access denied: Admin privileges required');
                setLoading(false);
                return;
            }

            router.push('/admin');
        } catch (err: any) {
            setError(err.message || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'sans-serif'
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '15px',
                padding: '40px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
                <h1 style={{ textAlign: 'center', color: '#667eea', marginBottom: '30px' }}>
                    ⛵ Admin Login
                </h1>

                {error && (
                    <div style={{
                        background: '#ffebee',
                        color: '#c62828',
                        padding: '10px',
                        borderRadius: '5px',
                        marginBottom: '20px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleEmailLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#667eea',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login with Email'}
                    </button>
                </form>

                <div style={{
                    textAlign: 'center',
                    margin: '20px 0',
                    color: '#999'
                }}>
                    OR
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: '#fff',
                        color: '#333',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '1rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <span>🔐</span> Login with Google
                </button>
            </div>
        </div>
    );
}
