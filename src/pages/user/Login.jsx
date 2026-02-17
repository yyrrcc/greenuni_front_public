import { useContext, useEffect, useState } from 'react';
import api from '../../api/httpClient';
import { UserContext } from '../../context/UserContext';

export default function Login() {
	const { setToken } = useContext(UserContext);

	const [loginId, setLoginId] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// ID 저장 체크 상태
	const [rememberId, setRememberId] = useState(false);

	// 페이지 들어올 때 저장된 ID 불러오기
	useEffect(() => {
		const saved = localStorage.getItem('savedLoginId');
		if (saved) {
			setLoginId(saved);
			setRememberId(true);
		}
	}, []);

	// 로그인
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setLoading(false);
		if (!loginId || !password) {
			setError('아이디와 비밀번호를 입력해주세요.');
			return;
		}
		try {
			setLoading(true);

			// ID 저장 체크 시 localStorage 저장 / 아니면 삭제
			if (rememberId) localStorage.setItem('savedLoginId', loginId);
			else localStorage.removeItem('savedLoginId');
			const res = await api.post('/auth/login', {
				id: loginId,
				password: password,
			});
			const { accessToken } = res.data;
			localStorage.setItem('token', accessToken);
			setToken(accessToken); // Context의 setToken 호출 -> Provider useEffect가 /auth/me 자동으로 호출
		} catch (err) {
			setError(err.response.data.message);
		} finally {
			setLoading(false);
		}
	};

	// 아이디/비밀번호 찾기
	const AccountPop = (type) => {
		const url = `/findAccount/${type}`;
		window.open(url, '_blank', 'width=600,height=400,scrollbars=no');
	};

	return (
		<div className="public-login-card">
			<h2 className="public-login-title">포털 로그인</h2>

			<form onSubmit={handleSubmit} className="public-login-form">
				<div className="public-input-group">
					<label htmlFor="loginId" className="public-input-label">
						아이디
					</label>
					<input
						id="loginId"
						type="text"
						className="public-input"
						placeholder="아이디를 입력하세요"
						value={loginId}
						onChange={(e) => setLoginId(e.target.value)}
					/>
				</div>

				<div className="public-input-group">
					<label htmlFor="password" className="public-input-label">
						비밀번호
					</label>
					<input
						id="password"
						type="password"
						className="public-input"
						placeholder="비밀번호를 입력하세요"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>

				<div className="public-login-options">
					<label className="public-checkbox-label">
						{/* 체크 상태 연결 */}
						<input
							type="checkbox"
							className="public-checkbox"
							checked={rememberId}
							onChange={(e) => setRememberId(e.target.checked)}
						/>
						<span>ID 저장</span>
					</label>
				</div>

				{error && <p className="error-message">{error}</p>}

				<button type="submit" className="public-login-button" disabled={loading}>
					{loading ? 'LOGGING IN...' : 'LOGIN'}
				</button>

				<div className="public-login-links">
					<button type="button" onClick={() => AccountPop('아이디')} className="public-link-button">
						아이디 찾기
					</button>
					<span className="public-link-divider">·</span>
					<button type="button" onClick={() => AccountPop('비밀번호')} className="public-link-button">
						비밀번호 찾기
					</button>
					<span className="public-link-divider">·</span>
				</div>
			</form>
		</div>
	);
}
