import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import api from '../api/httpClient';
import '../assets/css/Portal.css';
import { formatDateLocal } from '../utils/DateTimeUtil';

import portal1 from '../assets/images/portal1.png';
import portal2 from '../assets/images/portal2.png';
import StaffAlert from './user/alert/StaffAlert';
import StudentAlerts from './user/alert/StudentAlert';
import ProfessorAlert from './user/alert/ProfessorAlert';

// 배너 이미지 데이터
const bannerImages = [
	{
		id: 1,
		src: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
		text: '꿈을 향한 첫 걸음, 그린대학교',
	},
	{
		id: 2,
		src: portal2,
		text: '2025학년도 신입생 모집 요강',
	},
	{
		id: 3,
		src: portal1,
		text: '글로벌 리더를 양성하는 교육의 산실',
	},
];

export default function Portal() {
	const { userRole, token, logout } = useContext(UserContext);
	const navigate = useNavigate();

	const [currentSlide, setCurrentSlide] = useState(0);
	const [miniUserInfo, setMiniUserInfo] = useState({});
	const [studentStatus, setStudentStatus] = useState(null); // 학생의 재학 상태 때문에

	// 공지/학사일정
	const [latestNotices, setLatestNotices] = useState([]);
	const [latestSchedules, setLatestSchedules] = useState([]);

	// 배너 자동 슬라이드
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
		}, 4000);
		return () => clearInterval(timer);
	}, []);

	const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
	const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1));

	// 학사일정 유틸 (이번달 필터)
	const toTime = (v) => {
		const t = new Date(v).getTime();
		return Number.isNaN(t) ? null : t;
	};

	// 일정(start~end)이 이번달과 "겹치면" 포함
	const isInThisMonth = (s) => {
		const now = new Date();
		const mStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();
		const mEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

		const sStart = toTime(s.startDay);
		const sEnd = toTime(s.endDay || s.startDay);

		if (!sStart) return false;
		return sStart <= mEnd && sEnd >= mStart;
	};

	// 사용자 정보 불러오기
	useEffect(() => {
		if (!token) return;

		const loadMiniInfo = async () => {
			try {
				let url = '';
				if (userRole === 'student') url = '/personal/info/student';
				else if (userRole === 'staff') url = '/personal/info/staff';
				else if (userRole === 'professor') url = '/personal/info/professor';

				if (url) {
					const res = await api.get(url);
					// userRole 키값으로 데이터 추출 (예: res.data.student)
					// console.log('마이페이지1: ', res.data);
					// console.log('마이페이지2: ', res.data[userRole]);
					// console.log('마이페이지3: ', res.data.stuStat);
					setMiniUserInfo(res.data[userRole] || {});
					if (userRole === 'student') {
						setStudentStatus(res.data.stuStat[0]);
					}
				}
			} catch (e) {
				console.error('홈페이지 정보 로드 실패', e);
			}
		};
		loadMiniInfo();
	}, [userRole, token]);

	// 공지/학사일정 로드
	useEffect(() => {
		const loadHomeData = async () => {
			try {
				// 공지사항: 5개
				const noticeRes = await api.get('/notice/list/0');
				const noticeList = noticeRes.data.noticeList || [];
				setLatestNotices(noticeList.slice(0, 5));

				// 학사일정: 이번달 일정만 + 5개
				const scheduleRes = await api.get('/schedule');
				const scheduleList = scheduleRes.data.schedules || [];

				const filtered = scheduleList
					.filter(isInThisMonth)
					.sort((a, b) => (toTime(a.startDay) || 0) - (toTime(b.startDay) || 0))
					.slice(0, 5);

				setLatestSchedules(filtered);
			} catch (e) {
				console.error('Portal 공지/학사일정 로드 실패:', e);
			}
		};

		loadHomeData();
	}, []);

	return (
		<div className="home-container">
			{/* [Section 1] 상단 배너 */}
			<div className="banner-section">
				<button className="banner-btn prev" onClick={prevSlide}>
					&lt;
				</button>
				<div className="banner-slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
					{bannerImages.map((banner) => (
						<div key={banner.id} className="banner-item">
							<img src={banner.src} alt="campus" />
							<h2 className="banner-text">{banner.text}</h2>
						</div>
					))}
				</div>
				<button className="banner-btn next" onClick={nextSlide}>
					&gt;
				</button>
			</div>

			{/* [Section 2] 하단 3분할 정보 */}
			<div className="bottom-section">
				{/* 2-1. 공지사항 */}
				<div className="section-card">
					<div className="section-title">공지사항</div>

					<ul className="notice-list">
						{latestNotices.length === 0 ? (
							<li>• 등록된 공지사항이 없습니다.</li>
						) : (
							latestNotices.map((n) => (
								<li key={n.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/notice/read/${n.id}`)}>
									• {(n.category || '').replace('[', '').replace(']', '')} {n.title}
								</li>
							))
						)}
					</ul>

					{/* 오른쪽 하단 VIEW MORE */}
					<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
						<button type="button" className="view-more-btn" onClick={() => navigate('/notice')}>
							VIEW MORE &gt;
						</button>
					</div>
				</div>

				{/* 2-2. 학사일정 */}
				<div className="section-card">
					<div className="section-title">이번달 학사일정</div>

					<div className="schedule-list-card">
						{latestSchedules.length === 0 ? (
							<div className="schedule-empty">
								<span className="schedule-badge">
									<span className="badge-month">-</span>
									<span className="badge-day">-</span>
								</span>
								<div className="schedule-body">
									<div className="schedule-title">이번 달 학사 일정이 없습니다.</div>
									<div className="schedule-range"></div>
								</div>
							</div>
						) : (
							latestSchedules.map((s) => {
								const d = new Date(s.startDay);
								const invalid = Number.isNaN(d.getTime());

								return (
									<div key={s.id} className="schedule-row">
										<div className="schedule-badge">
											<span className="badge-month">
												{invalid ? '-' : d.toLocaleString('en-US', { month: 'short' }).toUpperCase()}
											</span>
											<span className="badge-day">{invalid ? '-' : String(d.getDate()).padStart(2, '0')}</span>
										</div>

										<div className="schedule-body">
											<div className="schedule-title">{s.information}</div>
											<div className="schedule-range">
												{formatDateLocal(s.startDay)} ~ {formatDateLocal(s.endDay || s.startDay)}
											</div>
										</div>
									</div>
								);
							})
						)}
					</div>

					{/* 오른쪽 하단 VIEW MORE */}
					<button type="button" className="view-more-btn" onClick={() => navigate('/schedule')}>
						VIEW MORE &gt;
					</button>
				</div>

				{/* 2-3. 내 정보 (로그인 시) */}
				<div className="section-card">
					{token && miniUserInfo.name ? (
						<div className="my-info-card">
							{/* 상단: 환영 메시지 및 기본 정보 */}
							<div>
								<div className="welcome-msg">
									<span className="material-symbols-rounded user-icon"></span>
									👤{miniUserInfo.name}님, 환영합니다.
								</div>

								<div className="info-details">
									<div className="info-row">
										<span className="info-label">이메일</span>
										<span className="info-value">{miniUserInfo.email}</span>
									</div>
									<div className="info-row">
										<span className="info-label">소속</span>
										<span className="info-value">{miniUserInfo.deptName || miniUserInfo.major || '그린대학교'}</span>
									</div>

									{/* 학생일 경우 추가 정보 */}
									{userRole === 'student' && (
										<>
											<div className="info-row">
												<span className="info-label">학기</span>
												<span className="info-value">
													{miniUserInfo.grade}학년 {miniUserInfo.semester}학기
												</span>
											</div>
											<div className="info-row">
												<span className="info-label">학적</span>
												<span className="info-value">{studentStatus?.status || '재학'}</span>
											</div>
										</>
									)}
								</div>

								{/* 업무 알림 영역 */}
								{/* [Staff 전용] */}
								{userRole === 'staff' && token && <StaffAlert onGoList={() => navigate('/break/list/staff')} />}

								{/* [Professor 전용] */}
								{userRole === 'professor' && token && (
									<ProfessorAlert
										onGoPending={() => navigate('/counseling/manage')}
										onGoToday={() => navigate('/videotest')}
									/>
								)}

								{/* [Student 전용] */}
								{userRole === 'student' && token && (
									<StudentAlerts
										onGoRisk={() => navigate('/status')}
										onGoRequest={() => navigate('/counseling/manage')}
										onGoUpcoming={() => navigate('/counseling/manage')}
									/>
								)}
							</div>

							{/* 하단: 버튼들 */}
							<div className="info-actions">
								<button className="action-btn" onClick={() => navigate('/user/info')}>
									마이페이지
								</button>
								<button className="action-btn logout" onClick={logout}>
									로그아웃
								</button>
							</div>
						</div>
					) : (
						// 로그인 안 된 상태
						<div className="login-guide">
							<p style={{ marginBottom: '15px' }}>로그인이 필요한 서비스입니다.</p>
							<button className="action-btn" onClick={() => navigate('/login')}>
								로그인 하러가기
							</button>
						</div>
					)}
				</div>
			</div>
			<div></div>
			{/* [NEW] 찾아오시는길 CTA (포탈에서 바로 이동) */}
			<div className="portal-direction-cta">
				<div className="portal-direction-card">
					<div className="portal-direction-left">
						<div className="portal-direction-title">그린대학교 오시는 길</div>
						<div className="portal-direction-desc">📍서울시 마포구 신촌로 176</div>
					</div>

					<button type="button" className="portal-direction-btn" onClick={() => navigate('/direction')}>
						찾아오시는 길 →
					</button>
				</div>
			</div>
		</div>
	);
}
