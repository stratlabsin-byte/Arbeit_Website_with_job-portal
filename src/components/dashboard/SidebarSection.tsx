"use client";

interface SidebarSectionProps {
  label: string;
  collapsed: boolean;
}

export default function SidebarSection({ label, collapsed }: SidebarSectionProps) {
  if (collapsed) {
    return <div className="mx-3 my-3 border-t border-white/10" />;
  }

  return (
    <div className="px-4 mt-5 mb-1">
      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
        {label}
      </span>
    </div>
  );
}
