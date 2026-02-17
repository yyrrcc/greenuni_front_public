import { useEffect, useRef, useState } from 'react';
import InputForm from '../../components/form/InputForm';
import TextField from '../../components/form/TextField';
import OptionForm from '../../components/form/OptionForm';
import '../../assets/css/NoticeForm.css';

const NOTICE_CATEGORY_OPTIONS = [
	{ value: '[일반]', label: '일반' },
	{ value: '[학사]', label: '학사' },
	{ value: '[장학]', label: '장학' },
];

// 공통 공지폼
const NoticeForm = ({
	initialValues = { category: '[일반]', title: '', content: '' },
	onSubmit,
	onCancel,
	submitLabel = '저장',
	enableFile = true,
	currentFileName = '',
}) => {
	const [category, setCategory] = useState('[일반]');
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [file, setFile] = useState(null);

	// 기존 첨부파일 삭제
	const [removeFile, setRemoveFile] = useState(false);

	// 파일 선택 취소를 위해 ref 사용
	const fileInputRef = useRef(null);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setCategory(initialValues.category ?? '[일반]');
		setTitle(initialValues.title ?? '');
		setContent(initialValues.content ?? '');

		// 수정 화면에서 초기값이 바뀌면 삭제 플래그/선택 파일 초기화
		setRemoveFile(false);
		setFile(null);
		if (fileInputRef.current) fileInputRef.current.value = '';
	}, [initialValues?.category, initialValues?.title, initialValues?.content]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!onSubmit) return;

		await onSubmit({ category, title, content, file, removeFile });
	};

	// 새 파일 선택 취소
	const handleClearSelectedFile = () => {
		setFile(null);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	// 기존 첨부파일 삭제(수정 화면)
	const handleRemoveCurrentFile = () => {
		// 기존 파일 삭제를 누르면
		// removeFile=true 로 서버에 알림
		// 혹시 선택된 새 파일이 있으면 같이 초기화(혼선 방지)
		setRemoveFile(true);
		handleClearSelectedFile();
	};

	return (
		<form onSubmit={handleSubmit} className="write--div">
			<div className="title--container">
				<div className="category">
					<OptionForm
						name="category"
						label="카테고리"
						value={category}
						onChange={(e) => setCategory(e.target.value)}
						options={NOTICE_CATEGORY_OPTIONS}
					/>
				</div>

				<div className="title">
					<InputForm
						label="제목"
						name="title"
						placeholder="제목을 입력하세요"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</div>
			</div>

			<div className="content--container">
				<TextField
					label="내용"
					name="content"
					cols="100"
					rows="20"
					placeholder="내용을 입력하세요"
					value={content}
					onChange={(e) => setContent(e.target.value)}
				/>
			</div>

			{enableFile && (
				<div className="custom-file">
					<input
						ref={fileInputRef}
						type="file"
						className="custom-file-input"
						name="file"
						onChange={(e) => {
							const f = e.target.files?.[0] || null;
							setFile(f);

							// 새 파일을 선택하면 기존 파일 삭제 플래그는 해제(교체로 간주)
							if (f) setRemoveFile(false);
						}}
					/>

					{/* 파일선택 취소 버튼 (선택한 새 파일만 취소) */}
					{file && (
						<div style={{ marginTop: 8 }}>
							<div className="notice-current-file">선택된 파일: {file.name}</div>
							<button type="button" className="button" onClick={handleClearSelectedFile}>
								선택 취소
							</button>
						</div>
					)}

					{/* 파일선택 아래쪽 현재 첨부파일 표시 */}
					{currentFileName && (
						<div style={{ marginTop: 10 }}>
							<div className="notice-current-file">
								현재 첨부파일: {currentFileName}
								{removeFile && <span style={{ marginLeft: 8 }}>(삭제 예정)</span>}
							</div>

							{/* 기존 첨부파일 삭제 버튼 */}
							<button type="button" className="button" onClick={handleRemoveCurrentFile}>
								첨부파일 삭제
							</button>
						</div>
					)}
				</div>
			)}

			<div>
				<button type="button" className="button" onClick={onCancel}>
					목록
				</button>
				<button type="submit" className="button">
					{submitLabel}
				</button>
			</div>
		</form>
	);
};

export default NoticeForm;
