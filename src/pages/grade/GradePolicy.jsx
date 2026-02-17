import '../../assets/css/ReadSyllabus.css';

export default function GradePolicy() {
	return (
		<div className="rsd-wrap">
			<h2 className="rsd-title">성적 산출 기준 안내</h2>

			{/* 감점 요소 */}
			<div className="rsd-box">
				<table className="rsd-table">
					<tbody>
						<tr>
							<th className="rsd-wide-th">감점 요소</th>
						</tr>
						<tr>
							<td className="rsd-text">
								지각 3회 = 결석 1회{'\n'}
								결석 1회당 -2점{'\n'}
								결석 5회 이상 시 자동 F
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			{/* 환산 점수 계산 */}
			<div className="rsd-box">
				<table className="rsd-table">
					<tbody>
						<tr>
							<th className="rsd-wide-th">환산 점수 계산</th>
						</tr>
						<tr>
							<td className="rsd-text">
								과제 점수: 20%{'\n'}
								중간 시험: 40%{'\n'}
								기말 시험: 40%{'\n\n'}
								최종 환산점수 = 환산점수 - 감점 요소
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			{/* 등급 산출 기준 */}
			<div className="rsd-box">
				<table className="rsd-table">
					<tbody>
						<tr>
							<th className="rsd-wide-th">등급 산출 기준</th>
						</tr>
						<tr>
							<td className="rsd-text">
								수강 인원 20명 미만 → 절대평가 (학생별 등급 즉시 결정){'\n'}
								수강 인원 20명 이상 → 상대평가 (전체 성적 입력 후 환산점수 기준 등급 산출){'\n'}
								중간 또는 기말 점수 30점 미만{'\n'}
								&nbsp;&nbsp;- 또는 환산점수 60점 미만 → 자동 F
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			{/* 등급 처리 정책 */}
			<div className="rsd-box">
				<table className="rsd-table">
					<tbody>
						<tr>
							<th className="rsd-wide-th">등급 처리 정책</th>
						</tr>
						<tr>
							<td className="rsd-text">
								- 절대평가 / 상대평가 등급은 시스템에서 자동 산출{'\n'}
								- 산출 완료 후 확정 전까지 성적 수정 가능
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
