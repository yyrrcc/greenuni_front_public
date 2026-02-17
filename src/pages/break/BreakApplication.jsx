import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/httpClient';

import DataTable from '../../components/table/DataTable';
import OptionForm from '../../components/form/OptionForm';
import '../../assets/css/BreakApplication.css';

export default function BreakApplication() {
	const navigate = useNavigate();

	const [student, setStudent] = useState(null);
	const [deptName, setDeptName] = useState('');
	const [collName, setCollName] = useState('');

	// 서버에서 내려주는 값 쓰니까 초기값은 0으로 둬도됨
	const [currentYear, setCurrentYear] = useState(0);
	const [currentSemester, setCurrentSemester] = useState(0);

	//종료(복학) 시점
	const [toYear, setToYear] = useState('');
	const [toSemester, setToSemester] = useState('');

	const [type, setType] = useState('일반');
	const [loading, setLoading] = useState(true);

	// 오늘 날짜 문자열
	const todayStr = useMemo(() => {
		const today = new Date();
		return `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(
			today.getDate()
		).padStart(2, '0')}일`;
	}, []);

	// 신청 화면 데이터 불러오기
	useEffect(() => {
		const loadApplicationData = async () => {
			try {
					const res = await api.get('/break/application');
				console.log('확인', res.data);

				const data = res.data ?? {};
				const serverYear = data.currentYear ?? new Date().getFullYear();
			const serverSemester = data.currentSemester ?? 1;	

				setStudent(data.student ?? null);
				setDeptName(data.deptName ?? '');
				setCollName(data.collName ?? '');

				setCurrentYear(serverYear);
				setCurrentSemester(serverSemester);

				// 종료년도 기본값은 시작년도(서버 기준)로 맞추기
				setToYear(String(serverYear + 1));
				setToSemester(String(serverSemester));
			} catch (e) {
				console.error(e);
				alert(e.response?.data?.message ?? '휴학 신청 정보를 불러오지 못했습니다.');
				navigate(-1, { replace: true });
			} finally {
				setLoading(false);
			}
		};

		loadApplicationData();
	}, [navigate]);

	// ---- DataTable 상단 요약 ----
	const infoHeaders = useMemo(() => ['항목', '내용'], []);
	const infoData = useMemo(() => {
		if (!student) return [];
		return [
			{ 항목: '단과대', 내용: collName },
			{ 항목: '학과', 내용: deptName },
			{ 항목: '학번', 내용: student.id },
			{ 항목: '학년', 내용: `${student.grade}학년` },
			{ 항목: '성명', 내용: student.name },
			{ 항목: '전화번호', 내용: student.tel },
			{ 항목: '주소', 내용: student.address },
		];
	}, [student, collName, deptName]);

	// ---- 기간 옵션 ----
	const yearOptions = useMemo(() => [currentYear, currentYear + 1, currentYear + 2], [currentYear]);
	const yearSelectOptions = useMemo(() => yearOptions.map((y) => ({ value: String(y), label: `${y}` })), [yearOptions]);

	const semesterSelectOptions = useMemo(
		() => [
			{ value: '1', label: '1' },
			{ value: '2', label: '2' },
		],
		[]
	);

	// ---- 휴학구분 옵션(라디오 map) ----
	const breakTypeOptions = useMemo(
		() => [
			{ value: '일반', label: '일반휴학' },
			{ value: '임신·출산·육아', label: '임신·출산·육아휴학' },
			{ value: '질병', label: '질병휴학' },
			{ value: '창업', label: '창업휴학' },
			{ value: '군입대', label: '군입대휴학' },
		],
		[]
	);

	// 휴학 신청
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!window.confirm('휴학을 신청하시겠습니까?')) return;

		try {
			await api.post('/break/application', {
				fromYear: currentYear,
				fromSemester: currentSemester,
				type,
				toYear: Number(toYear),
				toSemester: Number(toSemester),
				studentGrade: student.grade,
			});

			alert('휴학 신청이 정상적으로 처리되었습니다.');
			navigate('/break/list');
		} catch (e) {
			console.error(e);
			alert(e.response?.data?.message ?? '휴학 신청 처리 중 오류가 발생했습니다.');
		}
	};

	if (loading) return <p>불러오는중 ...</p>;
	if (!student) return <p>학생 정보를 불러오지 못했습니다.</p>;

	return (
		<div className="form-container">
			<h3>휴학 신청</h3>
			<div className="split--div"></div>

			<div className="d-flex flex-column align-items-center">
				<form onSubmit={handleSubmit} className="d-flex flex-column align-items-center" style={{ width: '100%' }}>
					<div className="document--layout">
						<h3>휴학 신청서</h3>

						<DataTable headers={infoHeaders} data={infoData} />

						{/* TODO: 오늘 기준(2025년 2학기)으로 2025년 2학기까지 휴학 신청이 가능한 걸 바꿔야 함 */}
						<table border="1">
							<tbody>
								<tr>
									<th>기 간</th>
									<td>
										<div>
											<span>
												{currentYear}년도 {currentSemester}학기부터
											</span>

											<OptionForm
												label=""
												name="toYear"
												value={toYear}
												onChange={(e) => setToYear(e.target.value)}
												options={yearSelectOptions}
												className="input--box"
											/>
											<span>년도</span>

											<OptionForm
												label=""
												name="toSemester"
												value={toSemester}
												onChange={(e) => setToSemester(e.target.value)}
												options={semesterSelectOptions}
												className="input--box"
											/>
											<span>학기까지</span>
										</div>
									</td>
								</tr>

								<tr>
									<th>휴 학 구 분</th>
									<td>
										<div>
											{breakTypeOptions.map((opt) => {
												const id = `break-type-${opt.value}`;
												return (
													<div key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
														<input
															type="radio"
															name="type"
															id={id}
															value={opt.value}
															checked={type === opt.value}
															onChange={(e) => setType(e.target.value)}
														/>
														<label htmlFor={id} style={{ margin: 0 }}>
															{opt.label}
														</label>
													</div>
												);
											})}
										</div>
									</td>
								</tr>

								<tr>
									<td colSpan={2}>
										<p>위와 같이 휴학하고자 하오니 허가하여 주시기 바랍니다.</p>
										<br />
										<p>{todayStr}</p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div className="schedule-list-actions">
						<button type="submit" className="btn btn-dark">
							신청하기
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
