import { FormEvent, ReactNode } from "react";
import styles from "./SearchInput.module.css";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  buttonContent?: ReactNode;
  buttonLabel?: string;
  disabled?: boolean;
};

export default function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "검색어를 입력하세요.",
  className,
  inputClassName,
  buttonClassName,
  buttonContent,
  buttonLabel = "검색",
  disabled = false,
}: SearchInputProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form
      className={`${styles.form}${className ? ` ${className}` : ""}`}
      onSubmit={handleSubmit}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${styles.input}${inputClassName ? ` ${inputClassName}` : ""}`}
      />
      <button
        type="submit"
        disabled={disabled}
        className={`${styles.button}${buttonClassName ? ` ${buttonClassName}` : ""}`}
      >
        {buttonContent ?? buttonLabel}
      </button>
    </form>
  );
}
