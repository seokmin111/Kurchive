import { ReactNode } from "react";

type ArchiveHeaderClassNames = {
  header: string;
  headerLeft: string;
  backButton: string;
  logoSection: string;
  logoSubtitle: string;
  logo: string;
  myPageButton: string;
};

type ArchiveHeaderProps = {
  classNames: ArchiveHeaderClassNames;
  onBack: () => void;
  onMyPage: () => void;
  subtitle?: ReactNode;
  logo?: ReactNode;
  myPageLabel?: ReactNode;
};

export default function ArchiveHeader({
  classNames,
  onBack,
  onMyPage,
  subtitle = "우리만의 미식 지도",
  logo = "커카이브",
  myPageLabel = "마이페이지",
}: ArchiveHeaderProps) {
  return (
    <header className={classNames.header}>
      <div className={classNames.headerLeft}>
        <img
          src="/backstep_white_background.png"
          alt="뒤로가기"
          className={classNames.backButton}
          onClick={onBack}
        />
        <div className={classNames.logoSection}>
          <span className={classNames.logoSubtitle}>{subtitle}</span>
          <span className={classNames.logo}>{logo}</span>
        </div>
      </div>

      <button className={classNames.myPageButton} onClick={onMyPage}>
        {myPageLabel}
      </button>
    </header>
  );
}
