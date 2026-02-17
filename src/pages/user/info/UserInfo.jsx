import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/httpClient';
import StudentInfoTable from './infoTable/StudentInfoTable';
import ProfessorInfoTable from './infoTable/ProfessorInfoTable';
import StaffInfoTable from './infoTable/StaffInfotable';
import UpdateUserInfo from './infoTable/UpdateUserInfo';
import '../../../assets/css/MyPage.css';

export default function UserInfo() {
	const { userRole, token } = useContext(UserContext);
	const [userInfo, setUserInfo] = useState({});
	const [stustatList, setStustatList] = useState([]); // 학생 학적 변동 목록
	const [isEdit, setIsEdit] = useState(false);

	const navigate = useNavigate();

	const formatStatList = (list) => {
		if (!list || list.length === 0) return [];
		return list.map((stat) => ({
			id: stat.id || Math.random(), // key prop을 위한 고유값 필요 ..
			'변동 일자': stat.fromDate,
			'변동 구분': stat.status,
			세부: stat.detail,
			'승인 여부': stat.adopt,
			'복학 예정 연도': stat.toYear,
			'복학 예정 학기': stat.toSemester,
			원본데이터: stat,
		}));
	};

	useEffect(() => {
		console.log('토큰' + token);

		if (!token) {
			alert('권한이 없는 페이지입니다. 로그인 해 주세요');
			navigate('/', { replace: true });
			return;
		}

		const loadInfo = async () => {
			try {
				// 권한에 따라 다른 api 호출
				if (userRole === 'student') {
					// 학생
					const res = await api.get('/personal/info/student');
					console.log('학생info: ', res.data);
					setUserInfo(res.data.student);
					setStustatList(formatStatList(res.data.stuStat));
				} else if (userRole === 'staff') {
					// 직원
					const res = await api.get('/personal/info/staff');
					setUserInfo(res.data.staff);
				} else {
					// 교수
					const res = await api.get('/personal/info/professor');
					setUserInfo(res.data.professor);
				}
			} catch (e) {
				console.error('정보 조회 실패' + e);
				setUserInfo({});
				setStustatList([]);
			}
		};
		loadInfo();
	}, [userRole, token, navigate, isEdit]);

	return (
		<div className="mypage-shell">
			{!isEdit && (
				<div className="mypage-titlebar">
  					<h1 className="mypage-titlebar__title">내 정보 조회</h1>
					{userRole === 'student' && <StudentInfoTable userInfo={userInfo} stustatList={stustatList} />}
					{userRole === 'professor' && <ProfessorInfoTable userInfo={userInfo} />}
					{userRole === 'staff' && <StaffInfoTable userInfo={userInfo} />}

					 <div className="mypage-footerbar">
					  <button className="mypage-btn mypage-btn--primary" onClick={() => setIsEdit(true)}>
						정보 수정하기
					</button>
					</div>
				</div>
			)}
			{isEdit && <UpdateUserInfo userInfo={userInfo} setIsEdit={setIsEdit} />}
		</div>
	);
}
