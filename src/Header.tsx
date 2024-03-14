import clsx from "clsx";

type HeaderProps = {
  className?: string;
  onTraceFileLoaded: (trace: string[]) => void;
};
function Header({ className, onTraceFileLoaded }: HeaderProps) {
  function handleFileChosen(file: File) {
    const reader = new FileReader();
    reader.addEventListener("loadend", () => {
      onTraceFileLoaded((reader.result as string).split("\n"));
    });
    reader.readAsText(file);
  }

  return (
    <header className={clsx(className)}>
      choose trace{" "}
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            handleFileChosen(file);
          }
        }}
      />
    </header>
  );
}

export { Header };
