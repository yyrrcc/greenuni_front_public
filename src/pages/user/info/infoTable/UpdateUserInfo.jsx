import { useState } from 'react';
import InputForm from '../../../../components/form/InputForm';
import api from '../../../../api/httpClient';

export default function UpdateUserInfo({ userInfo, setIsEdit }) {
	const [value, setValue] = useState({
		address: userInfo.address,
		tel: userInfo.tel,
		email: userInfo.email,
		password: '',
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setValue((p) => ({ ...p, [name]: value }));
	};

	const updateUserInfo = async () => {
		try {
			await api.patch(`/personal/update?password=${value.password}`, {
				address: value.address,
				tel: value.tel,
				email: value.email,
			});

			alert('수정이 완료되었습니다!');
			setIsEdit(false);
		} catch (err) {
			const serverMsg = err.response?.data?.message;
			alert(serverMsg || '오류가 발생했습니다.');
		}
	};

	return (
		<div className="form-container">
			<h2>개인 정보 수정</h2>

			<form
				onSubmit={(e) => {
					e.preventDefault(); // 리로드 방지
					updateUserInfo();
				}}
			>
				<div>
					<InputForm label="주소" name="address" value={value.address} onChange={handleChange} required />
				</div>

				<div>
					<InputForm label="전화번호" type="text" name="tel" value={value.tel} onChange={handleChange} required />
				</div>

				<div>
					<InputForm label="이메일" type="email" name="email" value={value.email} onChange={handleChange} required />
				</div>

				<div>
					<InputForm label="비밀번호 확인" type="password" name="password" onChange={handleChange} required />
				</div>

				<button type="submit">수정하기</button>
				<button onClick={() => setIsEdit(false)}>취소</button>
			</form>
		</div>
	);
}
