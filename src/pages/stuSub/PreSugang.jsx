import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import api from '../../api/httpClient';
import DataTable from '../../components/table/DataTable';
import SugangApplication from './SugangApplication';
import { toHHMM } from '../../utils/DateTimeUtil';
import { useNavigate } from 'react-router-dom';

export default function PreSugang() {
	const { user, token, userRole } = useContext(UserContext);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const [myPreList, setMyPreList] = useState([]); // 내가 신청한 예비 목록
	const [totalGrades, setTotalGrades] = useState(0); // 총 학점
	const [period, setPeriod] = useState(null);

	// 학생이 신청한 예비 강의 목록 조회
	const loadMyPreList = async () => {
		try {
			const res = await api.get('/sugang/stusublist');
			// period, preStuSubList, totalGrades
			const currentPeriod = res.data.period;
			setPeriod(currentPeriod);
			// 예비 수강 신청 기간(0)이 아니면 접근 차단
			if (currentPeriod !== 0) {
				setError('현재 예비 수강 신청 기간이 아닙니다.');
				return;
			}
			const preRaw = res.data.preStuSubList || [];
			setMyPreList(preRaw.map(mapRow));
			setTotalGrades(res.data.totalGrades || 0);
		} catch (e) {
			setError(e.response?.data?.message || '예비 목록 조회 실패');
			console.error('예비 목록 조회 실패:', e);
		}
	};

	// 백에서 받은 데이터를 map으로 돌리기
	const mapRow = (sub) => ({
		id: sub.id,
		학수번호: sub.subjectId,
		강의명: sub.subjectName,
		담당교수: sub.professorName,
		학점: sub.credits,
		'요일시간 (강의실)': `${sub.subDay}, ${sub.startTime}-${sub.endTime} (${sub.roomId})`,
		현재인원: sub.numOfStudent,
		정원: sub.capacity,
		//		예비신청: '취소',
	});

	// 예비 신청 데이터 포맷팅
	const formatPreRowData = (sub, actionLabel) => ({
		id: sub.id,
		단과대학: sub.collName,
		개설학과: sub.deptName,
		학수번호: sub.id,
		강의구분: sub.type,
		강의명: sub.name,
		담당교수: sub.professorName,
		학점: sub.credits,
		'요일시간 (강의실)': `${sub.subDay}, ${toHHMM(sub.startTime)}-${toHHMM(sub.endTime)} (${sub.roomId})`,
		현재인원: sub.numOfStudent,
		정원: sub.capacity,
		isEnrolled: sub.status,
		[actionLabel]: sub.status ? '취소' : '신청',
	});

	// 예비 신청/취소 핸들러
	const handlePreAction = async (row, reloadList, currentPage, searchForm) => {
		// console.log('row', row);
		const isEnrolled = row.isEnrolled;
		try {
			if (isEnrolled) {
				if (!window.confirm('예비 수강 신청을 취소하시겠습니까?')) return;
				await api.delete(`/sugang/pre/${row.id}`);
			} else {
				if (!window.confirm('해당 강의를 예비 수강 신청 하시겠습니까?')) return;
				await api.post(`/sugang/pre/${row.id}`);
			}
			await reloadList(currentPage, searchForm);
			await loadMyPreList();
		} catch (err) {
			alert(err.response?.data?.message || '처리 중 오류가 발생했습니다.');
		}
	};

	useEffect(() => {
		loadMyPreList();
	}, []);

	const headers = [
		'학수번호',
		'강의명',
		'담당교수',
		'학점',
		'요일시간 (강의실)',
		'현재인원',
		'정원',
		// '예비신청'
	];

	// 에러 화면 (기간 아닐 때)
	if (error) {
		return (
			<div style={{ padding: '50px', textAlign: 'center' }}>
				<h2>🚫 알림</h2>
				<h3 style={{ color: 'red', marginTop: '20px' }}>
					{period === 1 && '현재 수강 신청 기간입니다.'}
					{period === 2 && '수강 신청이 종료되었습니다.'}
					{period === null && '학사 일정을 불러올 수 없습니다.'}
				</h3>
				<p style={{ marginTop: '10px', fontSize: '16px' }}>
					{period === 1 && '수강 신청 페이지를 이용해주세요.'}
					{period === null && '관리자에게 문의하세요.'}
				</p>
				<button
					onClick={() => navigate('/portal')}
					style={{
						padding: '10px 20px',
						cursor: 'pointer',
						marginTop: '20px',
						backgroundColor: '#2b492eff',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
					}}
				>
					메인으로 돌아가기
				</button>
			</div>
		);
	}

	return (
		<>
			<h2>예비 수강 신청 (장바구니)</h2>
			{myPreList.length > 0 && (
				<>
					<h3>내 예비 수강 신청 목록 (총 {totalGrades}학점)</h3>
					<DataTable
						headers={headers}
						data={myPreList}
						clickableHeaders="예비신청"
						onCellClick={async ({ row, header }) => {
							if (header === '예비신청') {
								await handlePreAction(row);
							}
						}}
					/>
					<hr style={{ margin: '30px 0' }} />
				</>
			)}

			<SugangApplication
				apiEndpoint="/sugang/presubjectlist"
				actionHeaderLabel="예비신청"
				onAction={handlePreAction}
				formatRowData={formatPreRowData}
			/>
		</>
	);
}
