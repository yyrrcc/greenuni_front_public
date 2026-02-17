export function comma(m) {
	if (m == null) return '0'; // null 또는 undefined
	const n = Number(m);
	if (isNaN(n)) return '0';
	return n.toLocaleString();
}
