import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/httpClient';
import { UserContext } from '../../context/UserContext';

import DataTable from '../../components/table/DataTable';
import OptionForm from '../../components/form/OptionForm';
import '../../assets/css/BreakAppDetail.css';

export default function BreakAppDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useContext(UserContext);

  const [breakApp, setBreakApp] = useState(null);
  const [student, setStudent] = useState(null);
  const [deptName, setDeptName] = useState('');
  const [collName, setCollName] = useState('');
  const [loading, setLoading] = useState(true);

  //수정모드
  const [editMode, setEditMode] = useState(false);

  //수정 가능한 필드 state (수정모드에서만 사용)
  const [toYear, setToYear] = useState('');
  const [toSemester, setToSemester] = useState('1');
  const [type, setType] = useState('일반');

  const loadBreakAppDetail = async () => {
    try {
      const res = await api.get(`/break/detail/${id}`);
      const b = res.data.breakApp;
      setBreakApp(b);
      setStudent(res.data.student);
      setDeptName(res.data.deptName);
      setCollName(res.data.collName);

      // detail 로드될 때 수정 폼 초기값 세팅
      if (b) {
        setToYear(String(b.toYear ?? ''));
        setToSemester(String(b.toSemester ?? '1'));
        setType(b.type ?? '일반');
      }
    } catch (e) {
      console.error(e);
      alert('휴학 신청 정보를 불러오지 못했습니다.');
      navigate(-1, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBreakAppDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 상단 요약 DataTable
  const infoHeaders = useMemo(() => ['항목', '내용'], []);
  const infoData = useMemo(() => {
    if (!breakApp || !student) return [];
    return [
      { 항목: '단과대', 내용: collName },
      { 항목: '학과', 내용: deptName },
      { 항목: '학번', 내용: student.id },
      { 항목: '학년', 내용: `${breakApp.studentGrade}학년` },
      { 항목: '성명', 내용: student.name },
      { 항목: '전화번호', 내용: student.tel },
      { 항목: '주소', 내용: student.address },
      { 항목: '상태', 내용: breakApp.status },
    ];
  }, [breakApp, student, collName, deptName]);


  const yearSelectOptions = useMemo(() => {
    const base = breakApp?.fromYear ?? new Date().getFullYear();
    const years = [base, base + 1, base + 2, base + 3];
    return years.map((y) => ({ value: String(y), label: `${y}` }));
  }, [breakApp]);

  const semesterSelectOptions = useMemo(
    () => [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
    ],
    []
  );

  const breakTypeOptions = useMemo(
    () => [
      { value: '일반', label: '일반휴학' },
      { value: '임신·출산·육아', label: '임신·출산·육아휴학' },
      { value: '질병', label: '질병휴학' },
      { value: '창업', label: '창업휴학' },
      { value: '군입대', label: '군입대휴학' },
    ],
    []
  );

  // 학생용 : 신청 취소
  const handleDelete = async () => {
    if (!window.confirm('신청을 취소하시겠습니까?')) return;

    try {
      await api.post(`/break/delete/${id}`);
      alert('휴학 신청이 취소되었습니다.');
      navigate('/break/list');
    } catch (e) {
      console.error(e);
      alert('취소 처리 중 오류가 발생했습니다.');
    }
  };

  // 교직원용 : 승인/반려
  const handleUpdate = async (status) => {
    if (!window.confirm(`해당 신청을 ${status} 하시겠습니까?`)) return;

    try {
      await api.post(`/break/update/${id}`, null, { params: { status } });
      alert(`휴학 신청이 ${status} 처리되었습니다.`);
      navigate('/break/list/staff');
    } catch (e) {
      console.error(e);
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  // 학생용 : 수정모드 ON
  const handleEnterEdit = () => {
    // 안전: 처리중 + 학생일 때만
    if (breakApp?.status !== '처리중') {
      alert('처리중인 신청서만 수정할 수 있습니다.');
      return;
    }
    setEditMode(true);
  };

  // 학생용 : 수정 취소 (원래 값으로 롤백)
  const handleCancelEdit = () => {
    if (breakApp) {
      setToYear(String(breakApp.toYear ?? ''));
      setToSemester(String(breakApp.toSemester ?? '1'));
      setType(breakApp.type ?? '일반');
    }
    setEditMode(false);
  };

  // 학생용 : 수정 저장
  const handleSaveEdit = async () => {
    if (!window.confirm('수정 내용을 저장하시겠습니까?')) return;

    if (!toYear || !toSemester || !type) {
      alert('종료년도/학기/휴학구분을 입력해주세요.');
      return;
    }

    try {
      await api.patch(`/break/update/${id}`, {
        toYear: Number(toYear),
        toSemester: Number(toSemester),
        type,
      });

      alert('수정되었습니다.');
      setEditMode(false);
      loadBreakAppDetail();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message ?? '수정 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <p>불러오는 중...</p>;
  if (!breakApp || !student) return <p>데이터가 없습니다.</p>;

  return (
    <div className="form-container break-detail">
      <div className="d-flex flex-column align-items-center">
        <div className="document--layout">
          <h3>휴학 신청서</h3>

          <DataTable headers={infoHeaders} data={infoData} />

          <table className="break-doc-table">
            <tbody>
              <tr>
                <th>기 간</th>
                <td>
                  {breakApp.fromYear}년도 {breakApp.fromSemester}학기부터&nbsp;
                  {!editMode ? (
                    <>
                      {breakApp.toYear}년도 {breakApp.toSemester}학기까지
                    </>
                  ) : (
                    <>
                      <OptionForm
                        label=""
                        name="toYear"
                        value={toYear}
                        onChange={(e) => setToYear(e.target.value)}
                        options={yearSelectOptions}
                        className="input--box"
                      />
                      <span>년도</span>

                      <OptionForm
                        label=""
                        name="toSemester"
                        value={toSemester}
                        onChange={(e) => setToSemester(e.target.value)}
                        options={semesterSelectOptions}
                        className="input--box"
                      />
                      <span>학기까지</span>
                    </>
                  )}
                </td>
              </tr>

              <tr>
                <th>휴 학 구 분</th>
                <td>
                  {!editMode ? (
                    <>{breakApp.type}휴학</>
                  ) : (
                    <div>
                      {breakTypeOptions.map((opt) => {
                        const rid = `break-type-${opt.value}`;
                        return (
                          <div key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                              type="radio"
                              name="type"
                              id={rid}
                              value={opt.value}
                              checked={type === opt.value}
                              onChange={(e) => setType(e.target.value)}
                            />
                            <label htmlFor={rid} style={{ margin: 0 }}>
                              {opt.label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </td>
              </tr>

              <tr>
                <td colSpan={2}>
                  <p>위와 같이 휴학하고자 하오니 허가하여 주시기 바랍니다.</p>
                  <br />
                  <p>{breakApp.appDate}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 처리중일 때만 */}
        {breakApp.status === '처리중' && (
          <div className="break-detail-actions">
            {/* 학생 */}
            {userRole === 'student' && (
              <div className="break-detail-actions__group">
                {!editMode ? (
                  <>
                    <button type="button" className="btn btn-dark" onClick={handleEnterEdit}>
                      수정하기
                    </button>
                    <button type="button" className="btn btn-dark" onClick={handleDelete}>
                      취소하기
                    </button>
                    <button type="button" className="btn btn-dark" onClick={() => navigate(-1)}>
                      뒤로
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn btn-dark" onClick={handleSaveEdit}>
                      저장
                    </button>
                    <button type="button" className="btn btn-dark" onClick={handleCancelEdit}>
                      수정취소
                    </button>
                  </>
                )}
              </div>
            )}

            {/* 교직원 */}
            {userRole === 'staff' && (
              <div className="break-detail-actions__group">
                <button type="button" className="btn btn-dark" onClick={() => handleUpdate('승인')}>
                  승인하기
                </button>
                <button type="button" className="btn btn-dark" onClick={() => handleUpdate('반려')}>
                  반려하기
                </button>
                <button type="button" className="btn btn-dark" onClick={() => navigate(-1)}>
                  뒤로
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
