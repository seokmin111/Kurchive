import styles from './page.module.css';
import Link from 'next/link';

export const metadata = {
    title: '커카이브 : 레시피 아카이브',
    description: '커카이브 레시피 아카이브',
};

export default function MainPage() {
    return (
        <main className={styles.nomrg}>
            <div className={styles.header}>
                <br />
                <h1 className={styles.title} style={{ display: 'inline' }}>커카이브</h1>
                <p className={styles.sub_title} style={{ display: 'inline' }}>우리만의 미식 지도</p>
            </div>

            <div>
                <form className={styles.search_container} action="#" method="get"> {/* 검색어 보낼 주소 */}
                    <input type="text" className={styles.input_box} placeholder="레시피 정보를 입력해주세요" />
                    <button type="submit" className={styles.search_btn}></button>
                </form>
            </div>

            <div className={styles.button_wrapper}>
                <Link href = "../">
                    <button className={styles.back_btn}>&lt;<br />메인화면으로 <br /> 돌아가기</button>
                </Link>
                
                <Link href = "/recipe_archive/archiving">
                    <button className={styles.ivory_btn}>레시피 아카이빙 하기</button>
                </Link>
            </div>

            <div className={styles.recipe_container}>
                <div className={styles.recipe_item}>item-1</div>
                <div className={styles.recipe_item}>item-2</div>
                <div className={styles.recipe_item}>item-3</div>
                <div className={styles.recipe_item}>item-4</div>
                <div className={styles.recipe_item}>item-5</div>
                <div className={styles.recipe_item}>item-6</div>
                <div className={styles.recipe_item}>item-7</div>
                <div className={styles.recipe_item}>item-8</div>
                <div className={styles.recipe_item}>item-9</div>
                <div className={styles.recipe_item}>item-10</div>
            </div>

            <div className={styles.footer}></div>
        </main>
    );
}
