import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useModals } from "@/hooks/use-modals";
import logoImg from "@assets/1000028977_1779456146886.png";

export function Nav() {
  const [location, setLocation] = useLocation();
  const { openModal } = useModals();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/[0.07] shadow-[0_1px_0_0_rgba(255,255,255,0.03),0_8px_32px_rgba(0,0,0,0.7)]">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <img src={logoImg} alt="Metabuffed" className="h-[88px] w-auto cursor-pointer" />
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="/" className={`${location === "/" ? "text-white" : "hover:text-white"} transition-colors`}>Home</Link>
          <Link href="/about" className={`${location === "/about" ? "text-white" : "hover:text-white"} transition-colors`}>About</Link>
          <Link href="/upload" className={`${location === "/upload" ? "text-white" : "hover:text-white"} transition-colors`}>Upload Match</Link>
          <Link href="/coach" className={`${location === "/coach" ? "text-white" : "hover:text-white"} transition-colors`}>Coach Meta</Link>
          <Link href="/ebooks" className={`${location === "/ebooks" ? "text-white" : "hover:text-white"} transition-colors`}>Ebooks</Link>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden sm:flex text-zinc-300 hover:text-white hover:bg-white/10 font-medium text-sm" data-testid="btn-sign-in" onClick={() => openModal("signin")}>
            Sign In
          </Button>
          <Button variant="outline" className="hidden sm:flex border-white/20 text-white hover:bg-white/10 font-bold text-sm px-5" data-testid="btn-sign-up" onClick={() => openModal("signup")}>
            Sign Up
          </Button>
          <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold border-0 uppercase tracking-wider text-xs px-6 rounded-[10px] shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-200" data-testid="btn-upload-nav" onClick={() => setLocation('/upload')}>
            Upload
          </Button>
        </div>
      </div>
    </nav>
  );
}
