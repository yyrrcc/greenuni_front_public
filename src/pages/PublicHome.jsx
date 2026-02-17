// PublicHome 로그인 + 공지사항
import React, { useEffect, useState } from 'react';
import '../assets/css/Home.css';
import Login from './user/Login';
import { useNavigate } from 'react-router-dom';
import api from '../api/httpClient';
import { formatDateLocal } from '../utils/DateTimeUtil';
import Footer from '../components/layout/Footer';

function PublicHome() {
	const navigate = useNavigate();
	const [latestNotices, setLatestNotices] = useState([]); // 최신 공지
	const [latestSchedules, setLatestSchedules] = useState([]); // 최신 학사 일정

	const loadLatestNotices = async () => {
		try {
			// 최신 공지를 1페이지에서 가져온 뒤 3개만 사용
			const res = await api.get('/notice/list/0');
			const list = res.data.noticeList || [];

			setLatestNotices(list.slice(0, 3));
		} catch (e) {
			console.error('PublicHome 최신 공지 로드 실패:', e);
		}
	};

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		loadLatestNotices();
	}, []);

	const loadLatestSchedules = async () => {
		try {
			const res = await api.get('/schedule');
			const list = res.data.schedules || [];

			// 시작일 기준 가까운 순 정렬(선택)
			const sorted = [...list].sort((a, b) => {
				const aDate = a.startDay ? new Date(a.startDay).getTime() : 0;
				const bDate = b.startDay ? new Date(b.startDay).getTime() : 0;
				return aDate - bDate;
			});

			setLatestSchedules(sorted.slice(0, 3));
		} catch (e) {
			console.error('PublicHome 최신 학사일정 로드 실패:', e);
		}
	};

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		loadLatestSchedules();
	}, []);

	return (
		<div className="public-layout">
			{/* ================= 왼쪽 - 로그인 영역 ================= */}
			<section className="public-left">
				<div className="public-left-inner">
					<div className="public-left-main">
						{/* 로고/타이틀 */}
						<header className="public-logo-area">
							<div className="public-logo-image-wrap">
								<img src="/green-university-logo.png" alt="GREEN UNIVERSITY" className="public-logo-image" />
							</div>

							<div className="public-logo-text">
								<span className="public-logo-en">GREEN UNIVERSITY</span>
								<span className="public-logo-ko">그린대학교 포털</span>
							</div>
						</header>

						{/* 로그인 컴포넌트 */}
						<main className="public-login-wrapper">
							<Login />
						</main>
					</div>

					{/* 왼쪽 푸터 */}
					<Footer className="public-left-footer" />
				</div>
			</section>

			{/* ================= 오른쪽 - 포털 안내/공지 영역 ================= */}
			<section className="public-right">
				<div className="public-right-inner">
					<div className="public-right-main">
						<header className="public-right-header">
							<h1 className="public-right-title">GREEN PORTAL</h1>
							<p className="public-right-subtitle">진리와 자유를 향한 그린의 도전</p>
						</header>

						<div className="public-right-panels">
							{/* 공지사항 */}
							<section className="public-panel">
								<div className="public-panel-header">
									<h2>공지사항</h2>
									<button className="panel-more-btn" type="button" onClick={() => navigate('/notice')}>
										더보기 +
									</button>
								</div>

								<ul className="public-notice-list">
									{latestNotices.length === 0 && (
										<li className="empty-row">
											<span className="public-notice-category">-</span>
											<span className="public-notice-title">등록된 공지사항이 없습니다.</span>
											<span className="public-notice-date"></span>
										</li>
									)}

									{latestNotices.map((n) => (
										<li key={n.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/notice/read/${n.id}`)}>
											<span className="public-notice-category">
												{(n.category || '').replace('[', '').replace(']', '')}
											</span>
											<span className="public-notice-title">{n.title}</span>
											<span className="public-notice-date">{formatDateLocal(n.createdTime)}</span>
										</li>
									))}
								</ul>
							</section>

							{/* 학사 일정 */}
							<section className="public-panel">
								<div className="public-panel-header">
									<h2>학사 일정</h2>
									<button className="panel-more-btn" type="button" onClick={() => navigate(`/schedule`)}>
										더보기 +
									</button>
								</div>

								<ul className="public-schedule-list">
									{latestSchedules.length === 0 && (
										<li>
											<span className="public-schedule-date">-</span>
											<span className="public-schedule-title">등록된 학사 일정이 없습니다.</span>
										</li>
									)}

									{latestSchedules.map((s) => (
										<li key={s.id}>
											<span className="public-schedule-date">
												{s.startDay}
												{s.endDay ? ` ~ ${s.endDay}` : ''}
											</span>
											<span className="public-schedule-title">{s.information}</span>
										</li>
									))}
								</ul>
							</section>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

export default PublicHome;
