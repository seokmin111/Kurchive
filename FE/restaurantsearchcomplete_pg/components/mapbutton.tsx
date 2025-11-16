import style from "./MapButton.module.css";
import { Map } from "lucide-react";
import Link from "next/link";

interface MapButtonProps {
  restaurantIds: number[];
}
export default function MapButton({ restaurantIds }: MapButtonProps) {
  const idsQuery = restaurantIds.join(",");

  const mapUrl = `/map?ids=${idsQuery}`;

  return (
    <Link href={mapUrl} className={style.mapButton}>
      <Map></Map>
      <div>지도</div>
    </Link>
  );
}
