import { useEffect, useMemo, useState } from 'react';
import DataTable from '../../components/table/DataTable';
import InputForm from '../../components/form/InputForm';
import api from '../../api/httpClient';
import OptionForm from '../../components/form/OptionForm';

// 교수 - 성적 기입 컴포넌트
export default function GradeInput({ gradeItem, setOpenGrade, stuNum, onSuccess }) {
	// 학생 기본 정보 props에서 뽑기
	const headers = ['번호', '이름'];
	const tableData = useMemo(() => {
		return gradeItem.map((s) => ({
			번호: s.studentId ?? '',
			이름: s.studentName ?? '',
		}));
	}, [gradeItem]);

	// gradeitem에서 기본값 먼저 세팅
	const base = gradeItem[0]; // 객체

	const subjectId = base?.subjectId;
	const studentId = base?.studentId;

	// 수정 시 변경되는 값들...
	const [value, setValue] = useState({
		absent: base?.absent ?? '',
		lateness: base?.lateness ?? '',
		homework: base?.homework ?? '',
		midExam: base?.midExam ?? '',
		finalExam: base?.finalExam ?? '',
		grade: base?.grade ?? null,
	});

	// 성적 입력 및 수정 처리
	const handleChange = (e) => {
		const { name, value } = e.target;
		setValue((p) => ({ ...p, [name]: value }));
	};

	const updateStudentGrade = async () => {
		try {
			await api.patch(`/professor/subject/${subjectId}/${studentId}`, value);
			alert('성적 입력이 완료되었습니다.');
			setOpenGrade(false);
			onSuccess?.(); // 성공 후 부모한테 refetch 신호
		} catch (e) {
			alert(e?.response?.data?.message ?? '성적 입력에 실패하였습니다.');
			console.log('성적 입력 실패 : ' + e);
		}
	};

	// 성적 등급 선택 옵션들
	const gradeOptions = [
		{ value: 'A+', label: 'A+' },
		{ value: 'A0', label: 'A0' },
		{ value: 'B+', label: 'B+' },
		{ value: 'B0', label: 'B0' },
		{ value: 'C+', label: 'C+' },
		{ value: 'C0', label: 'C0' },
		{ value: 'D+', label: 'D+' },
		{ value: 'D0', label: 'D0' },
		{ value: 'F', label: 'F' },
	];

	return (
		<div>
			<h3>성적 기입</h3>

			<button onClick={() => setOpenGrade(false)}>학생 목록</button>
			<DataTable headers={headers} data={tableData} />

			<form
				onSubmit={(e) => {
					e.preventDefault();
					updateStudentGrade();
				}}
			>
				<div>
					<InputForm
						label="결석"
						name="absent"
						value={value.absent}
						onChange={handleChange}
						placeholder={'결석 5회 이상 F'}
						required
					/>
				</div>

				<div>
					<InputForm
						label="지각"
						name="lateness"
						value={value.lateness}
						onChange={handleChange}
						placeholder={'지각 3회 시 결석 1번'}
						required
					/>
				</div>

				<div>
					<InputForm
						label="과제점수"
						name="homework"
						value={value.homework}
						onChange={handleChange}
						placeholder={'20% 반영'}
						required
					/>
				</div>

				<div>
					<InputForm
						label="중간시험"
						name="midExam"
						value={value.midExam}
						placeholder={'40% 반영'}
						onChange={handleChange}
						required
					/>
				</div>

				<div>
					<InputForm
						label="기말시험"
						name="finalExam"
						value={value.finalExam}
						placeholder={'40% 반영'}
						onChange={handleChange}
					/>
				</div>

				{value.grade ? (
					<div>
						<OptionForm
							label="등급"
							name="grade"
							value={value.grade}
							onChange={handleChange}
							options={gradeOptions}
							placeholder="등급 선택"
						/>
					</div>
				) : stuNum >= 20 ? (
					'상대평가 과목입니다. 등급은 일괄 산출됩니다.'
				) : (
					'절대평가 과목은 최초 입력 시 성적을 기준으로 자동 등급이 산출됩니다.'
				)}

				<br />
				<br />
				<button type="submit">{value.grade !== null ? '성적 수정' : '성적 입력'}</button>
			</form>
		</div>
	);
}
