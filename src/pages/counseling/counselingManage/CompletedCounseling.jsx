import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../context/UserContext';
import { TABLE_CONFIG } from './util/TableConfig';
import DataTable from '../../../components/table/DataTable';

export default function CompletedCounseling({ finishedList }) {
	const { userRole } = useContext(UserContext);
	const [tableKey, setTableKey] = useState(null);

	useEffect(() => {
		setTableKey(userRole === 'professor' ? 'PROFESSOR_FINISHED' : 'STUDENT_FINISHED');
	}, [userRole]);

	const config = TABLE_CONFIG[tableKey];
	if (!config) return null;

	const handlers = {
		detail: (r) => (
			<button
				type="button"
				className="cm-btn cm-btn--ghost"
				onClick={() => {
					sessionStorage.setItem('counselingDetail', JSON.stringify(r));
					window.open('/counseling/info', '_blank', 'width=900,height=800');
				}}
			>
				보기
			</button>
		),
	};

	const rows = finishedList.map((r) => config.data(r, handlers, r.id));

	return (
		<section className="cm-card">
			<div className="cm-card-head">
				<h3 className="cm-card-title">완료된 상담</h3>
				<span className="cm-badge">{finishedList.length}건</span>
			</div>

			{finishedList.length === 0 ? (
				<div className="cm-empty">완료된 상담이 없습니다.</div>
			) : (
				<div className="cm-table">
					<DataTable headers={config.headers} data={rows} />
				</div>
			)}
		</section>
	);
}
