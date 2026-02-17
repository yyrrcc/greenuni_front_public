import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/httpClient';
import { UserContext } from '../../context/UserContext';
import NoticeForm from '../board/NoticeForm';
import { useMutation } from '@tanstack/react-query';

export default function NoticeWrite() {
	const navigate = useNavigate();
	const { userRole } = useContext(UserContext);

	// 등록 로직을 Mutation으로 정의
	const createNoticeMutation = useMutation({
		mutationFn: (formData) => api.post('/notice/write', formData),
		onSuccess: () => {
			alert('공지 등록 완료!');
			navigate('/notice');
		},
		onError: (error) => {
			console.error('등록 실패:', error);
			alert('공지 등록 실패');
		},
	});

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

	const handleCreate = async ({ category, title, content, file /*, removeFile */ }) => {
		const formData = new FormData();
		formData.append('category', category);
		formData.append('title', title);
		formData.append('content', content);
		if (file) formData.append('file', file);
		createNoticeMutation.mutate(formData);
	};

	return (
		<div className="form-container">
			<h3>공지 등록</h3>
			<div className="split--div"></div>

			<NoticeForm
				initialValues={{ category: '[일반]', title: '', content: '' }}
				onSubmit={handleCreate}
				onCancel={() => navigate('/notice')}
				submitLabel={createNoticeMutation.isPending ? '등록 중...' : '등록'} // 로딩 상태 활용
				enableFile={true}
			/>
		</div>
	);
}
