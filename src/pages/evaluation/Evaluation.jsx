import { useEffect, useState } from 'react';
import RadioForm from '../../components/form/RadioForm';
import TextField from '../../components/form/TextField';
import api from '../../api/httpClient';
// 강의평가 팝업
export default function Evaluation() {
	const [subjectId, setSubjectId] = useState('');
	const [subjectName, setSubjectName] = useState('');

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const id = params.get('subjectId');
		const name = params.get('subjectName');
		if (id === null || name === null) {
			// 팝업 닫기
			window.close();
		}
		setSubjectId(id);
		setSubjectName(name);
	}, []);

	const [value, setValue] = useState({
		answer1: '',
		answer2: '',
		answer3: '',
		answer4: '',
		answer5: '',
		answer6: '',
		answer7: '',
		improvements: '',
	});

	// 강의평가 공통 옵션
	const evaluationOptions = [
		{ value: '1', label: '매우 그렇다' },
		{ value: '2', label: '그렇다' },
		{ value: '3', label: '보통' },
		{ value: '4', label: '그렇지 않다' },
		{ value: '5', label: '전혀 그렇지 않다' },
	];

	// 강의평가 제출
	const handleChange = (e) => {
		const { name, value } = e.target;
		setValue((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault(); // 주소창으로 get 요청 막기

		try {
			await api.post(`/evaluation/write/${subjectId}`, value);
			// 부모창 새로고침
			if (window.opener) {
				window.opener.location.reload();
			}

			// 팝업 닫기
			window.close();
			alert('강의 평가가 완료되었습니다!');
		} catch (e) {
			alert(e.response.data.message);
			console.log('강의 평가 입력 실패 : ' + e);
		}
	};

	return (
		<div>
			<h2>[{subjectName}] 강의 평가</h2>
			<hr />
			<form onSubmit={handleSubmit}>
				<RadioForm
					label="1. 강의 내용은 적절했는가?"
					name="answer1"
					value={value.answer1}
					onChange={handleChange}
					options={evaluationOptions}
				/>

				<RadioForm
					label="2. 이 강의를 통하여 다른 강의에서는 접할 수 없는 새로운 내용을 배울 수 있었는가?"
					name="answer2"
					value={value.answer2}
					onChange={handleChange}
					options={evaluationOptions}
				/>

				<RadioForm
					label="3. 강의를 통하여 해당 교과목에 대한 이해(실기 능력과 기능)가 개선되었는가?"
					name="answer3"
					value={value.answer3}
					onChange={handleChange}
					options={evaluationOptions}
				/>

				<RadioForm
					label="4. 교수는 주요 주제들간의 관계가 드러나도록 내용을 구조화 하여 전달하였는가?"
					name="answer4"
					value={value.answer4}
					onChange={handleChange}
					options={evaluationOptions}
				/>

				<RadioForm
					label="5. 교수는 열정을 갖고 수업을 진행하였는가?"
					name="answer5"
					value={value.answer5}
					onChange={handleChange}
					options={evaluationOptions}
				/>

				<RadioForm
					label="6. 수업시간은 제대로 이루어졌는가?"
					name="answer6"
					value={value.answer6}
					onChange={handleChange}
					options={evaluationOptions}
				/>

				<RadioForm
					label="7. 강의 내용이 과목명에 부합하는가?"
					name="answer7"
					value={value.answer7}
					onChange={handleChange}
					options={evaluationOptions}
				/>

				<TextField
					label="기타"
					name="improvements"
					cols={5}
					rows={5}
					placeholder={'개선이 필요한 점이나 좋았던 점을 자유롭게 작성해주세요.'}
					value={value.improvements}
					onChange={handleChange}
				/>

				<button type="submit" className="btn btn-dark">
					제출
				</button>
			</form>
		</div>
	);
}
