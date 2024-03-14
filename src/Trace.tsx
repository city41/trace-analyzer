import clsx from "clsx";

type TraceProps = {
  className?: string;
  trace: Trace;
};

function Trace({ className, trace }: TraceProps) {
  return (
    <div className={clsx(className)}>
      {trace.map((tl) => {
        return <pre>{JSON.stringify(tl)}</pre>;
      })}
    </div>
  );
}

export { Trace };
