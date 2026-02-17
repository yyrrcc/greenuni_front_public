import { useEffect, useState } from 'react';
import { generateWeekdays } from '../../../utils/DateTimeUtil';
import api from '../../../api/httpClient';
import '../../../assets/css/WeeklyCounselingScheduleForm.css';
import { isPastSlot } from '../../../utils/counselingUtil';
import { getThisAndNextWeekStartDates } from './../../../utils/counselingUtil';

const TIMES = [15, 16, 17, 18, 19];

// 교수가 상담 시간 설정하는 폼
export default function WeeklyCounselingScheduleForm() {
	const [dates, setDates] = useState([]);
	const [initialSlots, setInitialSlots] = useState({});
	const [slots, setSlots] = useState({});
	const [weekStartDate, setWeekStartDate] = useState('');

	// 예약된 슬롯(reserved=true) 저장
	// { '2025-12-23': [15, 16], ... }
	const [reservedSlots, setReservedSlots] = useState({});

	// 지난 날짜 비활성 + 예약된 슬롯 비활성
	const isDisabled = (date, time) => {
		const isPast = isPastSlot(date, time);
		// 예약된 슬롯이면 수정/삭제 못 하게
		const isReserved = reservedSlots?.[date]?.includes(time);
		return isPast || isReserved;
	};

	// 초기 로드
	const fetchSchedule = async (startDate) => {
		try {
			const res = await api.get('/counseling/professor', {
				params: { weekStartDate: startDate },
			});

			const initSlots = {};
			const initReserved = {};

			(res.data?.list ?? res.data).forEach(({ counselingDate, startTime, reserved }) => {
				if (!initSlots[counselingDate]) initSlots[counselingDate] = [];
				initSlots[counselingDate].push(startTime);

				if (reserved) {
					if (!initReserved[counselingDate]) initReserved[counselingDate] = [];
					initReserved[counselingDate].push(startTime);
				}
			});

			setInitialSlots(initSlots);
			setSlots(initSlots);
			setReservedSlots(initReserved);
		} catch (e) {
			console.error(e);
			alert('상담 일정 불러오기 실패');
		}
	};

	useEffect(() => {
		const mondayStr = getThisAndNextWeekStartDates();
		setWeekStartDate(mondayStr);
		// 2주 평일만 생성 (이번주 월~금 + 다음주 월~금)
		const weekdaysOnly = generateWeekdays(mondayStr);
		setDates(weekdaysOnly);
		fetchSchedule(mondayStr);
	}, []);

	/* 체크 토글 */
	const toggleSlot = (date, time) => {
		if (isDisabled(date, time)) return;

		setSlots((prev) => {
			const daySlots = prev[date] || [];
			const exists = daySlots.includes(time);

			return {
				...prev,
				[date]: exists ? daySlots.filter((t) => t !== time) : [...daySlots, time],
			};
		});
	};

	/* 삭제 대상 계산 */
	const getDeletedSlots = () => {
		const deleted = [];

		for (const date in initialSlots) {
			for (const time of initialSlots[date]) {
				// 예약된 슬롯은 삭제 대상에서 제외(프론트 안전장치)
				if (reservedSlots?.[date]?.includes(time)) continue;

				if (!slots[date]?.includes(time)) {
					deleted.push({ date, time });
				}
			}
		}
		return deleted;
	};

	/* 저장 */
	const handleSubmit = async () => {
		try {
			const deletedSlots = getDeletedSlots();

			for (const item of deletedSlots) {
				await api.delete('/counseling/professor', {
					data: {
						counselingDate: item.date,
						startTime: item.time,
					},
				});
			}

			await api.post('/counseling/professor', {
				weekStartDate,
				slots,
			});

			alert('상담 일정이 저장되었습니다.');

			// 저장 후 최신 상태 다시 로드(예약 취소 등 반영)
			await fetchSchedule(weekStartDate);
		} catch (e) {
			console.error(e);
			alert(e.response?.data?.message ?? '상담 일정 저장 실패');
		}
	};

	if (!dates.length) return null;

	return (
		<div className="form-container">
			<h2 className="weekly-title">주간 상담 일정 관리</h2>

			<p className="weekly-range">
				{dates[0]} ~ {dates[dates.length - 1]}
			</p>

			<table className="weekly-table">
				<thead>
					<tr>
						<th>날짜</th>
						{TIMES.map((t) => (
							<th key={t}>{t}:00</th>
						))}
					</tr>
				</thead>
				<tbody>
					{dates.map((date) => (
						<tr key={date}>
							<td className="weekly-date">{date}</td>
							{TIMES.map((t) => (
								<td key={t} className="weekly-slot">
									<input
										type="checkbox"
										className="weekly-checkbox"
										checked={slots[date]?.includes(t) || false}
										disabled={isDisabled(date, t)}
										onChange={() => toggleSlot(date, t)}
									/>
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>

			<button className="weekly-save-btn" onClick={handleSubmit}>
				상담 일정 저장
			</button>
		</div>
	);
}
