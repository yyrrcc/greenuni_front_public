import { useEffect, useState } from 'react';
import RiskInfoPanel from '../../risk/RiskInfoPanel';
import '../../../assets/css/CounselingInfoPop.css';

// 학생이 교수에게 보낸 상담 신청서를 교수가 확인하는 팝업창
export default function CounselingInfoPop() {
	const [data, setData] = useState(null);

	useEffect(() => {
		const raw = sessionStorage.getItem('counselingDetail');
		if (!raw) {
			window.close();
			return;
		}
		setData(JSON.parse(raw));
	}, []);

	if (!data) return null;

	return (
		<div className="cdoc-wrap">
			<h2 className="cdoc-title">상담 신청서</h2>
			<div className="cdoc-box">
				<table className="cdoc-table">
					<tbody>
						<tr>
							<th>학생명</th>
							<td>{data.student.name}</td>
							<th>학번</th>
							<td>{data.student.id}</td>
						</tr>
						<tr>
							<th>학과</th>
							<td>{data.student.department?.name}</td>
							<th>과목</th>
							<td>{data.subject.name}</td>
						</tr>
						<tr>
							<th>상담 일정</th>
							<td colSpan={3}>
								{data.counselingSchedule.counselingDate} {data.counselingSchedule.startTime}:00 ~
								{data.counselingSchedule.endTime}:50
							</td>
						</tr>
						<tr>
							<th>상담 사유</th>
							<td colSpan={3} className="cdoc-reason">
								{data.reason}
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<RiskInfoPanel risk={data.dropoutRisk} />
		</div>
	);
}
