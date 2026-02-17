import DataTable from '../../../../components/table/DataTable';
import UserInfoTable from './UserInfoTable';
import '../../../../assets/css/MyPage.css';


export default function StudentInfoTable({ userInfo, stustatList }) {
	const header2 = ['변동 일자', '변동 구분', '세부', '승인 여부', '복학 예정 연도', '복학 예정 학기'];

	return (
		<section className="mypage-card mypage-card--student">
			<header className="mypage-card__header">
				<h2 className="mypage-card__title">학생 정보</h2>
			</header>

			<div className="mypage-card__body">
				<div className="mypage-table">
					<table className="mypage-table__table">
						<tbody>
							<tr>
								<th className="mypage-table__th">학번</th>
								<td className="mypage-table__td">{userInfo?.id}</td>
								<th className="mypage-table__th">소속</th>
								<td className="mypage-table__td">
									<span className="mypage-chip">{userInfo?.deptName}</span>
								</td>
							</tr>

							<tr>
								<th className="mypage-table__th">학년</th>
								<td className="mypage-table__td">{userInfo?.grade}</td>
								<th className="mypage-table__th">학기</th>
								<td className="mypage-table__td">{userInfo?.semester}</td>
							</tr>

							<tr>
								<th className="mypage-table__th">입학일</th>
								<td className="mypage-table__td">{userInfo?.entranceDate}</td>
								<th className="mypage-table__th">졸업일(졸업예정일)</th>
								<td className="mypage-table__td">{userInfo?.graduationDate}</td>
							</tr>
						</tbody>
					</table>
				</div>

				<UserInfoTable userInfo={userInfo} />

				{stustatList?.length > 0 && (
					<div className="mypage-section">
						<div className="mypage-section__head">
							<h3 className="mypage-section__title">학적 변동 내역</h3>
							<span className="mypage-badge">{stustatList.length}</span>
						</div>
						<div className="mypage-section__body">
							<DataTable headers={header2} data={stustatList} />
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
