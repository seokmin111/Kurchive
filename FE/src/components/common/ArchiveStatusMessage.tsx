type ArchiveStatusMessageProps = {
  children: string;
  variant: "loading" | "empty";
};

export default function ArchiveStatusMessage({
  children,
  variant,
}: ArchiveStatusMessageProps) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: variant === "loading" ? "20px" : "40px",
        color: variant === "loading" ? "#888" : "#999",
      }}
    >
      {children}
    </div>
  );
}
