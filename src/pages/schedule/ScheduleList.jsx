import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/httpClient';
import DataTable from '../../components/table/DataTable';
import { UserContext } from '../../context/UserContext';
import '../../assets/css/ScheduleList.css';

const ScheduleList = () => {
	const navigate = useNavigate();
	const { userRole } = useContext(UserContext);

	const isStaff = userRole === 'staff';

	const [scheduleList, setScheduleList] = useState([]);

	// DataTable 헤더 (공용/직원 동일)
	const headers = ['ID', '기간', '내용'];

	const formatRange = (s) => {
		const start = s.startDay ? String(s.startDay) : '';
		const end = s.endDay ? String(s.endDay) : '';
		if (!start && !end) return '';
		if (start && end) return `${start} ~ ${end}`;
		return start || end;
	};

	const loadSchedules = async () => {
		try {
			// 공용 조회 엔드포인트 하나만 사용
			const res = await api.get('/schedule');
			console.log(res.data);
			const raw = res.data.schedules || [];

			// 1. 날짜 순 정렬 (내림차순: 최신 -> 옛날)
			// 문자열 날짜("2025-01-01")는 localeCompare로 비교하는 게 가장 안전하고 정확함
			raw.sort((a, b) => {
				const dateA = a.startDay || '';
				const dateB = b.startDay || '';
				return dateB.localeCompare(dateA);
			});

			// 2. 데이터 가공 + 순번(ID) 새로 매기기
			const formatted = raw.map((s, index) => ({
				id: s.id, // 실제 DB ID (상세페이지 이동용, 화면엔 안 보임)
				ID: raw.length - index, // 화면 표시용 순번
				기간: formatRange(s),
				내용: s.information,
				원본데이터: s,
			}));

			setScheduleList(formatted);
		} catch (e) {
			console.error('학사 일정 로드 실패:', e);
		}
	};

	useEffect(() => {
		loadSchedules();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="form-container schedule-page schedule-list">
			<h3>학사 일정</h3>
			<div className="split--div"></div>

			<DataTable
				headers={headers}
				data={scheduleList}
				// 직원만 상세로 이동
				onRowClick={
					isStaff
						? (row) => {
								const id = row?.id;
								if (id) navigate(`/schedule/detail/${id}`);
						  }
						: undefined
				}
			/>

			{/* 직원만 등록 버튼  */}
			{isStaff && (
				<div className="schedule-list-actions">
					<button className="button schedule-register-btn" onClick={() => navigate('/schedule/write')}>
						등록
					</button>
				</div>
			)}
		</div>
	);
};

export default ScheduleList;
