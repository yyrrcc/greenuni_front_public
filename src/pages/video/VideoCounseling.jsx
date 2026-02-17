import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import api from '../../api/httpClient';
import '../../assets/css/VideoCounseling.css';
import EndTime from './EndTime';

export default function VideoCounseling() {
	const { user, name, userRole } = useContext(UserContext);
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();

	// 메모/상담 식별용 코드 (DB roomCode)
	const code = searchParams.get('code') || '';

	// iframe에 한번만 넘길 code -> 없으면 입력코드 두번받음
	const codeSeedRef = useRef(code);

	// 레거시에서 postMessage로 들어오는 코드도 반영
	const [roomCode, setRoomCode] = useState(code);

	useEffect(() => {
		setRoomCode(code);
	}, [code]);

	// 레거시(iframe)에서 "입장" 완료되면 부모로 code 보내기 → 여기서 수신
	useEffect(() => {
		const onMessage = (event) => {
			// same-origin만 허용(로컬/배포 모두 안전)
			if (event.origin !== window.location.origin) return;

			const data = event.data;
			if (!data || data.type !== 'COUNSEL_ROOMCODE') return;

			const next = (data.roomCode || '').toString().trim();
			if (!next) return;

			// state 반영
			setRoomCode(next);

			// URL에도 반영(새로고침/공유 가능)
			setSearchParams({ code: next }, { replace: true });
		};

		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, [setSearchParams]);

	const displayName = useMemo(() => {
		return name || user?.name || '';
	}, [user, name]);

	//  iframe에는 display + (있으면) code만 넘김
	// - Janus join(room=1234)은 레거시 JS에서 고정 처리할 거라 React가 관여 X
	const iframeSrc = useMemo(() => {
		const params = new URLSearchParams();
		params.set('display', displayName);

		// roomCode(state) 말고 seed만 사용 (postMessage로 roomCode 바뀌어도 iframe src 안 바뀜)
		if (codeSeedRef.current) params.set('code', codeSeedRef.current);

		return `/legacy-videoroom/videoroomtest.html?${params.toString()}`;
	}, [displayName]);

	// ============================================================
	// 공유 메모
	const [loading, setLoading] = useState(false);

	// 서버에 저장된 메모(교수/학생)
	const [professorNote, setProfessorNote] = useState('');
	const [studentNote, setStudentNote] = useState('');

	// 내가 지금 편집 중인 임시 메모는 서버 갱신으로 덮지 않기
	const [myDraft, setMyDraft] = useState('');
	const isEditingRef = useRef(false);

	// 내가 편집할 메모(내 역할)
	const myRole = (userRole || '').toLowerCase(); // 'professor' | 'student'
	const otherRole = myRole === 'professor' ? 'student' : 'professor';

	// 내/상대 메모 계산(표시용)
	const otherServerNote = myRole === 'professor' ? studentNote : professorNote;

	useEffect(() => {
		if (!roomCode) return;

		// 최초 1회 로드
		loadNotes(true);

		// 10초마다 자동 새로고침(폴링)
		const t = setInterval(() => {
			loadNotes(false);
		}, 10000);

		return () => clearInterval(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [roomCode, myRole]);

	const loadNotes = async (isFirstLoad) => {
		try {
			setLoading(true);

			// 컨트롤러가 roomCode로 받으니까 params 이름도 roomCode로
			const res = await api.get(`/counsel/note`, { params: { roomCode } });

			const p = res.data?.professorNote ?? '';
			const s = res.data?.studentNote ?? '';

			setProfessorNote(p);
			setStudentNote(s);

			if (isFirstLoad) {
				setMyDraft(myRole === 'professor' ? p : s);
			} else {
				if (!isEditingRef.current) {
					setMyDraft(myRole === 'professor' ? p : s);
				}
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const saveMyNote = async () => {
		if (!roomCode) return;

		try {
			await api.post(`/counsel/note`, { content: myDraft }, { params: { roomCode } });
			await loadNotes(true);
			alert('메모 저장 완료!');
		} catch (e) {
			console.error(e);
			alert('메모 저장 실패');
		}
	};

	const handleEndCounsel = async () => {
		if (!roomCode) return;
		if (!window.confirm('상담을 종료하시겠습니까?')) return;
		setLoading(true);
		try {
			await api.get('/risk/counseling/done', { params: { roomCode } });
			alert('상담이 종료되었습니다.');
			navigate('/counseling/manage', { replace: true });
		} catch (e) {
			console.error(e.response?.data?.message || '서버 오류');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="video-counsel-page">
			<div className="video-counsel-head">
				<div>
					<div className="video-counsel-title">그린 대학교 화상 상담 서비스</div>
					<div className="video-counsel-sub">교수 · 학생 화상상담</div>
				</div>

				{roomCode && (
					<div>
						<EndTime roomCode={roomCode} />
					</div>
				)}

				{userRole === 'professor' && (
					<button className="video-counsel-open" onClick={handleEndCounsel}>
						상담 종료
					</button>
				)}
			</div>

			<div className="video-counsel-layout">
				<div className="video-counsel-frameWrap">
					<iframe
						src={iframeSrc}
						title="그린 화상 상담실"
						className="video-counsel-iframe"
						allow="camera; microphone; autoplay; fullscreen"
					/>
				</div>

				<aside className="counsel-note-panel">
					<div className="panel-head">
						<div className="panel-title">상담 메모</div>
						<div className="panel-sub">
							{loading
								? '불러오는 중...'
								: roomCode
								? `상담 코드: ${roomCode}`
								: '상담 코드 입력 후 입장하면 메모가 활성화됩니다.'}
						</div>
					</div>

					<div className="panel-body">
						<div className="note-card">
							<div className="note-card-head">
								<div className="note-card-title">내 메모 ({myRole || 'role 없음'})</div>
								<button className="note-btn" onClick={saveMyNote} disabled={!roomCode}>
									저장
								</button>
							</div>

							<textarea
								className="note-textarea"
								value={myDraft}
								onChange={(e) => setMyDraft(e.target.value)}
								onFocus={() => {
									isEditingRef.current = true;
								}}
								onBlur={() => {
									isEditingRef.current = false;
								}}
								placeholder="상담 중 핵심 내용을 적어두세요. (저장 버튼으로 저장)"
								disabled={!roomCode}
							/>
						</div>

						<div className="note-card">
							<div className="note-card-head">
								<div className="note-card-title">상대 메모 ({otherRole})</div>
								<button className="note-btn ghost" onClick={() => loadNotes(false)} disabled={!roomCode}>
									새로고침
								</button>
							</div>

							<textarea
								className="note-textarea readOnly"
								value={otherServerNote}
								readOnly
								placeholder="상대가 저장한 메모가 여기에 표시됩니다."
							/>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
