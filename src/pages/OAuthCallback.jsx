import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OAuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('token', token);
            navigate('/tournaments', { replace: true });
        } else if (!localStorage.getItem('token')) {
            navigate('/login', { replace: true });
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="bg-green-500 rounded-lg p-2">
                    <span className="text-white font-bold text-lg">⚙</span>
                </div>
                <p className="text-gray-400 text-sm">Authenticating with Google...</p>
            </div>
        </div>
    );
}