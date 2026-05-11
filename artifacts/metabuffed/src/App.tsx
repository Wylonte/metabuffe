import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModalProvider } from "@/hooks/use-modals";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import UploadPage from "@/pages/upload";
import CoachPage from "@/pages/coach";
import AboutPage from "@/pages/about";
import EbooksPage from "@/pages/ebooks";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/upload" component={UploadPage} />
      <Route path="/coach" component={CoachPage} />
      <Route path="/ebooks" component={EbooksPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Enforce dark mode on the whole document to make sure our dark theme applies perfectly
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ModalProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </ModalProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
