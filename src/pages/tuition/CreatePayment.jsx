import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../../api/httpClient';
import '../../assets/css/CreatePayment.css';

export default function CreatePayment() {
	// 관리자 - 등록금 고지서 생성 페이지
	// 기존 tuition/bill(단순 페이지) , tuition/create (고지서 발송 기능)
	const { user, userRole } = useContext(UserContext);
	const navigate = useNavigate();

	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		// 권한 확인 (관리자)
		if (user === null) return;
		if (userRole !== 'staff') {
			navigate(-1, { replace: true });
			return;
		}
	}, [user, userRole, navigate]);

	//const submitTuition = async () => {
	//	try {
	//		const res = await api.get('/tuition/create');
	//		alert(res.data.insertCount + '개의 고지서가 생성되었습니다!');
	//	} catch (e) {
	//		console.error('등록금 고지서 생성 실패' + e);
	//	}
	// };

	const submitTuition = async () => {
		if (submitting) return;

		try {
			setSubmitting(true);
			const res = await api.get('/tuition/create');
			alert(res.data.insertCount + '개의 고지서가 생성되었습니다!');
		} catch (e) {
			console.error('등록금 고지서 생성 실패' + e);
			alert('고지서 생성에 실패했습니다.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="payment-container">
			<h2 className="payment-title">등록금 고지서 발송</h2>

			<p className="payment-desc">
				해당 기능은 <b>교직원(Staff)</b>만 사용할 수 있습니다. <br />
				버튼 클릭 시 대상 학생들의 등록금 고지서가 생성됩니다.
			</p>

			<div className="payment-action-card">
				<div className="payment-status">
					현재 상태: <span className="payment-highlight">발송 준비</span>
				</div>

				<button className="payment-btn" onClick={submitTuition} disabled={submitting}>
					{submitting ? '생성 중...' : '등록금 고지서 발송'}
				</button>

				<div className="payment-footnote">※ 작업이 완료될 때까지 잠시만 기다려주세요.</div>
			</div>
		</div>
	);
}
