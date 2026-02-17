import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TABLE_CONFIG } from './util/TableConfig';
import DataTable from '../../../components/table/DataTable';
import { UserContext } from '../../../context/UserContext';
import api from '../../../api/httpClient';

export default function SentCounseling({ sentList }) {
	const { userRole } = useContext(UserContext);
	const [tableKey, setTableKey] = useState(null);

	useEffect(() => {
		setTableKey(userRole === 'professor' ? 'PROFESSOR_SENT' : 'STUDENT_SENT');
	}, [userRole]);

	const config = TABLE_CONFIG[tableKey];
	if (!config) return null;

	const rows = sentList.map((r) => config.data(r, r.id));

	return (
		<section className="cm-card">
			<div className="cm-card-head">
				<h3 className="cm-card-title">내가 요청한 상담</h3>
				<span className="cm-badge">{sentList.length}건</span>
			</div>

			{sentList.length === 0 ? (
				<div className="cm-empty">요청한 상담이 없습니다.</div>
			) : (
				<div className="cm-table">
					<DataTable headers={config.headers} data={rows} />
				</div>
			)}
		</section>
	);
}
