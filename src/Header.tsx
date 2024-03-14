import clsx from "clsx";

type HeaderProps = {
  className?: string;
  onTraceFileLoaded: (trace: string[]) => void;
};
function Header({ className }: HeaderProps) {
  return <header className={clsx(className)}>Header</header>;
}

export { Header };
