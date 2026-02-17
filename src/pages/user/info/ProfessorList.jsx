import { useEffect, useMemo, useState } from 'react';
import api from '../../../api/httpClient';
import DataTable from '../../../components/table/DataTable';
import PaginationForm from '../../../components/form/PaginationForm';
import InputForm from '../../../components/form/InputForm';
import '../../../assets/css/ListPage.css';

export default function ProfessorList() {
	const [currentPage, setCurrentPage] = useState(0);
	const [lists, setLists] = useState([]);
	const [totalPages, setTotalPages] = useState(0);
	const [listCount, setListCount] = useState(0);

	// 검색 필터
	const [formData, setFormData] = useState({
		professorId: '',
		deptName: '',
	});

	const headers = ['사번', '이름', '학과', '이메일', '전화번호'];

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// 리스트 + 검색 통합 함수
	const searchProfessors = async (page = currentPage) => {
		try {
			const params = {};

			if (formData.professorId.trim() !== '') {
				params.professorId = Number(formData.professorId);
			}
			if (formData.deptName.trim() !== '') {
				params.deptName = formData.deptName;
			}

			const res = await api.get(`/user/professorList/${page}`, { params });
			setListCount(res.data.totalElements);
			setLists(res.data.professorList);
			setCurrentPage(res.data.page);
			setTotalPages(res.data.totalPages);
		} catch (e) {
			console.error(e);
			alert('교수 목록을 불러오지 못했습니다.');
		}
	};

	// 페이지가 바뀌면 리스트 다시 로딩
	useEffect(() => {
		searchProfessors(currentPage);
	}, [currentPage]);

	// 검색 버튼 눌렀을 때
	const handleSearchSubmit = (e) => {
		e.preventDefault(); // 새로고침 방지
		setCurrentPage(0); // 검색 시 첫 페이지로 이동
		searchProfessors(0); // 즉시 검색
	};

	const tableData = useMemo(() => {
		return lists.map((p) => ({
			사번: p.id ?? '',
			이름: p.name ?? '',
			학과: p.department.name ?? '',
			이메일: p.email ?? '',
			전화번호: p.tel ?? '',
		}));
	}, [lists]);

	return (
		<div className="list-page">
			<div className="list-card">
				<div className="list-head">
					<div>
						<h2 className="list-title">교수 명단 조회</h2>
						<p className="list-subtitle">사번/학과로 교수 정보를 검색할 수 있어요.</p>
					</div>
				</div>

				<div className="filters">
					<form className="filters-form" onSubmit={handleSearchSubmit}>
						<InputForm label="사번" name="professorId" placeholder="검색어를 입력하세요" onChange={handleChange} />
						<InputForm label="학과 이름" name="deptName" placeholder="검색어를 입력하세요" onChange={handleChange} />

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
