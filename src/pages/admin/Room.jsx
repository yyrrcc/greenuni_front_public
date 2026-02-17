import { useEffect, useState } from 'react';
import api from '../../api/httpClient';
import InputForm from '../../components/form/InputForm';
import DataTable from '../../components/table/DataTable';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import '../../assets/css/AdminFormLayout.css';

export default function Room() {
	const queryClient = useQueryClient();

	// 어떤 강의실을 수정 중인지, null 이면 등록
	const [selectedRoomId, setSelectedRoomId] = useState(null);

	// 폼 상태 관리
	const [roomData, setRoomData] = useState({
		id: '', // 강의실 호수 (예: "101호")
		collegeId: '', // 단과대 ID
	});

	// 1. 강의실 목록 가져오기 (useEffect + useState 대체!)
	const { data: roomList = [] } = useQuery({
		queryKey: ['rooms'], // 이 데이터의 고유 이름표
		queryFn: async () => {
			const res = await api.get('/admin/room');
			return res.data.roomList.map((room) => ({
				id: room.id,
				강의실: room.id,
				단과대: room.college.name,
				단과대ID: room.college.id,
			}));
		},
	});

	/** 강의실 목록 가져오기
	const [roomList, setRoomList] = useState([]);
	useEffect(() => {
		const loadRoom = async () => {
			try {
				const res = await api.get('/admin/room');
				// console.log(res.data);
				const rawData = res.data.roomList;
				//console.log(rawData);
				const formattedData = rawData.map((room) => ({
					id: room.id,
					강의실: room.id,
					단과대: room.college.name,
					단과대아이디: room.college.id,
					원본데이터: room,
				}));

				setRoomList(formattedData);
			} catch (e) {
				console.error('강의실 목록 로드 실패:', e);
			}
		};
		loadRoom();
	}, []);
	*/

	// 2. 강의실 등록하기 (useMutation 사용)
	const createRoomMutation = useMutation({
		mutationFn: (newRoom) => api.post('/admin/room', newRoom),
		onSuccess: () => {
			alert('강의실 등록 완료!');
			setRoomData({ id: '', collegeId: '' });
			setSelectedRoomId(null);
			// ★ 여기가 핵심! 등록 성공하면 'rooms'란 이름표 가진 목록을 무효화시킴 -> 즉시 다시 가져옴
			queryClient.invalidateQueries({ queryKey: ['rooms'] });
		},
		onError: (err) => {
			console.error('등록 실패:', err);
			alert(err?.response?.data?.message);
		},
	});

	// 강의실 수정 (useMutation)
	const updateRoomMutation = useMutation({
		// roomId와 payload를 같이 받도록 설계
		mutationFn: ({ roomId, payload }) => api.patch(`/admin/room/${roomId}`, payload),
		onSuccess: () => {
			alert('강의실 수정 완료!');
			queryClient.invalidateQueries({ queryKey: ['rooms'] });
			setSelectedRoomId(null);
			setRoomData({ id: '', collegeId: '' });
		},
		onError: (err) => {
			console.error('수정 실패:', err);
			alert(err.response?.data?.message || '강의실 수정 실패');
		},
	});

	// 강의실 삭제 (useMutation)
	const deleteRoomMutation = useMutation({
		mutationFn: (roomId) => api.delete(`/admin/room/${roomId}`),
		onSuccess: () => {
			alert('강의실 삭제 완료!');
			queryClient.invalidateQueries({ queryKey: ['rooms'] });
		},
		onError: (err) => {
			console.error('삭제 실패:', err);
			alert(err.response?.data?.message || '강의실 삭제 실패');
		},
	});

	// 폼 변경
	const handleChange = (e) => {
		const { name, value } = e.target;
		setRoomData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// 등록 / 수정 공통 처리
	const handleSubmit = () => {
		if (!roomData.id.trim()) {
			alert('강의실 호수를 입력해주세요.');
			return;
		}
		if (!roomData.collegeId.trim()) {
			alert('단과대 ID를 입력해주세요.');
			return;
		}

		// 숫자로 캐스팅 (백엔드 collegeId: Long)
		const payload = {
			...roomData,
			collegeId: Number(roomData.collegeId),
		};

		if (!selectedRoomId) {
			// 등록
			createRoomMutation.mutate(payload);
		} else {
			// 수정
			updateRoomMutation.mutate({
				roomId: selectedRoomId,
				payload,
			});
		}
	};

	// 수정 모드 취소
	const handleCancelEdit = () => {
		setSelectedRoomId(null);
		setRoomData({ id: '', collegeId: '' });
	};

	// 행 "수정" 버튼
	const handleEditRow = (row) => {
		setSelectedRoomId(row.id);
		setRoomData({
			id: row.강의실, // PK는 수정하지 않고 그대로 보여주기만
			collegeId: String(row.단과대ID),
		});
	};

	// 행 "삭제" 버튼
	const handleDeleteRow = (row) => {
		if (!window.confirm(`'${row.강의실}' 강의실을 삭제하시겠습니까?`)) return;

		deleteRoomMutation.mutate(row.id);
	};

	// const handleSubmit = async () => {
	// 	createRoomMutation.mutate(roomData);
	// };

	/**
	const handleSubmit = async () => {
		try {
			const res = await api.post('/admin/room', roomData);
			console.log('강의실 등록 성공:', res.data);
			alert('강의실 등록 완료!');
		} catch (e) {
			console.error('강의실 등록 실패:', e);
		}
	};
	 */

	const isMutating = createRoomMutation.isPending || updateRoomMutation.isPending;

	const headers = ['강의실', '단과대', '단과대ID'];

	return (
		<div className="form-container">
			<h3>강의실 등록 / 수정</h3>

			<div className="entity-form entity-form-card room-form">
				<InputForm
					label="강의실 호수"
					name="id"
					value={roomData.id}
					onChange={handleChange}
					placeholder="예: E601"
					disabled={!!selectedRoomId}
				/>

				<InputForm
					label="단과대 ID"
					name="collegeId"
					value={roomData.collegeId}
					onChange={handleChange}
					placeholder="숫자 입력"
				/>

				<div className="button-row">
					<button onClick={handleSubmit} className="button" disabled={isMutating}>
						{isMutating ? '처리 중...' : selectedRoomId ? '강의실 수정' : '강의실 등록'}
					</button>

					{selectedRoomId && (
						<button type="button" className="button button-secondary" onClick={handleCancelEdit}>
							취소
						</button>
					)}
				</div>
			</div>

			<h3>강의실 목록</h3>
			<div>
				<DataTable
					headers={headers}
					data={roomList}
					renderActions={(row) => (
						<div>
							<button
								type="button"
								className="button button--sm button--outline button--outline-green"
								onClick={() => handleEditRow(row)}
							>
								수정
							</button>
							<button
								type="button"
								className="button button--sm button--outline button--outline-red"
								onClick={() => handleDeleteRow(row)}
							>
								삭제
							</button>
						</div>
					)}
				/>
			</div>
		</div>
	);
}
