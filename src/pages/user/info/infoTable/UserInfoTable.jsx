import '../../../../assets/css/MyPage.css';

export default function UserInfoTable({ userInfo }) {
	// 내 정보 조회 - 공통 목록만 빼둔 컴포넌트
return (
		<div className="mypage-section">
			<div className="mypage-section__head">
				<h3 className="mypage-section__title">기본 정보</h3>
			</div>

			<div className="mypage-table mypage-table--compact">
				<table className="mypage-table__table">
					<tbody>
						<tr>
							<th className="mypage-table__th">성명</th>
							<td className="mypage-table__td">{userInfo?.name}</td>
							<th className="mypage-table__th">생년월일</th>
							<td className="mypage-table__td">{userInfo?.birthDate}</td>
						</tr>

						<tr>
							<th className="mypage-table__th">성별</th>
							<td className="mypage-table__td">{userInfo?.gender}</td>
							<th className="mypage-table__th">주소</th>
							<td className="mypage-table__td">{userInfo?.address}</td>
						</tr>

						<tr>
							<th className="mypage-table__th">연락처</th>
							<td className="mypage-table__td">{userInfo?.tel}</td>
							<th className="mypage-table__th">email</th>
							<td className="mypage-table__td">{userInfo?.email}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
