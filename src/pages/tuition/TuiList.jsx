import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/httpClient';
import '../../assets/css/TuiList.css';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import DataTable from '../../components/table/DataTable';
import { comma } from '../../utils/FmtMoney';

export default function TuiList() {
	// 납부된 등록금 내역을 조회하는 컴포넌트
	const [tuiList, setTuiList] = useState([]);
	const navigate = useNavigate();
	const { user, userRole } = useContext(UserContext);

	const headers = useMemo(() => ['등록연도', '등록학기', '장학유형', '등록금', '장학금', '납입금'], []);

	useEffect(() => {
		if (user === null) return;
		if (userRole !== 'student') {
			navigate(-1, { replace: true });
			return;
		}

		const loadTuition = async () => {
			// 등록금 불러오기 (tuitionController 58번)
			try {
				const res = await api.get('/tuition/list');
				setTuiList(res.data.tuitionList);
			} catch (e) {
				console.error('tuiList 불러오기 실패' + e);
			}
		};
		loadTuition();
	}, [user, userRole, navigate]);

	// DataTable용 변환
	const tableData = useMemo(() => {
		return tuiList.map((t) => ({
			등록연도: t.tuiYear ?? '',
			등록학기: t.semester ?? '',
			장학유형: t?.schType?.type ?? '',
			등록금: comma(t.tuiAmount) ?? '',
			장학금: comma(t.schAmount) ?? '',
			납입금: comma(t.payAmount) ?? '',
		}));
	}, [tuiList]);

	return (
		<div className="form-container">
			<h3>등록금 내역 조회</h3>
			<div className="split--div"></div>

			{tuiList.length > 0 ? <DataTable headers={headers} data={tableData} /> : <p>등록금 납부 내역이 없습니다!</p>}
		</div>
	);
}
