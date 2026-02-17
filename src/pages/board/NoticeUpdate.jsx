import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/httpClient';
import { UserContext } from '../../context/UserContext';
import NoticeForm from '../board/NoticeForm';

const NoticeUpdate = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { userRole } = useContext(UserContext);

	const [initialValues, setInitialValues] = useState({
		category: '[일반]',
		title: '',
		content: '',
	});

	// 수정시 첨부파일명 표시용 state 추가
	const [currentFileName, setCurrentFileName] = useState('');

	const loadNotice = async () => {
		try {
			const res = await api.get(`/notice/read/${id}`);
			const n = res.data?.notice;

			setInitialValues({
				category: n?.category ?? '[일반]',
				title: n?.title ?? '',
				// read에서 <br> 변환되어 올 수 있어서 줄바꿈 복원
				content: String(n?.content ?? '').replaceAll('<br>', '\n'),
			});

			// 기존 첨부파일명 세팅
			setCurrentFileName(n?.file?.originFilename ?? '');
		} catch (e) {
			console.error('공지 수정 데이터 로드 실패:', e);
			alert(e?.response?.data?.message ?? '공지 데이터를 불러오지 못했습니다.');
		}
	};

	useEffect(() => {
		if (userRole !== 'staff') return; // 권한 없으면 로드 안 함
		loadNotice();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, userRole]);

	// 파일첨부
	const handleUpdate = async ({ category, title, content, file, removeFile }) => {
		try {
			const formData = new FormData();
			formData.append('category', category);
			formData.append('title', title);
			formData.append('content', content);

			// 기존 첨부파일 삭제 요청
			// removeFile === true :  서버에서 삭제
			if (removeFile === true) formData.append('removeFile', 'true');

			// 새 파일 있으면 같이 전송
			if (file) formData.append('file', file);

			await api.patch(`/notice/update/${id}`, formData);
			// Content-Type은 axios가 multipart로 자동 세팅

			alert('공지 수정 완료!');
			navigate(`/notice/read/${id}`);
		} catch (e) {
			console.error('공지 수정 실패:', e);
			alert(e?.response?.data?.message ?? '공지 수정 실패');
		}
	};

	if (userRole !== 'staff') {
		return (
			<div className="form-container">
				권한이 없습니다.
				<button className="button" onClick={() => navigate(-1)}>
					뒤로
				</button>
			</div>
		);
	}

	return (
		<div className="form-container">
			<h3>공지 수정</h3>
			<div className="split--div"></div>

			<NoticeForm
				initialValues={initialValues}
				onSubmit={handleUpdate}
				onCancel={() => navigate(-1)}
				submitLabel="수정"
				enableFile={true}
				// 현재 첨부파일명 전달
				currentFileName={currentFileName}
			/>
		</div>
	);
};

export default NoticeUpdate;
