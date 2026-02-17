import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../context/UserContext';
import api from '../../../api/httpClient';

import SentCounseling from './SentCounsling';
import RequestedCounseling from './RequestedCounseling';
import ApprovedCounseling from './ApporvedCounseling';
import CompletedCounseling from './CompletedCounseling';
import ReserveForm from './ReserveForm';
import '../../../assets/css/MyCounselingManage.css';

import { combinedListFilter, extractSubjects, listFilterBySubject } from './util/ListFilter';
import { CounselingRefreshContext } from './util/CounselingRefreshContext';
import { useSearchParams } from 'react-router-dom';

// 상담 관리/ 예약 제일 상위 컴포넌트, 상담 데이터 이용 검색, 데이터 내려주기
export default function CounselingManageMent() {
	const { userRole } = useContext(UserContext);
	const { refreshKey } = useContext(CounselingRefreshContext);

	// 원본 데이터
	const [listByProfessor, setListByProfessor] = useState([]);
	const [listByStudent, setListByStudent] = useState([]);

	// 과목 필터
	const [subjectOptions, setSubjectOptions] = useState([]);
	const [selectedSubject, setSelectedSubject] = useState('');

	// 내 위험 과목에서 넘어온 경우 처리
	const [searchParams] = useSearchParams();
	const paramId = searchParams.get('subjectId');

	const loadCounselingList = async () => {
		try {
			const res = await api.get('/reserve/list/requester');
			const preRaw = res.data.RequestedByProfessor || [];
			const stuRaw = res.data.RequestedByStudent || [];

			setListByProfessor(preRaw);
			setListByStudent(stuRaw);
			setSubjectOptions(extractSubjects(preRaw, stuRaw)); // 위 데이터로 과목 필터 옵션폼 생성
		} catch (e) {
			console.error(e);
			setListByProfessor([]);
			setListByStudent([]);
			setSubjectOptions([]);
		}
	};

	useEffect(() => {
		loadCounselingList();
	}, [refreshKey]);

	// 과목 필터 - 상담 요청/기록 조회 용
	const filteredProfessorList = listFilterBySubject(listByProfessor, selectedSubject);
	const filteredStudentList = listFilterBySubject(listByStudent, selectedSubject);

	// 상태 필터 - approvalState 에 따라 구분한 리스트
	const { approvedList, finishedList } = combinedListFilter(filteredProfessorList, filteredStudentList);

	return (
		<div className="cm-page">
			{/* 학생 전용 예약 */}
			{userRole === 'student' && (
				<>
					<div className="cm-header">
						<h2 className="cm-title">상담 예약</h2>
					</div>

					<section className="cm-card">
						<ReserveForm paramId={paramId} />
					</section>
				</>
			)}

			{/* 상담 관리 */}
			<div className="cm-header">
				<h2 className="cm-title">상담 관리</h2>

				<div className="cm-filter">
					<label className="cm-filter-label">상담 요청/기록 조회</label>
					<select className="cm-select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
						<option value="">전체 과목</option>
						{subjectOptions.map((s, idx) => (
							<option key={`${s.name}-${idx}`} value={s.name}>
								{s.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* 내가 요청한 상담 */}
			<section className="cm-card">
				<SentCounseling sentList={userRole === 'professor' ? filteredProfessorList : filteredStudentList} />
			</section>

			{/* 요청 받은 상담 */}
			<section className="cm-card">
				<RequestedCounseling requestByList={userRole === 'professor' ? filteredStudentList : filteredProfessorList} />
			</section>

			{/* 확정된 상담 */}
			<section className="cm-card">
				<ApprovedCounseling approvedList={approvedList} />
			</section>

			{/* 완료된 상담 */}
			<section className="cm-card">
				<CompletedCounseling finishedList={finishedList} />
			</section>
		</div>
	);
}
