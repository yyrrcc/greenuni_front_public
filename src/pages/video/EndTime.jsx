import { useEffect, useRef, useState, useContext } from 'react';
import api from '../../api/httpClient';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

export default function EndTime({ roomCode }) {
	const [remainText, setRemainText] = useState('');
	const warnedRef = useRef(false);
	const timerRef = useRef(null);

	const navigate = useNavigate();
	const { userRole } = useContext(UserContext);

	useEffect(() => {
		if (!roomCode) return;

		const startTimer = (endAt) => {
			if (timerRef.current) clearInterval(timerRef.current);

			const tick = () => {
				const diffMs = endAt - Date.now();
				const remainSec = Math.floor(diffMs / 1000);

				// 종료
				if (remainSec <= 0) {
					clearInterval(timerRef.current);
					alert('상담 시간이 종료되었습니다.');

					userRole === 'professor'
						? navigate('/counseling/manage', { replace: true })
						: navigate('/counseling/manage', { replace: true });

					return;
				}

				// 종료 10분 전 알림 (1회)
				if (remainSec <= 600 && !warnedRef.current) {
					warnedRef.current = true;
					alert('남은 상담 시간이 10분 미만입니다. 자동 종료 전 완료 버튼을 눌러주세요.');
				}

				const min = Math.floor(remainSec / 60);
				const sec = remainSec % 60;

				setRemainText(`${min}분 ${sec}초`);
			};

			tick();
			timerRef.current = setInterval(tick, 1000);
		};

		const fetchEndTime = async () => {
			const res = await api.get('/reserve/timeCheck', {
				params: { roomCode },
			});
			startTimer(res.data.endAt);
		};

		fetchEndTime();

		return () => clearInterval(timerRef.current);
	}, [roomCode, navigate, userRole]);

	return <div>잔여시간 : {remainText}</div>;
}
