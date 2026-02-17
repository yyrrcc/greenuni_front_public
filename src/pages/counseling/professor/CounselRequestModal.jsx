import { useEffect, useState } from 'react';
import api from '../../../api/httpClient';
import SelectDateForCounseling from '../counselingManage/util/SelectDateForCounseling';
import '../../../assets/css/ProfessorCounselRequestModal.css';
import TextField from '../../../components/form/TextField';

/**
 * 교수가 학생에게 상담 요청 보내는 모달
 * @param {boolean} open - 모달 열림 상태
 * @param {object} target - { studentId, studentName, subjectId, subjectName }
 * @param {function} onClose - 모달 닫기
 * @param {function} onSuccess - 요청 성공 시 콜백
 */
export default function ProfessorCounselRequestModal({ open, target, onClose, onSuccess }) {
	const [selectedSlot, setSelectedSlot] = useState(null);
	const [reason, setReason] = useState('');
	const [loading, setLoading] = useState(false);

	// 모달 열릴 때: weekly에서 저장한 가능한 슬롯만 불러오게 처리
	useEffect(() => {
		if (!open) return;
		setSelectedSlot(null);
		setReason('');
	}, [open]);

	const submit = async () => {
		if (!target) return;
		if (!selectedSlot) {
			alert('상담 시간을 선택해 주세요.');
			return;
		}

		try {
			setLoading(true);

			await api.post('/reserve/pre/professor', {
				studentId: target.studentId,
				subjectId: target.subjectId,
				counselingScheduleId: selectedSlot.id,
				reason: reason || '',
			});

			alert('상담 요청을 보냈습니다.');
			onSuccess?.();
			onClose?.();
		} catch (e) {
			console.error(e);
			alert(e?.response?.data?.message ?? '상담 요청 실패');
		} finally {
			setLoading(false);
		}
	};

	if (!open) return null;

	return (
		<div className="pcm-backdrop" onClick={onClose}>
			<div className="pcm-content">
				<div className="pcm-modal" onClick={(e) => e.stopPropagation()}>
					<div className="pcm-head">
						<h3 className="pcm-title">상담 요청 보내기</h3>
						<button type="button" className="pcm-x" onClick={onClose} aria-label="닫기">
							×
						</button>
					</div>

					<div className="pcm-info">
						<div>
							<strong>학생</strong>: {target?.studentName} ({target?.studentId})
						</div>
						<div>
							<strong>과목</strong>: {target?.subjectName}
						</div>
					</div>

					<div className="pcm-row">
						{/* 상담 시간 */}
						<SelectDateForCounseling userRole="professor" onSelectSlot={setSelectedSlot} />
					</div>

					<div className="pcm-row pcm-col">
						<TextField
							label="요청 메시지(선택)"
							name="requestMessage"
							rows={4}
							placeholder="예) 성적 관련 상담이 필요합니다."
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>
					</div>

					<div className="pcm-actions">
						<button type="button" className="pcm-btn" onClick={onClose}>
							취소
						</button>
						<button
							type="button"
							className="pcm-btn pcm-btn-primary"
							onClick={submit}
							disabled={!selectedSlot || loading}
						>
							{loading ? '요청 중...' : '요청 보내기'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
