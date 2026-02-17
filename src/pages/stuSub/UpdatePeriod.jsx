import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import '../../assets/css/UpdatePeriod.css';
import api from '../../api/httpClient';

// 수강 신청 기간 상태 변경
export default function UpdatePeriod() {
	const { user, userRole } = useContext(UserContext);
	const [sugangState, setSugangState] = useState(null);

	// 단계 정보 정의
	const steps = [
		{ id: 0, label: '예비 수강 신청' },
		{ id: 1, label: '수강 신청 진행' },
		{ id: 2, label: '수강 신청 종료' },
	];

	// 현재 수강 신청 기간 상태 불러오기
	const loadSugangState = async () => {
		try {
			const res = await api.get('/sugangperiod');
			setSugangState(res.data.status);
		} catch (err) {
			console.error('상태 로드 실패:', err);
		}
	};

	useEffect(() => {
		loadSugangState();
	}, []);

	// 🔥 상태 변경 함수 (0→1일 때만 배치 호출)
	const changeStatus = async (newStatus) => {
		try {
			// 1. 상태 변경
			await api.put('/sugangperiod/update', { status: newStatus });

			// 2. 예비→수강(0→1) 전환일 경우 배치 실행
			if (sugangState === 0 && newStatus === 1) {
				console.log('🔥 배치1 실행 중...');
				// StuSubService.movePreToStuSubBatch() 호출용 엔드포인트 필요
				await api.post('/sugang/batch/move-pre-to-regular');
			}
			// 수강→종료(1→2) 전환일 경우 (detail에 값 넣기, pre 지우기)
			if (sugangState === 1 && newStatus === 2) {
				console.log('🔥 배치2 실행 중...');
				await api.post('sugang/batch/move-regular-to-detail');
			}
			alert('기간이 변경되었습니다.');
			loadSugangState();
		} catch (err) {
			console.error('상태 변경 실패:', err);
			alert('변경에 실패했습니다.');
		}
	};

	// 현재 상태에 따라 보여줄 버튼 텍스트와 다음 상태 결정
	const getActionInfo = () => {
		switch (sugangState) {
			case 0:
				return {
					text: '예비 기간 종료 및 본 수강 신청 시작',
					nextStatus: 1,
					desc: '예비 수강 신청 내역이 본 수강 신청 내역으로 이관됩니다.',
				};
			case 1:
				return {
					text: '수강 신청 기간 종료',
					nextStatus: 2,
					desc: '수강 신청이 마감되며 최종 내역이 확정됩니다.',
				};
			case 2:
				return {
					text: '새 학기 초기화 (예비 기간으로)',
					nextStatus: 0,
					desc: '모든 내역이 초기화되고 새로운 학기 예비 신청이 시작됩니다.',
				};
			default:
				return { text: '로딩 중...', nextStatus: null, desc: '' };
		}
	};

	const actionInfo = getActionInfo();

	return (
		<>
			<div className="period-container">
				<h3 className="period-title">학사 일정 관리 (수강 신청)</h3>
				{/* Stepper 영역 */}
				<div className="stepper-wrapper">
					{steps.map((step) => (
						<div
							key={step.id}
							className={`step-item ${sugangState === step.id ? 'active' : ''} ${
								sugangState > step.id ? 'completed' : ''
							}`}
						>
							<div className="step-circle">{step.id + 1}</div>
							<div className="step-label">{step.label}</div>
						</div>
					))}
				</div>

				{/* 액션 영역 */}
				<div className="action-card">
					<p className="current-status-text">
						현재 상태: <span className="status-highlight">{steps[sugangState]?.label || '로딩 중'}</span>
					</p>

					<button
						className="action-btn"
						onClick={() => changeStatus(actionInfo.nextStatus)}
						disabled={actionInfo.nextStatus === null}
					>
						{actionInfo.text}
					</button>

					<p className="info-text">※ {actionInfo.desc}</p>
				</div>
			</div>
		</>
	);
}
