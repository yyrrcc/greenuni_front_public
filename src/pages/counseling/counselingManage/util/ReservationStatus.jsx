// 상담 예약 상태 텍스트 변환
export function reservationStatus(status) {
	if (status === 'REQUESTED') return '승인 대기';
	if (status === 'APPROVED') return '승인 완료';
	if (status === 'REJECTED') return '반려';
	if (status === 'FINISHED') return '상담 완료';
	if (status === 'CANCELED') return '상담 취소';
	if (status === 'NO_SHOW') return '노쇼';
	return '';
}
