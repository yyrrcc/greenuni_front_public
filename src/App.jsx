import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { UserProvider } from './context/UserProvider';

import TuiList from './pages/tuition/TuiList';
import Payment from './pages/tuition/Payment';
import CreatePayment from './pages/tuition/CreatePayment';
import UserInfo from './pages/user/info/UserInfo';

import NoticeList from './pages/board/NoticeList';
import NoticeUpdate from './pages/board/NoticeUpdate';
import NoticeDetail from './pages/board/NoticeDetail';
import NoticeWrite from './pages/board/NoticeWrite';
import Subject from './pages/admin/Subject';
import AllsubList from './pages/AllSubList';
import College from './pages/admin/College';
import Department from './pages/admin/Department';
import CollTuit from './pages/admin/CollTuit';
import Room from './pages/admin/Room';
import PublicLayout from './components/layout/PublicLayout';
import PublicHome from './pages/PublicHome';
import PortalLayout from './components/layout/PortalLayout';
import Portal from './pages/Portal';
import SubList from './pages/stuSub/SubList';
import PreSugang from './pages/stuSub/PreSugang';
import Sugang from './pages/stuSub/Sugang';
import UpdatePeriod from './pages/stuSub/UpdatePeriod';
import UpdatePassword from './pages/user/update/UpdatePassword';
import ProfessorList from './pages/user/info/ProfessorList';
import StudentList from './pages/user/info/StudentList';
import ScheduleDetail from './pages/schedule/ScheduleDetail';
import ScheduleList from './pages/schedule/ScheduleList';
import ScheduleWrite from './pages/schedule/ScheduleWrite';
import ScheduleUpdate from './pages/schedule/ScheduleUpdate';
import BreakApplication from './pages/break/BreakApplication';
import BreakAppDetail from './pages/break/BreakAppDetail';
import BreakAppListStaff from './pages/break/BreakAppListStaff';
import BreakAppListStudent from './pages/break/BreakAppListStudent';
import ProfessorSubjectList from './pages/professor/ProfessorSubjectList';
import ReadSyllabusPopup from './pages/professor/ReadSyllabusPopup';
import ThisGrade from './pages/grade/ThisGrade';
import Semester from './pages/grade/Semester';
import TotalGrade from './pages/grade/TotalGrade';
import Evaluation from './pages/evaluation/Evaluation';
import MyEvaluation from './pages/evaluation/MyEvaluation';
import Timetable from './pages/stuSub/Timetable';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FindAccountPop from './pages/user/find/FindAccountPop';
import VideoCounseling from './pages/video/VideoCounseling';
import WeeklyCounselingScheduleForm from './pages/counseling/professor/WeeklyCounselingScheduleForm';
import MyRiskStudent from './pages/risk/MyRiskStudent';
import StudentMyRiskStatus from './pages/risk/StudentMyRiskStatus';
import CounselingInfoPop from './pages/counseling/professor/CounselingInfoPop';
import ProtectedRoute from './components/route/ProtectedRoute';
import GradePolicy from './pages/grade/GradePolicy';
import UserCreate from './pages/user/create/UserCreate';
import CounselingManageMent from './pages/counseling/counselingManage/CounselingManagement';
import { CounselingRefreshProvider } from './pages/counseling/counselingManage/util/CounselingRefreshProvider';
import Direction from './pages/map/Direction';
import ProfessorAiGrade from './pages/professor/ProfessorAiGrade';

