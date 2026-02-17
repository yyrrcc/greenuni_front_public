import React, { useEffect, useState } from 'react';
import api from '../../../api/httpClient';

export default function StaffAlert({ onGoList }) {
	const [count, setCount] = useState(0);

	useEffect(() => {
		const load = async () => {
			try {
				const res = await api.get('/break/list/staff');
				const raw = res.data.breakAppList || [];
				setCount(raw.length);
			} catch (e) {
				console.error('휴학 대기건수 로드 실패:', e);
				setCount(0);
			}
		};
		load();
	}, []);

	// 업무 없으면 숨김
	if (count <= 0) return null;

	return (
		<div className="main--page--info">
			<ul className="d-flex align-items-start">
				<li>📢 업무 알림</li>
			</ul>

			<p>
				<a
					href="/break/list/staff"
					onClick={(e) => {
						e.preventDefault();
						onGoList?.();
					}}
				>
					처리되지 않은 휴학 신청이 <span className="count-bold">{count}</span>건 존재합니다.
				</a>
			</p>
		</div>
	);
}
