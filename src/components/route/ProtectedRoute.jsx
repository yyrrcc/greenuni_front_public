import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

export default function ProtectedRoute({ children, allowedRoles }) {
	const { user, token, userRole, loading } = useContext(UserContext);

	// 로딩 중이면 대기
	if (loading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
				}}
			>
				<p>로딩 중...</p>
			</div>
		);
	}

	// 로그인 안 했으면 로그인 페이지로
	if (!token || !user) {
		// alert('로그인이 필요합니다.');
		return <Navigate to="/" replace />;
	}

	// 특정 역할만 허용 (allowedRoles가 있을 때) - alert 창 띄운 후 portal로 보내기
	if (allowedRoles && allowedRoles.length > 0) {
		if (!allowedRoles.includes(userRole)) {
			alert('접근 권한이 없습니다.');
			return <Navigate to="/portal" replace />;
		}
	}

	// 특정 역할만 허용 (allowedRoles가 있을 때) - 페이지 남기고 뒤로가기 버튼 만들기
	// if (!allowedRoles.includes(userRole)) {
	// 	return (
	// 		<div style={{ padding: '50px', textAlign: 'center' }}>
	// 			<h2>🚫 접근 권한이 없습니다</h2>
	// 			<button onClick={() => window.history.back()}>뒤로 가기</button>
	// 		</div>
	// 	);
	// }

	return children ? children : <Outlet />;
}
