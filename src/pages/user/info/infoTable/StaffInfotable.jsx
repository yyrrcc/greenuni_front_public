import UserInfoTable from './UserInfoTable';
import '../../../../assets/css/MyPage.css';

export default function StaffInfoTable({ userInfo }) {
	return (
		<section className="mypage-card mypage-card--staff">
			<header className="mypage-card__header">
				<h2 className="mypage-card__title">직원 정보</h2>
			</header>

			<div className="mypage-card__body">
				<div className="mypage-table">
					<table className="mypage-table__table">
						<tbody>
							<tr>
								<th className="mypage-table__th">ID</th>
								<td className="mypage-table__td">{userInfo?.id}</td>
								<th className="mypage-table__th">입사 날짜</th>
								<td className="mypage-table__td">{userInfo?.hireDate}</td>
							</tr>
						</tbody>
					</table>
				</div>

				<UserInfoTable userInfo={userInfo} />
			</div>
		</section>
	);
}

