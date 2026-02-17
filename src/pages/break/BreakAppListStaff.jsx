import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/httpClient';
import { UserContext } from '../../context/UserContext';
import DataTable from '../../components/table/DataTable';

export default function BreakAppListStaff() {
	const navigate = useNavigate();
	const { user, userRole } = useContext(UserContext);

	const [breakAppList, setBreakAppList] = useState([]);
	const [loading, setLoading] = useState(true);

	const headers = ['신청일자', '신청자 학번', '구분', '시작학기', '종료학기'];

	const loadBreakAppList = async () => {
		try {
			const res = await api.get('/break/list/staff');
			const raw = res.data.breakAppList || [];
			const formatted = raw.map((b) => ({
				id: b.id,
				신청일자: b.appDate ?? '',
				'신청자 학번': b.student.id ?? '',
				구분: `${b.type ?? ''}휴학`,
				시작학기: `${b.fromYear ?? ''}년도 ${b.fromSemester ?? ''}학기`,
				종료학기: `${b.toYear ?? ''}년도 ${b.toSemester ?? ''}학기`,
				원본데이터: b,
			}));

			setBreakAppList(formatted);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!user || userRole !== 'staff') {
			alert('권한이 없는 페이지 입니다.');
			navigate(-1, { replace: true });
			return;
		}
		loadBreakAppList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, userRole, navigate]);

	if (loading) return <p>불러오는중 ...</p>;

	return (
		<div className="form-container">
			<div className="list-card">
				<div className="list-head">
					<div>
						<h3 className="list-title">휴학 처리</h3>
						<p className="list-subtitle">대기중인 휴학 신청 내역을 확인하고 상세 처리할 수 있어요.</p>
					</div>
				</div>

				<div className="split--div" />

				{breakAppList.length > 0 ? (
					<DataTable
						headers={headers}
						data={breakAppList}
						onRowClick={(row) => {
							const id = row?.id || row?.원본데이터?.id;
							if (id) navigate(`/break/detail/${id}`);
						}}
					/>
				) : (
					<p className="state-text">대기중인 신청 내역이 없습니다.</p>
				)}
			</div>
		</div>
	);
}
