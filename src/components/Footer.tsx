import { Zap, Github } from "lucide-react";

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
            A free, open-source design resource hub powered entirely by public APIs.
            No sign-up. No paywalls. Built for designers and developers.
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
            <span>Reddit API</span>
            <span>Iconify API</span>
            <span>Lorem Picsum</span>
            <span>RSS2JSON</span>
            <span>HN Algolia</span>
            <span>GitHub API</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/DominceAseberos/live-pixvault"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-3.5 w-3.5" />
              View on GitHub
            </a>
          </div>

          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PIXVAULT — Open source & free forever.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
