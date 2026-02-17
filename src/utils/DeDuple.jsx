export function refineList(arr) {
	// 학기 조회 선택창 용 유틸
	// 중복 제거, 정렬 후 2023년 1학기로 반환

	// 1) 중복 제거 (id + subYear + semester 기준)
	const deduped = [...new Map(arr.map((item) => [`${item.subYear}_${item.semester}`, item])).values()];

	// 2) subYear(내림차순) → semester(내림차순) 정렬
	deduped.sort((a, b) => {
		if (b.subYear !== a.subYear) return b.subYear - a.subYear; // 년도 큰 순
		return b.semester - a.semester; // 학기 큰 순 (2 → 1)
	});

	// OptionForm 형태로 변환
	return deduped.map((item) => ({
		value: `${item.subYear}_${item.semester}`,
		label: `${item.subYear}년 ${item.semester}학기`,
		subYear: item.subYear,
		semester: item.semester,
	}));
}
