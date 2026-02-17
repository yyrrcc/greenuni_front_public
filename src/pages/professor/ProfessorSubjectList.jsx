import { useEffect, useMemo, useState } from 'react';
import api from '../../api/httpClient';
import DataTable from '../../components/table/DataTable';
import { toHHMM } from '../../utils/DateTimeUtil';
import OptionForm from '../../components/form/OptionForm';
import { refineList } from '../../utils/DeDuple';
import SubjectStudentList from './SubjectStudentList';

export default function ProfessorSubjectList() {
	const [subjectList, setSubjectList] = useState([]);
	const [category, setCategory] = useState('ALL'); // 기본값: 전체
	const [categoryOptions, setCategoryOptions] = useState([]);

	const [subjectId, setSubjectId] = useState();
	const [subName, setSubName] = useState();
	const [listOpen, setListOpen] = useState(false);

	useEffect(() => {
		const loadProfessorSubjectList = async () => {
			try {
				const res = await api.get('/professor/subject');
				setSubjectList(res.data.subjectList);

				const refined = refineList(res.data.semesterList);

				// 전체 조회 옵션 추가
				const optionsWithAll = [{ value: 'ALL', label: '전체' }, ...refined];

				setCategoryOptions(optionsWithAll);

				// 최초 렌더링 시 전체 조회
				setCategory('ALL');
			} catch (e) {
				console.log('교수 - 내 강의 조회 실패! : ', e);
			}
		};
		loadProfessorSubjectList();
		searchProfessorSubject();
	}, []);

	// 년도, 학기 별 강의 검색
	const searchProfessorSubject = async () => {
		try {
			const res = await api.post('/professor/subject', null, {
				params: {
					period: category,
				},
			});
			setSubjectList(res.data.subjectList);
		} catch (e) {
			console.log('교수 - 내 강의 검색 실패 : ', e);
		}
	};

	const handleSubDetail = (subjectId) => {
		const url = `/professor/syllabus/${subjectId}`;
		window.open(url, '_blank', 'width=900,height=800,scrollbars=yes');
	};

	const handleStudentList = (subjectId, subName) => {
		setSubjectId(subjectId);
		setSubName(subName);
		setListOpen(true);
	};

	const headers = ['학수번호', '강의명', '강의시간', '강의계획서', '학생목록'];

	const subjectTable = useMemo(() => {
		return subjectList.map((s) => ({
			학수번호: s.id ?? '',
			강의명: s.name ?? '',
			강의시간: s.subDay + ' ' + toHHMM(s.startTime) + '-' + toHHMM(s.endTime) + ' (' + s.roomId + ')',
			강의계획서: (
				<button onClick={() => handleSubDetail(s.id)} className="syllabus-btn">
					강의계획서
				</button>
			),
			학생목록: (
				<button onClick={() => handleStudentList(s.id, s.name)} className="syllabus-btn">
					학생 목록
				</button>
			),
		}));
	}, [subjectList]);

	return (
		<div className="form-container">
			{subjectId && listOpen ? (
				<SubjectStudentList subjectId={subjectId} subName={subName} setListOpen={setListOpen} />
			) : (
				<div>
					<OptionForm
						name="category"
						label="학기 선택"
						value={category}
						onChange={(e) => setCategory(e.target.value)}
						options={categoryOptions}
					/>

					<button onClick={searchProfessorSubject} className="button">
						검색
					</button>

					<DataTable headers={headers} data={subjectTable} />
				</div>
			)}
		</div>
	);
}
