import { Link } from "react-router-dom";
import styles from "../page.module.css";

export default function SearchPageHeader() {
  return (
    <div className={styles.nav_carrier}>
      <Link to="/restaurant">
        <button type="button" className={styles.back_btn}>
          &lt;
        </button>
      </Link>
      <br />
      <h1 className={styles.title} style={{ display: "inline" }}>
        커카이브
      </h1>
      <p className={styles.sub_title} style={{ display: "inline" }}>
        우리만의 미식 지도
      </p>
    </div>
  );
}
