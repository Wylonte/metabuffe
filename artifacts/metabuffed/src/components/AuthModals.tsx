import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiGoogle, SiDiscord } from "react-icons/si";
import logoImg from "@assets/Metabuffed_Official_Logo-removebg-preview_1778448740498.png";

interface AuthModalsProps {
  activeModal: "signin" | "signup" | null;
  onClose: () => void;
  onSwitch: (type: "signin" | "signup") => void;
}

export function AuthModals({ activeModal, onClose, onSwitch }: AuthModalsProps) {
  if (!activeModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
          data-testid="modal-backdrop"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="relative w-full max-w-md bg-[#0a0a0a] border border-primary/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,20,60,0.15)]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            data-testid="btn-close-modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <img src={logoImg} alt="Metabuffed" className="h-16 w-auto" />
            </div>

            <h2 className="text-2xl font-black text-white uppercase tracking-tight text-center mb-6">
              {activeModal === "signin" ? "Sign In" : "Create Your Account"}
            </h2>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {activeModal === "signup" && (
                <div>
                  <label className="sr-only">Username</label>
                  <Input
                    type="text"
                    placeholder="Username"
                    className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary h-12"
                    data-testid="input-username"
                  />
                </div>
              )}
              
              <div>
                <label className="sr-only">Email</label>
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary h-12"
                  data-testid="input-email"
                />
              </div>

              <div>
                <label className="sr-only">Password</label>
                <Input
                  type="password"
                  placeholder="Password"
                  className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary h-12"
                  data-testid="input-password"
                />
              </div>

              <Button
                className="w-full bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider h-12 mt-2"
                data-testid={`btn-submit-${activeModal}`}
              >
                {activeModal === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-[#0a0a0a] px-4 text-zinc-500">or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-12" data-testid="btn-social-google">
                <SiGoogle className="w-4 h-4 mr-2" /> Google
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-12" data-testid="btn-social-discord">
                <SiDiscord className="w-5 h-5 mr-2" /> Discord
              </Button>
            </div>

            <div className="mt-8 text-center">
              {activeModal === "signin" ? (
                <p className="text-sm text-zinc-400">
                  Don't have an account?{" "}
                  <button onClick={() => onSwitch("signup")} className="text-primary font-bold hover:underline" data-testid="link-switch-signup">
                    Sign Up
                  </button>
                </p>
              ) : (
                <p className="text-sm text-zinc-400">
                  Already have an account?{" "}
                  <button onClick={() => onSwitch("signin")} className="text-primary font-bold hover:underline" data-testid="link-switch-signin">
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
