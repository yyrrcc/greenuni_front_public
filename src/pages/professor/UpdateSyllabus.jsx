import { useContext, useEffect, useState } from 'react';
import api from '../../api/httpClient';
import InputForm from '../../components/form/InputForm';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/UpdateSyllabus.css';

export default function UpdateSyllabus({ setIsEdit, syllabus }) {
	const { userRole } = useContext(UserContext);
	const navigate = useNavigate();

	const [value, setValue] = useState({
		overview: syllabus.overview ?? '',
		objective: syllabus.objective ?? '',
		textbook: syllabus.textbook ?? '',
		program: syllabus.program ?? '',
	});

	const subjectId = syllabus.subjectId;

	useEffect(() => {
		if (userRole !== 'professor') {
			alert('권한이 없는 페이지입니다!');
			navigate('/');
			return;
		}
	}, [userRole, navigate]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setValue((p) => ({ ...p, [name]: value }));
	};

	const updateUserInfo = async () => {
		try {
			await api.patch(`/professor/syllabus/${subjectId}`, {
				overview: value.overview,
				objective: value.objective,
				textbook: value.textbook,
				program: value.program,
			});

			alert('수정이 완료되었습니다!');
			setIsEdit(false);
		} catch (err) {
			const serverMsg = err.response?.data?.message;
			alert(serverMsg);
		}
	};

	return (
		<div className="usd-wrap">
			<h2 className="usd-title">강의 계획서 수정</h2>

			<form
				className="usd-form"
				onSubmit={(e) => {
					e.preventDefault();
					updateUserInfo();
				}}
			>
				<div className="usd-box">
					<InputForm label="강의 개요" name="overview" value={value.overview} onChange={handleChange} />

					<InputForm label="강의 목표" name="objective" value={value.objective} onChange={handleChange} />

					<InputForm label="교재 정보" name="textbook" value={value.textbook} onChange={handleChange} />

					<InputForm label="주간 계획" name="program" value={value.program} onChange={handleChange} />
				</div>

				<div className="usd-action">
					<button type="button" className="usd-btn usd-cancel" onClick={() => setIsEdit(false)}>
						취소
					</button>
					<button type="submit" className="usd-btn usd-submit">
						수정
					</button>
				</div>
			</form>
		</div>
	);
}
