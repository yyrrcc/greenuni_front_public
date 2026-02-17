import { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/httpClient';
import { UserContext } from '../../context/UserContext';
import '../../assets/css/NoticeDetail.css';

const NoticeDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { userRole } = useContext(UserContext);

	const [notice, setNotice] = useState(null);

	const loadNotice = async () => {
		try {
			const res = await api.get(`/notice/read/${id}`);
			setNotice(res.data.notice);
		} catch (e) {
			console.error('공지 상세 로드 실패:', e);
			alert(e.response.data.message);
		}
	};

	useEffect(() => {
		loadNotice();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const handleDelete = async () => {
		if (!window.confirm('정말 삭제할까요?')) return;
		try {
			await api.delete(`/notice/delete/${id}`);
			alert('삭제 완료');
			navigate('/notice');
		} catch (e) {
			console.error('공지 삭제 실패:', e);
			alert(e.reponse.data.message);
		}
	};

	const handleDownload = async () => {
		try {
			const res = await api.get(`/notice/file/download/${id}`, {
				responseType: 'blob',
				//blob : 이 응답은 파일이니까 파일로 받으라고 axios에게 알려주는 옵션
			});

			//여기서 blob 메모리 안에 존재하는 파일 덩어리
			const blob = new Blob([res.data]);
			const url = window.URL.createObjectURL(blob); // blob: 으로 시작하는 임시 URL을 하나 만들어 줌

			const a = document.createElement('a'); // 다운로드를 걸기 위한 가짜 <a> 태그
			a.href = url; //만든 blob URL을 링크로 설정
			a.download = notice.file?.originFilename || 'download';
			document.body.appendChild(a); // DOM에 잠깐 붙여 a.click() 을 호출 -> 강제로 클릭 이벤트를 발생
			a.click();
			a.remove(); // 끝나면 DOM에서 제거 (화면에 남기지 않음)

			window.URL.revokeObjectURL(url); // 메모리 정리 (url 해제)
		} catch (e) {
			console.error('다운로드 실패:', e);

			alert('다운로드 실패');
		}
	};

	if (!notice) return <div className="form-container">로딩중...</div>;

	const fileName = notice?.file?.originFilename || '';

	return (
		<div className="form-container notice-detail">
			<h3>공지 상세</h3>
			<div className="split--div"></div>

			<table className="table">
				<tbody>
					<tr className="title">
						<td className="type">제목</td>
						<td>
							{notice.category} {notice.title}
						</td>
					</tr>
					<tr>
						<td className="type">작성일</td>
						<td>{notice.createdTimeFormatted || ''}</td>
					</tr>
					<tr>
						<td className="type">조회수</td>
						<td>{notice.views ?? 0}</td>
					</tr>
					<tr>
						<td className="type">첨부파일</td>
						<td>
							{notice?.hasFile ? (
								<>
									<span>{notice.file?.originFilename}</span>
									<button className="button" type="button" onClick={handleDownload}>
										다운로드
									</button>
								</>
							) : (
								<span>첨부파일 없음</span>
							)}
						</td>
					</tr>

					<tr className="content--container">
						<td className="type">내용</td>
						<td>
							{/* 백엔드에서 \r\n -> <br> 변환했으므로 그대로 렌더 */}
							<div
								dangerouslySetInnerHTML={{
									__html: notice.content || '',
								}}
							/>
						</td>
					</tr>
				</tbody>
			</table>

			<div className="select--button">
				<button className="button" onClick={() => navigate('/notice')}>
					목록
				</button>

				{userRole === 'staff' && (
					<>
						<button className="button" onClick={() => navigate(`/notice/update/${id}`)}>
							수정
						</button>
						<button className="button" onClick={handleDelete}>
							삭제
						</button>
					</>
				)}
			</div>
		</div>
	);
};

export default NoticeDetail;
