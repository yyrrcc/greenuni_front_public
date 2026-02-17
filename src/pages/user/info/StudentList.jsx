import { useEffect, useMemo, useState } from 'react';
import api from '../../../api/httpClient';
import DataTable from '../../../components/table/DataTable';
import InputForm from '../../../components/form/InputForm';
import PaginationForm from '../../../components/form/PaginationForm';

export default function StudentList() {
	const [currentPage, setCurrentPage] = useState(0);
	const [lists, setLists] = useState([]);
	const [totalPages, setTotalPages] = useState(0);
	const [listCount, setListCount] = useState(0);

	// 검색 필터
	const [formData, setFormData] = useState({
		studentId: '',
		deptId: '',
	});

	const headers = [
		'학번',
		'이름',
		'생년월일',
		'주소',
		'전화번호',
		'이메일',
		'학과번호',
		'학년',
		'입학일',
		'졸업일(졸업예정일)',
	];

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// 리스트 + 검색 통합 함수
	const searchStudent = async (page = currentPage) => {
		try {
			const params = {};

			if (formData.studentId.trim() !== '') {
				params.studentId = Number(formData.studentId);
			}
			if (formData.deptId.trim() !== '') {
				params.deptId = Number(formData.deptId);
			}
			const res = await api.get(`/user/studentList/${page}`, { params });
			const data = res.data; // pagingResponse
			setListCount(data.listCount);
			setLists(data.studentList);
			setCurrentPage(data.currentPage);
			setTotalPages(data.totalPages);
		} catch (e) {
			console.error(e);
			alert('학생 목록을 불러오지 못했습니다.');
		}
	};

	// 페이지가 바뀌면 리스트 다시 로딩
	useEffect(() => {
		searchStudent(currentPage);
	}, [currentPage]);

	// 검색 버튼 눌렀을 때
	const handleSearchSubmit = (e) => {
		e.preventDefault(); // 새로고침 방지
		setCurrentPage(0); // 검색 시 첫 페이지로 이동
		searchStudent(0); // 즉시 검색
	};

	const tableData = useMemo(() => {
		return lists.map((s) => ({
			학번: s.id ?? '',
			이름: s.name ?? '',
			생년월일: s.birthDate ?? '',
			주소: s.address ?? '',
			전화번호: s.tel ?? '',
			이메일: s.email ?? '',
			학과번호: s.department.id ?? '',
			학년: s.grade ?? '',
			입학일: s.entranceDate ?? '',
			졸업일_졸업예정일: s.graduationDate ?? '',
		}));
	}, [lists]);

	const onKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSearchSubmit(e);
		}
	};

	return (
		<div className="list-page">
			<div className="list-card">
				<div className="list-head">
					<div>
						<h2 className="list-title">학생 명단 조회</h2>
						<p className="list-subtitle">학번/학과번호로 학생 정보를 검색할 수 있어요.</p>
					</div>
				</div>

				<div className="filters">
					<form className="filters-form" onSubmit={handleSearchSubmit}>
						<InputForm
							label="학번"
							name="studentId"
							placeholder="검색어를 입력하세요"
							onChange={handleChange}
							onKeyDown={onKeyDown}
						/>
						<InputForm
							label="학과 번호"
							name="deptId"
							placeholder="검색어를 입력하세요"
							onChange={handleChange}
							onKeyDown={onKeyDown}
						/>

						<div className="filters-actions">
							<button className="btn-primary" type="submit">
								검색
							</button>
						</div>
					</form>
				</div>

				<div className="list-divider" />

				<div className="table-section">
					<div className="table-topline">
						<div className="table-hint">
							총 {listCount}명 / 총 페이지: {totalPages}
						</div>
					</div>
					<DataTable headers={headers} data={tableData} />

					<div className="pagination-wrap">
						<PaginationForm
							currentPage={currentPage}
							blockSize={10}
							totalPages={totalPages}
							onPageChange={(p) => setCurrentPage(p)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
