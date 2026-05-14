import { useEffect, useState } from "react";
import client from "../../../api/client";
import styles from "../page.module.css";
import { SelectedItem, TagItem } from "./types";

type Props = {
  onAddItem: (item: SelectedItem) => void;
};

export default function AtmosphereSelector({ onAddItem }: Props) {
  const [atmoList, setAtmoList] = useState<TagItem[]>([]);

  useEffect(() => {
    const loadAtmoTags = async () => {
      const res = await client.get("/tags", {
        params: { category_id: 2 },
      });
      setAtmoList(Array.isArray(res.data) ? res.data : []);
    };

    loadAtmoTags().catch(console.error);
  }, []);

  return (
    <div className={styles.atmo__carrier}>
      <div className={styles.section_title}>분위기</div>
      <div className={styles.atmo__container}>
        {atmoList.map((item) => (
          <div
            key={item.id}
            className={styles.atmo__item}
            onClick={() => onAddItem({ type: "tag", id: item.id, name: item.name })}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