function App() {
	// React Query 라이브러리
	const queryClient = new QueryClient();

	return (
		<>
			<QueryClientProvider client={queryClient}>
				<UserProvider>
					<Routes>
						{/* ========== 로그인 전 (Public) ========== */}
						<Route element={<PublicLayout />}>
							<Route path="/" element={<PublicHome />} />
							<Route path="/findAccount/:type" element={<FindAccountPop />} />
						</Route>

						{/* ========== 로그인 후 (Private) ========== */}
						<Route
							element={
								<ProtectedRoute>
									<PortalLayout />
								</ProtectedRoute>
							}
						>
							{/* ================= 공통 (로그인만 필요) ================= */}
							{/* 메인 대시보드 */}
							<Route path="/portal" element={<Portal />} />
							<Route path="/direction" element={<Direction />} />
							{/* 등록금 */}
							<Route path="/tuition" element={<TuiList />} /> {/* 등록금 납부 내역 */}
							<Route path="/tuition/payment" element={<Payment />} /> {/* 등록금 고지서 */}
							{/* 등록금 고지서 생성 (관리자) */}
							<Route
								path="/tuition/bill"
								element={
									<ProtectedRoute allowedRoles={['staff']}>
										<CreatePayment />
									</ProtectedRoute>
								}
							/>
							{/* 사용자 */}
							<Route path="/user/info" element={<UserInfo />} /> {/* 내 정보 조회, 수정 */}
							<Route path="/user/update/password" element={<UpdatePassword />} /> {/* 비밀번호 변경 */}
							{/* 공지사항 */}
							<Route path="/notice" element={<NoticeList />} /> {/* 공지 목록 */}
							<Route path="/notice/read/:id" element={<NoticeDetail />} /> {/* 공지 상세보기 */}
							{/* 학사 일정 */}
							<Route path="/schedule" element={<ScheduleList />} /> {/* 학사일정 */}
							<Route path="/schedule/detail/:id" element={<ScheduleDetail />} />
							{/* ================= STAFF 전용 ================= */}
							<Route element={<ProtectedRoute allowedRoles={['staff']} />}>
								{/* 등록금 고지서 생성 */}
								<Route path="/tuition/bill" element={<CreatePayment />} />
								{/* 사용자 생성 */}
								<Route path="/user/create" element={<UserCreate />} />
								{/* 학생, 교수 리스트 보기 */}
								<Route path="/student/list" element={<StudentList />} />
								<Route path="/professor/list" element={<ProfessorList />} />
								{/* 관리자 */}
								<Route path="/admin/room" element={<Room />} />
								<Route path="/admin/subject" element={<Subject />} />
								<Route path="/admin/college" element={<College />} />
								<Route path="/admin/department" element={<Department />} />
								<Route path="/admin/colltuit" element={<CollTuit />} />
								{/* 공지 관리 */}
								<Route path="/notice/write" element={<NoticeWrite />} />
								<Route path="/notice/update/:id" element={<NoticeUpdate />} />
								{/* 학사 일정 관리 */}
								<Route path="/schedule/write" element={<ScheduleWrite />} />
								<Route path="/schedule/update/:id" element={<ScheduleUpdate />} />
								{/* 휴학 관리 */}
								<Route path="/break/list/staff" element={<BreakAppListStaff />} />
								<Route path="/sugang/period" element={<UpdatePeriod />} />
							</Route>
							{/* ================= STUDENT 전용 ================= */}
							<Route element={<ProtectedRoute allowedRoles={['student']} />}>
								{/* 등록금 */}
								<Route path="/tuition" element={<TuiList />} /> {/* 등록금 납부 내역 */}
								<Route path="/tuition/payment" element={<Payment />} /> {/* 등록금 고지서 */}
								{/* 수강신청 */}
								<Route path="/sugang/list" element={<SubList />} />
								<Route path="/sugang/pre" element={<PreSugang />} />
								<Route path="/sugang" element={<Sugang />} />
								<Route path="/sugang/timetable" element={<Timetable />} />
								{/* 휴학 */}
								<Route path="/break/application" element={<BreakApplication />} />
								<Route path="/break/list" element={<BreakAppListStudent />} />
								{/* 학생 상담 */}
								<Route path="/status" element={<StudentMyRiskStatus />} />
								{/* 학생 성적 */}
								<Route path="/grade/current" element={<ThisGrade />} />
								<Route path="/grade/semester" element={<Semester />} />
								<Route path="/grade/total" element={<TotalGrade />} />
							</Route>
							{/* ================= PROFESSOR 전용 ================= */}
							<Route element={<ProtectedRoute allowedRoles={['professor']} />}>
								<Route path="/professor/subject" element={<ProfessorSubjectList />} />
								{/* TODO: 성적 입력 및 분석 부분 따로 접근성과 편리성을 위해서 넣어둠? */}
								<Route path="/professor/ai" element={<ProfessorAiGrade />} />
								<Route path="/professor/evaluation" element={<MyEvaluation />} />

								{/* 교수 상담 */}
								<Route path="/professor/counseling/schedule" element={<WeeklyCounselingScheduleForm />} />
								<Route path="/professor/counseling/risk" element={<MyRiskStudent />} />
							</Route>
							{/* ================= 학생, 교수 전용 (비디오룸, 상담 관리) ================= */}
							<Route element={<ProtectedRoute allowedRoles={['professor', 'student']} />}>
								<Route
									path="/counseling/manage"
									element={
										<CounselingRefreshProvider>
											<CounselingManageMent />
										</CounselingRefreshProvider>
									}
								/>
								<Route path="/videotest" element={<VideoCounseling />} />
								<Route path="/grade/policy" element={<GradePolicy />} />
							</Route>
							{/* ================= 학생, 직원 전용 (휴학 관리) ================= */}
							<Route element={<ProtectedRoute allowedRoles={['staff', 'student']} />}>
								<Route path="/break/detail/:id" element={<BreakAppDetail />} />
							</Route>
							{/* ================= 공통 기타 ================= */}
							<Route path="/subject/list" element={<AllsubList />} />
						</Route>
						<Route element={<ProtectedRoute allowedRoles={['student']}></ProtectedRoute>}>
							{' '}
							{/* ================= 학생 팝업 ================= */}
							<Route path="/evaluation" element={<Evaluation />} />
						</Route>
						<Route element={<ProtectedRoute allowedRoles={['professor']}></ProtectedRoute>}>
							{' '}
							{/* ================= 교수 팝업 ================= */}
							<Route path="/counseling/info" element={<CounselingInfoPop />} />
						</Route>
						<Route element={<ProtectedRoute></ProtectedRoute>}>
							{/* ================= 공통 팝업 ================= */}
							<Route path="/professor/syllabus/:subjectId" element={<ReadSyllabusPopup />} />
						</Route>

						{/* 잘못된 경로 → 홈 */}
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</UserProvider>
			</QueryClientProvider>
		</>
	);
}

export default App;
