import { useEffect, useState } from "react";
import { Box, Film, Image, LayoutGrid, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const destinations = [
  { label: "GIF Library", path: "/gifs", icon: Film },
  { label: "UI Components", path: "/components", icon: Box },
  { label: "Icons", path: "/icons", icon: Sparkles },
  { label: "Photos", path: "/photos", icon: Image },
  { label: "Inspiration", path: "/inspiration", icon: LayoutGrid },
];

export function GlobalCommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const go = (path: string) => { setOpen(false); navigate(path); };
  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Open quick navigation" className="fixed bottom-5 right-5 z-40 hidden items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-2 font-mono text-xs text-muted-foreground shadow-lg backdrop-blur md:inline-flex">
        <Search className="h-3.5 w-3.5" /> Search <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Jump to a resource library..." />
        <CommandList>
          <CommandEmpty>No matching section.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {destinations.map(({ label, path, icon: Icon }) => (
              <CommandItem key={path} value={label} onSelect={() => go(path)}>
                <Icon className="mr-2 h-4 w-4" />{label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
