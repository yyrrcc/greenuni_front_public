export default function PopResult({ name, result, type }) {
	// 아이디, 비밀번호 찾기의 결과를 찍어주는 컴포넌트
	//이름은 나중에 변경 해도 됨
	// header = 비밀번호 / 아이디
	return (
		<div>
			{type} 찾기
			<hr />
			{name} 님의 {type}는 {result}입니다.
		</div>
	);
}
