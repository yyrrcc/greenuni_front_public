// ChatPopup.jsx
export default function ChatPopup({ open, onClose}) {
  if (!open) return null;

  return (
    <div className="gu-pop" role="dialog" aria-modal="true">
      <div className="gu-pop__card">
        <div className="gu-pop__head">
          <div className="gu-pop__title">AI GU 이용 시 유의사항</div>
          <button className="gu-pop__x" onClick={onClose} aria-label="close">
            ✕
          </button>
        </div>

        <div className="gu-pop__body">
          <p className="gu-pop__p">
            홈페이지 내 <b>학교소개</b>, <b>학사안내</b>, <b>대학생활</b> 정보 검색을 위한 챗봇입니다.
            <br />
            <b>※ 위 범위를 벗어난 정보는 제공되지 않습니다.</b>
          </p>

          <div className="gu-pop__box">
            <div className="gu-pop__boxTitle">⚠️ 주의사항</div>
            <ul className="gu-pop__ul">
              <li>생성형 AI 특성상 답변에 부정확한 정보가 포함될 수 있으므로 <b>반드시 참고용</b>으로만 활용하세요.</li>
              <li>중요한 내용과 일정은 반드시 <b>학교 홈페이지 공지사항</b>이나 <b>관련 부서</b>에서 다시 확인하세요.</li>
            </ul>
          </div>

          <div className="gu-pop__box">
            <div className="gu-pop__boxTitle">📌 개인정보 안내</div>
            <p className="gu-pop__p">AI GU는 개인정보를 수집하지 않습니다.</p>
          </div>
        </div>

        <div className="gu-pop__foot">
          <button className="gu-pop__btn ghost" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
}
