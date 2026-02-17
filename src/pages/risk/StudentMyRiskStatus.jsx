import { useEffect, useMemo, useState } from 'react';
import api from '../../api/httpClient';
import { useNavigate } from 'react-router-dom';
import OptionForm from '../../components/form/OptionForm';
import DataTable from '../../components/table/DataTable';

export default function StudentMyRiskStatus() {
	const [riskList, setRiskList] = useState([]);
	const [selectedSubjectId, setSelectedSubjectId] = useState('');
	const navigate = useNavigate();

	// 내 상담 신청/예약 내역(Reserve)도 같이 가져와서 버튼 상태 제어
	const [reserveList, setReserveList] = useState([]);

	const loadMyRisk = async () => {
		try {
			const res = await api.get('/risk/me');

			// 서버가 list를 바로 주는 경우가 대부분이라 방어차원 둘다 대응
			const list = res.data?.riskList ?? res.data ?? [];
			setRiskList(list);
		} catch (e) {
			alert(e?.response?.data?.message ?? '조회 실패');
			console.error(e);
		}
	};

	// 내 상담 목록 로드
	const loadMyReserves = async () => {
		try {
			const res = await api.get('/reserve/list');
			setReserveList(res.data ?? []);
		} catch (e) {
			// 필요하면 alert로 바꿔도 됨
			console.error(e);
		}
	};

	useEffect(() => {
		loadMyRisk();
		loadMyReserves();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const subjectOptions = useMemo(() => {
		const map = new Map();
		riskList.forEach((r) => {
			if (r.subjectId) map.set(String(r.subjectId), r.subjectName ?? '');
		});

		const options = [{ value: '', label: '전체' }];
		for (const [value, label] of map.entries()) {
			options.push({ value, label });
		}
		return options;
	}, [riskList]);

	const filteredRiskList = useMemo(() => {
		if (!selectedSubjectId) return riskList;
		return riskList.filter((r) => String(r.subjectId) === String(selectedSubjectId));
	}, [riskList, selectedSubjectId]);

	// 과목별 상담 상태 맵 만들기
	// 우선순위: APPROVED(past=true) > APPROVED(past=false) > REQUESTED > 그 외(취소/반려/없음)
	const reserveStateBySubjectId = useMemo(() => {
		const m = new Map();

		(reserveList ?? []).forEach((r) => {
			const sid = r?.subject?.id ?? r?.subjectId; // 서버 형태 혼재 방어
			if (sid == null) return;

			const key = String(sid);

			const state = r?.approvalState;
			const past = !!r?.past; // backend dto에서 내려줌
			const requester = r?.requester; // STUDENT/PROFESSOR

			// 기존값이 있으면 우선순위 비교
			const prev = m.get(key);

			const rank = (v) => {
				if (!v) return 0;
				if (v.approvalState === 'APPROVED' && v.past) return 4; // 상담완료
				if (v.approvalState === 'APPROVED' && !v.past) return 3; // 상담확정
				if (v.approvalState === 'REQUESTED') return 2; // 요청대기

				// CANCELED/REJECTED는 다시 신청 가능 상태로 취급 -> 낮은 rank
				return 1;
			};

			const cur = { approvalState: state, past, requester };
			if (!prev || rank(cur) > rank(prev)) m.set(key, cur);
		});

		return m;
	}, [reserveList]);

	const headers = ['과목', '교수', '메시지', '상담요청'];

	const tableData = useMemo(() => {
		return filteredRiskList.map((r) => {
			const sidKey = String(r.subjectId);
			const rs = reserveStateBySubjectId.get(sidKey);

			// 버튼 상태 결정
			let label = '상담 요청';
			let disabled = false;

			if (rs?.approvalState === 'APPROVED' && rs.past) {
				label = '상담 완료';
				disabled = true;
			} else if (rs?.approvalState === 'APPROVED' && !rs.past) {
				label = '요청 완료';
				disabled = true;
			} else if (rs?.approvalState === 'REQUESTED') {
				label = '요청 대기';
				disabled = true;
			} else if (rs?.approvalState === 'CANCELED' || rs?.approvalState === 'NO_SHOW') {
				// 취소면 다시 신청 가능
				label = '재신청 가능';
				disabled = false;
			}

			return {
				과목: r.subjectName ?? '',
				교수: r.professorName ?? '',
				메시지: r.aiStudentMessage ?? '',
				상담요청: (
					<button
						type="button"
						className="button"
						disabled={disabled}
						onClick={(ev) => {
							ev.stopPropagation();
							if (disabled) return;
							navigate(`/counseling/manage?subjectId=${r.subjectId}`);
						}}
					>
						{label}
					</button>
				),
			};
		});
	}, [filteredRiskList, navigate, reserveStateBySubjectId]);

	return (
		<div className="risk-wrap">
			<h1>내 학업 상태</h1>

			<div>
				<h3>내 위험 과목</h3>
				{/* 과목 선택 옵션 */}
				<div className="filter-bar">
					<OptionForm
						label="과목"
						name="subjectId"
						value={selectedSubjectId}
						onChange={(e) => setSelectedSubjectId(e.target.value)}
						options={subjectOptions}
					/>
				</div>
				<DataTable headers={headers} data={tableData} />
			</div>
		</div>
	);
}
