import { useEffect, useState } from 'react';
import InputForm from '../../components/form/InputForm';
import '../../assets/css/ScheduleForm.css';

// schedule 공통 폼
// schedule 등록, 수정 , 상세 보기
const ScheduleForm = ({
	title,
	initialValues = { startDay: '', endDay: '', information: '' },
	onSubmit,
	onCancel,
	submitLabel = '저장',
}) => {
	const [startDay, setStartDay] = useState('');
	const [endDay, setEndDay] = useState('');
	const [information, setInformation] = useState('');

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setStartDay(initialValues.startDay ?? '');
		setEndDay(initialValues.endDay ?? '');
		setInformation(initialValues.information ?? '');
	}, [initialValues?.startDay, initialValues?.endDay, initialValues?.information]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!onSubmit) return;

		await onSubmit({ startDay, endDay, information });
	};

	return (
		<form onSubmit={handleSubmit} className="schedule-form">
			{title && <h3 className="form-title">{title}</h3>}
			<div className="split--div" />

			{/* ✅ 입력영역을 한 번 감싸서 "공지 등록"처럼 패널 느낌 */}
			<div className="schedule-form-body">
				<div className="schedule-form-row">
					<div className="schedule-field">
						<label className="schedule-label">시작 날짜</label>
						<input
							type="date"
							name="startDay"
							className="form-input"
							value={startDay}
							onKeyDown={(e) => e.preventDefault()}
							onChange={(e) => setStartDay(e.target.value)}
						/>
					</div>

					<div className="schedule-field">
						<label className="schedule-label">종료 날짜</label>
						<input
							type="date"
							name="endDay"
							className="form-input"
							value={endDay}
							onKeyDown={(e) => e.preventDefault()}
							onChange={(e) => setEndDay(e.target.value)}
						/>
					</div>
				</div>

				<div className="schedule-field">
					<InputForm
						label="내용"
						name="information"
						placeholder="학사 일정 내용을 입력하세요"
						value={information}
						onChange={(e) => setInformation(e.target.value)}
					/>
				</div>
			</div>

			<div className="schedule-form-actions">
				<button type="button" className="button" onClick={onCancel}>
					취소
				</button>
				<button type="submit" className="button">
					{submitLabel}
				</button>
			</div>
		</form>
	);
};

export default ScheduleForm;
