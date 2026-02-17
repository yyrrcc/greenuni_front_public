// // PrivateRoute (보호 라우트) 로그인 안 했으면 /로 튕겨내는 래퍼
// import { Navigate, Outlet } from 'react-router-dom';
// import { useContext } from 'react';
// import { UserContext } from '../context/UserContext';

// function PrivateRoute() {
// 	const { isAuthenticated, loading } = useContext(UserContext);

// 	if (loading) {
// 		return <div>로딩중...</div>;
// 	}

// 	return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
// }

// export default PrivateRoute;
