import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

export function useUser() {
	const ctx = useContext(UserContext);
	if (!ctx) {
		throw new Error('useUser는 UserProvider 안에서만 사용해야 함');
	}
	return ctx;
}
