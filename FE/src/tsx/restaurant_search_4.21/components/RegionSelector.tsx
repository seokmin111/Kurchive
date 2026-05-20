import { useEffect, useState } from "react";
import client from "../../../api/client";
import styles from "../page.module.css";
import { RegionItem, SelectedItem } from "./types";

type RegionSelectorProps = {
  onAddItem: (item: SelectedItem) => void;
};

type SpecificRegionProps = RegionSelectorProps & {
  regionName: string;
  upperRegions: RegionItem[];
};

export default function RegionSelector({ onAddItem }: RegionSelectorProps) {
  const [showSpecificRegions, setShowSpecificRegions] = useState(false);
  const [upperRegions, setUpperRegions] = useState<RegionItem[]>([]);
  const [regionName, setRegionName] = useState("");

  useEffect(() => {
    const loadUpperRegions = async () => {
      const res = await client.get("/regions");
      setUpperRegions(Array.isArray(res.data) ? res.data : []);
    };

    loadUpperRegions().catch(console.error);
  }, []);

  return (
    <div className={styles.tagSearch__body}>
      <div className={styles.section_title}>지역</div>
      <div className={styles.tagSearch__regions}>
        {upperRegions.map((item) => (
          <span
            key={item.id}
            onClick={() => {
              setRegionName(item.name);
              setShowSpecificRegions(true);
            }}
            className={`${regionName === item.name ? styles.redBorder : ""}`}
          >
            {item.name}
          </span>
        ))}
      </div>

      {showSpecificRegions && (
        <SpecificRegion
          onAddItem={onAddItem}
          regionName={regionName}
          upperRegions={upperRegions}
        />
      )}
    </div>
  );
}

function SpecificRegion({
  regionName,
  onAddItem,
  upperRegions,
}: SpecificRegionProps) {
  const [smallRegions, setSmallRegions] = useState<RegionItem[] | null>(null);
  const [smallRegionId, setSmallRegionId] = useState(-1);

  useEffect(() => {
    const match = upperRegions.find((region) => region.name === regionName);
    setSmallRegionId(match?.id ?? -1);
  }, [regionName, upperRegions]);

  useEffect(() => {
    const loadSmallRegions = async () => {
      const res = await client.get("/regions", {
        params: { parent_id: smallRegionId },
      });
      setSmallRegions(Array.isArray(res.data) ? res.data : []);
    };

    if (smallRegionId !== -1) loadSmallRegions().catch(console.error);
  }, [smallRegionId]);

  if (smallRegions == null) {
    return <div className={styles.specificRegions}>로딩중</div>;
  }

  return (
    <div className={styles.specificRegions}>
      <div
        className={styles.regionAllTag}
        onClick={() =>
          onAddItem({
            type: "region",
            id: smallRegionId,
            parentId: smallRegionId,
            name: `${regionName} 전체`,
          })
        }
      >
        #{regionName} 전체
      </div>

      {smallRegions.map((reg) => (
        <div
          key={reg.id}
          onClick={() =>
            onAddItem({
              type: "region",
              id: reg.id,
              parentId: smallRegionId,
              name: reg.name,
            })
          }
        >
          {reg.name}
        </div>
      ))}
    </div>
  );
}
