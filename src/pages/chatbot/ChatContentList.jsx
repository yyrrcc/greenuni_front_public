// ChatContentList.jsx
export default function ChatContentList({ messages, loading, onOpenLink }) {
	return (
		<div className="gu-cb__msgs">
			{messages.map((m) => {
				if (m.type === 'links') {
					return (
						<div key={m.id} className="row bot">
							<div className="bubble links">
								{m.links.map((l, idx) => (
									<button key={idx} className="linkBtn" onClick={() => onOpenLink(l.href, l.source)}>
										{l.label} ↗
									</button>
								))}
							</div>
						</div>
					);
				}

				return (
					<div key={m.id} className={`row ${m.role === 'user' ? 'user' : 'bot'}`}>
						<div className="bubble">
							{String(m.text)
								.split('\n')
								.map((line, idx) => (
									<div key={idx}>{line}</div>
								))}
						</div>
					</div>
				);
			})}

			{loading && (
				<div className="row bot">
					<div className="bubble">답변 생성 중…</div>
				</div>
			)}
		</div>
	);
}
