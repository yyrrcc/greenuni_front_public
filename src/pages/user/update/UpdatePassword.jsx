import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/UserContext';
import api from '../../../api/httpClient';
import InputForm from '../../../components/form/InputForm';

export default function UpdatePassword() {
	const { user, userRole } = useContext(UserContext);
	const navigate = useNavigate();
	const [value, setValue] = useState({
		beforePassword: '',
		afterPassword: '',
		passwordCheck: '',
	});

	if (!user || !userRole) {
		// 권한 확인
		alert('권한이 없는 페이지입니다. 로그인 해 주세요');
		navigate('/login', { replace: true });
		return;
	}

	const handleChange = (e) => {
		const { name, value } = e.target;
		setValue((p) => ({ ...p, [name]: value }));
	};

	const updatePassword = async () => {
		try {
			await api.patch('/personal/password', {
				beforePassword: value.beforePassword,
				afterPassword: value.afterPassword,
				passwordCheck: value.passwordCheck,
			});
			alert('비밀번호 변경이 완료되었습니다');
			setValue({
				// 비밀번호 변경 후 초기화 하기
				beforePassword: '',
				afterPassword: '',
				passwordCheck: '',
			});
		} catch (e) {
			alert(e.response.data.message);
			console.error('비밀번호 변경 실패' + e);
		}
	};

	return (
		<div className="form-container">
			<div>
				<h2>비밀번호 변경</h2>
				<div className="split--div"></div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						updatePassword();
					}}
				>
					<div>
						<InputForm
							label="현재 비밀번호"
							type="password"
							name="beforePassword"
							value={value.beforePassword}
							placeholder="비밀번호는 6~20자 사이로 입력해주세요."
							onChange={handleChange}
							required
						/>
					</div>

					<div>
						<InputForm
							label="변경할 비밀번호"
							type="password"
							name="afterPassword"
							value={value.afterPassword}
							placeholder="새 비밀번호를 입력해주세요"
							onChange={handleChange}
							required
						/>
					</div>

					<div>
						<InputForm
							label="비밀번호 확인"
							type="password"
							name="passwordCheck"
							value={value.passwordCheck}
							onChange={handleChange}
							required
						/>
					</div>

					<button type="submit" className="btn btn-dark">
						수정하기
					</button>
				</form>
			</div>
		</div>
	);
}
