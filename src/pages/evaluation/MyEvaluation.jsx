import { useEffect, useMemo, useState } from 'react';
import api from '../../api/httpClient';
import DataTable from '../../components/table/DataTable';
import OptionForm from '../../components/form/OptionForm';

export default function MyEvaluation() {
	// 교수 - 내 강의 평가 조회 + 담당 강의 옵션으로 검색 (페이징 x)
	const [subName, setSubName] = useState(''); // 선택한 학과이름
	const [evalList, setEvalList] = useState([]); // 강의평가 리스트
	const [subNameList, setSubNameList] = useState([]); // 교수의 과목 리스트

	const loadMyEvaluation = async (selectedSubName = subName) => {
		try {
			const params = {};
			if (selectedSubName && selectedSubName !== '') {
				params.subject_Name = selectedSubName;
			}
			// if (subName && subName !== '과목 선택') {
			// 	params.subject_Name = subName;
			// }
			const res = await api.get('/evaluation/read', { params });
			// 백엔드에서 받은 과목 리스트를 OptionForm 형식으로 변환
			const formattedOptions = res.data.subNames.map((sub) => ({
				value: sub.name,
				label: sub.name,
			}));
			setSubNameList(formattedOptions);
			setEvalList(res.data.eval);
		} catch (e) {
			alert(e.response?.data?.message || '강의 평가 조회 실패');
		}
	};

	useEffect(() => {
		loadMyEvaluation();
	}, []);

	// select 변경 시 바로 검색 실행
	const handleSubNameChange = (e) => {
		const newSubName = e.target.value;
		console.log('e.target.value', e.target.value);
		setSubName(newSubName);
		loadMyEvaluation(newSubName); // 바로 API 호출
	};

	// OptionForm에 넘길 옵션 (전체 + 과목 목록)
	const subjectOptions = useMemo(() => {
		return [{ value: '', label: '전체' }, ...subNameList];
	}, [subNameList]);

	// 테이블 데이터
	const headers = ['과목 이름', '총 평가 점수', '건의 사항'];

	const tableData = useMemo(() => {
		return evalList.map((p) => ({
			'과목 이름': p.name ?? '-',
			'총 평가 점수': p.answerSum ?? '-',
			'건의 사항': p.improvements ?? '-',
		}));
	}, [evalList]);

	return (
		<div className="form-container">
			<h2>내 강의 평가</h2>
			<br></br>

			{evalList.length > 0 ? (
				<div>
					<OptionForm
						label="강의 목록"
						name="subName"
						value={subName ?? '과목 선택'}
						onChange={handleSubNameChange}
						options={subjectOptions}
					/>

					{/* <button onClick={() => loadMyEvaluation()} className="button">
						검색
					</button> */}

					<DataTable headers={headers} data={tableData} />
				</div>
			) : (
				<div className="eval-empty">아직 등록된 강의 평가가 없습니다. </div>
			)}
		</div>
	);
}
