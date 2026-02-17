import { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable from '../../components/table/DataTable';
import api from '../../api/httpClient';
// 이번 학기 성적 조회
const ThisGrade = () => {
	const [gradeList, setGradeList] = useState([]); // 과목별 성적
	const [myGrade, setMyGrade] = useState(null); // 누계 성적

	useEffect(() => {
		const fetchThisSemester = async () => {
			try {
				const res = await api.get('/grade/current');
				setGradeList(res.data.gradeList);
				setMyGrade(res.data.mygrade);
			} catch (e) {
				console.error('이번 학기 성적 조회 실패 : ', e);
			}
		};
		fetchThisSemester();
	}, []);

	// 강의 평가 팝업 열기
	const openEvaluation = useCallback((subjectId, subjectName) => {
		const url = `/evaluation?subjectId=${subjectId}&subjectName=${encodeURIComponent(subjectName)}`;
		window.open(url, '_blank', 'width=900,height=800,scrollbars=yes');
	}, []);

	const headers1 = ['연도', '학기', '과목번호', '과목명', '강의 구분', '이수학점', '성적', '강의평가'];

	// 테이블 데이터
	const subjectRows = useMemo(() => {
		return (gradeList ?? []).map((g) => ({
			연도: g.subYear ? `${g.subYear}년` : '',
			학기: g.semester ? `${g.semester}학기` : '',
			과목번호: g.subjectId ?? '',
			과목명: g.name ?? '',
			'강의 구분': g.type ?? '',
			이수학점: g.credits ?? '',
			성적: g.letterGrade ?? '',
			강의평가:
				g.evaluationId == null ? (
					<button type="button" className="syllabus-btn" onClick={() => openEvaluation(g.subjectId, g.name)}>
						강의평가
					</button>
				) : (
					<span>완료</span>
				),
		}));
	}, [gradeList, openEvaluation]);

	const headers2 = ['연도', '학기', '신청학점', '취득학점', '평점평균'];

	const myGradeRows = useMemo(() => {
		if (!myGrade) return [];
		return [
			{
				연도: myGrade.subYear ? `${myGrade.subYear}년` : '',
				학기: myGrade.semester ? `${myGrade.semester}학기` : '',
				신청학점: myGrade.totalCredits ?? '',
				취득학점: myGrade.myGrades ?? '',
				평점평균: myGrade.average ?? myGrade.avg ?? '-',
			},
		];
	}, [myGrade]);

	const hasNoGrade = gradeList.length === 0 && !myGrade;

	// 평가여부 검증 (evaluationId === null 검사)
	// 하나라도 null 이면 누계학점 안 뜸
	const hasNull = gradeList.some((g) => g.evaluationId == null);

	return (
		<div className="grade-page">
			<div>
				<h1>금학기 성적 조회</h1>
				<div className="split--div"></div>

				{hasNoGrade ? (
					<p className="no--list--p">강의 신청 및 수강 이력 확인 바랍니다.</p>
				) : (
					<>
						<div>
							<h4>과목별 성적</h4>
							<DataTable headers={headers1} data={subjectRows} />
							<p>※ 강의 평가 후 누계 성적 조회 가능</p>
						</div>

						{/* 강의평가가 하나라도 안 되어있으면 누계성적 출력안함(임시) */}
						{hasNull === false && (
							<div>
								<hr />

								<div>
									<h4>누계 성적</h4>
									<DataTable headers={headers2} data={myGradeRows} />
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default ThisGrade;
