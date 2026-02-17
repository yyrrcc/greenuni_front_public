import { useState, useMemo } from 'react';
import api from '../../../api/httpClient';
import CommonUserFields from '../../user/create/CommonUserFields';
import InputForm from '../../../components/form/InputForm';
import '../../../assets/css/UserCreate.css';

const initialStudent = {
	name: '',
	birthDate: '',
	gender: '여성',
	address: '',
	tel: '',
	email: '',
	deptId: '',
	entranceDate: '',
	grade: '',
	semester: '',
};

const initialProfessor = {
	name: '',
	birthDate: '',
	gender: '여성',
	address: '',
	tel: '',
	email: '',
	deptId: '',
	hireDate: '',
};

const initialStaff = {
	name: '',
	birthDate: '',
	gender: '여성',
	address: '',
	tel: '',
	email: '',
	hireDate: '',
};

export default function UserCreate() {
	const [type, setType] = useState('student');

	// 타입 바꿔도 입력값 날아가지 않게 "타입별 폼 상태"를 따로 들고감
	const [forms, setForms] = useState({
		student: initialStudent,
		professor: initialProfessor,
		staff: initialStaff,
	});

	const meta = useMemo(() => {
		return {
			student: { label: '학생', endpoint: '/user/student' },
			professor: { label: '교수', endpoint: '/user/professor' },
			staff: { label: '직원', endpoint: '/user/staff' },
		};
	}, []);

	const formData = forms[type];

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForms((prev) => ({
			...prev,
			[type]: {
				...prev[type],
				[name]: value,
			},
		}));
	};

	const resetCurrent = () => {
		setForms((prev) => ({
			...prev,
			student: type === 'student' ? initialStudent : prev.student,
			professor: type === 'professor' ? initialProfessor : prev.professor,
			staff: type === 'staff' ? initialStaff : prev.staff,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await api.post(meta[type].endpoint, formData);
			alert(res.data || `${meta[type].label} 입력이 완료되었습니다.`);
			resetCurrent();
		} catch (err) {
			console.error(err);
			alert(err.response?.data?.message || `${meta[type].label} 등록 중 오류가 발생했습니다.`);
		}
	};

	// 타입별 전용 필드만 분기
	const renderTypeFields = () => {
		if (type === 'student') {
			return (
				<>
					<InputForm label="과 ID" name="deptId" value={formData.deptId} onChange={handleChange} />
					<InputForm
						label="입학일"
						name="entranceDate"
						type="date"
						value={formData.entranceDate}
						onKeyDown={(e) => e.preventDefault()}
						onChange={handleChange}
					/>
					<InputForm label="학년" name="grade" value={formData.grade} onChange={handleChange} placeholder="1~4" />
					<InputForm
						label="학기"
						name="semester"
						value={formData.semester}
						onChange={handleChange}
						placeholder="1 또는 2"
					/>
				</>
			);
		}

		if (type === 'professor') {
			return (
				<>
					<InputForm label="과 ID" name="deptId" value={formData.deptId} onChange={handleChange} />
					<InputForm
						label="고용날짜"
						name="hireDate"
						type="date"
						value={formData.hireDate}
						onKeyDown={(e) => e.preventDefault()}
						onChange={handleChange}
					/>
				</>
			);
		}

		// staff
		return (
			<InputForm
				label="고용날짜"
				name="hireDate"
				type="date"
				value={formData.hireDate}
				onKeyDown={(e) => e.preventDefault()}
				onChange={handleChange}
			/>
		);
	};

	return (
		<div className="form-container">
			<div className="user-create-card">
				{/* 헤더 + 탭 */}
				<div className="user-create-header">
					<div className="user-create-titlebox">
						<h1>유저 등록</h1>
						<p className="user-create-sub">학생 / 교수 / 직원을 한 페이지에서 등록할 수 있어요.</p>
					</div>

					<div className="user-type-tabs">
						{Object.entries(meta).map(([key, v]) => (
							<button
								key={key}
								type="button"
								className={`user-type-tab ${type === key ? 'is-active' : ''}`}
								onClick={() => setType(key)}
							>
								{v.label}
							</button>
						))}
					</div>
				</div>

				<form className="user-create-form" onSubmit={handleSubmit}>
					<div className="user-form-table">
						{/* 섹션 타이틀 */}
						<div className="form-section">
							<h3>기본 정보</h3>
						</div>

						<CommonUserFields formData={formData} onChange={handleChange} />

						<div className="form-section">
							<h3>{meta[type].label} 정보</h3>
						</div>

						{renderTypeFields()}
					</div>

					<div className="user-form-actions">
						<div className="user-form-btns">
							<button className="user-reset-btn" type="button" onClick={resetCurrent}>
								현재 입력 초기화
							</button>
							<button className="user-submit-btn" type="submit">
								{meta[type].label} 등록
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
