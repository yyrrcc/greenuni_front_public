import { useEffect, useState } from 'react';
import api from '../../api/httpClient';
import InputForm from './../../components/form/InputForm';
import DataTable from '../../components/table/DataTable';
import '../../assets/css/College.css';

const College = () => {
	// 단과대 전용 상태
	const [formData, setFormData] = useState({
		name: '',
	});

	// 단과대 목록 가져오기
	const [collegeList, setCollegeList] = useState([]);

	// 어떤 단과대를 수정 중인지 , null 이면 등록
	const [selectedCollegeId, setSelectedCollegeId] = useState(null);

	// 목록 조회
	const loadCollege = async () => {
		try {
			const res = await api.get('/admin/college');
			const rawData = res.data.collegeList;

			const formattedData = rawData.map((col) => ({
				id: col.id,
				단과대이름: col.name,
				원본데이터: col,
			}));

			setCollegeList(formattedData);
		} catch (e) {
			console.error('단과대 목록 로드 실패:', e);
		}
	};

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		loadCollege();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// 등록 , 수정 공통처리
	const handleSubmit = async () => {
		if (!formData.name.trim()) {
			alert('단과대 이름을 입력해주세요.');
			return;
		}

		try {
			if (!selectedCollegeId) {
				//등록
				const res = await api.post('/admin/college', formData);
				console.log('단과대 등록', res.data);
				alert('단과대 등록이 완료되었습니다.');
			} else {
				// 수정
				const res = await api.patch(`/admin/college/${selectedCollegeId}`, formData);
				console.log('단과대 수정', res.data);
				alert('단과대 수정이 완료되었습니다.');
			}

			// 입력후 초기화 + 선택해제 + 목록 갱신
			setFormData({ name: '' });
			setSelectedCollegeId(null);
			await loadCollege();
		} catch (e) {
			console.error('단과대 등록 / 수정 실패:', e);
			alert(e.response?.data?.message || '등록/수정에 실패했습니다.');
		}
	};

	// 단과대 삭제
	const handleDelete = async () => {
		if (!window.confirm(`단과대를 삭제하시겠습니까?`)) {
			return;
		}

		try {
			await api.delete(`/admin/college/${selectedCollegeId}`);
			alert('단과대 삭제가 완료되었습니다.');

			setSelectedCollegeId(null); // 선택 해제
			await loadCollege(); // 목록 새로고침
		} catch (e) {
			console.error('단과대 삭제 실패:', e);
			alert('단과대 삭제 중 오류가 발생했습니다.');
		}
	};

	// 행 수정 버튼
	const handleEditRow = async (row) => {
		setSelectedCollegeId(row.id);
		setFormData({
			name: row.단과대이름,
		});
	};

	// 행 삭제 버튼
	const handleDeleteRow = async (row) => {
		if (!window.confirm('해당 단과대를 삭제하시겠습니까?')) return;
		try {
			await api.delete(`/admin/college/${row.id}`);
			alert('단과대 삭제가 완료되었습니다.');
			await loadCollege();
		} catch (e) {
			console.error('단과대 삭제', e);
			alert(e.response?.data?.error || '삭제에 실패했습니다.');
		}
	};

	// 테이블 헤더 정의 (데이터의 키값과 글자 하나라도 틀리면 안 나옴!)
	const headers = ['id', '단과대이름'];

	return (
		<div className="form-container">
			<h3>단과대 등록 / 수정</h3>

			<div className="entity-form entity-form-card college-form">
				<InputForm
					label="단과대 이름"
					name="name"
					placeholder="단과대 이름 입력"
					value={formData.name}
					onChange={handleChange}
				/>

				<div className="button-row">
					<button type="button" className="button" onClick={handleSubmit}>
						{selectedCollegeId ? '단과대 수정' : '단과대 등록'}
					</button>
					{selectedCollegeId && (
						<button
							type="button"
							className="button button-secondary"
							onClick={() => {
								setSelectedCollegeId(null);
								setFormData({ name: '' });
							}}
						>
							취소
						</button>
					)}
				</div>
			</div>

			<h3>단과대 목록</h3>
			<div>
				<DataTable
					headers={headers}
					data={collegeList}
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
export default College;
