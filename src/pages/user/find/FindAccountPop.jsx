import { useState } from 'react';
import InputForm from '../../../components/form/InputForm';
import RadioForm from '../../../components/form/RadioForm';
import api from '../../../api/httpClient';
import { useParams } from 'react-router-dom';
import PopResult from './PopResult';

export default function FindAccountPop() {
	// 아이디 / 비밀번호 찾기
	const { type } = useParams(); // 팝업 열 때 넘겨주는 params (아이디/비밀번호)
	const [result, setResult] = useState(null); // 찾은 아이디/비밀번호 정보
	const [name, setName] = useState(null); // 찾기 성공 시 - 사용자 이름

	const [formData, setFormData] = useState({
		// 입력 정보
		id: '',
		name: '',
		email: '',
		userRole: '',
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const roleOptions = [
		// 역할 체크
		{ value: 'student', label: '학생' },
		{ value: 'professor', label: '교수' },
		{ value: 'staff', label: '직원' },
	];

	// 검색 버튼 눌렀을 때
	const handleSearch = async () => {
		const url = type === '아이디' ? '/personal/find/id' : '/personal/find/password';
		try {
			const res = await api.post(url, formData);
			if (type === '아이디') {
				setResult(res.data.id);
			} else {
				setResult(res.data.password);
			}
			setName(res.data.name);
		} catch (e) {
			alert(e.response.data.message);
			console.log(e);
		}
	};

	return (
		<div>
			{name && result ? (
				<PopResult name={name} result={result} type={type} />
			) : (
				<div>
					<h2>{type === '아이디' ? '아이디 찾기' : '비밀번호 찾기'}</h2>
					{type === '비밀번호' && <InputForm label="아이디" name="id" value={formData?.id} onChange={handleChange} />}
					<InputForm label="이름" name="name" value={formData?.name} onChange={handleChange} />
					<InputForm label="이메일" name="email" value={formData?.email} onChange={handleChange} />
					<RadioForm name="userRole" value={formData?.userRole} onChange={handleChange} options={roleOptions} />

					<button onClick={() => handleSearch()}>{type === '아이디' ? '아이디 찾기' : '임시 비밀번호 발급'}</button>
				</div>
			)}
		</div>
	);
}
