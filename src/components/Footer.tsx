import { Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              PIX<span className="text-primary">VAULT</span>
            </span>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            100% free design resources powered by live APIs. 
            No accounts, no paywalls, no subscriptions.
          </p>
          <div className="flex flex-wrap justify-center gap-6 font-mono text-xs text-muted-foreground">
            <span>GIPHY API</span>
            <span>GitHub API</span>
            <span>RSS2JSON</span>
            <span>HN Algolia</span>
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PIXVAULT · Built with 🔥
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
