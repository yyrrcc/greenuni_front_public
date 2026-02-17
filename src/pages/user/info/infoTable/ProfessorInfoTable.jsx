import UserInfoTable from './UserInfoTable';
import '../../../../assets/css/MyPage.css';

export default function ProfessorInfoTable({ userInfo }) {
	return (
		<section className="mypage-card mypage-card--professor">
			<header className="mypage-card__header">
				<h2 className="mypage-card__title">교수 정보</h2>
			</header>

			<div className="mypage-card__body">
				<div className="mypage-table">
					<table className="mypage-table__table">
						<tbody>
							<tr>
								<th className="mypage-table__th">ID</th>
								<td className="mypage-table__td">{userInfo?.id}</td>
								<th className="mypage-table__th">소속</th>
								<td className="mypage-table__td">
									<span className="mypage-chip">{userInfo?.collegeName}</span>
									<span className="mypage-chip">{userInfo?.deptName}</span>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<UserInfoTable userInfo={userInfo} />
			</div>
		</section>
	);
}
