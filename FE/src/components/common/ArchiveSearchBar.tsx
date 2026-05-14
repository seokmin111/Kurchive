import { ReactNode } from "react";

type ArchiveSearchBarClassNames = {
  searchSection: string;
  searchBar: string;
  searchInput: string;
};

type ArchiveSearchBarProps = {
  classNames: ArchiveSearchBarClassNames;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: ReactNode;
};

export default function ArchiveSearchBar({
  classNames,
  value,
  onChange,
  placeholder,
  icon,
}: ArchiveSearchBarProps) {
  return (
    <div className={classNames.searchSection}>
      <div className={classNames.searchBar}>
        <input
          type="text"
          className={classNames.searchInput}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {icon}
      </div>
    </div>
  );
}
