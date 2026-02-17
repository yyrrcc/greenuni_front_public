export default function ChatLauncher({ onClick, faceSrc }) {
  return (
    <button className="gu-fab" onClick={onClick} aria-label="open chatbot">
      <img className="gu-fab__face" src={faceSrc} alt="GU BOT" />
      <span className="gu-fab__badge">GU BOT</span>
    </button>
  );
}