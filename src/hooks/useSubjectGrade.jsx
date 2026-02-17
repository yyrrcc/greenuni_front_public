import { useState, useEffect } from 'react';
import api from '../api/httpClient';

export default function useSubjectGrade(subjectId) {
	const [state, setState] = useState({
		studentList: [],
		stuNum: 0,
		subNumOfStudent: 0,
		relative: false,
		aiStatus: 'IDLE', // IDLE | RUNNING | SUCCESS | FAIL
		aiMessage: '',
		loading: false,
	});

	// 초기 데이터 로드 (AI 상태 + 학생 리스트 한번에)
	const loadData = async () => {
		try {
			// 병렬 요청으로 속도 개선
			const [statusRes, listRes] = await Promise.all([
				api.get(`/professor/subjects/${subjectId}/ai-status`),
				api.get(`/professor/subject/${subjectId}`),
			]);

			const hasGrade = listRes.data.studentList.some((s) => s.letterGrade);

			setState({
				studentList: listRes.data.studentList,
				stuNum: listRes.data.stuNum,
				subNumOfStudent: listRes.data.subject.numOfStudent,
				relative: hasGrade,
				aiStatus: statusRes.data.status,
				aiMessage: statusRes.data.message ?? '',
				loading: false,
			});
		} catch (e) {
			console.error('데이터 로드 실패:', e);
		}
	};
	useEffect(() => {
		loadData();
	}, [subjectId]);

	// AI 폴링 (RUNNING일 때만, FAIL 되면 멈춤)
	useEffect(() => {
		if (state.aiStatus !== 'RUNNING') return;

		const intervalId = setInterval(async () => {
			try {
				const res = await api.get(`/professor/subjects/${subjectId}/ai-status`);
				const { status, message } = res.data;

				if (status !== 'RUNNING') {
					setState((prev) => ({
						...prev,
						aiStatus: status,
						aiMessage: message ?? '',
					}));
				}
			} catch (e) {
				console.warn('AI 상태 조회 실패:', e?.message);
			}
		}, 3000);

		return () => clearInterval(intervalId);
	}, [state.aiStatus, subjectId]);

	// 등급 산출
	const calculateGrade = async () => {
		if (!window.confirm('전체 학생 등급을 산출할까요?')) return;
		try {
			await api.patch(`/professor/relativeGrade/${subjectId}`);
			setState((prev) => ({ ...prev, relative: true }));
			alert('등급 산출 완료!');
		} catch (e) {
			alert(e.response?.data?.message ?? '등급 산출 실패');
		}
	};

	// 성적 확정
	const finalizeGrade = async () => {
		if (!window.confirm('최종 성적을 확정할까요?')) return;

		setState((prev) => ({ ...prev, loading: true }));
		try {
			await api.post(`/professor/subjects/${subjectId}/finalize`);
			setState((prev) => ({
				...prev,
				aiStatus: 'RUNNING',
				aiMessage: 'AI 분석중...',
			}));
		} catch (e) {
			setState((prev) => ({
				...prev,
				aiStatus: 'FAIL',
				aiMessage: e.response?.data?.message ?? '확정 실패',
			}));
		} finally {
			setState((prev) => ({ ...prev, loading: false }));
		}
	};

	// ⭐ 외부에서 다시 불러올 때 쓸 함수
	const refetch = () => {
		loadData();
	};

	return { ...state, calculateGrade, finalizeGrade, refetch };
}
