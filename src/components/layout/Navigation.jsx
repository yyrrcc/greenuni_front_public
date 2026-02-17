import React, { useContext } from 'react';
import '../../assets/css/Navigation.css';
import { NavLink, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { getActiveHeaderKey, getSidebarMenus } from '../../utils/menuConfig';

const normalizeRole = (role) => {
	if (!role) return 'student';
	const r = String(role).toLowerCase().trim();
	if (r.includes('student')) return 'student';
	if (r.includes('staff') || r.includes('admin')) return 'staff';
	if (r.includes('professor')) return 'professor';
	return r;
};

export default function Navigation() {
	const { userRole } = useContext(UserContext);
	const { pathname } = useLocation();

	const role = normalizeRole(userRole);

	const activeHeaderKey = getActiveHeaderKey(role, pathname);

	// hidden은 화면에서만 제외
	const sidebarItems = getSidebarMenus(role, activeHeaderKey).filter((i) => !i.hidden);

	return (
		<aside className="sidebar">
			<nav className="sidebar-nav">
				{sidebarItems.map((item) => (
					<NavLink
						key={item.key}
						to={item.path}
						end={(item.path === '/sugang', '/tuition')} // 정확매칭(=list에서 같이 active 안 됨) css 때문에 추가
						className={({ isActive }) => (isActive ? 'sidebar-item active' : 'sidebar-item')}
					>
						{item.icon && <span className="material-symbols-rounded">{item.icon}</span>}
						<span className="sidebar-label">{item.label}</span>
					</NavLink>
				))}
			</nav>
		</aside>
	);
}
