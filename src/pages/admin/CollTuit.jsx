// components/feature/CollTuit.jsx
import { useEffect, useState } from 'react';
import api from '../../api/httpClient';
import InputForm from './../../components/form/InputForm';
import DataTable from '../../components/table/DataTable';
import '../../assets/css/AdminFormLayout.css';

const CollTuit = () => {
	// 폼 상태
	const [formData, setFormData] = useState({
		name: '',
		amount: '',
	});

	// 어떤 단과대를 수정 중인지 , null 이면 등록
	const [selectedCollegeId, setSelectedCollegeId] = useState(null);

	// 단대별 등록금 목록
	const [collTuit, setCollTuit] = useState([]);

	// 목록 조회
	const loadCollTuit = async () => {
		try {
			const res = await api.get('/admin/tuition');
			const rawData = res.data.collTuitList || [];

			const formattedData = rawData.map((col) => ({
				id: col.collegeId,
				단과대: col.name,
				등록금: col.amount,
				원본데이터: col,
			}));

			setCollTuit(formattedData);
		} catch (e) {
			console.error('단대별 등록금 목록 로드 실패:', e);
		}
	};

	useEffect(() => {
		loadCollTuit();
	}, []);

	// 인풋 변경
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// 등록 / 수정 공통 처리
	const handleSubmit = async () => {
		try {
			if (!selectedCollegeId) {
				// 등록
				await api.post('/admin/tuition', formData);
				alert('단대별 등록금 등록이 완료되었습니다.');
			} else {
				// 수정
				await api.patch(`/admin/tuition/${selectedCollegeId}`, formData);
				alert('단대별 등록금 수정이 완료되었습니다.');
			}

			// 폼 초기화 + 목록 갱신
			setFormData({ name: '', amount: '' });
			setSelectedCollegeId(null);
			await loadCollTuit();
		} catch (e) {
			console.error('단대별 등록금 등록/수정 실패:', e.response?.data || e);
			alert(e.response?.data.message || '등록/수정에 실패했습니다.');
		}
	};

	// 행 수정 버튼
	const handleEditRow = (row) => {
		setSelectedCollegeId(row.id);
		setFormData({
			name: row.단과대,
			amount: row.등록금,
		});
	};

	// 행 삭제 버튼
	const handleDeleteRow = async (row) => {
		if (!window.confirm(`[${row.단과대}] 등록금을 삭제하시겠습니까?`)) return;

		try {
			await api.delete(`/admin/tuition/${row.id}`);
			alert('단대별 등록금 삭제가 완료되었습니다.');

			// 지금 수정 중인 대상이면 폼도 리셋
			if (selectedCollegeId === row.id) {
				setSelectedCollegeId(null);
				setFormData({ name: '', amount: '' });
			}

			await loadCollTuit();
		} catch (e) {
			console.error('단대별 등록금 삭제 실패:', e.response?.data || e);
			alert(e.response?.data.message || '삭제에 실패했습니다.');
		}
	};

	const headers = ['단과대', '등록금'];

	return (
		<div className="form-container">
			<section className="admin-section">
				<h3>단대별 등록금 등록 / 수정</h3>

				<div className="entity-form entity-form-card colltuit-form">
					<InputForm label="단과대 이름" name="name" placeholder="입력" value={formData.name} onChange={handleChange} />
					<InputForm label="등록금" name="amount" placeholder="입력" value={formData.amount} onChange={handleChange} />

					<div className="button-row">
						<button type="button" className="button" onClick={handleSubmit}>
							{selectedCollegeId ? '등록금 수정' : '등록금 등록'}
						</button>
						{selectedCollegeId && (
							<button
								type="button"
								className="button button-secondary"
								onClick={() => {
									setSelectedCollegeId(null);
									setFormData({ name: '', amount: '' });
								}}
							>
								취소
							</button>
						)}
					</div>
				</div>
			</section>

			<section className="admin-section">
				<h3>단대별 등록금 목록</h3>
				<div className="admin-table">
					<DataTable
						headers={headers}
						data={collTuit}
						renderActions={(row) => (
							<div className="row-actions">
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
			</section>
		</div>
	);
};

export default CollTuit;
