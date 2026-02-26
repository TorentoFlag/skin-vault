import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchMe } from '../../api/auth';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    useAuthStore.setState({ accessToken: token });

    fetchMe()
      .then(user => {
        setAuth(token, user);
        navigate('/', { replace: true });
      })
      .catch(() => {
        navigate('/', { replace: true });
      });
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#a0a0b0] text-sm">Авторизация...</p>
      </div>
    </div>
  );
}
