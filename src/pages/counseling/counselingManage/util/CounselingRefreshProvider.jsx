import { useCallback, useState } from 'react';
import { CounselingRefreshContext } from './CounselingRefreshContext';

export function CounselingRefreshProvider({ children }) {
	const [refreshKey, setRefreshKey] = useState(0);

	const refresh = useCallback(() => {
		setRefreshKey((prev) => prev + 1);
	}, []);

	return (
		<CounselingRefreshContext.Provider value={{ refreshKey, refresh }}>{children}</CounselingRefreshContext.Provider>
	);
}
