// 역할별 헤더 라벨 최소 정의
const HEADER_ORDER = {
	student: [
		{ key: 'HOME', label: '홈' },
		{ key: 'MY', label: 'MY' },
		{ key: 'COURSE', label: '수업' },
		{ key: 'ENROLL', label: '수강신청' },
		{ key: 'GRADE', label: '성적' },
		{ key: 'INFO', label: '학사 정보' },
		{ key: 'COUNSELING', label: '학업지원·상담' },
	],
	staff: [
		{ key: 'HOME', label: '홈' },
		{ key: 'MY', label: 'MY' },
		{ key: 'MANAGE', label: '학사 관리' },
		{ key: 'REGISTER', label: '등록' },
		{ key: 'INFO', label: '학사 정보' },
	],
	professor: [
		{ key: 'HOME', label: '홈' },
		{ key: 'MY', label: 'MY' },
		{ key: 'COURSE', label: '수업' },
		{ key: 'INFO', label: '학사 정보' },
		{ key: 'COUNSELING_MANAGEMENT', label: '모니터링·상담' },
	],
};

// 역할 + 헤더키 기준 사이드바 + 경로
export const SIDEBAR_BY_HEADER = {
	student: {
		MY: [
			{ key: 'INFO_STU', label: '내 정보 조회', path: '/user/info' },
			{ key: 'PW', label: '비밀번호 변경', path: '/user/update/password' },
			{ key: 'BREAK_APP', label: '휴학 신청', path: '/break/application' },
			{ key: 'BREAK_LIST', label: '휴학 내역 조회', path: '/break/list' },
			{ key: 'BREAK_DETAIL', label: '휴학 상세', path: '/break/detail', hidden: true },
			{ key: 'TUI_LIST', label: '등록금 내역 조회', path: '/tuition' },
			{ key: 'TUI_PAY', label: '등록금 납부 고지서', path: '/tuition/payment' },
		],

		COURSE: [{ key: 'SUBJECT_ALL', label: '전체 강의 조회', path: '/subject/list' }],

		ENROLL: [
			{ key: 'TIMETABLE', label: '강의 시간표 조회', path: '/sugang/list' },
			{ key: 'PRE_SUGANG', label: '예비 수강 신청', path: '/sugang/pre' },
			{ key: 'APP', label: '수강 신청', path: '/sugang' },
			{ key: 'SUGANG_LIST', label: '수강 신청 내역 조회', path: '/sugang/timetable' },
		],

		GRADE: [
			{ key: 'G_CUR', label: '금학기 성적 조회', path: '/grade/current' },
			{ key: 'G_SEM', label: '학기별 성적 조회', path: '/grade/semester' },
			{ key: 'G_TOT', label: '누계 성적', path: '/grade/total' },
			{ key: 'G_POLICY', label: '성적 산출 기준', path: '/grade/policy' },
		],

		INFO: [
			{ key: 'NOTICE', label: '공지사항', path: '/notice' },
			{ key: 'SCHEDULE', label: '학사일정', path: '/schedule' },
		],
		COUNSELING: [
			{ key: 'MY_STATUS', label: '내 학업 상태', path: '/status' },
			{ key: 'COUNSELING_MANEGE', label: '상담 관리', path: '/counseling/manage' },
			// { key: 'COUNSELING_RESERVE', label: '상담 예약/관리', path: '/counseling/reserve' },
			{ key: 'VIDEO', label: '상담 바로가기', path: '/videotest' },
		],
	},

	staff: {
		MY: [
			{ key: 'INFO_STAFF', label: '내 정보 조회', path: '/user/info' },
			{ key: 'PW', label: '비밀번호 변경', path: '/user/update/password' },
		],

		MANAGE: [
			{ key: 'STU_LIST', label: '학생 명단 조회', path: '/student/list' },
			{ key: 'PRO_LIST', label: '교수 명단 조회', path: '/professor/list' },

			{ key: 'CRT_USER', label: '유저 등록', path: '/user/create' },

			{ key: 'TUI_BILL', label: '등록금 고지서 발송', path: '/tuition/bill' },
			{ key: 'BREAK_STAFF', label: '휴학 처리', path: '/break/list/staff' },
			{ key: 'BREAK_DETAIL', label: '휴학 상세', path: '/break/detail', hidden: true },

			{ key: 'SUGANG_SET', label: '수강신청 기간 설정', path: '/sugang/period' },
		],

		REGISTER: [
			{ key: 'COL', label: '단과 대학', path: '/admin/college' },
			{ key: 'DEPT', label: '학과', path: '/admin/department' },
			{ key: 'ROOM', label: '강의실', path: '/admin/room' },
			{ key: 'SUB', label: '강의', path: '/admin/subject' },
			{ key: 'COL_TUITUION', label: '단대별 등록금', path: '/admin/colltuit' },
		],

		INFO: [
			{ key: 'NOTICE', label: '공지사항', path: '/notice' },
			{ key: 'SCHEDULE', label: '학사일정', path: '/schedule' },
			{ key: 'SCHEDULE_W', label: '학사일정 등록', path: '/schedule/write' },
		],
	},

	professor: {
		MY: [
			{ key: 'INFO_PRO', label: '내 정보 조회', path: '/user/info' },
			{ key: 'PW', label: '비밀번호 변경', path: '/user/update/password' },
		],

		COURSE: [
			{ key: 'SUBJECT_ALL', label: '전체 강의 조회', path: '/subject/list' },
			{ key: 'MY_SUB', label: '내 강의 조회', path: '/professor/subject' },
			{ key: 'GRADE_AI', label: '성적 입력 및 분석', path: '/professor/ai' },
			{ key: 'EVAL', label: '내 강의 평가', path: '/professor/evaluation' },
			{ key: 'G_POLICY', label: '성적 산출 기준', path: '/grade/policy' },
		],

		INFO: [
			{ key: 'NOTICE', label: '공지사항', path: '/notice' },
			{ key: 'SCHEDULE', label: '학사일정', path: '/schedule' },
		],
		COUNSELING_MANAGEMENT: [
			{ key: 'STUDENT_MANAGEMENT', label: '위험 학생 관리', path: '/professor/counseling/risk' },
			{ key: 'COUNSELING_MANEGE', label: '상담 관리', path: '/counseling/manage' },
			// { key: 'COUNSELING_MANAGEMENT', label: '상담 관리', path: '/professor/counseling/approved' },
			{ key: 'MY_COUNSELING', label: '상담 시간 설정', path: '/professor/counseling/schedule' },
			{ key: 'VIDEO', label: '상담 바로가기', path: '/videotest' },
		],
	},
};

//  헤더는 첫 번째 사이드 메뉴 path로 자동 생성
export const HEADER_MENUS = Object.fromEntries(
	Object.entries(HEADER_ORDER).map(([role, headers]) => {
		const groups = SIDEBAR_BY_HEADER[role] ?? {};

		const built = headers.map((h) => {
			const first = (groups[h.key] ?? [])[0];
			const path = first?.path ?? '/portal';

			// 매칭도 그냥 해당 그룹 path들로 단순 처리
			const match = (groups[h.key] ?? []).map((m) => m.path);
			if (match.length === 0) match.push(path);

			return { key: h.key, label: h.label, path, match };
		});

		return [role, built];
	})
);

// 현재 경로로 활성 헤더키 찾기
export function getActiveHeaderKey(userRole, pathname) {
	const headers = HEADER_MENUS[userRole] ?? [];
	const found = headers.find((h) => (h.match ?? [h.path]).some((p) => pathname === p || pathname.startsWith(p + '/')));
	return found?.key ?? 'HOME';
}

// 사이드 메뉴 가져오기
export function getSidebarMenus(userRole, headerKey) {
	return SIDEBAR_BY_HEADER[userRole]?.[headerKey] ?? [];
}
