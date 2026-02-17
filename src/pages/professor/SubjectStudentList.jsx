import { useMemo } from 'react';
import useSubjectGrade from '../../hooks/useSubjectGrade';
import DataTable from '../../components/table/DataTable';

export default function SubjectStudentList({ subjectId, subName, setListOpen }) {
	const { studentList, stuNum, subNumOfStudent, relative } = useSubjectGrade(subjectId);

	// 테이블 헤더 (동적 생성)
	const headers = useMemo(() => {
		return [
			'번호',
			'이름',
			'소속',
			'결석',
			'지각',
			'과제점수',
			'중간시험',
			'기말시험',
			'환산점수',
			...(subNumOfStudent < 20 || relative ? ['등급'] : []),
			'경고여부',
		];
	}, [subNumOfStudent, relative]);

	// 테이블 데이터
	const tableData = useMemo(() => {
		return (studentList ?? []).map((s) => ({
			번호: s.studentId,
			이름: s.studentName,
			소속: s.deptName,
			결석: s.absent || '-',
			지각: s.lateness || '-',
			과제점수: s.homework || '-',
			중간시험: s.midExam || '-',
			기말시험: s.finalExam || '-',
			환산점수: s.convertedMark || '-',
			...(subNumOfStudent < 20 || relative ? { 등급: s.letterGrade || '-' } : {}),
			경고여부: s.status || '-',
		}));
	}, [studentList, subNumOfStudent, relative]);

	return (
		<div>
			<h2>[{subName}] 학생 리스트 조회</h2>
			<hr />

			{studentList && studentList.length > 0 ? (
				<>
					<h4>
						수강 인원: {stuNum}명 ({stuNum < 20 ? '절대평가' : '상대평가'})
					</h4>

					{/* 필요 없으면 이 버튼도 삭제 가능 */}
					<button onClick={() => setListOpen(false)} className="syllabus-btn">
						내 강의 목록
					</button>

					<DataTable headers={headers} data={tableData} />
				</>
			) : (
				<h4>해당 강의를 수강하는 학생이 존재하지 않습니다.</h4>
			)}
		</div>
	);
}
