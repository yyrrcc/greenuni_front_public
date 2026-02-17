import { useEffect, useMemo, useState } from 'react';
import '../../../../assets/css/SelectDateForCounseling.css';
import api from '../../../../api/httpClient';
import { getThisAndNextWeekStartDates, isPastSlot } from '../../../../utils/counselingUtil';
import { DAY_KR, endMinus10, toHHMM } from '../../../../utils/DateTimeUtil';
import OptionForm from '../../../../components/form/OptionForm';

/**
 * 교수/학생이 상담 가능한 날짜/시간 선택하는 컴포넌트
 * @param {string} userRole - 'professor' 또는 'student'
 * @param {string} subjectId - 학생용일 때 필요한 과목 ID
 * @param {function} onSelectSlot - 선택된 슬롯을 부모로 전달
 */
export default function SelectDateForCounseling({ userRole, subjectId, onSelectSlot }) {
	const [availableList, setAvailableList] = useState([]); // 가능한 상담 날짜 목록
	const [selectedSlot, setSelectedSlot] = useState(null);
	const [loading, setLoading] = useState(false);

	// 교수용: 교수가 학생한테 상담 요청 할 때
	const requestToStudent = async () => {
		try {
			setLoading(true);
			const weekStartDate = getThisAndNextWeekStartDates();
			const res = await api.get('/counseling/professor', { params: { weekStartDate } });
			// 과거 시간 슬롯 필터링
			// const rawData = res.data ?? [];
			// const futureSlots = rawData.filter((slot) => slot && !isPastSlot(slot.counselingDate, slot.startTime));
			// setAvailableList(futureSlots);
			setAvailableList(res.data ?? []); // 필터링은 아래 useMemo에서
			console.log('requestToStudent', res.data);
		} catch (e) {
			console.error(e);
			setAvailableList([]);
		} finally {
			setLoading(false);
		}
	};

	// 학생용: 학생이 교수한테 상담 요청 할 때
	const requestToProfessor = async () => {
		try {
			setLoading(true);
			const res = await api.get('/counseling/schedule', { params: { subjectId } });
			// 과거 시간 슬롯 필터링
			// const rawData = res.data?.scheduleList ?? [];
			// const futureSlots = rawData.filter((slot) => slot && !isPastSlot(slot.counselingDate, slot.startTime));
			// setAvailableList(futureSlots);
			setAvailableList(res.data?.scheduleList ?? []); // 필터링은 아래 useMemo에서
			console.log('requestToProfessor', res.data.scheduleList);
		} catch (e) {
			console.error(e);
			setAvailableList([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setSelectedSlot(null);
		onSelectSlot?.(null); // 과목 바뀌거나 mode 바뀔 때 부모가 이전 slotId 잡고 있다가 잘못 POST할 수 있음
		if (userRole === 'professor') {
			requestToStudent();
		} else if (userRole === 'student' && subjectId) {
			requestToProfessor();
		} else {
			setAvailableList([]);
		}
	}, [userRole, subjectId]);

	// 지난 날짜/시간 필터링 (실시간으로 계속 체크)
	const filteredList = useMemo(() => {
		return (availableList ?? []).filter((slot) => slot && !isPastSlot(slot.counselingDate, slot.startTime));
	}, [availableList]);

	// 교수용: OptionForm에 쓸 드롭다운 옵션
	const slotOptions = useMemo(() => {
		const base = [{ value: '', label: loading ? '불러오는 중...' : '시간을 선택하세요' }];
		const opts = filteredList.map((s) => {
			const date = s.counselingDate ?? '';
			const start = toHHMM(s.startTime);
			const end = endMinus10(s.endTime);
			return {
				value: String(s.id),
				label: `${date} (${DAY_KR[s.dayOfWeek] ?? ''}) ${start} ~ ${end}`,
			};
		});
		return [...base, ...opts];
	}, [filteredList, loading]);

	// 교수용: OptionForm onChange 핸들러
	const handleOptionChange = (e) => {
		const slotId = e.target.value;
		const slot = filteredList.find((s) => String(s.id) === slotId);
		setSelectedSlot(slot || null);
		onSelectSlot?.(slot || null);
	};

	// 학생용: 날짜별 그룹핑
	const groupedByDate = useMemo(() => {
		return filteredList.reduce((acc, slot) => {
			const date = slot.counselingDate;
			if (!acc[date]) acc[date] = [];
			acc[date].push(slot);
			return acc;
		}, {});
	}, [filteredList]);

	// 학생용: 버튼 클릭 핸들러
	const handleSlotClick = (slot) => {
		console.log('clicked slot =>', slot);
		setSelectedSlot(slot);
		onSelectSlot?.(slot);
	};

	if (loading) return <div className="sdc-loading">불러오는 중...</div>;

	if (!filteredList.length) {
		return <div className="sdc-empty">가능한 상담 시간이 없습니다.</div>;
	}

	// 🚀 교수용: OptionForm 드롭다운
	if (userRole === 'professor') {
		return (
			<div className="sdc-wrap">
				<OptionForm
					label="상담 시간"
					name="counselingSlot"
					value={selectedSlot?.id ? String(selectedSlot.id) : ''}
					onChange={handleOptionChange}
					options={slotOptions}
				/>
			</div>
		);
	}

	// 🚀 학생용: 날짜별 그룹 버튼
	return (
		<div className="sdc-wrap">
			<h4 className="sdc-section-title">상담 시간 선택</h4>

			<div className="sdc-date-row">
				{Object.entries(groupedByDate).map(([date, slots]) => (
					<div key={date} className="sdc-date-col">
						<div className="sdc-date-title">
							{date} ({DAY_KR[slots[0]?.dayOfWeek]})
						</div>

						<div className="sdc-time-col">
							{slots.map((s) => (
								<button
									key={s.id}
									className={`sdc-time-btn ${selectedSlot?.id === s.id ? 'sdc-active' : ''}`}
									onClick={() => handleSlotClick(s)}
								>
									{toHHMM(s.startTime)} ~ {endMinus10(s.endTime)}
								</button>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
