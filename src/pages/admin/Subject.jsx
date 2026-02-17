import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import api from '../../api/httpClient';
import InputForm from '../../components/form/InputForm';
import DataTable from '../../components/table/DataTable';
import { toHHMM } from '../../utils/DateTimeUtil';
import OptionForm from '../../components/form/OptionForm';
import PaginationForm from '../../components/form/PaginationForm';
import '../../assets/css/AdminFormLayout.css';
import RadioForm from '../../components/form/RadioForm';
import { SUBJECT_TYPE2 } from '../../utils/subjectTypeOptions';

export default function Subject() {
	// ================== 강의 등록/수정 폼 ==================
	const [formData, setFormData] = useState({
		name: '',
		professorName: '',
		roomId: '',
		deptName: '',
		type: '전공',
		subYear: '',
		semester: '',
		subDay: '월',
		startTime: '',
		endTime: '',
		credits: '',
		capacity: '',
	});

	// 어떤 강의를 수정 중인지 (null이면 "새 등록" 모드)
	const [editingId, setEditingId] = useState(null);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const resetForm = () => {
		setFormData({
			name: '',
			professorName: '',
			roomId: '',
			deptName: '',
			type: '전공',
			subYear: '',
			semester: '',
			subDay: '월',
			startTime: '',
			endTime: '',
			credits: '',
			capacity: '',
		});
		setEditingId(null);
	};

	// 백엔드 SubjectFormDto가 Long을 많이 쓰기 때문에
	// 전송 직전에 숫자 필드는 Number로 변환해서 보냄
	const buildPayload = () => {
		return {
			...formData,
			// 🔹 이제 professorId / deptId는 안 쓰고 이름만 보냄
			// professorId: undefined,
			// deptId: undefined,
			subYear: formData.subYear ? Number(formData.subYear) : null,
			semester: formData.semester ? Number(formData.semester) : null,
			startTime: formData.startTime ? Number(formData.startTime) : null,
			endTime: formData.endTime ? Number(formData.endTime) : null,
			credits: formData.credits ? Number(formData.credits) : null,
			capacity: formData.capacity ? Number(formData.capacity) : null,
		};
	};

	// ================== 페이징 상태 ==================
	const [searchParams, setSearchParams] = useSearchParams();

	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [totalCount, setTotalCount] = useState(0);

	// ================== 강의 목록 상태 ==================
	const [subjectList, setSubjectList] = useState([]);

	// 강의 목록 조회(페이징)
	const loadSubjectList = async (page = 0) => {
		try {
			const params = { page, size: 10 }; // 쿼리 파라미터 구성
			const res = await api.get('/subject/list', { params });

			const rawData = res.data.lists; // 리스트 부분만 추출

			const formattedData = rawData.map((sub) => ({
				id: sub.id,
				강의명: sub.name,
				교수: sub.professorName,
				강의실: sub.roomId,
				학과: sub.deptName,
				구분: sub.type,
				연도: sub.subYear,
				학기: sub.semester,
				요일: sub.subDay,
				시간: `${toHHMM(sub.startTime)}-${toHHMM(sub.endTime)}`,
				이수학점: sub.credits,
				정원: sub.capacity,
				원본데이터: sub,
			}));

			setSubjectList(formattedData);
			setCurrentPage(res.data.currentPage);
			setTotalPages(res.data.totalPages);
			setTotalCount(res.data.listCount);
		} catch (e) {
			console.error('강의 목록 로드 실패:', e);
		}
	};

	// URL 파라미터 변경 감지 (초기 로드 + 페이지 변경 시)
	useEffect(() => {
		const page = parseInt(searchParams.get('page') || '0', 10);
		loadSubjectList(page);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	// 페이지 변경 (URL 업데이트)
	const handlePageChange = (newPage) => {
		if (newPage >= 0 && newPage < totalPages) {
			const params = { page: newPage.toString() };
			setSearchParams(params); // URL 업데이트 → useEffect 자동 실행
		}
	};

	// ================== 등록 / 수정 / 삭제 ==================

	const handleSubmit = async () => {
		try {
			const payload = buildPayload();

			let res;
			if (editingId === null) {
				// 새 강의 등록
				res = await api.post('/admin/subject', payload);
				console.log('강의 등록 성공:', res.data);
				alert('강의 등록 완료!');
			} else {
				// 기존 강의 수정
				res = await api.patch(`/admin/subject/${editingId}`, payload);
				console.log('강의 수정 성공:', res.data);
				alert('강의 수정 완료!');
			}

			// 목록 새로고침 (현재 페이지 유지)
			await loadSubjectList(currentPage);
			resetForm();
		} catch (e) {
			console.error('강의 등록/수정 실패:', e);
			if (e.response) {
				console.error('📛 상태코드:', e.response.status);
				console.error('📛 응답 데이터:', e.response.data);
				alert(e.response.data.message || e.response.data || '강의 등록/수정 실패');
			} else {
				alert('강의 등록/수정 실패(네트워크 오류)');
			}
		}
	};

	// 강의 삭제
	const handleDelete = async () => {
		if (editingId === null) {
			alert('삭제할 강의를 먼저 선택해주세요.');
			return;
		}
		if (!window.confirm('정말 이 강의를 삭제하시겠습니까?')) return;

		try {
			const res = await api.delete(`/admin/subject/${editingId}`);
			console.log('강의 삭제 성공:', res.data);
			alert('강의 삭제 완료!');

			// 목록 새로고침 (현재 페이지 유지)
			await loadSubjectList(currentPage);
			resetForm();
		} catch (e) {
			console.error('강의 삭제 실패:', e);
			if (e.response) {
				console.error('📛 상태코드:', e.response.status);
				console.error('📛 응답 데이터:', e.response.data);
				alert(e.response.data.message || e.response.data || '강의 삭제 실패');
			} else {
				alert('강의 삭제 실패(네트워크 오류)');
			}
		}
	};

	// 행 수정 버튼 (표 옆 "수정" 버튼)
	const handleEditRow = (row) => {
		const sub = row.원본데이터;

		setFormData({
			name: sub.name || '',
			professorName: sub.professorName || '',
			roomId: sub.roomId || '',
			deptName: sub.deptName || '',
			type: sub.type || '전공',
			subYear: sub.subYear != null ? String(sub.subYear) : '',
			semester: sub.semester != null ? String(sub.semester) : '',
			subDay: sub.subDay || '월',
			startTime: sub.startTime != null ? String(sub.startTime) : '',
			endTime: sub.endTime != null ? String(sub.endTime) : '',
			credits: sub.credits != null ? String(sub.credits) : '',
			capacity: sub.capacity != null ? String(sub.capacity) : '',
		});
		setEditingId(sub.id);
	};

	// 행 삭제 버튼 (표 옆 "삭제" 버튼)
	const handleDeleteRow = async (row) => {
		if (!window.confirm('해당 강의를 삭제하시겠습니까?')) return;

		try {
			await api.delete(`/admin/subject/${row.id}`);
			alert('강의 삭제가 완료되었습니다.');
			// 현재 페이지 유지하면서 목록 새로고침
			await loadSubjectList(currentPage);
			// 만약 내가 수정 중이던 강의라면 폼도 초기화
			if (editingId === row.id) {
				resetForm();
			}
		} catch (e) {
			console.error('강의 삭제 실패:', e);
			alert(e.response?.data?.error || e.response?.data?.message || '삭제에 실패했습니다.');
		}
	};

	// 테이블 헤더 정의
	const headers = [
		'id',
		'강의명',
		'교수',
		'강의실',
		'학과',
		'구분',
		'연도',
		'학기',
		'요일',
		'시간',
		'이수학점',
		'정원',
	];

	const SUBJECT_DAY_OPTIONS = [
		{ value: '월', label: '월' },
		{ value: '화', label: '화' },
		{ value: '수', label: '수' },
		{ value: '목', label: '목' },
		{ value: '금', label: '금' },
	];

	return (
		<div className="form-container">
			<h3>강의 등록</h3>

			{/* 공통 엔티티 폼 카드 */}
			<div className="entity-form entity-form-card subject-form">
				<InputForm
					label="강의명"
					name="name"
					value={formData.name}
					onChange={handleChange}
					placeholder="예: 컴퓨터의 이해"
				/>

				<InputForm
					label="담당교수"
					name="professorName"
					value={formData.professorName}
					onChange={handleChange}
					placeholder="예: 홍길동"
				/>

				<InputForm
					label="강의실"
					name="roomId"
					value={formData.roomId}
					onChange={handleChange}
					placeholder="예: A101"
				/>

				<InputForm
					label="학과"
					name="deptName"
					value={formData.deptName}
					onChange={handleChange}
					placeholder="예: 컴퓨터공학과"
				/>

				<div className="input-group">
					<RadioForm
						label="이수 구분"
						name="type"
						value={formData.type}
						onChange={handleChange}
						options={SUBJECT_TYPE2}
					/>
				</div>

				<InputForm
					label="연도"
					name="subYear"
					value={formData.subYear}
					onChange={handleChange}
					placeholder="예: 2025"
				/>
				<InputForm label="학기" name="semester" value={formData.semester} onChange={handleChange} placeholder="예: 1" />

				<OptionForm
					label="요일"
					name="subDay"
					value={formData.subDay}
					onChange={handleChange}
					options={SUBJECT_DAY_OPTIONS}
				/>

				<InputForm
					label="시작 시간"
					name="startTime"
					value={formData.startTime}
					onChange={handleChange}
					placeholder="예 : 9 (09:00)"
				/>
				<InputForm
					label="종료 시간"
					name="endTime"
					value={formData.endTime}
					onChange={handleChange}
					placeholder="예 : 10 (10:00)"
				/>

				<InputForm
					label="이수학점"
					name="credits"
					value={formData.credits}
					onChange={handleChange}
					placeholder="예: 3"
				/>
				<InputForm
					label="정원"
					name="capacity"
					value={formData.capacity}
					onChange={handleChange}
					placeholder="예: 20"
				/>

				<div className="button-row">
					<button onClick={handleSubmit} className="button">
						{editingId === null ? '강의 등록' : '강의 수정'}
					</button>
					<button onClick={resetForm} className="button button-secondary">
						새로 입력
					</button>
					{editingId !== null && (
						<button onClick={handleDelete} className="button button--outline button--outline-red">
							선택 강의 삭제
						</button>
					)}
				</div>
			</div>

			<h3>강의 목록</h3>

			<div>
				<DataTable
					headers={headers}
					data={subjectList}
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

			<PaginationForm
				currentPage={currentPage}
				totalPages={totalPages}
				blockSize={20}
				onPageChange={handlePageChange}
			/>
		</div>
	);
}
