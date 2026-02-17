import DataTable from '../../components/table/DataTable';

export default function RiskStudentOverall({
	studentHeaders,
	studentData,
	studentListLength,
	onRowClick,
	selectedStudentId,
	selectedStudentName,
}) {
	return (
		<div className="risk-section">
			<div className="risk-section-head">
				<h3>학과 중도 이탈 위험 학생</h3>
			</div>

			<div className="risk-card">
				<DataTable headers={studentHeaders} data={studentData} onRowClick={onRowClick} />
				{studentListLength === 0 && <div className="empty-hint">현재 탈락 위험 학생이 없습니다.</div>}
			</div>

			{/* 선택 해제 버튼 없이: "같은 행 다시 클릭하면 접힘" 안내만 표시 */}
			{selectedStudentId && (
				<div className="selected-student-bar">
					<div className="selected-student-text">
						선택됨: <span className="cell-strong">{selectedStudentName || '-'}</span> ({selectedStudentId}) · 아래 과목
						위험 목록이 필터링됩니다. (다시 클릭하면 해제)
					</div>
				</div>
			)}
		</div>
	);
}
