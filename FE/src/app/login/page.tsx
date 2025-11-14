import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
    title: '커카이브 : 로그인',
    description: '커카이브 로그인 페이지',
};

export default function MainPage() {
    return (
        <main>
            <div className={styles.center}>
                <Image
                    src="/images/curson_logo_noborder.png"
                    alt="커손연 로고"
                    width = {150}
                    height = {150}
                    className={styles.logo}
                />
                <h1 className={styles.title}>커카이브</h1>
            </div>

            <div className={styles.body}>
                <form action="#" method="post"> {/*보낼 백 주소*/}
                    <label htmlFor="username"  className={styles.label} >ID</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        maxLength={10}
                        className={styles.inputBox}
                        placeholder="아이디를 입력하세요."
                    />
                    <br />
                    <label htmlFor="userpw" className={styles.label}>Password</label>
                    <input
                        type="password"
                        name="userpw"
                        id="userpw"
                        maxLength={16}
                        className={styles.inputBox}
                        placeholder="비밀번호를 입력하세요."
                    />
                    <br /><br />
                    <button type="submit" className={styles.btn}>로그인</button>
                    <br/>
                </form>
                <Link href="#" className={styles.btnLink}>회원가입</Link>
            </div>
        </main>
    );
}
