// 상담 시 필요한

import { getMonday, getWeekDates } from './DateTimeUtil';

// 지난 시간인지 체크하는 함수
export const isPastSlot = (date, startTime) => {
	const slotTime = new Date(`${date}T${String(startTime).padStart(2, '0')}:00:00`);
	return slotTime <= new Date(); // 지금보다 과거면 true
};

// 날짜별로 그룹 만드는 함수
// export const groupByDate = (schedules) => {
// 	const result = {};
// 	schedules.forEach((schedule) => {
// 		const date = schedule.counselingDate;
// 		if (!result[date]) result[date] = [];
// 		result[date].push(schedule);
// 	});

// 	return result;
// };

// 오늘 날짜 기준으로 weekStartDate 계산
export const getThisAndNextWeekStartDates = () => {
	const today = new Date();
	const thisMonday = getMonday(today);
	const thisWsd = getWeekDates(thisMonday)[0];
	return thisWsd;
};
