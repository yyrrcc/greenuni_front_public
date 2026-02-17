import React, { useEffect, useMemo } from 'react';

export default function KakaoRoughMap({ timestamp, mapKey, height = 360 }) {
	const containerId = useMemo(() => `daumRoughmapContainer${timestamp}`, [timestamp]);

	useEffect(() => {
		const SCRIPT_ID = 'daum_roughmap_loader_script';
		let canceled = false;
		let tryCount = 0;
		let timer = null;

		const tryRender = () => {
			if (canceled) return;

			const el = document.getElementById(containerId);
			if (!el) return;

			// daum 객체가 준비될 때까지 재시도
			if (!window.daum?.roughmap?.Lander) {
				tryCount += 1;
				if (tryCount > 50) return; // 50 * 100ms = 5초 정도 시도
				timer = setTimeout(tryRender, 100);
				return;
			}

			// 매번 깨끗하게 지우고 렌더(중복/빈 화면 방지)
			el.innerHTML = '';

			new window.daum.roughmap.Lander({
				timestamp: String(timestamp),
				key: String(mapKey),
				mapWidth: '100%',
				mapHeight: String(height),
			}).render();
		};

		const ensureScript = () => {
			// 이미 로더 스크립트 있으면 바로 렌더 시도
			if (document.getElementById(SCRIPT_ID)) {
				tryRender();
				return;
			}

			// 없으면 추가
			const s = document.createElement('script');
			s.id = SCRIPT_ID;
			s.src = 'https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js';
			s.async = true;
			s.onload = () => tryRender();
			s.onerror = () => {
				// 로더 자체가 막히는 케이스 (CSP/Adblock)
				// 콘솔 확인용
				// eslint-disable-next-line no-console
				console.error('[KakaoRoughMap] roughmapLoader.js 로드 실패 (CSP/Adblock/네트워크 확인)');
			};
			document.body.appendChild(s);
		};

		ensureScript();

		return () => {
			canceled = true;
			if (timer) clearTimeout(timer);
		};
	}, [containerId, timestamp, mapKey, height]);

	return <div id={containerId} className="root_daum_roughmap root_daum_roughmap_landing" />;
}
