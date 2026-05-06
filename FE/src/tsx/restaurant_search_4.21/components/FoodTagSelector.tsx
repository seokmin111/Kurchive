import { useEffect, useState } from "react";
import client from "../../../api/client";
import styles from "../page.module.css";
import { SelectedItem, TagItem } from "./types";

type Props = {
  onAddItem: (item: SelectedItem) => void;
};

export default function FoodTagSelector({ onAddItem }: Props) {
  const [bigCultureTags, setBigCultureTags] = useState<TagItem[]>([]);
  const [selectedBigTag, setSelectedBigTag] = useState(0);
  const [smallCultureTags, setSmallCultureTags] = useState<TagItem[]>([]);
  const selectedParent = bigCultureTags.find((item) => item.id === selectedBigTag);

  useEffect(() => {
    const loadBigCultureTags = async () => {
      const res = await client.get("/tags", { params: { category_id: 1 } });
      setBigCultureTags(Array.isArray(res.data) ? res.data : []);
    };

    loadBigCultureTags().catch(console.error);
  }, []);

  useEffect(() => {
    const loadSmallCultureTags = async () => {
      if (!selectedBigTag) return;

      const res = await client.get("/tags", {
        params: { category_id: 1, parent_id: selectedBigTag },
      });
      setSmallCultureTags(Array.isArray(res.data) ? res.data : []);
    };

    loadSmallCultureTags().catch(console.error);
  }, [selectedBigTag]);

  return (
    <div className={styles.Food__container}>
      <div className={styles.section_title}>음식 종류</div>
      <div className={styles.Food__tagContainer}>
        {bigCultureTags.map((item) => (
          <span
            key={item.id}
            className={styles.Food__tag}
            onClick={() => {
              setSelectedBigTag(item.id);
            }}
          >
            {item.name}
          </span>
        ))}
      </div>

      {smallCultureTags.length > 0 && (
        <div className={styles.Food__foodTags}>
          {selectedParent && (
            <div
              className={styles.regionAllTag}
              onClick={() =>
                onAddItem({
                  type: "tag",
                  id: selectedParent.id,
                  parentId: selectedParent.id,
                  name: `${selectedParent.name} 전체`,
                })
              }
            >
              #{selectedParent.name} 전체
            </div>
          )}

          {smallCultureTags.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                onAddItem({
                  type: "tag",
                  id: item.id,
                  parentId: selectedBigTag,
                  name: `${selectedParent?.name ?? ""}-${item.name}`,
                })
              }
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
