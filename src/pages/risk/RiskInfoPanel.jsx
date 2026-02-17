export default function RiskInfoPanel({ risk }) {
	if (!risk) return null;

	return (
		<div className="cdoc-box">
			<h4 className="cdoc-sub-title">위험 학생 분석 정보</h4>

			<table className="cdoc-table">
				<tbody>
					<tr>
						<th>위험 등급</th>
						<td>{risk.riskLevel}</td>
						<th>위험 유형</th>
						<td>{risk.riskType}</td>
					</tr>
					<tr>
						<th>AI 요약</th>
						<td colSpan={3}>{risk.aiSummary}</td>
					</tr>
					<tr>
						<th>위험 태그</th>
						<td colSpan={3}>{risk.aiReasonTags}</td>
					</tr>
					<tr>
						<th>AI 상담 가이드</th>
						<td colSpan={3}>
							<div className="cdoc-guide-text">{risk.aiRecommendation ?? '—'}</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
