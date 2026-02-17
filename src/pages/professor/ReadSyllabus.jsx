import { useContext } from 'react';
import { toHHMM } from '../../utils/DateTimeUtil';
import { UserContext } from '../../context/UserContext';
import '../../assets/css/ReadSyllabus.css';

export default function ReadSyllabus({ syllabus, setIsEdit }) {
	const { userRole, user } = useContext(UserContext);

	return (
		<div className="rsd-wrap">
			<h2 className="rsd-title">강의 계획서</h2>

			{/* 교과목 정보 */}
			<div className="rsd-box">
				<table className="rsd-table">
					<tbody>
						<tr>
							<th rowSpan="4">교과목 정보</th>
							<th>수업 번호</th>
							<td>{syllabus.subjectId}</td>
							<th>교과목 명</th>
							<td>{syllabus.name}</td>
						</tr>

						<tr>
							<th>수업 연도</th>
							<td>{syllabus.subYear}</td>
							<th>수업 학기</th>
							<td>{syllabus.semester}</td>
						</tr>

						<tr>
							<th>학점</th>
							<td>{syllabus.credits}</td>
							<th>이수 구분</th>
							<td>{syllabus.type}</td>
						</tr>

						<tr>
							<th>강의 시간</th>
							<td colSpan="3">
								{syllabus.subDay}{' '}
								{toHHMM(syllabus.startTime)} - {toHHMM(syllabus.endTime)}
							</td>
						</tr>

						<tr>
							<th>강의실</th>
							<td colSpan="4">{syllabus.roomId}</td>
						</tr>
					</tbody>
				</table>
			</div>

			{/* 교강사 정보 */}
			<div className="rsd-box">
				<table className="rsd-table">
					<tbody>
						<tr>
							<th rowSpan="2">교강사 정보</th>
							<th>소속</th>
							<td>{syllabus.deptName}</td>
							<th>성명</th>
							<td>{syllabus.professorName}</td>
						</tr>
						<tr>
							<th>연락처</th>
							<td>{syllabus.tel}</td>
							<th>Email</th>
							<td>{syllabus.email}</td>
						</tr>
					</tbody>
				</table>
			</div>

			{/* 상세 내용 */}
			<div className="rsd-box">
				<table className="rsd-table">
					<tbody>
						<tr>
							<th className="rsd-wide-th">강의 개요</th>
						</tr>
						<tr>
							<td className="rsd-text">{syllabus?.overview}</td>
						</tr>

						<tr>
							<th className="rsd-wide-th">강의 목표</th>
						</tr>
						<tr>
							<td className="rsd-text">{syllabus?.objective}</td>
						</tr>

						<tr>
							<th className="rsd-wide-th">교재 정보</th>
						</tr>
						<tr>
							<td className="rsd-text">{syllabus?.textbook}</td>
						</tr>

						<tr>
							<th className="rsd-wide-th">주간 계획</th>
						</tr>
						<tr>
							<td className="rsd-text">{syllabus?.program}</td>
						</tr>
					</tbody>
				</table>
			</div>

			{/* 수정 버튼 */}
			{userRole === 'professor' && user === syllabus.professorId && (
				<div className="rsd-action">
					<button className="rsd-edit-btn" onClick={() => setIsEdit(true)}>
						수정
					</button>
				</div>
			)}
		</div>
	);
}
