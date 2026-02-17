import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../api/httpClient';
import OptionForm from '../../components/form/OptionForm';
import DataTable from '../../components/table/DataTable';
import GradeInput from './GradeInput';
import useSubjectGrade from '../../hooks/useSubjectGrade';

export default function ProfessorAiGrade() {
	const navigate = useNavigate();

	// 내 과목 목록
	const [subjectList, setSubjectList] = useState([]);
	const [subjectOptions, setSubjectOptions] = useState([]);

	// 선택된 과목
	const [selectedSubjectId, setSelectedSubjectId] = useState('');
	const selectedSubName = useMemo(() => {
		const found = subjectList.find((s) => String(s.id) === String(selectedSubjectId));
		return found?.name ?? '';
	}, [subjectList, selectedSubjectId]);

	// 성적 입력 모달
	const [openGrade, setOpenGrade] = useState(false);
	const [gradeItem, setGradeItem] = useState([]);

	// 과목 로드
	useEffect(() => {
		const load = async () => {
			try {
				const res = await api.get('/professor/subject');
				console.log('과목', res.data);
				const list = res.data?.subjectList ?? [];
				setSubjectList(list);

				// 맨 위 기본 옵션(placeholder)
				const opts = [
					{ value: '', label: '과목 선택' },
					...list.map((s) => ({
						value: String(s.id),
						label: s.name ?? String(s.id),
					})),
				];
				setSubjectOptions(opts);
				setSelectedSubjectId('');
			} catch (e) {
				console.log(e);
				setSubjectList([]);
				setSubjectOptions([{ value: '', label: '과목 선택' }]);
				setSelectedSubjectId('');
			}
		};
		load();
	}, []);

	// 선택된 과목 ID로 훅 실행
	const {
		studentList,
		stuNum,
		subNumOfStudent,
		relative,
		aiStatus,
		aiMessage,
		loading,
		calculateGrade,
		finalizeGrade,
		refetch,
	} = useSubjectGrade(selectedSubjectId ? Number(selectedSubjectId) : undefined);

	const handleOpenGrade = (student) => {
		if (!selectedSubjectId) return;
		setGradeItem([{ ...student, subjectId: Number(selectedSubjectId) }]);
		setOpenGrade(true);
	};

	// 테이블 헤더
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
			'점수기입',
		];
	}, [subNumOfStudent, relative]);

	// 테이블 데이터
	// eslint-disable-next-line react-hooks/preserve-manual-memoization
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
			점수기입: (
				<button
					onClick={() => handleOpenGrade(s)}
					className="syllabus-btn"
					disabled={s.finalized || aiStatus === 'SUCCESS'}
				>
					{s.finalized || aiStatus === 'SUCCESS' ? '확정완료' : '점수기입'}
				</button>
			),
		}));
	}, [studentList, subNumOfStudent, relative, aiStatus]);

	if (openGrade) {
		return <GradeInput gradeItem={gradeItem} setOpenGrade={setOpenGrade} stuNum={stuNum} onSuccess={refetch} />;
	}

	return (
		<div className="form-container">
			<h2 style={{ marginBottom: 12 }}>성적 입력 / AI 분석</h2>

			{/* 과목 선택 */}
			{subjectOptions.length > 0 ? (
				<div style={{ marginBottom: 12 }}>
					<OptionForm
						name="subjectId"
						label="과목 선택"
						value={String(selectedSubjectId)}
						onChange={(e) => setSelectedSubjectId(e.target.value)}
						options={subjectOptions}
					/>
				</div>
			) : (
				<h4>현재 담당 과목이 없습니다.</h4>
			)}

			{/* 과목 선택 안 된 경우 */}
			{!selectedSubjectId && subjectOptions.length > 0 && <h4>과목을 선택해주세요.</h4>}

			{/* 선택된 과목 영역 */}
			{selectedSubjectId && (
				<div>
					<h3 style={{ marginTop: 8 }}>[{selectedSubName}] 학생 리스트 조회</h3>
					<hr />

					{/* AI 분석 완료 */}
					{aiStatus === 'SUCCESS' && (
						<div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
							<h3 style={{ color: '#2563eb' }}>✅ AI 분석 완료</h3>
							<p style={{ color: '#666', marginBottom: '12px' }}>{aiMessage}</p>
							<button
								onClick={() => navigate('/professor/counseling/risk')}
								style={{
									backgroundColor: '#2563eb',
									color: 'white',
									padding: '12px 24px',
									border: 'none',
									borderRadius: '6px',
									cursor: 'pointer',
								}}
							>
								위험 학생 관리 보러가기 →
							</button>
						</div>
					)}

					{/* ✅ AI 분석 실패 (다시 돌릴 수 있게) */}
					{aiStatus === 'FAIL' && (
						<div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#fee', borderRadius: '8px' }}>
							<h3 style={{ color: '#dc2626' }}>❌ AI 분석 실패</h3>
							{/* <p style={{ color: '#666', marginBottom: '12px' }}>{aiMessage}</p> */}
							<button
								onClick={finalizeGrade}
								disabled={loading}
								style={{
									backgroundColor: '#dc2626',
									color: 'white',
									padding: '12px 24px',
									border: 'none',
									borderRadius: '6px',
									cursor: 'pointer',
								}}
							>
								다시 AI 돌리기
							</button>
						</div>
					)}

					{/* 성적 확정 */}
					{aiStatus !== 'SUCCESS' && aiStatus !== 'FAIL' && (
						<div style={{ marginBottom: '12px' }}>
							<h3>최종 성적 확정</h3>
							<button onClick={finalizeGrade} disabled={loading || aiStatus === 'RUNNING'}>
								{loading ? '성적 확정 및 AI 분석 중...' : '확정하고 AI 돌리기'}
							</button>
							{/* <span style={{ marginLeft: '10px' }}>{aiStatus === 'RUNNING' && '분석중'}</span> */}
							{aiMessage && <div style={{ marginTop: '6px', color: '#666' }}>{aiMessage}</div>}
						</div>
					)}

					{/* 학생 리스트 */}
					{studentList.length > 0 ? (
						<>
							<h4>
								수강 인원: {stuNum}명 ({stuNum < 20 ? '절대평가' : '상대평가'})
							</h4>
							{stuNum >= 20 && <button onClick={calculateGrade}>전체 학생 등급 산출</button>}
							<p>* 직접 수정한 등급도 전체 등급 재산출 시 자동 등급으로 변경됩니다.</p>
							{/* <button onClick={() => setListOpen(false)} className="syllabus-btn">
								내 강의 목록
							</button> */}
							<DataTable headers={headers} data={tableData} />
						</>
					) : (
						<h4>해당 강의를 수강하는 학생이 존재하지 않습니다.</h4>
					)}
				</div>
			)}
		</div>
	);
}
