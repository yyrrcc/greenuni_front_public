import { useCallback, useContext, useEffect, useState } from 'react';
import api from '../../../api/httpClient';
import '../../../assets/css/ReserveForm.css';
import SubjectSelect from './util/SubjectSelect';
import SelectDateForCounseling from '../counselingManage/util/SelectDateForCounseling';
import { CounselingRefreshContext } from './util/CounselingRefreshContext';
import TextField from '../../../components/form/TextField';

/**
 * 학생이 과목 선택 후 상담 예약하는 폼
 */
export default function ReserveForm({ paramId }) {
	const [subjects, setSubjects] = useState([]);
	const [selectedSubjectId, setSelectedSubjectId] = useState('');
	const [selectedSlot, setSelectedSlot] = useState(null);
	const [reason, setReason] = useState('');
	const { refresh } = useContext(CounselingRefreshContext);
	const [loading, setLoading] = useState(false);

	// 학생 수강 과목 조회
	const fetchSubjectsThisSemester = useCallback(async () => {
		try {
			const res = await api.get('/subject/semester');
			setSubjects(res.data?.subjectList ?? []);
		} catch (e) {
			console.error(e);
		}
	}, []);

	useEffect(() => {
		fetchSubjectsThisSemester();
	}, [fetchSubjectsThisSemester]);

	useEffect(() => {
		if (paramId) setSelectedSubjectId(paramId);
	}, [paramId]);

	// 🔥 슬롯 선택 콜백 (SelectDateForCounseling에서 호출됨)
	const handleSlotSelect = (slot) => {
		setSelectedSlot(slot);
		console.log('선택된 슬롯:', slot);
	};

	// 상담 신청
	const submit = async () => {
		if (!selectedSlot || !reason.trim()) {
			alert('시간과 사유를 모두 입력해 주세요.');
			return;
		}

		try {
			setLoading(true);
			await api.post('/reserve', {
				counselingScheduleId: selectedSlot.id,
				subjectId: selectedSubjectId,
				reason,
			});

			alert('상담 신청 완료');
			setSelectedSubjectId(''); // 과목 초기화
			setSelectedSlot(null);
			setReason('');
			refresh(); // 목록 새로고침
		} catch (e) {
			console.error(e);
			alert(e?.response?.data?.message ?? '상담 신청 실패');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="reserve-schedule">
			{/* 과목 선택 */}
			<SubjectSelect
				subjects={subjects}
				value={selectedSubjectId}
				onChange={(e) => setSelectedSubjectId(e.target.value)}
			/>

			{/* 과목 선택 시 상담 일정 표시 */}
			{selectedSubjectId && (
				<div className="reserve-schedule">
					{/* 과목 선택 시 날짜 선택 표시 */}
					<SelectDateForCounseling userRole="student" subjectId={selectedSubjectId} onSelectSlot={handleSlotSelect} />

					<div className="rf-reason-section">
						<TextField
							label="상담 사유"
							name="reason"
							rows={4}
							placeholder="예) 성적 관련 상담이 필요합니다."
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>
					</div>

					<button className="rf-submit-btn" disabled={!selectedSlot || !reason.trim() || loading} onClick={submit}>
						상담 신청
					</button>
				</div>
			)}
		</div>
	);
}
