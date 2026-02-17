import { useParams } from 'react-router-dom';
import api from '../../api/httpClient';
import { useEffect, useState } from 'react';
import ReadSyllabus from './ReadSyllabus';
import UpdateSyllabus from './UpdateSyllabus';

export default function ReadSyllabusPopup() {
	const { subjectId } = useParams();
	const [syllabus, setSyllabus] = useState({});
	const [isEdit, setIsEdit] = useState(false);

	// 강의 계획서 불러오기
	useEffect(() => {
		const loadSyllabus = async () => {
			try {
				const res = await api.get(`/professor/syllabus/${subjectId}`);
				console.log(res.data.syllabus);
				setSyllabus(res.data.syllabus);
			} catch (e) {
				console.log('강의계획서 조회 실패 : ', e);
			}
		};
		loadSyllabus();
	}, [isEdit]);

	return (
		<div>
			{isEdit ? (
				<UpdateSyllabus syllabus={syllabus} setIsEdit={setIsEdit} />
			) : (
				<ReadSyllabus syllabus={syllabus} setIsEdit={setIsEdit} />
			)}
		</div>
	);
}
