import { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/httpClient';
import DataTable from '../../components/table/DataTable';
import InputForm from '../../components/form/InputForm';
import PaginationForm from '../../components/form/PaginationForm';
import { UserContext } from '../../context/UserContext';
import '../../assets/css/NoticeList.css';
import OptionForm from '../../components/form/OptionForm';

const NoticeList = () => {
	const navigate = useNavigate();
	const { userRole } = useContext(UserContext);

	// URL query
	const [searchParams, setSearchParams] = useSearchParams();

	const initialPage = parseInt(searchParams.get('page') || '0', 10);
	const initialKeyword = searchParams.get('keyword') || '';
	const initialType = searchParams.get('type') || 'title';

	// 페이징
	const [currentPage, setCurrentPage] = useState(Number.isNaN(initialPage) ? 0 : initialPage);
	const [totalPages, setTotalPages] = useState(1);
	const [noticeList, setNoticeList] = useState([]);

	const [keyword, setKeyword] = useState(initialKeyword);
	const [type, setType] = useState(initialType);

	const headers = ['번호', '말머리', '제목', '작성일', '조회수'];

	const formatDateTime = (ts) => {
		if (!ts) return '';
		const d = new Date(ts);
		if (Number.isNaN(d.getTime())) return String(ts);
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		const hh = String(d.getHours()).padStart(2, '0');
		const mi = String(d.getMinutes()).padStart(2, '0');
		return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
	};

	// 실제 로드 함수
	const loadList = async (page = 0, filters = null) => {
		try {
			const currentFilters = filters || { keyword, type };
			const kw = currentFilters.keyword ?? '';
			const tp = currentFilters.type ?? 'title';
			const hasKeyword = kw.trim().length > 0;

			const url = hasKeyword
				? `/notice/search/${page}?keyword=${encodeURIComponent(kw)}&type=${encodeURIComponent(tp)}`
				: `/notice/list/${page}`;

			const res = await api.get(url);

			const raw = res.data.noticeList || [];
			const formatted = raw.map((n) => ({
				id: n.id,
				번호: n.id,
				말머리: n.category,
				제목: n.title,
				작성일: formatDateTime(n.createdTime),
				조회수: n.views ?? 0,
				원본데이터: n,
			}));

			setNoticeList(formatted);
			setTotalPages(res.data.listCount ?? 1);

			// 백이 currentPage도 내려주면 동기화 가능(선택)
			if (typeof res.data.currentPage === 'number') {
				setCurrentPage(res.data.currentPage);
			}
		} catch (e) {
			console.error('공지 목록 로드 실패:', e);
		}
	};

	// URL 변경 감지 → 상태 복원 + 로드
	useEffect(() => {
		const page = parseInt(searchParams.get('page') || '0', 10);
		const kw = searchParams.get('keyword') || '';
		const tp = searchParams.get('type') || 'title';

		setCurrentPage(Number.isNaN(page) ? 0 : page);
		setKeyword(kw);
		setType(tp);

		loadList(Number.isNaN(page) ? 0 : page, { keyword: kw, type: tp });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	// 검색 버튼
	const handleSearchSubmit = (e) => {
		e.preventDefault();
		// 검색은 항상 0페이지부터
		const params = { page: '0' };
		if (keyword.trim()) {
			params.keyword = keyword;
			params.type = type;
		}
		setSearchParams(params); // → useEffect가 자동 로드
	};

	// 초기화
	const handleResetSearch = () => {
		setKeyword('');
		setType('title');
		setSearchParams({ page: '0' });
	};

	// 페이지 변경
	const handlePageChange = (newPage) => {
		if (newPage >= 0 && newPage < totalPages) {
			const params = { page: String(newPage) };
			if (keyword.trim()) {
				params.keyword = keyword;
				params.type = type;
			}
			setSearchParams(params);
		}
	};

	// 검색 카테고리
	const NOTICE_SEARCH_OPTIONS = [
		{ value: 'title', label: '제목' },
		{ value: 'content', label: '내용' },
		{ value: 'all', label: '제목+내용' },
	];

	return (
		<div className="form-container">
			<h3>공지사항</h3>
			<div className="split--div"></div>

			{/* 검색 폼 */}
			<form onSubmit={handleSearchSubmit} className="notice-search-bar">
				<OptionForm
					name="type"
					value={type}
					onChange={(e) => setType(e.target.value)}
					options={NOTICE_SEARCH_OPTIONS}
				/>

				<div className="notice-search-input">
					<InputForm
						label=""
						name="keyword"
						placeholder="검색어를 입력하세요"
						value={keyword}
						onChange={(e) => setKeyword(e.target.value)}
					/>
				</div>

				<div className="notice-search-actions">
					<button type="submit" className="button">
						검색
					</button>
					<button type="button" className="button" onClick={handleResetSearch}>
						초기화
					</button>
				</div>
			</form>

			{/* 테이블 */}
			<DataTable
				headers={headers}
				data={noticeList}
				onRowClick={(row) => {
					const id = row?.id || row?.원본데이터?.id;
					if (id) navigate(`/notice/read/${id}`);
				}}
			/>

			{/* 페이징 + 등록버튼 */}
			<div className="paging--container">
				<PaginationForm
					currentPage={currentPage}
					totalPages={totalPages}
					blockSize={10}
					onPageChange={handlePageChange}
				/>

				{userRole === 'staff' && (
					<button className="button register-btn" onClick={() => navigate('/notice/write')}>
						등록
					</button>
				)}
			</div>
		</div>
	);
};

export default NoticeList;
