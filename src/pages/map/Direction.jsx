import React, { useMemo, useState } from 'react';
import '../../assets/css/Direction.css';
import KakaoRoughMap from './KakaoRoughMap';

export default function Direction() {
	// 주소는 여기만 바꾸면 전체 반영
	const ADDRESS = '서울시 마포구 신촌로 176 그린대학교';
	const query = useMemo(() => encodeURIComponent(ADDRESS), [ADDRESS]);

	// 주소 복사
	const [copied, setCopied] = useState(false);
	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(ADDRESS);
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		} catch (e) {
			alert('복사에 실패했습니다. 주소를 직접 복사해주세요.');
		}
	};

	return (
		<div className="direction-page">
			<div className="direction-container">
				{/* 상단 요약 카드 */}
				<div className="direction-card">
					<div className="direction-card-head">
						<div>
							<div className="direction-card-title">🗺️ 찾아오시는 길</div>
							<div className="direction-card-sub">{ADDRESS}</div>
						</div>

						<button type="button" className="direction-btn" onClick={onCopy}>
							{copied ? '복사됨!' : '주소 복사'}
						</button>
					</div>

					<div className="direction-address-box">
						<div className="direction-label">주소</div>
						<div className="direction-value">{ADDRESS}</div>
					</div>

					{/* 지도 앱으로 열기(외부 링크) */}
					<div className="direction-actions">
						<a
							className="direction-link"
							href={`https://map.naver.com/v5/search/${query}`}
							target="_blank"
							rel="noreferrer"
						>
							네이버지도 열기 →
						</a>
						<a
							className="direction-link"
							href={`https://map.kakao.com/link/search/${query}`}
							target="_blank"
							rel="noreferrer"
						>
							카카오맵 열기 →
						</a>
						<a
							className="direction-link"
							href={`https://www.google.com/maps/search/?api=1&query=${query}`}
							target="_blank"
							rel="noreferrer"
						>
							구글지도 열기 →
						</a>
					</div>
				</div>

				{/* 본문 2분할 */}
				<div className="direction-grid">
					{/* 카카오 퍼가기 지도 */}
					<div className="direction-card">
						<div className="direction-card-title">캠퍼스 위치</div>

						<div className="kakao-roughmap-wrap">
							<KakaoRoughMap timestamp="1766540249816" mapKey="eet3ec4pfvt" height={360} />
						</div>

						<div className="direction-hint">* 지도에 드래그/확대가 가능합니다. (퍼가기 지도)</div>
					</div>

					{/* 교통/주차 안내 */}
					<div className="direction-card">
						<div className="direction-card-title">교통 안내</div>

						<div className="direction-info">
							<div className="direction-info-row">
								<div className="direction-info-label">지하철</div>
								<div className="direction-info-text">2호선 이대역 6번 출구 → 도보 1분</div>
							</div>

							<div className="direction-info-row">
								<div className="direction-info-label">버스</div>
								<div className="direction-info-text">이대역 정류장 하차 → 도보 1분</div>
							</div>

							<div className="direction-info-row">
								<div className="direction-info-label">주차</div>
								<div className="direction-info-text">주차장 이용 가능 / 만차 시 인근 공영주차장</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
