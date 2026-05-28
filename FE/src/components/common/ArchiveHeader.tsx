import { ReactNode } from "react";
import { useKurchiveI18n } from "../../i18n/LocaleContext";

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
  subtitle,
  logo,
  myPageLabel,
}: ArchiveHeaderProps) {
  const { messages } = useKurchiveI18n();

  return (
    <header className={classNames.header}>
      <div className={classNames.headerLeft}>
        <img
          src="/backstep_white_background.png"
          alt={messages.common.back}
          className={classNames.backButton}
          onClick={onBack}
        />
        <div className={classNames.logoSection}>
          <span className={classNames.logoSubtitle}>
            {subtitle ?? messages.brand.tagline}
          </span>
          <span className={classNames.logo}>{logo ?? messages.brand.name}</span>
        </div>
      </div>

      <button className={classNames.myPageButton} onClick={onMyPage}>
        {myPageLabel ?? messages.myPage.title}
      </button>
    </header>
  );
}
