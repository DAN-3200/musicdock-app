interface Props {
   children: React.ReactNode;
   className?: string;
}

export const SectionLabel = ({ children, className = "" }: Props) => (
   <p
      className={`font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-400 ${className}`}
   >
      {children}
   </p>
);