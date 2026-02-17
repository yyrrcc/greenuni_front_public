// 로그인 전용 레이아웃
import { Outlet } from 'react-router-dom';
import '../../assets/css/Home.css';

function PublicLayout() {
	return (
		<div className="public-shell">
			<Outlet /> {/* 여기서 PublicHome 렌더링 */}
		</div>
	);
}

export default PublicLayout;
