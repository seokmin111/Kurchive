import { link } from "fs";
import style from "./resultBox.module.css";
import Link from "next/link";

interface Tag {
  id: number;
  name: string;
}

interface Restaurant {
  id: number;
  name: string;
  address: string;
  region_id: number;
  rating: number;
  summary: string;
  price_min: number;
  price_max: number;
  tags: Tag[];
  thumbnail_url: string;
}

export default function ResultBox({
  id,
  name,
  summary,
  rating,
  tags,
  thumbnail_url,
  region_id,
}: Restaurant) {
  return (
    <Link href={`/recipe/${id}`} className={style.link}>
      <div className={style.box}>
        <article className={style.restaurant}>
          <header className={style.inform}>
            <h2 id={style.resName}>{name}</h2>
            <p id={style.comment}>{summary}</p>
            <div className={style.poster}>
              <div id={style.circle}></div>
              <div>
                <p style={{ fontSize: "9px", padding: "0px 0px 0px 5px" }}>
                  올린 사람
                </p>
                <time style={{ fontSize: "9px", padding: "0px 0px 0px 5px" }}>
                  Date
                </time>
              </div>
              <div className={style.rating}>
                <span>{rating}</span>
              </div>
            </div>
          </header>
          <div id={style.photo}>
            <img src={thumbnail_url} alt="썸네일" />
          </div>
        </article>
      </div>
    </Link>
  );
}
