import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../context/UserContext';
import { TABLE_CONFIG } from './util/TableConfig';
import DataTable from '../../../components/table/DataTable';
import api from '../../../api/httpClient';
import { listFilter } from './util/ListFilter';
import { CounselingRefreshContext } from './util/CounselingRefreshContext';

// 요청 받은 상담 목록 조회
export default function RequestedCounseling({ requestByList }) {
	const { userRole } = useContext(UserContext);
	const [tableKey, setTableKey] = useState(null);
	const [loadingId, setLoadingId] = useState(null);
	const { refresh } = useContext(CounselingRefreshContext);

	const { requestedList } = listFilter(requestByList);

	useEffect(() => {
		setTableKey(userRole === 'professor' ? 'PROFESSOR_REQUESTED' : 'STUDENT_REQUESTED');
	}, [userRole]);

	const config = TABLE_CONFIG[tableKey];
	if (!config) return null;

	const handleDecision = async ({ role, type, id }) => {
		try {
			setLoadingId(id);

			if (role === 'professor') {
				await api.post('/reserve/decision', null, {
					params: { reserveId: id, decision: type },
				});
			} else {
				const url = type === '승인' ? '/reserve/pre/accept' : '/reserve/pre/reject';
				await api.post(url, null, { params: { preReserveId: id } });
			}

			refresh();
		} catch (e) {
			alert(e?.response?.data?.message ?? '처리 실패');
			console.error(e);
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
					window.open('/counseling/info', '_blank', 'width=900,height=800,scrollbars=yes');
				}}
			>
				보기
			</button>
		),
		decision: (r) => (
			<div className="cm-btn-group">
				<button
					type="button"
					className="cm-btn cm-btn--ghost"
					disabled={loadingId === r.id}
					onClick={() => handleDecision({ role: userRole, type: '승인', id: r.id })}
				>
					승인
				</button>
				<button
					type="button"
					className="cm-btn cm-btn--ghost"
					disabled={loadingId === r.id}
					onClick={() => handleDecision({ role: userRole, type: '반려', id: r.id })}
				>
					반려
				</button>
			</div>
		),
	};

	const rows = requestedList.map((r) => config.data(r, handlers, r.id));

	return (
		<section className="cm-card">
			<div className="cm-card-head">
				<h3 className="cm-card-title">요청 받은 상담</h3>
				<span className="cm-badge">{requestedList.length}건</span>
			</div>

			{requestedList.length === 0 ? (
				<div className="cm-empty">요청 받은 상담이 없습니다.</div>
			) : (
				<div className="cm-table">
					<DataTable headers={config.headers} data={rows} />
				</div>
			)}
		</section>
	);
}
