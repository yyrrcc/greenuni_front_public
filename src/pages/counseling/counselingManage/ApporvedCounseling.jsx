import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../context/UserContext';
import { TABLE_CONFIG } from './util/TableConfig';
import DataTable from '../../../components/table/DataTable';
import api from '../../../api/httpClient';
import { CounselingRefreshContext } from './util/CounselingRefreshContext';

export default function ApprovedCounseling({ approvedList }) {
	const { userRole } = useContext(UserContext);
	const [tableKey, setTableKey] = useState(null);
	const [loadingId, setLoadingId] = useState(null);
	const { refresh } = useContext(CounselingRefreshContext);

	useEffect(() => {
		setTableKey(userRole === 'professor' ? 'PROFESSOR_APPROVED' : 'STUDENT_APPROVED');
	}, [userRole]);

	const config = TABLE_CONFIG[tableKey];
	if (!config) return null;

	const cancelApproved = async (reserveId) => {
		if (!window.confirm('확정된 상담을 취소하시겠습니까?')) return;

		try {
			setLoadingId(reserveId);
			const url = userRole === 'professor' ? '/reserve/cancel/professor' : '/reserve/cancel/student';

			await api.delete(url, { params: { reserveId } });
			refresh();
		} catch (e) {
			console.error(e);
			alert(e?.response?.data?.message ?? '취소 실패');
		} finally {
			setLoadingId(null);
		}
	};

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
		cancel: (r) => (
			<button
				type="button"
				className="cm-btn cm-btn--ghost"
				disabled={loadingId === r.id}
				onClick={() => cancelApproved(r.id)}
			>
				취소
			</button>
		),
	};

	const rows = approvedList.map((r) => config.data(r, handlers, r.id));

	return (
		<section className="cm-card">
			<div className="cm-card-head">
				<h3 className="cm-card-title">확정된 상담</h3>
				<span className="cm-badge">{approvedList.length}건</span>
			</div>

			{approvedList.length === 0 ? (
				<div className="cm-empty">확정된 상담이 없습니다.</div>
			) : (
				<div className="cm-table">
					<DataTable headers={config.headers} data={rows} />
				</div>
			)}
		</section>
	);
}
