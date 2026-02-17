// 헤더 + 네비 + 푸터 보이는 레이아웃
import { Outlet, useLocation } from 'react-router-dom';
import '../../assets/css/PortalLayout.css';
import Header from './Header';
import Footer from './Footer';
import Navigation from './Navigation';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import Chat from '../../pages/chatbot/Chat';

function PortalLayout() {
	const { pathname } = useLocation();
	const { logout } = useContext(UserContext);

	const isPortalHome = pathname === '/portal';

	return (
		<div className={`portal-layout ${isPortalHome ? 'portal-home' : ''}`}>
			<Header handleLogout={logout} />
			<div className={`main-container ${isPortalHome ? 'no-sidebar' : ''}`}>
				{!isPortalHome && (
					<div className="sidebar-wrap">
						<Navigation />
					</div>
				)}

				<main className="content">
					<Outlet />
					<Chat />
				</main>
			</div>
			<Footer className="portal-footer" />
		</div>
	);
}

export default PortalLayout;
