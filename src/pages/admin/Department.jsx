import { useEffect, useState } from 'react';
import api from '../../api/httpClient';
import InputForm from './../../components/form/InputForm';
import DataTable from '../../components/table/DataTable';
import '../../assets/css/AdminFormLayout.css';

const Department = () => {
	// 학과 전용 상태
	const [formData, setFormData] = useState({
		name: '',
		collegeName: '',
	});

	// 학과 목록 가져오기
	const [dept, setDept] = useState([]);

	// 어떤 학과 수정중인지, null 이면 등록
	const [selectedDeptId, setSelectedDeptId] = useState(null);

	// 학과 목록 조회
	const loadDepartment = async () => {
		try {
			const res = await api.get('/admin/department');
			// console.log(res.data);
			const rawData = res.data.departmentList;
			// console.log(rawData);

			const formattedData = rawData.map((dept) => ({
				id: dept.id,
				학과명: dept.name,
				단과대: dept.college.name,
				단과대ID: dept.college.id,
				원본데이터: dept,
			}));

			setDept(formattedData);
			// console.log('학과 데이터', formattedData);
		} catch (e) {
			console.error('학과 목록 로드 실패:', e);
		}
	};

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		loadDepartment();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// 등록,수정 공통
	const handleSubmit = async () => {
		if (!formData.name.trim()) {
			alert('학과명을 입력해주세요.');
			return;
		}
		if (!formData.collegeName.trim()) {
			alert('단과대명을 입력해주세요.');
			return;
		}

		try {
			if (!selectedDeptId) {
				//등록
				await api.post('/admin/department', formData);
				alert('학과 등록 완료');
			} else {
				//수정
				await api.patch(`/admin/department/${selectedDeptId}`, formData);
				alert('학과 수정 완료');
			}

			setFormData({ name: '', collegeName: '' });
			setSelectedDeptId(null);
			await loadDepartment();
		} catch (e) {
			console.error(e);
			alert(e.response?.data?.message || '학과 등록/수정 실패');
		}
	};

	// 수정 모드 취소
	const handleCancelEdit = () => {
		setSelectedDeptId(null);
		setFormData({ name: '', collegeName: '' });
	};

	// 행 "수정" 버튼
	const handleEditRow = (row) => {
		setSelectedDeptId(row.id);
		setFormData({
			name: row.학과명,
			collegeName: row.단과대,
		});
	};

	// 행 "삭제" 버튼
	const handleDeleteRow = async (row) => {
		if (!window.confirm(`'${row.학과명}' 학과를 삭제하시겠습니까?`)) return;

		try {
			await api.delete(`/admin/department/${row.id}`);
			alert('학과 삭제가 완료되었습니다.');

			// 삭제 대상이 현재 수정 중이던 학과라면 상태 초기화
			if (selectedDeptId === row.id) {
				setSelectedDeptId(null);
				setFormData({ name: '', collegeName: '' });
			}

			await loadDepartment();
		} catch (e) {
			console.error('학과 삭제 실패:', e);
			alert(e.response?.data?.message || '학과 삭제 중 오류가 발생했습니다.');
		}
	};

	// 테이블 헤더 정의 (데이터의 키값과 글자 하나라도 틀리면 안 나옴!)
	const headers = ['학과명', '단과대', '단과대ID'];

	return (
		<div className="form-container">
			<h3>학과 등록</h3>

			<div className="entity-form entity-form-card department-form">
				<InputForm label="학과명" name="name" value={formData.name} onChange={handleChange} />
				<InputForm label="단과대명" name="collegeName" value={formData.collegeName} onChange={handleChange} />

				<div className="button-row">
					<button onClick={handleSubmit} className="button">
						{selectedDeptId ? '학과 수정' : '학과 등록'}
					</button>
					{selectedDeptId && (
						<button type="button" className="button button-secondary" onClick={handleCancelEdit}>
							취소
						</button>
					)}
				</div>
			</div>

			<h3>학과 목록</h3>
			<div>
				<DataTable
					headers={headers}
					data={dept}
					renderActions={(row) => (
						<div>
							<button
								type="button"
								className="button button--sm button--outline button--outline-green"
								onClick={() => handleEditRow(row)}
							>
								수정
							</button>
							<button
								type="button"
								className="button button--sm button--outline button--outline-red"
								onClick={() => handleDeleteRow(row)}
							>
								삭제
							</button>
						</div>
					)}
				/>
			</div>
		</div>
	);
};
export default Department;
