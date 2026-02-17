import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/httpClient';
import DataTable from '../../components/table/DataTable';
import InputForm from '../../components/form/InputForm';
import OptionForm from '../../components/form/OptionForm';
import PaginationForm from '../../components/form/PaginationForm';
import { SUBJECT_TYPE1 } from '../../utils/subjectTypeOptions';

// 공통 컴포넌트 : preSugang + Sugang에서 사용됨
export default function SugangApplication({ apiEndpoint, actionHeaderLabel, onAction, formatRowData }) {
	const [error, setError] = useState(null);

	const [subTimetable, SetSubTimeTable] = useState([]);

	// 페이징 (기본값은 10으로 설정)
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [totalCount, setTotalCount] = useState(0);

	// url에 입력된 값 받기 (쿼리 스트링)
	const [searchParams, setSearchParams] = useSearchParams();

	// 검색 폼
	const [searchForm, setSearchForm] = useState({
		type: '', // 전공 or 교양
		deptName: '', // 학과명
		name: '', // 강의명
	});

	// 강의 목록 조회 (페이징 page + 검색 filters)
	const loadSubjectList = async (page = 0, filters = null) => {
		try {
			setError(null);
			const params = { page, size: 10 };
			const currentFilters = filters || searchForm;

			if (currentFilters.type) params.type = currentFilters.type;
			if (currentFilters.deptName) params.deptName = currentFilters.deptName;
			if (currentFilters.name) params.name = currentFilters.name;

			// 🔥 이 부분을 예비 수강 신청, 수강 신청에 따라 다르게 보여줘야 하나요?
			// 아뇨 동일하게 보여줘도 됩니다 다만, 헤더에 '수강신청' 부분이 달라져야 함!
			const res = await api.get(apiEndpoint, { params });
			//console.log('[컴포넌트 res.data]', res.data);
			const rawData = res.data.lists; // 데이터만 추출

			// 부모에서 전달받은 포맷팅 함수 적용
			const formattedData = rawData.map((sub) => formatRowData(sub, actionHeaderLabel));
			//console.log('[컴포넌트 formatted]', formattedData);
			SetSubTimeTable(formattedData);
			setCurrentPage(res.data.currentPage);
			setTotalPages(res.data.totalPages);
			setTotalCount(res.data.listCount);
		} catch (err) {
			setError(err.response?.data?.message || '목록을 불러오는 중 오류가 발생했습니다.');
		}
	};

	// URL 파라미터 변경 감지 (초기 로드 + URL 변경 시)
	useEffect(() => {
		const page = parseInt(searchParams.get('page') || '0', 10);
		const type = searchParams.get('type') || '';
		const deptName = searchParams.get('deptName') || '';
		const name = searchParams.get('name') || '';
		//console.log('🔗 URL에서 읽은 값:', { page, type, deptName, name });

		// URL에서 검색 조건 복원
		setSearchForm({ type, deptName, name });

		// URL에서 읽은 값을 직접 전달
		loadSubjectList(page, { type, deptName, name });
	}, [searchParams, onAction]);

	// 검색 폼 입력 핸들러
	const handleChange = (e) => {
		const { name, value } = e.target;
		setSearchForm({ ...searchForm, [name]: value });
	};

	// 검색 버튼 클릭 (URL 업데이트 + 0페이지부터)
	const handleSearch = () => {
		const params = { page: '0' };
		if (searchForm.type) params.type = searchForm.type;
		if (searchForm.deptName) params.deptName = searchForm.deptName;
		if (searchForm.name) params.name = searchForm.name;
		setSearchParams(params); // URL 업데이트 → useEffect 자동 실행
	};

	// 페이지 변경 (URL 업데이트)
	const handlePageChange = (newPage) => {
		if (newPage >= 0 && newPage < totalPages) {
			const params = { page: newPage.toString() };
			if (searchForm.type) params.type = searchForm.type;
			if (searchForm.deptName) params.deptName = searchForm.deptName;
			if (searchForm.name) params.name = searchForm.name;
			setSearchParams(params); // URL 업데이트 → useEffect 자동 실행
		}
	};

	// 테이블 헤더 (actionHeaderLabel : 동적으로 헤더명 설정)
	const headers = [
		'단과대학',
		'개설학과',
		'학수번호',
		'강의구분',
		'강의명',
		'담당교수',
		'학점',
		'요일시간 (강의실)',
		'현재인원',
		'정원',
		actionHeaderLabel,
	];

	return (
		<>
			{error && <div className="error-message">{error}</div>}

			{/* 검색 폼 */}
			<div>
				<OptionForm
					label="강의 구분"
					name="type"
					value={searchForm.type}
					onChange={handleChange}
					options={SUBJECT_TYPE1}
				/>

				<InputForm
					label="개설학과"
					name="deptName"
					type="text"
					value={searchForm.deptName}
					onChange={handleChange}
					placeholder="학과 입력"
				/>

				<InputForm
					label="강의명"
					name="name"
					value={searchForm.name}
					onChange={handleChange}
					placeholder="강의명 검색"
				/>

				<button onClick={handleSearch} className="button">
					검색
				</button>
			</div>

			<h3>강의 목록</h3>
			<p>
				전체 {totalCount}개 | {currentPage + 1} / {totalPages} 페이지
			</p>

			<DataTable
				headers={headers}
				data={subTimetable}
				clickableHeaders={[actionHeaderLabel]}
				onCellClick={async ({ row, header }) => {
					if (header === actionHeaderLabel) {
						await onAction(row, loadSubjectList, currentPage, searchForm);
						// TODO: 마감된 경우 버튼 누를 수 없게 막을 수 없나?
					}
				}}
			/>

			<PaginationForm
				currentPage={currentPage}
				totalPages={totalPages}
				blockSize={10}
				onPageChange={handlePageChange}
			/>
		</>
	);
}
