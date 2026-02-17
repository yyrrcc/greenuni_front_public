import DataTable from '../../components/table/DataTable';

export default function RiskPending({ pendingHeaders, pendingData, filteredPendingLength, selectedStudentId }) {
	return (
		<div className="risk-section">
			<div className="risk-section-head">
				<h3>상담 필요 학생 목록</h3>
			</div>

			<div className="risk-card">
				<DataTable headers={pendingHeaders} data={pendingData} />
				{filteredPendingLength === 0 && (
					<div className="empty-hint">
						{selectedStudentId ? '선택한 학생의 상담 대상이 없습니다.' : '현재 상담이 필요한 학생이 없습니다.'}
					</div>
				)}
			</div>
		</div>
	);
}
