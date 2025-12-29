import { link } from "fs";
import style from "./ResultBox.module.css";
import Link from "next/link";

interface Step {
  step_order: number;
  description: string;
  image_urls: string[];
}
interface Ingredient {
  ingredient_id: number;
  name: string;
  quantity: number;
  unit_name: string;
}
interface ResultBoxProps {
  id: number;
  title: string;
  base_serving?: number;
  uploader_id: number;
  created_at: string;
  thumbnail_url: string;
  steps?: Step[];
  ingredients?: Ingredient[];
}

export default function ResultBox({
  id,
  title,
  uploader_id,
  created_at,
  thumbnail_url,
}: ResultBoxProps) {
  return (
    <Link href={`/recipe/${id}`} className={style.link}>
      <div className={style.box}>
        <article className={style.restaurant}>
          <header className={style.inform}>
            <h2 id={style.resName}>{title}</h2>
            <p id={style.comment}>음식 설명..........</p>
            <div className={style.poster}>
              <div id={style.circle}></div>
              <div>
                <p style={{ fontSize: "9px", padding: "0px 0px 0px 5px" }}>
                  {uploader_id}
                </p>
                <time style={{ fontSize: "9px", padding: "0px 0px 0px 5px" }}>
                  {created_at}
                </time>
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
