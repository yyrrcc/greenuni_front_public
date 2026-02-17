// ... imports 동일
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import '../../assets/css/Header.css';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { HEADER_MENUS, getActiveHeaderKey, getSidebarMenus } from '../../utils/menuConfig';
import greenLogo from '../../assets/images/green-university-logo.png';

const normalizeRole = (role) => {
	if (!role) return 'student';
	const r = String(role).toLowerCase().trim();
	if (r.includes('student')) return 'student';
	if (r.includes('staff') || r.includes('admin')) return 'staff';
	if (r.includes('professor')) return 'professor';
	return r;
};

const getUserIdText = (user) => user?.username || user?.userId || user?.id || user?.email || '';

export default function Header({ handleLogout }) {
	const location = useLocation();
	const navigate = useNavigate();
	const { user, userRole, name } = useContext(UserContext);

	const role = normalizeRole(userRole);
	const menus = HEADER_MENUS[role] || HEADER_MENUS.student;
	const currentTopKey = getActiveHeaderKey(role, location.pathname);

	const [open, setOpen] = useState(false);
	const [hoverKey, setHoverKey] = useState(currentTopKey || menus?.[0]?.key);

	const closeTimerRef = useRef(null);

	useEffect(() => {
		setHoverKey(currentTopKey || menus?.[0]?.key);
	}, [currentTopKey, menus]);

	const safeOpen = (key) => {
		if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
		setHoverKey(key);

		// ✅ HOME는 메가바 안 뜸
		if (key === 'HOME') {
			setOpen(false);
			return;
		}
		setOpen(true);
	};

	const safeClose = () => {
		if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
		closeTimerRef.current = setTimeout(() => setOpen(false), 140);
	};

	useEffect(() => {
		if (!open) return;
		const onKey = (e) => e.key === 'Escape' && setOpen(false);
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [open]);

	const dropdownItems = useMemo(() => {
		const list = getSidebarMenus(role, hoverKey) || [];
		return list.filter((i) => !i.hidden);
	}, [role, hoverKey]);

	const hoverLabel = useMemo(() => {
		return menus.find((m) => m.key === hoverKey)?.label || '';
	}, [menus, hoverKey]);

	const userIdText = getUserIdText(user);

	return (
		<header className="ph-header">
			<div className="ph-inner">
				{/* LEFT */}
				<NavLink to="/portal" className="ph-brand">
					<img src={greenLogo} alt="Green University" className="ph-logo" />
					<div className="ph-brandtext">
						<span className="ph-en">GREEN UNIVERSITY</span>
						<span className="ph-ko">그린대학교 포털</span>
					</div>
				</NavLink>

				{/* CENTER TABS */}
				<nav className="ph-nav" onMouseLeave={safeClose} onMouseEnter={() => safeOpen(hoverKey)}>
					<div className="ph-tabs">
						{menus.map((menu) => (
							<NavLink
								key={menu.key}
								to={menu.path}
								end
								onMouseEnter={() => safeOpen(menu.key)}
								onFocus={() => safeOpen(menu.key)}
								className={({ isActive }) =>
									['ph-tab', isActive ? 'active' : '', menu.key === currentTopKey ? 'current' : ''].join(' ')
								}
							>
								{menu.label}
							</NavLink>
						))}
					</div>
				</nav>

				{/* RIGHT USER */}
				<div className="ph-user">
					{user ? (
						<>
							<span className="ph-usertext">
								{name ? name : '사용자'}
								{userIdText ? ` (${userIdText})` : ''}
							</span>
							<button onClick={handleLogout} className="ph-logout" type="button">
								로그아웃
							</button>
						</>
					) : (
						<button onClick={() => navigate('/')} className="ph-logout" type="button">
							로그인
						</button>
					)}
				</div>
			</div>

			{/* 전체폭 메가바(헤더 아래에 한 번만 렌더링) */}
			{open && hoverKey !== 'HOME' && (
				<div className="ph-mega" onMouseEnter={() => safeOpen(hoverKey)} onMouseLeave={safeClose}>
					<div className="ph-mega-inner">
						<div className="ph-mega-grid">
							{dropdownItems.map((item) => (
								<NavLink key={item.key} to={item.path} className="ph-mega-link" onClick={() => setOpen(false)}>
									{item.label}
								</NavLink>
							))}
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
