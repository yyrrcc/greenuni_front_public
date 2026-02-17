import { useEffect, useState } from 'react';
import { UserContext } from './UserContext';
import api from '../api/httpClient';
import { useNavigate } from 'react-router-dom';

// Provider 컴포넌트
export function UserProvider({ children }) {
	const [user, setUser] = useState(null); // 학번, 이름 등
	const [userRole, setUserRole] = useState(null); // 권한: student, admin 등
	const [name, SetName] = useState(null);
	const [token, setToken] = useState(localStorage.getItem('token')); // JWT
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	// 로그인한 유저 있는지 체크
	useEffect(() => {
		const checkUser = async () => {
			if (token) {
				try {
					const res = await api.get('/auth/me');
					console.log('provider me: ', res.data);
					setUser(res.data.id);
					setUserRole(res.data.role);
					SetName(res?.data.name);
					// 로그인 직후라면 Portal로 자동 이동
					if (window.location.pathname === '/') {
						navigate('/portal', { replace: true });
					}
				} catch (err) {
					console.error('토큰 만료됨', err);
					localStorage.removeItem('token');
					setToken(null);
				}
			}
			setLoading(false);
		};
		checkUser();
	}, [token]);

	// 로그아웃
	const logout = () => {
		const ok = window.confirm('정말 로그아웃 하시겠습니까?');
		if (!ok) return;
		localStorage.removeItem('token');
		setUser(null);
		setUserRole(null);
		navigate('/', { replace: true });
	};

	const value = {
		user,
		setUser,
		userRole,
		setUserRole,
		token,
		setToken,
		name,
		loading,
		logout,
	};

	if (loading) return <div>Loading...</div>;

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
