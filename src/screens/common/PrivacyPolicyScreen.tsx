import styles from "./PrivacyPolicyScreen.module.css";

export default function PrivacyPolicyScreen() {
  return (
    <main className={styles.page}>
      <article className={styles.document}>
        <header className={styles.header}>
          <p className={styles.serviceName}>MixMate</p>
          <h1>개인정보처리방침</h1>
          <p>
            Mix-Mate(이하 &quot;서비스&quot;)가 수집하는 개인정보와 그 이용
            방법은 다음과 같습니다.
          </p>
        </header>

        <section className={styles.section}>
          <h2>1. 수집하는 항목</h2>

          <h3>로그인</h3>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>가입 방법</th>
                  <th>수집 항목</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>이메일 가입</td>
                  <td>이메일 주소, 비밀번호(암호화 저장), 이름</td>
                </tr>
                <tr>
                  <td>구글 로그인</td>
                  <td>이메일 주소, 이름, 구글 계정 고유 식별자</td>
                </tr>
                <tr>
                  <td>카카오 로그인</td>
                  <td>이메일 주소, 프로필 닉네임, 카카오 회원번호</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>모임 참여</h3>
          <p>모임에 참여할 때마다 새로 입력받습니다.</p>
          <ul>
            <li>
              필수: 보여질 이름, 학번, 전공, 학년, 구분(일반/운영진), 신입
              여부, 성별, MBTI, 프로필 공개 여부
            </li>
            <li>선택: 나이, 인스타그램 아이디, 자기소개</li>
          </ul>

          <h3>이용 과정에서 생성되는 정보</h3>
          <p>
            모임 참여 기록, 팀 편성 결과, 투표 결과, 모임에서 내보내진
            기록(재입장 제한 목적)
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. 이용 목적</h2>
          <p>
            회원 식별과 로그인 인증, 프로필 기준 팀 편성, 참여자 간 프로필
            열람, 투표 기능 제공에만 사용합니다. 광고나 마케팅에 이용하지
            않으며, 외부에 제공하거나 판매하지 않습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. 다른 참여자에게 공개되는 정보</h2>
          <p>같은 모임 참여자에게 아래 정보가 공개됩니다.</p>
          <ul>
            <li>
              항상 공개: 보여질 이름, 전공, 성별(참여자 목록과 팀 편성
              결과에 표시)
            </li>
            <li>
              프로필을 &quot;공개&quot;로 설정한 경우: 학년,
              구분(일반/운영진), 신입 여부, MBTI, 나이, 인스타그램 아이디,
              자기소개
            </li>
          </ul>
          <p>
            학번은 다른 참여자에게 공개되지 않으며, 본인만 확인할 수 있습니다.
          </p>
          <p>
            &quot;비공개&quot;를 선택하면 다른 참여자는 상세 프로필을 볼 수
            없습니다. 다만 모임 주최자는 운영을 위해 공개 여부와 관계없이
            열람할 수 있습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. 구글 사용자 데이터</h2>
          <p>
            구글 로그인 시 전달받는 이메일 주소는 회원 식별과 로그인 인증에,
            이름은 표시 이름의 초기값 설정에, 계정 고유 식별자는 재로그인 시
            동일 회원 확인에만 사용합니다. 이 정보를 제3자에게 제공하거나
            판매하지 않으며, 광고 목적으로 이용하지 않습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. 보유 기간</h2>
          <p>
            회원 탈퇴 시 계정은 즉시 비활성화되어 더 이상 로그인할 수
            없습니다. 모임 참여 기록과 프로필은 함께 참여한 다른 이용자의 모임
            기록과 연결되어 있어 곧바로 삭제되지 않습니다. 완전 삭제를
            원하시면 아래 문의처로 요청해 주세요.
          </p>
          <p>
            로그인 유지용 토큰은 발급 후 14일 이내 만료되며, 로그아웃 시 즉시
            삭제됩니다. 이 토큰은 로그인 상태 유지를 위해 쿠키에 저장되며,
            브라우저에서 쿠키를 차단하면 로그인이 정상적으로 동작하지 않을 수
            있습니다.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. 이용자의 권리</h2>
          <p>
            프로필 정보는 해당 모임이 참여자를 모집하는 동안 수정할 수
            있습니다. 팀 편성이 시작된 뒤에는 수정할 수 없습니다. 회원 탈퇴는
            서비스 내에서 직접 할 수 있으며, 그 밖의 열람, 정정, 삭제 요청은
            아래로 연락해 주세요.
          </p>
          <p className={styles.contact}>
            개인정보 보호책임자: Mix-Mate 팀 (문의 메일 기재 예정)
          </p>
          <p>방침이 변경되면 본 페이지를 통해 알립니다.</p>
        </section>

        <footer className={styles.footer}>
          <strong>시행일: 2026년 9월 12일</strong>
        </footer>
      </article>
    </main>
  );
}
