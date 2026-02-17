import { useEffect, useMemo, useState } from 'react';
import api from '../../api/httpClient';
import DataTable from '../../components/table/DataTable';

const TotalGrade = () => {
	const [myGradeList, setMyGradeList] = useState([]);
	const [hasEval, setHasEval] = useState(true); // 안내문구용
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const init = async () => {
			try {
				setLoading(true);

				// 안내문구용(백엔드에서 성적 필터링은 이미 처리)
				const evalRes = await api.get('/evaluation/hasEval');
				setHasEval(!!evalRes?.data?.hasEval);

				// 백엔드가 "강의평가 미완료면 이번학기 제외"해서 내려줌
				const gradeRes = await api.get('/grade/total');
				setMyGradeList(gradeRes?.data?.gradeList ?? []);
			} catch (e) {
				console.error('총 누계 성적 조회 실패', e);
				setMyGradeList([]);
				setHasEval(true);
			} finally {
				setLoading(false);
			}
		};

		init();
	}, []);

	const headers = ['연도', '학기', '신청학점', '취득학점', '평점평균'];

	const totalGrade = useMemo(() => {
		return (myGradeList ?? []).map((g) => ({
			연도: `${g.subYear}년`,
			학기: `${g.semester}학기`,
			신청학점: g.totalCredits,
			취득학점: g.myGrades,
			평점평균: g.average ?? g.avg ?? '-',
		}));
	}, [myGradeList]);

	if (loading) return <div>로딩중...</div>;

	return (
		<div className="grade-page total-grade-page">
			<h1>총 누계 성적</h1>
			<div className="split--div"></div>

			{/* 강의평가 미완료 안내 (접근은 가능, 데이터는 백엔드에서 직전학기까지만 내려옴) */}
			{!hasEval && (
				<p className="no--list--p" style={{ marginBottom: 12 }}>
					강의평가를 모두 완료하면 이번 학기 성적까지 확인할 수 있어요. (현재는 직전 학기까지 표시됩니다)
				</p>
			)}

			<div>
				{myGradeList.length === 0 ? (
					<p className="no--list--p">
						강의 신청 및 수강 이력 확인 바랍니다.
						{!hasEval ? ' (강의평가 완료 시 이번 학기 성적이 추가로 표시될 수 있어요)' : ''}
					</p>
				) : (
					<div>
						<h4>평점 평균</h4>
						<DataTable headers={headers} data={totalGrade} />
					</div>
				)}
			</div>
		</div>
	);
};

export default TotalGrade;
