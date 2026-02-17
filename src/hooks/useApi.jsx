import { useState } from 'react';

// 커스텀 훅(에러 처리, 로딩)
const useApi = () => {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const request = async (apiCall) => {
		setError(null);
		setLoading(true);
		try {
			const response = await apiCall();
			setLoading(false);
			return response.data; // 이미 res 에서 data를 뺀 값을 return 함
		} catch (err) {
			setLoading(false); // 에러 발생해도 반드시 false 처리
			if (err.response) {
				// 서버가 응답한 에러 상태코드(status) 및 메시지(message) 처리
				// 뒤에 붙는 물음표 : 옵셔널 체이닝(Optional Chaining) 연산자
				// err.response가 undefined 또는 null이면 그냥 undefined를 리턴해서 에러나는 걸 방지
				setError(err.response.data?.message || `에러 발생: ${err.response.status}`);
			} else {
				setError('네트워크 오류가 발생했습니다.');
			}
			throw err; // 컴포넌트에서 추가 동작을 위해 다시 던짐
		}
	};

	return { error, loading, request, setError };
};

export default useApi;
