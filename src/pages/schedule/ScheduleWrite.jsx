import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/httpClient';
import { UserContext } from '../../context/UserContext';
import ScheduleForm from '../schedule/ScheduleForm';
import '../../assets/css/ScheduleForm.css';

const ScheduleWrite = () => {
	const navigate = useNavigate();
	const { userRole } = useContext(UserContext);
	const [error, setError] = useState(null);

	if (userRole !== 'staff') {
		return (
			<div className="form-container schedule-page">
				권한이 없습니다.
				<button className="button" onClick={() => navigate(-1)}>
					뒤로
				</button>
			</div>
		);
	}

	const handleCreate = async ({ startDay, endDay, information }) => {
		try {
			await api.post('/schedule/write', { startDay, endDay, information });
			alert('학사 일정 등록 완료!');
			navigate('/schedule');
		} catch (err) {
			// TODO: 백엔드에서 날짜 관련 valid 잡기
			setError(err.response.data.message);
		}
	};

	return (
		<>
			<ScheduleForm
				title="학사 일정 등록"
				initialValues={{ startDay: '', endDay: '', information: '' }}
				onSubmit={handleCreate}
				onCancel={() => navigate('/schedule')}
				submitLabel="등록"
			/>
			{/* TODO: 에러 메시지 위치를 어디에서 잡을 것인지 확인하기 */}
			{error && <div className="error-message">{error}</div>}
		</>
	);
};

export default ScheduleWrite;
