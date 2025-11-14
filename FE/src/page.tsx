import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
    title: '커카이브',
    description: '커카이브 메인 페이지',
};

export default function MainPage() {
    return (
        <>
            <main className = {styles.main}>
                {/* 로고 클릭 시 마이페이지 링크 이동 */}
                <Link href="/">
                    <Image className={styles.profile}
                        src="/images/kurchive_profile.png"
                        alt="마이페이지"
                        width={50}
                        height={50}
                    />
                </Link>

                <div className = {styles.center}>
                    <br /><br /><br /><br />
                    <h1 className={styles.title}>커카이브</h1>
                    <p className={styles.sub_title}>우리만의 미식 지도</p>
                    <br /><br />
                    <Link href="/restaurant_archive" className={styles.red_btn}>
                        식당 아카이브
                    </Link>
                    <br />
                    <Link href="/recipe_archive" className={styles.ivory_btn}>
                        레시피 아카이브
                    </Link>
                </div>

                <div className={styles.footer}></div>
            </main>
        </>
    );
}
